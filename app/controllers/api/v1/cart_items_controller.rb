class Api::V1::CartItemsController < Api::V1::BaseController
  def index
    @cart = current_user.cart
    @cart_items = @cart.cart_items.includes(:product)
    
    render_json_response({
      cart_items: @cart_items.map { |item| cart_item_json(item) },
      total_price: @cart.total_price,
      total_items: @cart.total_items
    })
  end

  def create
    @cart = current_user.cart
    @product = Product.find(params[:product_id])
    quantity = params[:quantity]&.to_i || 1

    if @product.available? && quantity <= @product.stock
      @cart.add_product(@product, quantity)
      render_json_response({
        message: 'Product added to cart successfully',
        cart_item: cart_item_json(@cart.cart_items.find_by(product: @product))
      })
    else
      render_error_response('Product is not available or insufficient stock')
    end
  end

  def destroy
    @cart_item = current_user.cart.cart_items.find(params[:id])
    @cart_item.destroy
    render_json_response({ message: 'Product removed from cart successfully' })
  end

  private

  def cart_item_json(cart_item)
    {
      id: cart_item.id,
      quantity: cart_item.quantity,
      total_price: cart_item.total_price,
      product: {
        id: cart_item.product.id,
        name: cart_item.product.name,
        price: cart_item.product.price,
        image_url: cart_item.product.image.attached? ? url_for(cart_item.product.image) : nil
      }
    }
  end
end


