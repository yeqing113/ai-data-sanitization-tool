document.addEventListener('DOMContentLoaded', function() {
  const inputTextarea = document.getElementById('input');
  const outputTextarea = document.getElementById('output');
  const maskButton = document.getElementById('maskButton');
  const sendToChatGPTButton = document.getElementById('sendToChatGPT');
  
  const maskIPCheckbox = document.getElementById('maskIP');
  const maskHostnameCheckbox = document.getElementById('maskHostname');
  const maskIDCheckbox = document.getElementById('maskID');
  const maskEmailCheckbox = document.getElementById('maskEmail');
  const maskPhoneCheckbox = document.getElementById('maskPhone');
  const maskCreditCardCheckbox = document.getElementById('maskCreditCard');
  const maskSSNCheckbox = document.getElementById('maskSSN');
  const maskURLCheckbox = document.getElementById('maskURL');
  
  const customRegexInput = document.getElementById('customRegex');
  const customReplacementInput = document.getElementById('customReplacement');

  maskButton.addEventListener('click', function() {
    let text = inputTextarea.value;
    
    if (maskIPCheckbox.checked) {
      text = maskIP(text);
    }
    
    if (maskHostnameCheckbox.checked) {
      text = maskHostname(text);
    }
    
    if (maskIDCheckbox.checked) {
      text = maskID(text);
    }
    
    if (maskEmailCheckbox.checked) {
      text = maskEmail(text);
    }
    
    if (maskPhoneCheckbox.checked) {
      text = maskPhoneNumber(text);
    }
    
    if (maskCreditCardCheckbox.checked) {
      text = maskCreditCard(text);
    }
    
    if (maskSSNCheckbox.checked) {
      text = maskSSN(text);
    }
    
    if (maskURLCheckbox.checked) {
      text = maskURL(text);
    }
    
    const customRegex = customRegexInput.value;
    const customReplacement = customReplacementInput.value;
    if (customRegex && customReplacement) {
      text = maskCustom(text, customRegex, customReplacement);
    }
    
    outputTextarea.value = text;
  });

  sendToChatGPTButton.addEventListener('click', function() {
    const maskedText = outputTextarea.value;
    sendToChatGPT(maskedText);
  });

  const setApiKeyButton = document.createElement('button');
  setApiKeyButton.textContent = 'Set API Key';
  setApiKeyButton.addEventListener('click', setApiKey);
  document.querySelector('.controls').appendChild(setApiKeyButton);
});

function maskIP(text) {
  return text.replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, 'xxx.xxx.xxx.xxx');
}

function maskHostname(text) {
  return text.replace(/\b(?!-)[A-Za-z0-9-]{1,63}(?<!-)(\.[A-Za-z]{2,})+\b/g, 'masked-hostname.com');
}

function maskID(text) {
  return text.replace(/\b(?:ID|id|Id):\s*(\d+)\b/g, 'ID: MASKED-ID');
}

function maskEmail(text) {
  return text.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, 'masked-email@example.com');
}

function maskPhoneNumber(text) {
  return text.replace(/\b(?:\+?1[-.\s]?)?(?:\(\d{3}\)|\d{3})[-.\s]?\d{3}[-.\s]?\d{4}\b/g, 'xxx-xxx-xxxx');
}

function maskCreditCard(text) {
  return text.replace(/\b(?:\d{4}[-\s]?){3}\d{4}\b/g, 'xxxx-xxxx-xxxx-xxxx');
}

function maskSSN(text) {
  return text.replace(/\b\d{3}-\d{2}-\d{4}\b/g, 'xxx-xx-xxxx');
}

function maskURL(text) {
  return text.replace(/https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g, 'https://masked-url.com');
}

function maskCustom(text, regex, replacement) {
  const re = new RegExp(regex, 'g');
  return text.replace(re, replacement);
}

async function sendToChatGPT(text) {
  const apiKey = await getApiKey();
  if (!apiKey) {
    alert('Please set your OpenAI API key in the extension options.');
    return;
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        {role: "system", content: "You are a helpful assistant."},
        {role: "user", content: text}
      ]
    })
  });

  if (!response.ok) {
    alert('Error sending message to ChatGPT. Please check your API key and try again.');
    return;
  }

  const data = await response.json();
  const reply = data.choices[0].message.content;
  
  outputTextarea.value += "\n\nChatGPT Response:\n" + reply;
}

async function getApiKey() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['openaiApiKey'], function(result) {
      resolve(result.openaiApiKey);
    });
  });
}

function setApiKey() {
  const apiKey = prompt("Please enter your OpenAI API key:");
  if (apiKey) {
    chrome.storage.sync.set({openaiApiKey: apiKey}, function() {
      alert('API key saved successfully.');
    });
  }
}