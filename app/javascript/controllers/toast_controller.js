import { Controller } from "@hotwired/stimulus";

// Listens for window 'toast:show' events and renders toasts
export default class extends Controller {
  connect() {
    this.onShow = this.handleShow.bind(this);
    window.addEventListener('toast:show', this.onShow);
  }

  disconnect() {
    window.removeEventListener('toast:show', this.onShow);
  }

  handleShow(event) {
    const { message, type = 'success', duration = 2500 } = event.detail || {};
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message || 'Action completed';
    this.element.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translate3d(0, -10px, 0)';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
}


