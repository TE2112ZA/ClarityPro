// sidepanel.js

document.addEventListener('DOMContentLoaded', () => {
    const modeButtons = document.querySelectorAll('.cp-mode-btn');
    const currentModeDisplay = document.getElementById('current-mode');

    // Load saved mode on startup
    chrome.storage.local.get(['clarityProMode'], (result) => {
        const mode = result.clarityProMode || 'General';
        currentModeDisplay.textContent = mode;
    });

    modeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const newMode = button.getAttribute('data-mode');
            
            // Save the new mode
            chrome.storage.local.set({ clarityProMode: newMode }, () => {
                currentModeDisplay.textContent = newMode;

                // Send a message to content.js to update immediately
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    if (tabs.length > 0) {
                        chrome.tabs.sendMessage(tabs[0].id, {
                            action: "MODE_UPDATE",
                            mode: newMode
                        }).catch(e => console.error("Could not send mode update message:", e));
                    }
                });
            });
        });
    });
});
