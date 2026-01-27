class Api::V1::OrdersController < Api::V1::BaseController
  # skip_before_action :authenticate_user!
  # before_action :require_api_auth!
  def index
    @orders = current_user.orders.includes(:order_items, :products)
    
    render_json_response({
      orders: @orders.map { |order| order_json(order) }
    })
  end

  def create
    items_attrs = order_params[:order_items_attributes]

    if items_attrs.blank?
      render_json_response({ error: 'No order items provided' }, :unprocessable_entity)
      return
    end
    ActiveRecord::Base.transaction do
      total = 0

      @order = Order.create!(
        user: current_user,
        status: 'pending',
        total: params[:order][:total]
      )

      items_attrs.each do |item_attrs|
        product = Product.find(item_attrs[:product_id])
        quantity = item_attrs[:quantity].to_i

        raise StandardError, "Quantity must be greater than 0" if quantity <= 0
        raise StandardError, "Insufficient stock for #{product.name}" if quantity > product.stock

        price = product.price

        @order.order_items.create!(
          product: product,
          quantity: quantity,
          price: price
        )

        # Reduce stock after creating the order item
        product.reduce_stock(quantity) if product.respond_to?(:reduce_stock)

        total += price * quantity
      end

      # @order.update!(total: total)
    end

    render_json_response({
      message: 'Order created successfully',
      order: order_json(@order)
    }, :created)
  rescue ActiveRecord::RecordNotFound => e
    render_json_response({ error: e.message }, :not_found)
  rescue StandardError => e
    render_json_response({ error: e.message }, :unprocessable_entity)
  end

  def show
    @order = current_user.orders.find(params[:id])
    render_json_response(order_json(@order))
  end

  private

  def order_params
    params.require(:order).permit(
      order_items_attributes: [:product_id, :quantity, :price, :product_name, :product_description]
    )
  end

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

