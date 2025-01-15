import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["card"];

  connect() {
    this.setupScrollListener();
    this.updateStack();
  }

  disconnect() {
    if (this.scrollHandler) {
      window.removeEventListener("scroll", this.scrollHandler, { passive: true });
    }
  }

  setupScrollListener() {
    this.scrollHandler = this.throttle(() => {
      this.updateStack();
    }, 100);

    window.addEventListener("scroll", this.scrollHandler, { passive: true });
    this.updateStack(); // Initial update
  }

  updateStack() {
    const viewportHeight = window.innerHeight;
    const scrollY = window.scrollY;
    const containerTop = this.element.getBoundingClientRect().top + scrollY;

    this.cardTargets.forEach((card, index) => {
      const cardRect = card.getBoundingClientRect();
      const cardTop = cardRect.top + scrollY;
      const cardHeight = cardRect.height;
      const cardCenter = cardTop + cardHeight / 2;
      
      // Calculate distance from viewport center
      const viewportCenter = scrollY + viewportHeight / 2;
      const distanceFromCenter = Math.abs(cardCenter - viewportCenter);
      const maxDistance = viewportHeight;
      
      // Calculate progress: 0 when far away, 1 when at center
      const progress = 1 - Math.min(distanceFromCenter / maxDistance, 1);
      
      // Determine state based on position
      const isActive = progress > 0.4;
      const isPassed = cardCenter < viewportCenter - viewportHeight * 0.3;
      const isUpcoming = cardCenter > viewportCenter + viewportHeight * 0.3;

      // Update z-index: active card gets highest z-index, then upcoming cards stack below
      if (isActive) {
        // Active card is always on top
        card.style.zIndex = String(200);
        card.dataset.state = "active";
      } else if (isPassed) {
        // Passed cards go behind, with later cards behind earlier ones
        card.style.zIndex = String(50 + index);
        card.dataset.state = "passed";
      } else {
        // Upcoming cards stack with higher index cards on top
        card.style.zIndex = String(100 + index);
        card.dataset.state = "upcoming";
      }

      // Apply transform and opacity
      if (isActive) {
        const scale = 0.92 + progress * 0.08; // Scale from 0.92 to 1.0
        card.style.transform = `scale(${scale}) translateY(0)`;
        card.style.opacity = String(0.8 + progress * 0.2);
      } else if (isPassed) {
        card.style.transform = "scale(0.88) translateY(0)";
        card.style.opacity = "0.6";
      } else {
        const upcomingProgress = Math.max(0, (viewportCenter - cardTop) / viewportHeight);
        const scale = 0.85 + upcomingProgress * 0.05;
        const translateY = 30 * (1 - upcomingProgress);
        card.style.transform = `scale(${scale}) translateY(${translateY}px)`;
        card.style.opacity = String(0.4 + upcomingProgress * 0.2);
      }
    });
  }

  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
}

