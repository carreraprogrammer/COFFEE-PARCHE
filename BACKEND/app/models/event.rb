class Event < ApplicationRecord
  belongs_to :partner, optional: true
  belongs_to :created_by, class_name: 'User'
  has_many :enrollments, dependent: :destroy

  has_one_attached :cover_image
  has_many_attached :gallery_photos

  validates :title, presence: true
  validates :event_type, inclusion: { in: %w[cafe karaoke yoga salsa park other] }
  validates :status, inclusion: { in: %w[draft published full cancelled completed] }
  validates :capacity, numericality: { greater_than: 0 }

  scope :published, -> { where(status: 'published') }
  scope :upcoming, -> { where('starts_at > ?', Time.current).order(:starts_at) }
end
