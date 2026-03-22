class Api::V1::EnrollmentsController < Api::V1::BaseController
  skip_after_action :verify_policy_scoped, only: %i[index show create destroy verify]

  include Rails.application.routes.url_helpers

  def index
    authorize :enrollment, :index?, policy_class: Authorization::Policies::EnrollmentPolicy
    enrollments = Enrollments::Interactors::FetchUserEnrollments.new.call(user_id: current_user.id)
    render json: Enrollments::Presenters::EnrollmentPresenter.collection(enrollments.map { |enrollment| [enrollment, receipt_url(enrollment)] })
  end

  def show
    authorize :enrollment, :show?, policy_class: Authorization::Policies::EnrollmentPolicy
    enrollment = Enrollments::Repositories::EnrollmentRepository.new.find(params[:id])
    render json: Enrollments::Presenters::EnrollmentPresenter.single(enrollment, receipt_url: receipt_url(enrollment))
  end

  def create
    authorize :enrollment, :create?, policy_class: Authorization::Policies::EnrollmentPolicy
    enrollment = Enrollments::Interactors::EnrollUser.new.call(
      event_id: params.require(:event_id),
      user_id: current_user.id,
      tip_amount: params[:tip_amount],
      receipt: params[:receipt]
    )
    render json: Enrollments::Presenters::EnrollmentPresenter.single(enrollment, receipt_url: receipt_url(enrollment)), status: :created
  rescue Enrollments::Errors::IncompleteProfile, Enrollments::Errors::EventNotPublished, Enrollments::Errors::AlreadyEnrolled => e
    render_unprocessable(e.message)
  end

  def destroy
    authorize :enrollment, :destroy?, policy_class: Authorization::Policies::EnrollmentPolicy
    Enrollments::Interactors::CancelEnrollment.new.call(id: params[:id])
    head :no_content
  end

  def verify
    authorize :enrollment, :verify?, policy_class: Authorization::Policies::EnrollmentPolicy
    enrollment = Enrollments::Interactors::VerifyEnrollment.new.call(
      enrollment_id: params[:id],
      verified_by_id: current_user.id,
      action: params.require(:action),
      rejection_note: params[:rejection_note]
    )
    render json: Enrollments::Presenters::EnrollmentPresenter.single(enrollment, receipt_url: receipt_url(enrollment))
  rescue Enrollments::Errors::AlreadyVerified, Enrollments::Errors::EventFull, Enrollments::Errors::MissingRejectionNote => e
    render_unprocessable(e.message)
  end

  private

  def receipt_url(enrollment)
    record = ::Enrollment.find(enrollment.id)
    return nil unless record.receipt.attached?

    rails_blob_url(record.receipt, disposition: 'inline', host: request.base_url)
  end
end
