document.addEventListener('DOMContentLoaded', initializeExtension);
window.addEventListener('load', initializeExtension);

setTimeout(initializeExtension, 3000);

let overlay = null;
let problemTitle = "N/A";
let problemDescription = "N/A";

function initializeExtension() {
  if (document.querySelector('#leetcode-helper-overlay')) {
    return;
  }
  try {
    extractProblemInfo();
    createOverlay();
    document.getElementById('leetcode-helper-get-hint').addEventListener('click', getHint);
    document.getElementById('leetcode-helper-toggle').addEventListener('click', toggleOverlay);
  } catch (error) {
    console.error("Error during extension initialization:", error);
    displayErrorMessage("Error: LeetCode's page structure has changed. The extension may not work correctly.");
  }
}

function extractProblemInfo() {
  const titleElement = document.querySelector('div.text-title-large a[href^="/problems/"]');
  if (titleElement) {
    problemTitle = titleElement.textContent.trim();
  } else {
    const url = window.location.href;
    const problemMatch = url.match(/\/problems\/([^\/]+)/);
    if (problemMatch && problemMatch[1]) {
      const rawName = problemMatch[1];
      problemTitle = rawName
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    console.log("URL Problem Title", problemTitle);
  }

  try {
    const descriptionElement = document.querySelector('div.elfjS[data-track-load="description_content"]');
    if (descriptionElement) {
      problemDescription = descriptionElement.textContent.trim();
    }
  } catch (error) {
    console.error("Error extracting problem description:", error);
    displayErrorMessage("Error: LeetCode's page structure has changed. The extension may not work correctly.");
  }
}

function createOverlay() {
  try {
    overlay = document.createElement('div');
  } catch (error) {
    console.error("Error creating overlay element:", error);
    return;
  }

  overlay.id = 'leetcode-helper-overlay';
  overlay.className = 'leetcode-helper-overlay';
  
  if (!document.querySelector('link[href*="font-awesome"]')) {
    const faLink = document.createElement('link');
    faLink.rel = 'stylesheet';
    faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
    document.head.appendChild(faLink);
  } else {
    const statusIcon = document.getElementById('status-icon');
    if (statusIcon) {
        statusIcon.classList.add('connected');
    }
}
  
  overlay.innerHTML = `
    <div class="leetcode-helper-header">
      <div style="display: flex; align-items: center;">
        <i class="fa-solid fa-puzzle-piece" style="margin-right: 8px;"></i>
        <h3>LeetCode Helper</h3>
      </div>
      <button id="leetcode-helper-toggle" class="leetcode-helper-button"><i class="fa-solid fa-minus"></i></button>
    </div>
    <div class="leetcode-helper-content" id="leetcode-helper-content">
      <p><i class="fa-solid fa-lightbulb" style="color: #f1c40f; margin-right: 5px;"></i> Need help with your solution? Click the button below to get a hint!</p>
      <div style="margin-top: 15px;"></div>
      <button id="leetcode-helper-get-hint" class="leetcode-helper-button leetcode-helper-primary">
        <i class="fa-solid fa-wand-magic-sparkles"></i> Get Hint
      </button>
      <div id="leetcode-helper-hint-container" class="leetcode-helper-hint-container" style="display: none;">
        <div id="leetcode-helper-hint"></div>
        <div id="leetcode-helper-bugs"></div>
        <div id="leetcode-helper-optimization"></div>
      </div>
      <div id="leetcode-helper-loading" class="leetcode-helper-loading" style="display: none;">
        <p>Getting your hint...</p>
        <div style="margin-top: 15px;"></div>
        <div class="leetcode-helper-spinner"></div>
      </div>
    </div>
  `;

  try {
    document.body.appendChild(overlay);
  } catch (error) {
    console.error("Error appending overlay to the document:", error);
  }
}

function toggleOverlay() {
  try {
    const content = document.getElementById('leetcode-helper-content');
    const toggle = document.getElementById('leetcode-helper-toggle');
    
    if (content.style.display === 'none') {
      content.style.display = 'block';
      toggle.innerHTML = '<i class="fa-solid fa-minus"></i>';
    } else {
      content.style.display = 'none';
      toggle.innerHTML = '<i class="fa-solid fa-plus"></i>';
    }
  } catch (error) {
    console.error("Error toggling overlay:", error);
  }
}

function injectMonacoExtractor() {
  try {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('monaco-extractor.js');
    script.onload = () => script.remove();
    (document.head || document.documentElement).appendChild(script);
  } catch (error) {
    console.error("Error injecting Monaco extractor:", error);
  }
}

function getLeetCodeCode() {
  return new Promise((resolve) => {
    const handleMessage = (event) => {
      if (event.source !== window) return;
      if (event.data?.type === 'LEETCODE_CODE_EXTRACTED') {
        window.removeEventListener('message', handleMessage);
        if (event.data.code !== null) {
          console.log("Extracted code from Monaco:", event.data.code);
          resolve(event.data.code);
        } else {
          console.warn("Falling back to DOM-based extraction.");
          resolve(extractFromDOM());
        }
      }
    };
    window.addEventListener('message', handleMessage);
    injectMonacoExtractor();
  })
}

function extractFromDOM() {
  try {
    const codeContainer = document.querySelector('.view-lines.monaco-mouse-cursor-text');
    if (codeContainer) {
      try {
        const codeLines = codeContainer.querySelectorAll('.view-line');
        let code = '';
        codeLines.forEach(line => code += line.textContent + '\n');
        console.log("Extracted code from DOM (fallback):", code);
        return code;
      } catch (error) {
        console.error("Error extracting code lines from container:", error);
        return null;
      }
    }
    console.error("Could not extract code via DOM fallback.");
    return null;
  } catch (error) {
    console.error("Error during DOM-based code extraction:", error);
    return null;
  }
}

async function getHint() {
  try {
    document.getElementById('leetcode-helper-loading').style.display = 'flex';
    document.getElementById('leetcode-helper-hint-container').style.display = 'none';
  } catch (error) {
    console.error("Error updating overlay display:", error);
    displayErrorMessage("Error: LeetCode's page structure has changed. The extension may not work correctly.");
    return;
  }

    const code = await getLeetCodeCode();
  if (code) {
    try {
      const data = await getHintFromGemini(code, problemTitle, problemDescription);
      
      document.getElementById('leetcode-helper-loading').style.display = 'none';
      document.getElementById('leetcode-helper-hint-container').style.display = 'block';
      try {
        updateHintContainer(data);
      } catch (e) {
          console.error("Error updating hint container", e);
        document.getElementById('leetcode-helper-hint').innerHTML = "<h4>Error:</h4><p>Error updating the hint display. The extension may not work correctly.</p>";
      }
    } catch (error) {
      console.error("Error getting hint:", error);
      document.getElementById('leetcode-helper-loading').style.display = 'none';
      document.getElementById('leetcode-helper-hint').innerHTML = `<h4>Error:</h4><p>${error.message || "Could not get hint. Please check the Gemini API key in extension settings."}</p>`;
      document.getElementById('leetcode-helper-hint-container').style.display = 'block';
    }
  } else {
    document.getElementById('leetcode-helper-loading').style.display = 'none';
    document.getElementById('leetcode-helper-hint').innerHTML = "<h4>Error:</h4><p>Could not extract code from the editor.</p>";
    document.getElementById('leetcode-helper-hint-container').style.display = 'block';
  }
}

function displayErrorMessage(message) {
    try {
        const hintElement = document.getElementById('leetcode-helper-hint');
        if (hintElement) {
            hintElement.innerHTML = `<h4>Error:</h4><p>${message}</p>`;
        }
        const hintContainer = document.getElementById('leetcode-helper-hint-container');
        if (hintContainer) {
            hintContainer.style.display = 'block';
        }
    } catch (error) {
        console.error("Error displaying error message:", error);
    }
}

function updateHintContainer(data) {
    try {
        const hintElement = document.getElementById('leetcode-helper-hint');
        const bugsElement = document.getElementById('leetcode-helper-bugs');
        const optimizationElement = document.getElementById('leetcode-helper-optimization');
        hintElement.innerHTML = '';
        bugsElement.innerHTML = '';
        optimizationElement.innerHTML = '';
    } catch (error) {
        console.error("Error getting hint container elements:", error);
    }
  if (data.hint) {
    hintElement.innerHTML = `<h4>Hint:</h4><p>${formatTextWithCodeBlocks(data.hint)}</p>`;
  }
  
  if (data.bugs) {
    bugsElement.innerHTML = `<h4>Bugs & Edge Cases:</h4><p>${formatTextWithCodeBlocks(data.bugs)}</p>`;
  }
  
  if (data.optimization) {
    optimizationElement.innerHTML = `<h4>Optimization Tips:</h4><p>${formatTextWithCodeBlocks(data.optimization)}</p>`;
  }
}

function formatTextWithCodeBlocks(text) {
  text = text.replace(/```([\s\S]+?)```/g, function(match, code) {
    const langMatch = code.match(/^(\w+)\s+([\s\S]+)$/);
    if (langMatch) {
      return `<pre class="leetcode-helper-code-block" data-language="${langMatch[1]}"><code>${langMatch[2]}</code></pre>`;
    }
    return `<pre class="leetcode-helper-code-block"><code>${code}</code></pre>`;
  });
  text = text.replace(/``([\s\S]+?)``/g, function(match, code) {
    const langMatch = code.match(/^(\w+)\s+([\s\S]+)$/);
    if (langMatch) {
      return `<pre class="leetcode-helper-code-block" data-language="${langMatch[1]}"><code>${langMatch[2]}</code></pre>`;
    }
    return `<pre class="leetcode-helper-code-block"><code>${code}</code></pre>`;
  });
  return text.replace(/`([^`]+)`/g, '<code class="leetcode-helper-code">$1</code>');
} 