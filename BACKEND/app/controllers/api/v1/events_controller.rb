class Api::V1::EventsController < Api::V1::BaseController
  skip_after_action :verify_policy_scoped, only: %i[index show participants publish gallery_photos]

  include Rails.application.routes.url_helpers

  def index
    authorize :event, :index?, policy_class: Authorization::Policies::EventPolicy
    events = Events::Interactors::FetchAllEvents.new.call(type: params[:type])
    render json: Events::Presenters::EventPresenter.collection(events.map { |event| [event, event_cover_url(event), event_gallery_urls(event)] })
  end

  def show
    authorize :event, :show?, policy_class: Authorization::Policies::EventPolicy
    event = Events::Interactors::FetchEvent.new.call(id: params[:id])
    render json: Events::Presenters::EventPresenter.single(event, cover_url: event_cover_url(event), gallery_urls: event_gallery_urls(event))
  end

  def create
    authorize :event, :create?, policy_class: Authorization::Policies::EventPolicy
    event = Events::Interactors::CreateEvent.new.call(**create_event_params.merge(created_by_id: current_user.id).symbolize_keys)
    render json: Events::Presenters::EventPresenter.single(event, cover_url: event_cover_url(event)), status: :created
  rescue Events::Errors::InvalidType, Events::Errors::InvalidCapacity => e
    render_unprocessable(e.message)
  end

  def update
    authorize :event, :update?, policy_class: Authorization::Policies::EventPolicy
    event = Events::Interactors::UpdateEvent.new.call(id: params[:id], attrs: update_event_params.to_h.symbolize_keys)
    render json: Events::Presenters::EventPresenter.single(event, cover_url: event_cover_url(event), gallery_urls: event_gallery_urls(event))
  end

  def destroy
    authorize :event, :destroy?, policy_class: Authorization::Policies::EventPolicy
    Events::Repositories::EventRepository.new.destroy(params[:id])
    head :no_content
  end

  def publish
    authorize :event, :publish?, policy_class: Authorization::Policies::EventPolicy
    event = Events::Interactors::PublishEvent.new.call(event_id: params[:id])
    render json: Events::Presenters::EventPresenter.single(event, cover_url: event_cover_url(event), gallery_urls: event_gallery_urls(event))
  rescue Events::Errors::AlreadyPublished, Events::Errors::MissingCoverImage, Events::Errors::MissingWhatsappLink => e
    render_unprocessable(e.message)
  end

  def participants
    authorize :event, :participants?, policy_class: Authorization::Policies::EventPolicy
    enrollments = Enrollments::Interactors::FetchEventEnrollments.new.call(event_id: params[:id])
    render json: Enrollments::Presenters::EnrollmentPresenter.collection(enrollments.map { |enrollment| [enrollment, receipt_url(enrollment)] })
  end

  def gallery_photos
    authorize :event, :gallery_photos?, policy_class: Authorization::Policies::EventPolicy
    Events::Interactors::AddGalleryPhoto.new.call(
      event_id: params[:id],
      user_id: current_user.id,
      photo: params.require(:photo),
      is_admin: can?('photos:create') && can?('events:update')
    )
    head :created
  rescue Events::Errors::NotConfirmedParticipant, Events::Errors::EventNotCompleted => e
    render_unprocessable(e.message)
  end

  private

  def create_event_params
    params.permit(:title, :description, :event_type, :partner_id, :address, :neighborhood, :starts_at, :ends_at, :capacity, :tip_min, :tip_max, :whatsapp_invite_link, :cover_image)
  end

  def update_event_params
    params.permit(:title, :description, :event_type, :status, :partner_id, :address, :neighborhood, :starts_at, :ends_at, :capacity, :tip_min, :tip_max, :whatsapp_invite_link)
  end

  def event_cover_url(event)
    record = ::Event.find(event.id)
    return nil unless record.cover_image.attached?

    rails_blob_url(record.cover_image, disposition: 'inline', host: request.base_url)
  end

  def event_gallery_urls(event)
    record = ::Event.find(event.id)
    record.gallery_photos.map { |photo| rails_blob_url(photo, disposition: 'inline', host: request.base_url) }
  end

  def receipt_url(enrollment)
    record = ::Enrollment.find(enrollment.id)
    return nil unless record.receipt.attached?

    rails_blob_url(record.receipt, disposition: 'inline', host: request.base_url)
  end
end
