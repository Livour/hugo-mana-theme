// Table of Contents functionality
// Constants are imported from common/constants.js

/**
 * Check if screen is wide (desktop)
 * @returns {boolean}
 */
function isWideScreen() {
  return window.innerWidth > WIDE_SCREEN_BREAKPOINT;
}

/**
 * Expand TOC
 */
function expandTOC(tocToggle, tocContent) {
  tocToggle.setAttribute("aria-expanded", "true");
  tocContent.classList.add("expanded");
}

/**
 * Collapse TOC
 */
function collapseTOC(tocToggle, tocContent) {
  tocToggle.setAttribute("aria-expanded", "false");
  tocContent.classList.remove("expanded");
}

/**
 * Toggle TOC
 */
function toggleTOC(tocToggle, tocContent) {
  const isExpanded = tocToggle.getAttribute("aria-expanded") === "true";
  if (isExpanded) {
    collapseTOC(tocToggle, tocContent);
  } else {
    expandTOC(tocToggle, tocContent);
  }
}

/**
 * Initialize TOC state based on screen size
 */
function initializeTOCState(tocToggle, tocContent) {
  if (isWideScreen()) {
    expandTOC(tocToggle, tocContent);
  } else {
    collapseTOC(tocToggle, tocContent);
  }
}

/**
 * Update active TOC item based on scroll position
 */
function updateActiveTOCItem(headings, tocLinks, tocContent) {
  const scrollPosition = window.scrollY + TOC_SCROLL_OFFSET;

  let activeHeading = null;

  // Find the heading that's currently in view
  for (let i = headings.length - 1; i >= 0; i--) {
    const { element } = headings[i];
    if (element && element.offsetTop <= scrollPosition) {
      activeHeading = headings[i];
      break;
    }
  }

  // Update active state
  tocLinks.forEach((link) => link.classList.remove("active"));

  if (activeHeading) {
    activeHeading.link.classList.add("active");

    // Scroll TOC content to show active item (only if expanded)
    if (tocContent.classList.contains("expanded") && activeHeading.link) {
      const linkTop = activeHeading.link.offsetTop;
      const linkHeight = activeHeading.link.offsetHeight;
      const contentHeight = tocContent.offsetHeight;
      const contentScrollTop = tocContent.scrollTop;

      if (linkTop < contentScrollTop) {
        tocContent.scrollTo({ top: linkTop - 20, behavior: "smooth" });
      } else if (linkTop + linkHeight > contentScrollTop + contentHeight) {
        tocContent.scrollTo({ top: linkTop - contentHeight + linkHeight + 20, behavior: "smooth" });
      }
    }
  }
}

/**
 * Initialize Table of Contents
 */
function initTOC() {
  const toc = document.getElementById("post-toc");
  const tocToggle = document.getElementById("toc-toggle");
  const tocContent = document.getElementById("toc-content");

  if (!toc || !tocToggle || !tocContent) return;

  const tocLinks = toc.querySelectorAll('a[href^="#"]');
  const headings = Array.from(tocLinks)
    .map((link) => {
      const href = link.getAttribute("href");
      const id = href.substring(1);
      const element = document.getElementById(id);
      return { link, element, id };
    })
    .filter((item) => item.element);

  // Toggle on button click
  tocToggle.addEventListener("click", () => {
    toggleTOC(tocToggle, tocContent);
  });

  // Re-initialize on resize (debounced)
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      initializeTOCState(tocToggle, tocContent);
    }, TOC_RESIZE_DEBOUNCE);
  });

  // Initialize state
  initializeTOCState(tocToggle, tocContent);

  if (headings.length === 0) return;

  // Throttle scroll events
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateActiveTOCItem(headings, tocLinks, tocContent);
        ticking = false;
      });
      ticking = true;
    }
  });

  // Initial update
  updateActiveTOCItem(headings, tocLinks, tocContent);
}

// Initialize on page load
(function () {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTOC);
  } else {
    initTOC();
  }
})();
