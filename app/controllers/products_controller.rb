class ProductsController < ApplicationController
  before_action :authenticate_user!, except: [:index, :show]
  before_action :set_product, only: [:show]

  def index
    @products = Product.in_stock
    @products = @products.by_name(params[:search]) if params[:search].present?
    @products = @products.by_category(params[:category]) if params[:category].present?
    # @products = @products.limit(12)
    @categories = Product.in_stock.distinct.pluck(:category).compact.sort
  end

  def show
  end

  private

  def set_product
    @product = Product.find(params[:id])
  end
end
