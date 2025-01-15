class Cart < ApplicationRecord
  belongs_to :user
  has_many :cart_items, dependent: :destroy
  has_many :products, through: :cart_items

  def total_price
    cart_items.sum { |item| item.product.price * item.quantity }
  end

  def total_items
    cart_items.sum(:quantity)
  end

  def add_product(product, quantity = 1)
    cart_item = cart_items.find_by(product: product)
    if cart_item
      cart_item.update!(quantity: cart_item.quantity + quantity)
    else
      cart_items.create!(product: product, quantity: quantity)
    end
  end

  def remove_product(product)
    cart_items.find_by(product: product)&.destroy
  end

  def clear
    cart_items.destroy_all
  end
end
