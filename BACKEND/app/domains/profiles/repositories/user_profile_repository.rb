module Profiles
  module Repositories
    class UserProfileRepository
      def find_by_user(user_id)
        record = ::UserProfile.find_by(user_id: user_id)
        record && map_to_entity(record)
      end

      def find_or_initialize(user_id:)
        ::UserProfile.find_or_initialize_by(user_id: user_id)
      end

      def update(profile, attrs)
        avatar = attrs.delete(:avatar)
        profile.assign_attributes(attrs)
        profile.save!
        profile.avatar.attach(avatar) if avatar.present?
        map_to_entity(profile.reload)
      end

      private

      def map_to_entity(record)
        Profiles::Entities::UserProfile.new(
          id: record.id,
          user_id: record.user_id,
          phone: record.phone,
          neighborhood: record.neighborhood,
          english_level: record.english_level,
          interests: record.interests,
          onboarding_completed: record.onboarding_completed,
          avatar_url: nil
        )
      end
    end
  end
end
