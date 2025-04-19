# Testing Guide for LeetCode Helper

This document provides guidance on how to test the LeetCode Helper extension during development.

## Prerequisites

Before testing, ensure that:

1. You have set up the backend correctly with your Gemini API key in the `.env` file
2. You have installed the extension in Chrome developer mode
3. The FastAPI backend is running (via `uvicorn` or the `start_backend.bat` file)

## Testing the Backend

1. Start the FastAPI backend:
   ```
   cd backend
   uvicorn main:app --reload
   ```

2. Open your browser and navigate to: `http://localhost:8000/`
   - You should see a JSON response: `{"message": "LeetCode Helper API is running"}`

3. Test the API endpoint manually using a tool like curl, Postman, or a simple fetch from the browser console:
   ```
   curl -X POST http://localhost:8000/get_hint \
     -H "Content-Type: application/json" \
     -d '{"code": "def twoSum(nums, target):\n    # TODO: Implement this\n    pass", "problem_title": "Two Sum", "problem_description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target."}'
   ```
   - This should return a JSON response with hints from the Gemini API

## Testing the Chrome Extension

1. Ensure the backend is running

2. Open the Chrome Extensions page (`chrome://extensions/`) 
   - Ensure "Developer mode" is enabled
   - Click "Load unpacked" and select the `extension` directory if not already loaded
   - If you've made changes to the extension files, click the refresh icon on the extension card

3. Click on the extension icon in the Chrome toolbar
   - The popup should display and show "Connected to backend" if the backend is running
   - If not, it should show "Cannot connect to backend"

4. Navigate to a LeetCode problem (e.g., `https://leetcode.com/problems/two-sum/`)

5. Check if the LeetCode Helper overlay appears in the bottom right corner of the page

6. Write some incomplete code in the LeetCode editor (e.g., just the function signature)

7. Click the "Get Hint" button in the overlay
   - The overlay should show a loading indicator
   - After a few seconds, you should receive a hint about how to solve the problem

## Common Issues and Debugging

### Backend Issues

- **Error when starting the backend**: Make sure all dependencies are installed and the virtual environment is activated
- **"GEMINI_API_KEY environment variable not set"**: Make sure you have created a `.env` file with your API key
- **API call errors**: Check the terminal where the backend is running for detailed error messages

### Extension Issues

- **Extension not showing up on LeetCode**: Make sure the content scripts match pattern includes the LeetCode URL you're visiting
- **Cannot extract code**: Open the browser console (F12) and check for error messages
- **No connection to backend**: Make sure the backend is running and check for CORS issues in the browser console
- **Overlay not showing**: Manually inspect the DOM to see if the overlay element is being created and check for CSS/styling issues

## Debugging Tips

1. Use `console.log()` statements in `content.js` to debug the extension
2. Check the browser console (F12) for any JavaScript errors
3. Use the Network tab in Chrome DevTools to monitor the API requests
4. Add print statements in `main.py` to debug the backend processing 