# 🎮 Interactive Ball - User Guide

## Overview

A fully interactive 3D ball that responds to hand gestures with realistic physics, gravity, and scaling.

---

## 🚀 How to Launch

1. **Make sure the server is running:**
   ```bash
   cd HELIOS
   python3 -m http.server 8080
   ```

2. **Open in your browser:**
   ```
   http://localhost:8080/ball.html
   ```

3. **Allow camera access** when prompted

4. **Wait for initialization** - you'll see "Initializing Camera & Hand Tracking..."

5. **Start interacting!**

---

## 👋 Gesture Controls

### 🖐️ ONE HAND

**Point at the ball:**
- Hold up your index finger
- A red cursor will appear following your finger tip
- Move your hand to see the cursor move in 3D space

**Pick up the ball (Pinch):**
- Point at the ball
- Pinch your thumb and index finger together
- The ball will "stick" to your hand
- The ball glows brighter when picked up
- Move your hand around to drag the ball

**Drop the ball:**
- Release the pinch (separate thumb and index finger)
- Ball falls with gravity
- Bounces on the floor with realistic physics

---

### 🙌 TWO HANDS

**Scale the ball:**
- Hold up both hands
- Move them closer together → Ball shrinks
- Move them further apart → Ball grows
- Size range: 0.5x to 4x original size
- Works in real-time

---

## 📊 HUD Information

Top-left corner shows:
- **Mode:** Current interaction state
  - `idle` - No hands detected
  - `picked` - Ball is being held
  - `dropped` - Ball was just released
  - `scaling` - Two-hand scaling active

- **Ball Size:** Current scale (1.0 = normal)
- **Velocity:** Speed of ball movement
- **Hands Detected:** Number of hands being tracked (0-2)

---

## 🎨 Visual Features

- **Glowing ball** with bloom post-processing
- **5,000 particle field** background
- **Real-time shadows**
- **Smooth physics** with gravity and bounce
- **Responsive lighting**
- **Camera feed** (bottom-right corner, mirrored)

---

## 🧪 Physics Behavior

**Gravity:**
- Constant downward acceleration
- Falls naturally when released

**Bouncing:**
- Bounces off floor with 60% energy retention
- Gradually comes to rest
- Smooth collision response

**Damping:**
- Air resistance slows the ball
- Prevents infinite bouncing

**Size affects physics:**
- Larger balls have larger collision radius
- All masses behave the same (like real physics!)

---

## 💡 Tips

1. **Best lighting:** Face a window or light source for better hand tracking
2. **Camera distance:** Sit 2-3 feet from the camera for optimal tracking
3. **Smooth movements:** Slow, deliberate gestures work best
4. **Pinch precision:** Bring thumb and index fingertips close together firmly
5. **Scaling:** Use full arm movements for dramatic size changes

---

## 🐛 Troubleshooting

**Camera not working:**
- Check browser permissions
- Ensure no other app is using the camera
- Try refreshing the page

**Hand tracking not responding:**
- Make sure hands are visible in the camera feed
- Improve lighting in your room
- Keep hands within camera frame
- Check the "Hands Detected" counter

**Ball not picking up:**
- Get the red cursor close to the ball (within 3 units)
- Make a clear pinch gesture
- Hold the pinch for a moment

**Performance issues:**
- Close other browser tabs
- Use Chrome or Edge for best performance
- Reduce particle count (edit source if needed)

---

## 🎯 Technical Details

**Built with:**
- Three.js (3D rendering)
- MediaPipe (hand tracking)
- Web Speech API (ready for voice commands)
- Unreal Bloom Pass (post-processing)

**Performance:**
- Target: 60 FPS
- Hand tracking: ~30 FPS
- Physics: 60Hz timestep

**Browser compatibility:**
- Chrome ✅
- Edge ✅
- Safari ✅ (may need HTTPS)
- Firefox ⚠️ (MediaPipe support limited)

---

## 🔮 Future Enhancements

Possible additions:
- Multiple balls
- Ball color changes
- Sound effects
- Voice commands ("make it bigger", "reset")
- Throw gesture with velocity tracking
- Wall boundaries
- Different materials (metal, glass, rubber)

---

**Have fun playing with the ball!** 🎉
