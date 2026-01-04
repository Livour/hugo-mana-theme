// Scroll to Top functionality
// Constants are imported from common/constants.js

/**
 * Toggle scroll button visibility
 */
function toggleScrollButton() {
  const scrollToTopBtn = document.getElementById("scroll-to-top");
  if (!scrollToTopBtn) return;

  if (window.scrollY > SCROLL_THRESHOLD) {
    scrollToTopBtn.classList.add("visible");
  } else {
    scrollToTopBtn.classList.remove("visible");
  }
}

/**
 * Scroll to top of page
 */
function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

/**
 * Initialize scroll to top functionality
 */
function initScrollToTop() {
  const scrollToTopBtn = document.getElementById("scroll-to-top");
  if (!scrollToTopBtn) return;

  window.addEventListener("scroll", toggleScrollButton);
  scrollToTopBtn.addEventListener("click", scrollToTop);
}

// Initialize on page load
(function () {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initScrollToTop);
  } else {
    initScrollToTop();
  }
})();
