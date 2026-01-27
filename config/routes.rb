Rails.application.routes.draw do
  devise_for :users, controllers: { sessions: 'sessions' }
  devise_for :admin_users, path: 'admin', path_names: { sign_in: 'login', sign_out: 'logout' }, controllers: { sessions: 'admin/sessions' }

  root "home#index"

  resources :products, only: [:index, :show]

  resource :cart, only: [:show]
  resources :cart_items, only: [:create, :destroy]

  resources :orders, only: [:create, :show]
  get 'checkout', to: 'orders#checkout', as: :checkout

  resource :profile, only: :show

  get 'category_showcase/:slug', to: 'home#category_showcase', as: :category_showcase

  # Admin routes
  namespace :admin do
    root "dashboard#index"
    resources :products
    resources :customers, only: [:index, :show]
    resources :orders
    get 'reports', to: 'dashboard#reports', as: :reports
  end

  namespace :api, defaults: { format: :json } do
    namespace :v1 do
      # Auth
      post   'sign_in',  to: 'sessions#create'
      delete 'sign_out', to: 'sessions#destroy'
      post   'sign_up',  to: 'registrations#create'
      get    'me',       to: 'sessions#me'

      # Resources
      resources :products, only: [:index, :show]
      patch 'products/:id/stock', to: 'products#update_stock'
      resources :cart_items, only: [:create, :destroy, :index]
      resources :orders, only: [:create, :show, :index]
    end
  end

  get "up" => "rails/health#show", as: :rails_health_check
end
