class CartItemsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_product, only: [:create]

  def create
    @cart = current_user.cart
    quantity = params[:quantity]&.to_i || 1

    if @product.available? && quantity <= @product.stock
      @cart.add_product(@product, quantity)
      redirect_to cart_path, notice: 'Product added to cart successfully!'
    else
      redirect_to @product, alert: 'Product is not available or insufficient stock.'
    end
  end

  def destroy
    @cart_item = CartItem.find(params[:id])
    @cart_item.destroy
    respond_to do |format|
      format.html { redirect_to cart_path, notice: 'Product removed from cart successfully!' }
      format.turbo_stream { redirect_to cart_path, notice: 'Product removed from cart successfully!' }
    end
  end

  private

  def set_product
    @product = Product.find(params[:product_id])
  end
end
