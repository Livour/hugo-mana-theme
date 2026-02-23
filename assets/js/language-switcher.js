/**
 * Language switcher dropdown functionality
 */
function initLanguageSwitcher() {
  const toggles = document.querySelectorAll(".language-switcher-toggle");
  const dropdowns = document.querySelectorAll(".language-switcher-dropdown");

  if (!toggles.length || !dropdowns.length) return;

  function closeAllDropdowns() {
    toggles.forEach((toggle) => toggle.setAttribute("aria-expanded", "false"));
    dropdowns.forEach((dropdown) => dropdown.setAttribute("aria-hidden", "true"));
  }

  toggles.forEach((toggle) => {
    toggle.addEventListener("click", function (e) {
      e.stopPropagation();
      const switcher = this.closest(".language-switcher");
      const dropdown = switcher?.querySelector(".language-switcher-dropdown");
      if (!dropdown) return;

      const isExpanded = this.getAttribute("aria-expanded") === "true";
      closeAllDropdowns();
      if (!isExpanded) {
        this.setAttribute("aria-expanded", "true");
        dropdown.setAttribute("aria-hidden", "false");
      }
    });
  });

  // Close on outside click
  document.addEventListener("click", function () {
    closeAllDropdowns();
  });

  // Close when a language link is clicked (before navigation)
  document.querySelectorAll(".language-switcher-link").forEach((link) => {
    link.addEventListener("click", function () {
      closeAllDropdowns();
    });
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initLanguageSwitcher);
} else {
  initLanguageSwitcher();
}
