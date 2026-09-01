// content.js - MV3 content script for L3-019 training job
// This script runs in the context of web pages and transforms content

// Listen for messages from popup or background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "transformPage") {
    transformPageContent();
    sendResponse({status: "transformed"});
  } else if (request.action === "restorePage") {
    restorePageContent();
    sendResponse({status: "restored"});
  }
});

// Transform page content by escaping HTML and adding markers
function transformPageContent() {
  // Store original content in data attributes
  const body = document.body;
  const originalBodyHTML = body.innerHTML;

  // Escape HTML in text nodes
  const walker = document.createTreeWalker(
    body,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );

  const textNodes = [];
  let node;
  while (node = walker.nextNode()) {
    textNodes.push(node);
  }

  // Escape HTML in text nodes and store original
  textNodes.forEach(textNode => {
    if (textNode.textContent.trim() !== '') {
      const escapedText = escapeHtml(textNode.textContent);
      textNode.textContent = escapedText;

      // Store original in data attribute for restoration
      const parent = textNode.parentElement;
      if (parent) {
        parent.setAttribute('data-original-text', textNode.textContent);
      }
    }
  });

  // Add visual markers to transformed elements
  const elements = document.querySelectorAll('*');
  elements.forEach(el => {
    if (el.innerHTML.trim() !== '') {
      el.setAttribute('data-transformed', 'true');
    }
  });
}

// Restore original page content
function restorePageContent() {
  const elements = document.querySelectorAll('[data-transformed="true"]');
  elements.forEach(el => {
    // Restore original text from data attribute if available
    const originalText = el.getAttribute('data-original-text');
    if (originalText) {
      // For text nodes, we need to replace the content properly
      // This is a simplified approach - in practice, more complex restoration might be needed
      el.textContent = originalText;
    }
  });

  // Remove all data attributes used for transformation
  const allElements = document.querySelectorAll('*');
  allElements.forEach(el => {
    el.removeAttribute('data-transformed');
    el.removeAttribute('data-original-text');
  });
}

// Simple HTML escaping function (from L1-013)
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}
