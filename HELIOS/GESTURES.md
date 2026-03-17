# 🎮 HELIOS Ball - Complete Gesture Guide

## All Supported Gestures

### 🤏 **PINCH GESTURE**
**How:** Touch thumb tip to index finger tip  
**Action:** Pick up and move ball  
**Visual:** HUD shows "picked (pinch)" or "moving (pinch)"

---

### ✊ **FIST/GRAB GESTURE** *(NEW!)*
**How:** Make a fist (curl all fingers into palm)  
**Action:** Pick up and move ball (same as pinch!)  
**Visual:** HUD shows "grabbed (fist)" or "moving (fist)"  
**Detection:** All fingertips within 0.15 units of palm base

---

### 🙌 **TWO HANDS OPEN**
**How:** Show both hands with fingers extended  
**Action:** Rotate the ball  
**How to control:**
- Move hands **left/right** → Ball rotates horizontally
- Move hands **up/down** → Ball rotates vertically
- **Sensitivity:** 500x (ultra-responsive!)
**Visual:** HUD shows "rotating (two hands)"

---

### 🤲 **TWO HANDS PINCHING**
**How:** Pinch with BOTH hands simultaneously  
**Action:** Scale the ball bigger/smaller  
**How to control:**
- Move hands **apart** → Ball grows (up to 4x)
- Move hands **together** → Ball shrinks (down to 0.5x)
**Visual:** HUD shows "scaling"

---

## 🎯 Quick Reference

| Gesture | Hands | Pinch? | Action |
|---------|-------|--------|--------|
| 🤏 Pinch | 1 | Yes | Pick & Move |
| ✊ Fist | 1 | No | Pick & Move |
| 🙌 Open | 2 | No | Rotate |
| 🤲 Both Pinch | 2 | Yes | Scale |

---

## ⚙️ Current Settings

- **Rotation sensitivity:** 500x (extreme!)
- **Movement range:** 2x normal (32x24)
- **Pickup range:** 3 units from ball
- **Fist detection:** Average fingertip distance < 0.15
- **Pinch detection:** Thumb-index distance < 0.05

---

## 💡 Tips

1. **Try both pickup methods** - Use pinch for precision, fist for comfort
2. **Rotate is ultra-sensitive** - Tiny movements = big rotations
3. **Watch the pattern** - Grid and stripes make rotation highly visible
4. **Check the HUD** - Shows exactly which gesture is active
5. **Red cursor on top** - Always visible even when ball is huge

---

## 🐛 Troubleshooting

**Ball won't pick up:**
- Make sure cursor (red dot) is within 3 units of ball
- Try making a tighter fist or firmer pinch
- Check HUD shows your hand is detected

**Rotation not working:**
- Use TWO hands
- Keep hands OPEN (don't pinch)
- Move hands together in same direction

**Scaling not working:**
- Use TWO hands
- BOTH must be pinching
- Check HUD shows "two hands (pinching)"

---

Created: 2026-02-12  
Last Updated: Added fist/grab gesture support
