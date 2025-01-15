class Api::V1::OrdersController < Api::V1::BaseController
  def index
    @orders = current_user.orders.includes(:order_items, :products)
    
    render_json_response({
      orders: @orders.map { |order| order_json(order) }
    })
  end

  def create
    @cart = current_user.cart
    
    if @cart.cart_items.empty?
      render_error_response('Your cart is empty!')
      return
    end

    @order = Order.create_from_cart(@cart)
    
    if @order.persisted?
      @cart.clear
      render_json_response({
        message: 'Order created successfully',
        order: order_json(@order)
      })
    else
      render_error_response('Failed to create order. Please try again.')
    end
  end

  def show
    @order = current_user.orders.find(params[:id])
    render_json_response(order_json(@order))
  end

  private

  def order_json(order)
    {
      id: order.id,
      total: order.total,
      status: order.status,
      created_at: order.created_at,
      updated_at: order.updated_at,
      order_items: order.order_items.map { |item| order_item_json(item) }
    }
  end

  def order_item_json(order_item)
    {
      id: order_item.id,
      quantity: order_item.quantity,
      price: order_item.price,
      total_price: order_item.total_price,
      product: {
        id: order_item.product.id,
        name: order_item.product.name,
        image_url: order_item.product.image.attached? ? url_for(order_item.product.image) : nil
      }
    }
  end
end


