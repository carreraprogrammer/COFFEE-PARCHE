module Events
  module Entities
    class Event
      attr_reader :id, :title, :description, :event_type, :status, :partner_id, :partner_name,
                  :address, :neighborhood, :starts_at, :ends_at, :capacity, :confirmed_count,
                  :waitlist_count, :tip_min, :tip_max, :whatsapp_invite_link

      def initialize(**attrs)
        attrs.each { |key, value| instance_variable_set("@#{key}", value) }
      end

      def published?
        status == 'published'
      end

      def full?
        capacity.to_i <= confirmed_count.to_i
      end
    end
  end
end
