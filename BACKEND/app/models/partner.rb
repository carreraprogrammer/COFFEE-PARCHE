class Partner < ApplicationRecord
  has_many :events, dependent: :nullify

  validates :name, presence: true
  validates :partner_type, presence: true
end
