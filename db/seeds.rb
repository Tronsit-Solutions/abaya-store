# Create admin user
admin_user = AdminUser.find_or_create_by!(email: 'admin@dasclub.com') do |user|
  user.password = 'password123'
  user.password_confirmation = 'password123'
end

puts "Created admin user: #{admin_user.email}"

# Create sample abaya products
products = [
  {
    name: "Classic Black Abaya",
    description: "Timeless elegance in premium black fabric. This classic abaya features a flowing silhouette with delicate embroidery details and comfortable fit for everyday wear.",
    price: 89.99,
    stock: 25
  },
  {
    name: "Embroidered Navy Abaya",
    description: "Sophisticated navy blue abaya with intricate gold embroidery. Perfect for special occasions, featuring a modern cut with traditional embellishments.",
    price: 129.99,
    stock: 15
  },
  {
    name: "Casual Beige Abaya",
    description: "Light and comfortable beige abaya ideal for daily wear. Made from breathable fabric with a relaxed fit and subtle design elements.",
    price: 79.99,
    stock: 30
  },
  {
    name: "Luxury Maroon Abaya",
    description: "Rich maroon abaya with premium fabric and elegant draping. Features sophisticated details and perfect for evening events and formal occasions.",
    price: 159.99,
    stock: 12
  },
  {
    name: "Modern Gray Abaya",
    description: "Contemporary gray abaya with clean lines and modern silhouette. Versatile design that transitions seamlessly from day to evening wear.",
    price: 99.99,
    stock: 20
  },
  {
    name: "Floral Embroidered Abaya",
    description: "Beautiful floral embroidered abaya in soft pastel colors. Delicate handcrafted details make this piece perfect for spring and summer occasions.",
    price: 139.99,
    stock: 18
  },
  {
    name: "Oversized Comfort Abaya",
    description: "Ultra-comfortable oversized abaya designed for maximum comfort. Perfect for home wear and casual outings with a relaxed, flowing design.",
    price: 69.99,
    stock: 35
  },
  {
    name: "Designer Silk Abaya",
    description: "Premium silk abaya with luxurious feel and elegant drape. Hand-finished details and sophisticated design make this a statement piece for special events.",
    price: 199.99,
    stock: 8
  }
]

products.each do |product_attrs|
  Product.find_or_create_by!(name: product_attrs[:name]) do |product|
    product.description = product_attrs[:description]
    product.price = product_attrs[:price]
    product.stock = product_attrs[:stock]
  end
end

puts "Created #{Product.count} abaya products"
