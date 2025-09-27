// ===== DOT ADVENTURE - PLAYER ENTITY =====

class Player {
    constructor(scene, x, y) {
        this.scene = scene;
        this.startX = x;
        this.startY = y;
        
        // Create player sprite (circle for now, will be visual later)
        this.sprite = this.scene.add.circle(x, y, 12, 0xffff00);
        this.scene.physics.add.existing(this.sprite);
        this.sprite.body.setCircle(12);
        this.sprite.body.setCollideWorldBounds(false);
        
        // Player properties
        this.speed = 100;
        this.direction = { x: 0, y: 0 };
        this.nextDirection = { x: 0, y: 0 };
        this.isMoving = false;
        this.isDead = false;
        this.isInvulnerable = false;
        this.invulnerabilityTime = 0;
        
        // Animation properties
        this.animationTimer = 0;
        this.mouthOpen = false;
        this.facing = 'right';
        
        // Movement buffer for smooth direction changes
        this.turnBuffer = 5; // pixels before turn point
        this.lastValidPosition = { x: x, y: y };
        
        // Debug properties
        this.debugFreeMove = false;
        
        // Input setup
        this.setupInput();
        
        // Visual enhancements
        this.createVisualEffects();
        
        console.log('🟡 Player created at', x, y);
    }

    setupInput() {
        // Arrow keys
        this.cursors = this.scene.input.keyboard.createCursorKeys();
        
        // WASD keys
        this.wasd = this.scene.input.keyboard.addKeys('W,S,A,D');
        
        // Additional controls
        this.spaceKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    createVisualEffects() {
        // Create glow effect
        this.glowEffect = this.scene.add.circle(this.sprite.x, this.sprite.y, 18, 0xffff00, 0.3);
        this.glowEffect.setBlendMode(Phaser.BlendModes.ADD);
        
        // Create trail effect
        this.trail = [];
        this.maxTrailLength = 8;
        
        // Power-up effect (initially invisible)
        this.powerEffect = this.scene.add.circle(this.sprite.x, this.sprite.y, 22, 0xff8800, 0);
        this.powerEffect.setBlendMode(Phaser.BlendModes.ADD);
    }

    update(deltaTime) {
        if (this.isDead) {
            this.updateDeathAnimation(deltaTime);
            return;
        }

        this.handleInput();
        this.updateMovement(deltaTime);
        this.updateAnimation(deltaTime);
        this.updateVisualEffects(deltaTime);
        this.updateInvulnerability(deltaTime);
        // Note: Collision checking is now handled by GameScene
    }

    handleInput() {
        // Get input direction
        let inputX = 0;
        let inputY = 0;

        // Check arrow keys
        if (this.cursors.left.isDown || this.wasd.A.isDown) {
            inputX = -1;
        } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
            inputX = 1;
        }

        if (this.cursors.up.isDown || this.wasd.W.isDown) {
            inputY = -1;
        } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
            inputY = 1;
        }

        // Set next direction
        if (inputX !== 0 || inputY !== 0) {
            this.nextDirection = { x: inputX, y: inputY };
        }
    }

    updateMovement(deltaTime) {
        const levelManager = this.scene.levelManager;
        if (!levelManager) return;

        const currentX = this.sprite.x;
        const currentY = this.sprite.y;

        // Try to change direction if requested
        if (this.nextDirection.x !== 0 || this.nextDirection.y !== 0) {
            const canMoveNext = this.canMove(currentX, currentY, this.nextDirection);
            
            if (canMoveNext) {
                this.direction = { ...this.nextDirection };
                this.nextDirection = { x: 0, y: 0 };
                this.isMoving = true;
                this.updateFacing();
            } else if (!this.isMoving) {
                // If not currently moving, try to start moving in the requested direction
                // with a more lenient check
                const lenientCheck = this.canMove(currentX + this.nextDirection.x * 4, currentY + this.nextDirection.y * 4, this.nextDirection);
                if (lenientCheck) {
                    this.direction = { ...this.nextDirection };
                    this.nextDirection = { x: 0, y: 0 };
                    this.isMoving = true;
                    this.updateFacing();
                }
            }
        }

        // Move in current direction if possible
        if (this.isMoving && this.direction.x === 0 && this.direction.y === 0) {
            this.isMoving = false;
        }

        if (this.isMoving) {
            const nextX = currentX + (this.direction.x * this.speed * deltaTime / 1000);
            const nextY = currentY + (this.direction.y * this.speed * deltaTime / 1000);

            // Check if we can continue moving
            if (this.canMove(nextX, nextY, this.direction)) {
                this.sprite.setPosition(nextX, nextY);
                this.lastValidPosition = { x: nextX, y: nextY };
                this.addTrailPoint(nextX, nextY);
            } else {
                // Hit a wall, stop moving
                this.isMoving = false;
                this.direction = { x: 0, y: 0 };
                // Snap to grid
                this.snapToGrid();
            }
        }

        // Check for tunnel wraparound
        this.checkTunnels();
    }

    canMove(x, y, direction) {
        // Debug free movement
        if (this.debugFreeMove) {
            return true;
        }
        
        const levelManager = this.scene.levelManager;
        if (!levelManager) {
            return true; // Allow movement if no level manager
        }

        // Calculate the position we're trying to move to
        const buffer = 6; // Smaller collision buffer for better movement
        const checkX = x + (direction.x * buffer);
        const checkY = y + (direction.y * buffer);

        // Check center point and corners for collision
        const points = [
            { x: checkX, y: checkY }, // Center
            { x: checkX - 8, y: checkY - 8 }, // Top-left
            { x: checkX + 8, y: checkY - 8 }, // Top-right
            { x: checkX - 8, y: checkY + 8 }, // Bottom-left
            { x: checkX + 8, y: checkY + 8 }  // Bottom-right
        ];

        // All points must be clear of walls
        return points.every(point => !levelManager.isWall(point.x, point.y));
    }

    snapToGrid() {
        const tileSize = this.scene.levelManager?.getTileSize() || 32;
        const snappedX = Math.round(this.sprite.x / tileSize) * tileSize + tileSize / 2;
        const snappedY = Math.round(this.sprite.y / tileSize) * tileSize + tileSize / 2;
        this.sprite.setPosition(snappedX, snappedY);
    }

    checkTunnels() {
        const levelManager = this.scene.levelManager;
        if (!levelManager) return;

        const tunnelResult = levelManager.checkTunnel(this.sprite.x, this.sprite.y);
        if (tunnelResult) {
            this.sprite.setPosition(tunnelResult.x, tunnelResult.y);
        }
    }

    updateFacing() {
        if (this.direction.x > 0) this.facing = 'right';
        else if (this.direction.x < 0) this.facing = 'left';
        else if (this.direction.y > 0) this.facing = 'down';
        else if (this.direction.y < 0) this.facing = 'up';
    }

    updateAnimation(deltaTime) {
        if (!this.isMoving) return;

        this.animationTimer += deltaTime;
        
        // Mouth animation (opens and closes while moving)
        if (this.animationTimer > 150) {
            this.mouthOpen = !this.mouthOpen;
            this.animationTimer = 0;
            this.updateSprite();
        }
    }

    updateSprite() {
        // Update the visual appearance based on animation state
        const baseColor = this.isInvulnerable ? 
            (Math.floor(Date.now() / 100) % 2 ? 0xffff00 : 0xff8800) : 0xffff00;
        
        this.sprite.setFillStyle(baseColor);
        
        // Scale slightly when mouth is open (simple animation)
        const scale = this.mouthOpen ? 0.9 : 1.0;
        this.sprite.setScale(scale);
    }

    updateVisualEffects(deltaTime) {
        // Update glow effect position
        this.glowEffect.setPosition(this.sprite.x, this.sprite.y);
        
        // Pulse glow effect
        const glowPulse = 0.2 + Math.sin(Date.now() * 0.01) * 0.1;
        this.glowEffect.setAlpha(glowPulse);

        // Update power effect if active
        if (this.powerEffect.alpha > 0) {
            this.powerEffect.setPosition(this.sprite.x, this.sprite.y);
            // Rotate power effect
            this.powerEffect.rotation += deltaTime * 0.005;
        }

        // Update trail
        this.updateTrail();
    }

    addTrailPoint(x, y) {
        this.trail.push({ x, y, alpha: 0.8, time: Date.now() });
        
        // Remove old trail points
        while (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }
    }

    updateTrail() {
        // Fade out trail points over time
        const currentTime = Date.now();
        this.trail = this.trail.filter(point => {
            const age = currentTime - point.time;
            return age < 500; // Keep trail for 500ms
        });
    }

    updateInvulnerability(deltaTime) {
        if (this.isInvulnerable) {
            this.invulnerabilityTime -= deltaTime;
            if (this.invulnerabilityTime <= 0) {
                this.isInvulnerable = false;
                this.invulnerabilityTime = 0;
            }
        }
    }

    // These methods are kept for backward compatibility but pellet collision is now handled in GameScene
    checkCollisions() {
        // Legacy method - collision checking now handled by GameScene for better coordination
    }

    onPelletEaten(pelletType) {
        // This method is called by GameScene when a pellet is eaten
        const soundManager = this.scene.soundManager;

        if (pelletType === 'pellet') {
            soundManager?.playPelletEat();
            this.createPelletEffect();
        } else if (pelletType === 'powerPellet') {
            soundManager?.playPowerPelletEat();
            this.activatePowerMode();
            this.scene.events.emit('powerPelletEaten');
        }
    }

    createPelletEffect() {
        // Create sparkle effect when eating pellet
        const effect = this.scene.add.circle(this.sprite.x, this.sprite.y, 3, 0xffffff);
        this.scene.tweens.add({
            targets: effect,
            scaleX: 2,
            scaleY: 2,
            alpha: 0,
            duration: 200,
            onComplete: () => effect.destroy()
        });
    }

    activatePowerMode() {
        // Visual power-up effect
        this.powerEffect.setAlpha(0.6);
        this.scene.tweens.add({
            targets: this.powerEffect,
            alpha: 0,
            duration: 10000, // 10 seconds
            ease: 'Power2'
        });

        // Speed boost during power mode
        const originalSpeed = this.speed;
        this.speed *= 1.2;
        
        this.scene.time.delayedCall(10000, () => {
            this.speed = originalSpeed;
        });
    }

    // Death and respawn
    die() {
        if (this.isDead || this.isInvulnerable) return;

        this.isDead = true;
        this.isMoving = false;
        this.direction = { x: 0, y: 0 };
        
        const soundManager = this.scene.soundManager;
        soundManager?.playPlayerDeath();
        
        // Notify scene of player death
        this.scene.events.emit('playerDied');
        
        // Death animation
        this.scene.tweens.add({
            targets: this.sprite,
            scaleX: 0.1,
            scaleY: 0.1,
            alpha: 0,
            duration: 1000,
            ease: 'Power2.in',
            onComplete: () => {
                // Scene will handle respawn timing
            }
        });

        console.log('💀 Player died');
    }

    respawn() {
        // Reset position
        this.sprite.setPosition(this.startX, this.startY);
        
        // Reset properties
        this.isDead = false;
        this.isInvulnerable = true;
        this.invulnerabilityTime = 2000; // 2 seconds of invulnerability
        this.direction = { x: 0, y: 0 };
        this.nextDirection = { x: 0, y: 0 };
        this.isMoving = false;
        
        // Reset visual state
        this.sprite.setScale(1);
        this.sprite.setAlpha(1);
        this.sprite.setFillStyle(0xffff00);
        
        console.log('🟡 Player respawned');
    }

    // Power-up effects
    setInvulnerable(duration) {
        this.isInvulnerable = true;
        this.invulnerabilityTime = duration;
    }

    setSpeed(speed) {
        this.speed = speed;
    }

    // Getters
    getPosition() {
        return { x: this.sprite.x, y: this.sprite.y };
    }

    getBounds() {
        return this.sprite.getBounds();
    }

    isAlive() {
        return !this.isDead;
    }

    getCurrentDirection() {
        return { ...this.direction };
    }

    getFacing() {
        return this.facing;
    }

    // Check if player is actually moving (has direction and isMoving flag)
    isActuallyMoving() {
        return this.isMoving && (this.direction.x !== 0 || this.direction.y !== 0);
    }

    // Update death animation
    updateDeathAnimation(deltaTime) {
        // Death animation is handled by tween, nothing to update here
    }

    // Cleanup
    destroy() {
        if (this.sprite) this.sprite.destroy();
        if (this.glowEffect) this.glowEffect.destroy();
        if (this.powerEffect) this.powerEffect.destroy();
        
        // Clear trail effects
        this.trail = [];
        
        console.log('🗑️ Player destroyed');
    }

    // Debug helpers
    debug() {
        console.log('=== PLAYER DEBUG ===');
        console.log('Position:', this.sprite.x.toFixed(1), this.sprite.y.toFixed(1));
        console.log('Direction:', this.direction);
        console.log('Next Direction:', this.nextDirection);
        console.log('Speed:', this.speed);
        console.log('Moving:', this.isMoving);
        console.log('Actually Moving:', this.isActuallyMoving());
        console.log('Dead:', this.isDead);
        console.log('Invulnerable:', this.isInvulnerable);
        console.log('Facing:', this.facing);
        console.log('Debug Free Move:', this.debugFreeMove);
        
        // Show grid position
        const levelManager = this.scene.levelManager;
        if (levelManager) {
            const tileSize = levelManager.getTileSize();
            const gridX = Math.floor(this.sprite.x / tileSize);
            const gridY = Math.floor(this.sprite.y / tileSize);
            console.log('Grid Position:', gridX, gridY);
        }
        console.log('==================');
    }
}

// Export for use in other modules
window.Player = Player;