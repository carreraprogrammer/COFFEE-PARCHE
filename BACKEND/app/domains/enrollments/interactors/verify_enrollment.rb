module Enrollments
  module Interactors
    class VerifyEnrollment
      def initialize(enrollment_repo: Repositories::EnrollmentRepository.new, event_repo: Events::Repositories::EventRepository.new)
        @enrollment_repo = enrollment_repo
        @event_repo = event_repo
      end

      def call(enrollment_id:, verified_by_id:, action:, rejection_note: nil)
        enrollment = @enrollment_repo.find(enrollment_id)
        raise Enrollments::Errors::AlreadyVerified unless enrollment.status == 'pending'

        case action
        when 'confirm'
          event = @event_repo.find(enrollment.event_id)
          raise Enrollments::Errors::EventFull if event.full?

          updated = @enrollment_repo.update(
            enrollment.id,
            status: 'confirmed',
            confirmed_at: Time.current,
            verified_by_id: verified_by_id
          )
          @event_repo.increment_confirmed(enrollment.event_id)
          NotifyWhatsapp.new.call(enrollment_id: enrollment_id)
          updated
        when 'reject'
          raise Enrollments::Errors::MissingRejectionNote if rejection_note.blank?

          @enrollment_repo.update(
            enrollment.id,
            status: 'rejected',
            rejection_note: rejection_note,
            verified_by_id: verified_by_id
          )
        else
          raise ArgumentError, 'Invalid verification action'
        end
      end
    end
  end
end
