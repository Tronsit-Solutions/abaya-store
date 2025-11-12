class Api::V1::RegistrationsController < ApplicationController
  protect_from_forgery with: :null_session
  respond_to :json
  
  rescue_from StandardError, with: :render_error_response

  def create
    user = User.new(user_params)
    if user.save
      # Generate JWT token for mobile app using devise-jwt
      _, token = Warden::JWTAuth::UserEncoder.new.call(user, :user, nil)
      
      render json: { 
        success: true,
        message: 'User created successfully',
        token: token,
        user: { id: user.id, email: user.email }
      }, status: :created
    else
      render json: { 
        success: false,
        error: user.errors.full_messages.join(', ') 
      }, status: :unprocessable_entity
    end
  rescue => e
    render_error_response(e)
  end

  private

  def user_params
    params.require(:user).permit(:email, :password, :password_confirmation)
  end

  def render_error_response(exception)
    Rails.logger.error "API Error: #{exception.message}"
    Rails.logger.error exception.backtrace.join("\n")
    render json: { 
      success: false,
      error: 'An error occurred. Please try again.',
      details: Rails.env.development? ? exception.message : nil
    }, status: :internal_server_error
  end
end


