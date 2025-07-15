import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["slide", "indicator", "content", "bgImage", "progressBar"]
  static values = {
    interval: Number,
    autoplay: Boolean
  }

  connect() {
    this.currentIndex = 0
    this.isAnimating = false
    
    // Initial state setup
    this.showSlide(this.currentIndex, true)
    
    if (this.hasAutoplayValue && this.autoplayValue) {
      this.startAutoplay()
    }
  }

  disconnect() {
    this.stopAutoplay()
  }

  next() {
    if (this.isAnimating) return
    this.stopAutoplay()
    this.goToSlide((this.currentIndex + 1) % this.slideTargets.length)
  }

  prev() {
    if (this.isAnimating) return
    this.stopAutoplay()
    this.goToSlide((this.currentIndex - 1 + this.slideTargets.length) % this.slideTargets.length)
  }

  goToSlide(index) {
    if (this.currentIndex === index || this.isAnimating) return
    
    if (index && typeof index === 'object' && index.currentTarget) {
      // Event handler call
      const clickedIndex = parseInt(index.currentTarget.dataset.index)
      this.stopAutoplay()
      this.goToSlide(clickedIndex)
      return
    }

    this.isAnimating = true
    const currentSlide = this.slideTargets[this.currentIndex]
    const nextSlide = this.slideTargets[index]
    
    // Animate OUT current slide
    this.animateSlideOut(currentSlide)
    
    // Animate IN next slide
    this.animateSlideIn(nextSlide)
    
    // Update indicators
    this.updateIndicators(index)
    
    this.currentIndex = index
    
    // Reset animation lock
    setTimeout(() => {
      this.isAnimating = false
    }, 1200) // Match longest transition duration+buffer
  }

  showSlide(index, isInitial = false) {
    const slide = this.slideTargets[index]
    
    // Reset all slides first if initial
    if (isInitial) {
      this.slideTargets.forEach(s => {
        s.classList.add("invisible", "opacity-0")
        s.classList.remove("z-20")
      })
    }
    
    this.animateSlideIn(slide, isInitial)
    this.updateIndicators(index)
  }

  animateSlideIn(slide, immediate = false) {
    slide.classList.remove("invisible")
    slide.classList.add("z-20") // Bring to front
    
    // Base Opacity
    requestAnimationFrame(() => {
      slide.classList.remove("opacity-0")
      
      const content = slide.querySelector('[data-section-slider-target="content"]')
      const bgImage = slide.querySelector('[data-section-slider-target="bgImage"]')
      
      // Reset starting positions
      content.classList.remove("opacity-0", "translate-y-10")
      content.classList.add("translate-y-0")
      
      // Ken Burns Effect (Zoom)
      bgImage.style.transition = "transform 8s ease-out"
      bgImage.style.transform = "scale(1.1)"
      
      // Text stagger effect happens via CSS transition delay on children (if added)
      // or simply the main content block fade up
    })
  }

  animateSlideOut(slide) {
    slide.classList.remove("z-20")
    slide.classList.add("opacity-0") // Fade out
    
    const content = slide.querySelector('[data-section-slider-target="content"]')
    const bgImage = slide.querySelector('[data-section-slider-target="bgImage"]')
    
    content.classList.add("opacity-0", "translate-y-10")
    content.classList.remove("translate-y-0")
    
    // Reset Scale
    bgImage.style.transition = "none"
    bgImage.style.transform = "scale(1.0)"
    
    setTimeout(() => {
      slide.classList.add("invisible")
    }, 1000)
  }

  updateIndicators(index) {
    if (!this.hasIndicatorTarget) return

    this.indicatorTargets.forEach((dot, i) => {
      const fill = dot.querySelector("div") // The inner absolute div
      if (i === index) {
        fill.classList.remove("scale-x-0")
        fill.classList.add("scale-x-100")
      } else {
        fill.classList.remove("scale-x-100")
        fill.classList.add("scale-x-0")
      }
    })
  }

  startAutoplay() {
    // Progress Bar Animation
    if (this.hasProgressBarTarget) {
      this.progressBarTarget.style.transition = "none"
      this.progressBarTarget.style.transform = "scaleX(0)"
      
      requestAnimationFrame(() => {
        this.progressBarTarget.style.transition = `transform ${this.intervalValue}ms linear`
        this.progressBarTarget.style.transform = "scaleX(1)"
      })
    }

    this.autoplayTimer = setInterval(() => {
      this.next()
      
      // Reset Progress Bar
      if (this.hasProgressBarTarget) {
        this.progressBarTarget.style.transition = "none"
        this.progressBarTarget.style.transform = "scaleX(0)"
        requestAnimationFrame(() => {
          this.progressBarTarget.style.transition = `transform ${this.intervalValue}ms linear`
          this.progressBarTarget.style.transform = "scaleX(1)"
        })
      }
    }, this.intervalValue)
  }

  stopAutoplay() {
    if (this.autoplayTimer) {
      clearInterval(this.autoplayTimer)
      this.autoplayTimer = null
    }
    if (this.hasProgressBarTarget) {
      this.progressBarTarget.style.transition = "transform 0.3s ease"
      this.progressBarTarget.style.transform = "scaleX(0)"
    }
  }
}
