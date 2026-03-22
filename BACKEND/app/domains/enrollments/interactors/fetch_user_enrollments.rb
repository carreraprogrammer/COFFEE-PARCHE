module Enrollments
  module Interactors
    class FetchUserEnrollments
      def initialize(enrollment_repo: Repositories::EnrollmentRepository.new)
        @enrollment_repo = enrollment_repo
      end

      def call(user_id:)
        @enrollment_repo.all_for_user(user_id)
      end
    end
  end
end
