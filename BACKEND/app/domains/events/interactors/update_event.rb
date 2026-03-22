module Events
  module Interactors
    class UpdateEvent
      def initialize(event_repo: Repositories::EventRepository.new)
        @event_repo = event_repo
      end

      def call(id:, attrs:)
        @event_repo.update(id, attrs)
      end
    end
  end
end
