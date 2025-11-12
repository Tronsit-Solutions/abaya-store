import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["slide", "indicator", "prevButton", "nextButton"]
  static values = { 
    interval: { type: Number, default: 5000 },
    autoplay: { type: Boolean, default: true }
  }

  connect() {
    this.currentIndex = 0;
    this.slides = this.slideTargets;
    if (this.slides.length === 0) return;

    this.showSlide(0);
    
    if (this.autoplayValue) {
      this.startAutoplay();
    }

    // Touch/swipe support
    this.setupTouchEvents();
  }

  disconnect() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  showSlide(index) {
    if (index < 0) index = this.slides.length - 1;
    if (index >= this.slides.length) index = 0;

    this.currentIndex = index;

    // Hide all slides
    this.slides.forEach((slide, i) => {
      slide.classList.remove('active');
      slide.classList.add('inactive');
    });

    // Show current slide
    this.slides[index].classList.remove('inactive');
    this.slides[index].classList.add('active');

    // Update indicators
    if (this.hasIndicatorTarget) {
      this.indicatorTargets.forEach((indicator, i) => {
        if (i === index) {
          indicator.classList.add('active');
        } else {
          indicator.classList.remove('active');
        }
      });
    }
  }

  next() {
    this.showSlide(this.currentIndex + 1);
    if (this.autoplayValue) {
      this.resetAutoplay();
    }
  }

  prev() {
    this.showSlide(this.currentIndex - 1);
    if (this.autoplayValue) {
      this.resetAutoplay();
    }
  }

  goToSlide(event) {
    const index = parseInt(event.currentTarget.dataset.index);
    if (!isNaN(index)) {
      this.showSlide(index);
      if (this.autoplayValue) {
        this.resetAutoplay();
      }
    }
  }

  startAutoplay() {
    this.timer = setInterval(() => {
      this.next();
    }, this.intervalValue);
  }

  resetAutoplay() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    if (this.autoplayValue) {
      this.startAutoplay();
    }
  }

  setupTouchEvents() {
    let startX = 0;
    let endX = 0;

    this.element.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
    }, { passive: true });

    this.element.addEventListener('touchend', (e) => {
      endX = e.changedTouches[0].clientX;
      const diff = startX - endX;

      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          this.next();
        } else {
          this.prev();
        }
      }
    }, { passive: true });
  }
}

