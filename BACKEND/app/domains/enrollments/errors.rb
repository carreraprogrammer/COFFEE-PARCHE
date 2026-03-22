module Enrollments
  module Errors
    class IncompleteProfile < StandardError; end
    class EventNotPublished < StandardError; end
    class AlreadyEnrolled < StandardError; end
    class AlreadyVerified < StandardError; end
    class EventFull < StandardError; end
    class MissingRejectionNote < StandardError; end
  end
end
