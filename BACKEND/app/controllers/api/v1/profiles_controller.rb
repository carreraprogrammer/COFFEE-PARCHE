class Api::V1::ProfilesController < Api::V1::BaseController
  skip_after_action :verify_policy_scoped, only: %i[show update complete_onboarding]

  def show
    authorize :profile, :show?, policy_class: Authorization::Policies::ProfilePolicy
    profile = Profiles::Interactors::FetchProfile.new.call(user_id: current_user.id)
    render json: profile_payload(profile)
  end

  def update
    authorize :profile, :update?, policy_class: Authorization::Policies::ProfilePolicy
    profile_record = Profiles::Repositories::UserProfileRepository.new.find_or_initialize(user_id: current_user.id)
    profile = Profiles::Repositories::UserProfileRepository.new.update(profile_record, profile_params.to_h.symbolize_keys)
    render json: profile_payload(profile)
  end

  def complete_onboarding
    authorize :profile, :update?, policy_class: Authorization::Policies::ProfilePolicy
    profile = Profiles::Interactors::CompleteOnboarding.new.call(
      user_id: current_user.id,
      phone: params.require(:phone),
      neighborhood: params.require(:neighborhood),
      english_level: params.require(:english_level),
      interests: Array(params[:interests]),
      avatar: params[:avatar]
    )
    render json: profile_payload(profile)
  rescue Profiles::Errors::InvalidEnglishLevel, Profiles::Errors::InvalidInterest, Profiles::Errors::EmptyInterests => e
    render_unprocessable(e.message)
  end

  private

  def profile_params
    params.permit(:phone, :neighborhood, :english_level, :onboarding_completed, interests: [])
  end

  def profile_payload(profile)
    profile ||= Profiles::Entities::UserProfile.new(
      id: nil, user_id: current_user.id, phone: nil, neighborhood: nil, english_level: nil, interests: [], onboarding_completed: false
    )
    {
      data: {
        id: profile.id&.to_s || current_user.id.to_s,
        type: 'profiles',
        attributes: {
          user_id: profile.user_id,
          phone: profile.phone,
          neighborhood: profile.neighborhood,
          english_level: profile.english_level,
          interests: profile.interests,
          avatar_url: profile.avatar_url,
          onboarding_completed: profile.onboarding_completed
        }
      }
    }
  end
end
