# 🏗️ HELIOS Architecture

## System Design Philosophy

HELIOS follows a **modular architecture** where each subsystem operates independently but communicates through well-defined interfaces. This enables:

- **Separation of concerns**
- **Easy debugging**
- **Scalable enhancements**
- **Clean integration points**

---

## 🔄 Data Flow

```
USER INPUT (Voice/Gesture/Keyboard)
    ↓
MAIN APPLICATION (main.js)
    ↓
┌─────────────────┬─────────────────┬─────────────────┐
│  Voice Engine   │ Gesture Engine  │ Keyboard Events │
└────────┬────────┴────────┬────────┴────────┬────────┘
         │                 │                 │
         └────────→ COMMAND ROUTER ←─────────┘
                        ↓
         ┌──────────────┴──────────────┐
         │                             │
    Window Manager              AI Core + Audio
         │                             │
         ↓                             ↓
    Browser Windows           Visual Feedback
         │                             │
         └──────────→ USER ←───────────┘
```

---

## 📦 Module Breakdown

### 1. RenderEngine.js
**Responsibility:** Core 3D rendering

**Key Functions:**
- Scene creation and management
- Camera control
- Post-processing (bloom, tone mapping)
- FPS tracking
- Screen-to-world coordinate conversion

**Dependencies:**
- Three.js
- EffectComposer
- UnrealBloomPass

**Public API:**
```javascript
initialize()                    // Setup renderer
render()                        // Render frame
addToScene(object)             // Add 3D object
removeFromScene(object)        // Remove 3D object
screenToWorld(x, y, z)         // Coordinate conversion
```

---

### 2. AICore.js
**Responsibility:** Visual AI feedback system

**Key Functions:**
- Central sphere visualization
- Particle field management
- State-based animations
- Energy system
- Light intensity control

**States:**
- `normal` - Idle rotation
- `listening` - Yellow glow, medium rotation
- `processing` - Red/magenta, fast rotation

**Public API:**
```javascript
initialize()                    // Create visual elements
update(deltaTime)              // Animation loop
setListening(boolean)          // Enter listening state
setProcessing(boolean)         // Enter processing state
addEnergy(amount)              // Pulse effect
setTargetPosition(x, y, z)     // Follow hand
onCommandSuccess()             // Success animation
```

---

### 3. GestureEngine.js
**Responsibility:** Hand tracking and gesture recognition

**Key Functions:**
- MediaPipe integration
- Hand landmark detection
- Gesture pattern recognition
- Cursor positioning
- 3D position mapping

**Supported Gestures:**
- Pinch (thumb-index)
- Swipe (4 directions)
- Palm open
- Two-hand spread

**Callbacks:**
```javascript
onPinch(x, y)                  // Click event
onRelease(x, y)                // Release event
onSwipe(direction)             // Left/right/up/down
onSpread(type, amount)         // Expand/contract
```

**Public API:**
```javascript
initialize()                    // Setup MediaPipe
update()                       // Process frame
getCursorPosition()            // Get 2D cursor
getHandPosition3D()            // Get 3D position
isPinchActive()                // Check pinch state
```

---

### 4. VoiceEngine.js
**Responsibility:** Voice command processing

**Key Functions:**
- Speech recognition (Web Speech API)
- Natural language parsing
- Command routing
- Website shortcuts
- Command history

**Command Categories:**
1. **Navigation** - "Open [site]", "Go to [URL]"
2. **Search** - "Search for [query]"
3. **Window Control** - "Close", "Minimize", "Maximize"
4. **Tab Navigation** - "Next tab", "Previous tab"
5. **System** - "Reset", "Focus mode", "Overview"

**Callbacks:**
```javascript
onNavigate(url)                // Navigate to URL
onSearchQuery(url, query)      // Search action
onWindowAction(action)         // Window control
onSystemAction(action)         // System command
onCommand(type, value)         // Generic command
```

**Public API:**
```javascript
initialize()                    // Setup speech recognition
start()                        // Begin listening
stop()                         // Stop listening
processCommand(text)           // Parse command
toggle()                       // Toggle on/off
```

---

### 5. WindowManager.js
**Responsibility:** Spatial window management

**Key Functions:**
- CSS3D window rendering
- Iframe management
- Window positioning/animation
- Tab system
- Drag and drop
- Layout arrangements
- Session persistence

**Window States:**
- `focused` - Active window
- `minimized` - Hidden
- `maximized` - Enlarged
- `normal` - Standard size

**Layouts:**
- Grid
- Cascade
- Horizontal
- Circular

**Public API:**
```javascript
initialize()                    // Setup CSS3D renderer
createWindow(url, title, opts) // Create new window
closeWindow(id)                // Remove window
focusWindow(id)                // Activate window
nextTab() / previousTab()      // Navigate tabs
arrangeWindows(layout)         // Apply layout
saveSession() / loadSession()  // Persistence
update(deltaTime)              // Animation loop
render()                       // CSS3D render
```

---

### 6. AudioSystem.js
**Responsibility:** Sound feedback

**Key Functions:**
- Procedural sound generation
- Event-based audio
- Ambient background
- Volume control

**Sound Types:**
- `confirm` - Rising tone (success)
- `error` - Falling tone (failure)
- `listen` - Activation beep
- `windowOpen/Close` - Window events
- `click` - Interaction feedback
- `ambient` - Background hum

**Public API:**
```javascript
initialize()                    // Create audio context
play(soundName, volume)        // Play sound
startAmbient() / stopAmbient() // Background audio
setVolume(ambient, effects)    // Volume control
toggle()                       // Mute/unmute
```

---

### 7. main.js
**Responsibility:** Application orchestration

**Key Functions:**
- System initialization
- Event routing
- Integration logic
- Lifecycle management

**Initialization Sequence:**
1. AudioSystem
2. RenderEngine
3. AICore
4. WindowManager
5. GestureEngine
6. VoiceEngine
7. Setup callbacks
8. Start render loop

**Public API:**
```javascript
initialize()                    // Boot system
animate()                      // Main loop
setMode(mode)                  // Change mode
createDemoWorkspace()          // Demo windows
shutdown()                     // Cleanup
```

---

## 🔗 Integration Points

### Gesture → Window Manager
```javascript
gestureEngine.onPinch = (x, y) => {
    // Check if clicking window
    // Trigger window interaction
}
```

### Voice → Window Manager
```javascript
voiceEngine.onNavigate = (url) => {
    windowManager.createWindow(url, title);
}
```

### Gesture → AI Core
```javascript
// Hand position updates AI core
aiCore.setTargetPosition(handPosition3D);
```

### Voice → AI Core
```javascript
voiceEngine.onResult = (text) => {
    aiCore.setProcessing(true);
    // Process command
    aiCore.setProcessing(false);
}
```

---

## 🎯 Performance Considerations

### Rendering Optimization
- Target 60 FPS
- Pixel ratio capped at 2x
- Efficient bloom settings
- CSS3D separate from WebGL

### Memory Management
- Max 8 windows
- Cleanup on window close
- Session storage (not memory)
- Particle count optimized

### Hand Tracking
- GPU acceleration (MediaPipe)
- Video resolution: 720p
- Processing on video frames (not continuous)

### Audio
- Procedural generation (no file loading)
- Web Audio API (low overhead)
- Gain nodes for mixing

---

## 🛡️ Error Handling

Each module handles its own errors:

**GestureEngine:**
- Graceful degradation if MediaPipe fails
- Fallback to keyboard/voice only

**VoiceEngine:**
- Auto-restart on timeout
- Error feedback via audio
- Continue operation on recognition errors

**WindowManager:**
- CORS handling for iframes
- Max window limits
- Validate URLs

**RenderEngine:**
- WebGL context loss recovery
- Resize handling
- Performance monitoring

---

## 🔐 Security Considerations

1. **Iframe Sandboxing**
   - `allow-scripts`
   - `allow-same-origin`
   - `allow-forms`
   - `allow-popups`

2. **URL Validation**
   - Protocol checking
   - Domain parsing

3. **No Backend**
   - Client-side only
   - No data transmission
   - Local storage only

---

## 📊 State Management

### Global State (main.js)
- `isInitialized`
- `isPaused`
- `currentMode`
- `selectedWindow`

### Window State (WindowManager)
- `windows` Map
- `activeWindow`
- `tabs` Array
- `activeTabIndex`

### Gesture State (GestureEngine)
- `hands` Object
- `isPinching`
- `currentGesture`
- `cursorX/Y`

### Voice State (VoiceEngine)
- `isListening`
- `commandHistory`

---

## 🚀 Extension Points

To add new features:

### New Gesture
```javascript
// In GestureEngine.js
detectNewGesture(landmarks) {
    // Pattern recognition logic
    if (/* condition */) {
        this.onNewGesture();
    }
}

// In main.js
gestureEngine.onNewGesture = () => {
    // Handle gesture
}
```

### New Voice Command
```javascript
// In VoiceEngine.js
processCommand(text) {
    if (text.includes('new command')) {
        this.handleNewCommand(text);
    }
}
```

### New Window Layout
```javascript
// In WindowManager.js
arrangeNewLayout(windows) {
    windows.forEach((win, i) => {
        // Position logic
        win.targetPosition = {...};
    });
}
```

---

## 🧪 Testing Strategy

### Manual Testing
1. Camera tracking accuracy
2. Voice recognition reliability
3. Window interactions
4. Performance under load

### Browser Compatibility
- Chrome 90+ ✅
- Edge 90+ ✅
- Firefox ⚠️ (Limited Web Speech API)
- Safari ⚠️ (Limited MediaPipe support)

### Performance Benchmarks
- Target: 60 FPS
- Max windows: 8
- Memory: < 500MB
- CPU: < 50% on modern hardware

---

**This architecture enables HELIOS to be a production-ready spatial computing platform.**
