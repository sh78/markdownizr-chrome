import { toMarkdown } from './to-markdown.js';

// Initialize default settings
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    "strip_elements": "div, span, small, aside, section, article, header, footer, hgroup, time, address, button",
    "delete_elements": "script, noscript, canvas, embed, object, param, svg, source, nav, iframe, details"
  });
});

// Create context menu
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    title: "Get Markdown",
    id: "getMarkdown",
    contexts: ["page", "selection"]
  });
});

function callTab(tab) {
  chrome.tabs.sendMessage(tab.id, {"message": "wants_markdown"});
}

// Handle browser action click
chrome.action.onClicked.addListener((tab) => {
  callTab(tab);
});

// Handle context menu click
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "getMarkdown") {
    callTab(tab);
  }
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === "result_exists") {
    chrome.storage.local.get(["strip_elements", "delete_elements"], (result) => {
      const markdown = toMarkdown(request.content, {
        converters: [{
          filter: result.strip_elements.split(', '),
          replacement: (innerHTML) => innerHTML
        }, {
          filter: result.delete_elements.split(', '),
          replacement: () => ''
        }]
      });

      // Send markdown back to content script for copying
      chrome.tabs.sendMessage(sender.tab.id, {
        message: "copy_markdown",
        markdown: markdown
      });
    });
  }
});