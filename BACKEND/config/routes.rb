Rails.application.routes.draw do
  mount Rswag::Api::Engine => '/api-docs'
  mount Rswag::Ui::Engine => '/api-docs'

  namespace :api do
    namespace :v1 do
      post 'auth/register', to: 'auth#register'
      post 'auth/login', to: 'auth#login'
      post 'auth/refresh', to: 'auth#refresh'
      delete 'auth/logout', to: 'auth#logout'
      get 'auth/me', to: 'auth#me'
      get 'auth/google', to: 'oauth#google'
      get 'auth/google/callback', to: 'oauth#callback'

      resources :forms, only: %i[index show create update destroy]
      resources :roles, only: %i[index show create update destroy] do
        member do
          post :assign_permission
          delete :revoke_permission
        end
      end
      resources :users, only: %i[index show update destroy] do
        member do
          post :assign_role
          delete :revoke_role
        end
      end

      resource :profile, only: %i[show update]
      post 'profile/complete_onboarding', to: 'profiles#complete_onboarding'

      resources :events, only: %i[index show create update destroy] do
        member do
          post :publish
          get :participants
          post :gallery_photos
        end
      end

      resources :enrollments, only: %i[index show create destroy] do
        member do
          post :verify
        end
      end

      resources :partners, only: %i[index show create update destroy]
      resources :checkins, only: :create
    end
  end
end
