class CreateEvents < ActiveRecord::Migration[8.0]
  def change
    create_table :events do |t|
      t.string :title, null: false
      t.text :description
      t.string :event_type, null: false
      t.string :status, null: false, default: 'draft'
      t.references :partner, foreign_key: true
      t.string :address, null: false
      t.string :neighborhood, null: false
      t.datetime :starts_at, null: false
      t.datetime :ends_at
      t.integer :capacity, null: false
      t.integer :confirmed_count, null: false, default: 0
      t.integer :waitlist_count, null: false, default: 0
      t.integer :tip_min
      t.integer :tip_max
      t.string :whatsapp_invite_link
      t.references :created_by, null: false, foreign_key: { to_table: :users }
      t.timestamps
    end

    add_index :events, :status
    add_index :events, :starts_at
  end
end
