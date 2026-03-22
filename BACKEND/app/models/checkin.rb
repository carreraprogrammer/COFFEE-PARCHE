class Checkin < ApplicationRecord
  belongs_to :enrollment
  belongs_to :checked_by, class_name: 'User'
end
