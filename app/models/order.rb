class Order < ApplicationRecord
  belongs_to :user
  has_many :order_items, dependent: :destroy
  has_many :products, through: :order_items

  validates :total, presence: true, numericality: { greater_than: 0 }
  validates :status, presence: true, inclusion: { in: %w[pending paid shipped delivered cancelled] }

  scope :pending, -> { where(status: 'pending') }
  scope :paid, -> { where(status: 'paid') }
  scope :shipped, -> { where(status: 'shipped') }
  scope :delivered, -> { where(status: 'delivered') }
  scope :cancelled, -> { where(status: 'cancelled') }

  def self.create_from_cart(cart)
    transaction do
      order = create!(
        user: cart.user,
        total: cart.total_price,
        status: 'pending'
      )

      cart.cart_items.includes(:product).each do |cart_item|
        product = cart_item.product

        # Ensure there is still enough stock at the time of purchase
        raise StandardError, "Insufficient stock for #{product.name}" if cart_item.quantity > product.stock

        order.order_items.create!(
          product: product,
          quantity: cart_item.quantity,
          price: product.price
        )

        # Reduce product stock after successfully creating the order item
        product.reduce_stock(cart_item.quantity)
      end

      order
    end
  end
end
