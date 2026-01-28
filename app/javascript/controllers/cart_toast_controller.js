import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
    static values = { message: String, type: { type: String, default: 'success' } }

    connect() {
        const message = this.element.dataset.message || "Added to cart";
        const type = this.element.dataset.type || "success";

        window.dispatchEvent(new CustomEvent('toast:show', {
            detail: { message, type }
        }));

        // Remove self after triggering
        this.element.remove();
    }
}
