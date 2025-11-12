import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["input", "image", "placeholder", "filename", "removeToggle"]
  static values = {
    originalSrc: String,
    originalFilename: String
  }

  connect() {
    // Persist the original image state for toggling removal on/off
    if (!this.hasOriginalSrcValue && this.hasImageTarget) {
      const existingSrc = this.imageTarget.dataset.originalSrc
      if (existingSrc) {
        this.originalSrcValue = existingSrc
      }
    }

    if (!this.hasOriginalFilenameValue && this.hasFilenameTarget) {
      const existingName = this.filenameTarget.dataset.originalFilename
      if (existingName) {
        this.originalFilenameValue = existingName
      }
    }
  }

  preview(event) {
    const file = event.target.files?.[0]

    if (!file) {
      this.reset()
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      this.showImage(e.target?.result)
      this.updateFilename(file.name)
      this.uncheckRemoval()
    }
    reader.readAsDataURL(file)
  }

  toggleRemoval(event) {
    if (event.target.checked) {
      this.clearInput()
      this.hideImage()
      this.updateFilename("No image selected")
    } else {
      this.restoreOriginal()
    }
  }

  // Private helpers

  showImage(src) {
    if (this.hasImageTarget && typeof src === "string") {
      this.imageTarget.src = src
      this.imageTarget.classList.remove("hidden")
    }
    if (this.hasPlaceholderTarget) {
      this.placeholderTarget.classList.add("hidden")
    }
  }

  hideImage() {
    if (this.hasImageTarget) {
      this.imageTarget.src = ""
      this.imageTarget.classList.add("hidden")
    }
    if (this.hasPlaceholderTarget) {
      this.placeholderTarget.classList.remove("hidden")
    }
  }

  reset() {
    if (this.inputTarget.files?.length) return
    if (this.hasOriginalSrcValue && this.originalSrcValue) {
      this.restoreOriginal()
    } else {
      this.hideImage()
      this.updateFilename("No image selected")
    }
  }

  clearInput() {
    if (this.hasInputTarget) {
      this.inputTarget.value = ""
    }
  }

  uncheckRemoval() {
    if (this.hasRemoveToggleTarget) {
      this.removeToggleTarget.checked = false
    }
  }

  updateFilename(text) {
    if (this.hasFilenameTarget) {
      this.filenameTarget.textContent = text || "No image selected"
    }
  }

  restoreOriginal() {
    if (this.hasOriginalSrcValue && this.originalSrcValue) {
      this.showImage(this.originalSrcValue)
      this.updateFilename(this.originalFilenameValue || "Current image")
    } else {
      this.hideImage()
      this.updateFilename("No image selected")
    }
  }
}

