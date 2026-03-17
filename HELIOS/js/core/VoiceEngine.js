/**
 * HELIOS Voice Engine
 * Voice command recognition and natural language processing
 */

export class VoiceEngine {
    constructor(audioSystem, aiCore) {
        this.audioSystem = audioSystem;
        this.aiCore = aiCore;
        this.recognition = null;
        this.isListening = false;
        this.isEnabled = false;
        
        // Command callbacks
        this.onCommand = null;
        this.onSearchQuery = null;
        this.onNavigate = null;
        this.onWindowAction = null;
        this.onSystemAction = null;
        
        // Command history
        this.commandHistory = [];
        this.maxHistory = 50;
    }

    async initialize() {
        // Check for Web Speech API support
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            console.warn('Web Speech API not supported');
            this.updateVoiceStatus('NOT SUPPORTED');
            return;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
        this.recognition.maxAlternatives = 1;

        // Event handlers
        this.recognition.onstart = () => this.onStart();
        this.recognition.onresult = (event) => this.onResult(event);
        this.recognition.onerror = (event) => this.onError(event);
        this.recognition.onend = () => this.onEnd();

        this.isEnabled = true;
        console.log('✓ Voice Engine initialized');
    }

    start() {
        if (!this.isEnabled || this.isListening) return;
        
        try {
            this.recognition.start();
        } catch (error) {
            console.warn('Failed to start voice recognition:', error);
        }
    }

    stop() {
        if (!this.isListening) return;
        
        try {
            this.recognition.stop();
        } catch (error) {
            console.warn('Failed to stop voice recognition:', error);
        }
    }

    onStart() {
        this.isListening = true;
        this.updateVoiceStatus('LISTENING...', true);
        this.audioSystem.play('listen');
        
        if (this.aiCore) {
            this.aiCore.setListening(true);
        }
    }

    onResult(event) {
        const result = event.results[event.results.length - 1];
        const transcript = result[0].transcript.trim().toLowerCase();
        const isFinal = result.isFinal;

        // Show interim results
        if (!isFinal) {
            this.updateVoiceStatus(transcript, true);
            return;
        }

        // Process final command
        this.updateVoiceStatus(transcript, false);
        this.processCommand(transcript);
        
        // Add to history
        this.addToHistory(transcript);
    }

    onError(event) {
        console.error('Voice recognition error:', event.error);
        
        if (event.error === 'no-speech') {
            // Silent timeout - restart
            if (this.isListening) {
                this.start();
            }
        } else {
            this.updateVoiceStatus('ERROR: ' + event.error, false);
            this.audioSystem.play('error');
        }
    }

    onEnd() {
        this.isListening = false;
        
        if (this.aiCore) {
            this.aiCore.setListening(false);
        }
        
        // Auto-restart if enabled
        setTimeout(() => {
            if (this.isEnabled) {
                this.start();
            }
        }, 500);
    }

    processCommand(text) {
        console.log('Processing command:', text);
        
        if (this.aiCore) {
            this.aiCore.setProcessing(true);
            setTimeout(() => this.aiCore.setProcessing(false), 1000);
        }

        // Navigation commands
        if (text.includes('open') || text.includes('go to') || text.includes('navigate')) {
            this.handleNavigationCommand(text);
            return;
        }

        // Search commands
        if (text.includes('search for') || text.includes('find') || text.includes('look up')) {
            this.handleSearchCommand(text);
            return;
        }

        // Window management
        if (text.includes('close') || text.includes('minimize') || text.includes('maximize')) {
            this.handleWindowCommand(text);
            return;
        }

        // Tab management
        if (text.includes('next tab') || text.includes('previous tab') || text.includes('switch tab')) {
            this.handleTabCommand(text);
            return;
        }

        // System commands
        if (text.includes('reset') || text.includes('focus') || text.includes('overview')) {
            this.handleSystemCommand(text);
            return;
        }

        // Volume/audio control
        if (text.includes('volume') || text.includes('mute') || text.includes('sound')) {
            this.handleAudioCommand(text);
            return;
        }

        // Help
        if (text.includes('help') || text.includes('commands')) {
            this.showHelp();
            return;
        }

        // Unknown command
        console.log('Unknown command:', text);
        this.audioSystem.play('error');
        this.showCommandDisplay('COMMAND NOT RECOGNIZED', 2000);
    }

    handleNavigationCommand(text) {
        // Extract URL or website name
        let url = null;
        
        // Common patterns
        const patterns = [
            /open (.+)/,
            /go to (.+)/,
            /navigate to (.+)/,
            /visit (.+)/
        ];

        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) {
                url = this.parseURL(match[1]);
                break;
            }
        }

        if (url && this.onNavigate) {
            this.onNavigate(url);
            this.audioSystem.play('confirm');
            this.showCommandDisplay(`OPENING: ${url}`, 2000);
            
            if (this.aiCore) {
                this.aiCore.onCommandSuccess();
            }
        }
    }

    parseURL(input) {
        input = input.trim().toLowerCase();
        
        // Remove common filler words
        input = input.replace(/^(the |a |an )/g, '');
        
        // Common site mappings
        const shortcuts = {
            'youtube': 'youtube.com',
            'google': 'google.com',
            'github': 'github.com',
            'twitter': 'twitter.com',
            'reddit': 'reddit.com',
            'facebook': 'facebook.com',
            'instagram': 'instagram.com',
            'linkedin': 'linkedin.com',
            'netflix': 'netflix.com',
            'amazon': 'amazon.com'
        };

        if (shortcuts[input]) {
            return 'https://' + shortcuts[input];
        }

        // Handle "dot com" voice input
        input = input.replace(/\s+dot\s+/g, '.');
        input = input.replace(/\s+/g, '');

        // Add protocol if missing
        if (!input.startsWith('http')) {
            input = 'https://' + input;
        }

        return input;
    }

    handleSearchCommand(text) {
        const patterns = [
            /search for (.+)/,
            /find (.+)/,
            /look up (.+)/
        ];

        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) {
                const query = match[1];
                const searchURL = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
                
                if (this.onSearchQuery) {
                    this.onSearchQuery(searchURL, query);
                    this.audioSystem.play('confirm');
                    this.showCommandDisplay(`SEARCHING: ${query}`, 2000);
                    
                    if (this.aiCore) {
                        this.aiCore.onCommandSuccess();
                    }
                }
                return;
            }
        }
    }

    handleWindowCommand(text) {
        let action = null;
        
        if (text.includes('close')) action = 'close';
        else if (text.includes('minimize')) action = 'minimize';
        else if (text.includes('maximize')) action = 'maximize';
        
        if (action && this.onWindowAction) {
            this.onWindowAction(action);
            this.audioSystem.play('confirm');
            this.showCommandDisplay(`WINDOW: ${action.toUpperCase()}`, 1500);
        }
    }

    handleTabCommand(text) {
        let direction = null;
        
        if (text.includes('next')) direction = 'next';
        else if (text.includes('previous') || text.includes('back')) direction = 'previous';
        
        if (direction && this.onCommand) {
            this.onCommand('tab', direction);
            this.audioSystem.play('confirm');
        }
    }

    handleSystemCommand(text) {
        let action = null;
        
        if (text.includes('reset')) action = 'reset';
        else if (text.includes('focus')) action = 'focus';
        else if (text.includes('overview')) action = 'overview';
        
        if (action && this.onSystemAction) {
            this.onSystemAction(action);
            this.audioSystem.play('confirm');
            this.showCommandDisplay(`MODE: ${action.toUpperCase()}`, 1500);
        }
    }

    handleAudioCommand(text) {
        if (text.includes('mute')) {
            this.audioSystem.setVolume(0, 0);
            this.showCommandDisplay('AUDIO MUTED', 1500);
        } else if (text.includes('unmute')) {
            this.audioSystem.setVolume(0.3, 0.5);
            this.showCommandDisplay('AUDIO ENABLED', 1500);
        }
    }

    showHelp() {
        const commands = [
            'Open [website]',
            'Search for [query]',
            'Next/Previous tab',
            'Close window',
            'Focus mode',
            'Reset workspace'
        ];
        
        console.log('Available commands:', commands);
        this.showCommandDisplay('VOICE COMMANDS AVAILABLE', 3000);
    }

    updateVoiceStatus(text, listening = false) {
        const voiceText = document.getElementById('voice-text');
        const indicator = document.getElementById('voice-indicator');
        
        if (voiceText) {
            voiceText.textContent = text.toUpperCase();
        }
        
        if (indicator) {
            if (listening) {
                indicator.classList.add('listening');
            } else {
                indicator.classList.remove('listening');
            }
        }
    }

    showCommandDisplay(text, duration = 2000) {
        const display = document.getElementById('command-display');
        const displayText = document.getElementById('command-text');
        
        if (display && displayText) {
            displayText.textContent = text;
            display.classList.remove('hidden');
            
            setTimeout(() => {
                display.classList.add('hidden');
            }, duration);
        }
    }

    addToHistory(command) {
        this.commandHistory.unshift({
            text: command,
            timestamp: Date.now()
        });
        
        if (this.commandHistory.length > this.maxHistory) {
            this.commandHistory.pop();
        }
    }

    getHistory() {
        return this.commandHistory;
    }

    toggle() {
        if (this.isListening) {
            this.stop();
        } else {
            this.start();
        }
    }
}
