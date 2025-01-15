class Admin::OrdersController < Admin::BaseController
  before_action :set_order, only: [:show, :edit, :update, :destroy]

  def index
    @orders = Order.includes(:user, :order_items).order(created_at: :desc)
    @orders = @orders.where(status: params[:status]) if params[:status].present?
  end

  def show
    @order = Order.includes(:user, order_items: :product).find(params[:id])
  end

  def new
    @order = Order.new
    @users = User.all
  end

  def create
    @order = Order.new(order_params)
    if @order.save
      redirect_to admin_order_path(@order), notice: 'Order was successfully created.'
    else
      @users = User.all
      render :new
    end
  end

  def edit
    @users = User.all
  end

  def update
    if @order.update(order_params)
      redirect_to admin_order_path(@order), notice: 'Order was successfully updated.'
    else
      render :show
    end
  end

  def destroy
    @order.destroy
    redirect_to admin_orders_path, notice: 'Order was successfully deleted.'
  end

  private

  def set_order
    @order = Order.find(params[:id])
  end

  def order_params
    params.require(:order).permit(:user_id, :total, :status)
  end
end
