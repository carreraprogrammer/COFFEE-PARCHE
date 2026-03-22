module Profiles
  module Interactors
    class FetchProfile
      def initialize(profile_repo: Repositories::UserProfileRepository.new)
        @profile_repo = profile_repo
      end

      def call(user_id:)
        @profile_repo.find_by_user(user_id)
      end
    end
  end
end
