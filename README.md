# Das Club - E-commerce Application

A modern, responsive e-commerce application built with Ruby on Rails and Tailwind CSS.

## Features

- **User Authentication**: Sign up and sign in functionality using Devise
- **Product Management**: Browse products with search functionality
- **Shopping Cart**: Add/remove products from cart
- **Order Management**: Checkout and order confirmation
- **Responsive Design**: Mobile-friendly interface with beige background and brownish-black text
- **API Endpoints**: RESTful API for all functionality

## Tech Stack

- Ruby on Rails 8.0
- SQLite3 Database
- Tailwind CSS for styling
- Devise for authentication
- Active Storage for image uploads
- Stimulus for JavaScript interactions

## Getting Started

### Prerequisites

- Ruby 3.0 or higher
- Rails 8.0
- SQLite3

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   bundle install
   ```

3. Set up the database:
   ```bash
   rails db:migrate
   rails db:seed
   ```

4. Start the server:
   ```bash
   rails server
   ```

5. Visit `http://localhost:3000` in your browser

### Sample Data

The application comes with 8 sample products including coffee beans, mugs, tea collections, and more.

## API Endpoints

### Products
- `GET /api/v1/products` - List all products
- `GET /api/v1/products/:id` - Get product details

### Cart Items
- `GET /api/v1/cart_items` - Get cart items (requires authentication)
- `POST /api/v1/cart_items` - Add item to cart (requires authentication)
- `DELETE /api/v1/cart_items/:id` - Remove item from cart (requires authentication)

### Orders
- `GET /api/v1/orders` - Get user orders (requires authentication)
- `POST /api/v1/orders` - Create new order (requires authentication)
- `GET /api/v1/orders/:id` - Get order details (requires authentication)

## Usage

1. **Browse Products**: Visit the home page or products page to see available items
2. **Sign Up/In**: Create an account or sign in to add items to cart
3. **Add to Cart**: Click "Add to Cart" on any product
4. **View Cart**: Click "Cart" in the navigation to see your items
5. **Checkout**: Click "Proceed to Checkout" to create an order

## Design

The application features a clean, modern design with:
- Beige background (#F5F5DC)
- Brownish-black text (#2C1810)
- Amber accent colors
- Responsive grid layouts
- Card-based product displays
- Smooth hover animations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is open source and available under the MIT License.
