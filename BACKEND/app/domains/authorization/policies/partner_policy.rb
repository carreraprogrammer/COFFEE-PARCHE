module Authorization
  module Policies
    class PartnerPolicy < ApplicationPolicy
      def index?
        has_permission?('partners:read')
      end

      def show?
        has_permission?('partners:read')
      end

      def create?
        has_permission?('partners:create')
      end

      def update?
        has_permission?('partners:update')
      end

      def destroy?
        has_permission?('partners:destroy')
      end
    end
  end
end
