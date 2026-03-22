module Events
  module Interactors
    class FetchAllEvents
      def initialize(event_repo: Repositories::EventRepository.new)
        @event_repo = event_repo
      end

      def call(type: nil)
        @event_repo.all(type: type)
      end
    end
  end
end
