/**
 * HELIOS Gesture Engine
 * Hand tracking and gesture recognition using MediaPipe
 */

import { HandLandmarker, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";

export class GestureEngine {
    constructor(audioSystem, aiCore) {
        this.audioSystem = audioSystem;
        this.aiCore = aiCore;
        this.handLandmarker = null;
        this.video = null;
        this.isReady = false;
        
        // Hand state
        this.hands = {
            left: null,
            right: null
        };
        
        // Gesture state
        this.isPinching = false;
        this.pinchStartPos = null;
        this.currentGesture = 'none';
        this.lastGesture = 'none';
        
        // Cursor position (2D screen coordinates)
        this.cursorX = window.innerWidth / 2;
        this.cursorY = window.innerHeight / 2;
        
        // 3D position for AI core tracking
        this.handPosition3D = { x: 0, y: 0, z: 0 };
        
        // Callbacks
        this.onPinch = null;
        this.onRelease = null;
        this.onSwipe = null;
        this.onSpread = null;
    }

    async initialize() {
        try {
            // Initialize MediaPipe
            const vision = await FilesetResolver.forVisionTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
            );
            
            this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
                    delegate: "GPU"
                },
                runningMode: "VIDEO",
                numHands: 2,
                minHandDetectionConfidence: 0.5,
                minHandPresenceConfidence: 0.5,
                minTrackingConfidence: 0.5
            });

            // Setup video stream
            this.video = document.getElementById('camera-feed');
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                }
            });
            
            this.video.srcObject = stream;
            
            await new Promise(resolve => {
                this.video.addEventListener('loadeddata', resolve, { once: true });
            });

            this.isReady = true;
            this.updateGestureStatus('ACTIVE');
            console.log('✓ Gesture Engine initialized');
            
        } catch (error) {
            console.error('Failed to initialize Gesture Engine:', error);
            this.updateGestureStatus('FAILED');
        }
    }

    update() {
        if (!this.isReady || !this.handLandmarker || !this.video) return;

        try {
            const results = this.handLandmarker.detectForVideo(this.video, performance.now());
            
            // Reset hand state
            this.hands.left = null;
            this.hands.right = null;
            
            if (results.landmarks && results.landmarks.length > 0) {
                // Process each detected hand
                results.landmarks.forEach((landmarks, index) => {
                    const handedness = results.handednesses[index][0].categoryName.toLowerCase();
                    this.hands[handedness] = landmarks;
                });
                
                // Use right hand (or left if right not available) for primary control
                const primaryHand = this.hands.right || this.hands.left;
                
                if (primaryHand) {
                    this.updateHandIndicators(true, !!this.hands.right);
                    this.processHandGestures(primaryHand);
                    this.updateCursor(primaryHand);
                    this.updateAICorePosition(primaryHand);
                }
            } else {
                this.updateHandIndicators(false, false);
                this.hideCursor();
            }
            
        } catch (error) {
            console.warn('Gesture detection error:', error);
        }
    }

    processHandGestures(landmarks) {
        // Key landmarks
        const indexTip = landmarks[8];
        const thumbTip = landmarks[4];
        const middleTip = landmarks[12];
        const indexBase = landmarks[5];
        const wrist = landmarks[0];
        
        // Calculate pinch distance (thumb to index)
        const pinchDist = this.calculateDistance(thumbTip, indexTip);
        const isPinching = pinchDist < 0.05;
        
        // Detect pinch gesture
        if (isPinching && !this.isPinching) {
            this.onPinchStart();
        } else if (!isPinching && this.isPinching) {
            this.onPinchEnd();
        }
        
        this.isPinching = isPinching;
        
        // Calculate hand openness (for palm detection)
        const spread = this.calculateSpread(landmarks);
        
        if (spread > 0.2 && this.currentGesture !== 'palm') {
            this.onPalmDetected();
        }
        
        // Detect swipe gestures
        this.detectSwipe(wrist);
        
        // Two-hand gestures (if both hands present)
        if (this.hands.left && this.hands.right) {
            this.detectTwoHandGestures();
        }
    }

    calculateDistance(point1, point2) {
        const dx = point1.x - point2.x;
        const dy = point1.y - point2.y;
        const dz = point1.z - point2.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    calculateSpread(landmarks) {
        // Average distance between fingertips
        const tips = [4, 8, 12, 16, 20];
        let totalDist = 0;
        let count = 0;
        
        for (let i = 0; i < tips.length - 1; i++) {
            for (let j = i + 1; j < tips.length; j++) {
                totalDist += this.calculateDistance(landmarks[tips[i]], landmarks[tips[j]]);
                count++;
            }
        }
        
        return totalDist / count;
    }

    detectSwipe(wrist) {
        // Simple swipe detection based on wrist velocity
        if (!this.lastWristPos) {
            this.lastWristPos = { x: wrist.x, y: wrist.y, time: Date.now() };
            return;
        }
        
        const now = Date.now();
        const dt = (now - this.lastWristPos.time) / 1000;
        
        if (dt > 0.05) { // Sample every 50ms
            const dx = wrist.x - this.lastWristPos.x;
            const dy = wrist.y - this.lastWristPos.y;
            const velocity = Math.sqrt(dx * dx + dy * dy) / dt;
            
            if (velocity > 2.0) { // Fast movement
                const angle = Math.atan2(dy, dx);
                const direction = this.getSwipeDirection(angle);
                
                if (this.onSwipe && direction !== 'none') {
                    this.onSwipe(direction);
                    this.audioSystem.play('click', 0.7);
                }
            }
            
            this.lastWristPos = { x: wrist.x, y: wrist.y, time: now };
        }
    }

    getSwipeDirection(angle) {
        const deg = angle * 180 / Math.PI;
        if (deg > -45 && deg < 45) return 'right';
        if (deg > 45 && deg < 135) return 'down';
        if (deg < -45 && deg > -135) return 'up';
        return 'left';
    }

    detectTwoHandGestures() {
        if (!this.hands.left || !this.hands.right) return;
        
        const leftIndex = this.hands.left[8];
        const rightIndex = this.hands.right[8];
        
        // Calculate distance between hands
        const handDist = this.calculateDistance(leftIndex, rightIndex);
        
        // Spread gesture (zoom/resize)
        if (!this.lastHandDist) {
            this.lastHandDist = handDist;
            return;
        }
        
        const distChange = handDist - this.lastHandDist;
        
        if (Math.abs(distChange) > 0.05) {
            if (this.onSpread) {
                this.onSpread(distChange > 0 ? 'expand' : 'contract', Math.abs(distChange));
            }
        }
        
        this.lastHandDist = handDist;
    }

    updateCursor(landmarks) {
        // Use index finger tip for cursor
        const indexTip = landmarks[8];
        
        // Convert to screen coordinates (mirrored for natural interaction)
        this.cursorX = (1 - indexTip.x) * window.innerWidth;
        this.cursorY = indexTip.y * window.innerHeight;
        
        // Update cursor element
        const cursor = document.getElementById('spatial-cursor');
        if (cursor) {
            cursor.style.left = this.cursorX + 'px';
            cursor.style.top = this.cursorY + 'px';
            cursor.classList.add('active');
            
            if (this.isPinching) {
                cursor.classList.add('pinching');
            } else {
                cursor.classList.remove('pinching');
            }
        }
    }

    hideCursor() {
        const cursor = document.getElementById('spatial-cursor');
        if (cursor) {
            cursor.classList.remove('active', 'pinching');
        }
    }

    updateAICorePosition(landmarks) {
        const indexTip = landmarks[8];
        
        // Map hand position to 3D space
        this.handPosition3D.x = (0.5 - indexTip.x) * 12;
        this.handPosition3D.y = (0.5 - indexTip.y) * 8;
        
        // Z-depth based on hand size (distance from camera)
        const thumbTip = landmarks[4];
        const pinkyTip = landmarks[20];
        const handSize = this.calculateDistance(thumbTip, pinkyTip);
        this.handPosition3D.z = (0.15 - handSize) * 20;
        
        // Update AI core target position
        if (this.aiCore) {
            this.aiCore.setTargetPosition(
                this.handPosition3D.x,
                this.handPosition3D.y,
                this.handPosition3D.z
            );
        }
    }

    onPinchStart() {
        this.currentGesture = 'pinch';
        this.pinchStartPos = { x: this.cursorX, y: this.cursorY };
        this.audioSystem.play('click');
        
        if (this.onPinch) {
            this.onPinch(this.cursorX, this.cursorY);
        }
    }

    onPinchEnd() {
        this.currentGesture = 'none';
        this.audioSystem.play('click', 0.5);
        
        if (this.onRelease) {
            this.onRelease(this.cursorX, this.cursorY);
        }
        
        this.pinchStartPos = null;
    }

    onPalmDetected() {
        this.currentGesture = 'palm';
        this.lastGesture = 'palm';
        
        // Palm gesture typically used for overview
        setTimeout(() => {
            if (this.currentGesture === 'palm') {
                this.currentGesture = 'none';
            }
        }, 500);
    }

    updateHandIndicators(active, isRight) {
        const leftIndicator = document.getElementById('hand-left');
        const rightIndicator = document.getElementById('hand-right');
        
        if (active) {
            if (isRight && rightIndicator) {
                rightIndicator.classList.add('active');
            } else if (leftIndicator) {
                leftIndicator.classList.add('active');
            }
        } else {
            if (leftIndicator) leftIndicator.classList.remove('active');
            if (rightIndicator) rightIndicator.classList.remove('active');
        }
    }

    updateGestureStatus(status) {
        const gestureText = document.getElementById('gesture-text');
        if (gestureText) {
            gestureText.textContent = `GESTURE TRACKING: ${status}`;
        }
    }

    // Public getters
    getCursorPosition() {
        return { x: this.cursorX, y: this.cursorY };
    }

    getHandPosition3D() {
        return this.handPosition3D;
    }

    isPinchActive() {
        return this.isPinching;
    }
}
