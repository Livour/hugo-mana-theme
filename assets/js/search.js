// Search Modal functionality
// Constants are imported from common/constants.js

let searchIndex = [];
let searchTimeout = null;

/**
 * Load search index from JSON file
 */
async function loadSearchIndex() {
  try {
    const response = await fetch(SEARCH_INDEX_URL);
    if (response.ok) {
      searchIndex = await response.json();
    } else {
      console.error("Failed to load search index:", response.status);
    }
  } catch (error) {
    console.error("Failed to load search index:", error);
  }
}

/**
 * Toggle search results visibility based on content
 */
function toggleSearchResultsVisibility() {
  const searchResults = document.getElementById("search-results");
  if (!searchResults) return;

  const hasContent = searchResults.innerHTML.trim().length > 0;
  searchResults.style.display = hasContent ? "block" : "none";
}

/**
 * Highlight matching text in search results
 * @param {string} text - Text to highlight
 * @param {string} query - Search query
 * @returns {string} Text with highlighted matches
 */
function highlightMatch(text, query) {
  if (!text || !query) return text;

  const hasTrailingSpace = query.endsWith(" ");
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return text;

  const escapedQuery = escapeRegex(trimmedQuery);
  const regex = new RegExp(`(${escapedQuery})`, "gi");

  return text.replace(regex, (match) => {
    return hasTrailingSpace ? `<mark>${match} </mark>` : `<mark>${match}</mark>`;
  });
}

/**
 * Perform search and display results
 * @param {string} query - Search query
 */
function performSearch(query) {
  const searchResults = document.getElementById("search-results");
  if (!searchResults) return;

  const trimmedQuery = query ? query.trim() : "";
  if (!trimmedQuery || trimmedQuery.length < MIN_SEARCH_QUERY_LENGTH) {
    searchResults.innerHTML = "";
    toggleSearchResultsVisibility();
    return;
  }

  const queryLower = trimmedQuery.toLowerCase();
  const seenPermalinks = new Set();

  const results = searchIndex
    .filter((item) => {
      if (!item || !item.permalink) return false;
      if (seenPermalinks.has(item.permalink)) return false;
      seenPermalinks.add(item.permalink);

      const titleMatch = item.title?.toLowerCase().includes(queryLower);
      const summaryMatch = item.summary?.toLowerCase().includes(queryLower);
      const contentMatch = item.content?.toLowerCase().includes(queryLower);
      const tagsMatch = item.tags?.some((tag) => tag.toLowerCase().includes(queryLower));

      return titleMatch || summaryMatch || contentMatch || tagsMatch;
    })
    .slice(0, SEARCH_RESULTS_LIMIT);

  if (results.length === 0) {
    searchResults.innerHTML = '<div class="search-result-empty">No results found</div>';
    toggleSearchResultsVisibility();
    return;
  }

  searchResults.innerHTML = results
    .map(
      (item) => `
    <a href="${item.permalink}" class="search-result-item">
      <div class="search-result-title">${highlightMatch(item.title || "", query)}</div>
      ${item.summary ? `<div class="search-result-summary">${highlightMatch(item.summary.substring(0, 150), query)}...</div>` : ""}
      ${
        item.date
          ? `<div class="search-result-date">
        <svg class="search-result-date-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
        ${formatDate(item.date)}
      </div>`
          : ""
      }
    </a>
  `,
    )
    .join("");

  toggleSearchResultsVisibility();
}

/**
 * Show/hide clear button based on input value
 */
function toggleClearButton() {
  const searchInputClear = document.getElementById("search-input-clear");
  const searchInput = document.getElementById("search-input");

  if (!searchInputClear || !searchInput) return;

  if (searchInput.value.length > 0) {
    searchInputClear.classList.add("visible");
  } else {
    searchInputClear.classList.remove("visible");
  }
}

/**
 * Open search modal
 */
function openSearchModal() {
  const searchModal = document.getElementById("search-modal");
  if (!searchModal) return;

  searchModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  setTimeout(() => {
    const searchInput = document.getElementById("search-input");
    searchInput?.focus();
    toggleClearButton();
  }, MODAL_FOCUS_DELAY);
}

/**
 * Close search modal
 */
function closeSearchModal() {
  const searchModal = document.getElementById("search-modal");
  if (!searchModal) return;

  searchModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";

  const searchInput = document.getElementById("search-input");
  const searchResults = document.getElementById("search-results");

  if (searchInput) {
    searchInput.value = "";
    toggleClearButton();
  }

  if (searchResults) {
    searchResults.innerHTML = "";
    searchResults.style.display = "none";
  }
}

/**
 * Handle search input
 */
function setupSearchInput() {
  const searchInput = document.getElementById("search-input");
  if (!searchInput) return;

  const debouncedSearch = debounce((query) => {
    performSearch(query);
  }, SEARCH_DEBOUNCE_DELAY);

  searchInput.addEventListener("input", (e) => {
    const query = e.target.value;
    toggleClearButton();
    debouncedSearch(query);
  });

  toggleClearButton();
}

/**
 * Handle clear button click
 */
function setupClearButton() {
  const searchInputClear = document.getElementById("search-input-clear");
  if (!searchInputClear) return;

  searchInputClear.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    const searchInput = document.getElementById("search-input");
    const searchResults = document.getElementById("search-results");

    if (searchInput) {
      searchInput.value = "";
      searchInput.focus();
      toggleClearButton();

      if (searchResults) {
        searchResults.innerHTML = "";
        searchResults.style.display = "none";
      }

      searchInput.dispatchEvent(new Event("input", { bubbles: true }));
    }
  });
}

/**
 * Setup keyboard shortcuts
 */
function setupKeyboardShortcuts() {
  document.addEventListener("keydown", (e) => {
    const searchModal = document.getElementById("search-modal");
    if (e.key === "Escape" && searchModal?.getAttribute("aria-hidden") === "false") {
      closeSearchModal();
    }
  });
}

/**
 * Prevent modal from closing when clicking inside
 */
function setupModalClickHandling() {
  const searchModal = document.getElementById("search-modal");
  const modalContainer = searchModal?.querySelector(".search-modal-container");

  modalContainer?.addEventListener("click", (e) => {
    e.stopPropagation();
  });
}

/**
 * Initialize search functionality
 */
function initSearch() {
  const searchToggle = document.getElementById("search-toggle");
  const searchModalBackdrop = document.getElementById("search-modal-backdrop");
  const searchModalClose = document.getElementById("search-modal-close");

  if (searchToggle) {
    searchToggle.addEventListener("click", openSearchModal);
  }

  if (searchModalBackdrop) {
    searchModalBackdrop.addEventListener("click", closeSearchModal);
  }

  if (searchModalClose) {
    searchModalClose.addEventListener("click", closeSearchModal);
  }

  setupSearchInput();
  setupClearButton();
  setupKeyboardShortcuts();
  setupModalClickHandling();
  loadSearchIndex();
}

// Initialize on page load
(function () {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSearch);
  } else {
    initSearch();
  }
})();
