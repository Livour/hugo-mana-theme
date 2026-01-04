// Posts Filter System

/**
 * Initialize posts filter system
 */
function initFilters() {
  const filterYearMonth = document.getElementById("filter-year-month");
  const clearFiltersBtn = document.getElementById("clear-filters");
  const postsContainer = document.getElementById("posts-container");
  const filteredCount = document.getElementById("filtered-count");
  const tagSearchInput = document.getElementById("tag-search-input");
  const tagSearchResults = document.getElementById("tag-search-results");
  const selectedTagsContainer = document.getElementById("selected-tags-container");
  const allTagsData = document.getElementById("all-tags-data");

  if (!postsContainer) return;

  // Get all available tags
  const allTags = Array.from(allTagsData?.querySelectorAll("[data-tag]") || []).map((el) =>
    el.getAttribute("data-tag"),
  );

  // Track selected tags
  const selectedTags = new Set();
  let selectedResultIndex = -1;

  /**
   * Create tag checkbox element
   */
  function createTagCheckbox(tag) {
    const label = document.createElement("label");
    label.className = "filter-tag-checkbox";
    label.innerHTML = `
      <input type="checkbox" value="${tag}" class="filter-tag-input" checked>
      <span class="filter-tag-label">${tag}</span>
    `;
    return label;
  }

  /**
   * Add tag to selected tags
   */
  function addTag(tag) {
    if (selectedTags.has(tag)) return;

    selectedTags.add(tag);
    const checkbox = createTagCheckbox(tag);
    checkbox.querySelector(".filter-tag-input").addEventListener("change", function () {
      if (!this.checked) {
        removeTag(tag);
      }
      applyFilters();
    });
    selectedTagsContainer.appendChild(checkbox);
    applyFilters();
  }

  /**
   * Remove tag from selected tags
   */
  function removeTag(tag) {
    selectedTags.delete(tag);
    const checkbox = selectedTagsContainer
      .querySelector(`input[value="${tag}"]`)
      ?.closest(".filter-tag-checkbox");
    if (checkbox) {
      checkbox.remove();
    }
    applyFilters();
  }

  /**
   * Search tags
   */
  function searchTags(query) {
    if (!tagSearchResults) return;

    const queryLower = query.toLowerCase().trim();

    if (!queryLower) {
      tagSearchResults.innerHTML = "";
      tagSearchResults.style.display = "none";
      selectedResultIndex = -1;
      return;
    }

    const matchingTags = allTags.filter(
      (tag) => tag.toLowerCase().includes(queryLower) && !selectedTags.has(tag),
    );

    if (matchingTags.length === 0) {
      tagSearchResults.innerHTML = '<div class="tag-search-no-results">No tags found</div>';
      tagSearchResults.style.display = "block";
      selectedResultIndex = -1;
      return;
    }

    tagSearchResults.innerHTML = matchingTags
      .map(
        (tag, index) =>
          `<div class="tag-search-result-item ${index === selectedResultIndex ? "selected" : ""}" data-tag="${tag}" data-index="${index}">${tag}</div>`,
      )
      .join("");

    tagSearchResults.style.display = "block";

    // Add click handlers to search results
    tagSearchResults.querySelectorAll(".tag-search-result-item").forEach((item) => {
      item.addEventListener("click", () => {
        const tag = item.getAttribute("data-tag");
        addTag(tag);
        tagSearchInput.value = "";
        tagSearchResults.style.display = "none";
        selectedResultIndex = -1;
        tagSearchInput.focus();
      });
    });

    updateSelectedResult();
  }

  /**
   * Update selected result highlight
   */
  function updateSelectedResult() {
    const items = tagSearchResults.querySelectorAll(".tag-search-result-item");
    items.forEach((item, index) => {
      if (index === selectedResultIndex) {
        item.classList.add("selected");
      } else {
        item.classList.remove("selected");
      }
    });
  }

  /**
   * Select tag from search results
   */
  function selectTagFromResults() {
    const items = tagSearchResults.querySelectorAll(".tag-search-result-item");
    if (items.length === 0) {
      // Try to find exact match
      const query = tagSearchInput.value.trim();
      const exactMatch = allTags.find(
        (tag) => tag.toLowerCase() === query.toLowerCase() && !selectedTags.has(tag),
      );
      if (exactMatch) {
        addTag(exactMatch);
        tagSearchInput.value = "";
        tagSearchResults.style.display = "none";
        selectedResultIndex = -1;
        return;
      }
      return;
    }

    if (selectedResultIndex >= 0 && selectedResultIndex < items.length) {
      const selectedItem = items[selectedResultIndex];
      const tag = selectedItem.getAttribute("data-tag");
      addTag(tag);
      tagSearchInput.value = "";
      tagSearchResults.style.display = "none";
      selectedResultIndex = -1;
    } else if (items.length > 0) {
      // Select first item if none selected
      const firstItem = items[0];
      const tag = firstItem.getAttribute("data-tag");
      addTag(tag);
      tagSearchInput.value = "";
      tagSearchResults.style.display = "none";
      selectedResultIndex = -1;
    }
  }

  /**
   * Apply filters to posts
   */
  function applyFilters() {
    const selectedYearMonth = filterYearMonth?.value || "";
    const selectedTagsArray = Array.from(selectedTags);

    const postCards = postsContainer.querySelectorAll(".post-card");
    let visibleCount = 0;

    // Filter posts
    postCards.forEach((card) => {
      const cardYearMonth = card.getAttribute("data-year-month") || "";
      const cardTags = card.getAttribute("data-tags")?.split(",") || [];

      const matchesYearMonth = !selectedYearMonth || cardYearMonth === selectedYearMonth;
      const matchesTags =
        selectedTagsArray.length === 0 || selectedTagsArray.some((tag) => cardTags.includes(tag));

      if (matchesYearMonth && matchesTags) {
        card.style.display = "";
        visibleCount++;
      } else {
        card.style.display = "none";
      }
    });

    // Update filtered count
    if (filteredCount) {
      filteredCount.textContent = visibleCount;
    }
  }

  // Event listeners
  filterYearMonth?.addEventListener("change", applyFilters);

  // Tag search
  if (tagSearchInput) {
    tagSearchInput.addEventListener("input", (e) => {
      selectedResultIndex = -1;
      searchTags(e.target.value);
    });

    tagSearchInput.addEventListener("focus", () => {
      if (tagSearchInput.value.trim()) {
        searchTags(tagSearchInput.value);
      }
    });

    // Keyboard navigation
    tagSearchInput.addEventListener("keydown", (e) => {
      const items = tagSearchResults.querySelectorAll(".tag-search-result-item");

      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (items.length > 0) {
          selectedResultIndex =
            selectedResultIndex < items.length - 1 ? selectedResultIndex + 1 : 0;
          updateSelectedResult();
          if (items[selectedResultIndex]) {
            items[selectedResultIndex].scrollIntoView({ block: "nearest", behavior: "smooth" });
          }
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (items.length > 0) {
          selectedResultIndex =
            selectedResultIndex > 0 ? selectedResultIndex - 1 : items.length - 1;
          updateSelectedResult();
          if (items[selectedResultIndex]) {
            items[selectedResultIndex].scrollIntoView({ block: "nearest", behavior: "smooth" });
          }
        }
      } else if (e.key === "Enter") {
        e.preventDefault();
        selectTagFromResults();
      } else if (e.key === "Escape") {
        tagSearchResults.style.display = "none";
        selectedResultIndex = -1;
        tagSearchInput.blur();
      }
    });

    // Close search results when clicking outside
    document.addEventListener("click", (e) => {
      if (!tagSearchInput.contains(e.target) && !tagSearchResults.contains(e.target)) {
        tagSearchResults.style.display = "none";
        selectedResultIndex = -1;
      }
    });
  }

  clearFiltersBtn?.addEventListener("click", () => {
    if (filterYearMonth) filterYearMonth.value = "";
    selectedTags.clear();
    selectedTagsContainer.innerHTML = "";
    if (tagSearchInput) tagSearchInput.value = "";
    if (tagSearchResults) tagSearchResults.style.display = "none";
    applyFilters();
  });

  // Filter accordion toggle
  const filterToggleBtn = document.getElementById("filter-toggle-btn");
  const filterContent = document.getElementById("posts-filter-content");

  if (filterToggleBtn && filterContent) {
    filterContent.style.display = "flex";

    filterToggleBtn.addEventListener("click", () => {
      const isExpanded = filterToggleBtn.getAttribute("aria-expanded") === "true";

      if (!isExpanded) {
        // Expanding - measure actual height
        filterContent.style.maxHeight = "none";
        const height = filterContent.scrollHeight;
        filterContent.style.maxHeight = "0px";
        filterContent.offsetHeight; // Force reflow
        filterContent.style.maxHeight = Math.max(height, 300) + "px";
        filterContent.classList.add("expanded");
      } else {
        // Collapsing
        filterContent.style.maxHeight = filterContent.scrollHeight + "px";
        filterContent.offsetHeight; // Force reflow
        filterContent.style.maxHeight = "0px";
        filterContent.classList.remove("expanded");
      }

      filterToggleBtn.setAttribute("aria-expanded", !isExpanded);
      filterToggleBtn.classList.toggle("expanded", !isExpanded);
    });
  }
}

// Initialize on page load
(function () {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initFilters);
  } else {
    initFilters();
  }
})();
