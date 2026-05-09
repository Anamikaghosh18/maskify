# Maskify - Privacy First Blurring 🎭

Maskify is a premium Chrome extension that automatically blurs sensitive messages during screen sharing and presentations. It features a modern glassmorphic UI and a FastAPI backend for configuration management.

## Features
- **Automatic Blurring**: Targets WhatsApp, Slack, Discord, Microsoft Teams, and Google Meet.
- **Hover to Reveal**: Quickly peek at a message by hovering your mouse over it.
- **Adjustable Intensity**: Customize the blur strength from the popup.
- **Backend Sync**: Synchronize your preferences across devices via a FastAPI backend.
- **Premium Design**: Sleek, modern interface with smooth animations.

## Getting Started

### 1. Start the Backend
Navigate to the `backend` directory and install dependencies:
```bash
cd backend
pip install -r requirements.txt
python main.py
```
The API will run on `http://localhost:8000`.

### 2. Install the Chrome Extension
1. Open Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** (toggle in the top right corner).
3. Click the **Load unpacked** button.
4. **IMPORTANT**: Navigate to the `Maskify` folder and select the **`extension`** folder specifically. The `manifest.json` file must be directly inside the folder you select.

### 3. Usage
- Click the Maskify icon in your extensions toolbar.
- Toggle "Global Blur" to enable/disable protection.
- Adjust "Blur Intensity" to your preference.
- Hover over any blurred message to reveal it temporarily.

## Tech Stack
- **Frontend**: Vanilla JS, HTML5, CSS3 (Glassmorphism).
- **Backend**: FastAPI (Python).
- **Design**: Outfit Font, HSL Color Palettes.

---
Built with ❤️ for Privacy.
