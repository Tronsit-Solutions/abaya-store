class Admin::CustomersController < Admin::BaseController
  def index
    @customers = User.includes(:orders).order(created_at: :desc)
    @customers = @customers.by_name(params[:search]) if params[:search].present?
  end

  def show
    @customer = User.find(params[:id])
    @orders = @customer.orders.includes(:order_items).order(created_at: :desc)
  end
end
