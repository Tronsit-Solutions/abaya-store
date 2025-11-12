class ProfilesController < ApplicationController
  before_action :authenticate_user!

  def show
    @user = current_user
    @orders = @user.orders
                   .includes(order_items: :product)
                   .order(created_at: :desc)
  end
end

