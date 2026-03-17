/**
 * HELIOS Main Application
 * Integrates all subsystems and manages application lifecycle
 */

import { RenderEngine } from './core/RenderEngine.js';
import { AICore } from './core/AICore.js';
import { AudioSystem } from './core/AudioSystem.js';
import { GestureEngine } from './core/GestureEngine.js';
import { VoiceEngine } from './core/VoiceEngine.js';
import { WindowManager } from './core/WindowManager.js';

class HELIOS {
    constructor() {
        this.renderEngine = null;
        this.aiCore = null;
        this.audioSystem = null;
        this.gestureEngine = null;
        this.voiceEngine = null;
        this.windowManager = null;
        
        this.isInitialized = false;
        this.isPaused = false;
        this.currentMode = 'normal';
        
        // Gesture interaction state
        this.selectedWindow = null;
    }

    async initialize() {
        console.log('🚀 Initializing HELIOS...');
        
        try {
            // Initialize core systems
            this.audioSystem = new AudioSystem();
            await this.audioSystem.initialize();
            
            this.renderEngine = new RenderEngine();
            await this.renderEngine.initialize();
            
            this.aiCore = new AICore(this.renderEngine);
            this.aiCore.initialize();
            
            this.windowManager = new WindowManager(this.renderEngine, this.audioSystem);
            this.windowManager.initialize();
            
            this.gestureEngine = new GestureEngine(this.audioSystem, this.aiCore);
            await this.gestureEngine.initialize();
            
            this.voiceEngine = new VoiceEngine(this.audioSystem, this.aiCore);
            await this.voiceEngine.initialize();
            
            // Setup integrations
            this.setupGestureCallbacks();
            this.setupVoiceCallbacks();
            this.setupKeyboardShortcuts();
            
            // Start systems
            this.voiceEngine.start();
            this.audioSystem.startAmbient();
            
            this.isInitialized = true;
            
            // Start render loop
            this.animate();
            
            // Create demo windows
            this.createDemoWorkspace();
            
            console.log('✅ HELIOS initialized successfully');
            this.showWelcomeMessage();
            
        } catch (error) {
            console.error('❌ HELIOS initialization failed:', error);
        }
    }

    setupGestureCallbacks() {
        // Pinch gesture - interact with windows
        this.gestureEngine.onPinch = (x, y) => {
            console.log('Pinch detected at:', x, y);
            // Check if clicking on a window
            // For now, just provide feedback
            this.audioSystem.play('click');
        };

        this.gestureEngine.onRelease = (x, y) => {
            console.log('Released at:', x, y);
        };

        // Swipe gestures - navigate tabs
        this.gestureEngine.onSwipe = (direction) => {
            console.log('Swipe:', direction);
            
            if (direction === 'left') {
                this.windowManager.nextTab();
            } else if (direction === 'right') {
                this.windowManager.previousTab();
            } else if (direction === 'up') {
                this.windowManager.showTabOverview();
            }
        };

        // Two-hand spread - resize window
        this.gestureEngine.onSpread = (type, amount) => {
            console.log('Spread gesture:', type, amount);
            // Could be used for resizing focused window
        };
    }

    setupVoiceCallbacks() {
        // Navigate to URL
        this.voiceEngine.onNavigate = (url) => {
            console.log('Voice navigation to:', url);
            this.windowManager.createWindow(url, this.extractDomain(url));
        };

        // Search query
        this.voiceEngine.onSearchQuery = (url, query) => {
            console.log('Voice search:', query);
            this.windowManager.createWindow(url, `Search: ${query}`);
        };

        // Window actions
        this.voiceEngine.onWindowAction = (action) => {
            console.log('Window action:', action);
            
            const activeId = this.windowManager.activeWindow;
            if (!activeId) return;

            switch (action) {
                case 'close':
                    this.windowManager.closeWindow(activeId);
                    break;
                case 'minimize':
                    this.windowManager.minimizeWindow(activeId);
                    break;
                case 'maximize':
                    this.windowManager.maximizeWindow(activeId);
                    break;
            }
        };

        // System actions
        this.voiceEngine.onSystemAction = (action) => {
            console.log('System action:', action);
            
            switch (action) {
                case 'reset':
                    this.windowManager.clearWorkspace();
                    this.setMode('normal');
                    break;
                case 'focus':
                    this.setMode('focus');
                    break;
                case 'overview':
                    this.windowManager.showTabOverview();
                    break;
            }
        };

        // Generic commands
        this.voiceEngine.onCommand = (type, value) => {
            console.log('Command:', type, value);
            
            if (type === 'tab') {
                if (value === 'next') this.windowManager.nextTab();
                else if (value === 'previous') this.windowManager.previousTab();
            }
        };
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + T: New window
            if ((e.ctrlKey || e.metaKey) && e.key === 't') {
                e.preventDefault();
                const url = prompt('Enter URL:');
                if (url) {
                    this.windowManager.createWindow(url, this.extractDomain(url));
                }
            }

            // Ctrl/Cmd + W: Close window
            if ((e.ctrlKey || e.metaKey) && e.key === 'w') {
                e.preventDefault();
                if (this.windowManager.activeWindow) {
                    this.windowManager.closeWindow(this.windowManager.activeWindow);
                }
            }

            // Tab: Next window
            if (e.key === 'Tab' && !e.shiftKey) {
                e.preventDefault();
                this.windowManager.nextTab();
            }

            // Shift + Tab: Previous window
            if (e.key === 'Tab' && e.shiftKey) {
                e.preventDefault();
                this.windowManager.previousTab();
            }

            // Escape: Close overview
            if (e.key === 'Escape') {
                this.windowManager.hideTabOverview();
            }

            // Space: Toggle overview
            if (e.key === ' ' && e.ctrlKey) {
                e.preventDefault();
                this.windowManager.showTabOverview();
            }

            // F: Focus mode
            if (e.key === 'f' && e.ctrlKey) {
                e.preventDefault();
                this.setMode('focus');
            }

            // R: Reset workspace
            if (e.key === 'r' && e.ctrlKey) {
                e.preventDefault();
                this.windowManager.clearWorkspace();
            }

            // 1-5: Arrange windows
            if (e.key >= '1' && e.key <= '5' && e.altKey) {
                e.preventDefault();
                const layouts = ['grid', 'cascade', 'horizontal', 'circular'];
                this.windowManager.arrangeWindows(layouts[parseInt(e.key) - 1]);
            }

            // S: Save session
            if (e.key === 's' && (e.ctrlKey || e.metaKey) && e.shiftKey) {
                e.preventDefault();
                this.windowManager.saveSession();
            }

            // L: Load session
            if (e.key === 'l' && (e.ctrlKey || e.metaKey) && e.shiftKey) {
                e.preventDefault();
                this.windowManager.loadSession();
            }
        });
    }

    animate = () => {
        requestAnimationFrame(this.animate);

        if (this.isPaused) return;

        const deltaTime = this.renderEngine.clock.getDelta();

        // Update all systems
        if (this.gestureEngine) {
            this.gestureEngine.update();
        }

        if (this.aiCore) {
            this.aiCore.update(deltaTime);
        }

        if (this.windowManager) {
            this.windowManager.update(deltaTime);
        }

        // Render
        this.renderEngine.render();
        this.windowManager.render();
    }

    setMode(mode) {
        this.currentMode = mode;
        
        const modeElement = document.getElementById('current-mode');
        if (modeElement) {
            modeElement.textContent = mode.toUpperCase();
        }

        switch (mode) {
            case 'focus':
                // Dim all windows except active
                this.windowManager.windows.forEach((win) => {
                    if (win.id !== this.windowManager.activeWindow) {
                        win.element.style.opacity = '0.3';
                    } else {
                        win.element.style.opacity = '1';
                    }
                });
                break;
                
            case 'normal':
                // Restore all windows
                this.windowManager.windows.forEach((win) => {
                    win.element.style.opacity = '1';
                });
                break;
        }

        this.audioSystem.play('confirm');
    }

    createDemoWorkspace() {
        // Create some demo windows to showcase the system
        setTimeout(() => {
            this.windowManager.createWindow(
                'https://www.google.com',
                'Google Search',
                { x: -3, y: 1, z: 0 }
            );
        }, 500);

        setTimeout(() => {
            this.windowManager.createWindow(
                'https://github.com',
                'GitHub',
                { x: 3, y: 1, z: 0 }
            );
        }, 1000);

        setTimeout(() => {
            this.windowManager.createWindow(
                'https://threejs.org',
                'Three.js',
                { x: 0, y: -2, z: 0 }
            );
        }, 1500);
    }

    showWelcomeMessage() {
        const display = document.getElementById('command-display');
        const displayText = document.getElementById('command-text');
        
        if (display && displayText) {
            displayText.textContent = 'HELIOS ONLINE - VOICE & GESTURE READY';
            display.classList.remove('hidden');
            
            setTimeout(() => {
                display.classList.add('hidden');
            }, 3000);
        }
    }

    extractDomain(url) {
        try {
            const domain = new URL(url).hostname;
            return domain.replace('www.', '');
        } catch {
            return 'Browser';
        }
    }

    pause() {
        this.isPaused = true;
    }

    resume() {
        this.isPaused = false;
    }

    shutdown() {
        console.log('Shutting down HELIOS...');
        
        if (this.voiceEngine) {
            this.voiceEngine.stop();
        }
        
        if (this.audioSystem) {
            this.audioSystem.stopAmbient();
        }
        
        if (this.windowManager) {
            this.windowManager.saveSession();
        }
    }
}

// Initialize and start HELIOS
const helios = new HELIOS();

// Start when DOM is ready
console.log('🌟 HELIOS main.js loaded, readyState:', document.readyState);

async function startHelios() {
    console.log('🌟 Starting HELIOS initialization...');
    try {
        await helios.initialize();
        console.log('✅ HELIOS fully initialized');
    } catch (error) {
        console.error('❌ HELIOS startup failed:', error);
        const voiceText = document.getElementById('voice-text');
        if (voiceText) {
            voiceText.textContent = 'INITIALIZATION FAILED - CHECK CONSOLE';
            voiceText.style.color = '#ff0000';
        }
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startHelios);
} else {
    startHelios();
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (helios && helios.shutdown) {
        helios.shutdown();
    }
});

// Export for console access
window.HELIOS = helios;

console.log('🌟 HELIOS main.js execution complete');
