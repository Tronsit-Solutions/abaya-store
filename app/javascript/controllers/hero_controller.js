import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static values = { interval: Number }

  connect() {
    this.slides = Array.from(this.element.querySelectorAll(".hero-slide"));
    if (this.slides.length === 0) return;

    this.current = 0;
    this.step = 0; // Track which animation to use

    // Available transition modes
    this.modes = [
      "fade",
      "fromLeft",
      "fromRight",
      "fromTop",
      "fromBottom",
      "zoomIn",
      "zoomOut",
      "kenBurnsLeft",
      "kenBurnsRight"
    ];

    this.setup();
    this.start();

    // Enable touch/swipe navigation
    this.bindGestures();

    // Animate hero content on load
    this.animateHeroContent();

    // Parallax/scale on scroll
    this.onScroll = this.handleScroll.bind(this);
    window.addEventListener('scroll', this.onScroll, { passive: true });
  }

  disconnect() {
    if (this.timer) clearInterval(this.timer);
    if (this.onScroll) window.removeEventListener('scroll', this.onScroll);
  }

  setup() {
    this.slides.forEach((slide, index) => {
      Object.assign(slide.style, {
        position: "absolute",
        inset: "0",
        backgroundSize: "cover",
        backgroundPosition: "center",
        transition: "opacity 700ms ease-out, transform 700ms ease-out",
        willChange: "opacity, transform",
        zIndex: index === 0 ? "2" : "1",
        opacity: index === 0 ? "1" : "0",
        transform: "translate3d(0,0,0)"
      });
    });
  }

  start() {
    const intervalMs = this.hasIntervalValue ? this.intervalValue : 5000;
    
    // Clear any existing timer
    if (this.timer) clearInterval(this.timer);
    
    this.timer = setInterval(() => {
      this.next();
    }, intervalMs);
  }

  next() {
    const nextIndex = (this.current + 1) % this.slides.length;
    const mode = this.chooseMode();
    this.transitionTo(nextIndex, mode);
    this.step++;
  }

  prev() {
    const prevIndex = (this.current - 1 + this.slides.length) % this.slides.length;
    const mode = this.chooseMode();
    this.transitionTo(prevIndex, mode);
    this.step++;
  }

  chooseMode() {
    // Rotate through modes but randomize within a window for variety
    const base = this.modes[this.step % this.modes.length];
    // 40% chance to pick a random different mode for extra variety
    if (Math.random() < 0.4) {
      const pool = this.modes.filter(m => m !== base);
      return pool[Math.floor(Math.random() * pool.length)];
    }
    return base;
  }

  transitionTo(nextIndex, mode) {
    if (nextIndex === this.current) return;
    
    const currentEl = this.slides[this.current];
    const nextEl = this.slides[nextIndex];
    
    if (!currentEl || !nextEl) return;

    // Set z-index: next slide on top
    nextEl.style.zIndex = '3';
    currentEl.style.zIndex = '2';

    // Cleanup any animation classes
    currentEl.classList.remove('kenburns-left', 'kenburns-right');
    nextEl.classList.remove('kenburns-left', 'kenburns-right');

    // Default starting state
    nextEl.style.opacity = '1';
    nextEl.style.transformOrigin = '50% 50%';

    // Set initial position based on mode
    switch (mode) {
      case 'fade':
        nextEl.style.transform = 'translate3d(0, 0, 0) scale(1)';
        break;
      case 'fromBottom':
        nextEl.style.transform = 'translate3d(0, 100%, 0)';
        break;
      case 'fromTop':
        nextEl.style.transform = 'translate3d(0, -100%, 0)';
        break;
      case 'fromLeft':
        nextEl.style.transform = 'translate3d(-100%, 0, 0)';
        break;
      case 'fromRight':
        nextEl.style.transform = 'translate3d(100%, 0, 0)';
        break;
      case 'zoomIn':
        nextEl.style.transform = 'scale(1.15)';
        break;
      case 'zoomOut':
        nextEl.style.transform = 'scale(0.85)';
        break;
      case 'kenBurnsLeft':
        nextEl.style.transform = 'scale(1.05)';
        nextEl.classList.add('kenburns-left');
        break;
      case 'kenBurnsRight':
        nextEl.style.transform = 'scale(1.05)';
        nextEl.classList.add('kenburns-right');
        break;
      default:
        nextEl.style.transform = 'translate3d(0, 0, 0)';
    }

    // Force reflow to ensure initial position is applied
    void nextEl.offsetWidth;

    // Animate to final position
    currentEl.style.opacity = '0';
    if (mode === 'zoomIn') {
      nextEl.style.transform = 'scale(1)';
    } else if (mode === 'zoomOut') {
      nextEl.style.transform = 'scale(1)';
    } else if (mode === 'fade' || mode.startsWith('kenBurns')) {
      // keep transform managed by keyframes or none
    } else {
      nextEl.style.transform = 'translate3d(0, 0, 0)';
    }

    // Reset z-indexes after animation completes
    setTimeout(() => {
      this.slides.forEach((slide, index) => {
        slide.style.zIndex = index === nextIndex ? '2' : '1';
      });
      this.current = nextIndex;
      this.animateHeroContent();
    }, 700);
  }

  bindGestures() {
    let touchStartX = 0;
    let touchStartY = 0;
    let isTouching = false;

    const onTouchStart = (e) => {
      isTouching = true;
      const t = e.touches ? e.touches[0] : e;
      touchStartX = t.clientX;
      touchStartY = t.clientY;
      if (this.timer) clearInterval(this.timer);
    };

    const onTouchMove = (e) => {
      if (!isTouching) return;
      // Prevent vertical scroll if horizontal swipe is dominant
      const t = e.touches ? e.touches[0] : e;
      const dx = Math.abs(t.clientX - touchStartX);
      const dy = Math.abs(t.clientY - touchStartY);
      if (dx > dy) {
        e.preventDefault();
      }
    };

    const onTouchEnd = (e) => {
      if (!isTouching) return;
      isTouching = false;
      const t = (e.changedTouches && e.changedTouches[0]) || e;
      const dx = t.clientX - touchStartX;
      const threshold = 40; // px
      if (dx > threshold) {
        this.prev();
      } else if (dx < -threshold) {
        this.next();
      }
      this.start(); // resume auto
    };

    this.element.addEventListener('touchstart', onTouchStart, { passive: false });
    this.element.addEventListener('touchmove', onTouchMove, { passive: false });
    this.element.addEventListener('touchend', onTouchEnd, { passive: true });

    // Basic mouse drag (desktop)
    let mouseDown = false;
    let mouseStartX = 0;
    this.element.addEventListener('mousedown', (e) => {
      mouseDown = true;
      mouseStartX = e.clientX;
      if (this.timer) clearInterval(this.timer);
    });
    this.element.addEventListener('mouseup', (e) => {
      if (!mouseDown) return;
      mouseDown = false;
      const dx = e.clientX - mouseStartX;
      const threshold = 40;
      if (dx > threshold) this.prev();
      else if (dx < -threshold) this.next();
      this.start();
    });
  }

  handleScroll() {
    // Apply a subtle parallax/scale to the active slide based on scroll position
    const active = this.slides[this.current];
    if (!active) return;
    const viewportH = window.innerHeight || 1;
    const rect = this.element.getBoundingClientRect();
    // progress: 0 at top, 1 when hero bottom reaches top of viewport
    const progress = Math.min(1, Math.max(0, (viewportH - rect.top) / (viewportH)));
    const translateY = (progress * -20); // up to -20px
    const scale = 1 + progress * 0.03;   // up to 1.03
    active.style.transform = `translate3d(0, ${translateY}px, 0) scale(${scale})`;
  }

  animateHeroContent() {
    const root = document.getElementById('hero-content');
    if (!root) return;
    const heading = root.querySelector('.hero-heading');
    const sub = root.querySelector('.hero-sub');
    const cta = root.querySelector('.hero-cta');

    [heading, sub, cta].forEach(el => {
      if (!el) return;
      // reset state to allow re-trigger
      el.classList.remove('is-visible');
      // Force reflow to restart animation
      void el.offsetWidth;
    });

    // Stagger visibility
    if (heading) setTimeout(() => heading.classList.add('is-visible'), 20);
    if (sub) setTimeout(() => sub.classList.add('is-visible'), 100);
    if (cta) setTimeout(() => cta.classList.add('is-visible'), 180);
  }
}


