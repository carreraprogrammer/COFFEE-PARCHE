class CreateUserProfiles < ActiveRecord::Migration[8.0]
  def change
    create_table :user_profiles do |t|
      t.references :user, null: false, foreign_key: true
      t.string :phone
      t.string :neighborhood
      t.string :english_level
      t.json :interests
      t.boolean :onboarding_completed, null: false, default: false
      t.timestamps
    end

    add_index :user_profiles, :user_id, unique: true
  end
end
