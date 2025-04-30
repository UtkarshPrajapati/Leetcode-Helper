const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-04-17:generateContent';

let GEMINI_API_KEY = "";

function loadApiKey() {
  return new Promise((resolve) => {
    try {
      chrome.storage.sync.get('geminiApiKey', function(data) {
        GEMINI_API_KEY = data.geminiApiKey || "";
        resolve(GEMINI_API_KEY);
      });
    } catch (error) {
      console.error("Error loading API key from storage:", error);
      resolve(""); // Return empty string on error
    }
  });
}

async function validateApiKey(apiKey) {
  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '') {
    throw new Error("API key cannot be empty");
  }
  
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message || "Invalid API key");
    }
    
    if (data.models && Array.isArray(data.models)) {
      return true;
    }
    
    throw new Error("Unexpected API response format");
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error("API key validation timed out. Please check your internet connection.");
    }
    throw new Error(`API key validation failed: ${error.message}`);
  }
}

async function isApiKeyConfigured() {
  await loadApiKey();
  return GEMINI_API_KEY !== "";
}

async function getHintFromGemini(code, problemTitle, problemDescription) {
  if (!code) {
    return {
      hint: "Error: No code was provided to analyze.",
      bugs: "",
      optimization: ""
    };
  }
  
  if (!await isApiKeyConfigured()) {
    return {
      hint: "Error: Gemini API key not configured. Please set your API key in the extension settings.",
      bugs: "",
      optimization: ""
    };
  }

  // Sanitize inputs
  const sanitizedTitle = (problemTitle || "Untitled Problem").substring(0, 500);
  const sanitizedDescription = (problemDescription || "No description provided").substring(0, 1000);
  const sanitizedCode = (code || "").substring(0, 10000); // Limit code length
  
  const prompt = `
  You are a calm, helpful coding teacher guiding a student who is solving a LeetCode problem.
  
  Problem: ${sanitizedTitle}
  Description: ${sanitizedDescription}
  
  The student’s current code:
  \`\`\`
  ${sanitizedCode}
  \`\`\`
  
  📜 FORMAT RULES:
  - DO NOT solve the problem directly.
  - Make the thing bold by encapsulating the text like *sample text* if that word/group of word is important.
  - Write your response in **three distinct sections** using headers:
    💡 Hints
    🐛 Bugs
    ⚡ Optimization Tips
  
  🧩 Hint Rules:
  - Provide 2-3 numbered hints
  - Each hint must begin with a NEW LINE using this format:
  \n• Hint 1: ...
  \n• Hint 2: ...
  \n• Hint 3: ...
  - Make hints progressive: 1st is general, 2nd is more specific, 3rd is close to solving
  - If code is fully correct, state that in Hint 1 and suggest improvements in optimization
  
  📋 Bugs:
  - Use bullet points (•)
  - Mention missing parts clearly and **why** they matter
  
  ⚙️ Optimization Tips:
  - Write only the part that can be optimized, and if it can't be optimised then say: "No optimizations needed"
  - Use code blocks (\`\`\`) if suggesting code changes
  
  Keep paragraphs short and scannable. Do not write huge blobs of text.
  `;  

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    const response = await fetch(
      `${GEMINI_API_ENDPOINT}?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            response_mime_type: "application/json",
            response_schema: {
              type: "OBJECT",
              properties: {
                hint: { type: "STRING" },
                bugs: { type: "STRING" },
                optimization: { type: "STRING" }
              }
            },
            thinkingConfig: {
              thinkingBudget: 1000
            }
          }
        }),
        signal: controller.signal
      }
    );
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      let message = `Network error: Could not connect to the Gemini API. Please check your internet connection. (Status: ${response.status})`;
      if (response.status === 400) {
        message = "API key error: The provided API key is invalid or has insufficient quota.";
      }
      throw new Error(message);
    }

    const result = await response.json();
    
    try {
      if (!result.candidates || !result.candidates.length) {
        throw new Error("Empty response from Gemini API");
      }
      
      const content = result.candidates[0].content.parts[0];
      if (content.text) {
        try {
          const parsedResponse = JSON.parse(content.text);
          return {
            hint: parsedResponse.hint || "",
            bugs: parsedResponse.bugs || "",
            optimization: parsedResponse.optimization || ""
          };
        } catch (error) {
          return { 
            hint: content.text, 
            bugs: "", 
            optimization: "" 
          };
        }
      } else if (content.inlineData && content.inlineData.json) {
        return {
          hint: content.inlineData.json.hint || "",
          bugs: content.inlineData.json.bugs || "",
          optimization: content.inlineData.json.optimization || ""
        };
      } else {
        throw new Error("Unexpected response format from Gemini API");
      }
    } catch (error) {
      throw new Error(`API response error: The Gemini API returned an unexpected response. ${error.message}`);
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error.name === 'AbortError') {
      return {
        hint: "Error: The request to Gemini API timed out. Please try again later.",
        bugs: "",
        optimization: ""
      };
    }
    return {
      hint: `Error getting hint: ${error.message}`,
      bugs: "",
      optimization: ""
    };
  }
}

async function checkApiStatus() {
  try {
    if (await isApiKeyConfigured()) {
      return { 
        status: "ok", 
        message: "Gemini API key is configured" 
      };
    } else {
      throw new Error("Gemini API key not configured");
    }
  } catch (error) {
    return {
      status: "error",
      message: error.message
    };
  }
}

function saveApiKey(apiKey) {
  return new Promise(async (resolve, reject) => {
    if (!apiKey || typeof apiKey !== 'string') {
      reject(new Error("Invalid API key format"));
      return;
    }
    
    try {
      await validateApiKey(apiKey);
      chrome.storage.sync.set({ 'geminiApiKey': apiKey }, function() {
        if (chrome.runtime.lastError) {
          reject(new Error(`Error saving API key: ${chrome.runtime.lastError.message}`));
          return;
        }
        GEMINI_API_KEY = apiKey;
        resolve(true);
      });
    } catch (error) {
      reject(error);
    }
  });
} 