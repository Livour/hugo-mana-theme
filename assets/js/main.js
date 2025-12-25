// Theme Toggle
(function() {
  const themeToggle = document.getElementById('theme-toggle');
  const html = document.documentElement;
  
  // Get theme from localStorage or system preference
  function getInitialTheme() {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      return storedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  
  // Set theme
  function setTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    updateThemeToggleIcon(theme);
  }
  
  // Update theme toggle icon
  function updateThemeToggleIcon(theme) {
    const iconSun = themeToggle?.querySelector('.icon-sun');
    const iconMoon = themeToggle?.querySelector('.icon-moon');
    
    if (theme === 'light') {
      iconSun?.setAttribute('style', 'display: none;');
      iconMoon?.setAttribute('style', 'display: block;');
    } else {
      iconSun?.setAttribute('style', 'display: block;');
      iconMoon?.setAttribute('style', 'display: none;');
    }
  }
  
  // Initialize theme
  const initialTheme = getInitialTheme();
  setTheme(initialTheme);
  
  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      setTheme(e.matches ? 'light' : 'dark');
    }
  });
  
  // Toggle theme on button click
  themeToggle?.addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  });
})();

// Search Modal
(function() {
  const searchToggle = document.getElementById('search-toggle');
  const searchModal = document.getElementById('search-modal');
  const searchModalBackdrop = document.getElementById('search-modal-backdrop');
  const searchModalClose = document.getElementById('search-modal-close');
  const searchInput = document.getElementById('search-input');
  const searchInputClear = document.getElementById('search-input-clear');
  const searchResults = document.getElementById('search-results');
  
  let searchIndex = [];
  let searchTimeout = null;
  
  // Load search index
  async function loadSearchIndex() {
    try {
      const response = await fetch('/index.json');
      if (response.ok) {
        searchIndex = await response.json();
      } else {
        console.error('Failed to load search index:', response.status);
      }
    } catch (error) {
      console.error('Failed to load search index:', error);
    }
  }
  
  // Toggle search results visibility
  function toggleSearchResults() {
    if (!searchResults) return;
    const hasContent = searchResults.innerHTML.trim().length > 0;
    searchResults.style.display = hasContent ? 'block' : 'none';
  }
  
  // Perform search
  function performSearch(query) {
    if (!searchResults) return;
    
    // Trim whitespace and check if query has meaningful content
    const trimmedQuery = query ? query.trim() : '';
    if (!trimmedQuery || trimmedQuery.length < 2) {
      searchResults.innerHTML = '';
      toggleSearchResults();
      return;
    }
    
    const queryLower = trimmedQuery.toLowerCase();
    const seenPermalinks = new Set();
    const results = searchIndex.filter(item => {
      if (!item || !item.permalink) return false;
      
      // Deduplicate by permalink
      if (seenPermalinks.has(item.permalink)) return false;
      seenPermalinks.add(item.permalink);
      
      const titleMatch = item.title?.toLowerCase().includes(queryLower);
      const summaryMatch = item.summary?.toLowerCase().includes(queryLower);
      const contentMatch = item.content?.toLowerCase().includes(queryLower);
      const tagsMatch = item.tags?.some(tag => tag.toLowerCase().includes(queryLower));
      return titleMatch || summaryMatch || contentMatch || tagsMatch;
    }).slice(0, 10); // Limit to 10 results
    
    if (results.length === 0) {
      searchResults.innerHTML = '<div class="search-result-empty">No results found</div>';
      toggleSearchResults();
      return;
    }
    
    // Format date for display
    function formatDate(dateString) {
      if (!dateString) return '';
      try {
        const date = new Date(dateString);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
      } catch (e) {
        return dateString;
      }
    }
    
    searchResults.innerHTML = results.map(item => `
      <a href="${item.permalink}" class="search-result-item">
        <div class="search-result-title">${highlightMatch(item.title || '', query)}</div>
        ${item.summary ? `<div class="search-result-summary">${highlightMatch(item.summary.substring(0, 150), query)}...</div>` : ''}
        ${item.date ? `<div class="search-result-date">
          <svg class="search-result-date-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          ${formatDate(item.date)}
        </div>` : ''}
      </a>
    `).join('');
    
    toggleSearchResults();
  }
  
  // Highlight matching text
  function highlightMatch(text, query) {
    if (!text || !query) return text;
    
    // Check if query ends with a space
    const hasTrailingSpace = query.endsWith(' ');
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return text;
    
    // Escape special regex characters
    const escapedQuery = trimmedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Match the query (without trailing space for matching)
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    
    return text.replace(regex, (match) => {
      // If query had trailing space, add it to the mark content
      return hasTrailingSpace ? `<mark>${match} </mark>` : `<mark>${match}</mark>`;
    });
  }
  
  // Show/hide clear button based on input value
  function toggleClearButton() {
    if (searchInputClear && searchInput) {
      if (searchInput.value.length > 0) {
        searchInputClear.classList.add('visible');
      } else {
        searchInputClear.classList.remove('visible');
      }
    }
  }
  
  function openSearchModal() {
    if (searchModal) {
      searchModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        searchInput?.focus();
        toggleClearButton();
      }, 100);
    }
  }
  
  function closeSearchModal() {
    if (searchModal) {
      searchModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (searchInput) {
        searchInput.value = '';
        toggleClearButton();
      }
      if (searchResults) {
        searchResults.innerHTML = '';
        searchResults.style.display = 'none';
      }
    }
  }
  
  // Handle search input
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value;
      toggleClearButton();
      
      // Debounce search
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        performSearch(query);
      }, 200);
    });
    
    // Initial state
    toggleClearButton();
  }
  
  // Clear input when trash icon is clicked
  if (searchInputClear) {
    searchInputClear.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
        toggleClearButton();
        // Clear search results
        if (searchResults) {
          searchResults.innerHTML = '';
          searchResults.style.display = 'none';
        }
        // Trigger input event to clear any pending search
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
  }
  
  // Open modal
  searchToggle?.addEventListener('click', openSearchModal);
  
  // Close on backdrop click
  searchModalBackdrop?.addEventListener('click', closeSearchModal);
  
  // Close on X button click
  searchModalClose?.addEventListener('click', closeSearchModal);
  
  // Close on ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && searchModal?.getAttribute('aria-hidden') === 'false') {
      closeSearchModal();
    }
  });
  
  // Prevent modal from closing when clicking inside
  searchModal?.querySelector('.search-modal-container')?.addEventListener('click', (e) => {
    e.stopPropagation();
  });
  
  // Initialize - load search index
  loadSearchIndex();
})();

// Scroll to Top
(function() {
  const scrollToTopBtn = document.getElementById('scroll-to-top');
  
  function toggleScrollButton() {
    if (window.scrollY > 300) {
      scrollToTopBtn?.classList.add('visible');
    } else {
      scrollToTopBtn?.classList.remove('visible');
    }
  }
  
  // Show/hide button on scroll
  window.addEventListener('scroll', toggleScrollButton);
  
  // Scroll to top on click
  scrollToTopBtn?.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
})();

// Glass Dock Navigation - Mobile Toggle
(function() {
  const glassDockToggle = document.querySelector('.glass-dock-toggle');
  const glassDockList = document.querySelector('.glass-dock-list');
  
  if (glassDockToggle && glassDockList) {
    glassDockToggle.addEventListener('click', function() {
      const isExpanded = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', !isExpanded);
      glassDockList.classList.toggle('mobile-open', !isExpanded);
    });
    
    // Close menu when clicking on a link (mobile)
    glassDockList.querySelectorAll('.glass-dock-link').forEach(link => {
      link.addEventListener('click', function() {
        if (window.innerWidth <= 768) {
          glassDockToggle.setAttribute('aria-expanded', 'false');
          glassDockList.classList.remove('mobile-open');
        }
      });
    });
    
    // Close menu when clicking outside (mobile)
    document.addEventListener('click', function(e) {
      if (window.innerWidth <= 768) {
        if (!glassDockToggle.contains(e.target) && !glassDockList.contains(e.target)) {
          glassDockToggle.setAttribute('aria-expanded', 'false');
          glassDockList.classList.remove('mobile-open');
        }
      }
    });
  }
})();

// Smooth scroll for anchor links
(function() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href !== '#' && href.length > 1) {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  });
})();

// Make post cards clickable
(function() {
  document.querySelectorAll('.post-card[data-post-url]').forEach(card => {
    card.addEventListener('click', function(e) {
      // Don't navigate if clicking on a link or tag
      if (e.target.closest('a')) {
        return;
      }
      const url = this.getAttribute('data-post-url');
      if (url) {
        window.location.href = url;
      }
    });
  });
})();

// Interactive Table of Contents with Burger Menu
(function() {
  const toc = document.getElementById('post-toc');
  const tocToggle = document.getElementById('toc-toggle');
  const tocContent = document.getElementById('toc-content');
  
  if (!toc || !tocToggle || !tocContent) return;
  
  const tocLinks = toc.querySelectorAll('a[href^="#"]');
  const headings = Array.from(tocLinks).map(link => {
    const href = link.getAttribute('href');
    const id = href.substring(1);
    const element = document.getElementById(id);
    return { link, element, id };
  }).filter(item => item.element);
  
  // Check if screen is wide (desktop)
  function isWideScreen() {
    return window.innerWidth > 1024;
  }
  
  // Expand TOC
  function expandTOC() {
    tocToggle.setAttribute('aria-expanded', 'true');
    tocContent.classList.add('expanded');
  }
  
  // Collapse TOC
  function collapseTOC() {
    tocToggle.setAttribute('aria-expanded', 'false');
    tocContent.classList.remove('expanded');
  }
  
  // Toggle TOC
  function toggleTOC() {
    const isExpanded = tocToggle.getAttribute('aria-expanded') === 'true';
    if (isExpanded) {
      collapseTOC();
    } else {
      expandTOC();
    }
  }
  
  // Initialize: Open by default on wide screens, closed on narrow
  function initializeTOCState() {
    if (isWideScreen()) {
      expandTOC();
    } else {
      collapseTOC();
    }
  }
  
  // Toggle on button click
  tocToggle.addEventListener('click', toggleTOC);
  
  // Re-initialize on resize (debounced)
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(initializeTOCState, 150);
  });
  
  // Initialize state
  initializeTOCState();
  
  if (headings.length === 0) return;
  
  function updateActiveTOCItem() {
    const scrollPosition = window.scrollY + 100; // Offset for header
    
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
    tocLinks.forEach(link => link.classList.remove('active'));
    if (activeHeading) {
      activeHeading.link.classList.add('active');
      
      // Scroll TOC content to show active item (only if expanded)
      if (tocContent.classList.contains('expanded') && activeHeading.link) {
        const linkTop = activeHeading.link.offsetTop;
        const linkHeight = activeHeading.link.offsetHeight;
        const contentHeight = tocContent.offsetHeight;
        const contentScrollTop = tocContent.scrollTop;
        
        if (linkTop < contentScrollTop) {
          tocContent.scrollTo({ top: linkTop - 20, behavior: 'smooth' });
        } else if (linkTop + linkHeight > contentScrollTop + contentHeight) {
          tocContent.scrollTo({ top: linkTop - contentHeight + linkHeight + 20, behavior: 'smooth' });
        }
      }
    }
  }
  
  // Throttle scroll events
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateActiveTOCItem();
        ticking = false;
      });
      ticking = true;
    }
  });
  
  // Initial update
  updateActiveTOCItem();
})();

// Posts Filter System
(function() {
  const filterYearMonth = document.getElementById('filter-year-month');
  const clearFiltersBtn = document.getElementById('clear-filters');
  const postsContainer = document.getElementById('posts-container');
  const filteredCount = document.getElementById('filtered-count');
  const tagSearchInput = document.getElementById('tag-search-input');
  const tagSearchResults = document.getElementById('tag-search-results');
  const selectedTagsContainer = document.getElementById('selected-tags-container');
  const allTagsData = document.getElementById('all-tags-data');
  
  if (!postsContainer) return;
  
  // Get all available tags
  const allTags = Array.from(allTagsData?.querySelectorAll('[data-tag]') || [])
    .map(el => el.getAttribute('data-tag'));
  
  // Track selected tags
  const selectedTags = new Set();
  
  // Create tag checkbox element
  function createTagCheckbox(tag) {
    const label = document.createElement('label');
    label.className = 'filter-tag-checkbox';
    label.innerHTML = `
      <input type="checkbox" value="${tag}" class="filter-tag-input" checked>
      <span class="filter-tag-label">${tag}</span>
    `;
    return label;
  }
  
  // Add tag to selected tags
  function addTag(tag) {
    if (selectedTags.has(tag)) return;
    
    selectedTags.add(tag);
    const checkbox = createTagCheckbox(tag);
    checkbox.querySelector('.filter-tag-input').addEventListener('change', function() {
      if (!this.checked) {
        removeTag(tag);
      }
      applyFilters();
    });
    selectedTagsContainer.appendChild(checkbox);
    applyFilters();
  }
  
  // Remove tag from selected tags
  function removeTag(tag) {
    selectedTags.delete(tag);
    const checkbox = selectedTagsContainer.querySelector(`input[value="${tag}"]`)?.closest('.filter-tag-checkbox');
    if (checkbox) {
      checkbox.remove();
    }
    applyFilters();
  }
  
  // Track selected result index for keyboard navigation
  let selectedResultIndex = -1;
  
  // Search tags
  function searchTags(query) {
    if (!tagSearchResults) return;
    
    const queryLower = query.toLowerCase().trim();
    
    if (!queryLower) {
      tagSearchResults.innerHTML = '';
      tagSearchResults.style.display = 'none';
      selectedResultIndex = -1;
      return;
    }
    
    const matchingTags = allTags.filter(tag => 
      tag.toLowerCase().includes(queryLower) && !selectedTags.has(tag)
    );
    
    if (matchingTags.length === 0) {
      tagSearchResults.innerHTML = '<div class="tag-search-no-results">No tags found</div>';
      tagSearchResults.style.display = 'block';
      selectedResultIndex = -1;
      return;
    }
    
    tagSearchResults.innerHTML = matchingTags.map((tag, index) => 
      `<div class="tag-search-result-item ${index === selectedResultIndex ? 'selected' : ''}" data-tag="${tag}" data-index="${index}">${tag}</div>`
    ).join('');
    
    tagSearchResults.style.display = 'block';
    
    // Add click handlers to search results
    tagSearchResults.querySelectorAll('.tag-search-result-item').forEach(item => {
      item.addEventListener('click', () => {
        const tag = item.getAttribute('data-tag');
        addTag(tag);
        tagSearchInput.value = '';
        tagSearchResults.style.display = 'none';
        selectedResultIndex = -1;
        tagSearchInput.focus();
      });
    });
    
    // Update selected item highlight
    updateSelectedResult();
  }
  
  // Update selected result highlight
  function updateSelectedResult() {
    const items = tagSearchResults.querySelectorAll('.tag-search-result-item');
    items.forEach((item, index) => {
      if (index === selectedResultIndex) {
        item.classList.add('selected');
      } else {
        item.classList.remove('selected');
      }
    });
  }
  
  // Select tag from search results
  function selectTagFromResults() {
    const items = tagSearchResults.querySelectorAll('.tag-search-result-item');
    if (items.length === 0) {
      // Try to find exact match
      const query = tagSearchInput.value.trim();
      const exactMatch = allTags.find(tag => 
        tag.toLowerCase() === query.toLowerCase() && !selectedTags.has(tag)
      );
      if (exactMatch) {
        addTag(exactMatch);
        tagSearchInput.value = '';
        tagSearchResults.style.display = 'none';
        selectedResultIndex = -1;
        return;
      }
      return;
    }
    
    if (selectedResultIndex >= 0 && selectedResultIndex < items.length) {
      const selectedItem = items[selectedResultIndex];
      const tag = selectedItem.getAttribute('data-tag');
      addTag(tag);
      tagSearchInput.value = '';
      tagSearchResults.style.display = 'none';
      selectedResultIndex = -1;
    } else if (items.length > 0) {
      // Select first item if none selected
      const firstItem = items[0];
      const tag = firstItem.getAttribute('data-tag');
      addTag(tag);
      tagSearchInput.value = '';
      tagSearchResults.style.display = 'none';
      selectedResultIndex = -1;
    }
  }
  
  // Apply filters
  function applyFilters() {
    const selectedYearMonth = filterYearMonth?.value || '';
    const selectedTagsArray = Array.from(selectedTags);
    
    const postCards = postsContainer.querySelectorAll('.post-card');
    let visibleCount = 0;
    
    // Filter posts
    postCards.forEach(card => {
      const cardYearMonth = card.getAttribute('data-year-month') || '';
      const cardTags = card.getAttribute('data-tags')?.split(',') || [];
      
      let matchesYearMonth = !selectedYearMonth || cardYearMonth === selectedYearMonth;
      let matchesTags = selectedTagsArray.length === 0 || selectedTagsArray.some(tag => cardTags.includes(tag));
      
      if (matchesYearMonth && matchesTags) {
        card.style.display = '';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });
    
    // Update filtered count
    if (filteredCount) {
      filteredCount.textContent = visibleCount;
    }
  }
  
  // Event listeners
  filterYearMonth?.addEventListener('change', applyFilters);
  
  // Tag search
  if (tagSearchInput) {
    tagSearchInput.addEventListener('input', (e) => {
      selectedResultIndex = -1;
      searchTags(e.target.value);
    });
    
    tagSearchInput.addEventListener('focus', () => {
      if (tagSearchInput.value.trim()) {
        searchTags(tagSearchInput.value);
      }
    });
    
    // Keyboard navigation
    tagSearchInput.addEventListener('keydown', (e) => {
      const items = tagSearchResults.querySelectorAll('.tag-search-result-item');
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (items.length > 0) {
          selectedResultIndex = selectedResultIndex < items.length - 1 ? selectedResultIndex + 1 : 0;
          updateSelectedResult();
          // Scroll selected item into view
          if (items[selectedResultIndex]) {
            items[selectedResultIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          }
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (items.length > 0) {
          selectedResultIndex = selectedResultIndex > 0 ? selectedResultIndex - 1 : items.length - 1;
          updateSelectedResult();
          // Scroll selected item into view
          if (items[selectedResultIndex]) {
            items[selectedResultIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          }
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        selectTagFromResults();
      } else if (e.key === 'Escape') {
        tagSearchResults.style.display = 'none';
        selectedResultIndex = -1;
        tagSearchInput.blur();
      }
    });
    
    // Close search results when clicking outside
    document.addEventListener('click', (e) => {
      if (!tagSearchInput.contains(e.target) && !tagSearchResults.contains(e.target)) {
        tagSearchResults.style.display = 'none';
        selectedResultIndex = -1;
      }
    });
  }
  
  clearFiltersBtn?.addEventListener('click', () => {
    if (filterYearMonth) filterYearMonth.value = '';
    selectedTags.clear();
    selectedTagsContainer.innerHTML = '';
    if (tagSearchInput) tagSearchInput.value = '';
    if (tagSearchResults) tagSearchResults.style.display = 'none';
    applyFilters();
  });
  
  // Filter accordion toggle
  const filterToggleBtn = document.getElementById('filter-toggle-btn');
  const filterContent = document.getElementById('posts-filter-content');
  
  if (filterToggleBtn && filterContent) {
    // Initialize collapsed state
    filterContent.style.display = 'flex';
    
    filterToggleBtn.addEventListener('click', () => {
      const isExpanded = filterToggleBtn.getAttribute('aria-expanded') === 'true';
      
      if (!isExpanded) {
        // Expanding - measure actual height
        filterContent.style.maxHeight = 'none';
        const height = filterContent.scrollHeight;
        filterContent.style.maxHeight = '0px';
        
        // Force reflow
        filterContent.offsetHeight;
        
        // Set to measured height (minimum 300px)
        filterContent.style.maxHeight = Math.max(height, 300) + 'px';
        filterContent.classList.add('expanded');
      } else {
        // Collapsing
        filterContent.style.maxHeight = filterContent.scrollHeight + 'px';
        filterContent.offsetHeight; // Force reflow
        filterContent.style.maxHeight = '0px';
        filterContent.classList.remove('expanded');
      }
      
      filterToggleBtn.setAttribute('aria-expanded', !isExpanded);
      filterToggleBtn.classList.toggle('expanded', !isExpanded);
    });
  }
})();

