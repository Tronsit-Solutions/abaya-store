class Api::V1::SessionsController < ApplicationController
  protect_from_forgery with: :null_session
  respond_to :json
  
  rescue_from StandardError, with: :render_error_response
  
  before_action :authenticate_user!, only: [:destroy, :me]

  def create
    user = User.find_by(email: params.dig(:user, :email))
    
    if user&.valid_password?(params.dig(:user, :password))
      # Let Devise + devise-jwt generate the token via Warden.
      # Use explicit scope so Warden hooks (including JWT) run correctly.
      sign_in(:user, user)

      # devise-jwt stores the generated token in the Rack env
      token = request.env['warden-jwt_auth.token']

      unless token.is_a?(String) && token.present?
        Rails.logger.error "JWT token not present in warden env. Env value: #{request.env['warden-jwt_auth.token'].inspect}"
        raise "JWT token generation failed: token missing from warden env"
      end
      
      render json: { 
        success: true,
        message: 'Signed in successfully',
        token: token,  # The actual JWT string from devise-jwt
        user: { id: user.id, email: user.email }
      }
    else
      render json: { 
        success: false, 
        error: 'Invalid email or password' 
      }, status: :unauthorized
    end
  rescue => e
    render_error_response(e)
  end

  def destroy
    sign_out(current_user)
    render json: { message: 'Signed out successfully' }
  end

  def me
    render json: { 
      user: { 
        id: current_user.id, 
        email: current_user.email 
      } 
    }
  end

  private

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