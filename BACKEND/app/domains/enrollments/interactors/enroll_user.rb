module Enrollments
  module Interactors
    class EnrollUser
      def initialize(event_repo: Events::Repositories::EventRepository.new, enrollment_repo: Repositories::EnrollmentRepository.new, profile_repo: Profiles::Repositories::UserProfileRepository.new)
        @event_repo = event_repo
        @enrollment_repo = enrollment_repo
        @profile_repo = profile_repo
      end

      def call(event_id:, user_id:, tip_amount:, receipt:)
        profile = @profile_repo.find_by_user(user_id)
        raise Enrollments::Errors::IncompleteProfile unless profile&.onboarding_completed?

        event = @event_repo.find(event_id)
        raise Enrollments::Errors::EventNotPublished unless event.published?
        raise Enrollments::Errors::AlreadyEnrolled if @enrollment_repo.exists?(event_id: event_id, user_id: user_id)

        enrollment = if event.full?
                       @enrollment_repo.create(
                         event_id: event_id,
                         user_id: user_id,
                         status: 'waitlisted',
                         tip_amount: tip_amount,
                         waitlist_position: @enrollment_repo.next_waitlist_position(event_id)
                       )
                     else
                       @enrollment_repo.create(
                         event_id: event_id,
                         user_id: user_id,
                         status: 'pending',
                         tip_amount: tip_amount
                       )
                     end

        @enrollment_repo.attach_receipt(enrollment.id, receipt) if receipt.present?
        enrollment
      end
    end
  end
end
