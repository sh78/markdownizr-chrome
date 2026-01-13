chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === "wants_markdown") {
    // Get URL of the current page
    const pageLocation = window.location.href;
    
    // Get selection
    const selection = window.getSelection();
    
    // Create a new element to hold the HTML content
    const html = document.createElement('div');

    if (selection.type === "Range") {
      // Get the highlighted content's source
      const range = selection.getRangeAt(0);
      html.appendChild(range.cloneContents());
    } else {
      // Clone the entire body if no selection
      html.innerHTML = document.body.innerHTML;
    }

    // Send the HTML content to the background script
    chrome.runtime.sendMessage({
      "message": "result_exists",
      "url": pageLocation,
      "content": html.innerHTML
    });

    // Create and show status message
    showStatusMessage("Markdown Copied To Clipboard");
  } else if (request.message === "copy_markdown") {
    // Copy the markdown to clipboard
    copyToClipboard(request.markdown);
    showStatusMessage("Markdown Copied To Clipboard");
  }
});

function showStatusMessage(message) {
  let statusDiv = document.getElementById('markdownizr-status');
  if (!statusDiv) {
    statusDiv = document.createElement('div');
    statusDiv.id = 'markdownizr-status';
    document.body.appendChild(statusDiv);
  }

  statusDiv.textContent = message;
  statusDiv.style.cssText = `
    display: none;
    color: white;
    font-family: monospace;
    font-size: 24px;
    text-align: center;
    width: 20%;
    min-width: 240px;
    background: rgba(0, 0, 0, .5);
    border-radius: 10px;
    padding: 1em;
    position: fixed;
    z-index: 1000000000;
    left: 50%;
    top: 20%;
    transform: translateX(-50%);
  `;

  // Show and hide the status message
  statusDiv.style.display = 'block';
  setTimeout(() => {
    statusDiv.style.display = 'none';
  }, 2000);
}

function copyToClipboard(text) {
  const textarea = document.createElement('textarea');
  textarea.style.position = 'fixed';
  textarea.style.opacity = 0;
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('Copy');
  document.body.removeChild(textarea);
}