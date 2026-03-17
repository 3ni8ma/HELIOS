# 🧪 Quick Rotation Test

## Test Two-Hand Rotation

1. Open `http://localhost:8080/ball.html`

2. **Allow camera access**

3. **Hold up BOTH hands** with fingers EXTENDED (not pinching)

4. **Move both hands left and right together**
   - Ball should rotate horizontally
   - Pattern should spin clearly

5. **Move both hands up and down**
   - Ball should rotate vertically
   - Grid lines should move

6. **Try diagonal movements**
   - Ball should rotate in combined directions

## Expected Behavior

✅ HUD shows: `rotating (two hands)`  
✅ Ball pattern spins visibly  
✅ Rotation continues briefly after you stop (momentum)  
✅ Smooth, responsive movement

## If Not Working

- Make sure BOTH hands are in camera view
- Keep fingers OPEN (not pinching)
- Make larger, slower movements
- Check "Hands Detected" shows "2"

## Switch to Scaling

To test scaling is still separate:
1. **Pinch BOTH hands** (thumb+index on each)
2. **Move hands apart/together**
3. HUD should show: `scaling`
4. Ball should grow/shrink

---

**Current Controls:**
- 1 Hand Pinch = Pick & Move
- 2 Hands Open = Rotate
- 2 Hands Pinch = Scale
