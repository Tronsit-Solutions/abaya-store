class Api::V1::BaseController < ActionController::API
  include Devise::Controllers::Helpers

  # All API v1 endpoints require an authenticated user
  # (controllers can override/skip this when needed)
  before_action :authenticate_user!
  respond_to :json
  
  rescue_from StandardError, with: :render_error_response

  private

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
