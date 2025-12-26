// Collapsible Code Blocks

/**
 * Initialize collapsible code blocks
 */
function initCollapsibleCodeBlocks() {
  const postContent = document.querySelector('.post-content-main');
  if (!postContent) return;

  // Find all .highlight wrappers (these contain code blocks)
  const highlightBlocks = postContent.querySelectorAll('.highlight');
  
  // Find standalone pre elements that aren't inside .highlight
  const standalonePreBlocks = Array.from(postContent.querySelectorAll('pre')).filter(
    pre => !pre.closest('.highlight')
  );
  
  // Combine both types
  const codeBlocks = [...highlightBlocks, ...standalonePreBlocks];
  
  codeBlocks.forEach((block) => {
    // Skip if already wrapped
    if (block.closest('.code-block-wrapper')) return;
    
    // Create wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'code-block-wrapper collapsed';
    
    // Create toggle button
    const toggle = document.createElement('button');
    toggle.className = 'code-block-toggle';
    toggle.setAttribute('aria-label', 'Toggle code block');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.innerHTML = `
      <span>Expand</span>
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
      </svg>
    `;
    
    // Create content wrapper
    const content = document.createElement('div');
    content.className = 'code-block-content';
    
    // Wrap the block
    block.parentNode.insertBefore(wrapper, block);
    wrapper.appendChild(toggle);
    wrapper.appendChild(content);
    content.appendChild(block);
    
    // Add toggle functionality
    toggle.addEventListener('click', () => {
      const isCollapsed = wrapper.classList.contains('collapsed');
      wrapper.classList.toggle('collapsed');
      toggle.setAttribute('aria-expanded', !isCollapsed);
      toggle.querySelector('span').textContent = isCollapsed ? 'Collapse' : 'Expand';
    });
  });
}

// Initialize on page load
(function() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCollapsibleCodeBlocks);
  } else {
    initCollapsibleCodeBlocks();
  }
})();

