resources = %w[users roles permissions forms]
actions = %w[read create update destroy manage]

resources.each do |resource|
  actions.each do |action|
    next if action == 'manage' && resource != 'users'

    Permission.find_or_create_by!(resource: resource, action: action) do |permission|
      permission.description = "Puede #{action} #{resource}"
    end
  end
end

new_resources = {
  'events' => %w[read create update destroy publish],
  'enrollments' => %w[read create update destroy verify],
  'profiles' => %w[read update],
  'partners' => %w[read create update destroy],
  'checkins' => %w[create read],
  'photos' => %w[create read destroy]
}

new_resources.each do |resource, resource_actions|
  resource_actions.each do |action|
    Permission.find_or_create_by!(resource: resource, action: action)
  end
end

admin_role = Role.find_or_create_by!(slug: 'admin') do |role|
  role.name = 'Administrador'
  role.description = 'Acceso completo al sistema'
end

editor_role = Role.find_or_create_by!(slug: 'editor') do |role|
  role.name = 'Editor'
  role.description = 'Puede gestionar contenido pero no usuarios ni roles'
end

viewer_role = Role.find_or_create_by!(slug: 'viewer') do |role|
  role.name = 'Viewer'
  role.description = 'Solo lectura'
end

collaborator_role = Role.find_or_create_by!(slug: 'collaborator') do |role|
  role.name = 'Colaborador'
  role.description = 'Ayudante de Sofía — crea eventos, verifica inscripciones, hace check-in'
end

participant_role = Role.find_or_create_by!(slug: 'participant') do |role|
  role.name = 'Participante'
  role.description = 'Miembro de la comunidad Coffee Parches'
end

partner_role = Role.find_or_create_by!(slug: 'partner') do |role|
  role.name = 'Aliado'
  role.description = 'Lugar o negocio aliado de Coffee Parches'
end

admin_role.permissions = Permission.all
editor_role.permissions = Permission.where(resource: 'forms').or(Permission.where(resource: 'users', action: 'read'))
viewer_role.permissions = Permission.where(action: 'read')
collaborator_role.permissions = Permission.where(resource: %w[events enrollments checkins profiles photos]).where.not(action: 'destroy')
participant_role.permissions = Permission.where(resource: 'events', action: 'read')
  .or(Permission.where(resource: 'enrollments', action: %w[read create]))
  .or(Permission.where(resource: 'profiles', action: %w[read update]))
  .or(Permission.where(resource: 'photos', action: %w[read create]))
partner_role.permissions = Permission.where(resource: %w[events partners], action: 'read')

admin = User.find_or_create_by!(email: 'admin@boilerplate.dev') do |user|
  user.name = 'Admin'
  user.encrypted_password = BCrypt::Password.create('Admin1234!')
  user.confirmed_at = Time.current
  user.super_admin = true
end

viewer = User.find_or_create_by!(email: 'viewer@boilerplate.dev') do |user|
  user.name = 'Viewer'
  user.encrypted_password = BCrypt::Password.create('Viewer1234!')
  user.confirmed_at = Time.current
end

UserRole.find_or_create_by!(user: admin, role: admin_role)
UserRole.find_or_create_by!(user: viewer, role: viewer_role)
puts "Seeded #{Role.count} roles and #{Permission.count} permissions"
