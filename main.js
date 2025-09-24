// ===== DOT ADVENTURE - MAIN GAME INITIALIZATION =====

class DotAdventure {
    constructor() {
        this.config = {
            type: Phaser.AUTO,
            width: 800,
            height: 600,
            parent: 'game-canvas',
            backgroundColor: '#000000',
            pixelArt: true,
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 0 },
                    debug: false
                }
            },
            scene: [
                TitleScreen,
                GameScene,
                GameOverScene
            ],
            audio: {
                disableWebAudio: false
            },
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH,
                min: {
                    width: 400,
                    height: 300
                },
                max: {
                    width: 1200,
                    height: 900
                }
            }
        };

        this.initializeGame();
    }

    initializeGame() {
        console.log('🎮 Initializing Dot Adventure...');
        
        // Create the Phaser game instance
        this.game = new Phaser.Game(this.config);
        
        // Set up global game state
        this.game.registry.set('score', 0);
        this.game.registry.set('lives', 3);
        this.game.registry.set('level', 1);
        this.game.registry.set('gameStarted', false);
        this.game.registry.set('soundEnabled', true);
        
        // Store reference for global access
        window.dotAdventureGame = this.game;
        
        // Set up event listeners for HTML UI updates
        this.setupUIUpdates();
        
        console.log('✅ Dot Adventure initialized successfully!');
    }

    setupUIUpdates() {
        // Listen for score changes
        this.game.registry.events.on('changedata-score', (parent, key, value) => {
            const scoreElement = document.getElementById('score');
            if (scoreElement) {
                scoreElement.textContent = `Score: ${value.toLocaleString()}`;
            }
        });

        // Listen for lives changes
        this.game.registry.events.on('changedata-lives', (parent, key, value) => {
            const livesElement = document.getElementById('lives');
            if (livesElement) {
                livesElement.textContent = `Lives: ${value}`;
            }
        });

        // Listen for level changes
        this.game.registry.events.on('changedata-level', (parent, key, value) => {
            const levelElement = document.getElementById('level');
            if (levelElement) {
                levelElement.textContent = `Level: ${value}`;
            }
        });
    }

    // Utility methods for game management
    static getScore() {
        return window.dotAdventureGame?.registry.get('score') || 0;
    }

    static setScore(score) {
        window.dotAdventureGame?.registry.set('score', score);
    }

    static addScore(points) {
        const currentScore = this.getScore();
        this.setScore(currentScore + points);
    }

    static getLives() {
        return window.dotAdventureGame?.registry.get('lives') || 3;
    }

    static setLives(lives) {
        window.dotAdventureGame?.registry.set('lives', lives);
    }

    static removeLife() {
        const currentLives = this.getLives();
        this.setLives(Math.max(0, currentLives - 1));
        return this.getLives();
    }

    static getLevel() {
        return window.dotAdventureGame?.registry.get('level') || 1;
    }

    static setLevel(level) {
        window.dotAdventureGame?.registry.set('level', level);
    }

    static nextLevel() {
        const currentLevel = this.getLevel();
        this.setLevel(currentLevel + 1);
        return this.getLevel();
    }

    static isSoundEnabled() {
        return window.dotAdventureGame?.registry.get('soundEnabled') ?? true;
    }

    static toggleSound() {
        const currentState = this.isSoundEnabled();
        window.dotAdventureGame?.registry.set('soundEnabled', !currentState);
        return !currentState;
    }

    // Game state management
    static resetGame() {
        this.setScore(0);
        this.setLives(3);
        this.setLevel(1);
        window.dotAdventureGame?.registry.set('gameStarted', false);
        console.log('🔄 Game reset');
    }

    static startGame() {
        window.dotAdventureGame?.registry.set('gameStarted', true);
        console.log('🚀 Game started');
    }

    static isGameStarted() {
        return window.dotAdventureGame?.registry.get('gameStarted') || false;
    }

    // Debugging and development helpers
    static debug() {
        console.log('=== DOT ADVENTURE DEBUG INFO ===');
        console.log('Score:', this.getScore());
        console.log('Lives:', this.getLives());
        console.log('Level:', this.getLevel());
        console.log('Sound Enabled:', this.isSoundEnabled());
        console.log('Game Started:', this.isGameStarted());
        console.log('Game Instance:', window.dotAdventureGame);
        console.log('================================');
    }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌟 DOM loaded, starting Dot Adventure...');
    new DotAdventure();
});

// Export for console access
window.DotAdventure = DotAdventure;