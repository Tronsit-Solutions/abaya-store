import { Controller } from "@hotwired/stimulus";

// Controls horizontal scrolling feeds and coordinates slide-up reveal of the next section
export default class extends Controller {
  static targets = ["scroller", "nextSection"]

  connect() {
    // Find next feed section (sibling with .feed-section class)
    if (!this.hasNextSectionTarget) {
      let next = this.element.nextElementSibling;
      while (next && !next.classList.contains('feed-section')) {
        next = next.nextElementSibling;
      }
      if (next) {
        this.nextSection = next;
      }
    }
    
    // Wire horizontal scroll for the image carousel
    if (this.hasScrollerTarget) {
      this.onHorizontalScroll = this.handleHorizontalScroll.bind(this);
      this.scrollerTarget.addEventListener("scroll", this.onHorizontalScroll, { passive: true });
    }
    
    // Wire vertical scroll for the entire section to trigger next section
    if (this.hasNextSectionTarget || this.nextSection) {
      this.onVerticalScroll = this.handleVerticalScroll.bind(this);
      this.element.addEventListener("scroll", this.onVerticalScroll, { passive: true });
      // Also listen to window scroll when this section is in view
      this.onWindowScroll = this.handleWindowScroll.bind(this);
      window.addEventListener("scroll", this.onWindowScroll, { passive: true });
    }
    
    // Intersection-based reveal when section enters viewport
    this.setupIntersection();
  }

  disconnect() {
    if (this.onHorizontalScroll && this.hasScrollerTarget) {
      this.scrollerTarget.removeEventListener("scroll", this.onHorizontalScroll);
    }
    if (this.onVerticalScroll) {
      this.element.removeEventListener("scroll", this.onVerticalScroll);
    }
    if (this.onWindowScroll) {
      window.removeEventListener("scroll", this.onWindowScroll);
    }
    if (this.observer) this.observer.disconnect();
  }

  handleHorizontalScroll() {
    // Horizontal scroll in the image carousel - can trigger subtle effects if needed
    const el = this.scrollerTarget;
    if (!el) return;
    // Could add effects here if needed
  }

  handleVerticalScroll() {
    // Vertical scroll within the section
    this.checkScrollPosition();
  }

  handleWindowScroll() {
    // Window scroll - check if we're scrolling down in this section
    this.checkScrollPosition();
  }

  checkScrollPosition() {
    const nextSection = this.hasNextSectionTarget ? this.nextSectionTarget : this.nextSection;
    if (!nextSection) return;

    const rect = this.element.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    // If section is in view and scrolled down (bottom of section is visible)
    if (rect.top < windowHeight && rect.bottom > windowHeight * 0.5) {
      // Check how much of the section has been scrolled
      const scrollProgress = Math.min(1, (windowHeight - rect.top) / (windowHeight * 0.8));
      
      if (scrollProgress > 0.3) {
        // Trigger slide-up animation on next section
        if (!nextSection.classList.contains("section-slide-up")) {
          nextSection.classList.add("section-slide-up");
        }
      }
    }
  }

  setupIntersection() {
    const section = this.element;
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          section.classList.add("section-revealed");
        }
      });
    }, { threshold: 0.25 });
    this.observer.observe(section);
  }
}


