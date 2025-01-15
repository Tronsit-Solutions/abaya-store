class Product < ApplicationRecord
  has_many :cart_items, dependent: :destroy
  has_many :order_items, dependent: :destroy
  has_one_attached :image

  validates :name, presence: true
  validates :price, presence: true, numericality: { greater_than: 0 }
  validates :stock, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :description, presence: true

  scope :in_stock, -> { where('stock > 0') }
  scope :by_name, ->(name) { where('name ILIKE ?', "%#{name}%") }
  scope :by_category, ->(category) { category.present? ? where(category: category) : all }

  def available?
    stock > 0
  end

  def reduce_stock(quantity)
    update!(stock: stock - quantity)
  end
end
