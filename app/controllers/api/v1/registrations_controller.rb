class Api::V1::RegistrationsController < ApplicationController
  protect_from_forgery with: :null_session
  respond_to :json
  
  rescue_from StandardError, with: :render_error_response

  def create
    user = User.new(user_params)
    if user.save
      # Generate JWT token for mobile app using devise-jwt
      jwt_token_string = generate_jwt_token(user)
      
      # Ensure token is a string and log for debugging
      unless jwt_token_string.is_a?(String)
        Rails.logger.error "JWT token is not a string. Type: #{jwt_token_string.class}, Value: #{jwt_token_string.inspect}"
        raise "JWT token generation failed: expected string, got #{jwt_token_string.class}"
      end
      
      Rails.logger.info "JWT token generated successfully. Token length: #{jwt_token_string.length}"
      
      render json: { 
        success: true,
        message: 'User created successfully',
        token: jwt_token_string,  # The actual JWT string, not decoded payload
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

  def generate_jwt_token(user)
    # Generate JWT token using devise-jwt
    # Try using Warden::JWTAuth::UserEncoder first
    begin
      result = Warden::JWTAuth::UserEncoder.new.call(user, :user, nil)
      
      # Handle different return formats
      if result.is_a?(Array)
        payload, token_string = result
        Rails.logger.debug "Encoder returned array. Payload: #{payload.class}, Token: #{token_string.class}"
      else
        token_string = result
        Rails.logger.debug "Encoder returned single value: #{result.class}"
      end
      
      # If we got a valid string token, return it
      return token_string if token_string.is_a?(String)
    rescue => e
      Rails.logger.warn "Warden encoder failed: #{e.message}. Falling back to direct JWT encoding."
    end
    
    # Fallback: generate token directly using JWT.encode
    # This matches the format that devise-jwt uses
    payload = {
      sub: user.id.to_s,
      exp: (Time.now + 24.hours).to_i,
      scp: 'user'
    }
    
    token_string = JWT.encode(payload, Rails.application.secret_key_base, 'HS256')
    Rails.logger.info "Generated token directly using JWT.encode"
    
    token_string
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


