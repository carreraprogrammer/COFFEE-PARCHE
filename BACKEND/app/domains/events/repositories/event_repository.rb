module Events
  module Repositories
    class EventRepository
      def all(type: nil)
        scope = ::Event.includes(:partner).order(:starts_at)
        scope = scope.where(event_type: type) if type.present?
        scope.map { |record| map_to_entity(record) }
      end

      def find(id)
        map_to_entity(::Event.includes(:partner).find(id))
      end

      def create(attrs)
        map_to_entity(::Event.create!(attrs))
      end

      def update(event_or_id, attrs)
        record = record_for(event_or_id)
        record.update!(attrs)
        map_to_entity(record.reload)
      end

      def destroy(id)
        ::Event.find(id).destroy!
      end

      def attach_cover(event_id, cover_image)
        ::Event.find(event_id).cover_image.attach(cover_image)
      end

      def attach_gallery_photo(event_id, photo)
        ::Event.find(event_id).gallery_photos.attach(photo)
      end

      def has_cover?(event_id)
        ::Event.find(event_id).cover_image.attached?
      end

      def increment_confirmed(event_id)
        event = ::Event.find(event_id)
        event.increment!(:confirmed_count)
        event.update!(status: 'full') if event.confirmed_count >= event.capacity
      end

      private

      def record_for(event_or_id)
        event_or_id.is_a?(::Event) ? event_or_id : ::Event.find(event_or_id.respond_to?(:id) ? event_or_id.id : event_or_id)
      end

      def map_to_entity(record)
        Events::Entities::Event.new(
          id: record.id,
          title: record.title,
          description: record.description,
          event_type: record.event_type,
          status: record.status,
          partner_id: record.partner_id,
          partner_name: record.partner&.name,
          address: record.address,
          neighborhood: record.neighborhood,
          starts_at: record.starts_at,
          ends_at: record.ends_at,
          capacity: record.capacity,
          confirmed_count: record.confirmed_count,
          waitlist_count: record.waitlist_count,
          tip_min: record.tip_min,
          tip_max: record.tip_max,
          whatsapp_invite_link: record.whatsapp_invite_link
        )
      end
    end
  end
end
