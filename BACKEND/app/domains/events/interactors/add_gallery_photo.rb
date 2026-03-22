module Events
  module Interactors
    class AddGalleryPhoto
      def initialize(event_repo: Repositories::EventRepository.new, enrollment_repo: Enrollments::Repositories::EnrollmentRepository.new)
        @event_repo = event_repo
        @enrollment_repo = enrollment_repo
      end

      def call(event_id:, user_id:, photo:, is_admin: false)
        unless is_admin
          enrollment = @enrollment_repo.find_by(event_id: event_id, user_id: user_id)
          raise Events::Errors::NotConfirmedParticipant unless enrollment&.status == 'confirmed'
        end

        event = @event_repo.find(event_id)
        raise Events::Errors::EventNotCompleted unless event.status == 'completed'

        @event_repo.attach_gallery_photo(event_id, photo)
      end
    end
  end
end
