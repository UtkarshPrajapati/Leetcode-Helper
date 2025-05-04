# LeetCode Helper Chrome Extension 🧩

A Chrome extension that provides personalized hints for LeetCode problems using Google's Gemini AI.

## ✨ Features

- 🔗 Integrates seamlessly with LeetCode problem pages
- 🔍 Extracts your code directly from the LeetCode editor
- 💡 Provides personalized hints based on your current code
- 🐞 Identifies bugs and edge cases in your solution
- ⚡ Suggests code optimizations for better performance
- 🎨 Interactive UI with collapsible sections and smooth animations
- 📋 Well-structured hints with bullet points and clear formatting
- 🔒 Direct Gemini API integration (no backend server required)

## 🛠️ Setup Instructions

1. **Get a Gemini API Key** 🔑
   - Visit [Google AI Studio](https://aistudio.google.com/apikey) and create an account
   - Create a new API key in the Google AI Studio dashboard
   - You'll need this key to configure the extension

2. **Install the Extension** 📦
   - Clone or download this repository
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top-right corner
   - Click "Load unpacked" and select the `extension` folder from this repository

3. **Configure the Extension** ⚙️
   - Click on the LeetCode Helper extension icon in your browser toolbar
   - Enter your Gemini API key in the form and save it
   - The extension icon will change to indicate that the API key is configured correctly

4. **Using the Extension** 🚀
   - Navigate to any LeetCode problem
   - Write your solution in the code editor
   - You can now click the **"Run Code" button** on LeetCode. The extension will wait for the results to appear.
   - After running, the extension will analyze the results, including **console output, error details (if any), and individual test case results (Input, Output, Expected, and whether they match)**. This information will be used to provide more context-aware hints.
   - Alternatively, you can still click the "Get Hint" button in the LeetCode Helper overlay.
   - The extension will analyze your code and provide personalized hints.
   - Expand or collapse hint sections as needed to focus on relevant information

## 🔒 Privacy

- Your code and problem details are sent directly to Google's Gemini API
- No data is stored on any third-party servers
- Your API key is stored securely in Chrome's storage and is only used for making API calls to Gemini

## ⚠️ Limitations

- Requires a valid Gemini API key
- The free tier of Gemini API has usage limits (check Google's documentation for current limits)
- The extension only works on LeetCode problem pages

## 🔧 Troubleshooting

- If the extension isn't appearing on LeetCode, try refreshing the page
- If you see a blank overlay, wait a few seconds as it might be loading
- If you're not getting hints, check that your API key is valid and correctly configured
- If you see an error message when getting a hint, check the browser console (F12) for detailed error information
- For network-related issues, ensure you have a stable internet connection
- If the extension appears to hang, refresh the page and try again

## 📁 Project Structure

```
extension/                # Chrome extension
├── manifest.json         # Extension manifest
├── content.js            # Content script for LeetCode page
├── gemini-api.js         # Handles Gemini API communication
├── monaco-extractor.js   # Extracts code from Monaco editor
├── background.js         # Background script for extension state
├── popup.html            # Popup UI for configuration
├── popup.js              # Popup logic
├── overlay.css           # Styling for the overlay
└── images/               # Extension icons and images
```

## 🚀 How It Works

1. The extension injects an interactive overlay onto LeetCode problem pages
2. It extracts problem information and your current code using the Monaco editor API
3. When you click "Get Hint", it sends this information to Google's Gemini API
4. The AI analyzes your code and returns:
   - 💡 Clear, structured hints that guide you in the right direction
   - 🐞 Potential bugs or edge cases you might have missed
   - ⚡ Optimization suggestions for your code
5. The extension displays these hints in a user-friendly format with collapsible sections