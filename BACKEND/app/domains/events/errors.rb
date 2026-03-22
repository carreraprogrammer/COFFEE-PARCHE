module Events
  module Errors
    class InvalidType < StandardError; end
    class InvalidCapacity < StandardError; end
    class AlreadyPublished < StandardError; end
    class MissingCoverImage < StandardError; end
    class MissingWhatsappLink < StandardError; end
    class NotConfirmedParticipant < StandardError; end
    class EventNotCompleted < StandardError; end
  end
end
