class ApplicationController < ActionController::Base
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern
  
  # Configure Devise to use the User model by default
  before_action :configure_permitted_parameters, if: :devise_controller?
  before_action :set_nav_categories
  
  private
  
  def set_nav_categories
    @nav_categories = Product.in_stock.distinct.pluck(:category).compact.sort
  end
  
  protected
  
  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up, keys: [:email, :password, :password_confirmation])
    devise_parameter_sanitizer.permit(:sign_in, keys: [:email, :password, :remember_me])
    devise_parameter_sanitizer.permit(:account_update, keys: [:email, :password, :password_confirmation, :current_password])
  end
end
