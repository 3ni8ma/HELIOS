/**
 * HELIOS Window Manager
 * Manages spatial browser windows with 3D positioning and real iframe content
 */

import * as THREE from 'three';
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';

export class WindowManager {
    constructor(renderEngine, audioSystem) {
        this.renderEngine = renderEngine;
        this.audioSystem = audioSystem;
        this.cssRenderer = null;
        this.cssScene = null;
        
        // Window management
        this.windows = new Map();
        this.activeWindow = null;
        this.windowIdCounter = 0;
        this.maxWindows = 8;
        
        // Tab system
        this.tabs = [];
        this.activeTabIndex = 0;
        
        // Drag state
        this.isDragging = false;
        this.draggedWindow = null;
        this.dragOffset = { x: 0, y: 0 };
        
        // Workspace layouts
        this.layouts = new Map();
        this.currentLayout = 'default';
    }

    initialize() {
        // Create CSS3D renderer for HTML/iframe content
        this.cssRenderer = new CSS3DRenderer();
        this.cssRenderer.setSize(window.innerWidth, window.innerHeight);
        this.cssRenderer.domElement.style.position = 'absolute';
        this.cssRenderer.domElement.style.top = '0';
        this.cssRenderer.domElement.style.pointerEvents = 'none';
        
        const container = document.getElementById('canvas-container');
        container.appendChild(this.cssRenderer.domElement);
        
        // Create CSS3D scene
        this.cssScene = new THREE.Scene();
        
        // Handle window resize
        window.addEventListener('resize', () => this.onResize());
        
        console.log('✓ Window Manager initialized');
    }

    createWindow(url, title = 'New Window', options = {}) {
        if (this.windows.size >= this.maxWindows) {
            console.warn('Maximum windows reached');
            this.audioSystem.play('error');
            return null;
        }

        const windowId = `window-${this.windowIdCounter++}`;
        
        // Default options
        const config = {
            width: options.width || 800,
            height: options.height || 600,
            x: options.x || 0,
            y: options.y || 0,
            z: options.z || 0,
            ...options
        };

        // Create window DOM element
        const windowElement = this.createWindowElement(windowId, url, title, config);
        
        // Create CSS3D object
        const cssObject = new CSS3DObject(windowElement);
        cssObject.position.set(config.x, config.y, config.z);
        cssObject.scale.set(0.002, 0.002, 0.002); // Scale down to fit 3D space
        this.cssScene.add(cssObject);

        // Store window data
        const windowData = {
            id: windowId,
            element: windowElement,
            cssObject: cssObject,
            url: url,
            title: title,
            config: config,
            iframe: windowElement.querySelector('.window-iframe'),
            isFocused: false,
            isMinimized: false,
            originalPosition: { x: config.x, y: config.y, z: config.z },
            targetPosition: { x: config.x, y: config.y, z: config.z }
        };

        this.windows.set(windowId, windowData);
        this.tabs.push(windowId);
        
        // Focus new window
        this.focusWindow(windowId);
        
        // Play sound
        this.audioSystem.play('windowOpen');
        
        // Update UI
        this.updateWindowCount();
        
        console.log(`Created window: ${title} (${url})`);
        
        return windowData;
    }

    createWindowElement(id, url, title, config) {
        const wrapper = document.createElement('div');
        wrapper.className = 'spatial-window';
        wrapper.id = id;
        wrapper.style.width = config.width + 'px';
        wrapper.style.height = config.height + 'px';
        wrapper.style.pointerEvents = 'auto';

        // Header
        const header = document.createElement('div');
        header.className = 'window-header';
        
        const titleEl = document.createElement('div');
        titleEl.className = 'window-title';
        titleEl.textContent = title;
        
        const controls = document.createElement('div');
        controls.className = 'window-controls';
        
        // Control buttons
        const closeBtn = this.createButton('close', () => this.closeWindow(id));
        const minimizeBtn = this.createButton('minimize', () => this.minimizeWindow(id));
        const maximizeBtn = this.createButton('maximize', () => this.maximizeWindow(id));
        
        controls.appendChild(minimizeBtn);
        controls.appendChild(maximizeBtn);
        controls.appendChild(closeBtn);
        
        header.appendChild(titleEl);
        header.appendChild(controls);
        
        // Make header draggable
        header.addEventListener('mousedown', (e) => this.onWindowDragStart(e, id));
        
        // Content (iframe)
        const content = document.createElement('div');
        content.className = 'window-content';
        
        const iframe = document.createElement('iframe');
        iframe.className = 'window-iframe';
        iframe.src = url;
        iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups');
        
        content.appendChild(iframe);
        
        wrapper.appendChild(header);
        wrapper.appendChild(content);
        
        return wrapper;
    }

    createButton(type, onClick) {
        const btn = document.createElement('div');
        btn.className = `window-btn ${type}`;
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            onClick();
        });
        return btn;
    }

    closeWindow(windowId) {
        const windowData = this.windows.get(windowId);
        if (!windowData) return;

        // Remove from scene
        this.cssScene.remove(windowData.cssObject);
        
        // Remove DOM element
        windowData.element.remove();
        
        // Remove from tabs
        const tabIndex = this.tabs.indexOf(windowId);
        if (tabIndex > -1) {
            this.tabs.splice(tabIndex, 1);
        }
        
        // Remove from map
        this.windows.delete(windowId);
        
        // Focus another window if this was active
        if (this.activeWindow === windowId && this.tabs.length > 0) {
            this.focusWindow(this.tabs[0]);
        }
        
        // Play sound
        this.audioSystem.play('windowClose');
        
        // Update UI
        this.updateWindowCount();
        
        console.log(`Closed window: ${windowId}`);
    }

    minimizeWindow(windowId) {
        const windowData = this.windows.get(windowId);
        if (!windowData) return;

        windowData.isMinimized = !windowData.isMinimized;
        
        if (windowData.isMinimized) {
            // Move to bottom of screen (out of view)
            windowData.targetPosition.y = -10;
            windowData.element.style.opacity = '0.3';
        } else {
            // Restore position
            windowData.targetPosition.y = windowData.originalPosition.y;
            windowData.element.style.opacity = '1';
        }
        
        this.audioSystem.play('click');
    }

    maximizeWindow(windowId) {
        const windowData = this.windows.get(windowId);
        if (!windowData) return;

        const isMaximized = windowData.config.width > 1200;
        
        if (isMaximized) {
            // Restore original size
            windowData.config.width = 800;
            windowData.config.height = 600;
        } else {
            // Maximize
            windowData.config.width = 1400;
            windowData.config.height = 900;
        }
        
        windowData.element.style.width = windowData.config.width + 'px';
        windowData.element.style.height = windowData.config.height + 'px';
        
        this.audioSystem.play('click');
    }

    focusWindow(windowId) {
        // Unfocus all windows
        this.windows.forEach((win) => {
            win.element.classList.remove('focused');
            win.isFocused = false;
        });

        // Focus selected window
        const windowData = this.windows.get(windowId);
        if (windowData) {
            windowData.element.classList.add('focused');
            windowData.isFocused = true;
            this.activeWindow = windowId;
            
            // Bring to front
            windowData.targetPosition.z = 2;
        }
    }

    onWindowDragStart(event, windowId) {
        event.preventDefault();
        
        this.isDragging = true;
        this.draggedWindow = windowId;
        
        const windowData = this.windows.get(windowId);
        if (!windowData) return;
        
        this.focusWindow(windowId);
        
        // Calculate drag offset
        const rect = windowData.element.getBoundingClientRect();
        this.dragOffset.x = event.clientX - rect.left;
        this.dragOffset.y = event.clientY - rect.top;
        
        // Add global mouse listeners
        document.addEventListener('mousemove', this.onWindowDrag);
        document.addEventListener('mouseup', this.onWindowDragEnd);
    }

    onWindowDrag = (event) => {
        if (!this.isDragging || !this.draggedWindow) return;

        const windowData = this.windows.get(this.draggedWindow);
        if (!windowData) return;

        // Calculate new position in 3D space
        const screenX = event.clientX;
        const screenY = event.clientY;
        
        // Convert screen to world coordinates
        const worldPos = this.renderEngine.screenToWorld(screenX, screenY, windowData.cssObject.position.z);
        
        windowData.targetPosition.x = worldPos.x;
        windowData.targetPosition.y = worldPos.y;
    }

    onWindowDragEnd = () => {
        this.isDragging = false;
        this.draggedWindow = null;
        
        document.removeEventListener('mousemove', this.onWindowDrag);
        document.removeEventListener('mouseup', this.onWindowDragEnd);
    }

    // Tab navigation
    nextTab() {
        if (this.tabs.length === 0) return;
        
        this.activeTabIndex = (this.activeTabIndex + 1) % this.tabs.length;
        this.focusWindow(this.tabs[this.activeTabIndex]);
        this.audioSystem.play('click');
    }

    previousTab() {
        if (this.tabs.length === 0) return;
        
        this.activeTabIndex = (this.activeTabIndex - 1 + this.tabs.length) % this.tabs.length;
        this.focusWindow(this.tabs[this.activeTabIndex]);
        this.audioSystem.play('click');
    }

    // Tab overview mode
    showTabOverview() {
        const overview = document.getElementById('tab-overview');
        if (!overview) return;

        overview.innerHTML = '';
        
        this.tabs.forEach((windowId, index) => {
            const windowData = this.windows.get(windowId);
            if (!windowData) return;

            const card = document.createElement('div');
            card.className = 'tab-card';
            if (windowId === this.activeWindow) {
                card.classList.add('active');
            }

            const title = document.createElement('h3');
            title.textContent = windowData.title;
            
            const url = document.createElement('p');
            url.textContent = windowData.url;
            url.style.fontSize = '11px';
            url.style.opacity = '0.7';
            
            card.appendChild(title);
            card.appendChild(url);
            
            card.addEventListener('click', () => {
                this.focusWindow(windowId);
                this.hideTabOverview();
            });
            
            overview.appendChild(card);
        });
        
        overview.classList.remove('hidden');
    }

    hideTabOverview() {
        const overview = document.getElementById('tab-overview');
        if (overview) {
            overview.classList.add('hidden');
        }
    }

    // Workspace management
    arrangeWindows(layout = 'grid') {
        const windowArray = Array.from(this.windows.values());
        const count = windowArray.length;
        
        if (count === 0) return;

        switch (layout) {
            case 'grid':
                this.arrangeGrid(windowArray);
                break;
            case 'cascade':
                this.arrangeCascade(windowArray);
                break;
            case 'horizontal':
                this.arrangeHorizontal(windowArray);
                break;
            case 'circular':
                this.arrangeCircular(windowArray);
                break;
        }
        
        this.audioSystem.play('confirm');
    }

    arrangeGrid(windows) {
        const cols = Math.ceil(Math.sqrt(windows.length));
        const spacing = 3;
        
        windows.forEach((win, i) => {
            const row = Math.floor(i / cols);
            const col = i % cols;
            
            win.targetPosition.x = (col - cols / 2) * spacing;
            win.targetPosition.y = (row - Math.floor(windows.length / cols) / 2) * spacing;
            win.targetPosition.z = 0;
        });
    }

    arrangeCascade(windows) {
        windows.forEach((win, i) => {
            win.targetPosition.x = -4 + i * 0.5;
            win.targetPosition.y = 2 - i * 0.5;
            win.targetPosition.z = i * 0.5;
        });
    }

    arrangeHorizontal(windows) {
        const spacing = 4;
        const startX = -(windows.length - 1) * spacing / 2;
        
        windows.forEach((win, i) => {
            win.targetPosition.x = startX + i * spacing;
            win.targetPosition.y = 0;
            win.targetPosition.z = 0;
        });
    }

    arrangeCircular(windows) {
        const radius = 6;
        const angleStep = (Math.PI * 2) / windows.length;
        
        windows.forEach((win, i) => {
            const angle = i * angleStep;
            win.targetPosition.x = Math.cos(angle) * radius;
            win.targetPosition.y = Math.sin(angle) * radius * 0.5;
            win.targetPosition.z = Math.sin(angle) * 2;
        });
    }

    // Update loop
    update(deltaTime) {
        // Smooth window positioning
        this.windows.forEach((windowData) => {
            const pos = windowData.cssObject.position;
            const target = windowData.targetPosition;
            
            // Lerp to target position
            pos.x += (target.x - pos.x) * 0.1;
            pos.y += (target.y - pos.y) * 0.1;
            pos.z += (target.z - pos.z) * 0.1;
        });
    }

    render() {
        if (this.cssRenderer && this.cssScene) {
            this.cssRenderer.render(this.cssScene, this.renderEngine.getCamera());
        }
    }

    onResize() {
        if (this.cssRenderer) {
            this.cssRenderer.setSize(window.innerWidth, window.innerHeight);
        }
    }

    updateWindowCount() {
        const countElement = document.getElementById('window-count');
        if (countElement) {
            countElement.textContent = this.windows.size;
        }
    }

    // Session management
    saveSession() {
        const session = {
            windows: [],
            activeWindow: this.activeWindow,
            timestamp: Date.now()
        };

        this.windows.forEach((windowData) => {
            session.windows.push({
                url: windowData.url,
                title: windowData.title,
                position: windowData.targetPosition,
                config: windowData.config
            });
        });

        localStorage.setItem('helios_session', JSON.stringify(session));
        console.log('Session saved');
    }

    loadSession() {
        const sessionData = localStorage.getItem('helios_session');
        if (!sessionData) return;

        try {
            const session = JSON.parse(sessionData);
            
            // Clear current windows
            this.windows.forEach((_, id) => this.closeWindow(id));
            
            // Restore windows
            session.windows.forEach((winData) => {
                this.createWindow(winData.url, winData.title, {
                    ...winData.config,
                    ...winData.position
                });
            });

            console.log('Session restored');
        } catch (error) {
            console.error('Failed to load session:', error);
        }
    }

    clearWorkspace() {
        const windowIds = Array.from(this.windows.keys());
        windowIds.forEach(id => this.closeWindow(id));
        this.audioSystem.play('confirm');
    }
}
