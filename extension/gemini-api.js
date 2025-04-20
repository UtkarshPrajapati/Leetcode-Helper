const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-04-17:generateContent';

let GEMINI_API_KEY = "";

function loadApiKey() {
  return new Promise((resolve) => {
    chrome.storage.sync.get('geminiApiKey', function(data) {
      GEMINI_API_KEY = data.geminiApiKey || "";
      resolve(GEMINI_API_KEY);
    });
  });
}

async function validateApiKey(apiKey) {
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  
  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message || "Invalid API key");
    }
    
    if (data.models && Array.isArray(data.models)) {
      return true;
    }
    
    throw new Error("Unexpected API response format");
  } catch (error) {
    throw new Error(`API key validation failed: ${error.message}`);
  }
}

async function isApiKeyConfigured() {
  await loadApiKey();
  return GEMINI_API_KEY !== "";
}

async function getHintFromGemini(code, problemTitle, problemDescription) {
  if (!await isApiKeyConfigured()) {
    return {
      hint: "Error: Gemini API key not configured. Please set your API key in the extension settings.",
      bugs: "",
      optimization: ""
    };
  }

  const prompt = `
    You are a coding teacher helping a student solve a LeetCode problem.
    
    Problem: ${problemTitle}
    Description: ${problemDescription}
    
    Here is the student's current code:
    \`\`\`
    ${code}
    \`\`\`
    Format your response as helpful guidance a coding tutor would give with 'bullet points' etc for better visual appeal.
    Please provide:
    1. A helpful hint that guides them in the right direction without giving away the full solution. If the code is already correct, then explain that the code is correct and ask them to optimize it.
    2. If there are any bugs or edge cases they're missing, point them out
    3. If the code is fully correct, suggest an optimization and write the optimized code (or just the difference code) if applicable else write "No optimizations needed"
  `;

  try {
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
              thinkingBudget: 0
            }
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const result = await response.json();
    
    try {
      const content = result.candidates[0].content.parts[0];
      if (content.text) {
        try {
          return JSON.parse(content.text);
        } catch (error) {
          return { hint: content.text, bugs: "", optimization: "" };
        }
      } else {
        return content.inlineData.json;
      }
    } catch (error) {
      throw new Error(`Error processing Gemini response: ${error.message}`);
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return {
      hint: `Error getting hint: ${error.message}. Please check your API key and internet connection.`,
      bugs: "",
      optimization: ""
    };
  }
}

async function checkApiStatus() {
  if (await isApiKeyConfigured()) {
    return Promise.resolve({ 
      status: "ok", 
      message: "Gemini API key is configured" 
    });
  } else {
    return Promise.reject(new Error("Gemini API key not configured"));
  }
}

function saveApiKey(apiKey) {
  return new Promise(async (resolve, reject) => {
    try {
      await validateApiKey(apiKey);
      chrome.storage.sync.set({ 'geminiApiKey': apiKey }, function() {
        GEMINI_API_KEY = apiKey;
        resolve(true);
      });
    } catch (error) {
      reject(error);
    }
  });
} 