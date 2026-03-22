module Enrollments
  module Entities
    class Enrollment
      attr_reader :id, :event_id, :user_id, :status, :tip_amount, :rejection_note,
                  :waitlist_position, :confirmed_at, :verified_by_id

      def initialize(**attrs)
        attrs.each { |key, value| instance_variable_set("@#{key}", value) }
      end
    end
  end
end
