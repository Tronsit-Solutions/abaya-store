class Admin::DashboardController < Admin::BaseController
  def index
    @total_products = Product.count
    @total_customers = User.count
    @total_orders = Order.count
    @pending_orders = Order.pending.count
    @total_revenue = Order.paid.sum(:total)
    @recent_orders = Order.includes(:user).order(created_at: :desc).limit(5)
    @low_stock_products = Product.where('stock < ?', 10)
    @top_products = Product.joins(:order_items)
                          .group('products.id')
                          .order('SUM(order_items.quantity) DESC')
                          .limit(5)
  end

  def reports
    # Date range filtering
    @start_date = params[:start_date].present? ? Date.parse(params[:start_date]) : 30.days.ago
    @end_date = params[:end_date].present? ? Date.parse(params[:end_date]) : Date.today
    
    # Sales Reports
    @orders_in_range = Order.where(created_at: @start_date.beginning_of_day..@end_date.end_of_day)
    @total_revenue = @orders_in_range.where(status: ['paid', 'shipped', 'delivered']).sum(:total)
    @total_orders = @orders_in_range.count
    @average_order_value = @total_orders > 0 ? (@total_revenue / @total_orders.to_f).round(2) : 0
    
    # Revenue by status
    @revenue_by_status = @orders_in_range.group(:status).sum(:total)
    
    # Daily sales data (last 30 days) - simplified
    @daily_sales = Order.where(created_at: 30.days.ago..Date.today)
                        .where(status: ['paid', 'shipped', 'delivered'])
                        .group("DATE(orders.created_at)")
                        .sum(:total)
    
    # Customer Acquisition Data
    @new_customers = User.where(created_at: @start_date.beginning_of_day..@end_date.end_of_day).count
    @total_customers = User.count
    @customer_growth_rate = @total_customers > 0 ? ((@new_customers.to_f / @total_customers) * 100).round(2) : 0
    
    # Top customers
    @top_customers = User.joins(:orders)
                         .where(orders: { created_at: @start_date.beginning_of_day..@end_date.end_of_day })
                         .where(orders: { status: ['paid', 'shipped', 'delivered'] })
                         .group('users.id')
                         .select('users.*, SUM(orders.total) as total_spent, COUNT(orders.id) as order_count')
                         .order('total_spent DESC')
                         .limit(10)
    
    # Product Performance
    @top_selling_products = Product.joins(:order_items)
                                   .joins('INNER JOIN orders ON order_items.order_id = orders.id')
                                   .where(orders: { created_at: @start_date.beginning_of_day..@end_date.end_of_day })
                                   .where(orders: { status: ['paid', 'shipped', 'delivered'] })
                                   .group('products.id')
                                   .select('products.*, SUM(order_items.quantity) as total_sold, SUM(order_items.quantity * order_items.price) as total_revenue')
                                   .order('total_sold DESC')
                                   .limit(10)
    
    @low_performing_products = Product.left_joins(:order_items)
                                      .where('order_items.id IS NULL OR order_items.created_at < ?', @start_date)
                                      .limit(10)
    
    # Product revenue
    @product_revenue = Product.joins(:order_items)
                              .joins('INNER JOIN orders ON order_items.order_id = orders.id')
                              .where(orders: { created_at: @start_date.beginning_of_day..@end_date.end_of_day })
                              .where(orders: { status: ['paid', 'shipped', 'delivered'] })
                              .group('products.id')
                              .select('products.*, SUM(order_items.quantity * order_items.price) as revenue')
                              .order('revenue DESC')
                              .limit(10)
  end
end
