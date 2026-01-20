// Collapsible Code Blocks

/**
 * Extract language from code block
 */
function extractLanguage(block) {
  // Try to find code element inside highlight block
  const codeElement = block.querySelector("code");
  if (codeElement) {
    // Check data-lang attribute first
    const dataLang = codeElement.getAttribute("data-lang");
    if (dataLang) {
      return dataLang;
    }
    // Check for language-* class
    const classList = Array.from(codeElement.classList);
    const langClass = classList.find((cls) => cls.startsWith("language-"));
    if (langClass) {
      return langClass.replace("language-", "");
    }
  }
  return null;
}

/**
 * Capitalize first letter of language name
 */
function capitalizeLanguage(lang) {
  if (!lang) return "";
  return lang.charAt(0).toUpperCase() + lang.slice(1);
}

/**
 * Count lines in code block
 */
function countCodeLines(block) {
  const codeElement = block.querySelector("code") || block;
  const text = codeElement.textContent || codeElement.innerText || "";
  // Split by newlines and count all lines
  const lines = text.split("\n");
  // Remove trailing empty line if present (common in code blocks)
  if (lines.length > 0 && lines[lines.length - 1].trim().length === 0) {
    lines.pop();
  }
  return lines.length;
}

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

    // Check if block should be collapsed by default (via data attribute)
    const shouldCollapse = block.hasAttribute("data-collapse") && 
                           block.getAttribute("data-collapse") === "true";

    // Count lines to determine if collapse should be available
    const lineCount = countCodeLines(block);
    const isCollapsible = lineCount >= 5;

    // If not wrapped, create wrapper
    if (!wrapper) {
      wrapper = document.createElement("div");
      // Default to expanded, unless data-collapse="true" is set AND block is collapsible
      // If block has less than 5 lines, ignore shouldCollapse
      const shouldBeCollapsed = isCollapsible && shouldCollapse;
      wrapper.className = shouldBeCollapsed ? "code-block-wrapper collapsed" : "code-block-wrapper";
      isNewWrapper = true;
    }

    // Extract language
    const language = extractLanguage(block);
    const languageLabel = capitalizeLanguage(language);

    // Check if header bar already exists
    let headerBar = wrapper.querySelector(".code-block-header");

    // Create header bar if it doesn't exist
    if (!headerBar && isNewWrapper) {
      headerBar = document.createElement("div");
      headerBar.className = "code-block-header";

      // Language label
      if (language) {
        const langLabel = document.createElement("span");
        langLabel.className = "code-block-lang";
        langLabel.textContent = languageLabel;
        headerBar.appendChild(langLabel);
      }

      // Button container
      const buttonContainer = document.createElement("div");
      buttonContainer.className = "code-block-buttons";

      // Copy button
      const copyButton = document.createElement("button");
      copyButton.className = "code-block-copy";
      copyButton.setAttribute("aria-label", "Copy code");
      copyButton.setAttribute("title", "Copy code");
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

          // Update aria-label and title for accessibility
          copyButton.setAttribute("aria-label", "Code copied");
          copyButton.setAttribute("title", "Copied!");

          // Change icon to checkmark
          copyIcon.style.display = "none";
          checkmarkIcon.style.display = "block";

          if (!isMobile) {
            // On desktop, show text feedback temporarily
            copyText.style.display = "none";
            copiedText.style.display = "inline";
          }
          copyButton.classList.add("copied");

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
            copyButton.setAttribute("title", "Copy code");
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
              copyText.style.display = "none";
              copiedText.style.display = "inline";
            }
            copyButton.classList.add("copied");
            copyButton.setAttribute("aria-label", "Code copied");
            copyButton.setAttribute("title", "Copied!");
            setTimeout(() => {
              copyIcon.style.display = "block";
              checkmarkIcon.style.display = "none";

              if (!isMobile) {
                copyText.style.display = "inline";
                copiedText.style.display = "none";
              }
              copyButton.classList.remove("copied");
              copyButton.setAttribute("aria-label", "Copy code");
              copyButton.setAttribute("title", "Copy code");
            }, 2000);
          } catch (fallbackErr) {
            console.error("Failed to copy code:", fallbackErr);
          }
          document.body.removeChild(textArea);
        }
      });

      buttonContainer.appendChild(copyButton);

      // Toggle button - only add if code block has 5 or more lines
      if (isCollapsible) {
        // Determine initial collapsed state (only if data-collapse="true" is set)
        const initialCollapsed = shouldCollapse;
        const toggle = document.createElement("button");
        toggle.className = "code-block-toggle";
        toggle.setAttribute("aria-label", initialCollapsed ? "Expand code block" : "Collapse code block");
        toggle.setAttribute("aria-expanded", initialCollapsed ? "false" : "true");
        toggle.setAttribute("title", initialCollapsed ? "Expand" : "Collapse");
        toggle.innerHTML = `
          <svg class="toggle-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
          <span class="toggle-text">${initialCollapsed ? "Expand" : "Collapse"}</span>
        `;

        // Add toggle functionality
        toggle.addEventListener("click", () => {
          const isCollapsed = wrapper.classList.contains("collapsed");
          wrapper.classList.toggle("collapsed");
          toggle.setAttribute("aria-expanded", !isCollapsed);
          toggle.setAttribute("title", isCollapsed ? "Collapse" : "Expand");
          toggle.setAttribute("aria-label", isCollapsed ? "Collapse code block" : "Expand code block");
          const toggleText = toggle.querySelector(".toggle-text");
          if (toggleText) {
            toggleText.textContent = isCollapsed ? "Collapse" : "Expand";
          }
        });

        buttonContainer.appendChild(toggle);
      }

      headerBar.appendChild(buttonContainer);

      // Prepend header bar to wrapper
      wrapper.insertBefore(headerBar, wrapper.firstChild);
    }

    // Only create content wrapper and wrap if this is a new wrapper
    if (isNewWrapper) {
      // Create content wrapper
      const content = document.createElement("div");
      content.className = "code-block-content";

      // Wrap the block
      block.parentNode.insertBefore(wrapper, block);
      wrapper.appendChild(content);
      content.appendChild(block);
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
