module Events
  module Interactors
    class PublishEvent
      def initialize(event_repo: Repositories::EventRepository.new)
        @event_repo = event_repo
      end

      def call(event_id:)
        event = @event_repo.find(event_id)
        raise Events::Errors::AlreadyPublished if event.published?
        raise Events::Errors::MissingCoverImage unless @event_repo.has_cover?(event_id)
        raise Events::Errors::MissingWhatsappLink if event.whatsapp_invite_link.blank?

        @event_repo.update(event_id, status: 'published')
      end
    end
  end
end
