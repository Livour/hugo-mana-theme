// Navigation functionality
// Constants are imported from common/constants.js

/**
 * Initialize glass dock navigation toggle
 */
function initGlassDockNavigation() {
  const glassDockToggle = document.querySelector(".glass-dock-toggle");
  const glassDockList = document.querySelector(".glass-dock-list");

  if (!glassDockToggle || !glassDockList) return;

  glassDockToggle.addEventListener("click", function () {
    const isExpanded = this.getAttribute("aria-expanded") === "true";
    this.setAttribute("aria-expanded", !isExpanded);
    glassDockList.classList.toggle("mobile-open", !isExpanded);
  });

  // Close menu when clicking on a link (mobile)
  glassDockList.querySelectorAll(".glass-dock-link").forEach((link) => {
    link.addEventListener("click", function () {
      if (window.innerWidth <= MOBILE_BREAKPOINT) {
        glassDockToggle.setAttribute("aria-expanded", "false");
        glassDockList.classList.remove("mobile-open");
      }
    });
  });

  // Close menu when clicking outside (mobile)
  document.addEventListener("click", function (e) {
    if (window.innerWidth <= MOBILE_BREAKPOINT) {
      if (!glassDockToggle.contains(e.target) && !glassDockList.contains(e.target)) {
        glassDockToggle.setAttribute("aria-expanded", "false");
        glassDockList.classList.remove("mobile-open");
      }
    }
  });
}

/**
 * Initialize smooth scroll for anchor links
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (href === "#" || href.length <= 1) return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });
}

/**
 * Initialize post card click handlers
 */
function initPostCardClick() {
  document.querySelectorAll(".post-card[data-post-url]").forEach((card) => {
    card.addEventListener("click", function (e) {
      // Don't navigate if clicking on a link or tag
      if (e.target.closest("a")) {
        return;
      }

      const url = this.getAttribute("data-post-url");
      if (url) {
        window.location.href = url;
      }
    });
  });
}

/**
 * Initialize mobile hamburger menu
 */
function initMobileMenu() {
  const mobileMenuToggle = document.getElementById("mobile-menu-toggle");
  const mobileMenuClose = document.getElementById("mobile-menu-close");
  const mobileMenu = document.getElementById("mobile-menu");
  const mobileSearchToggle = document.getElementById("mobile-search-toggle");
  const searchToggle = document.getElementById("search-toggle");
  const mobileMenuLinks = mobileMenu?.querySelectorAll(".menu-link");

  if (!mobileMenuToggle || !mobileMenu) return;

  function openMobileMenu() {
    mobileMenuToggle.setAttribute("aria-expanded", "true");
    mobileMenu.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    document.body.classList.add("mobile-menu-open");
  }

  function closeMobileMenu() {
    mobileMenuToggle.setAttribute("aria-expanded", "false");
    mobileMenu.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    document.body.classList.remove("mobile-menu-open");
  }

  // Toggle menu on hamburger button click
  mobileMenuToggle.addEventListener("click", function () {
    const isExpanded = this.getAttribute("aria-expanded") === "true";
    if (isExpanded) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });

  // Close menu on close button click
  if (mobileMenuClose) {
    mobileMenuClose.addEventListener("click", closeMobileMenu);
  }

  // Close menu when clicking on overlay
  const overlay = mobileMenu.querySelector(".mobile-menu-overlay");
  if (overlay) {
    overlay.addEventListener("click", closeMobileMenu);
  }

  // Close menu when clicking on a menu link
  if (mobileMenuLinks) {
    mobileMenuLinks.forEach((link) => {
      link.addEventListener("click", function () {
        // Small delay to allow navigation to start
        setTimeout(closeMobileMenu, 100);
      });
    });
  }

  // Connect mobile search toggle to main search toggle
  if (mobileSearchToggle && searchToggle) {
    mobileSearchToggle.addEventListener("click", function () {
      closeMobileMenu();
      // Trigger the main search toggle after menu closes
      setTimeout(() => {
        searchToggle.click();
      }, 300);
    });
  }

  // Close menu on escape key
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && mobileMenu.getAttribute("aria-hidden") === "false") {
      closeMobileMenu();
      mobileMenuToggle.focus();
    }
  });

  // Handle window resize - close menu if resizing to desktop
  let resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      if (window.innerWidth > MOBILE_BREAKPOINT) {
        closeMobileMenu();
      }
    }, 250);
  });
}

/**
 * Initialize all navigation features
 */
function initNavigation() {
  initGlassDockNavigation();
  initSmoothScroll();
  initPostCardClick();
  initMobileMenu();
}

// Initialize on page load
(function () {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initNavigation);
  } else {
    initNavigation();
  }
})();
