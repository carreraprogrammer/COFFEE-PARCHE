module Profiles
  module Entities
    class UserProfile
      attr_reader :id, :user_id, :phone, :neighborhood, :english_level, :interests,
                  :onboarding_completed, :avatar_url

      def initialize(id:, user_id:, phone:, neighborhood:, english_level:, interests:, onboarding_completed:, avatar_url: nil)
        @id = id
        @user_id = user_id
        @phone = phone
        @neighborhood = neighborhood
        @english_level = english_level
        @interests = interests || []
        @onboarding_completed = onboarding_completed
        @avatar_url = avatar_url
      end

      def onboarding_completed?
        onboarding_completed
      end
    end
  end
end
