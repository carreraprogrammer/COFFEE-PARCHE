module Events
  module Presenters
    class EventPresenter
      def self.single(event, cover_url: nil, gallery_urls: [])
        {
          data: {
            id: event.id.to_s,
            type: 'events',
            attributes: {
              title: event.title,
              description: event.description,
              event_type: event.event_type,
              status: event.status,
              address: event.address,
              neighborhood: event.neighborhood,
              starts_at: event.starts_at&.iso8601,
              ends_at: event.ends_at&.iso8601,
              capacity: event.capacity,
              confirmed_count: event.confirmed_count,
              waitlist_count: event.waitlist_count,
              available_slots: event.capacity - event.confirmed_count,
              is_full: event.full?,
              tip_min: event.tip_min,
              tip_max: event.tip_max,
              whatsapp_invite_link: event.whatsapp_invite_link,
              cover_image_url: cover_url,
              gallery_urls: gallery_urls,
              partner_id: event.partner_id&.to_s,
              partner_name: event.partner_name
            }
          }
        }
      end

      def self.collection(events_with_urls)
        {
          data: events_with_urls.map { |event, cover_url, gallery_urls| single(event, cover_url: cover_url, gallery_urls: gallery_urls)[:data] },
          meta: { total: events_with_urls.size }
        }
      end
    end
  end
end
