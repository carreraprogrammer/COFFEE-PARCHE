module Enrollments
  module Interactors
    class FetchEventEnrollments
      def initialize(enrollment_repo: Repositories::EnrollmentRepository.new)
        @enrollment_repo = enrollment_repo
      end

      def call(event_id:)
        @enrollment_repo.all_for_event(event_id)
      end
    end
  end
end
