class User < ApplicationRecord
  has_many :user_roles, dependent: :destroy
  has_many :roles, through: :user_roles
  has_many :permissions, through: :roles

  has_one :user_profile, dependent: :destroy
  has_many :created_events, class_name: 'Event', foreign_key: :created_by_id, dependent: :nullify
  has_many :enrollments, dependent: :destroy
  has_many :verified_enrollments, class_name: 'Enrollment', foreign_key: :verified_by_id, dependent: :nullify
  has_many :checkins, foreign_key: :checked_by_id, dependent: :destroy

  validates :email, presence: true, uniqueness: true
  validates :encrypted_password, presence: true, unless: :oauth_user?
  validates :name, presence: true

  def oauth_user?
    auth_provider.present?
  end
end
