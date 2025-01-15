class Api::V1::ProductsController < Api::V1::BaseController
  skip_before_action :set_current_api_user
  def index
    @products = Product.in_stock
    @products = @products.by_name(params[:search]) if params[:search].present?
    @products = @products.page(params[:page]).per(params[:per_page] || 12)
    
    render_json_response({
      products: @products.map { |product| product_json(product) },
      pagination: {
        current_page: @products.current_page,
        total_pages: @products.total_pages,
        total_count: @products.total_count
      }
    })
  end

  def show
    @product = Product.find(params[:id])
    render_json_response(product_json(@product))
  end

  private

  def product_json(product)
    {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      available: product.available?,
      image_url: product.image.attached? ? url_for(product.image) : nil,
      created_at: product.created_at,
      updated_at: product.updated_at
    }
  end
end
