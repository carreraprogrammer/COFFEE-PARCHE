module Enrollments
  module Presenters
    class EnrollmentPresenter
      def self.single(enrollment, receipt_url: nil)
        {
          data: {
            id: enrollment.id.to_s,
            type: 'enrollments',
            attributes: {
              event_id: enrollment.event_id.to_s,
              user_id: enrollment.user_id.to_s,
              status: enrollment.status,
              tip_amount: enrollment.tip_amount,
              receipt_url: receipt_url,
              rejection_note: enrollment.rejection_note,
              waitlist_position: enrollment.waitlist_position,
              confirmed_at: enrollment.confirmed_at&.iso8601
            }
          }
        }
      end

      def self.collection(enrollments_with_urls)
        {
          data: enrollments_with_urls.map { |enrollment, receipt_url| single(enrollment, receipt_url: receipt_url)[:data] },
          meta: { total: enrollments_with_urls.size }
        }
      end
    end
  end
end
