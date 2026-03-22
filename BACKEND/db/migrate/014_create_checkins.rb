class CreateCheckins < ActiveRecord::Migration[8.0]
  def change
    create_table :checkins do |t|
      t.references :enrollment, null: false, foreign_key: true
      t.references :checked_by, null: false, foreign_key: { to_table: :users }
      t.timestamps
    end

    add_index :checkins, :enrollment_id, unique: true
  end
end
