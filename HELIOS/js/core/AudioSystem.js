/**
 * HELIOS Audio System
 * Manages all sound feedback
 */

export class AudioSystem {
    constructor() {
        this.audioContext = null;
        this.sounds = new Map();
        this.ambientGain = null;
        this.effectsGain = null;
        this.enabled = true;
    }

    async initialize() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create gain nodes for volume control
            this.ambientGain = this.audioContext.createGain();
            this.ambientGain.gain.value = 0.3;
            this.ambientGain.connect(this.audioContext.destination);

            this.effectsGain = this.audioContext.createGain();
            this.effectsGain.gain.value = 0.5;
            this.effectsGain.connect(this.audioContext.destination);

            // Generate procedural sounds
            await this.generateSounds();

            console.log('✓ Audio System initialized');
        } catch (error) {
            console.warn('Audio System failed to initialize:', error);
            this.enabled = false;
        }
    }

    async generateSounds() {
        // Confirmation beep (rising tone)
        this.sounds.set('confirm', this.createConfirmSound());
        
        // Error sound (descending tone)
        this.sounds.set('error', this.createErrorSound());
        
        // Listening activation
        this.sounds.set('listen', this.createListenSound());
        
        // Window open/close
        this.sounds.set('windowOpen', this.createWindowSound(true));
        this.sounds.set('windowClose', this.createWindowSound(false));
        
        // Gesture interaction
        this.sounds.set('click', this.createClickSound());
    }

    createConfirmSound() {
        const duration = 0.15;
        const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * duration, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < buffer.length; i++) {
            const t = i / this.audioContext.sampleRate;
            const freq = 800 + t * 400; // Rising from 800Hz to 1200Hz
            const envelope = Math.exp(-t * 8);
            data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.3;
        }

        return buffer;
    }

    createErrorSound() {
        const duration = 0.2;
        const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * duration, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < buffer.length; i++) {
            const t = i / this.audioContext.sampleRate;
            const freq = 400 - t * 200; // Falling from 400Hz to 200Hz
            const envelope = Math.exp(-t * 5);
            data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.3;
        }

        return buffer;
    }

    createListenSound() {
        const duration = 0.1;
        const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * duration, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < buffer.length; i++) {
            const t = i / this.audioContext.sampleRate;
            const freq = 1200;
            const envelope = Math.exp(-t * 15);
            data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.2;
        }

        return buffer;
    }

    createWindowSound(opening) {
        const duration = 0.3;
        const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * duration, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < buffer.length; i++) {
            const t = i / this.audioContext.sampleRate;
            const freq = opening ? 300 + t * 300 : 600 - t * 300;
            const envelope = Math.exp(-t * 4);
            data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.25;
        }

        return buffer;
    }

    createClickSound() {
        const duration = 0.05;
        const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * duration, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < buffer.length; i++) {
            const t = i / this.audioContext.sampleRate;
            data[i] = (Math.random() * 2 - 1) * Math.exp(-t * 50) * 0.15;
        }

        return buffer;
    }

    play(soundName, volume = 1.0) {
        if (!this.enabled || !this.sounds.has(soundName)) return;

        try {
            const source = this.audioContext.createBufferSource();
            source.buffer = this.sounds.get(soundName);
            
            const gain = this.audioContext.createGain();
            gain.gain.value = volume;
            
            source.connect(gain);
            gain.connect(this.effectsGain);
            source.start(0);
        } catch (error) {
            console.warn('Failed to play sound:', soundName, error);
        }
    }

    // Ambient background hum
    startAmbient() {
        if (!this.enabled) return;

        try {
            this.ambientOscillator = this.audioContext.createOscillator();
            this.ambientOscillator.type = 'sine';
            this.ambientOscillator.frequency.value = 60; // Low hum
            
            const lfo = this.audioContext.createOscillator();
            lfo.frequency.value = 0.5;
            const lfoGain = this.audioContext.createGain();
            lfoGain.gain.value = 5;
            
            lfo.connect(lfoGain);
            lfoGain.connect(this.ambientOscillator.frequency);
            
            this.ambientOscillator.connect(this.ambientGain);
            this.ambientOscillator.start();
            lfo.start();
        } catch (error) {
            console.warn('Failed to start ambient sound:', error);
        }
    }

    stopAmbient() {
        if (this.ambientOscillator) {
            this.ambientOscillator.stop();
            this.ambientOscillator = null;
        }
    }

    setVolume(ambient, effects) {
        if (this.ambientGain) this.ambientGain.gain.value = ambient;
        if (this.effectsGain) this.effectsGain.gain.value = effects;
    }

    toggle() {
        this.enabled = !this.enabled;
        if (!this.enabled) {
            this.stopAmbient();
        }
        return this.enabled;
    }
}
