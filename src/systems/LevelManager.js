// ===== DOT ADVENTURE - LEVEL MANAGER SYSTEM =====

class LevelManager {
    constructor(scene) {
        this.scene = scene;
        this.currentLevel = 1;
        this.maze = [];
        this.pelletCount = 0;
        this.totalPellets = 0;
        this.powerPellets = [];
        this.ghostSpawns = [];
        this.playerSpawn = { x: 0, y: 0 };
        
        // Level configuration
        this.config = {
            tileSize: 32,
            mazeWidth: 25,
            mazeHeight: 23,
            pelletsPerLevel: 200,
            powerPelletsPerLevel: 4
        };

        // Embedded level data
        this.levelLayouts = this.createLevelLayouts();

        // Maze symbols
        this.WALL = 1;
        this.PELLET = 2;
        this.POWER_PELLET = 3;
        this.EMPTY = 0;
        this.PLAYER_SPAWN = 4;
        this.GHOST_SPAWN = 5;

        console.log('🗺️ LevelManager initialized');
    }

    createLevelLayouts() {
        // Simple, working level layouts
        return {
            1: [
                [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
                [1,2,2,2,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,2,2,1],
                [1,3,1,1,1,2,1,1,1,1,1,2,1,2,1,1,1,1,1,2,1,1,1,3,1],
                [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
                [1,2,1,1,1,2,1,2,1,1,1,1,1,1,1,1,1,2,1,2,1,1,1,2,1],
                [1,2,2,2,2,2,1,2,2,2,2,2,1,2,2,2,2,2,1,2,2,2,2,2,1],
                [1,1,1,1,1,2,1,1,1,1,1,0,1,0,1,1,1,1,1,2,1,1,1,1,1],
                [1,1,1,1,1,2,1,0,0,0,0,0,0,0,0,0,0,0,1,2,1,1,1,1,1],
                [1,1,1,1,1,2,1,0,1,1,0,0,5,0,0,1,1,0,1,2,1,1,1,1,1],
                [0,0,0,0,0,2,0,0,1,0,0,0,0,0,0,0,1,0,0,2,0,0,0,0,0],
                [1,1,1,1,1,2,1,0,1,0,0,0,0,0,0,0,1,0,1,2,1,1,1,1,1],
                [1,1,1,1,1,2,1,0,1,1,1,1,1,1,1,1,1,0,1,2,1,1,1,1,1],
                [1,1,1,1,1,2,1,0,0,0,0,0,0,0,0,0,0,0,1,2,1,1,1,1,1],
                [1,1,1,1,1,2,1,1,1,1,1,0,1,0,1,1,1,1,1,2,1,1,1,1,1],
                [1,2,2,2,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,2,2,1],
                [1,2,1,1,1,2,1,1,1,1,1,2,1,2,1,1,1,1,1,2,1,1,1,2,1],
                [1,3,2,2,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,2,2,3,1],
                [1,1,1,2,1,2,1,2,1,1,1,1,1,1,1,1,1,2,1,2,1,2,1,1,1],
                [1,2,2,2,2,2,1,2,2,2,2,2,1,2,2,2,2,2,1,2,2,2,2,2,1],
                [1,2,1,1,1,1,1,1,1,1,1,2,1,2,1,1,1,1,1,1,1,1,1,2,1],
                [1,2,2,2,2,2,2,2,2,2,2,2,4,2,2,2,2,2,2,2,2,2,2,2,1],
                [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
            ],
            2: [
                [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
                [1,2,2,2,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,2,2,2,1],
                [1,3,1,2,1,2,1,1,2,1,1,1,1,1,1,1,2,1,1,2,1,2,1,3,1],
                [1,2,1,2,2,2,1,2,2,2,2,2,1,2,2,2,2,2,1,2,2,2,1,2,1],
                [1,2,1,1,1,2,1,2,1,1,1,2,1,2,1,1,1,2,1,2,1,1,1,2,1],
                [1,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,1],
                [1,1,1,2,1,1,1,2,1,2,1,1,1,1,1,2,1,2,1,1,1,2,1,1,1],
                [1,2,2,2,2,2,2,2,1,2,1,0,0,0,1,2,1,2,2,2,2,2,2,2,1],
                [1,2,1,1,1,1,1,2,1,2,1,0,5,0,1,2,1,2,1,1,1,1,1,2,1],
                [0,2,1,2,2,2,2,2,2,2,1,0,0,0,1,2,2,2,2,2,2,2,1,2,0],
                [1,2,1,2,1,1,1,2,1,2,1,1,1,1,1,2,1,2,1,1,1,2,1,2,1],
                [1,2,1,2,2,2,1,2,1,2,2,2,2,2,2,2,1,2,1,2,2,2,1,2,1],
                [1,2,1,1,1,2,1,2,1,1,1,2,1,2,1,1,1,2,1,2,1,1,1,2,1],
                [1,2,2,2,2,2,1,2,2,2,2,2,1,2,2,2,2,2,1,2,2,2,2,2,1],
                [1,1,1,2,1,1,1,1,1,2,1,2,1,2,1,2,1,1,1,1,1,2,1,1,1],
                [1,2,2,2,1,2,2,2,2,2,1,2,2,2,1,2,2,2,2,2,1,2,2,2,1],
                [1,2,1,2,1,2,1,1,1,2,1,2,4,2,1,2,1,1,1,2,1,2,1,2,1],
                [1,2,1,2,2,2,1,2,2,2,2,2,2,2,2,2,2,2,1,2,2,2,1,2,1],
                [1,2,1,1,1,1,1,2,1,1,1,1,1,1,1,1,1,2,1,1,1,1,1,2,1],
                [1,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,3,1],
                [1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1],
                [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
            ],
            3: [
                [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
                [1,3,2,2,2,1,2,2,2,1,2,2,2,2,2,1,2,2,2,1,2,2,2,3,1],
                [1,2,1,1,2,1,2,1,2,1,2,1,1,1,2,1,2,1,2,1,2,1,1,2,1],
                [1,2,1,2,2,2,2,1,2,2,2,1,2,1,2,2,2,1,2,2,2,2,1,2,1],
                [1,2,1,2,1,1,2,1,1,1,2,1,2,1,2,1,1,1,2,1,1,2,1,2,1],
                [1,2,2,2,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,2,2,2,1],
                [1,1,1,2,1,2,1,1,1,2,1,1,1,1,1,2,1,1,1,2,1,2,1,1,1],
                [1,2,2,2,1,2,1,2,2,2,1,0,0,0,1,2,2,2,1,2,1,2,2,2,1],
                [1,2,1,2,1,2,1,2,1,2,1,0,5,0,1,2,1,2,1,2,1,2,1,2,1],
                [0,2,1,2,2,2,2,2,1,2,0,0,0,0,0,2,1,2,2,2,2,2,1,2,0],
                [1,2,1,2,1,2,1,2,1,2,1,1,1,1,1,2,1,2,1,2,1,2,1,2,1],
                [1,2,2,2,1,2,1,2,2,2,2,2,2,2,2,2,2,2,1,2,1,2,2,2,1],
                [1,1,1,2,1,2,1,1,1,1,1,2,1,2,1,1,1,1,1,2,1,2,1,1,1],
                [1,2,2,2,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,2,2,1],
                [1,2,1,1,1,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,1,1,1,2,1],
                [1,2,1,2,2,2,2,2,1,2,2,2,2,2,2,2,1,2,2,2,2,2,1,2,1],
                [1,2,1,2,1,1,1,2,1,2,1,1,4,1,1,2,1,2,1,1,1,2,1,2,1],
                [1,2,1,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,1,2,1],
                [1,2,1,1,1,2,1,1,1,2,1,2,2,2,1,2,1,1,1,2,1,1,1,2,1],
                [1,2,2,2,2,2,2,2,2,2,1,2,2,2,1,2,2,2,2,2,2,2,2,2,1],
                [1,3,1,1,1,1,1,1,1,1,1,1,2,1,1,1,1,1,1,1,1,1,1,3,1],
                [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
            ]
        };
    }

    // Generate a new level
    generateLevel(levelNumber) {
        console.log(`🏗️ Generating level ${levelNumber}...`);
        
        this.currentLevel = levelNumber;
        this.maze = [];
        this.pelletCount = 0;
        this.powerPellets = [];
        this.ghostSpawns = [];
        
        // Load level from embedded data
        this.loadLevelLayout(levelNumber);
        
        console.log(`✅ Level ${levelNumber} generated with ${this.totalPellets} pellets`);
        console.log(`📍 Player spawn: ${this.playerSpawn.x}, ${this.playerSpawn.y}`);
        return this.maze;
    }

    loadLevelLayout(levelNumber) {
        // Use modulo to cycle through available levels
        const availableLevels = Object.keys(this.levelLayouts);
        const levelKey = availableLevels[(levelNumber - 1) % availableLevels.length];
        const layout = this.levelLayouts[levelKey];
        
        console.log(`📄 Loading level layout ${levelKey} for level ${levelNumber}`);
        
        // Copy the layout
        this.maze = layout.map(row => [...row]);
        this.config.mazeHeight = this.maze.length;
        this.config.mazeWidth = this.maze[0].length;
        
        // Parse the layout for spawn points and pellets
        this.parseLayoutData();
    }

    parseLayoutData() {
        this.totalPellets = 0;
        this.powerPellets = [];
        this.ghostSpawns = [];
        this.playerSpawn = null;
        
        for (let y = 0; y < this.maze.length; y++) {
            for (let x = 0; x < this.maze[y].length; x++) {
                const cell = this.maze[y][x];
                
                if (cell === 2) { // Normal pellet
                    this.totalPellets++;
                } else if (cell === 3) { // Power pellet
                    this.totalPellets++;
                    this.powerPellets.push({ x, y });
                } else if (cell === 4) { // Player spawn
                    this.playerSpawn = {
                        x: x * this.config.tileSize + this.config.tileSize / 2,
                        y: y * this.config.tileSize + this.config.tileSize / 2
                    };
                    // Replace player spawn with empty space so player can move
                    this.maze[y][x] = 0;
                } else if (cell === 5) { // Ghost spawn
                    const colors = ['red', 'pink', 'cyan', 'orange'];
                    this.ghostSpawns.push({
                        x: x * this.config.tileSize + this.config.tileSize / 2,
                        y: y * this.config.tileSize + this.config.tileSize / 2,
                        color: colors[this.ghostSpawns.length % colors.length]
                    });
                    // Replace ghost spawn with empty space
                    this.maze[y][x] = 0;
                }
            }
        }
        
        // Fallback spawn if not found in layout
        if (!this.playerSpawn) {
            console.warn('⚠️ No player spawn found in layout, using fallback position');
            this.playerSpawn = {
                x: 12 * this.config.tileSize + this.config.tileSize / 2,
                y: 20 * this.config.tileSize + this.config.tileSize / 2
            };
            // Ensure spawn area is clear
            const gridX = Math.floor((this.playerSpawn.x - this.config.tileSize / 2) / this.config.tileSize);
            const gridY = Math.floor((this.playerSpawn.y - this.config.tileSize / 2) / this.config.tileSize);
            if (this.maze[gridY] && this.maze[gridY][gridX]) {
                this.maze[gridY][gridX] = 0;
            }
        }
        
        // Ensure at least one ghost spawn
        if (this.ghostSpawns.length === 0) {
            console.warn('⚠️ No ghost spawns found in layout, adding fallback');
            this.ghostSpawns.push({
                x: 12 * this.config.tileSize + this.config.tileSize / 2,
                y: 8 * this.config.tileSize + this.config.tileSize / 2,
                color: 'red'
            });
        }
        
        console.log(`📊 Player spawn: (${this.playerSpawn.x}, ${this.playerSpawn.y})`);
        console.log(`📊 Ghost spawns: ${this.ghostSpawns.length}`);
        console.log(`📊 Total pellets: ${this.totalPellets}`);
    }

    // Pellet management (These methods are used by Player.js for backward compatibility)
    eatPellet(x, y) {
        const gridX = Math.floor(x / this.config.tileSize);
        const gridY = Math.floor(y / this.config.tileSize);

        if (this.maze[gridY] && this.maze[gridY][gridX] === this.PELLET) {
            this.maze[gridY][gridX] = this.EMPTY;
            this.pelletCount++;
            return 'pellet';
        }

        if (this.maze[gridY] && this.maze[gridY][gridX] === this.POWER_PELLET) {
            this.maze[gridY][gridX] = this.EMPTY;
            this.pelletCount++;
            return 'powerPellet';
        }

        return null;
    }

    isWall(x, y) {
        const gridX = Math.floor(x / this.config.tileSize);
        const gridY = Math.floor(y / this.config.tileSize);

        if (gridY < 0 || gridY >= this.config.mazeHeight || 
            gridX < 0 || gridX >= this.config.mazeWidth) {
            return true;
        }

        return this.maze[gridY][gridX] === this.WALL;
    }

    // Tunnel system (wraparound)
    checkTunnel(x, y) {
        const buffer = this.config.tileSize;
        
        if (x < -buffer) {
            return { x: (this.config.mazeWidth) * this.config.tileSize, y: y };
        }
        if (x > (this.config.mazeWidth) * this.config.tileSize + buffer) {
            return { x: 0, y: y };
        }
        
        return null;
    }

    // Level completion check (backward compatibility)
    isLevelComplete() {
        return this.pelletCount >= this.totalPellets;
    }

    getLevelProgress() {
        return this.totalPellets > 0 ? this.pelletCount / this.totalPellets : 0;
    }

    // Getters for game objects
    getMaze() {
        return this.maze;
    }

    getPlayerSpawn() {
        return this.playerSpawn;
    }

    getGhostSpawns() {
        return this.ghostSpawns;
    }

    getTileSize() {
        return this.config.tileSize;
    }

    getMazeWidth() {
        return this.config.mazeWidth;
    }

    getMazeHeight() {
        return this.config.mazeHeight;
    }

    getCurrentLevel() {
        return this.currentLevel;
    }

    getRemainingPellets() {
        return this.totalPellets - this.pelletCount;
    }

    getTotalPellets() {
        return this.totalPellets;
    }

    // Apply level-specific modifications for higher levels
    applyLevelModifications() {
        // Apply progressive difficulty changes based on level
        const difficulty = Math.min(this.currentLevel, 10);

        // Remove some pellets on higher levels (makes it harder)
        if (this.currentLevel > 3) {
            this.removeRandomPellets(Math.floor(this.totalPellets * 0.05 * (difficulty - 3)));
        }

        // Add maze complexity on higher levels
        if (this.currentLevel > 5) {
            this.addMazeComplexity();
        }
    }

    removeRandomPellets(count) {
        let removed = 0;
        const attempts = count * 3; // Prevent infinite loop

        for (let i = 0; i < attempts && removed < count; i++) {
            const x = Math.floor(Math.random() * this.config.mazeWidth);
            const y = Math.floor(Math.random() * this.config.mazeHeight);

            if (this.maze[y] && this.maze[y][x] === this.PELLET) {
                this.maze[y][x] = this.EMPTY;
                this.totalPellets--;
                removed++;
            }
        }
        
        console.log(`🔧 Removed ${removed} pellets for increased difficulty`);
    }

    addMazeComplexity() {
        // Add some additional walls to make navigation more challenging
        const additions = Math.min(this.currentLevel - 5, 10);
        
        for (let i = 0; i < additions; i++) {
            const x = Math.floor(Math.random() * (this.config.mazeWidth - 2)) + 1;
            const y = Math.floor(Math.random() * (this.config.mazeHeight - 2)) + 1;

            // Only add walls in empty spaces that won't block critical paths
            if (this.maze[y][x] === this.EMPTY && !this.isSpawnArea(x, y)) {
                this.maze[y][x] = this.WALL;
            }
        }
        
        console.log(`🔧 Added ${additions} wall complexity modifications`);
    }

    isSpawnArea(x, y) {
        // Check if position is near spawn points
        if (this.playerSpawn) {
            const playerSpawnGrid = {
                x: Math.floor(this.playerSpawn.x / this.config.tileSize),
                y: Math.floor(this.playerSpawn.y / this.config.tileSize)
            };

            const distToPlayer = Math.abs(x - playerSpawnGrid.x) + Math.abs(y - playerSpawnGrid.y);
            if (distToPlayer < 3) return true;
        }

        // Check ghost spawn area
        const centerX = Math.floor(this.config.mazeWidth / 2);
        const centerY = Math.floor(this.config.mazeHeight / 2);
        const distToCenter = Math.abs(x - centerX) + Math.abs(y - centerY);
        
        return distToCenter < 4;
    }

    // Debug and development helpers
    debugMaze() {
        console.log('=== MAZE DEBUG ===');
        console.log('Level:', this.currentLevel);
        console.log('Pellets eaten:', this.pelletCount, '/', this.totalPellets);
        console.log('Player spawn:', this.playerSpawn);
        console.log('Ghost spawns:', this.ghostSpawns);
        console.log('Maze size:', this.config.mazeWidth, 'x', this.config.mazeHeight);
        console.log('Tile size:', this.config.tileSize);
        
        // Show a simple representation of the maze
        console.log('Maze layout (first 12 rows):');
        const symbols = { 0: '.', 1: '█', 2: '·', 3: '●', 4: 'P', 5: 'G' };
        for (let y = 0; y < Math.min(12, this.maze.length); y++) {
            const row = this.maze[y].map(cell => symbols[cell] || '?').join('');
            console.log(`Row ${y.toString().padStart(2)}: ${row}`);
        }
        
        // Show player spawn in grid coordinates
        if (this.playerSpawn) {
            const playerGridX = Math.floor((this.playerSpawn.x - this.config.tileSize / 2) / this.config.tileSize);
            const playerGridY = Math.floor((this.playerSpawn.y - this.config.tileSize / 2) / this.config.tileSize);
            console.log(`Player grid position: (${playerGridX}, ${playerGridY})`);
            console.log(`Cell at player position: ${this.maze[playerGridY]?.[playerGridX]}`);
        }
        
        console.log('==================');
    }

    // Reset for new level
    resetLevel() {
        this.pelletCount = 0;
        console.log('🔄 Level reset');
    }

    // Get level statistics
    getLevelStats() {
        return {
            level: this.currentLevel,
            totalPellets: this.totalPellets,
            pelletCount: this.pelletCount,
            remaining: this.getRemainingPellets(),
            progress: this.getLevelProgress(),
            powerPellets: this.powerPellets.length,
            ghostSpawns: this.ghostSpawns.length,
            mazeSize: `${this.config.mazeWidth}x${this.config.mazeHeight}`,
            tileSize: this.config.tileSize
        };
    }
}

// Export for use in other modules
window.LevelManager = LevelManager;