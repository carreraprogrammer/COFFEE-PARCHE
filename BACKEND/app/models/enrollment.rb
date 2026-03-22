class Enrollment < ApplicationRecord
  belongs_to :event
  belongs_to :user
  belongs_to :verified_by, class_name: 'User', optional: true
  has_one :checkin, dependent: :destroy

  has_one_attached :receipt

  validates :status, inclusion: { in: %w[pending confirmed rejected waitlisted cancelled] }
end
