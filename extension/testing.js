async function getLeetCodeTestSummaryJSON() {
    // 1. Click Run
    console.log("Phase 1: Initiating Code Run...");
    const runButton = document.querySelector('[data-e2e-locator="console-run-button"]');
    if (runButton) {
      runButton.click();
      console.log("Run button clicked.");
    } else {
      console.error("Could not find the Run Code button! Cannot proceed.");
      return { consoleOutput: "Error: Run Button Not Found", errorDetails: { message: "Could not find LeetCode's run button.", lastInput: null }, testCases: [] };
    }
  
    // 2. Wait for result
    console.log("Phase 2: Waiting for results...");
    let consoleOutputElement;
    try {
        await new Promise((resolve, reject) => {
            let checkCount = 0;
            const maxChecks = 50; // Wait max ~10 seconds
            const interval = setInterval(() => {
                consoleOutputElement = document.querySelector('[data-e2e-locator="console-result"]');
                if (consoleOutputElement && consoleOutputElement.textContent.trim().length > 0 && consoleOutputElement.offsetParent !== null) {
                    console.log("Results panel populated and visible.");
                    clearInterval(interval);
                    resolve();
                } else if (checkCount++ > maxChecks) {
                    clearInterval(interval);
                    console.error("Timeout waiting for results panel to populate/become visible.");
                    reject(new Error("Timeout waiting for results panel."));
                }
            }, 200);
        });
    } catch (error) {
         return { consoleOutput: "Error: Timeout", errorDetails: { message: error.message || "Timed out waiting for LeetCode results panel.", lastInput: null }, testCases: [] };
    }
  
    // 3. Analyze results
    console.log("Phase 3: Analyzing results...");
    const consoleOutput = consoleOutputElement ? consoleOutputElement.textContent.trim() : "Unknown Result";
  
    let errorDetails = null;
    let testCases = [];
  
    // Check for initial error state
    if (consoleOutput.toLowerCase().includes("error") || consoleOutput.toLowerCase().includes("fail")) {
      console.warn(`Detected potential error state: ${consoleOutput}. Attempting to extract specific details...`);
      let errorMessage = consoleOutput;
  
      // *** Error Message Extraction Logic (Seems OK now) ***
      try {
          let specificErrorElement = null;
          const commonParent = consoleOutputElement?.closest('.space-y-4');
          if (commonParent) {
              specificErrorElement = commonParent.querySelector('.font-menlo[class*="text-red-"], .font-menlo[class*="text-error"], .font-menlo[class*="dark:text-red-"]');
              if (specificErrorElement) {
                   console.log("Found specific error message element via common parent search.");
                   errorMessage = specificErrorElement.textContent.trim();
              } else {
                   console.warn("Could not find specific error message element via common parent. Will attempt fallback.");
              }
          } else {
               console.warn("Could not find common parent container for error search.");
          }
          if (errorMessage === consoleOutput) {
              console.log("Attempting fallback error container search...");
              const statusParent = consoleOutputElement?.closest('div.flex')?.parentElement;
              let errorContainer = statusParent?.querySelector('div.group.relative[class*="bg-red"], div[class*="text-red"], div[class*="color: rgb(239, 68, 68)"]');
              if (!errorContainer) {
                   errorContainer = document.querySelector('div.group.relative[class*="bg-red"], div[class*="text-red-"], div[class*="text-error"], div[class*="color: rgb(239, 68, 68)"]');
                   if(errorContainer) console.log("Used broader document search for fallback error container.");
              }
              if (errorContainer) {
                  console.log("Found fallback error container.");
                  let fallbackMessage = errorContainer.textContent?.trim() || "";
                  fallbackMessage = fallbackMessage.replace(/\s+/g, ' ').trim();
                  if (fallbackMessage && fallbackMessage.toLowerCase() !== consoleOutput.toLowerCase()) {
                       errorMessage = fallbackMessage;
                       console.warn("Used fallback error container text content as error message.");
                  } else {
                       console.warn("Fallback error container text was empty, whitespace, or same as status; using main status as message.");
                  }
              } else {
                   console.warn("Could not find any specific error details container (fallback also failed); using main status as error message.");
              }
          }
      } catch(e) {
          console.error("Error during specific error message extraction:", e);
          errorMessage = consoleOutput;
      }
      // *** END OF Error Message Extraction Logic ***
  
  
      // *** MODIFIED Last Executed Input Extraction Logic ***
      let lastInputText = "Last executed input not found.";
       const lastInputLabel = Array.from(document.querySelectorAll('div.text-xs.font-medium, div.text-label-3'))
                             .find(el => el.textContent.trim().startsWith('Last Executed Input'));
       if (lastInputLabel) {
           // Try to find the container holding the input blocks, usually next to or within the label's parent scope
           let inputContainer = null;
           // Strategy 1: Check the immediate next sibling of the label
           if (lastInputLabel.nextElementSibling) {
              inputContainer = lastInputLabel.nextElementSibling;
           }
           // Strategy 2: If next sibling isn't it, check for a specific container (like .space-y-2) within the label's parent
           if (!inputContainer || !inputContainer.querySelector('.font-menlo')) {
               const parent = lastInputLabel.parentElement;
               inputContainer = parent ? parent.querySelector('div.space-y-2') : null; // Common pattern for multi-input container
           }
            // Strategy 3: Broad fallback (less ideal as it might grab too much) - check sibling of parent
            if (!inputContainer || !inputContainer.querySelector('.font-menlo')) {
               const parentSibling = lastInputLabel.parentElement?.nextElementSibling;
               if(parentSibling?.querySelector('.font-menlo')) {
                   inputContainer = parentSibling;
                   console.log("Used parent's sibling for last input container.");
               }
           }
  
  
           if (inputContainer) {
               // Find ALL '.font-menlo' elements within the identified container
               const allMenloElements = inputContainer.querySelectorAll('.font-menlo');
  
               // *** FILTER OUT elements that look like error messages ***
               const inputElements = Array.from(allMenloElements).filter(el =>
                   !el.matches('[class*="text-red-"], [class*="text-error"], [class*="dark:text-red-"]') // Exclude red/error text
               );
  
               if (inputElements.length === 0 && allMenloElements.length > 0) {
                   console.warn("Found '.font-menlo' elements but all matched error style filters. Check selectors.");
                   // Attempt to use the container's text as a last resort, trimming whitespace aggressively
                   lastInputText = inputContainer.textContent?.replace(/[\s\uFEFF\xA0]+/g, ' ').trim() || "Filtered elements were empty.";
               } else {
                   const inputs = [];
                   inputElements.forEach(el => { // Process only the filtered (non-error) elements
                       let labelText = "";
                       const valueWrapper = el.closest('.group.relative'); // Container for label+value usually
                       if (valueWrapper) {
                           // Find the parameter label (e.g., 'tops =')
                           const labelEl = valueWrapper.querySelector('.text-xs.text-label-3, .text-xs[class*="label-3"]');
                           if (labelEl) {
                              labelText = labelEl.textContent.trim();
                           }
                       }
                       const separator = labelText ? (labelText.endsWith('=') ? ' ' : ' = ') : '';
                       inputs.push(`${labelText}${separator}${el.textContent.trim()}`);
                   });
  
                   if (inputs.length > 0) {
                       lastInputText = inputs.join('\n'); // Join multi-params with newline
                       console.log("Extracted last input details (multi-param aware, errors excluded).");
                   } else {
                      // This might happen if the structure is unexpected OR if input was truly empty
                      lastInputText = "Input parameters not found in container.";
                      console.warn("Could not find specific input parameter elements after filtering.");
                   }
               }
           } else { console.warn("Could not find the specific container for last executed inputs."); }
       } else { console.warn("Could not find 'Last Executed Input' label."); }
       // *** END OF MODIFIED Last Executed Input Extraction Logic ***
  
      errorDetails = { message: errorMessage, lastInput: lastInputText };
      testCases = [];
  
    } else { // *** NO ERROR PATH (Seems OK now) ***
      console.log(`No initial error detected (Result: ${consoleOutput}). Proceeding to collect test cases...`);
  
      // Refining selector slightly for potentially better targeting, but keeping filter broad
      const potentialTabs = document.querySelectorAll('div[class*="cursor-pointer"], button[class*="group"]');
      const caseButtons = Array.from(potentialTabs).filter(btn => {
           const textContent = (btn.textContent || "").trim();
           const hasCaseText = /^Case\s*\d+/i.test(textContent);
           // Check visibility - this is crucial to avoid hidden duplicates
           const isVisible = btn.offsetParent !== null;
           return hasCaseText && isVisible;
       });
      console.log(`Found ${caseButtons.length} potential visible case tabs.`); // Log count after filtering
  
      function getPanelText(label) { // Keep the multi-input aware version
          const labelDiv = Array.from(document.querySelectorAll('.mb-2.text-xs.font-medium, .text-xs.font-medium, .flex.text-xs.font-medium'))
              .find(el => el.textContent.trim() === label);
          if (!labelDiv) { console.warn(`Label '${label}' not found.`); return null; }
          let valueContainer = labelDiv.parentElement?.querySelector('.font-menlo') ? labelDiv.parentElement
                                : labelDiv.nextElementSibling?.matches('.space-y-2, .group.relative, [class*="bg-fill-"]') ? labelDiv.nextElementSibling
                                : labelDiv.parentElement?.querySelector('.space-y-2');
           if (!valueContainer && (label === 'Output' || label === 'Expected')) {
               valueContainer = labelDiv.parentElement?.querySelector('.font-menlo') || labelDiv.nextElementSibling?.querySelector('.font-menlo');
           }
          if (!valueContainer) {
               const groupAncestor = labelDiv.closest('.group,[class^="tab-"],.space-y-4');
               if (groupAncestor) {
                   valueContainer = groupAncestor; console.log(`Using ancestor search for '${label}' container.`);
               } else { console.warn(`Value container for label '${label}' not reliably found.`); return null; }
          }
          const valueElements = Array.from(valueContainer.querySelectorAll('.font-menlo'));
          if (valueElements.length === 0) {
               if (valueContainer.matches('.font-menlo')) { valueElements.push(valueContainer); }
               else {
                   console.warn(`No '.font-menlo' value element(s) found for label '${label}' within identified container.`);
                   let fallbackText = valueContainer.textContent.trim();
                   if(fallbackText && label !== 'Input') { console.warn(`Using container's text content as fallback for '${label}'.`); return fallbackText; }
                   return null;
               }
          }
          if (label === 'Input' && valueElements.length > 1) {
              const inputs = [];
              valueElements.forEach(el => {
                  let paramLabelText = "";
                  const valueWrapper = el.closest('.group.relative');
                  if (valueWrapper) {
                      const paramLabelEl = valueWrapper.querySelector('.text-xs.text-label-3, .text-xs[class*="label-3"]');
                      if (paramLabelEl) { paramLabelText = paramLabelEl.textContent.trim(); }
                  }
                  const separator = paramLabelText ? (paramLabelText.endsWith('=') ? ' ' : ' = ') : '';
                  inputs.push(`${paramLabelText}${separator}${el.textContent.trim()}`);
              });
               console.log(`Extracted multi-parameter input for ${label}.`);
              return inputs.join('\n');
          } else { return valueElements[0].textContent.trim(); }
      }
  
      const seen = new Set();
      for (let i = 0; i < caseButtons.length; i++) {
          const caseButtonText = caseButtons[i].textContent.trim();
          // Check visibility *again* right before click, as layout might change
          if (caseButtons[i].offsetParent !== null && typeof caseButtons[i].click === 'function') {
               caseButtons[i].dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
               await new Promise(r => setTimeout(r, 250));
          } else {
               console.warn(`Skipping non-interactive/invisible case button before click: ${caseButtonText}`);
               continue;
          }
          const input = getPanelText('Input');
          const output = getPanelText('Output');
          const expected = getPanelText('Expected');
          const uniqueKey = input || `__null_input_${i}__`;
          if (input !== null && !seen.has(uniqueKey)) {
              console.log(`Processing unique input from ${caseButtonText}...`);
              seen.add(uniqueKey);
              testCases.push({ case: `Case ${testCases.length + 1}`, input, output, expected, match: output === expected });
          } else if (input === null) {
               console.warn(`Could not extract input for a case tab (${caseButtonText}). Skipping.`);
          } // else: Skip duplicate silently
      }
      console.log(`Finished processing. Collected ${testCases.length} unique test case(s).`);
    } // *** END OF NO ERROR PATH ***
  
    // 4. Return results
    console.log("Phase 4: Packaging results...");
    return { consoleOutput, errorDetails, testCases };
  }
  
  // --- Execute the function and log the JSON result ---
  getLeetCodeTestSummaryJSON().then(result => {
    if (result) {
      console.log("--- LeetCode Test Summary ---");
      console.log(JSON.stringify(result, null, 2));
      console.log("--- End of Summary ---");
    } else {
      console.error("Script execution failed unexpectedly or was aborted.");
    }
  }).catch(error => {
    console.error("An unexpected error occurred during script execution:", error);
      console.log(JSON.stringify({
          consoleOutput: "Script Execution Error",
          errorDetails: { message: error.message || "Unknown script error", stack: error.stack },
          testCases: []
      }, null, 2));
  });