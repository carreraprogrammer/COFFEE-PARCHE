class CreateEnrollments < ActiveRecord::Migration[8.0]
  def change
    create_table :enrollments do |t|
      t.references :event, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.string :status, null: false, default: 'pending'
      t.integer :tip_amount
      t.text :rejection_note
      t.integer :waitlist_position
      t.datetime :confirmed_at
      t.references :verified_by, foreign_key: { to_table: :users }
      t.timestamps
    end

    add_index :enrollments, [:event_id, :user_id], unique: true
    add_index :enrollments, [:event_id, :status]
  end
end
