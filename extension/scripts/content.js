// Maskify Content Script
let config = {
    is_active: true,
    blur_strength: 12,
    reveal_on_hover: true
};

const PLATFORM_SELECTORS = {
    'web.whatsapp.com': [
        'div.message-in', 
        'div.message-out', 
        '[data-testid="cell-frame-secondary"]', 
        '[data-testid="last-msg-meta"]'
    ],
    'web.telegram.org': [
        '.bubble-content',      // Version K messages
        '.chat-subtitle',       // Version K previews
        '.message-content',     // Version Z messages
        '.last-msg',            // Version Z previews
        '.text-content',        // Version Z text
        '.reply-subtitle'       // Version K replies
    ]
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
        updateBadge(false);
        return;
    }

    const selectors = getSelectorsForCurrentSite();
    if (selectors.length === 0) {
        updateBadge(false);
        return;
    }

    updateBadge(true);
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

function updateBadge(active) {
    let badge = document.getElementById('maskify-status-badge');
    if (!badge) {
        badge = document.createElement('div');
        badge.id = 'maskify-status-badge';
        badge.innerHTML = '🎭 <span>Protected</span>';
        Object.assign(badge.style, {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            backgroundColor: 'hsla(230, 80%, 15%, 0.8)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '12px',
            fontSize: '12px',
            fontFamily: 'sans-serif',
            zIndex: '999999',
            backdropFilter: 'blur(8px)',
            border: '1px solid hsla(0, 0%, 100%, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
            transition: 'opacity 0.3s ease, transform 0.3s ease',
            pointerEvents: 'none'
        });
        document.body.appendChild(badge);
    }
    
    badge.style.opacity = active ? '1' : '0';
    badge.style.transform = active ? 'translateY(0)' : 'translateY(10px)';
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
