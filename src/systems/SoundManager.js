// ===== DOT ADVENTURE - SOUND MANAGER SYSTEM =====

class SoundManager {
    constructor(scene) {
        this.scene = scene;
        this.sounds = {};
        this.musicVolume = 0.3;
        this.sfxVolume = 0.5;
        this.isEnabled = true;
        this.audioContext = null;
        
        console.log('🔊 SoundManager initialized');
    }

    preload() {
        // Since we can't load actual audio files yet, we'll create procedural sounds
        // This will be replaced with actual audio files later
        console.log('🎵 Preloading sounds...');
    }

    create() {
        // Create procedural sounds using Web Audio API
        this.createProceduralSounds();
        
        // Initialize audio context on first user interaction
        this.initializeAudioContext();
        
        console.log('✅ SoundManager created with procedural sounds');
    }

    initializeAudioContext() {
        // Initialize audio context when user first interacts
        const initAudio = () => {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                console.log('🔊 Audio context initialized');
            }
            
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume().then(() => {
                    console.log('🔊 Audio context resumed');
                });
            }
            
            // Remove event listeners after first activation
            document.removeEventListener('click', initAudio);
            document.removeEventListener('keydown', initAudio);
            document.removeEventListener('touchstart', initAudio);
        };
        
        // Listen for user interaction
        document.addEventListener('click', initAudio);
        document.addEventListener('keydown', initAudio);
        document.addEventListener('touchstart', initAudio);
    }

    createProceduralSounds() {
        // We'll create simple tones for now that sound retro
        this.sounds = {
            pelletEat: this.createTone(800, 0.1),
            powerPelletEat: this.createTone(400, 0.3),
            ghostEaten: this.createTone(200, 0.5),
            playerDeath: this.createSweep(400, 200, 1.0),
            levelComplete: this.createMelody([523, 659, 784, 1047], 0.2),
            gameStart: this.createMelody([392, 523, 659, 784], 0.3),
            gameOver: this.createSweep(300, 100, 1.5)
        };
    }

    createTone(frequency, duration) {
        return {
            type: 'tone',
            frequency: frequency,
            duration: duration,
            play: () => this.playTone(frequency, duration)
        };
    }

    createSweep(startFreq, endFreq, duration) {
        return {
            type: 'sweep',
            startFreq: startFreq,
            endFreq: endFreq,
            duration: duration,
            play: () => this.playSweep(startFreq, endFreq, duration)
        };
    }

    createMelody(frequencies, noteDuration) {
        return {
            type: 'melody',
            frequencies: frequencies,
            noteDuration: noteDuration,
            play: () => this.playMelody(frequencies, noteDuration)
        };
    }

    playTone(frequency, duration) {
        if (!this.isEnabled) return;

        try {
            // Create audio context on first user interaction
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            
            // Resume context if suspended (required for Chrome)
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            oscillator.type = 'square'; // Retro square wave

            // Envelope for smoother sound
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.sfxVolume * 0.3, this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);

        } catch (error) {
            console.warn('🔇 Audio playback failed:', error);
        }
    }

    playSweep(startFreq, endFreq, duration) {
        if (!this.isEnabled) return;

        try {
            // Use existing audio context or create new one
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(startFreq, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(endFreq, this.audioContext.currentTime + duration);

            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.sfxVolume * 0.4, this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);

        } catch (error) {
            console.warn('🔇 Sweep playback failed:', error);
        }
    }

    playMelody(frequencies, noteDuration) {
        if (!this.isEnabled) return;

        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                this.playTone(freq, noteDuration);
            }, index * noteDuration * 1000);
        });
    }

    // Main API methods
    play(soundName, config = {}) {
        if (!this.isEnabled) return;

        const sound = this.sounds[soundName];
        if (!sound) {
            console.warn(`🔇 Sound not found: ${soundName}`);
            return;
        }

        // Apply volume modifier if provided
        const originalVolume = this.sfxVolume;
        if (config.volume !== undefined) {
            this.sfxVolume *= config.volume;
        }

        sound.play();

        // Restore original volume
        this.sfxVolume = originalVolume;

        console.log(`🎵 Playing sound: ${soundName}`);
    }

    // Specific game sound methods
    playPelletEat() {
        this.play('pelletEat');
    }

    playPowerPelletEat() {
        this.play('powerPelletEat');
    }

    playGhostEaten() {
        this.play('ghostEaten', { volume: 0.8 });
    }

    playPlayerDeath() {
        this.play('playerDeath', { volume: 0.6 });
    }

    playLevelComplete() {
        this.play('levelComplete', { volume: 0.7 });
    }

    playGameStart() {
        this.play('gameStart', { volume: 0.8 });
    }

    playGameOver() {
        this.play('gameOver', { volume: 0.5 });
    }

    // Volume and settings control
    setSfxVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        console.log(`🔊 SFX Volume set to: ${this.sfxVolume}`);
    }

    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        console.log(`🎵 Music Volume set to: ${this.musicVolume}`);
    }

    enable() {
        this.isEnabled = true;
        console.log('🔊 Sound enabled');
    }

    disable() {
        this.isEnabled = false;
        console.log('🔇 Sound disabled');
    }

    toggle() {
        this.isEnabled = !this.isEnabled;
        console.log(`🔊 Sound ${this.isEnabled ? 'enabled' : 'disabled'}`);
        return this.isEnabled;
    }

    // Cleanup
    destroy() {
        this.sounds = {};
        console.log('🔇 SoundManager destroyed');
    }
}

// Export for use in other modules
window.SoundManager = SoundManager;