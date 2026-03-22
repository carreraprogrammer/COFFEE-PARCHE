class CreatePartners < ActiveRecord::Migration[8.0]
  def change
    create_table :partners do |t|
      t.string :name, null: false
      t.string :partner_type, null: false
      t.string :neighborhood
      t.string :address
      t.string :contact_name
      t.string :contact_phone
      t.text :notes
      t.boolean :active, null: false, default: true
      t.timestamps
    end
  end
end
