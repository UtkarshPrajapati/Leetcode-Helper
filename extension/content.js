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
  extractProblemInfo();
  createOverlay();
  document.getElementById('leetcode-helper-get-hint').addEventListener('click', getHint);
  document.getElementById('leetcode-helper-toggle').addEventListener('click', toggleOverlay);
}

function extractProblemInfo() {
  const titleElement = document.querySelector('div.text-title-large a[href^="/problems/"]');
  if (titleElement) {
    problemTitle = titleElement.textContent.trim();
  }
  const descriptionElement = document.querySelector('div.elfjS[data-track-load="description_content"]');
  if (descriptionElement) {
    problemDescription = descriptionElement.textContent.trim();
  }
}

function createOverlay() {
  overlay = document.createElement('div');
  overlay.id = 'leetcode-helper-overlay';
  overlay.className = 'leetcode-helper-overlay';
  overlay.innerHTML = `
    <div class="leetcode-helper-header">
      <h3>LeetCode Helper</h3>
      <button id="leetcode-helper-toggle" class="leetcode-helper-button">_</button>
    </div>
    <div class="leetcode-helper-content" id="leetcode-helper-content">
      <p>Need help with your solution? Click the button below to get a hint!</p>
      <div style="margin-top: 15px;"></div>
      <button id="leetcode-helper-get-hint" class="leetcode-helper-button leetcode-helper-primary">Get Hint</button>
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
  document.body.appendChild(overlay);
}

function toggleOverlay() {
  const content = document.getElementById('leetcode-helper-content');
  const toggle = document.getElementById('leetcode-helper-toggle');
  
  if (content.style.display === 'none') {
    content.style.display = 'block';
    toggle.textContent = '_';
  } else {
    content.style.display = 'none';
    toggle.textContent = '+';
  }
}

function injectMonacoExtractor() {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('monaco-extractor.js');
  script.onload = () => script.remove();
  (document.head || document.documentElement).appendChild(script);
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
  });
}

function extractFromDOM() {
  const codeContainer = document.querySelector('.view-lines.monaco-mouse-cursor-text');
  if (codeContainer) {
    const codeLines = codeContainer.querySelectorAll('.view-line');
    let code = '';
    codeLines.forEach(line => code += line.textContent + '\n');
    console.log("Extracted code from DOM (fallback):", code);
    return code;
  }
  console.error("Could not extract code via DOM fallback.");
  return null;
}

async function getHint() {
  document.getElementById('leetcode-helper-loading').style.display = 'flex';
  document.getElementById('leetcode-helper-hint-container').style.display = 'none';
  
  const code = await getLeetCodeCode();
  if (code) {
    try {
      const data = await getHintFromGemini(code, problemTitle, problemDescription);
      
      document.getElementById('leetcode-helper-loading').style.display = 'none';
      document.getElementById('leetcode-helper-hint-container').style.display = 'block';
      updateHintContainer(data);
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

function updateHintContainer(data) {
  const hintElement = document.getElementById('leetcode-helper-hint');
  const bugsElement = document.getElementById('leetcode-helper-bugs');
  const optimizationElement = document.getElementById('leetcode-helper-optimization');
  hintElement.innerHTML = '';
  bugsElement.innerHTML = '';
  optimizationElement.innerHTML = '';
  
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