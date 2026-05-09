// Maskify Background Service Worker
const API_URL = 'http://localhost:8000';

chrome.runtime.onInstalled.addListener(() => {
    console.log('Maskify Extension Installed');
    // Set default config
    chrome.storage.local.set({
        maskifyConfig: {
            is_active: true,
            blur_strength: 12,
            reveal_on_hover: true
        }
    });
});

// Function to sync with FastAPI backend
async function syncWithBackend() {
    try {
        const result = await chrome.storage.local.get(['maskifyConfig']);
        const response = await fetch(`${API_URL}/preferences`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(result.maskifyConfig)
        });
        return await response.json();
    } catch (error) {
        console.error('Failed to sync with backend:', error);
        return null;
    }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'sync') {
        syncWithBackend().then(response => sendResponse(response));
        return true; // Keep channel open for async response
    }
});
