// Collapsible Code Blocks

/**
 * Initialize collapsible code blocks
 */
function initCollapsibleCodeBlocks() {
  const postContent = document.querySelector(".post-content-main");
  if (!postContent) return;

  // Find all .highlight wrappers (these contain code blocks)
  const highlightBlocks = postContent.querySelectorAll(".highlight");

  // Find standalone pre elements that aren't inside .highlight
  const standalonePreBlocks = Array.from(postContent.querySelectorAll("pre")).filter(
    (pre) => !pre.closest(".highlight"),
  );

  // Combine both types
  const codeBlocks = [...highlightBlocks, ...standalonePreBlocks];

  codeBlocks.forEach((block) => {
    let wrapper = block.closest(".code-block-wrapper");
    let isNewWrapper = false;

    // If not wrapped, create wrapper
    if (!wrapper) {
      wrapper = document.createElement("div");
      wrapper.className = "code-block-wrapper collapsed";
      isNewWrapper = true;
    }

    // Check if copy button already exists
    let copyButton = wrapper.querySelector(".code-block-copy");

    // Create copy button if it doesn't exist
    if (!copyButton) {
      copyButton = document.createElement("button");
      copyButton.className = "code-block-copy";
      copyButton.setAttribute("aria-label", "Copy code");
      copyButton.innerHTML = `
        <svg class="copy-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
        </svg>
        <svg class="checkmark-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="display: none;">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span class="copy-text">Copy</span>
        <span class="copied-text" style="display: none;">Copied!</span>
      `;

      // Extract code text for copying
      const getCodeText = () => {
        // Handle .highlight blocks (usually contain <pre><code>)
        const codeElement = block.querySelector("code") || block;
        return codeElement.textContent || codeElement.innerText || "";
      };

      // Add copy functionality
      copyButton.addEventListener("click", async (e) => {
        e.stopPropagation();
        const codeText = getCodeText();

        // Check if we're on mobile (narrow screen)
        const isMobile = window.innerWidth <= 768;

        try {
          await navigator.clipboard.writeText(codeText);

          // Show feedback
          const copyText = copyButton.querySelector(".copy-text");
          const copiedText = copyButton.querySelector(".copied-text");
          const copyIcon = copyButton.querySelector(".copy-icon");
          const checkmarkIcon = copyButton.querySelector(".checkmark-icon");

          // Update aria-label for accessibility
          copyButton.setAttribute("aria-label", "Code copied");

          // Change icon to checkmark
          copyIcon.style.display = "none";
          checkmarkIcon.style.display = "block";

          if (!isMobile) {
            // On desktop, show text feedback
            copyText.style.display = "none";
            copiedText.style.display = "inline";
          }
          copyButton.classList.add("copied");

          // Update aria-label for accessibility
          copyButton.setAttribute("aria-label", "Code copied");

          // Reset after 2 seconds
          setTimeout(() => {
            // Change icon back to copy
            checkmarkIcon.style.display = "none";
            copyIcon.style.display = "block";

            if (!isMobile) {
              copiedText.style.display = "none";
              copyText.style.display = "inline";
            }
            copyButton.classList.remove("copied");
            copyButton.setAttribute("aria-label", "Copy code");
          }, 2000);
        } catch (err) {
          // Fallback for older browsers
          const textArea = document.createElement("textarea");
          textArea.value = codeText;
          textArea.style.position = "fixed";
          textArea.style.opacity = "0";
          document.body.appendChild(textArea);
          textArea.select();
          try {
            document.execCommand("copy");
            const copyText = copyButton.querySelector(".copy-text");
            const copiedText = copyButton.querySelector(".copied-text");
            const copyIcon = copyButton.querySelector(".copy-icon");
            const checkmarkIcon = copyButton.querySelector(".checkmark-icon");

            // Change icon to checkmark
            copyIcon.style.display = "none";
            checkmarkIcon.style.display = "block";

            if (!isMobile) {
              // On desktop, show text feedback
              copyText.style.display = "none";
              copiedText.style.display = "inline";
            }
            copyButton.classList.add("copied");
            copyButton.setAttribute("aria-label", "Code copied");
            setTimeout(() => {
              // Change icon back to copy
              copyIcon.style.display = "block";
              checkmarkIcon.style.display = "none";

              if (!isMobile) {
                copyText.style.display = "inline";
                copiedText.style.display = "none";
              }
              copyButton.classList.remove("copied");
              copyButton.setAttribute("aria-label", "Copy code");
            }, 2000);
          } catch (fallbackErr) {
            console.error("Failed to copy code:", fallbackErr);
          }
          document.body.removeChild(textArea);
        }
      });

      // Insert copy button before toggle button if it exists, otherwise prepend to wrapper
      const toggleButton = wrapper.querySelector(".code-block-toggle");
      if (toggleButton) {
        wrapper.insertBefore(copyButton, toggleButton);
      } else {
        // If no toggle button exists yet, prepend to wrapper
        wrapper.insertBefore(copyButton, wrapper.firstChild);
      }
    }

    // Only create toggle and wrap if this is a new wrapper
    if (isNewWrapper) {
      // Create toggle button
      const toggle = document.createElement("button");
      toggle.className = "code-block-toggle";
      toggle.setAttribute("aria-label", "Toggle code block");
      toggle.setAttribute("aria-expanded", "false");
      toggle.innerHTML = `
        <span>Expand</span>
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
        </svg>
      `;

      // Create content wrapper
      const content = document.createElement("div");
      content.className = "code-block-content";

      // Wrap the block
      block.parentNode.insertBefore(wrapper, block);
      // Copy button is already in wrapper, just append toggle and content
      wrapper.appendChild(toggle);
      wrapper.appendChild(content);
      content.appendChild(block);

      // Add toggle functionality
      toggle.addEventListener("click", () => {
        const isCollapsed = wrapper.classList.contains("collapsed");
        wrapper.classList.toggle("collapsed");
        toggle.setAttribute("aria-expanded", !isCollapsed);
        toggle.querySelector("span").textContent = isCollapsed ? "Collapse" : "Expand";
      });
    }
  });
}

// Initialize on page load
(function () {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCollapsibleCodeBlocks);
  } else {
    initCollapsibleCodeBlocks();
  }
})();
