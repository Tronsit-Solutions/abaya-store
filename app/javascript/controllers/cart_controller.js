import { Controller } from "@hotwired/stimulus";

// Dispatches a toast when user adds to cart
export default class extends Controller {
  static values = { message: String }

  add(event) {
    // Let the request proceed; just show a toast immediately
    const msg = this.hasMessageValue ? this.messageValue : 'Added to cart';
    window.dispatchEvent(new CustomEvent('toast:show', { detail: { message: msg, type: 'success' } }));
  }
}


