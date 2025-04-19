document.addEventListener('DOMContentLoaded', function() {
  checkApiConfig();
  
  document.getElementById('check-connection').addEventListener('click', checkApiConfig);

  const apiKeyForm = document.getElementById('api-key-form');
  if (apiKeyForm) {
    apiKeyForm.addEventListener('submit', handleApiKeySubmit);
  }

  const settingsTab = document.getElementById('settings-tab');
  const aboutTab = document.getElementById('about-tab');
  const settingsContent = document.getElementById('settings-content');
  const aboutContent = document.getElementById('about-content');
  
  settingsTab.addEventListener('click', function() {
    settingsTab.classList.add('active');
    aboutTab.classList.remove('active');
    settingsContent.classList.add('active');
    aboutContent.classList.remove('active');
  });
  
  aboutTab.addEventListener('click', function() {
    aboutTab.classList.add('active');
    settingsTab.classList.remove('active');
    aboutContent.classList.add('active');
    settingsContent.classList.remove('active');
  });
  
  const emailLink = document.getElementById('email-link');
  if (emailLink) {
    emailLink.addEventListener('click', function(e) {
      e.preventDefault();
      console.log("Sending email...");
      chrome.tabs.create({
        url: "mailto:utkarshprap@gmail.com"
      });
    });
  }
});

function checkApiConfig() {
  const statusIcon = document.getElementById('status-icon');
  const statusText = document.getElementById('status-text');
  const apiKeyInstruction = document.getElementById('api-key-instruction');
  const changeKeyInstruction = document.getElementById('change-key-instruction');
  const changeKeyLabel = document.getElementById('change-key-label');
  
  statusText.textContent = 'Checking Gemini API configuration...';
  
  checkApiStatus()
    .then(data => {
      statusIcon.classList.remove('disconnected');
      statusIcon.classList.add('connected');
      statusText.textContent = 'Gemini API configured. You can change your key below if needed.';

      chrome.action.setBadgeText({ text: '•' });
      chrome.action.setBadgeBackgroundColor({ color: '#2cbb5d' });
      chrome.action.setBadgeTextColor({ color: '#2cbb5d' });
      
      apiKeyInstruction.style.display = 'none';
      changeKeyInstruction.style.display = 'block';
      changeKeyLabel.style.display = 'inline';
    })
    .catch(error => {
      statusIcon.classList.remove('connected');
      statusIcon.classList.add('disconnected');
      statusText.textContent = 'Gemini API key not configured';
      console.error('Error checking API configuration:', error);
      
      chrome.action.setBadgeText({ text: '•' });
      chrome.action.setBadgeBackgroundColor({ color: '#dc3545' });
      chrome.action.setBadgeTextColor({ color: '#dc3545' });
      apiKeyInstruction.style.display = 'block';
      changeKeyInstruction.style.display = 'none';
      changeKeyLabel.style.display = 'none';
    });
}

function handleApiKeySubmit(event) {
  event.preventDefault();
  
  const apiKeyInput = document.getElementById('api-key-input');
  const statusText = document.getElementById('status-text');
  
  if (apiKeyInput && apiKeyInput.value) {
    statusText.textContent = 'Validating API key...';
    saveApiKey(apiKeyInput.value)
      .then(() => {
        apiKeyInput.value = '';
        statusText.textContent = 'API key validated and saved, checking configuration...';
        checkApiConfig();
      })
      .catch(error => {
        console.error('Error saving API key:', error);
        statusText.textContent = `Error: ${error.message}`;
        statusText.style.color = '#dc3545';
        
        setTimeout(() => {
          statusText.textContent = 'Gemini API key not configured';
          statusText.style.color = '';
        }, 5000);
      });
  }
}