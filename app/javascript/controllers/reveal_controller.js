import { Controller } from "@hotwired/stimulus";

// Adds fade-in-up animations with stagger using IntersectionObserver
export default class extends Controller {
  static targets = ["item"]
  static values = {
    baseDelay: { type: Number, default: 0 },
    step: { type: Number, default: 100 },
    duration: { type: Number, default: 600 }
  }

  connect() {
    this.items = this.itemTargets.length ? this.itemTargets : Array.from(this.element.children);
    this.items.forEach(el => {
      el.classList.add('reveal-initial');
      el.style.animationDuration = `${this.durationValue}ms`;
    });
    this.observer = new IntersectionObserver(this.onIntersect.bind(this), { threshold: 0.15 });
    this.items.forEach(el => this.observer.observe(el));
  }

  disconnect() {
    if (this.observer) this.observer.disconnect();
  }

  onIntersect(entries) {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const index = this.items.indexOf(el);
      const delay = this.baseDelayValue + this.stepValue * (index >= 0 ? index : 0);
      el.style.animationDelay = `${delay}ms`;
      el.classList.add('reveal-visible');
      this.observer.unobserve(el);
    });
  }
}


