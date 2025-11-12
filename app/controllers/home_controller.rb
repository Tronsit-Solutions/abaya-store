class HomeController < ApplicationController
  def index
    @products = Product.in_stock.includes(image_attachment: :blob).limit(6)
    @trending_products = Product.in_stock.includes(image_attachment: :blob).order(created_at: :desc).limit(4)
    @category_showcases = build_category_showcases
    @active_category = @category_showcases.first
  end

  def category_showcase
    @category_showcases = build_category_showcases
    @active_category = @category_showcases.find { |showcase| showcase[:slug] == params[:slug] } || @category_showcases.first

    respond_to do |format|
      format.turbo_stream do
        render turbo_stream: turbo_stream.morph(
          "category_showcase_panel",
          partial: "home/category_showcase_panel",
          locals: { category: @active_category }
        )
      end

      format.html { redirect_to root_path(anchor: "collections") }
    end
  end

  private

  def build_category_showcases
    collections = Product.in_stock
                         .includes(image_attachment: :blob)
                         .where.not(category: [nil, ""])
                         .order(updated_at: :desc)

    accent_palette = %w[
      from-amber-500 via-orange-400 to-rose-400
      from-purple-500 via-indigo-400 to-sky-400
      from-emerald-500 via-teal-400 to-lime-400
      from-rose-500 via-pink-400 to-amber-400
    ]

    collections.group_by(&:category).map.with_index do |(category_name, products), index|
      hero_product = products.find { |p| p.image.attached? } || products.first
      supporting_products = (products - [hero_product]).first(3)

      {
        name: category_name,
        slug: category_name.parameterize,
        accent: accent_palette[index % accent_palette.length],
        hero_product: hero_product,
        supporting_products: supporting_products,
        total_products: products.size,
        starting_price: products.map(&:price).compact.min,
        updated_at: products.max_by(&:updated_at)&.updated_at
      }
    end.sort_by { |showcase| -showcase[:total_products] }
  end
end
