// Maskify Content Script
let config = {
    is_active: true,
    blur_strength: 12,
    reveal_on_hover: true
};

const PLATFORM_SELECTORS = {
    'web.whatsapp.com': ['.copyable-text', '.message-in', '.message-out', '[data-testid="cell-frame-secondary"]', '[data-testid="last-msg-meta"]'],
    'app.slack.com': ['.c-message__body', '.c-message_kit__text', '.p-channel_sidebar__channel_preview', '.p-channel_sidebar__last_message'],
    'discord.com': ['[class*="messageContent-"]', '[class*="contents-"]', '[class*="lastMessage_"]', '[class*="subText_"]'],
    'teams.microsoft.com': ['.message-body-container', '.message-preview'],
    'meet.google.com': ['[data-message-text]']
};

function getSelectorsForCurrentSite() {
    const host = window.location.hostname;
    for (const [domain, selectors] of Object.entries(PLATFORM_SELECTORS)) {
        if (host.includes(domain)) return selectors;
    }
    return [];
}

function applyBlur() {
    if (!config.is_active) {
        removeBlur();
        return;
    }

    const selectors = getSelectorsForCurrentSite();
    if (selectors.length === 0) return;

    const styleId = 'maskify-dynamic-styles';
    let styleEl = document.getElementById(styleId);
    if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = styleId;
        document.head.appendChild(styleEl);
    }

    const blurValue = `${config.blur_strength}px`;
    let css = '';
    
    selectors.forEach(selector => {
        css += `${selector} { filter: blur(${blurValue}) !important; transition: filter 0.3s ease !important; }\n`;
        if (config.reveal_on_hover) {
            css += `${selector}:hover { filter: blur(0px) !important; }\n`;
        }
    });

    styleEl.textContent = css;
}

function removeBlur() {
    const styleEl = document.getElementById('maskify-dynamic-styles');
    if (styleEl) styleEl.textContent = '';
}

// Initial application
chrome.storage.local.get(['maskifyConfig'], (result) => {
    if (result.maskifyConfig) {
        config = { ...config, ...result.maskifyConfig };
    }
    applyBlur();
});

// Listen for updates from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'UPDATE_CONFIG') {
        config = { ...config, ...request.config };
        applyBlur();
        sendResponse({ status: 'applied' });
    }
});

// MutationObserver to handle dynamically loaded messages
const observer = new MutationObserver((mutations) => {
    if (config.is_active) {
        // We don't need to do much since our dynamic CSS handles new elements matching selectors
    }
});

observer.observe(document.body, { childList: true, subtree: true });

console.log('🎭 Maskify initialized on ' + window.location.hostname);
