module Profiles
  module Interactors
    class CompleteOnboarding
      VALID_LEVELS = %w[beginner elementary intermediate upper advanced].freeze
      VALID_INTERESTS = %w[yoga salsa karaoke cafe parque ingles].freeze

      def initialize(profile_repo: Repositories::UserProfileRepository.new)
        @profile_repo = profile_repo
      end

      def call(user_id:, phone:, neighborhood:, english_level:, interests:, avatar: nil)
        raise Profiles::Errors::InvalidEnglishLevel unless VALID_LEVELS.include?(english_level)
        raise Profiles::Errors::InvalidInterest if (interests - VALID_INTERESTS).any?
        raise Profiles::Errors::EmptyInterests if interests.empty?

        profile = @profile_repo.find_or_initialize(user_id: user_id)
        @profile_repo.update(
          profile,
          phone: phone,
          neighborhood: neighborhood,
          english_level: english_level,
          interests: interests,
          avatar: avatar,
          onboarding_completed: true
        )
      end
    end
  end
end
