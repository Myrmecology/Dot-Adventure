// ===== DOT ADVENTURE - PELLET ENTITY =====

class Pellet {
    constructor(scene, x, y, type = 'normal') {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.type = type; // 'normal' or 'power'
        this.isEaten = false;
        this.isVisible = true;
        
        // Create pellet sprite based on type
        this.createSprite();
        
        // Animation properties
        this.animationTimer = 0;
        this.pulsePhase = Math.random() * Math.PI * 2; // Random phase for variation
        
        // Visual effects
        this.createVisualEffects();
        
        console.log(`🔸 ${type} pellet created at ${x}, ${y}`);
    }

    createSprite() {
        if (this.type === 'power') {
            // Power pellet - larger, different color
            this.sprite = this.scene.add.circle(this.x, this.y, 8, 0xffff00);
            this.baseSize = 8;
            this.glowColor = 0xffa500;
        } else {
            // Normal pellet - small dot
            this.sprite = this.scene.add.circle(this.x, this.y, 3, 0xffff88);
            this.baseSize = 3;
            this.glowColor = 0xffffaa;
        }
        
        // Store reference to pellet instance
        this.sprite.pelletInstance = this;
    }

    createVisualEffects() {
        // Create glow effect for power pellets
        if (this.type === 'power') {
            this.glowEffect = this.scene.add.circle(this.x, this.y, 16, this.glowColor, 0.3);
            this.glowEffect.setBlendMode(Phaser.BlendModes.ADD);
            
            // Create particle ring for power pellets
            this.createPowerPelletEffects();
        } else {
            // Subtle glow for normal pellets
            this.glowEffect = this.scene.add.circle(this.x, this.y, 6, this.glowColor, 0.15);
            this.glowEffect.setBlendMode(Phaser.BlendModes.ADD);
        }
    }

    createPowerPelletEffects() {
        // Create sparkle particles around power pellets
        this.sparkles = [];
        const sparkleCount = 6;
        
        for (let i = 0; i < sparkleCount; i++) {
            const angle = (i / sparkleCount) * Math.PI * 2;
            const radius = 20;
            const sparkleX = this.x + Math.cos(angle) * radius;
            const sparkleY = this.y + Math.sin(angle) * radius;
            
            const sparkle = this.scene.add.circle(sparkleX, sparkleY, 1, 0xffffff, 0.8);
            sparkle.setBlendMode(Phaser.BlendModes.ADD);
            sparkle.angle = angle;
            sparkle.baseRadius = radius;
            
            this.sparkles.push(sparkle);
        }
    }

    update(deltaTime) {
        if (this.isEaten || !this.isVisible) return;

        this.updateAnimation(deltaTime);
        this.updateVisualEffects(deltaTime);
    }

    updateAnimation(deltaTime) {
        this.animationTimer += deltaTime;
        
        if (this.type === 'power') {
            // Power pellets pulse
            const pulseSpeed = 0.003;
            const pulseScale = 1 + Math.sin(this.animationTimer * pulseSpeed + this.pulsePhase) * 0.3;
            this.sprite.setScale(pulseScale);
            
            // Rotate sparkles
            if (this.sparkles) {
                const rotationSpeed = 0.002;
                this.sparkles.forEach(sparkle => {
                    sparkle.angle += rotationSpeed * deltaTime;
                    
                    const radius = sparkle.baseRadius + Math.sin(this.animationTimer * 0.001 + sparkle.angle) * 3;
                    sparkle.x = this.x + Math.cos(sparkle.angle) * radius;
                    sparkle.y = this.y + Math.sin(sparkle.angle) * radius;
                    
                    // Sparkle alpha animation
                    const alpha = 0.5 + Math.sin(this.animationTimer * 0.008 + sparkle.angle * 2) * 0.3;
                    sparkle.setAlpha(alpha);
                });
            }
        } else {
            // Normal pellets have subtle pulse
            const pulseSpeed = 0.001;
            const pulseScale = 1 + Math.sin(this.animationTimer * pulseSpeed + this.pulsePhase) * 0.1;
            this.sprite.setScale(pulseScale);
        }
    }

    updateVisualEffects(deltaTime) {
        // Update glow effect
        if (this.glowEffect) {
            const glowPulse = 0.2 + Math.sin(this.animationTimer * 0.002 + this.pulsePhase) * 0.1;
            this.glowEffect.setAlpha(glowPulse);
            
            if (this.type === 'power') {
                // Power pellet glow rotates
                this.glowEffect.rotation += deltaTime * 0.001;
            }
        }
    }

    // Called when pellet is eaten
    onEaten() {
        if (this.isEaten) return false;
        
        this.isEaten = true;
        this.isVisible = false;
        
        // Create eat effect
        this.createEatEffect();
        
        // Hide sprites
        this.sprite.setVisible(false);
        if (this.glowEffect) {
            this.glowEffect.setVisible(false);
        }
        
        // Hide sparkles for power pellets
        if (this.sparkles) {
            this.sparkles.forEach(sparkle => sparkle.setVisible(false));
        }
        
        console.log(`🔸 ${this.type} pellet eaten at ${this.x}, ${this.y}`);
        return true;
    }

    createEatEffect() {
        if (this.type === 'power') {
            // Power pellet explosion effect
            this.createPowerPelletEatEffect();
        } else {
            // Simple sparkle effect for normal pellets
            this.createNormalPelletEatEffect();
        }
    }

    createNormalPelletEatEffect() {
        // Create small sparkle burst
        const sparkleCount = 4;
        
        for (let i = 0; i < sparkleCount; i++) {
            const angle = (i / sparkleCount) * Math.PI * 2;
            const speed = 30 + Math.random() * 20;
            const lifetime = 300 + Math.random() * 200;
            
            const sparkle = this.scene.add.circle(this.x, this.y, 1, 0xffffff);
            sparkle.setBlendMode(Phaser.BlendModes.ADD);
            
            // Animate sparkle outward
            this.scene.tweens.add({
                targets: sparkle,
                x: this.x + Math.cos(angle) * speed,
                y: this.y + Math.sin(angle) * speed,
                alpha: 0,
                scaleX: 0.1,
                scaleY: 0.1,
                duration: lifetime,
                ease: 'Power2.out',
                onComplete: () => sparkle.destroy()
            });
        }
    }

    createPowerPelletEatEffect() {
        // Create expanding ring effect
        const ring = this.scene.add.circle(this.x, this.y, 0, 0xffffff, 0);
        ring.setStrokeStyle(3, 0xffa500, 1);
        ring.setBlendMode(Phaser.BlendModes.ADD);
        
        this.scene.tweens.add({
            targets: ring,
            radius: 40,
            alpha: 0,
            duration: 500,
            ease: 'Power2.out',
            onComplete: () => ring.destroy()
        });
        
        // Create energy burst particles
        const burstCount = 12;
        for (let i = 0; i < burstCount; i++) {
            const angle = (i / burstCount) * Math.PI * 2;
            const speed = 60 + Math.random() * 40;
            const lifetime = 500 + Math.random() * 300;
            
            const particle = this.scene.add.circle(this.x, this.y, 2 + Math.random() * 2, 0xffa500);
            particle.setBlendMode(Phaser.BlendModes.ADD);
            
            this.scene.tweens.add({
                targets: particle,
                x: this.x + Math.cos(angle) * speed,
                y: this.y + Math.sin(angle) * speed,
                alpha: 0,
                scaleX: 0,
                scaleY: 0,
                duration: lifetime,
                ease: 'Power3.out',
                onComplete: () => particle.destroy()
            });
        }
        
        // Screen shake effect for power pellets
        if (this.scene.cameras && this.scene.cameras.main) {
            this.scene.cameras.main.shake(200, 0.01);
        }
    }

    // Utility methods
    getPosition() {
        return { x: this.x, y: this.y };
    }

    getBounds() {
        return this.sprite ? this.sprite.getBounds() : null;
    }

    getType() {
        return this.type;
    }

    isAvailable() {
        return !this.isEaten && this.isVisible;
    }

    isPowerPellet() {
        return this.type === 'power';
    }

    // Distance check for optimization
    distanceToPlayer(playerX, playerY) {
        return Phaser.Math.Distance.Between(this.x, this.y, playerX, playerY);
    }

    // Show/hide for level transitions
    show() {
        this.isVisible = true;
        this.isEaten = false;
        
        if (this.sprite) this.sprite.setVisible(true);
        if (this.glowEffect) this.glowEffect.setVisible(true);
        if (this.sparkles) {
            this.sparkles.forEach(sparkle => sparkle.setVisible(true));
        }
    }

    hide() {
        this.isVisible = false;
        
        if (this.sprite) this.sprite.setVisible(false);
        if (this.glowEffect) this.glowEffect.setVisible(false);
        if (this.sparkles) {
            this.sparkles.forEach(sparkle => sparkle.setVisible(false));
        }
    }

    // Special effects for game events
    highlight() {
        if (!this.isVisible || this.isEaten) return;
        
        // Brief highlight effect
        const originalAlpha = this.sprite.alpha;
        
        this.scene.tweens.add({
            targets: this.sprite,
            alpha: 1,
            scaleX: 1.5,
            scaleY: 1.5,
            duration: 150,
            yoyo: true,
            onComplete: () => {
                this.sprite.setAlpha(originalAlpha);
                this.sprite.setScale(1);
            }
        });
    }

    flash(duration = 1000) {
        if (!this.isVisible || this.isEaten) return;
        
        // Flash effect
        this.scene.tweens.add({
            targets: [this.sprite, this.glowEffect],
            alpha: 0.3,
            duration: 100,
            yoyo: true,
            repeat: Math.floor(duration / 200),
            ease: 'Power2.inOut'
        });
    }

    // Cleanup
    destroy() {
        if (this.sprite) {
            this.sprite.destroy();
        }
        
        if (this.glowEffect) {
            this.glowEffect.destroy();
        }
        
        if (this.sparkles) {
            this.sparkles.forEach(sparkle => sparkle.destroy());
            this.sparkles = [];
        }
        
        console.log(`🗑️ ${this.type} pellet destroyed at ${this.x}, ${this.y}`);
    }

    // Debug helpers
    debug() {
        console.log(`=== ${this.type.toUpperCase()} PELLET DEBUG ===`);
        console.log('Position:', this.x, this.y);
        console.log('Is Eaten:', this.isEaten);
        console.log('Is Visible:', this.isVisible);
        console.log('Type:', this.type);
        console.log('Base Size:', this.baseSize);
        console.log('========================');
    }
}

// Static pellet management utilities
class PelletManager {
    constructor(scene) {
        this.scene = scene;
        this.pellets = [];
        this.powerPellets = [];
        this.totalPellets = 0;
        this.eatenPellets = 0;
        this.initialized = false;
        
        console.log('🔸 PelletManager initialized');
    }

    // Create pellets based on maze layout
    createPelletsFromMaze(maze, tileSize) {
        console.log('🔸 Creating pellets from maze...');
        this.clearAllPellets();
        
        for (let y = 0; y < maze.length; y++) {
            for (let x = 0; x < maze[y].length; x++) {
                const tileValue = maze[y][x];
                const pixelX = x * tileSize + tileSize / 2;
                const pixelY = y * tileSize + tileSize / 2;
                
                if (tileValue === 2) { // Normal pellet
                    const pellet = new Pellet(this.scene, pixelX, pixelY, 'normal');
                    this.pellets.push(pellet);
                } else if (tileValue === 3) { // Power pellet
                    const pellet = new Pellet(this.scene, pixelX, pixelY, 'power');
                    this.powerPellets.push(pellet);
                    this.pellets.push(pellet);
                }
            }
        }
        
        this.totalPellets = this.pellets.length;
        this.eatenPellets = 0;
        this.initialized = true;
        
        console.log(`🔸 Created ${this.pellets.length} pellets (${this.powerPellets.length} power pellets)`);
        console.log(`🔸 Total pellets to collect: ${this.totalPellets}`);
    }

    // Update all pellets
    update(deltaTime) {
        if (!this.initialized) return;
        
        this.pellets.forEach(pellet => {
            if (pellet && pellet.isVisible) {
                pellet.update(deltaTime);
            }
        });
    }

    // Check collision with player
    checkPlayerCollision(playerX, playerY, collisionRadius = 10) {
        if (!this.initialized) return [];
        
        const eatenPellets = [];
        
        this.pellets.forEach(pellet => {
            if (pellet.isAvailable() && pellet.distanceToPlayer(playerX, playerY) < collisionRadius) {
                if (pellet.onEaten()) {
                    eatenPellets.push(pellet);
                    this.eatenPellets++;
                    
                    // Handle scoring here
                    const scoreSystem = this.scene.scoreSystem;
                    if (pellet.isPowerPellet()) {
                        scoreSystem?.scorePowerPelletEaten();
                    } else {
                        scoreSystem?.scorePelletEaten();
                    }
                }
            }
        });
        
        return eatenPellets;
    }

    // Get remaining pellets
    getRemainingCount() {
        if (!this.initialized) return 0;
        return this.totalPellets - this.eatenPellets;
    }

    // Get total pellets
    getTotalCount() {
        return this.totalPellets;
    }

    // Get eaten pellets count
    getEatenCount() {
        return this.eatenPellets;
    }

    // Check if level complete
    isLevelComplete() {
        if (!this.initialized || this.totalPellets === 0) return false;
        
        const remaining = this.getRemainingCount();
        console.log(`🔸 Level completion check: ${this.eatenPellets}/${this.totalPellets} eaten, ${remaining} remaining`);
        
        return remaining <= 0;
    }

    // Get completion percentage
    getCompletionPercentage() {
        if (!this.initialized || this.totalPellets === 0) return 0;
        return this.eatenPellets / this.totalPellets;
    }

    // Clear all pellets
    clearAllPellets() {
        this.pellets.forEach(pellet => pellet.destroy());
        this.pellets = [];
        this.powerPellets = [];
        this.totalPellets = 0;
        this.eatenPellets = 0;
        this.initialized = false;
        
        console.log('🔸 All pellets cleared');
    }

    // Reset pellets for new level
    reset() {
        this.pellets.forEach(pellet => {
            pellet.show();
        });
        this.eatenPellets = 0;
        
        console.log('🔸 Pellets reset for new attempt');
    }

    // Flash all remaining pellets
    flashAll(duration = 1000) {
        this.pellets.forEach(pellet => {
            if (pellet.isAvailable()) {
                pellet.flash(duration);
            }
        });
    }

    // Get pellets by type
    getPowerPellets() {
        return this.powerPellets.filter(pellet => pellet.isAvailable());
    }

    getNormalPellets() {
        return this.pellets.filter(pellet => 
            pellet.getType() === 'normal' && pellet.isAvailable()
        );
    }

    // Statistics
    getStats() {
        return {
            total: this.totalPellets,
            eaten: this.eatenPellets,
            remaining: this.getRemainingCount(),
            powerPellets: this.powerPellets.length,
            normalPellets: this.pellets.length - this.powerPellets.length,
            completionPercentage: this.getCompletionPercentage(),
            initialized: this.initialized
        };
    }

    // Debug method
    debugStats() {
        const stats = this.getStats();
        console.log('=== PELLET MANAGER DEBUG ===');
        Object.keys(stats).forEach(key => {
            console.log(`${key}: ${stats[key]}`);
        });
        console.log('===========================');
    }
}

// Export for use in other modules
window.Pellet = Pellet;
window.PelletManager = PelletManager;