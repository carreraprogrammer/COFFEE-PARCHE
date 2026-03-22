module Events
  module Interactors
    class FetchEvent
      def initialize(event_repo: Repositories::EventRepository.new)
        @event_repo = event_repo
      end

      def call(id:)
        @event_repo.find(id)
      end
    end
  end
end
