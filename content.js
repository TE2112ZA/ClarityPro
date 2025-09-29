// content.js

const SUGGESTION_CONTAINER_ID = 'claritypro-suggestion-panel';
const MIN_SELECTION_LENGTH = 10;
let currentMode = 'General';
let currentSelection = null; // Store the current selection object

// --- 1. Load Current Mode ---
chrome.storage.local.get(['clarityProMode'], (result) => {
    currentMode = result.clarityProMode || 'General';
});

// Listen for mode changes from the sidepanel.js
chrome.runtime.onMessage.addListener((request) => {
    if (request.action === "MODE_UPDATE") {
        currentMode = request.mode;
    }
});

// --- 2. Create and Inject the Floating Suggestion Panel ---
function injectSuggestionPanel() {
    if (document.getElementById(SUGGESTION_CONTAINER_ID)) return;
    const panel = document.createElement('div');
    panel.id = SUGGESTION_CONTAINER_ID;
    document.body.appendChild(panel);
}

// Ensure the panel exists when the page loads
injectSuggestionPanel();

// --- 3. Detect Text Selection ---
document.addEventListener('mouseup', handleTextSelection);

function handleTextSelection() {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();

    // Check if the selection is long enough and is in an editable area
    if (selectedText.length > MIN_SELECTION_LENGTH && isInEditableElement(selection.focusNode)) {
        currentSelection = selection;
        showLoadingState();

        // Send message to background.js with context
        chrome.runtime.sendMessage({
            action: "REQUEST_AI_SUGGESTION",
            text: selectedText,
            mode: currentMode
        }, (response) => {
            if (response && response.success) {
                displaySuggestion(response.data.suggestion);
            } else if (response && response.error.includes("API Key")) {
                displayError("API Key Missing. Set in Options.");
            } else {
                displayError("AI Analysis Failed.");
            }
        });
    } else {
        hideSuggestionPanel();
    }
}

// Simple check to ensure we only analyze text in input/editable fields
function isInEditableElement(node) {
    if (!node) return false;
    let el = node.nodeType === 3 ? node.parentNode : node; 
    while (el) {
        if (el.isContentEditable || el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
            return true;
        }
        el = el.parentElement;
    }
    return false;
}

// --- 4. Display Logic (The Right-Side Panel) ---
function showLoadingState() {
    const panel = document.getElementById(SUGGESTION_CONTAINER_ID);
    panel.innerHTML = `<div id="cp-header">ClarityPro Suggestion</div><div id="cp-content"><p class="cp-loading">Analyzing in **${currentMode}** mode...</p></div>`;
    panel.style.display = 'block';
}

function displaySuggestion(suggestionText) {
    const panel = document.getElementById(SUGGESTION_CONTAINER_ID);
    
    panel.innerHTML = `
        <div id="cp-header">ClarityPro Suggestion - ${currentMode} Mode</div>
        <div id="cp-content">
            <p><strong>ClarityPro Suggests:</strong></p>
            <p class="cp-suggestion-text">${suggestionText}</p>
            <button id="cp-apply-btn">Apply Suggestion</button>
        </div>
    `;
    
    document.getElementById('cp-apply-btn').onclick = () => {
        applySuggestion(suggestionText, currentSelection);
    };
    panel.style.display = 'block';
}

function displayError(message) {
    const panel = document.getElementById(SUGGESTION_CONTAINER_ID);
    panel.innerHTML = `<div id="cp-header">ClarityPro Suggestion</div><div id="cp-content"><p class="cp-error">${message}</p></div>`;
    panel.style.display = 'block';
}

function hideSuggestionPanel() {
    const panel = document.getElementById(SUGGESTION_CONTAINER_ID);
    if (panel) {
        panel.style.display = 'none';
    }
}

// --- 5. Suggestion Application ---
function applySuggestion(suggestionText, selection) {
    if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents(); 
        range.insertNode(document.createTextNode(suggestionText)); 
        
        selection.removeAllRanges();
        hideSuggestionPanel();
    }
}
