# 🧪 Testing Guide for LeetCode Helper

This document provides guidance on how to test the LeetCode Helper extension during development. 🚀

## 📋 Prerequisites

Before testing, ensure that:

1. You have a valid Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)
2. You have installed the extension in Chrome developer mode
3. You have configured the API key in the extension settings

## 🔍 Manual Testing Steps

### 1. Testing Extension Installation and Configuration

1. **Install the Extension in Developer Mode** 📦
   ```
   - Open Chrome and navigate to chrome://extensions/
   - Enable "Developer mode" in the top-right corner
   - Click "Load unpacked" and select the `extension` folder
   ```

2. **Configure the Gemini API Key** 🔑
   ```
   - Click on the LeetCode Helper extension icon in the toolbar
   - Enter your Gemini API key in the form
   - Click "Save API Key"
   - Verify that the extension icon changes to the "enabled" state
   - The status should change to "Gemini API configured" with a green indicator
   ```

### 2. Testing the Extension on LeetCode

1. **Navigate to a LeetCode Problem** 🧩
   ```
   - Go to https://leetcode.com/problems/two-sum/ (or any other problem)
   - The LeetCode Helper overlay should appear in the bottom right corner
   ```

2. **Test Code Extraction** 💻
   ```
   - Write some code in the LeetCode editor
   - Click "Get Hint" in the LeetCode Helper overlay
   - Check the browser console (F12) to see if the code was extracted correctly
   ```

3. **Test Hint Generation** 💡
   ```
   - After clicking "Get Hint", the overlay should show a loading spinner
   - After a few seconds, it should display personalized hints
   - Verify that the hints are relevant to your code and the problem
   - Test collapsing and expanding the hint sections
   ```

### 3. Testing Run Code and Result Analysis 📊

1. **Navigate to a LeetCode Problem** 🧩
   ```
   - Go to any LeetCode problem page.
   ```

2. **Test Running Code and Waiting for Results** ▶️
   ```
   - Write some code in the LeetCode editor.
   - Click the standard LeetCode "Run Code" button.
   - Observe the browser console (F12) for logs from `getLeetCodeTestSummaryJSON` indicating the run is initiated and the script is waiting for results.
   - Verify that the script correctly waits for the results panel to appear and populate.
   ```

3. **Test Error Analysis** ❌
   ```
   - Write code that will cause a runtime error (e.g., division by zero, accessing an undefined variable).
   - Click "Run Code".
   - After the error appears on LeetCode, check the browser console logs.
   - Verify that the script detects the error state and attempts to extract the specific error message and the "Last Executed Input".
   - Check that the extracted error details and last input are logged correctly.
   ```

4. **Test Test Case Extraction and Analysis** ✅
   ```
   - Write code that passes some test cases and potentially fails others (or passes all).
   - Click "Run Code".
   - After the test results appear (showing "Accepted", "Wrong Answer", etc.), check the browser console logs.
   - Verify that the script identifies the test case tabs.
   - Verify that the script clicks each test case tab, waits briefly, and extracts the Input, Output, and Expected values for each case.
   - Check that the extracted test case data (including the `match` status) is logged correctly in the final JSON summary.
   - Test with problems that have multiple test cases.
   ```

## 🔧 Testing Different Scenarios

### Test Case 1: Correct Solution

1. Write a fully correct solution to a problem
2. Click "Get Hint"
3. The extension should recognize that the solution is correct and suggest optimizations
4. Test the collapsible sections for hint, bugs, and optimization information

### Test Case 2: Solution with Bugs

1. Write a solution with intentional bugs or edge case issues
2. Click "Get Hint"
3. The extension should identify the bugs and provide guidance on fixing them
4. Verify that the hints are well-formatted with bullet points and clear sections

### Test Case 3: Partial Solution

1. Write only a partial solution or function signature
2. Click "Get Hint"
3. The extension should provide guidance on how to approach the problem
4. Check that the animations work smoothly when expanding/collapsing sections

### Test Case 4: UI Interaction

1. Test minimizing and maximizing the overlay using the toggle button
2. Verify that all animations function correctly
3. Test expanding and collapsing individual hint sections
4. Ensure the overlay responds smoothly to all interactions

## 🐞 Troubleshooting Common Issues

### API Key Issues

- **"Gemini API key not configured"** ❌
  - Ensure you've entered a valid API key in the extension popup
  - Check that the API key is validated correctly with Google's API
  - Verify that the extension icon changes appropriately based on API key status

- **"API key validation failed"** ❌
  - Verify your API key is correct
  - Make sure you have sufficient quota/credits on your Google AI account

### Extension Functionality Issues

- **Overlay not appearing** 🔍
  - Refresh the page
  - Check if the URL matches the pattern in the manifest
  - Look for errors in the browser console (F12)

- **Cannot extract code** 📝
  - Check browser console for error messages
  - Verify if the Monaco editor is fully loaded
  - Try writing more code in the editor

- **No hints received** 💬
  - Verify your API key is working
  - Check network requests in the browser DevTools
  - Try with a simpler code sample

## 📊 Performance Testing

To test the performance of the extension:

1. **Response Time** ⏱️
   - Measure the time from clicking "Get Hint" to receiving a response
   - Should typically be within 2-5 seconds depending on network and AI processing time

2. **UI Responsiveness** 🖱️
   - The extension UI should remain responsive while waiting for hints
   - Test if you can minimize the overlay while waiting for a response
   - Verify that animations run smoothly on different devices and browser versions

## 🛠️ Development Debugging Tips

1. **Use Browser Console** 🖥️
   - Press F12 to open DevTools
   - Check the Console tab for errors and logs
   - Monitor Network requests to see API calls

2. **Test Code Changes** 🔄
   - After making changes to the extension, refresh it in `chrome://extensions/`
   - You may need to reload the LeetCode page as well

3. **Inspect DOM Elements** 🔍
   - Use DevTools to inspect the extension overlay
   - Check if elements are being created as expected
   - Test the CSS animations and transitions using the Elements panel

4. **Manual API Testing** 🧪
   - You can test the Gemini API directly using tools like Postman
   - This helps isolate issues between the extension and the API 

5. **Icon State Testing** 🖼️
   - Test that the extension icon changes correctly when the API key is:
     - Configured correctly (should display enabled.png)
     - Not configured or invalid (should display disabled.png)
   - Verify icon changes are persistent between browser sessions 