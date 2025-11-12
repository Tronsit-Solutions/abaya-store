class OrdersController < ApplicationController
  before_action :authenticate_user!
  before_action :set_order, only: [:show]
  before_action :set_cart, only: [:checkout, :create]

  def checkout
    if @cart.cart_items.empty?
      redirect_to cart_path, alert: 'Your cart is empty!'
      return
    end
    @cart_items = @cart.cart_items.includes(:product)
  end

  def create
    if @cart.cart_items.empty?
      redirect_to cart_path, alert: 'Your cart is empty!'
      return
    end

    @order = Order.create_from_cart(@cart)
    
    if @order.persisted?
      # Clear the cart after successful order creation
      @cart.clear
      redirect_to order_path(@order), notice: 'Order created successfully!'
    else
      redirect_to checkout_path, alert: 'Failed to create order. Please try again.'
    end
  end

  def show
  end

  private

  def set_cart
    @cart = current_user.cart
  end

  def set_order
    @order = current_user.orders.find(params[:id])
  end
end
