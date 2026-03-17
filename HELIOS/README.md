# 🌐 HELIOS

**A Real-Time Spatial Web Browser with Gesture + Voice Control**

HELIOS is a fully functional web browser built inside a 3D spatial environment. It runs in a normal browser, uses your camera for hand tracking, and your microphone for voice control.

---

## 🚀 Quick Start

### 1. Open HELIOS
Simply open `index.html` in a modern web browser (Chrome/Edge recommended).

### 2. Grant Permissions
- **Camera**: Required for hand tracking
- **Microphone**: Required for voice control

### 3. Start Interacting
Your workspace is now active. Use gestures or voice commands to control the system.

---

## 🎮 Controls

### ✋ Gesture Controls

| Gesture | Action |
|---------|--------|
| **Point** | Move 3D cursor |
| **Pinch** | Click / Select |
| **Pinch + Drag** | Move window |
| **Swipe Left/Right** | Switch tabs |
| **Swipe Up** | Show tab overview |
| **Open Palm** | Show overview (planned) |
| **Two-Hand Stretch** | Resize window (planned) |

### 🎙️ Voice Commands

| Command | Action |
|---------|--------|
| "Open [website]" | Navigate to website |
| "Go to [URL]" | Open URL |
| "Search for [query]" | Google search |
| "Next tab" | Switch to next window |
| "Previous tab" | Switch to previous window |
| "Close window" | Close active window |
| "Minimize" / "Maximize" | Window controls |
| "Focus mode" | Dim inactive windows |
| "Reset workspace" | Close all windows |
| "Overview" | Show all tabs |

**Website Shortcuts:**
- "Open YouTube" → youtube.com
- "Open GitHub" → github.com
- "Open Google" → google.com
- etc.

### ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + T` | New window (prompts for URL) |
| `Ctrl/Cmd + W` | Close active window |
| `Tab` | Next window |
| `Shift + Tab` | Previous window |
| `Ctrl + Space` | Toggle tab overview |
| `Ctrl + F` | Focus mode |
| `Ctrl + R` | Reset workspace |
| `Alt + 1-4` | Arrange windows (grid/cascade/horizontal/circular) |
| `Ctrl/Cmd + Shift + S` | Save session |
| `Ctrl/Cmd + Shift + L` | Load session |
| `Esc` | Close overview |

---

## 🏗️ System Architecture

HELIOS consists of **5 integrated subsystems**:

### 1️⃣ Rendering Engine (`RenderEngine.js`)
- Three.js-based 3D environment
- Post-processing effects (bloom, tone mapping)
- 60fps target performance
- Dynamic lighting system

### 2️⃣ AI Core (`AICore.js`)
- Central reactive sphere
- Responds to voice volume
- Provides visual feedback
- Particle field animation
- Energy rings

### 3️⃣ Gesture Engine (`GestureEngine.js`)
- MediaPipe hand tracking
- Real-time gesture recognition
- Pinch, swipe, spread detection
- 3D hand position mapping
- Cursor feedback

### 4️⃣ Voice Engine (`VoiceEngine.js`)
- Web Speech API integration
- Natural language processing
- Command parsing and routing
- Website shortcuts
- Command history

### 5️⃣ Window Manager (`WindowManager.js`)
- CSS3D rendering for HTML content
- Real iframe-based browsing
- Spatial window positioning
- Drag-and-drop functionality
- Tab management
- Session persistence
- Multiple layout modes

### 6️⃣ Audio System (`AudioSystem.js`)
- Procedural sound generation
- Spatial audio feedback
- Ambient background
- Event-based sounds

---

## 🌟 Features

### ✅ Implemented
- [x] Real-time hand tracking
- [x] Voice command recognition
- [x] 3D spatial environment
- [x] AI core visualization
- [x] Multiple floating windows
- [x] Tab navigation
- [x] Window dragging
- [x] Window controls (close/minimize/maximize)
- [x] Audio feedback
- [x] Session saving/loading
- [x] Tab overview mode
- [x] Focus mode
- [x] Multiple window layouts
- [x] Keyboard shortcuts
- [x] Real browser functionality (iframes)

### 🚧 Planned Enhancements
- [ ] Two-hand resize gestures
- [ ] Depth-based window interaction
- [ ] Voice-based web search within pages
- [ ] Bookmark management
- [ ] History navigation
- [ ] Multiple workspace profiles
- [ ] VR/AR mode
- [ ] Collaborative browsing
- [ ] Advanced gesture customization

---

## 🎨 Customization

### Changing Colors
Edit `css/core.css`:
```css
:root {
    --primary-cyan: #00f2ff;
    --secondary-magenta: #ff0055;
}
```

### Adjusting Performance
Edit `js/core/RenderEngine.js`:
```javascript
// Lower pixel ratio for better performance
this.renderer.setPixelRatio(1);

// Reduce bloom intensity
const bloomPass = new UnrealBloomPass(..., 1.5, ...);
```

### Max Windows
Edit `js/core/WindowManager.js`:
```javascript
this.maxWindows = 8; // Change this value
```

---

## 🔧 Technical Requirements

### Browser Support
- **Recommended**: Chrome 90+, Edge 90+
- **Required APIs**:
  - WebGL 2.0
  - Web Speech API
  - MediaPipe (via CDN)
  - getUserMedia (camera access)

### Hardware
- **Camera**: Any webcam (720p+ recommended)
- **Microphone**: Built-in or external
- **GPU**: Moderate GPU for 3D rendering
- **RAM**: 4GB+ recommended

---

## 🐛 Troubleshooting

### Camera not working
- Check browser permissions
- Ensure camera is not in use by another app
- Try refreshing the page

### Voice commands not recognized
- Check microphone permissions
- Speak clearly and at moderate volume
- Ensure you're using a supported browser (Chrome/Edge)

### Low FPS
- Close other browser tabs
- Lower window count
- Reduce browser window size
- Check GPU acceleration is enabled

### Windows not appearing
- Check browser console for errors
- Ensure iframes are not blocked by CORS
- Some sites block iframe embedding

---

## 📁 File Structure

```
HELIOS/
├── index.html              # Main entry point
├── css/
│   └── core.css           # All styling
├── js/
│   ├── main.js            # Application orchestrator
│   └── core/
│       ├── RenderEngine.js    # 3D rendering
│       ├── AICore.js          # AI visualization
│       ├── GestureEngine.js   # Hand tracking
│       ├── VoiceEngine.js     # Voice control
│       ├── WindowManager.js   # Window system
│       └── AudioSystem.js     # Sound feedback
└── README.md              # This file
```

---

## 🧠 How It Works

### Gesture Tracking
1. Camera captures video feed
2. MediaPipe detects hand landmarks (21 points per hand)
3. Landmarks mapped to screen/3D coordinates
4. Gestures recognized from landmark patterns
5. Actions triggered based on gestures

### Voice Recognition
1. Microphone captures audio
2. Web Speech API transcribes speech
3. Natural language processing extracts intent
4. Commands routed to appropriate handlers
5. Visual/audio feedback provided

### Spatial Browsing
1. Windows exist as CSS3D objects
2. Each window contains a real iframe
3. Positioned in 3D space via Three.js
4. User interactions update 3D positions
5. Smooth animations via lerping

---

## 🎯 Vision

HELIOS demonstrates what browsing could look like in a spatial computing future:

- **No flat tabs** → Floating spatial windows
- **No mouse** → Natural hand gestures  
- **No typing** → Voice commands
- **No 2D limits** → Full 3D workspace

It's a statement: **Browsing doesn't have to be flat.**

---

## 📄 License

This is a demonstration project showcasing spatial computing concepts.

---

## 🙏 Credits

**Built with:**
- [Three.js](https://threejs.org/) - 3D rendering
- [MediaPipe](https://mediapipe.dev/) - Hand tracking
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) - Voice recognition

**Concept & Development:**
HELIOS - A spatial operating system for the web

---

## 🚀 Future Direction

HELIOS is a proof-of-concept that could evolve into:

1. **Browser Extension** - Overlay on existing browsers
2. **Standalone App** - Native desktop application
3. **VR/AR Platform** - Full immersive experience
4. **Collaborative Tool** - Multi-user spatial browsing
5. **Developer Platform** - SDK for spatial web apps

---

**Experience the future of browsing. Welcome to HELIOS.** 🌐✨
