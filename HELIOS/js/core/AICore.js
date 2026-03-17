/**
 * HELIOS AI Core
 * Central reactive sphere that responds to voice and gestures
 */

import * as THREE from 'three';

export class AICore {
    constructor(renderEngine) {
        this.renderEngine = renderEngine;
        this.core = null;
        this.particles = null;
        this.targetPosition = new THREE.Vector3(0, 0, 0);
        this.currentPosition = new THREE.Vector3(0, 0, 0);
        this.isListening = false;
        this.isProcessing = false;
        this.energy = 0;
        this.targetEnergy = 0;
    }

    initialize() {
        // Create core sphere (wireframe icosahedron)
        const geometry = new THREE.IcosahedronGeometry(1.5, 3);
        const material = new THREE.MeshStandardMaterial({
            color: 0x00f2ff,
            wireframe: true,
            emissive: 0x00f2ff,
            emissiveIntensity: 2,
            transparent: true,
            opacity: 0.8
        });
        
        this.core = new THREE.Mesh(geometry, material);
        this.renderEngine.addToScene(this.core);

        // Create inner glow sphere
        const glowGeometry = new THREE.SphereGeometry(1.2, 32, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x00f2ff,
            transparent: true,
            opacity: 0.15,
            side: THREE.BackSide
        });
        this.glow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.core.add(this.glow);

        // Create particle field around core
        this.createParticleField();

        // Create energy rings
        this.createEnergyRings();

        console.log('✓ AI Core initialized');
    }

    createParticleField() {
        const particleCount = 2000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount * 3; i += 3) {
            // Random spherical distribution
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(Math.random() * 2 - 1);
            const radius = 3 + Math.random() * 2;

            positions[i] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i + 2] = radius * Math.cos(phi);

            // Cyan to white gradient
            const t = Math.random();
            colors[i] = t;
            colors[i + 1] = 0.95;
            colors[i + 2] = 1;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.03,
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });

        this.particles = new THREE.Points(geometry, material);
        this.renderEngine.addToScene(this.particles);
    }

    createEnergyRings() {
        this.rings = [];
        for (let i = 0; i < 3; i++) {
            const geometry = new THREE.TorusGeometry(2 + i * 0.5, 0.02, 16, 100);
            const material = new THREE.MeshBasicMaterial({
                color: 0x00f2ff,
                transparent: true,
                opacity: 0.3
            });
            const ring = new THREE.Mesh(geometry, material);
            ring.rotation.x = Math.PI / 2;
            this.core.add(ring);
            this.rings.push(ring);
        }
    }

    update(deltaTime) {
        if (!this.core) return;

        // Smooth position tracking
        this.currentPosition.lerp(this.targetPosition, 0.08);
        this.core.position.copy(this.currentPosition);

        // Energy decay
        this.targetEnergy *= 0.95;
        this.energy += (this.targetEnergy - this.energy) * 0.1;

        // Rotation based on state
        if (this.isProcessing) {
            this.core.rotation.y += 0.05;
            this.core.rotation.x += 0.02;
        } else if (this.isListening) {
            this.core.rotation.y += 0.03;
        } else {
            this.core.rotation.y += 0.008;
        }

        // Particle rotation
        if (this.particles) {
            this.particles.rotation.y += 0.001;
            this.particles.rotation.x = Math.sin(Date.now() * 0.0005) * 0.1;
        }

        // Energy rings
        this.rings.forEach((ring, i) => {
            ring.rotation.z += 0.01 * (i + 1);
            ring.scale.setScalar(1 + this.energy * 0.2);
        });

        // Glow pulsing
        if (this.glow) {
            this.glow.material.opacity = 0.15 + this.energy * 0.3;
            this.glow.scale.setScalar(1 + Math.sin(Date.now() * 0.003) * 0.1);
        }

        // Color changes based on state
        if (this.isProcessing) {
            this.core.material.color.setHex(0xff0055);
            this.core.material.emissive.setHex(0xff0055);
        } else if (this.isListening) {
            this.core.material.color.setHex(0xffaa00);
            this.core.material.emissive.setHex(0xffaa00);
        } else {
            this.core.material.color.setHex(0x00f2ff);
            this.core.material.emissive.setHex(0x00f2ff);
        }

        // Update dynamic light
        const light = this.renderEngine.getDynamicLight();
        if (light) {
            light.position.copy(this.currentPosition);
            light.intensity = 2 + this.energy * 3;
        }
    }

    // State changes
    setListening(listening) {
        this.isListening = listening;
        if (listening) {
            this.addEnergy(0.5);
        }
    }

    setProcessing(processing) {
        this.isProcessing = processing;
        if (processing) {
            this.addEnergy(1.0);
        }
    }

    addEnergy(amount) {
        this.targetEnergy = Math.min(1, this.targetEnergy + amount);
    }

    // Position control
    setTargetPosition(x, y, z) {
        this.targetPosition.set(x, y, z);
    }

    moveToPosition(vector) {
        this.targetPosition.copy(vector);
    }

    // React to voice input (visual feedback)
    onVoiceInput(volume) {
        const scaleFactor = 1 + volume * 0.3;
        this.core.scale.setScalar(scaleFactor);
        this.addEnergy(volume);
    }

    // React to successful command
    onCommandSuccess() {
        this.addEnergy(0.8);
        // Pulse effect
        const originalScale = this.core.scale.clone();
        this.core.scale.setScalar(1.3);
        setTimeout(() => {
            this.core.scale.copy(originalScale);
        }, 200);
    }

    // Get current position
    getPosition() {
        return this.currentPosition.clone();
    }
}
