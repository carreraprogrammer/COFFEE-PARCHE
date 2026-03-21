# mvp.md — coffee-parches-rails-api

MVP 1 de Coffee Parches.
Leer `architecture.md` y `roles-permissions.md` antes de implementar.
Este spec extiende el boilerplate — no reemplaza nada existente.

---

## Contexto de negocio

Coffee Parches es una comunidad presencial en Bogotá donde personas se reúnen
en cafeterías, karaokes, parques y clases para conocerse y practicar inglés.

El MVP reemplaza el flujo manual actual:
- Google Forms por evento → perfil de usuario reutilizable + wizard de onboarding
- Verificación manual de capturas Nequi → panel de inscripciones para Sofía
- Grupos de WhatsApp creados manualmente → link de invitación enviado automáticamente
- Slots gestionados manualmente → sistema de slots + lista de espera automática

---

## Storage — MinIO local + S3 producción

### Gems requeridas

Agregar al Gemfile:

```ruby
gem 'aws-sdk-s3', require: false
gem 'image_processing', '~> 1.2'   # para variantes de imagen
```

### config/storage.yml

```yaml
local_minio:
  service: S3
  endpoint: <%= ENV.fetch('MINIO_ENDPOINT', 'http://localhost:9000') %>
  access_key_id:     <%= ENV.fetch('MINIO_ACCESS_KEY', 'minioadmin') %>
  secret_access_key: <%= ENV.fetch('MINIO_SECRET_KEY', 'minioadmin') %>
  region: us-east-1
  bucket: <%= ENV.fetch('MINIO_BUCKET', 'coffee-parches') %>
  force_path_style: true   # requerido para MinIO

amazon:
  service: S3
  access_key_id:     <%= ENV['AWS_ACCESS_KEY_ID'] %>
  secret_access_key: <%= ENV['AWS_SECRET_ACCESS_KEY'] %>
  region:            <%= ENV['AWS_REGION'] %>
  bucket:            <%= ENV['AWS_BUCKET'] %>
```

### config/environments/development.rb

```ruby
config.active_storage.service = :local_minio
```

### config/environments/production.rb

```ruby
config.active_storage.service = :amazon
```

### docker-compose.yml — agregar servicio MinIO

```yaml
services:
  db:
    image: mariadb:11
    # ... config existente ...

  api:
    build: .
    # ... config existente ...
    depends_on:
      - db
      - minio

  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    ports:
      - "9000:9000"   # API S3
      - "9001:9001"   # Consola web (admin UI)
    environment:
      MINIO_ROOT_USER:     minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    volumes:
      - minio_data:/data

  createbuckets:
    image: minio/mc:latest
    depends_on:
      - minio
    entrypoint: >
      /bin/sh -c "
      sleep 3;
      mc alias set local http://minio:9000 minioadmin minioadmin;
      mc mb --ignore-existing local/coffee-parches;
      mc anonymous set public local/coffee-parches;
      exit 0;
      "

volumes:
  minio_data:
```

### Variables de entorno nuevas — agregar a .env.example

```
# MinIO (desarrollo local)
MINIO_ENDPOINT=http://minio:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=coffee-parches

# S3 (producción Railway)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
AWS_BUCKET=coffee-parches-production

# WhatsApp Business API (opcional)
WHATSAPP_API_TOKEN=
WHATSAPP_PHONE_ID=
```

---

## Roles y permisos

### Roles a crear (adicionales al boilerplate base)

```ruby
collaborator_role = Role.find_or_create_by!(slug: 'collaborator') do |r|
  r.name        = 'Colaborador'
  r.description = 'Ayudante de Sofía — crea eventos, verifica inscripciones, hace check-in'
end

participant_role = Role.find_or_create_by!(slug: 'participant') do |r|
  r.name        = 'Participante'
  r.description = 'Miembro de la comunidad Coffee Parches'
end

partner_role = Role.find_or_create_by!(slug: 'partner') do |r|
  r.name        = 'Aliado'
  r.description = 'Lugar o negocio aliado de Coffee Parches'
end
```

### Permisos nuevos

```ruby
new_resources = {
  'events'      => %w[read create update destroy publish],
  'enrollments' => %w[read create update destroy verify],
  'profiles'    => %w[read update],
  'partners'    => %w[read create update destroy],
  'checkins'    => %w[create read],
  'photos'      => %w[create read destroy]
}

new_resources.each do |resource, actions|
  actions.each do |action|
    Permission.find_or_create_by!(resource: resource, action: action)
  end
end

# Admin — todos los permisos
admin_role = Role.find_by!(slug: 'admin')
admin_role.permissions = Permission.all

# Collaborator — crear y gestionar eventos + verificar inscripciones
collaborator_permissions = Permission.where(
  resource: %w[events enrollments checkins profiles photos]
).where.not(action: 'destroy')

collaborator_role.permissions = collaborator_permissions

# Participant — ver eventos, inscribirse, subir fotos post-evento
participant_permissions = Permission.where(resource: 'events', action: 'read')
  .or(Permission.where(resource: 'enrollments', action: %w[read create]))
  .or(Permission.where(resource: 'profiles',    action: %w[read update]))
  .or(Permission.where(resource: 'photos',      action: %w[read create]))

participant_role.permissions = participant_permissions

# Partner — solo lectura de eventos y partners
partner_permissions = Permission.where(resource: %w[events partners], action: 'read')
partner_role.permissions = partner_permissions
```

### Asignación automática de rol participant en registro

Modificar `Auth::Interactors::RegisterUser` para que al final del flujo llame:

```ruby
Authorization::Interactors::AssignRoleToUser.new.call(
  user_id:   user.id,
  role_slug: 'participant'
)
```

---

## Migraciones — ejecutar en orden

### 009 — user_profiles

```ruby
create_table :user_profiles do |t|
  t.references :user,       null: false, foreign_key: true
  t.string  :phone,         null: true
  t.string  :neighborhood,  null: true
  t.string  :english_level, null: true   # beginner|elementary|intermediate|upper|advanced
  t.json    :interests,     null: true   # ["yoga","salsa","karaoke","cafe","parque","ingles"]
  t.boolean :onboarding_completed, null: false, default: false
  t.timestamps
end

add_index :user_profiles, :user_id, unique: true
```

### 010 — partners

```ruby
create_table :partners do |t|
  t.string  :name,          null: false
  t.string  :partner_type,  null: false   # restaurant|karaoke|yoga|dance|park|other
  t.string  :neighborhood,  null: true
  t.string  :address,       null: true
  t.string  :contact_name,  null: true
  t.string  :contact_phone, null: true
  t.text    :notes,         null: true
  t.boolean :active,        null: false, default: true
  t.timestamps
end
```

### 011 — events

```ruby
create_table :events do |t|
  t.string     :title,           null: false
  t.text       :description,     null: true
  t.string     :event_type,      null: false   # cafe|karaoke|yoga|salsa|park|other
  t.string     :status,          null: false, default: 'draft'
                                               # draft|published|full|cancelled|completed
  t.references :partner,         null: true,  foreign_key: true
  t.string     :address,         null: false
  t.string     :neighborhood,    null: false
  t.datetime   :starts_at,       null: false
  t.datetime   :ends_at,         null: true
  t.integer    :capacity,        null: false
  t.integer    :confirmed_count, null: false, default: 0
  t.integer    :waitlist_count,  null: false, default: 0
  t.integer    :tip_min,         null: true
  t.integer    :tip_max,         null: true
  t.string     :whatsapp_invite_link, null: true
  t.references :created_by,      null: false, foreign_key: { to_table: :users }
  t.timestamps
end

add_index :events, :status
add_index :events, :starts_at
```

### 012 — enrollments

```ruby
create_table :enrollments do |t|
  t.references :event,      null: false, foreign_key: true
  t.references :user,       null: false, foreign_key: true
  t.string  :status,        null: false, default: 'pending'
                                         # pending|confirmed|rejected|waitlisted|cancelled
  t.integer :tip_amount,    null: true
  t.text    :rejection_note,null: true
  t.integer :waitlist_position, null: true
  t.datetime :confirmed_at, null: true
  t.references :verified_by, null: true, foreign_key: { to_table: :users }
  t.timestamps
end

add_index :enrollments, [:event_id, :user_id], unique: true
add_index :enrollments, [:event_id, :status]
```

### 013 — checkins

```ruby
create_table :checkins do |t|
  t.references :enrollment, null: false, foreign_key: true
  t.references :checked_by, null: false, foreign_key: { to_table: :users }
  t.timestamps
end

add_index :checkins, :enrollment_id, unique: true
```

---

## Modelos ActiveRecord — archivos adjuntos

### app/models/event.rb

```ruby
class Event < ApplicationRecord
  belongs_to :partner,    optional: true
  belongs_to :created_by, class_name: 'User'
  has_many   :enrollments, dependent: :destroy

  # Active Storage
  has_one_attached  :cover_image    # foto principal del evento
  has_many_attached :gallery_photos # fotos post-evento subidas por participantes

  validates :title,       presence: true
  validates :event_type,  inclusion: { in: %w[cafe karaoke yoga salsa park other] }
  validates :status,      inclusion: { in: %w[draft published full cancelled completed] }
  validates :capacity,    numericality: { greater_than: 0 }

  scope :published, -> { where(status: 'published') }
  scope :upcoming,  -> { where('starts_at > ?', Time.current).order(:starts_at) }
end
```

### app/models/enrollment.rb

```ruby
class Enrollment < ApplicationRecord
  belongs_to :event
  belongs_to :user
  belongs_to :verified_by, class_name: 'User', optional: true

  has_one_attached :receipt   # captura de pantalla de la propina

  validates :status, inclusion: {
    in: %w[pending confirmed rejected waitlisted cancelled]
  }
end
```

### app/models/user_profile.rb

```ruby
class UserProfile < ApplicationRecord
  belongs_to :user

  has_one_attached :avatar

  validates :english_level, inclusion: {
    in: %w[beginner elementary intermediate upper advanced],
    allow_nil: true
  }
end
```

---

## Dominio: Profiles

### app/domains/profiles/interactors/complete_onboarding.rb

```ruby
module Profiles
  module Interactors
    class CompleteOnboarding
      VALID_LEVELS    = %w[beginner elementary intermediate upper advanced].freeze
      VALID_INTERESTS = %w[yoga salsa karaoke cafe parque ingles].freeze

      def initialize(profile_repo: Repositories::UserProfileRepository.new)
        @profile_repo = profile_repo
      end

      def call(user_id:, phone:, neighborhood:, english_level:, interests:, avatar: nil)
        raise Profiles::Errors::InvalidEnglishLevel unless VALID_LEVELS.include?(english_level)
        raise Profiles::Errors::InvalidInterest if (interests - VALID_INTERESTS).any?
        raise Profiles::Errors::EmptyInterests  if interests.empty?

        profile = @profile_repo.find_or_initialize(user_id: user_id)
        @profile_repo.update(profile,
          phone:                phone,
          neighborhood:         neighborhood,
          english_level:        english_level,
          interests:            interests,
          avatar:               avatar,
          onboarding_completed: true
        )
      end
    end
  end
end
```

---

## Dominio: Events

### app/domains/events/interactors/create_event.rb

```ruby
module Events
  module Interactors
    class CreateEvent
      VALID_TYPES = %w[cafe karaoke yoga salsa park other].freeze

      def initialize(event_repo: Repositories::EventRepository.new)
        @event_repo = event_repo
      end

      def call(title:, event_type:, address:, neighborhood:,
               starts_at:, capacity:, created_by_id:, cover_image: nil, **opts)
        raise Events::Errors::InvalidType     unless VALID_TYPES.include?(event_type)
        raise Events::Errors::InvalidCapacity if capacity <= 0

        event = @event_repo.create(
          title:          title,
          event_type:     event_type,
          address:        address,
          neighborhood:   neighborhood,
          starts_at:      starts_at,
          capacity:       capacity,
          created_by_id:  created_by_id,
          status:         'draft',
          **opts
        )

        # Adjuntar foto de portada si se proporcionó
        if cover_image.present?
          @event_repo.attach_cover(event.id, cover_image)
        end

        event
      end
    end
  end
end
```

### app/domains/events/interactors/publish_event.rb

```ruby
module Events
  module Interactors
    class PublishEvent
      def initialize(event_repo: Repositories::EventRepository.new)
        @event_repo = event_repo
      end

      def call(event_id:)
        event = @event_repo.find(event_id)
        raise Events::Errors::AlreadyPublished    if event.published?
        raise Events::Errors::MissingCoverImage   unless @event_repo.has_cover?(event_id)
        raise Events::Errors::MissingWhatsappLink if event.whatsapp_invite_link.blank?

        @event_repo.update(event, status: 'published')
      end
    end
  end
end
```

### app/domains/events/interactors/add_gallery_photo.rb

```ruby
module Events
  module Interactors
    class AddGalleryPhoto
      def initialize(
        event_repo:      Repositories::EventRepository.new,
        enrollment_repo: Enrollments::Repositories::EnrollmentRepository.new
      )
        @event_repo      = event_repo
        @enrollment_repo = enrollment_repo
      end

      # Solo participantes confirmados o admin/collaborator pueden subir fotos
      def call(event_id:, user_id:, photo:, is_admin: false)
        unless is_admin
          enrollment = @enrollment_repo.find_by(event_id: event_id, user_id: user_id)
          raise Events::Errors::NotConfirmedParticipant unless enrollment&.status == 'confirmed'
        end

        event = @event_repo.find(event_id)
        raise Events::Errors::EventNotCompleted unless event.status == 'completed'

        @event_repo.attach_gallery_photo(event_id, photo)
      end
    end
  end
end
```

---

## Dominio: Enrollments

### app/domains/enrollments/interactors/enroll_user.rb

```ruby
module Enrollments
  module Interactors
    class EnrollUser
      def initialize(
        event_repo:      Events::Repositories::EventRepository.new,
        enrollment_repo: Repositories::EnrollmentRepository.new,
        profile_repo:    Profiles::Repositories::UserProfileRepository.new
      )
        @event_repo      = event_repo
        @enrollment_repo = enrollment_repo
        @profile_repo    = profile_repo
      end

      def call(event_id:, user_id:, tip_amount:, receipt:)
        profile = @profile_repo.find_by_user(user_id)
        raise Enrollments::Errors::IncompleteProfile unless profile&.onboarding_completed

        event = @event_repo.find(event_id)
        raise Enrollments::Errors::EventNotPublished unless event.published?
        raise Enrollments::Errors::AlreadyEnrolled   if @enrollment_repo.exists?(
          event_id: event_id, user_id: user_id
        )

        if event.full?
          position = @enrollment_repo.next_waitlist_position(event_id)
          enrollment = @enrollment_repo.create(
            event_id:          event_id,
            user_id:           user_id,
            status:            'waitlisted',
            tip_amount:        tip_amount,
            waitlist_position: position
          )
        else
          enrollment = @enrollment_repo.create(
            event_id:   event_id,
            user_id:    user_id,
            status:     'pending',
            tip_amount: tip_amount
          )
        end

        # Adjuntar captura de pantalla
        @enrollment_repo.attach_receipt(enrollment.id, receipt) if receipt.present?
        enrollment
      end
    end
  end
end
```

### app/domains/enrollments/interactors/verify_enrollment.rb

```ruby
module Enrollments
  module Interactors
    class VerifyEnrollment
      def initialize(
        enrollment_repo: Repositories::EnrollmentRepository.new,
        event_repo:      Events::Repositories::EventRepository.new
      )
        @enrollment_repo = enrollment_repo
        @event_repo      = event_repo
      end

      def call(enrollment_id:, verified_by_id:, action:, rejection_note: nil)
        enrollment = @enrollment_repo.find(enrollment_id)
        raise Enrollments::Errors::AlreadyVerified unless enrollment.status == 'pending'

        case action
        when 'confirm'
          event = @event_repo.find(enrollment.event_id)
          raise Enrollments::Errors::EventFull if event.full?

          @enrollment_repo.update(enrollment,
            status:         'confirmed',
            confirmed_at:   Time.current,
            verified_by_id: verified_by_id
          )
          @event_repo.increment_confirmed(enrollment.event_id)

          # Notificar por WhatsApp en background
          NotifyWhatsapp.new.call(enrollment_id: enrollment_id)

        when 'reject'
          raise Enrollments::Errors::MissingRejectionNote if rejection_note.blank?
          @enrollment_repo.update(enrollment,
            status:          'rejected',
            rejection_note:  rejection_note,
            verified_by_id:  verified_by_id
          )
        end
      end
    end
  end
end
```

### app/domains/enrollments/interactors/notify_whatsapp.rb

```ruby
module Enrollments
  module Interactors
    class NotifyWhatsapp
      def call(enrollment_id:)
        enrollment = ::Enrollment.includes(:user, :event).find(enrollment_id)
        event      = enrollment.event
        user       = enrollment.user

        return unless event.whatsapp_invite_link.present?
        return unless user.phone.present?
        return unless ENV['WHATSAPP_API_TOKEN'].present?

        send_message(phone: user.phone, message: build_message(event))
      rescue StandardError => e
        Rails.logger.warn("WhatsApp notification failed: #{e.message}")
      end

      private

      def build_message(event)
        <<~MSG
          ¡Hola! Tu inscripción a *#{event.title}* fue confirmada ☕
          📅 #{event.starts_at.strftime('%d/%m/%Y a las %H:%M')}
          📍 #{event.address}, #{event.neighborhood}

          Únete al grupo del evento:
          #{event.whatsapp_invite_link}

          ¡Nos vemos allá!
        MSG
      end

      def send_message(phone:, message:)
        require 'net/http'
        uri = URI("https://graph.facebook.com/v18.0/#{ENV['WHATSAPP_PHONE_ID']}/messages")
        req = Net::HTTP::Post.new(uri, {
          'Authorization' => "Bearer #{ENV['WHATSAPP_API_TOKEN']}",
          'Content-Type'  => 'application/json'
        })
        req.body = {
          messaging_product: 'whatsapp',
          to:                phone.gsub(/\D/, ''),
          type:              'text',
          text:              { body: message }
        }.to_json
        Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) { |http| http.request(req) }
      end
    end
  end
end
```

---

## Presenters — incluir URLs de imágenes

### Events presenter — incluir cover_image_url y gallery_urls

```ruby
module Events
  module Presenters
    class EventPresenter
      def self.single(event, cover_url: nil, gallery_urls: [])
        {
          data: {
            id:   event.id.to_s,
            type: 'events',
            attributes: {
              title:                event.title,
              description:          event.description,
              event_type:           event.event_type,
              status:               event.status,
              address:              event.address,
              neighborhood:         event.neighborhood,
              starts_at:            event.starts_at&.iso8601,
              ends_at:              event.ends_at&.iso8601,
              capacity:             event.capacity,
              confirmed_count:      event.confirmed_count,
              waitlist_count:       event.waitlist_count,
              available_slots:      event.capacity - event.confirmed_count,
              is_full:              (event.capacity - event.confirmed_count) <= 0,
              tip_min:              event.tip_min,
              tip_max:              event.tip_max,
              whatsapp_invite_link: event.whatsapp_invite_link,
              cover_image_url:      cover_url,       # URL firmada de S3/MinIO
              gallery_urls:         gallery_urls,    # array de URLs
              partner_id:           event.partner_id&.to_s,
            }
          }
        }
      end

      def self.collection(events_with_urls)
        {
          data: events_with_urls.map { |e, cover| single(e, cover_url: cover)[:data] },
          meta: { total: events_with_urls.size }
        }
      end
    end
  end
end
```

### En el controller — generar URLs firmadas

```ruby
# app/controllers/api/v1/events_controller.rb
def show
  event     = Events::Interactors::FetchEvent.new.call(id: params[:id])
  cover_url = event_cover_url(event)
  render json: Events::Presenters::EventPresenter.single(event, cover_url: cover_url)
end

private

def event_cover_url(event)
  record = ::Event.find(event.id)
  return nil unless record.cover_image.attached?
  rails_blob_url(record.cover_image, disposition: 'inline')
end
```

---

## Onboarding middleware

Crear `app/controllers/concerns/require_onboarding.rb`:

```ruby
module RequireOnboarding
  extend ActiveSupport::Concern

  included do
    before_action :check_onboarding_complete!
  end

  private

  def check_onboarding_complete!
    return if onboarding_exempt?
    return if current_user.super_admin?

    profile = ::UserProfile.find_by(user_id: current_user.id)
    return if profile&.onboarding_completed?

    render json: {
      errors: [{
        status: '403',
        code:   'onboarding_required',
        detail: 'Debes completar tu perfil antes de continuar'
      }]
    }, status: :forbidden
  end

  def onboarding_exempt?
    controller_path.include?('profiles') ||
    controller_path.include?('auth')
  end
end
```

Incluir en `Api::V1::ApplicationController`:

```ruby
include RequireOnboarding
```

---

## Rutas

```ruby
namespace :api do
  namespace :v1 do
    resource  :profile, only: [:show, :update]
    post '/profile/complete_onboarding', to: 'profiles#complete_onboarding'

    resources :events, only: [:index, :show, :create, :update, :destroy] do
      member do
        post :publish
        get  :participants
        post :gallery_photos    # subir foto post-evento
      end
    end

    resources :enrollments, only: [:index, :show, :create, :destroy] do
      member do
        post :verify
      end
    end

    resources :partners, only: [:index, :show, :create, :update, :destroy]
    resources :checkins,  only: [:create]
  end
end
```

---

## Definición de done

- `docker compose up` levanta api + db + minio sin errores
- MinIO consola accesible en `http://localhost:9001` (user: minioadmin / pass: minioadmin)
- Bucket `coffee-parches` creado automáticamente al levantar
- Subir foto de portada a un evento → URL firmada devuelta en el JSON
- Usuario nuevo registrado recibe rol `participant` automáticamente
- Usuario sin onboarding completo recibe 403 `onboarding_required`
- Inscripción en evento lleno → status `waitlisted` con posición
- Verificar inscripción como confirmed → `confirmed_count` incrementa
- Verificar inscripción como rejected sin nota → error descriptivo
- `bundle exec rspec` pasa al 100%
- `bundle exec rubocop` retorna 0 offenses
