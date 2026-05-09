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

// Listen for keyboard shortcuts
chrome.commands.onCommand.addListener(async (command) => {
    if (command === "toggle-blur") {
        const result = await chrome.storage.local.get(['maskifyConfig']);
        const config = result.maskifyConfig || { is_active: true, blur_strength: 12, reveal_on_hover: true };
        
        config.is_active = !config.is_active;
        await chrome.storage.local.set({ maskifyConfig: config });
        
        // Notify all tabs
        const tabs = await chrome.tabs.query({});
        tabs.forEach(tab => {
            chrome.tabs.sendMessage(tab.id, { type: 'UPDATE_CONFIG', config: config }).catch(() => {});
        });
        
        console.log(`Maskify toggled: ${config.is_active}`);
    }
});

// Auto-detect meeting sites to enable protection
const MEETING_SITES = ['meet.google.com', 'zoom.us', 'teams.microsoft.com', 'webex.com'];

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        const isMeeting = MEETING_SITES.some(site => tab.url.includes(site));
        if (isMeeting) {
            chrome.storage.local.get(['maskifyConfig'], (result) => {
                const config = result.maskifyConfig;
                if (config && !config.is_active) {
                    // Auto-enable for meetings
                    config.is_active = true;
                    chrome.storage.local.set({ maskifyConfig: config });
                    chrome.tabs.sendMessage(tabId, { type: 'UPDATE_CONFIG', config: config }).catch(() => {});
                }
            });
        }
    }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'sync') {
        syncWithBackend().then(response => sendResponse(response));
        return true; // Keep channel open for async response
    }
});
