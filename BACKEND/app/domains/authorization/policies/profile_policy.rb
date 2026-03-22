module Authorization
  module Policies
    class ProfilePolicy < ApplicationPolicy
      def show?
        has_permission?('profiles:read')
      end

      def update?
        has_permission?('profiles:update')
      end
    end
  end
end
