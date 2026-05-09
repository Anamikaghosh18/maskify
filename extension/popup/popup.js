// Maskify Popup Logic
document.addEventListener('DOMContentLoaded', async () => {
    const globalToggle = document.getElementById('globalToggle');
    const blurIntensity = document.getElementById('blurIntensity');
    const hoverReveal = document.getElementById('hoverReveal');
    const apiStatus = document.getElementById('apiStatus');
    const saveBtn = document.getElementById('saveSettings');
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

    saveBtn.addEventListener('click', async () => {
        saveBtn.textContent = 'Syncing...';
        saveBtn.disabled = true;
        
        try {
            const response = await chrome.runtime.sendMessage({ action: 'sync' });
            if (response) {
                apiStatus.textContent = 'Connected';
                apiStatus.className = 'connected';
            } else {
                throw new Error('No response');
            }
        } catch (e) {
            apiStatus.textContent = 'Offline';
            apiStatus.className = 'error';
        } finally {
            saveBtn.textContent = 'Sync with Backend';
            saveBtn.disabled = false;
        }
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

    // Check initial API status
    try {
        const res = await fetch('http://localhost:8000/');
        if (res.ok) {
            apiStatus.textContent = 'Connected';
            apiStatus.className = 'connected';
        }
    } catch (e) {
        apiStatus.textContent = 'Offline';
        apiStatus.className = 'error';
    }
});
