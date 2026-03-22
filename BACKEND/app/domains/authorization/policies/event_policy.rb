module Authorization
  module Policies
    class EventPolicy < ApplicationPolicy
      def index?
        has_permission?('events:read')
      end

      def show?
        has_permission?('events:read')
      end

      def create?
        has_permission?('events:create')
      end

      def update?
        has_permission?('events:update')
      end

      def destroy?
        has_permission?('events:destroy')
      end

      def publish?
        has_permission?('events:publish') || has_permission?('events:update')
      end

      def participants?
        has_permission?('events:read')
      end

      def gallery_photos?
        has_permission?('photos:create')
      end
    end
  end
end
