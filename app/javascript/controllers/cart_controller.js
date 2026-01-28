import { Controller } from "@hotwired/stimulus";

// Dispatches a toast when user adds to cart
export default class extends Controller {
  static values = { message: String }

  add(event) {
    // Toast now handled by Turbo Stream response for accuracy
  }
}


