/**
 * HELIOS Rendering Engine
 * Manages 3D scene, camera, lighting, and post-processing
 */

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

export class RenderEngine {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.composer = null;
        this.clock = new THREE.Clock();
        this.fps = 0;
        this.frameCount = 0;
        this.lastFPSUpdate = 0;
    }

    async initialize() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x000000, 0.02);

        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.z = 10;

        // Create renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;

        // Add to DOM
        const container = document.getElementById('canvas-container');
        container.appendChild(this.renderer.domElement);

        // Setup post-processing
        this.setupPostProcessing();

        // Add lighting
        this.setupLighting();

        // Handle resize
        window.addEventListener('resize', () => this.onResize());

        console.log('✓ Render Engine initialized');
    }

    setupPostProcessing() {
        // Create composer
        this.composer = new EffectComposer(this.renderer);

        // Render pass
        const renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);

        // Bloom pass
        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            2.0,  // strength
            0.4,  // radius
            0.85  // threshold
        );
        this.composer.addPass(bloomPass);
    }

    setupLighting() {
        // Ambient light
        const ambient = new THREE.AmbientLight(0x00f2ff, 0.3);
        this.scene.add(ambient);

        // Directional lights for depth
        const light1 = new THREE.DirectionalLight(0x00f2ff, 0.5);
        light1.position.set(5, 5, 5);
        this.scene.add(light1);

        const light2 = new THREE.DirectionalLight(0xff0055, 0.3);
        light2.position.set(-5, -5, -5);
        this.scene.add(light2);

        // Point light for dynamic glow
        this.dynamicLight = new THREE.PointLight(0x00f2ff, 2, 50);
        this.dynamicLight.position.set(0, 0, 0);
        this.scene.add(this.dynamicLight);
    }

    render() {
        // Update FPS counter
        this.frameCount++;
        const now = performance.now();
        if (now - this.lastFPSUpdate > 1000) {
            this.fps = Math.round(this.frameCount * 1000 / (now - this.lastFPSUpdate));
            this.frameCount = 0;
            this.lastFPSUpdate = now;
            
            const fpsElement = document.getElementById('fps');
            if (fpsElement) fpsElement.textContent = this.fps;
        }

        // Render scene
        this.composer.render();
    }

    onResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);
        this.composer.setSize(width, height);
    }

    // Utility methods
    addToScene(object) {
        this.scene.add(object);
    }

    removeFromScene(object) {
        this.scene.remove(object);
    }

    getScene() {
        return this.scene;
    }

    getCamera() {
        return this.camera;
    }

    getDynamicLight() {
        return this.dynamicLight;
    }

    // Screen to world position conversion
    screenToWorld(x, y, z = 0) {
        const vector = new THREE.Vector3(
            (x / window.innerWidth) * 2 - 1,
            -(y / window.innerHeight) * 2 + 1,
            z
        );
        vector.unproject(this.camera);
        return vector;
    }
}
