class Api::V1::BaseController < ApplicationController
  protect_from_forgery with: :null_session
  respond_to :json
  
  rescue_from StandardError, with: :render_error_response
  before_action :set_current_api_user

  private

  def set_current_api_user
    @current_api_user = authenticate_from_token
  end

  def require_api_auth!
    render json: { error: 'Unauthorized' }, status: :unauthorized unless @current_api_user
  end

  def authenticate_from_token
    token = request.headers['Authorization'].split(' ').last
    return nil unless token
    
    payload = Warden::JWTAuth::TokenDecoder.new.call(token)
    User.find(payload['sub'])
  rescue => e
    nil
  end

  def current_api_user
    @current_api_user
  end

  def render_json_response(data, status = :ok)
    render json: data, status: status
  end

  def render_error_response(exception)
    Rails.logger.error "API Error: #{exception.message}"
    Rails.logger.error exception.backtrace.join("\n")
    render json: { 
      error: 'An error occurred. Please try again.',
      details: Rails.env.development? ? exception.message : nil
    }, status: :internal_server_error
  end
end
