import { Controller } from "@hotwired/stimulus";

// Handles cart items list animations and interactions
export default class extends Controller {
  connect() {
    // Add click handlers to remove buttons for fade-out animation
    this.element.querySelectorAll('a[data-turbo-method="delete"]').forEach(link => {
      link.addEventListener('click', this.handleRemoveClick.bind(this));
    });
  }

  handleRemoveClick(event) {
    const cartItem = event.target.closest('.cart-item');
    if (cartItem) {
      // Add fade-out animation
      cartItem.style.transition = 'opacity 300ms ease-out, transform 300ms ease-out';
      cartItem.style.opacity = '0';
      cartItem.style.transform = 'translateX(-20px)';
    }
  }
}

