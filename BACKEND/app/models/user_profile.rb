class UserProfile < ApplicationRecord
  belongs_to :user

  has_one_attached :avatar

  validates :english_level, inclusion: {
    in: %w[beginner elementary intermediate upper advanced],
    allow_nil: true
  }
end
