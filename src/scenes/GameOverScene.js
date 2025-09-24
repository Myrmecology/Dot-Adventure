// ===== DOT ADVENTURE - GAME OVER SCENE =====

class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
        
        // Scene properties
        this.finalScore = 0;
        this.finalLevel = 1;
        this.isHighScore = false;
        this.selectedOption = 0;
        this.menuOptions = ['PLAY AGAIN', 'HIGH SCORES', 'MAIN MENU'];
        this.animationTimer = 0;
        this.scoreAnimationComplete = false;
        this.highScoreData = [];
        
        // UI elements
        this.scoreText = null;
        this.menuItems = [];
        this.selector = null;
        this.backgroundElements = [];
        
        console.log('💀 GameOverScene constructed');
    }

    init(data) {
        // Receive data from GameScene
        this.finalScore = data.finalScore || 0;
        this.finalLevel = data.finalLevel || 1;
        this.isHighScore = data.isHighScore || false;
        
        console.log(`💀 Game Over - Score: ${this.finalScore}, Level: ${this.finalLevel}, High Score: ${this.isHighScore}`);
    }

    preload() {
        console.log('💀 GameOverScene preloading...');
        
        // Load high scores
        this.loadHighScores();
    }

    create() {
        console.log('💀 Creating GameOverScene...');
        
        // Set background
        this.cameras.main.setBackgroundColor('#110000');
        
        // Create animated background
        this.createAnimatedBackground();
        
        // Create game over display
        this.createGameOverTitle();
        this.createScoreDisplay();
        this.createStatsDisplay();
        this.createMenu();
        
        // Setup input
        this.setupInput();
        
        // Setup sound manager
        this.setupSoundManager();
        
        // Start animations
        this.startAnimations();
        
        console.log('✅ GameOverScene created');
    }

    loadHighScores() {
        try {
            const stored = localStorage.getItem('dotAdventure_highScores');
            this.highScoreData = stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.warn('Failed to load high scores:', error);
            this.highScoreData = [];
        }
    }

    createAnimatedBackground() {
        // Create dark, ominous background with floating particles
        this.createFloatingParticles();
        this.createBackgroundGrid();
        this.createVignette();
    }

    createFloatingParticles() {
        // Create floating "ghost" particles
        const particleCount = 20;
        
        for (let i = 0; i < particleCount; i++) {
            const x = Math.random() * this.sys.game.config.width;
            const y = Math.random() * this.sys.game.config.height;
            const size = 2 + Math.random() * 3;
            const alpha = 0.1 + Math.random() * 0.3;
            
            const particle = this.add.circle(x, y, size, 0x666666, alpha);
            particle.setBlendMode(Phaser.BlendModes.ADD);
            
            // Slow floating animation
            this.tweens.add({
                targets: particle,
                x: x + (Math.random() - 0.5) * 300,
                y: y + (Math.random() - 0.5) * 200,
                alpha: { from: alpha, to: alpha * 0.5 },
                duration: 8000 + Math.random() * 4000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
            
            this.backgroundElements.push(particle);
        }
    }

    createBackgroundGrid() {
        // Create a fading grid pattern
        const graphics = this.add.graphics();
        graphics.lineStyle(1, 0x330000, 0.2);
        
        // Vertical lines
        for (let x = 0; x < this.sys.game.config.width; x += 40) {
            graphics.moveTo(x, 0);
            graphics.lineTo(x, this.sys.game.config.height);
        }
        
        // Horizontal lines
        for (let y = 0; y < this.sys.game.config.height; y += 40) {
            graphics.moveTo(0, y);
            graphics.lineTo(this.sys.game.config.width, y);
        }
        
        graphics.strokePath();
        this.backgroundElements.push(graphics);
    }

    createVignette() {
        // Create vignette effect
        const vignette = this.add.circle(
            this.sys.game.config.width / 2,
            this.sys.game.config.height / 2,
            Math.max(this.sys.game.config.width, this.sys.game.config.height),
            0x000000, 0
        );
        
        vignette.setStrokeStyle(100, 0x000000, 0.8);
        vignette.setBlendMode(Phaser.BlendModes.MULTIPLY);
        
        this.backgroundElements.push(vignette);
    }

    createGameOverTitle() {
        // Main "Game Over" title
        this.gameOverTitle = this.add.text(
            this.sys.game.config.width / 2,
            100,
            'GAME OVER',
            {
                fontSize: '48px',
                fontFamily: 'Orbitron',
                fill: '#ff4444',
                stroke: '#660000',
                strokeThickness: 4,
                shadow: {
                    offsetX: 0,
                    offsetY: 0,
                    color: '#ff4444',
                    blur: 30,
                    fill: true
                }
            }
        ).setOrigin(0.5);
        
        // High score indicator
        if (this.isHighScore) {
            this.highScoreIndicator = this.add.text(
                this.sys.game.config.width / 2,
                140,
                '★ NEW HIGH SCORE! ★',
                {
                    fontSize: '20px',
                    fontFamily: 'Orbitron',
                    fill: '#ffff00',
                    stroke: '#ff8800',
                    strokeThickness: 2
                }
            ).setOrigin(0.5);
            
            // Pulsing animation for high score
            this.tweens.add({
                targets: this.highScoreIndicator,
                scaleX: { from: 1, to: 1.1 },
                scaleY: { from: 1, to: 1.1 },
                duration: 800,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
    }

    createScoreDisplay() {
        // Final score display
        this.scoreText = this.add.text(
            this.sys.game.config.width / 2,
            200,
            'SCORE: 0',
            {
                fontSize: '32px',
                fontFamily: 'Orbitron',
                fill: '#ffffff',
                stroke: '#000',
                strokeThickness: 3
            }
        ).setOrigin(0.5);
        
        // Score animation will be handled in startAnimations()
    }

    createStatsDisplay() {
        const statsY = 260;
        const statsSpacing = 25;
        
        // Level reached
        this.levelText = this.add.text(
            this.sys.game.config.width / 2,
            statsY,
            `Level Reached: ${this.finalLevel}`,
            {
                fontSize: '18px',
                fontFamily: 'Orbitron',
                fill: '#cccccc'
            }
        ).setOrigin(0.5);
        
        // Calculate and display additional stats
        const gameTime = this.calculateGameTime();
        this.timeText = this.add.text(
            this.sys.game.config.width / 2,
            statsY + statsSpacing,
            `Game Time: ${gameTime}`,
            {
                fontSize: '18px',
                fontFamily: 'Orbitron',
                fill: '#cccccc'
            }
        ).setOrigin(0.5);
        
        // Score per level
        const scorePerLevel = this.finalLevel > 0 ? Math.floor(this.finalScore / this.finalLevel) : 0;
        this.avgScoreText = this.add.text(
            this.sys.game.config.width / 2,
            statsY + statsSpacing * 2,
            `Average Score/Level: ${scorePerLevel.toLocaleString()}`,
            {
                fontSize: '16px',
                fontFamily: 'Orbitron',
                fill: '#aaaaaa'
            }
        ).setOrigin(0.5);
        
        // High score rank
        if (this.highScoreData.length > 0) {
            const rank = this.calculateScoreRank();
            this.rankText = this.add.text(
                this.sys.game.config.width / 2,
                statsY + statsSpacing * 3,
                `Rank: ${rank} of ${this.highScoreData.length}`,
                {
                    fontSize: '16px',
                    fontFamily: 'Orbitron',
                    fill: '#aaaaaa'
                }
            ).setOrigin(0.5);
        }
    }

    createMenu() {
        this.menuItems = [];
        const startY = 400;
        const spacing = 40;
        
        this.menuOptions.forEach((option, index) => {
            const menuItem = this.add.text(
                this.sys.game.config.width / 2,
                startY + index * spacing,
                option,
                {
                    fontSize: '20px',
                    fontFamily: 'Orbitron',
                    fill: '#ffffff',
                    stroke: '#000',
                    strokeThickness: 2
                }
            ).setOrigin(0.5);
            
            // Make interactive
            menuItem.setInteractive();
            menuItem.on('pointerover', () => {
                this.selectedOption = index;
                this.updateMenuSelection();
            });
            menuItem.on('pointerdown', () => {
                this.selectMenuItem();
            });
            
            this.menuItems.push(menuItem);
        });
        
        // Create selection indicator
        this.selector = this.add.text(
            this.sys.game.config.width / 2 - 120,
            startY,
            '►',
            {
                fontSize: '20px',
                fontFamily: 'Orbitron',
                fill: '#ff4444'
            }
        ).setOrigin(0.5);
        
        this.updateMenuSelection();
        
        // Instructions
        this.add.text(
            this.sys.game.config.width / 2,
            this.sys.game.config.height - 40,
            'Arrow Keys/WASD: Navigate | ENTER/SPACE: Select',
            {
                fontSize: '12px',
                fontFamily: 'Orbitron',
                fill: '#666666'
            }
        ).setOrigin(0.5);
    }

    setupInput() {
        // Navigation
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,S,A,D');
        
        // Selection
        this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.escapeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    }

    setupSoundManager() {
        this.soundManager = new SoundManager(this);
        this.soundManager.create();
    }

    startAnimations() {
        // Animate title entrance
        this.gameOverTitle.setScale(0);
        this.tweens.add({
            targets: this.gameOverTitle,
            scaleX: 1,
            scaleY: 1,
            duration: 800,
            ease: 'Back.out'
        });
        
        // Animate score counter
        this.animateScoreCounter();
        
        // Fade in menu after score animation
        this.menuItems.forEach(item => {
            item.setAlpha(0);
        });
        this.selector.setAlpha(0);
        
        this.time.delayedCall(2000, () => {
            this.tweens.add({
                targets: [...this.menuItems, this.selector],
                alpha: 1,
                duration: 500,
                ease: 'Power2.out'
            });
        });
    }

    animateScoreCounter() {
        // Animate score counting up from 0 to final score
        const duration = 1500;
        let currentScore = 0;
        
        const scoreAnimation = this.tweens.addCounter({
            from: 0,
            to: this.finalScore,
            duration: duration,
            ease: 'Power2.out',
            onUpdate: (tween) => {
                currentScore = Math.floor(tween.getValue());
                this.scoreText.setText(`SCORE: ${currentScore.toLocaleString()}`);
            },
            onComplete: () => {
                this.scoreAnimationComplete = true;
                
                // Final score flash
                if (this.isHighScore) {
                    this.tweens.add({
                        targets: this.scoreText,
                        scaleX: { from: 1, to: 1.2 },
                        scaleY: { from: 1, to: 1.2 },
                        duration: 300,
                        yoyo: true,
                        repeat: 2
                    });
                }
            }
        });
    }

    calculateGameTime() {
        // Estimate game time based on level and score
        // This is approximate since we don't track actual time
        const estimatedMinutes = Math.floor(this.finalLevel * 2 + (this.finalScore / 10000));
        const minutes = Math.floor(estimatedMinutes);
        const seconds = Math.floor((estimatedMinutes % 1) * 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    calculateScoreRank() {
        // Find where this score ranks in the high score list
        const sortedScores = [...this.highScoreData, { score: this.finalScore }]
            .sort((a, b) => b.score - a.score);
        
        const rank = sortedScores.findIndex(score => score.score === this.finalScore) + 1;
        return rank;
    }

    update(time, deltaTime) {
        this.animationTimer += deltaTime;
        
        // Handle input
        this.handleInput();
        
        // Update background effects
        this.updateBackgroundEffects(deltaTime);
    }

    handleInput() {
        // Menu navigation
        if (Phaser.Input.Keyboard.JustDown(this.cursors.up) || 
            Phaser.Input.Keyboard.JustDown(this.wasd.W)) {
            this.navigateMenu(-1);
        }
        
        if (Phaser.Input.Keyboard.JustDown(this.cursors.down) || 
            Phaser.Input.Keyboard.JustDown(this.wasd.S)) {
            this.navigateMenu(1);
        }
        
        // Menu selection
        if (Phaser.Input.Keyboard.JustDown(this.enterKey) || 
            Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            this.selectMenuItem();
        }
        
        // Quick restart with R key
        const rKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        if (Phaser.Input.Keyboard.JustDown(rKey)) {
            this.playAgain();
        }
        
        // Quick exit with ESC
        if (Phaser.Input.Keyboard.JustDown(this.escapeKey)) {
            this.goToMainMenu();
        }
    }

    navigateMenu(direction) {
        this.selectedOption += direction;
        
        if (this.selectedOption < 0) {
            this.selectedOption = this.menuOptions.length - 1;
        } else if (this.selectedOption >= this.menuOptions.length) {
            this.selectedOption = 0;
        }
        
        this.updateMenuSelection();
        
        // Play navigation sound
        if (this.soundManager) {
            this.soundManager.play('pelletEat', { volume: 0.2 });
        }
    }

    updateMenuSelection() {
        // Update menu item styles
        this.menuItems.forEach((item, index) => {
            if (index === this.selectedOption) {
                item.setStyle({ fill: '#ff4444' });
                item.setScale(1.1);
            } else {
                item.setStyle({ fill: '#ffffff' });
                item.setScale(1.0);
            }
        });
        
        // Update selector position
        const targetY = 400 + this.selectedOption * 40;
        this.tweens.add({
            targets: this.selector,
            y: targetY,
            duration: 150,
            ease: 'Power2.out'
        });
    }

    selectMenuItem() {
        const selectedMenuItem = this.menuOptions[this.selectedOption];
        
        // Play selection sound
        if (this.soundManager) {
            this.soundManager.play('powerPelletEat', { volume: 0.5 });
        }
        
        // Handle menu selection
        switch (selectedMenuItem) {
            case 'PLAY AGAIN':
                this.playAgain();
                break;
                
            case 'HIGH SCORES':
                this.showHighScores();
                break;
                
            case 'MAIN MENU':
                this.goToMainMenu();
                break;
        }
        
        console.log(`💀 Menu selected: ${selectedMenuItem}`);
    }

    playAgain() {
        console.log('🎮 Playing again...');
        
        // Reset game state
        DotAdventure.resetGame();
        DotAdventure.startGame();
        
        // Transition to game
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('GameScene');
        });
    }

    showHighScores() {
        // Create high scores display
        let scoresText = 'HIGH SCORES\n\n';
        
        if (this.highScoreData.length > 0) {
            this.highScoreData.slice(0, 10).forEach((score, index) => {
                const date = new Date(score.date).toLocaleDateString();
                const highlight = score.score === this.finalScore ? '★ ' : '  ';
                scoresText += `${highlight}${index + 1}. ${score.score.toLocaleString()} - Level ${score.level} (${date})\n`;
            });
        } else {
            scoresText += 'No high scores yet!\n\nBe the first to set a high score!';
        }
        
        scoresText += '\n\nPress ESC to return';
        
        this.showDialog('High Scores', scoresText);
    }

    goToMainMenu() {
        console.log('📺 Returning to main menu...');
        
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('TitleScreen');
        });
    }

    showDialog(title, content) {
        // Create modal dialog
        this.dialog = this.add.container(0, 0);
        
        const dialogBg = this.add.rectangle(
            this.sys.game.config.width / 2,
            this.sys.game.config.height / 2,
            500, 400,
            0x000000, 0.9
        ).setStrokeStyle(2, 0xff4444);
        
        const dialogTitle = this.add.text(
            this.sys.game.config.width / 2,
            this.sys.game.config.height / 2 - 150,
            title,
            {
                fontSize: '24px',
                fontFamily: 'Orbitron',
                fill: '#ff4444'
            }
        ).setOrigin(0.5);
        
        const dialogContent = this.add.text(
            this.sys.game.config.width / 2,
            this.sys.game.config.height / 2 - 50,
            content,
            {
                fontSize: '14px',
                fontFamily: 'Orbitron',
                fill: '#ffffff',
                align: 'center',
                wordWrap: { width: 450 }
            }
        ).setOrigin(0.5);
        
        this.dialog.add([dialogBg, dialogTitle, dialogContent]);
        
        // ESC to close
        this.escapeKey.once('down', () => {
            this.hideDialog();
        });
    }

    hideDialog() {
        if (this.dialog) {
            this.dialog.destroy();
            this.dialog = null;
        }
    }

    updateBackgroundEffects(deltaTime) {
        // Subtle pulsing effect for the title
        if (this.gameOverTitle) {
            const pulse = 1 + Math.sin(this.animationTimer * 0.002) * 0.05;
            this.gameOverTitle.setScale(pulse);
        }
        
        // Subtle color shift for high score indicator
        if (this.highScoreIndicator) {
            const hue = (this.animationTimer * 0.1) % 360;
            const color = Phaser.Display.Color.HSVToRGB(hue / 360, 1, 1);
            this.highScoreIndicator.setTint(color.color);
        }
    }

    // Scene cleanup
    shutdown() {
        // Clean up background elements
        this.backgroundElements.forEach(element => {
            if (element && element.destroy) {
                element.destroy();
            }
        });
        this.backgroundElements = [];
        
        // Clean up dialog if open
        this.hideDialog();
        
        // Clean up sound manager
        if (this.soundManager) {
            this.soundManager.destroy();
        }
        
        console.log('💀 GameOverScene shutdown');
    }

    // Debug helpers
    debugScene() {
        console.log('=== GAME OVER SCENE DEBUG ===');
        console.log('Final Score:', this.finalScore);
        console.log('Final Level:', this.finalLevel);
        console.log('Is High Score:', this.isHighScore);
        console.log('Selected Option:', this.selectedOption);
        console.log('High Score Data:', this.highScoreData);
        console.log('=============================');
    }
}

// Export for use in main.js
window.GameOverScene = GameOverScene;