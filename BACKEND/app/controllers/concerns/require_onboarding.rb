module RequireOnboarding
  extend ActiveSupport::Concern

  included do
    before_action :check_onboarding_complete!
  end

  private

  def check_onboarding_complete!
    return if onboarding_exempt?
    return if current_user.super_admin?

    profile = ::UserProfile.find_by(user_id: current_user.id)
    return if profile&.onboarding_completed?

    render json: {
      errors: [{
        status: '403',
        code: 'onboarding_required',
        detail: 'Debes completar tu perfil antes de continuar'
      }]
    }, status: :forbidden
  end

  def onboarding_exempt?
    controller_path.include?('profiles') || controller_path.include?('auth')
  end
end
