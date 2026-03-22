module Authorization
  module Policies
    class CheckinPolicy < ApplicationPolicy
      def create?
        has_permission?('checkins:create')
      end
    end
  end
end
