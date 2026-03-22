module Enrollments
  module Interactors
    class CancelEnrollment
      def initialize(enrollment_repo: Repositories::EnrollmentRepository.new)
        @enrollment_repo = enrollment_repo
      end

      def call(id:)
        @enrollment_repo.destroy(id)
      end
    end
  end
end
