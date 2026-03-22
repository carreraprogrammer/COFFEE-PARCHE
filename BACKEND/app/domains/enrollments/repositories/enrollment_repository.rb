module Enrollments
  module Repositories
    class EnrollmentRepository
      def all_for_user(user_id)
        ::Enrollment.where(user_id: user_id).order(created_at: :desc).map { |record| map_to_entity(record) }
      end

      def all_for_event(event_id)
        ::Enrollment.where(event_id: event_id).order(:created_at).map { |record| map_to_entity(record) }
      end

      def find(id)
        map_to_entity(::Enrollment.find(id))
      end

      def find_by(event_id:, user_id:)
        record = ::Enrollment.find_by(event_id: event_id, user_id: user_id)
        record && map_to_entity(record)
      end

      def exists?(event_id:, user_id:)
        ::Enrollment.exists?(event_id: event_id, user_id: user_id)
      end

      def next_waitlist_position(event_id)
        (::Enrollment.where(event_id: event_id).maximum(:waitlist_position) || 0) + 1
      end

      def create(attrs)
        map_to_entity(::Enrollment.create!(attrs))
      end

      def update(enrollment_or_id, attrs)
        record = enrollment_or_id.is_a?(::Enrollment) ? enrollment_or_id : ::Enrollment.find(enrollment_or_id.respond_to?(:id) ? enrollment_or_id.id : enrollment_or_id)
        record.update!(attrs)
        map_to_entity(record.reload)
      end

      def destroy(id)
        ::Enrollment.find(id).destroy!
      end

      def attach_receipt(enrollment_id, receipt)
        ::Enrollment.find(enrollment_id).receipt.attach(receipt)
      end

      private

      def map_to_entity(record)
        Enrollments::Entities::Enrollment.new(
          id: record.id,
          event_id: record.event_id,
          user_id: record.user_id,
          status: record.status,
          tip_amount: record.tip_amount,
          rejection_note: record.rejection_note,
          waitlist_position: record.waitlist_position,
          confirmed_at: record.confirmed_at,
          verified_by_id: record.verified_by_id
        )
      end
    end
  end
end
