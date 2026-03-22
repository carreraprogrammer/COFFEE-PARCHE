module Authorization
  module Policies
    class EnrollmentPolicy < ApplicationPolicy
      def index?
        has_permission?('enrollments:read')
      end

      def show?
        has_permission?('enrollments:read')
      end

      def create?
        has_permission?('enrollments:create')
      end

      def destroy?
        has_permission?('enrollments:destroy') || has_permission?('enrollments:create')
      end

      def verify?
        has_permission?('enrollments:verify')
      end
    end
  end
end
