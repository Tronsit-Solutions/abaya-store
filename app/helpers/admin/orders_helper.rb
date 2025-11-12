module Admin::OrdersHelper
  def order_status_class(status)
    case status
    when 'pending'
      'bg-yellow-100 text-yellow-800'
    when 'paid'
      'bg-blue-100 text-blue-800'
    when 'shipped'
      'bg-purple-100 text-purple-800'
    when 'delivered'
      'bg-green-100 text-green-800'
    when 'cancelled'
      'bg-red-100 text-red-800'
    else
      'bg-gray-100 text-gray-800'
    end
  end
end
