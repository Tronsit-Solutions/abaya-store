import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  connect() {
    // Form validation and enhancements
    this.element.addEventListener('submit', this.handleSubmit.bind(this));
  }

  handleSubmit(event) {
    // Basic validation
    const form = event.target;
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;

    requiredFields.forEach(field => {
      if (!field.value.trim()) {
        isValid = false;
        field.classList.add('border-red-500');
        field.addEventListener('input', () => {
          field.classList.remove('border-red-500');
        }, { once: true });
      }
    });

    if (!isValid) {
      event.preventDefault();
      // Show error message
      this.showError('Please fill in all required fields.');
    }
  }

  showError(message) {
    // Remove existing error messages
    const existingError = this.element.querySelector('.checkout-error');
    if (existingError) {
      existingError.remove();
    }

    // Create error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'checkout-error bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4';
    errorDiv.textContent = message;
    this.element.insertBefore(errorDiv, this.element.firstChild);
  }
}









