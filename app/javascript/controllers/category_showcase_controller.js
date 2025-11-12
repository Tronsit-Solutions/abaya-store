import { Controller } from "@hotwired/stimulus";
import { Turbo } from "@hotwired/turbo-rails";

export default class extends Controller {
  static targets = ["tab", "panel"];
  static values = { activeSlug: String };

  connect() {
    this.setupIntersectionObserver();
    this.syncInitialState();
  }

  disconnect() {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      this.intersectionObserver = null;
    }
  }

  change(event) {
    event.preventDefault();
    const { slug, url } = event.params;
    const tab = event.currentTarget;

    if (!slug || !url) return;
    if (slug === this.activeSlugValue) {
      this.setActiveTab(tab);
      return;
    }

    this.setLoadingState(tab, true);
    this.fetchCategory(url, slug, tab);
  }

  async fetchCategory(url, slug, tab) {
    try {
      if (this.hasPanelTarget) {
        this.panelTarget.classList.add("morphing-in");
      }

      const response = await fetch(url, {
        headers: {
          "Accept": "text/vnd.turbo-stream.html"
        },
        credentials: "same-origin"
      });

      if (!response.ok) throw new Error(`Request failed with ${response.status}`);

      const body = await response.text();
      Turbo.renderStreamMessage(body);

      this.activeSlugValue = slug;
      this.setActiveTab(tab);
      this.animateIn();
      this.setupIntersectionObserver(); // re-bind new elements
    } catch (error) {
      console.error("Category showcase request failed", error);
      this.flashError("Unable to load collection. Please try again.");
    } finally {
      this.setLoadingState(tab, false);
      if (this.hasPanelTarget) {
        setTimeout(() => this.panelTarget.classList.remove("morphing-in"), 350);
      }
    }
  }

  setupIntersectionObserver() {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }

    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          this.intersectionObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    this.observeScrollElements();
  }

  observeScrollElements() {
    if (!this.intersectionObserver) return;

    this.element.querySelectorAll(".category-scroll-trigger").forEach((el) => {
      this.intersectionObserver.observe(el);
    });
  }

  syncInitialState() {
    const active = this.tabTargets.find(tab => tab.dataset.state === "active");
    if (active) this.activeSlugValue = active.dataset.categoryShowcaseSlugParam;
  }

  setActiveTab(activeTab) {
    this.tabTargets.forEach(tab => {
      const isActive = tab === activeTab;
      tab.dataset.state = isActive ? "active" : "inactive";
      tab.setAttribute("aria-selected", isActive ? "true" : "false");
    });
  }

  animateIn() {
    if (!this.hasPanelTarget) return;
    // Panel will animate via CSS morph-fade-in
  }

  setLoadingState(tab, isLoading) {
    if (!tab) return;
    if (isLoading) {
      tab.dataset.loading = "true";
      tab.classList.add("ring-2", "ring-amber-400", "ring-offset-2");
    } else {
      tab.dataset.loading = "false";
      tab.classList.remove("ring-2", "ring-amber-400", "ring-offset-2");
    }
  }

  flashError(message) {
    window.dispatchEvent(new CustomEvent("toast:show", { detail: { message, type: "error" } }));
  }
}

