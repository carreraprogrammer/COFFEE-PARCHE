class Api::V1::CheckinsController < Api::V1::BaseController
  skip_after_action :verify_policy_scoped, only: :create

  def create
    authorize :checkin, :create?, policy_class: Authorization::Policies::CheckinPolicy
    checkin = ::Checkin.create!(enrollment_id: params.require(:enrollment_id), checked_by_id: current_user.id)
    render json: {
      data: {
        id: checkin.id.to_s,
        type: 'checkins',
        attributes: {
          enrollment_id: checkin.enrollment_id.to_s,
          checked_by_id: checkin.checked_by_id.to_s,
          created_at: checkin.created_at.iso8601
        }
      }
    }, status: :created
  end
end
