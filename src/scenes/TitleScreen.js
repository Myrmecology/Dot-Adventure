// ===== DOT ADVENTURE - TITLE SCREEN SCENE =====

class TitleScreen extends Phaser.Scene {
    constructor() {
        super({ key: 'TitleScreen' });
        
        // Title screen properties
        this.selectedOption = 0;
        this.menuOptions = ['START GAME', 'HIGH SCORES', 'SETTINGS', 'CREDITS'];
        this.animationTimer = 0;
        this.titleAnimationPhase = 0;
        this.particleSystem = null;
        this.backgroundElements = [];
        
        console.log('📺 TitleScreen scene constructed');
    }

    preload() {
        console.log('📺 TitleScreen preloading...');
        
        // Since we don't have actual image files yet, we'll create procedural graphics
        // This will be replaced with actual assets later
        this.load.on('complete', () => {
            console.log('✅ TitleScreen preload complete');
        });
    }

    create() {
        console.log('📺 Creating TitleScreen...');
        
        // Setup scene properties
        this.cameras.main.setBackgroundColor('#000011');
        
        // Create animated background
        this.createAnimatedBackground();
        
        // Create title and UI elements
        this.createTitle();
        this.createMenu();
        this.createInstructions();
        this.createVersionInfo();
        
        // Create particle effects
        this.createParticleEffects();
        
        // Setup input
        this.setupInput();
        
        // Setup sound manager
        this.setupSoundManager();
        
        // Play startup sound
        if (this.soundManager) {
            this.soundManager.playGameStart();
        }
        
        // Auto-start after delay for development (can be removed later)
        // this.time.delayedCall(3000, () => this.startGame());
        
        console.log('✅ TitleScreen created');
    }

    createAnimatedBackground() {
        // Create moving background elements that look like a simplified maze
        this.createBackgroundMaze();
        
        // Create floating dots
        this.createFloatingDots();
        
        // Create border glow effect
        this.createBorderGlow();
    }

    createBackgroundMaze() {
        // Create a subtle maze pattern in the background
        const mazeLines = [];
        const lineColor = 0x001122;
        const lineThickness = 2;
        
        // Horizontal lines
        for (let y = 50; y < this.sys.game.config.height; y += 40) {
            const line = this.add.rectangle(
                this.sys.game.config.width / 2, y,
                this.sys.game.config.width * 0.8, lineThickness,
                lineColor, 0.3
            );
            mazeLines.push(line);
            
            // Animate opacity
            this.tweens.add({
                targets: line,
                alpha: { from: 0.1, to: 0.4 },
                duration: 2000 + Math.random() * 1000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
        
        // Vertical lines
        for (let x = 100; x < this.sys.game.config.width - 100; x += 60) {
            const line = this.add.rectangle(
                x, this.sys.game.config.height / 2,
                lineThickness, this.sys.game.config.height * 0.6,
                lineColor, 0.2
            );
            mazeLines.push(line);
            
            // Animate opacity with different timing
            this.tweens.add({
                targets: line,
                alpha: { from: 0.1, to: 0.3 },
                duration: 3000 + Math.random() * 1500,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
        
        this.backgroundElements = mazeLines;
    }

    createFloatingDots() {
        // Create floating pellet-like dots in the background
        const dotCount = 15;
        
        for (let i = 0; i < dotCount; i++) {
            const x = Math.random() * this.sys.game.config.width;
            const y = Math.random() * this.sys.game.config.height;
            const size = 2 + Math.random() * 4;
            
            const dot = this.add.circle(x, y, size, 0x444488, 0.6);
            dot.setBlendMode(Phaser.BlendModes.ADD);
            
            // Floating animation
            this.tweens.add({
                targets: dot,
                x: x + (Math.random() - 0.5) * 200,
                y: y + (Math.random() - 0.5) * 200,
                alpha: { from: 0.3, to: 0.8 },
                duration: 4000 + Math.random() * 3000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
            
            // Pulse animation
            this.tweens.add({
                targets: dot,
                scaleX: { from: 0.5, to: 1.5 },
                scaleY: { from: 0.5, to: 1.5 },
                duration: 2000 + Math.random() * 2000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
            
            this.backgroundElements.push(dot);
        }
    }

    createBorderGlow() {
        // Create glowing border effect
        const borderWidth = 4;
        const glowColor = 0x00ff41;
        
        // Top border
        const topBorder = this.add.rectangle(
            this.sys.game.config.width / 2, borderWidth / 2,
            this.sys.game.config.width, borderWidth,
            glowColor, 0.8
        );
        topBorder.setBlendMode(Phaser.BlendModes.ADD);
        
        // Bottom border
        const bottomBorder = this.add.rectangle(
            this.sys.game.config.width / 2, this.sys.game.config.height - borderWidth / 2,
            this.sys.game.config.width, borderWidth,
            glowColor, 0.8
        );
        bottomBorder.setBlendMode(Phaser.BlendModes.ADD);
        
        // Left border
        const leftBorder = this.add.rectangle(
            borderWidth / 2, this.sys.game.config.height / 2,
            borderWidth, this.sys.game.config.height,
            glowColor, 0.8
        );
        leftBorder.setBlendMode(Phaser.BlendModes.ADD);
        
        // Right border
        const rightBorder = this.add.rectangle(
            this.sys.game.config.width - borderWidth / 2, this.sys.game.config.height / 2,
            borderWidth, this.sys.game.config.height,
            glowColor, 0.8
        );
        rightBorder.setBlendMode(Phaser.BlendModes.ADD);
        
        // Pulse animation for borders
        const borders = [topBorder, bottomBorder, leftBorder, rightBorder];
        this.tweens.add({
            targets: borders,
            alpha: { from: 0.5, to: 1.0 },
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        this.backgroundElements.push(...borders);
    }

    createTitle() {
        // Main title
        this.titleText = this.add.text(
            this.sys.game.config.width / 2,
            150,
            'DOT ADVENTURE',
            {
                fontSize: '48px',
                fontFamily: 'Orbitron',
                fill: '#00ff41',
                stroke: '#003311',
                strokeThickness: 4,
                shadow: {
                    offsetX: 0,
                    offsetY: 0,
                    color: '#00ff41',
                    blur: 20,
                    fill: true
                }
            }
        ).setOrigin(0.5);
        
        // Subtitle
        this.subtitleText = this.add.text(
            this.sys.game.config.width / 2,
            200,
            'A Professional Maze Adventure',
            {
                fontSize: '16px',
                fontFamily: 'Orbitron',
                fill: '#88ffaa',
                alpha: 0.8
            }
        ).setOrigin(0.5);
        
        // Title animation
        this.titleText.setScale(0);
        this.tweens.add({
            targets: this.titleText,
            scaleX: 1,
            scaleY: 1,
            duration: 1000,
            ease: 'Back.out',
            onComplete: () => {
                // Start pulsing animation
                this.tweens.add({
                    targets: this.titleText,
                    scaleX: { from: 1, to: 1.05 },
                    scaleY: { from: 1, to: 1.05 },
                    duration: 2000,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            }
        });
        
        // Subtitle fade in
        this.subtitleText.setAlpha(0);
        this.tweens.add({
            targets: this.subtitleText,
            alpha: 0.8,
            duration: 1500,
            delay: 500,
            ease: 'Power2.out'
        });
    }

    createMenu() {
        this.menuItems = [];
        const startY = 300;
        const spacing = 50;
        
        this.menuOptions.forEach((option, index) => {
            const menuItem = this.add.text(
                this.sys.game.config.width / 2,
                startY + index * spacing,
                option,
                {
                    fontSize: '24px',
                    fontFamily: 'Orbitron',
                    fill: '#ffffff',
                    stroke: '#000',
                    strokeThickness: 2
                }
            ).setOrigin(0.5);
            
            // Initially fade in with staggered timing
            menuItem.setAlpha(0);
            this.tweens.add({
                targets: menuItem,
                alpha: 1,
                y: menuItem.y + 10,
                duration: 800,
                delay: 1000 + index * 200,
                ease: 'Power2.out'
            });
            
            this.menuItems.push(menuItem);
        });
        
        // Create selection indicator
        this.selector = this.add.text(
            this.sys.game.config.width / 2 - 150,
            startY,
            '►',
            {
                fontSize: '24px',
                fontFamily: 'Orbitron',
                fill: '#00ff41'
            }
        ).setOrigin(0.5);
        
        this.selector.setAlpha(0);
        this.tweens.add({
            targets: this.selector,
            alpha: 1,
            duration: 500,
            delay: 2000
        });
        
        this.updateMenuSelection();
    }

    createInstructions() {
        const instructions = [
            'Use Arrow Keys or WASD to Move',
            'Eat all dots to complete the level',
            'Avoid the ghosts unless you eat a power pellet',
            'Press SPACE to pause the game',
            '',
            'Press ENTER to select menu items'
        ];
        
        const instructionText = this.add.text(
            this.sys.game.config.width / 2,
            this.sys.game.config.height - 120,
            instructions.join('\n'),
            {
                fontSize: '12px',
                fontFamily: 'Orbitron',
                fill: '#888888',
                align: 'center',
                lineSpacing: 5
            }
        ).setOrigin(0.5);
        
        instructionText.setAlpha(0);
        this.tweens.add({
            targets: instructionText,
            alpha: 1,
            duration: 1000,
            delay: 2500
        });
    }

    createVersionInfo() {
        this.add.text(
            10,
            this.sys.game.config.height - 20,
            'v1.0.0 | Built with Phaser.js',
            {
                fontSize: '10px',
                fontFamily: 'Orbitron',
                fill: '#444444'
            }
        );
    }

    createParticleEffects() {
        // Create simple particle system for ambiance
        this.particleTimer = 0;
        this.particles = [];
    }

    setupInput() {
        // Keyboard input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.escapeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        
        // WASD keys
        this.wasd = this.input.keyboard.addKeys('W,S,A,D');
        
        // Mouse/touch input for menu items
        this.menuItems.forEach((item, index) => {
            item.setInteractive();
            
            item.on('pointerover', () => {
                this.selectedOption = index;
                this.updateMenuSelection();
            });
            
            item.on('pointerdown', () => {
                this.selectMenuItem();
            });
        });
    }

    setupSoundManager() {
        this.soundManager = new SoundManager(this);
        this.soundManager.create();
    }

    update(time, deltaTime) {
        this.animationTimer += deltaTime;
        
        // Handle input
        this.handleInput();
        
        // Update particle effects
        this.updateParticleEffects(deltaTime);
        
        // Update background animations
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
    }

    navigateMenu(direction) {
        this.selectedOption += direction;
        
        if (this.selectedOption < 0) {
            this.selectedOption = this.menuOptions.length - 1;
        } else if (this.selectedOption >= this.menuOptions.length) {
            this.selectedOption = 0;
        }
        
        this.updateMenuSelection();
        
        // Play menu navigation sound
        if (this.soundManager) {
            this.soundManager.play('pelletEat', { volume: 0.3 });
        }
    }

    updateMenuSelection() {
        // Update menu item styles
        this.menuItems.forEach((item, index) => {
            if (index === this.selectedOption) {
                item.setStyle({ fill: '#00ff41' });
                item.setScale(1.1);
            } else {
                item.setStyle({ fill: '#ffffff' });
                item.setScale(1.0);
            }
        });
        
        // Update selector position
        if (this.selector) {
            const targetY = 300 + this.selectedOption * 50;
            this.tweens.add({
                targets: this.selector,
                y: targetY,
                duration: 200,
                ease: 'Power2.out'
            });
        }
    }

    selectMenuItem() {
        const selectedMenuItem = this.menuOptions[this.selectedOption];
        
        // Play selection sound
        if (this.soundManager) {
            this.soundManager.playPowerPelletEat();
        }
        
        // Handle menu selection
        switch (selectedMenuItem) {
            case 'START GAME':
                this.startGame();
                break;
                
            case 'HIGH SCORES':
                this.showHighScores();
                break;
                
            case 'SETTINGS':
                this.showSettings();
                break;
                
            case 'CREDITS':
                this.showCredits();
                break;
        }
        
        console.log(`📺 Menu selected: ${selectedMenuItem}`);
    }

    startGame() {
        console.log('🎮 Starting game...');
        
        // Reset game state
        DotAdventure.resetGame();
        DotAdventure.startGame();
        
        // Transition to game scene
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('GameScene');
        });
    }

    showHighScores() {
        // Simple high scores display (could be expanded later)
        const scoreSystem = new ScoreSystem(this);
        const highScores = scoreSystem.getHighScores();
        
        let scoresText = 'HIGH SCORES\n\n';
        if (highScores.length > 0) {
            highScores.forEach((score, index) => {
                const date = new Date(score.date).toLocaleDateString();
                scoresText += `${index + 1}. ${score.score.toLocaleString()} - Level ${score.level} (${date})\n`;
            });
        } else {
            scoresText += 'No high scores yet!\nPlay a game to set your first score.';
        }
        
        this.showDialog('High Scores', scoresText);
    }

    showSettings() {
        const settingsText = 'SETTINGS\n\nSound: ' + 
            (DotAdventure.isSoundEnabled() ? 'ON' : 'OFF') + 
            '\n\nPress S to toggle sound\nPress ESC to return';
        
        this.showDialog('Settings', settingsText);
        
        // Handle settings input
        const sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        sKey.once('down', () => {
            DotAdventure.toggleSound();
            this.hideDialog();
            this.showSettings(); // Refresh
        });
    }

    showCredits() {
        const creditsText = 'CREDITS\n\n' +
            'Game Design & Development\n' +
            'Built with Phaser.js\n\n' +
            'Sound Effects: Procedural Audio\n' +
            'Graphics: Custom Rendered\n\n' +
            'Thank you for playing!\n\n' +
            'Press ESC to return';
        
        this.showDialog('Credits', creditsText);
    }

    showDialog(title, content) {
        // Create modal dialog
        this.dialogBg = this.add.rectangle(
            this.sys.game.config.width / 2,
            this.sys.game.config.height / 2,
            500, 400,
            0x000000, 0.9
        ).setStrokeStyle(2, 0x00ff41);
        
        this.dialogTitle = this.add.text(
            this.sys.game.config.width / 2,
            this.sys.game.config.height / 2 - 150,
            title,
            {
                fontSize: '24px',
                fontFamily: 'Orbitron',
                fill: '#00ff41'
            }
        ).setOrigin(0.5);
        
        this.dialogContent = this.add.text(
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
        
        // ESC to close
        this.escapeKey.once('down', () => {
            this.hideDialog();
        });
    }

    hideDialog() {
        if (this.dialogBg) this.dialogBg.destroy();
        if (this.dialogTitle) this.dialogTitle.destroy();
        if (this.dialogContent) this.dialogContent.destroy();
    }

    updateParticleEffects(deltaTime) {
        this.particleTimer += deltaTime;
        
        // Spawn new particles occasionally
        if (this.particleTimer > 500 + Math.random() * 1000) {
            this.createAmbientParticle();
            this.particleTimer = 0;
        }
        
        // Clean up old particles
        this.particles = this.particles.filter(particle => {
            if (!particle.active) {
                return false;
            }
            return true;
        });
    }

    createAmbientParticle() {
        const x = Math.random() * this.sys.game.config.width;
        const y = -10;
        
        const particle = this.add.circle(x, y, 1, 0x888888, 0.6);
        particle.setBlendMode(Phaser.BlendModes.ADD);
        
        this.tweens.add({
            targets: particle,
            y: this.sys.game.config.height + 10,
            alpha: 0,
            duration: 5000 + Math.random() * 3000,
            ease: 'Linear',
            onComplete: () => {
                particle.destroy();
            }
        });
        
        this.particles.push(particle);
    }

    updateBackgroundEffects(deltaTime) {
        // Update any additional background animations here
        this.titleAnimationPhase += deltaTime * 0.001;
        
        // Subtle title glow animation
        if (this.titleText) {
            const glowIntensity = 0.8 + Math.sin(this.titleAnimationPhase * 2) * 0.2;
            this.titleText.setAlpha(glowIntensity);
        }
    }

    // Cleanup when leaving scene
    shutdown() {
        // Clean up particles
        this.particles.forEach(particle => {
            if (particle && particle.destroy) {
                particle.destroy();
            }
        });
        this.particles = [];
        
        // Clean up background elements
        this.backgroundElements.forEach(element => {
            if (element && element.destroy) {
                element.destroy();
            }
        });
        this.backgroundElements = [];
        
        console.log('📺 TitleScreen scene shutdown');
    }
}

// Export for use in main.js
window.TitleScreen = TitleScreen;