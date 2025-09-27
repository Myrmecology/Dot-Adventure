// ===== DOT ADVENTURE - GHOST ENTITY =====

class Ghost {
    constructor(scene, x, y, config = {}) {
        this.scene = scene;
        this.startX = x;
        this.startY = y;
        
        // Ghost configuration
        this.config = {
            color: config.color || 'red',
            personality: config.personality || 'aggressive',
            speed: config.speed || 80,
            ...config
        };

        // Create ghost sprite (rectangle with rounded top for now)
        this.createSprite();
        
        // Ghost properties
        this.baseSpeed = this.config.speed;
        this.speed = this.baseSpeed;
        this.direction = { x: 0, y: -1 }; // Start moving up
        this.targetDirection = { x: 0, y: -1 };
        this.isMoving = true;
        this.mode = 'exiting'; // Start in exiting mode to leave spawn area
        this.modeTimer = 0;
        this.isEaten = false;
        this.isExitingHouse = true;
        this.exitTimer = 1000; // Wait 1 second before exiting
        
        // AI properties
        this.pathfinding = {
            lastPosition: { x: x, y: y },
            stuckCounter: 0,
            lastDirectionChange: 0,
            changeDirectionTimer: 0
        };

        // Personality-specific properties
        this.personalityConfig = this.getPersonalityConfig();
        
        // Animation properties
        this.animationTimer = 0;
        this.animationFrame = 0;
        
        // State tracking
        this.frightenedTimer = 0;
        this.scatterTarget = this.getScatterTarget();
        
        // Visual effects
        this.createVisualEffects();
        
        console.log(`👻 ${this.config.color} ghost created at ${x}, ${y} with ${this.config.personality} personality`);
    }

    createSprite() {
        // Create the main ghost body (simplified visual)
        this.sprite = this.scene.add.rectangle(this.startX, this.startY, 24, 24, this.getColorValue());
        this.scene.physics.add.existing(this.sprite);
        this.sprite.body.setSize(22, 22);
        
        // Make ghosts not collide with world bounds (they can wrap around)
        this.sprite.body.setCollideWorldBounds(false);
        
        // Store reference to ghost instance
        this.sprite.ghostInstance = this;
    }

    getColorValue() {
        const colors = {
            'red': 0xff0000,
            'pink': 0xffb6c1,
            'cyan': 0x00ffff,
            'orange': 0xffa500,
            'blue': 0x0080ff,
            'frightened': 0x0000ff,
            'white': 0xffffff
        };
        return colors[this.config.color] || 0xff0000;
    }

    createVisualEffects() {
        // Create glow effect
        this.glowEffect = this.scene.add.circle(this.sprite.x, this.sprite.y, 15, this.getColorValue(), 0.3);
        this.glowEffect.setBlendMode(Phaser.BlendModes.ADD);
        
        // Eyes (simple white dots)
        this.leftEye = this.scene.add.circle(this.sprite.x - 6, this.sprite.y - 3, 3, 0xffffff);
        this.rightEye = this.scene.add.circle(this.sprite.x + 6, this.sprite.y - 3, 3, 0xffffff);
        
        // Eye pupils
        this.leftPupil = this.scene.add.circle(this.sprite.x - 6, this.sprite.y - 3, 1.5, 0x000000);
        this.rightPupil = this.scene.add.circle(this.sprite.x + 6, this.sprite.y - 3, 1.5, 0x000000);
    }

    getPersonalityConfig() {
        const personalities = {
            'aggressive': {
                chaseWeight: 1.0,
                scatterTime: 5000,
                chaseTime: 20000,
                panicThreshold: 100,
                speedMultiplier: 1.0,
                changeDirectionFrequency: 2000
            },
            'ambush': {
                chaseWeight: 0.7,
                scatterTime: 8000,
                chaseTime: 15000,
                panicThreshold: 150,
                speedMultiplier: 0.9,
                changeDirectionFrequency: 3000
            },
            'patrol': {
                chaseWeight: 0.5,
                scatterTime: 12000,
                chaseTime: 10000,
                panicThreshold: 200,
                speedMultiplier: 0.8,
                changeDirectionFrequency: 4000
            },
            'random': {
                chaseWeight: 0.3,
                scatterTime: 6000,
                chaseTime: 8000,
                panicThreshold: 80,
                speedMultiplier: 1.1,
                changeDirectionFrequency: 1500
            }
        };

        return personalities[this.config.personality] || personalities['aggressive'];
    }

    getScatterTarget() {
        // Each ghost has a different corner to scatter to
        const targets = {
            'red': { x: 2, y: 2 },
            'pink': { x: 22, y: 2 },
            'cyan': { x: 2, y: 20 },
            'orange': { x: 22, y: 20 }
        };

        const target = targets[this.config.color];
        if (target && this.scene.levelManager) {
            const tileSize = this.scene.levelManager.getTileSize();
            return {
                x: target.x * tileSize + tileSize / 2,
                y: target.y * tileSize + tileSize / 2
            };
        }

        return { x: 100, y: 100 };
    }

    update(deltaTime) {
        if (this.isEaten && this.mode !== 'returning') {
            this.updateEatenState(deltaTime);
            return;
        }

        this.updateMode(deltaTime);
        this.updateMovement(deltaTime);
        this.updateAnimation(deltaTime);
        this.updateVisualEffects(deltaTime);
        this.checkPlayerCollision();
    }

    updateMode(deltaTime) {
        this.modeTimer += deltaTime;
        
        // Handle exiting the ghost house first
        if (this.mode === 'exiting') {
            this.exitTimer -= deltaTime;
            if (this.exitTimer <= 0) {
                this.isExitingHouse = false;
                this.setMode('chase');
            }
            return;
        }
        
        switch (this.mode) {
            case 'chase':
                if (this.modeTimer > this.personalityConfig.chaseTime) {
                    this.setMode('scatter');
                }
                break;
                
            case 'scatter':
                if (this.modeTimer > this.personalityConfig.scatterTime) {
                    this.setMode('chase');
                }
                break;
                
            case 'frightened':
                this.frightenedTimer -= deltaTime;
                if (this.frightenedTimer <= 0) {
                    this.setMode('chase');
                }
                // Flash when frightened time is almost up
                if (this.frightenedTimer < 2000) {
                    const flash = Math.floor(this.frightenedTimer / 200) % 2;
                    this.sprite.setFillStyle(flash ? 0x0000ff : 0xffffff);
                }
                break;
                
            case 'returning':
                // Check if returned to spawn
                const distanceToSpawn = Phaser.Math.Distance.Between(
                    this.sprite.x, this.sprite.y, this.startX, this.startY
                );
                if (distanceToSpawn < 10) {
                    this.respawn();
                }
                break;
        }
    }

    setMode(newMode) {
        if (this.mode === newMode) return;
        
        const oldMode = this.mode;
        this.mode = newMode;
        this.modeTimer = 0;
        
        // Mode-specific setup
        switch (newMode) {
            case 'frightened':
                this.frightenedTimer = 8000; // 8 seconds
                this.speed = this.baseSpeed * 0.5; // Slow down when frightened
                this.sprite.setFillStyle(0x0000ff);
                this.reverseDirection();
                break;
                
            case 'chase':
                this.speed = this.baseSpeed * this.personalityConfig.speedMultiplier;
                this.sprite.setFillStyle(this.getColorValue());
                break;
                
            case 'scatter':
                this.speed = this.baseSpeed * 0.8; // Slightly slower in scatter mode
                this.sprite.setFillStyle(this.getColorValue());
                break;
                
            case 'returning':
                this.speed = this.baseSpeed * 1.5; // Fast return
                this.sprite.setFillStyle(0x444444);
                this.isEaten = false; // Reset eaten state
                break;
        }
        
        console.log(`👻 ${this.config.color} ghost mode: ${oldMode} → ${newMode}`);
    }

    updateMovement(deltaTime) {
        const levelManager = this.scene.levelManager;
        if (!levelManager) return;

        // Update direction change timer
        this.pathfinding.changeDirectionTimer += deltaTime;

        // Get target based on current mode
        const target = this.getTarget();
        
        // Choose direction based on AI
        if (this.shouldChooseNewDirection()) {
            this.chooseDirection(target);
        }

        // Move in current direction
        const currentX = this.sprite.x;
        const currentY = this.sprite.y;
        const moveDistance = this.speed * deltaTime / 1000;
        const nextX = currentX + (this.direction.x * moveDistance);
        const nextY = currentY + (this.direction.y * moveDistance);

        // Check if we can move in current direction
        if (this.canMove(nextX, nextY)) {
            this.sprite.setPosition(nextX, nextY);
            this.pathfinding.lastPosition = { x: nextX, y: nextY };
            this.pathfinding.stuckCounter = 0;
        } else {
            // Can't move, choose new direction immediately
            this.pathfinding.stuckCounter++;
            this.chooseDirection(target);
            
            // If still stuck, try random direction
            if (this.pathfinding.stuckCounter > 3) {
                this.chooseRandomDirection();
                this.pathfinding.stuckCounter = 0;
            }
        }

        // Check for tunnel wraparound
        this.checkTunnels();
    }

    shouldChooseNewDirection() {
        // Choose new direction at intersections, when stuck, or periodically
        const levelManager = this.scene.levelManager;
        if (!levelManager) return false;

        // Periodic direction changes based on personality
        if (this.pathfinding.changeDirectionTimer > this.personalityConfig.changeDirectionFrequency) {
            this.pathfinding.changeDirectionTimer = 0;
            return true;
        }

        // Check if stuck
        if (this.pathfinding.stuckCounter > 0) {
            return true;
        }

        // Check if at intersection (can move in perpendicular directions)
        const currentX = this.sprite.x;
        const currentY = this.sprite.y;
        
        let possibleDirections = 0;
        const directions = [
            { x: 0, y: -1 }, // up
            { x: 1, y: 0 },  // right
            { x: 0, y: 1 },  // down
            { x: -1, y: 0 }  // left
        ];

        directions.forEach(dir => {
            if (this.canMove(currentX + dir.x * 20, currentY + dir.y * 20)) {
                possibleDirections++;
            }
        });

        return possibleDirections > 2; // At intersection
    }

    getTarget() {
        const player = this.scene.player;
        if (!player) return { x: this.startX, y: this.startY };

        switch (this.mode) {
            case 'exiting':
                // Target above the ghost house to exit
                return { x: this.startX, y: this.startY - 100 };
            case 'chase':
                return this.getChaseTarget(player);
            case 'scatter':
                return this.scatterTarget;
            case 'frightened':
                return this.getFrightenedTarget(player);
            case 'returning':
                return { x: this.startX, y: this.startY };
            default:
                return { x: this.sprite.x, y: this.sprite.y };
        }
    }

    getChaseTarget(player) {
        const playerPos = player.getPosition();
        
        switch (this.config.personality) {
            case 'aggressive':
                // Direct chase
                return playerPos;
                
            case 'ambush':
                // Target ahead of player
                const playerDir = player.getCurrentDirection();
                return {
                    x: playerPos.x + playerDir.x * 80,
                    y: playerPos.y + playerDir.y * 80
                };
                
            case 'patrol':
                // Patrol between player and scatter point
                const distToPlayer = Phaser.Math.Distance.Between(
                    this.sprite.x, this.sprite.y, playerPos.x, playerPos.y
                );
                if (distToPlayer < 120) {
                    return this.scatterTarget;
                } else {
                    return playerPos;
                }
                
            case 'random':
                // Semi-random movement towards general player area
                return {
                    x: playerPos.x + (Math.random() - 0.5) * 100,
                    y: playerPos.y + (Math.random() - 0.5) * 100
                };
                
            default:
                return playerPos;
        }
    }

    getFrightenedTarget(player) {
        // Run away from player
        const playerPos = player.getPosition();
        const dx = this.sprite.x - playerPos.x;
        const dy = this.sprite.y - playerPos.y;
        
        // Move away from player
        return {
            x: this.sprite.x + dx,
            y: this.sprite.y + dy
        };
    }

    chooseDirection(target) {
        const currentX = this.sprite.x;
        const currentY = this.sprite.y;
        const directions = [
            { x: 0, y: -1 }, // up
            { x: 1, y: 0 },  // right  
            { x: 0, y: 1 },  // down
            { x: -1, y: 0 }  // left
        ];

        // Don't reverse direction unless in frightened mode or stuck
        const validDirections = directions.filter(dir => {
            // Allow reverse if frightened or stuck
            if (this.mode === 'frightened' || this.pathfinding.stuckCounter > 0) {
                return this.canMove(currentX + dir.x * 20, currentY + dir.y * 20);
            }
            
            // Otherwise avoid immediate reversal
            if (dir.x === -this.direction.x && dir.y === -this.direction.y) {
                return false;
            }
            return this.canMove(currentX + dir.x * 20, currentY + dir.y * 20);
        });

        if (validDirections.length === 0) {
            // No valid directions, must reverse
            this.reverseDirection();
            return;
        }

        // Choose direction closest to target
        let bestDirection = validDirections[0];
        let bestDistance = Infinity;

        validDirections.forEach(dir => {
            const testX = currentX + dir.x * 32;
            const testY = currentY + dir.y * 32;
            const distance = Phaser.Math.Distance.Between(testX, testY, target.x, target.y);
            
            // In frightened mode, choose direction that increases distance
            if (this.mode === 'frightened') {
                if (distance > bestDistance) {
                    bestDistance = distance;
                    bestDirection = dir;
                }
            } else {
                if (distance < bestDistance) {
                    bestDistance = distance;
                    bestDirection = dir;
                }
            }
        });

        this.direction = { ...bestDirection };
        this.pathfinding.lastDirectionChange = Date.now();
        this.pathfinding.changeDirectionTimer = 0;
    }

    chooseRandomDirection() {
        const directions = [
            { x: 0, y: -1 }, // up
            { x: 1, y: 0 },  // right
            { x: 0, y: 1 },  // down
            { x: -1, y: 0 }  // left
        ];

        const validDirections = directions.filter(dir => {
            return this.canMove(
                this.sprite.x + dir.x * 20, 
                this.sprite.y + dir.y * 20
            );
        });

        if (validDirections.length > 0) {
            const randomDirection = Phaser.Utils.Array.GetRandom(validDirections);
            this.direction = { ...randomDirection };
        } else {
            this.reverseDirection();
        }
    }

    reverseDirection() {
        this.direction.x *= -1;
        this.direction.y *= -1;
    }

    canMove(x, y) {
        const levelManager = this.scene.levelManager;
        if (!levelManager) return true;
        
        // Ghosts can move through the center area more freely
        const centerX = 12 * levelManager.getTileSize() + levelManager.getTileSize() / 2;
        const centerY = 8 * levelManager.getTileSize() + levelManager.getTileSize() / 2;
        const distanceToCenter = Phaser.Math.Distance.Between(x, y, centerX, centerY);
        
        // Allow movement in ghost house area
        if (distanceToCenter < 100) {
            return true;
        }
        
        // Check for walls with smaller buffer than player
        const buffer = 8;
        const checkPoints = [
            { x: x, y: y },
            { x: x - buffer, y: y },
            { x: x + buffer, y: y },
            { x: x, y: y - buffer },
            { x: x, y: y + buffer }
        ];
        
        return checkPoints.every(point => !levelManager.isWall(point.x, point.y));
    }

    checkTunnels() {
        const levelManager = this.scene.levelManager;
        if (!levelManager) return;

        const tunnelResult = levelManager.checkTunnel(this.sprite.x, this.sprite.y);
        if (tunnelResult) {
            this.sprite.setPosition(tunnelResult.x, tunnelResult.y);
        }
    }

    updateAnimation(deltaTime) {
        this.animationTimer += deltaTime;
        
        if (this.animationTimer > 200) {
            this.animationFrame = (this.animationFrame + 1) % 2;
            this.animationTimer = 0;
            
            // Simple bob animation
            const offset = this.animationFrame * 2 - 1;
            this.sprite.y += offset * 0.5;
        }
    }

    updateVisualEffects(deltaTime) {
        // Update positions of visual elements
        this.glowEffect.setPosition(this.sprite.x, this.sprite.y);
        
        // Update eyes
        const eyeOffsetX = 6;
        const eyeOffsetY = 3;
        
        this.leftEye.setPosition(this.sprite.x - eyeOffsetX, this.sprite.y - eyeOffsetY);
        this.rightEye.setPosition(this.sprite.x + eyeOffsetX, this.sprite.y - eyeOffsetY);
        
        // Eye pupils look in movement direction
        const pupilOffset = 0.8;
        this.leftPupil.setPosition(
            this.sprite.x - eyeOffsetX + this.direction.x * pupilOffset,
            this.sprite.y - eyeOffsetY + this.direction.y * pupilOffset
        );
        this.rightPupil.setPosition(
            this.sprite.x + eyeOffsetX + this.direction.x * pupilOffset,
            this.sprite.y - eyeOffsetY + this.direction.y * pupilOffset
        );

        // Pulse glow effect
        const glowPulse = 0.2 + Math.sin(Date.now() * 0.008 + this.startX) * 0.1;
        this.glowEffect.setAlpha(glowPulse);
    }

    checkPlayerCollision() {
        const player = this.scene.player;
        if (!player || !player.isAlive()) return;

        const distance = Phaser.Math.Distance.Between(
            this.sprite.x, this.sprite.y,
            player.sprite.x, player.sprite.y
        );

        if (distance < 18) { // Collision threshold
            if (this.mode === 'frightened') {
                this.onEaten(player);
            } else if (!player.isInvulnerable) {
                this.onPlayerCaught(player);
            }
        }
    }

    onEaten(player) {
        this.isEaten = true;
        this.setMode('returning');
        
        // Score and sound
        const scoreSystem = this.scene.scoreSystem;
        const soundManager = this.scene.soundManager;
        
        scoreSystem?.scoreGhostEaten();
        soundManager?.playGhostEaten();
        
        // Visual effect
        this.createEatenEffect();
        
        console.log(`👻 ${this.config.color} ghost eaten!`);
    }

    onPlayerCaught(player) {
        if (player.isInvulnerable) return;
        
        player.die();
        console.log(`👻 ${this.config.color} ghost caught player!`);
    }

    createEatenEffect() {
        // Score popup effect
        const scoreText = this.scene.add.text(this.sprite.x, this.sprite.y - 20, '+200', {
            fontSize: '14px',
            fill: '#ffffff',
            fontFamily: 'Orbitron'
        }).setOrigin(0.5);

        this.scene.tweens.add({
            targets: scoreText,
            y: scoreText.y - 30,
            alpha: 0,
            duration: 1000,
            onComplete: () => scoreText.destroy()
        });
    }

    updateEatenState(deltaTime) {
        // Ghost is returning to spawn point
        this.updateVisualEffects(deltaTime);
    }

    // Event handlers
    onPowerPelletEaten() {
        if (this.mode !== 'returning' && this.mode !== 'exiting') {
            this.setMode('frightened');
        }
    }

    respawn() {
        this.sprite.setPosition(this.startX, this.startY);
        this.isEaten = false;
        this.isExitingHouse = true;
        this.exitTimer = 2000; // Wait 2 seconds before exiting again
        this.setMode('exiting');
        
        console.log(`👻 ${this.config.color} ghost respawned`);
    }

    // Getters
    getPosition() {
        return { x: this.sprite.x, y: this.sprite.y };
    }

    getBounds() {
        return this.sprite.getBounds();
    }

    getMode() {
        return this.mode;
    }

    isFrightened() {
        return this.mode === 'frightened';
    }

    // Cleanup
    destroy() {
        if (this.sprite) this.sprite.destroy();
        if (this.glowEffect) this.glowEffect.destroy();
        if (this.leftEye) this.leftEye.destroy();
        if (this.rightEye) this.rightEye.destroy();
        if (this.leftPupil) this.leftPupil.destroy();
        if (this.rightPupil) this.rightPupil.destroy();
        
        console.log(`👻 ${this.config.color} ghost destroyed`);
    }

    // Debug helpers
    debug() {
        console.log(`=== ${this.config.color.toUpperCase()} GHOST DEBUG ===`);
        console.log('Position:', this.sprite.x, this.sprite.y);
        console.log('Direction:', this.direction);
        console.log('Mode:', this.mode);
        console.log('Speed:', this.speed);
        console.log('Personality:', this.config.personality);
        console.log('Is Eaten:', this.isEaten);
        console.log('Exit Timer:', this.exitTimer);
        console.log('===================');
    }
}

// Export for use in other modules
window.Ghost = Ghost;