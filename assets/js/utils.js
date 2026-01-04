// Utility functions
// Constants are imported from common/constants.js

/**
 * Debounce function execution
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function execution
 * @param {Function} func - Function to throttle
 * @returns {Function} Throttled function
 */
function throttle(func) {
  let ticking = false;
  return function (...args) {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        func(...args);
        ticking = false;
      });
      ticking = true;
    }
  };
}

/**
 * Check if screen is wide (desktop)
 * @returns {boolean}
 */
function isWideScreen() {
  return window.innerWidth > WIDE_SCREEN_BREAKPOINT;
}

/**
 * Check if screen is mobile
 * @returns {boolean}
 */
function isMobileScreen() {
  return window.innerWidth <= MOBILE_BREAKPOINT;
}

/**
 * Escape special regex characters
 * @param {string} string - String to escape
 * @returns {string} Escaped string
 */
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Format date string for display
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date string
 */
function formatDate(dateString) {
  if (!dateString) return "";

  try {
    const date = new Date(dateString);
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString;
  }
}

/**
 * Initialize module when DOM is ready
 * @param {Function} initFunction - Function to initialize
 */
function initOnReady(initFunction) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initFunction);
  } else {
    initFunction();
  }
}
