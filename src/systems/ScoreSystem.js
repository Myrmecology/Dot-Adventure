// ===== DOT ADVENTURE - SCORE SYSTEM =====

class ScoreSystem {
    constructor(scene) {
        this.scene = scene;
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.multiplier = 1;
        this.combo = 0;
        this.comboTimer = 0;
        this.maxCombo = 0;
        
        // Score values
        this.scoreValues = {
            pellet: 10,
            powerPellet: 50,
            ghost: 200,
            bonus: 100,
            levelComplete: 1000,
            perfectLevel: 5000,
            comboBonus: 25
        };

        // Achievements tracking
        this.achievements = {
            pelletsMaster: false,
            ghostHunter: false,
            speedRunner: false,
            survivor: false,
            comboKing: false
        };

        this.statistics = {
            totalPellets: 0,
            totalGhosts: 0,
            totalLevels: 0,
            bestCombo: 0,
            playTime: 0,
            startTime: 0
        };

        console.log('📊 ScoreSystem initialized');
    }

    // Initialize the score system for a new game
    initialize() {
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.multiplier = 1;
        this.combo = 0;
        this.comboTimer = 0;
        this.maxCombo = 0;
        
        // Reset achievements for new game
        Object.keys(this.achievements).forEach(key => {
            this.achievements[key] = false;
        });

        this.statistics.startTime = Date.now();
        this.updateRegistryValues();
        console.log('🎯 ScoreSystem reset for new game');
    }

    // Update the global registry with current values
    updateRegistryValues() {
        if (this.scene.registry) {
            this.scene.registry.set('score', this.score);
            this.scene.registry.set('lives', this.lives);
            this.scene.registry.set('level', this.level);
        }
    }

    // Add score with combo system
    addScore(points, type = 'basic') {
        const basePoints = points * this.multiplier;
        let totalPoints = basePoints;

        // Apply combo bonus for certain types
        if (type === 'pellet' || type === 'ghost') {
            this.combo++;
            this.comboTimer = 300; // 5 seconds at 60fps
            
            if (this.combo > 1) {
                const comboBonus = Math.floor(this.combo * this.scoreValues.comboBonus);
                totalPoints += comboBonus;
                
                // Show combo text effect
                this.showComboEffect(this.combo, comboBonus);
            }
        }

        this.score += totalPoints;
        this.updateRegistryValues();
        
        // Check for achievements
        this.checkAchievements(type);
        
        // Show score popup
        this.showScorePopup(totalPoints, type);
        
        console.log(`💯 Added ${totalPoints} points (${type}). Total: ${this.score}`);
        return totalPoints;
    }

    // Specific scoring methods
    scorePelletEaten() {
        this.statistics.totalPellets++;
        return this.addScore(this.scoreValues.pellet, 'pellet');
    }

    scorePowerPelletEaten() {
        this.statistics.totalPellets++;
        return this.addScore(this.scoreValues.powerPellet, 'power');
    }

    scoreGhostEaten() {
        this.statistics.totalGhosts++;
        // Ghost score increases with each ghost eaten in sequence
        const ghostScore = this.scoreValues.ghost * Math.pow(2, Math.min(3, this.combo));
        return this.addScore(ghostScore, 'ghost');
    }

    scoreLevelComplete(perfect = false) {
        this.statistics.totalLevels++;
        this.level++;
        this.multiplier += 0.1; // Increase multiplier each level
        
        let levelScore = this.scoreValues.levelComplete;
        if (perfect) {
            levelScore += this.scoreValues.perfectLevel;
            this.achievements.pelletsMaster = true;
        }
        
        this.updateRegistryValues();
        return this.addScore(levelScore, 'level');
    }

    // Life management
    loseLife() {
        this.lives = Math.max(0, this.lives - 1);
        this.combo = 0; // Reset combo on death
        this.comboTimer = 0;
        this.updateRegistryValues();
        
        console.log(`💔 Life lost. Lives remaining: ${this.lives}`);
        return this.lives;
    }

    gainLife() {
        this.lives++;
        this.updateRegistryValues();
        console.log(`❤️ Extra life gained! Lives: ${this.lives}`);
        return this.lives;
    }

    // Combo system management
    updateCombo(deltaTime) {
        if (this.comboTimer > 0) {
            this.comboTimer -= deltaTime;
            if (this.comboTimer <= 0) {
                if (this.combo > this.maxCombo) {
                    this.maxCombo = this.combo;
                    this.statistics.bestCombo = this.maxCombo;
                }
                this.combo = 0;
            }
        }
    }

    // Visual effects
    showScorePopup(points, type) {
        if (!this.scene || !this.scene.add) return;

        // Create floating score text
        const color = this.getScoreColor(type);
        const text = this.scene.add.text(0, 0, `+${points}`, {
            fontSize: '16px',
            fill: color,
            fontFamily: 'Orbitron',
            stroke: '#000',
            strokeThickness: 2
        });

        // Position near player or center
        const x = this.scene.cameras.main.centerX + (Math.random() - 0.5) * 100;
        const y = this.scene.cameras.main.centerY - 50;
        text.setPosition(x, y);

        // Animate the popup
        this.scene.tweens.add({
            targets: text,
            y: y - 60,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => {
                text.destroy();
            }
        });
    }

    showComboEffect(comboCount, bonus) {
        if (!this.scene || !this.scene.add) return;

        const text = this.scene.add.text(
            this.scene.cameras.main.centerX,
            this.scene.cameras.main.centerY - 100,
            `${comboCount}x COMBO!\n+${bonus}`,
            {
                fontSize: '20px',
                fill: '#ffff00',
                fontFamily: 'Orbitron',
                align: 'center',
                stroke: '#ff8800',
                strokeThickness: 3
            }
        ).setOrigin(0.5);

        // Pulse effect
        this.scene.tweens.add({
            targets: text,
            scaleX: 1.3,
            scaleY: 1.3,
            duration: 200,
            yoyo: true,
            onComplete: () => {
                this.scene.tweens.add({
                    targets: text,
                    alpha: 0,
                    y: text.y - 40,
                    duration: 800,
                    onComplete: () => text.destroy()
                });
            }
        });
    }

    getScoreColor(type) {
        const colors = {
            pellet: '#ffff00',
            power: '#ff8800',
            ghost: '#ff0080',
            level: '#00ff41',
            bonus: '#80ff80'
        };
        return colors[type] || '#ffffff';
    }

    // Achievement system
    checkAchievements(type) {
        // Ghost Hunter: Eat 50 ghosts
        if (type === 'ghost' && this.statistics.totalGhosts >= 50) {
            this.unlockAchievement('ghostHunter', 'Ghost Hunter Unlocked!');
        }

        // Combo King: Get 10+ combo
        if (this.combo >= 10) {
            this.unlockAchievement('comboKing', 'Combo King Unlocked!');
        }

        // Survivor: Reach level 5
        if (this.level >= 5) {
            this.unlockAchievement('survivor', 'Survivor Unlocked!');
        }

        // Check score milestones for extra lives
        this.checkScoreMilestones();
    }

    unlockAchievement(achievement, message) {
        if (!this.achievements[achievement]) {
            this.achievements[achievement] = true;
            this.showAchievementNotification(message);
            console.log(`🏆 Achievement unlocked: ${message}`);
        }
    }

    showAchievementNotification(message) {
        if (!this.scene || !this.scene.add) return;

        const notification = this.scene.add.text(
            this.scene.cameras.main.centerX,
            50,
            message,
            {
                fontSize: '18px',
                fill: '#ffd700',
                fontFamily: 'Orbitron',
                backgroundColor: '#000000',
                padding: { x: 20, y: 10 }
            }
        ).setOrigin(0.5);

        // Slide in and out
        notification.setAlpha(0);
        this.scene.tweens.add({
            targets: notification,
            alpha: 1,
            y: 80,
            duration: 500,
            ease: 'Back.out',
            onComplete: () => {
                this.scene.time.delayedCall(3000, () => {
                    this.scene.tweens.add({
                        targets: notification,
                        alpha: 0,
                        y: 30,
                        duration: 500,
                        onComplete: () => notification.destroy()
                    });
                });
            }
        });
    }

    checkScoreMilestones() {
        // Award extra life every 10,000 points
        const milestones = [10000, 30000, 50000, 100000];
        milestones.forEach(milestone => {
            if (this.score >= milestone && !this.hasReachedMilestone(milestone)) {
                this.gainLife();
                this.markMilestone(milestone);
                this.showAchievementNotification(`Extra Life! ${milestone.toLocaleString()} points reached!`);
            }
        });
    }

    hasReachedMilestone(milestone) {
        return this.statistics[`milestone_${milestone}`] || false;
    }

    markMilestone(milestone) {
        this.statistics[`milestone_${milestone}`] = true;
    }

    // Getters
    getScore() {
        return this.score;
    }

    getLives() {
        return this.lives;
    }

    getLevel() {
        return this.level;
    }

    getCombo() {
        return this.combo;
    }

    getStatistics() {
        this.statistics.playTime = Date.now() - this.statistics.startTime;
        return { ...this.statistics };
    }

    getAchievements() {
        return { ...this.achievements };
    }

    // Game state queries
    isGameOver() {
        return this.lives <= 0;
    }

    getFormattedScore() {
        return this.score.toLocaleString();
    }

    getScoreForLevel() {
        return Math.floor(this.score / 1000) * 1000; // Round down to nearest thousand
    }

    // Save/Load high scores (localStorage)
    saveHighScore() {
        try {
            const highScores = this.getHighScores();
            highScores.push({
                score: this.score,
                level: this.level,
                date: new Date().toISOString(),
                achievements: this.getAchievements(),
                statistics: this.getStatistics()
            });
            
            // Keep only top 10 scores
            highScores.sort((a, b) => b.score - a.score);
            const topScores = highScores.slice(0, 10);
            
            localStorage.setItem('dotAdventure_highScores', JSON.stringify(topScores));
            console.log('💾 High score saved');
            return topScores;
        } catch (error) {
            console.warn('Failed to save high score:', error);
            return [];
        }
    }

    getHighScores() {
        try {
            const stored = localStorage.getItem('dotAdventure_highScores');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.warn('Failed to load high scores:', error);
            return [];
        }
    }

    isNewHighScore() {
        const highScores = this.getHighScores();
        return highScores.length < 10 || this.score > (highScores[9]?.score || 0);
    }
}

// Export for use in other modules
window.ScoreSystem = ScoreSystem;