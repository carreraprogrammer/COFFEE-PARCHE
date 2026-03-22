module Events
  module Interactors
    class CreateEvent
      VALID_TYPES = %w[cafe karaoke yoga salsa park other].freeze

      def initialize(event_repo: Repositories::EventRepository.new)
        @event_repo = event_repo
      end

      def call(title:, event_type:, address:, neighborhood:, starts_at:, capacity:, created_by_id:, cover_image: nil, **opts)
        raise Events::Errors::InvalidType unless VALID_TYPES.include?(event_type)
        raise Events::Errors::InvalidCapacity if capacity.to_i <= 0

        event = @event_repo.create(
          title: title,
          event_type: event_type,
          address: address,
          neighborhood: neighborhood,
          starts_at: starts_at,
          capacity: capacity,
          created_by_id: created_by_id,
          status: 'draft',
          **opts
        )
        @event_repo.attach_cover(event.id, cover_image) if cover_image.present?
        event
      end
    end
  end
end
