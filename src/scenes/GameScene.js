// ===== DOT ADVENTURE - MAIN GAME SCENE =====

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        
        // Game state
        this.gameState = 'playing'; // playing, paused, levelComplete, gameOver
        this.isPaused = false;
        this.levelStartTime = 0;
        this.powerModeActive = false;
        this.powerModeTimer = 0;
        
        // Game systems
        this.levelManager = null;
        this.scoreSystem = null;
        this.soundManager = null;
        this.pelletManager = null;
        
        // Game entities
        this.player = null;
        this.ghosts = [];
        this.mazeGraphics = null;
        
        // UI elements
        this.pauseMenu = null;
        this.levelCompleteUI = null;
        this.gameUI = {};
        
        console.log('🎮 GameScene constructed');
    }

    create() {
        console.log('🎮 Creating GameScene...');
        
        // Set background
        this.cameras.main.setBackgroundColor('#000000');
        
        // Initialize game systems
        this.initializeSystems();
        
        // Create level
        this.createLevel();
        
        // Create game entities
        this.createEntities();
        
        // Create UI
        this.createUI();
        
        // Setup input
        this.setupInput();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Start level
        this.startLevel();
        
        console.log('✅ GameScene created');
    }

    initializeSystems() {
        // Initialize level manager
        this.levelManager = new LevelManager(this);
        
        // Initialize score system
        this.scoreSystem = new ScoreSystem(this);
        this.scoreSystem.initialize();
        
        // Initialize sound manager
        this.soundManager = new SoundManager(this);
        this.soundManager.create();
        
        // Initialize pellet manager
        this.pelletManager = new PelletManager(this);
        
        console.log('🔧 Game systems initialized');
    }

    createLevel() {
        const currentLevel = DotAdventure.getLevel();
        
        // Generate level maze
        const maze = this.levelManager.generateLevel(currentLevel);
        
        // Create visual maze
        this.createMazeVisuals(maze);
        
        // Create pellets from maze
        this.pelletManager.createPelletsFromMaze(maze, this.levelManager.getTileSize());
        
        console.log(`🏗️ Level ${currentLevel} created`);
    }

    createMazeVisuals(maze) {
        // Clear existing maze graphics
        if (this.mazeGraphics) {
            this.mazeGraphics.destroy();
        }
        
        this.mazeGraphics = this.add.graphics();
        const tileSize = this.levelManager.getTileSize();
        
        // Draw maze walls
        this.mazeGraphics.fillStyle(0x0066cc);
        this.mazeGraphics.lineStyle(1, 0x00aaff, 0.8);
        
        for (let y = 0; y < maze.length; y++) {
            for (let x = 0; x < maze[y].length; x++) {
                if (maze[y][x] === 1) { // Wall
                    const pixelX = x * tileSize;
                    const pixelY = y * tileSize;
                    
                    // Draw wall tile with slight glow effect
                    this.mazeGraphics.fillRect(pixelX, pixelY, tileSize, tileSize);
                    this.mazeGraphics.strokeRect(pixelX, pixelY, tileSize, tileSize);
                }
            }
        }
        
        // Add glow effect to maze
        this.mazeGraphics.setBlendMode(Phaser.BlendModes.NORMAL);
        
        console.log('🧱 Maze visuals created');
    }

    createEntities() {
        // Create player
        const playerSpawn = this.levelManager.getPlayerSpawn();
        this.player = new Player(this, playerSpawn.x, playerSpawn.y);
        
        // Create ghosts
        this.ghosts = [];
        const ghostSpawns = this.levelManager.getGhostSpawns();
        
        ghostSpawns.forEach((spawn, index) => {
            const personalities = ['aggressive', 'ambush', 'patrol', 'random'];
            const ghost = new Ghost(this, spawn.x, spawn.y, {
                color: spawn.color,
                personality: personalities[index % personalities.length],
                speed: 80 + Math.random() * 20
            });
            this.ghosts.push(ghost);
        });
        
        console.log(`👤 Created player and ${this.ghosts.length} ghosts`);
    }

    createUI() {
        // Level indicator
        this.gameUI.levelText = this.add.text(20, 20, `Level: ${DotAdventure.getLevel()}`, {
            fontSize: '16px',
            fontFamily: 'Orbitron',
            fill: '#00ff41'
        });
        
        // Pellets remaining
        this.gameUI.pelletsText = this.add.text(20, 45, 'Pellets: 0', {
            fontSize: '14px',
            fontFamily: 'Orbitron',
            fill: '#ffff00'
        });
        
        // Game timer
        this.gameUI.timerText = this.add.text(this.sys.game.config.width - 120, 20, 'Time: 0:00', {
            fontSize: '14px',
            fontFamily: 'Orbitron',
            fill: '#ffffff'
        });
        
        // Power mode indicator
        this.gameUI.powerModeText = this.add.text(
            this.sys.game.config.width / 2, 30,
            'POWER MODE!', {
                fontSize: '18px',
                fontFamily: 'Orbitron',
                fill: '#ff8800',
                stroke: '#000',
                strokeThickness: 2
            }
        ).setOrigin(0.5).setVisible(false);
        
        // Instructions
        this.gameUI.instructionsText = this.add.text(
            this.sys.game.config.width / 2, this.sys.game.config.height - 20,
            'WASD/Arrows: Move | SPACE: Pause | ESC: Menu', {
                fontSize: '10px',
                fontFamily: 'Orbitron',
                fill: '#888888',
                alpha: 0.7
            }
        ).setOrigin(0.5);
        
        this.updateUI();
    }

    setupInput() {
        // Game controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,S,A,D');
        
        // Game management
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.escapeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        
        // Debug keys (can be removed in production)
        this.debugKeys = {
            nextLevel: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.N),
            invincible: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I),
            addScore: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P),
            freeMove: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F)
        };
    }

    setupEventListeners() {
        // Power pellet eaten event
        this.events.on('powerPelletEaten', () => {
            this.activatePowerMode();
        });
        
        // Level complete event
        this.events.on('levelComplete', () => {
            this.onLevelComplete();
        });
        
        // Player death event (handled by player itself, but we listen for game over logic)
        this.events.on('playerDied', () => {
            this.onPlayerDied();
        });
        
        // Pause/resume events
        this.events.on('pause', () => {
            this.pauseGame();
        });
        
        this.events.on('resume', () => {
            this.resumeGame();
        });
    }

    update(time, deltaTime) {
        if (this.gameState === 'paused') {
            return;
        }
        
        // Update game systems
        this.updateSystems(deltaTime);
        
        // Update entities
        this.updateEntities(deltaTime);
        
        // Update game logic
        this.updateGameLogic(deltaTime);
        
        // Update UI
        this.updateUI();
        
        // Handle input
        this.handleInput();
        
        // Handle debug input
        this.handleDebugInput();
    }

    updateSystems(deltaTime) {
        // Update pellet manager
        this.pelletManager.update(deltaTime);
        
        // Update power mode
        if (this.powerModeActive) {
            this.powerModeTimer -= deltaTime;
            if (this.powerModeTimer <= 0) {
                this.deactivatePowerMode();
            }
        }
    }

    updateEntities(deltaTime) {
        // Update player
        if (this.player) {
            this.player.update(deltaTime);
        }
        
        // Update ghosts
        this.ghosts.forEach(ghost => {
            if (ghost) {
                ghost.update(deltaTime);
            }
        });
        
        // Check pellet collisions
        if (this.player && this.player.isAlive()) {
            const playerPos = this.player.getPosition();
            const eatenPellets = this.pelletManager.checkPlayerCollision(playerPos.x, playerPos.y, 16);
            
            eatenPellets.forEach(pellet => {
                if (pellet.isPowerPellet()) {
                    this.events.emit('powerPelletEaten');
                }
            });
        }
        
        // Check level completion
        if (this.pelletManager.isLevelComplete() && this.gameState === 'playing') {
            this.events.emit('levelComplete');
        }
    }

    updateGameLogic(deltaTime) {
        // Update level timer
        this.levelStartTime += deltaTime;
        
        // Check for game over
        if (this.player && !this.player.isAlive() && DotAdventure.getLives() <= 0) {
            this.gameOver();
        }
    }

    updateUI() {
        // Update pellets remaining
        const remaining = this.pelletManager.getRemainingCount();
        this.gameUI.pelletsText.setText(`Pellets: ${remaining}`);
        
        // Update timer
        const minutes = Math.floor(this.levelStartTime / 60000);
        const seconds = Math.floor((this.levelStartTime % 60000) / 1000);
        this.gameUI.timerText.setText(`Time: ${minutes}:${seconds.toString().padStart(2, '0')}`);
        
        // Update level
        this.gameUI.levelText.setText(`Level: ${DotAdventure.getLevel()}`);
        
        // Update power mode indicator
        if (this.powerModeActive) {
            const timeLeft = Math.ceil(this.powerModeTimer / 1000);
            this.gameUI.powerModeText.setText(`POWER MODE! ${timeLeft}s`);
            this.gameUI.powerModeText.setVisible(true);
            
            // Flash when power mode is ending
            if (this.powerModeTimer < 3000) {
                const flash = Math.floor(Date.now() / 200) % 2;
                this.gameUI.powerModeText.setAlpha(flash ? 1 : 0.5);
            }
        } else {
            this.gameUI.powerModeText.setVisible(false);
        }
    }

    handleInput() {
        // Pause game
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            this.togglePause();
        }
        
        // Escape to menu (with confirmation)
        if (Phaser.Input.Keyboard.JustDown(this.escapeKey)) {
            this.showPauseMenu();
        }
    }

    handleDebugInput() {
        // Debug controls (remove in production)
        if (Phaser.Input.Keyboard.JustDown(this.debugKeys.nextLevel)) {
            console.log('🐛 Debug: Next level');
            this.events.emit('levelComplete');
        }
        
        if (Phaser.Input.Keyboard.JustDown(this.debugKeys.invincible)) {
            console.log('🐛 Debug: Toggle invincibility');
            if (this.player) {
                this.player.setInvulnerable(this.player.isInvulnerable ? 0 : 60000);
            }
        }
        
        if (Phaser.Input.Keyboard.JustDown(this.debugKeys.addScore)) {
            console.log('🐛 Debug: Add score');
            this.scoreSystem.addScore(1000, 'bonus');
        }
        
        if (Phaser.Input.Keyboard.JustDown(this.debugKeys.freeMove)) {
            console.log('🐛 Debug: Toggle free movement');
            if (this.player) {
                // Temporarily disable collision detection
                this.player.debugFreeMove = !this.player.debugFreeMove;
            }
        }
        
        // Debug key to check spawn positions
        if (Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey('G'))) {
            console.log('🐛 Debug: Game state');
            this.levelManager.debugMaze();
            if (this.player) {
                this.player.debug();
            }
        }
    }

    // Game state management
    startLevel() {
        this.gameState = 'playing';
        this.levelStartTime = 0;
        this.isPaused = false;
        
        // Play level start sound
        if (this.soundManager) {
            this.soundManager.playGameStart();
        }
        
        console.log(`🎯 Level ${DotAdventure.getLevel()} started`);
    }

    togglePause() {
        if (this.gameState === 'playing') {
            this.pauseGame();
        } else if (this.gameState === 'paused') {
            this.resumeGame();
        }
    }

    pauseGame() {
        this.gameState = 'paused';
        this.isPaused = true;
        
        // Show pause overlay
        this.showPauseOverlay();
        
        console.log('⏸️ Game paused');
    }

    resumeGame() {
        this.gameState = 'playing';
        this.isPaused = false;
        
        // Hide pause overlay
        this.hidePauseOverlay();
        
        console.log('▶️ Game resumed');
    }

    showPauseOverlay() {
        if (this.pauseOverlay) return;
        
        this.pauseOverlay = this.add.container(0, 0);
        
        // Background
        const bg = this.add.rectangle(
            this.sys.game.config.width / 2,
            this.sys.game.config.height / 2,
            this.sys.game.config.width,
            this.sys.game.config.height,
            0x000000, 0.7
        );
        
        // Pause text
        const pauseText = this.add.text(
            this.sys.game.config.width / 2,
            this.sys.game.config.height / 2 - 50,
            'GAME PAUSED',
            {
                fontSize: '32px',
                fontFamily: 'Orbitron',
                fill: '#00ff41'
            }
        ).setOrigin(0.5);
        
        // Instructions
        const instructions = this.add.text(
            this.sys.game.config.width / 2,
            this.sys.game.config.height / 2 + 20,
            'Press SPACE to resume\nPress ESC for main menu',
            {
                fontSize: '16px',
                fontFamily: 'Orbitron',
                fill: '#ffffff',
                align: 'center'
            }
        ).setOrigin(0.5);
        
        this.pauseOverlay.add([bg, pauseText, instructions]);
    }

    hidePauseOverlay() {
        if (this.pauseOverlay) {
            this.pauseOverlay.destroy();
            this.pauseOverlay = null;
        }
    }

    showPauseMenu() {
        if (this.gameState !== 'paused') {
            this.pauseGame();
        } else {
            // Go to main menu
            this.scene.start('TitleScreen');
        }
    }

    // Power mode system
    activatePowerMode() {
        this.powerModeActive = true;
        this.powerModeTimer = 10000; // 10 seconds
        
        // Make all ghosts frightened
        this.ghosts.forEach(ghost => {
            ghost.onPowerPelletEaten();
        });
        
        // Visual effects
        this.cameras.main.flash(300, 255, 255, 0);
        
        // Play power pellet sound
        if (this.soundManager) {
            this.soundManager.playPowerPelletEat();
        }
        
        console.log('⚡ Power mode activated');
    }

    deactivatePowerMode() {
        this.powerModeActive = false;
        this.powerModeTimer = 0;
        
        console.log('⚡ Power mode deactivated');
    }

    // Level progression
    onLevelComplete() {
        this.gameState = 'levelComplete';
        
        // Calculate level completion bonus
        const timeBonus = Math.max(0, 60000 - this.levelStartTime); // Bonus for completing quickly
        const timeBonusScore = Math.floor(timeBonus / 100);
        
        // Check if perfect level (all pellets eaten)
        const perfect = this.pelletManager.getCompletionPercentage() >= 1.0;
        
        // Add scores
        this.scoreSystem.scoreLevelComplete(perfect);
        if (timeBonusScore > 0) {
            this.scoreSystem.addScore(timeBonusScore, 'bonus');
        }
        
        // Play completion sound
        if (this.soundManager) {
            this.soundManager.playLevelComplete();
        }
        
        // Show level complete screen
        this.showLevelCompleteScreen(perfect, timeBonusScore);
        
        console.log(`🎉 Level ${DotAdventure.getLevel()} completed! Perfect: ${perfect}`);
    }

    showLevelCompleteScreen(perfect, timeBonus) {
        const overlay = this.add.container(0, 0);
        
        // Background
        const bg = this.add.rectangle(
            this.sys.game.config.width / 2,
            this.sys.game.config.height / 2,
            this.sys.game.config.width,
            this.sys.game.config.height,
            0x000000, 0.8
        );
        
        // Level complete text
        const completeText = this.add.text(
            this.sys.game.config.width / 2,
            this.sys.game.config.height / 2 - 100,
            'LEVEL COMPLETE!',
            {
                fontSize: '36px',
                fontFamily: 'Orbitron',
                fill: '#00ff41'
            }
        ).setOrigin(0.5);
        
        // Stats text
        let statsText = `Level: ${DotAdventure.getLevel()}\n`;
        statsText += `Score: ${DotAdventure.getScore().toLocaleString()}\n`;
        if (timeBonus > 0) {
            statsText += `Time Bonus: ${timeBonus.toLocaleString()}\n`;
        }
        if (perfect) {
            statsText += 'PERFECT LEVEL!\n';
        }
        
        const stats = this.add.text(
            this.sys.game.config.width / 2,
            this.sys.game.config.height / 2,
            statsText,
            {
                fontSize: '18px',
                fontFamily: 'Orbitron',
                fill: '#ffffff',
                align: 'center'
            }
        ).setOrigin(0.5);
        
        // Continue instructions
        const continueText = this.add.text(
            this.sys.game.config.width / 2,
            this.sys.game.config.height / 2 + 100,
            'Press SPACE to continue',
            {
                fontSize: '16px',
                fontFamily: 'Orbitron',
                fill: '#ffff00'
            }
        ).setOrigin(0.5);
        
        overlay.add([bg, completeText, stats, continueText]);
        
        // Wait for input to continue
        this.spaceKey.once('down', () => {
            overlay.destroy();
            this.nextLevel();
        });
    }

    nextLevel() {
        // Advance to next level
        DotAdventure.nextLevel();
        
        // Reset scene for next level
        this.scene.restart();
    }

    // Game over handling
    onPlayerDied() {
        const remainingLives = DotAdventure.getLives() - 1;
        DotAdventure.setLives(remainingLives);
        
        if (remainingLives <= 0) {
            this.gameOver();
        } else {
            // Show respawn message
            const respawnText = this.add.text(
                this.sys.game.config.width / 2,
                this.sys.game.config.height / 2,
                `Lives Remaining: ${remainingLives}\nRespawning in 3 seconds...`,
                {
                    fontSize: '24px',
                    fontFamily: 'Orbitron',
                    fill: '#ff4444',
                    align: 'center'
                }
            ).setOrigin(0.5);
            
            // Respawn player after delay
            this.time.delayedCall(3000, () => {
                if (this.player) {
                    this.player.respawn();
                    respawnText.destroy();
                }
            });
        }
    }

    gameOver() {
        this.gameState = 'gameOver';
        
        // Save high score
        const scoreSystem = new ScoreSystem(this);
        scoreSystem.score = DotAdventure.getScore();
        scoreSystem.lives = DotAdventure.getLives();
        scoreSystem.level = DotAdventure.getLevel();
        const isHighScore = scoreSystem.isNewHighScore();
        
        if (isHighScore) {
            scoreSystem.saveHighScore();
        }
        
        // Play game over sound
        if (this.soundManager) {
            this.soundManager.playGameOver();
        }
        
        // Transition to game over screen
        this.time.delayedCall(2000, () => {
            this.scene.start('GameOverScene', {
                finalScore: DotAdventure.getScore(),
                finalLevel: DotAdventure.getLevel(),
                isHighScore: isHighScore
            });
        });
        
        console.log('💀 Game Over');
    }

    // Scene lifecycle
    shutdown() {
        // Clean up entities
        if (this.player) {
            this.player.destroy();
        }
        
        this.ghosts.forEach(ghost => {
            if (ghost) {
                ghost.destroy();
            }
        });
        
        // Clean up systems
        if (this.pelletManager) {
            this.pelletManager.clearAllPellets();
        }
        
        if (this.soundManager) {
            this.soundManager.destroy();
        }
        
        // Clean up UI
        if (this.pauseOverlay) {
            this.pauseOverlay.destroy();
        }
        
        console.log('🎮 GameScene shutdown');
    }

    // Debug methods
    debugGameState() {
        console.log('=== GAME SCENE DEBUG ===');
        console.log('Game State:', this.gameState);
        console.log('Level:', DotAdventure.getLevel());
        console.log('Score:', DotAdventure.getScore());
        console.log('Lives:', DotAdventure.getLives());
        console.log('Power Mode:', this.powerModeActive);
        console.log('Pellets Remaining:', this.pelletManager?.getRemainingCount());
        console.log('Level Time:', Math.floor(this.levelStartTime / 1000), 'seconds');
        console.log('========================');
    }
}

// Export for use in main.js
window.GameScene = GameScene;