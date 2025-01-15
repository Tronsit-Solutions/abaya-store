import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["panel", "button"];
  static values = {
    open: { type: Boolean, default: false }
  };

  connect() {
    this.handleOutsideClick = this.handleOutsideClick.bind(this);
    this.close();
  }

  open() {
    this.openValue = true;
    this.showPanel();
    this.updateAria(true);
    // Use setTimeout to avoid immediate closure from the button click
    setTimeout(() => {
      document.addEventListener("click", this.handleOutsideClick);
    }, 0);
  }

  close() {
    this.openValue = false;
    this.hidePanel();
    this.updateAria(false);
    document.removeEventListener("click", this.handleOutsideClick);
  }

  handleOutsideClick(event) {
    // Don't close if clicking inside the dropdown element or the button
    const isClickInside = this.element.contains(event.target);
    const isButtonClick = this.hasButtonTarget && this.buttonTarget.contains(event.target);
    
    if (!isClickInside && !isButtonClick) {
      this.close();
    }
  }

  toggle(event) {
    event.preventDefault();
    event.stopPropagation();
    if (this.openValue) {
      this.close();
    } else {
      this.open();
    }
  }

  showPanel() {
    if (!this.hasPanelTarget) return;
    this.panelTarget.classList.remove("hidden", "opacity-0", "translate-y-2");
    this.panelTarget.classList.add("opacity-100", "translate-y-0");
  }

  hidePanel() {
    if (!this.hasPanelTarget) return;
    this.panelTarget.classList.remove("opacity-100", "translate-y-0");
    this.panelTarget.classList.add("opacity-0", "translate-y-2");
    setTimeout(() => {
      if (!this.openValue) {
        this.panelTarget.classList.add("hidden");
      }
    }, 150);
  }

  updateAria(expanded) {
    if (this.hasButtonTarget) {
      this.buttonTarget.setAttribute("aria-expanded", expanded);
    }
  }
}

