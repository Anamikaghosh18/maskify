// Maskify Popup Logic
document.addEventListener('DOMContentLoaded', async () => {
    const globalToggle = document.getElementById('globalToggle');
    const blurIntensity = document.getElementById('blurIntensity');
    const hoverReveal = document.getElementById('hoverReveal');
    const statusBadge = document.getElementById('statusBadge');

    // Load saved settings
    const result = await chrome.storage.local.get(['maskifyConfig']);
    const config = result.maskifyConfig || {
        is_active: true,
        blur_strength: 12,
        reveal_on_hover: true
    };

    // Initialize UI
    globalToggle.checked = config.is_active;
    blurIntensity.value = config.blur_strength;
    hoverReveal.checked = config.reveal_on_hover;
    updateStatusBadge(config.is_active);

    // Event Listeners
    globalToggle.addEventListener('change', () => {
        config.is_active = globalToggle.checked;
        updateStatusBadge(config.is_active);
        saveAndNotify();
    });

    blurIntensity.addEventListener('input', () => {
        config.blur_strength = parseInt(blurIntensity.value);
        saveAndNotify();
    });

    hoverReveal.addEventListener('change', () => {
        config.reveal_on_hover = hoverReveal.checked;
        saveAndNotify();
    });



    function updateStatusBadge(active) {
        statusBadge.textContent = active ? 'Active' : 'Inactive';
        statusBadge.style.background = active ? 'hsla(150, 80%, 50%, 0.2)' : 'hsla(0, 80%, 50%, 0.2)';
        statusBadge.style.color = active ? 'hsl(150, 80%, 50%)' : 'hsl(0, 80%, 50%)';
        statusBadge.style.borderColor = active ? 'hsla(150, 80%, 50%, 0.3)' : 'hsla(0, 80%, 50%, 0.3)';
    }

    async function saveAndNotify() {
        // Save to local storage
        await chrome.storage.local.set({ maskifyConfig: config });

        // Notify active tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab) {
            chrome.tabs.sendMessage(tab.id, {
                type: 'UPDATE_CONFIG',
                config: config
            }).catch(err => console.log('Not a supported page'));
        }
    }



    // Listen for storage changes (for keyboard shortcuts)
    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'local' && changes.maskifyConfig) {
            const newConfig = changes.maskifyConfig.newValue;
            globalToggle.checked = newConfig.is_active;
            blurIntensity.value = newConfig.blur_strength;
            hoverReveal.checked = newConfig.reveal_on_hover;
            updateStatusBadge(newConfig.is_active);
        }
    });
});
