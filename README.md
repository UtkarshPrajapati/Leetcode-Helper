# LeetCode Helper Chrome Extension

A Chrome extension that provides personalized hints for LeetCode problems using Google's Gemini AI.

## Features

- Integrates with LeetCode problem pages
- Provides personalized hints based on your current code
- Identifies bugs and edge cases in your solution
- Suggests code optimizations
- No external dependencies or backend required

## Setup Instructions

1. **Get a Gemini API Key**
   - Visit [Google AI Studio](https://ai.google.dev/) and create an account
   - Create a new API key in the Google AI Studio dashboard
   - You'll need this key to configure the extension

2. **Install the Extension**
   - Clone or download this repository
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top-right corner
   - Click "Load unpacked" and select the `extension` folder from this repository

3. **Configure the Extension**
   - Click on the LeetCode Helper extension icon in your browser toolbar
   - Enter your Gemini API key in the form and save it
   - You should see a green status indicator when the API key is configured correctly

4. **Using the Extension**
   - Navigate to any LeetCode problem
   - Write your solution in the code editor
   - Click the "Get Hint" button in the LeetCode Helper overlay
   - The extension will analyze your code and provide personalized hints

## Privacy

- Your code and problem details are sent directly to Google's Gemini API
- No data is stored on any third-party servers
- Your API key is stored securely in Chrome's storage and is only used for making API calls

## Limitations

- Requires a valid Gemini API key
- The free tier of Gemini API has usage limits
- The extension only works on LeetCode problem pages

## Troubleshooting

- If the extension isn't appearing on LeetCode, refresh the page
- If you're not getting hints, check that your API key is valid and correctly configured
- For other issues, check the console log for error messages

## Project Structure

```
├── backend/              # FastAPI backend
│   ├── main.py           # Main FastAPI application
│   ├── requirements.txt  # Python dependencies
│   └── .env.example      # Environment variables template
│
├── extension/            # Chrome extension
│   ├── manifest.json     # Extension manifest
│   ├── content.js        # Content script for LeetCode page
│   ├── popup.html        # Popup UI
│   ├── popup.js          # Popup logic
│   ├── overlay.css       # Styling for the overlay
│   └── images/           # Extension icons (create this directory)
│
├── start_backend.bat     # Windows batch file to start the backend
└── README.md             # This README file
```

## Usage

1. Make sure the FastAPI backend is running locally

2. Navigate to a LeetCode problem

3. The LeetCode Helper overlay should appear in the bottom right corner

4. Click "Get Hint" to receive personalized guidance based on your current code

## Automating Backend Startup (Windows)

You can use Windows Task Scheduler to automatically start the FastAPI backend when you log in:

1. Open Task Scheduler
2. Create a Basic Task
3. Set it to trigger at log on
4. Set the action to "Start a program"
5. Enter the path to the included batch file:
   ```
   C:\path\to\your\directory\start_backend.bat
   ```

## License

MIT 