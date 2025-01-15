import { Controller } from "@hotwired/stimulus";

// Auto-submits the form when category dropdown changes
export default class extends Controller {
  submit(event) {
    this.element.requestSubmit();
  }
}

