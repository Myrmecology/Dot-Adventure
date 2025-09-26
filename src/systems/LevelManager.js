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
        
        // Load level from JSON or create procedural level
        this.loadLevelData(levelNumber);
        
        console.log(`✅ Level ${levelNumber} generated with ${this.totalPellets} pellets`);
        return this.maze;
    }

    async loadLevelData(levelNumber) {
        try {
            // Try to load JSON level file
            const response = await fetch(`assets/levels/level${levelNumber}.json`);
            if (response.ok) {
                const levelData = await response.json();
                this.createLevelFromJSON(levelData);
            } else {
                // Fallback to procedural generation
                this.createProceduralLevel();
            }
        } catch (error) {
            console.warn(`Failed to load level ${levelNumber}, using procedural generation:`, error);
            this.createProceduralLevel();
        }
    }

    createLevelFromJSON(levelData) {
        console.log('📄 Loading level from JSON data');
        
        // Use layout from JSON
        this.maze = levelData.layout.map(row => [...row]);
        this.config.mazeWidth = levelData.width;
        this.config.mazeHeight = levelData.height;
        this.config.tileSize = levelData.tileSize || 32;
        
        // Find spawn points and count pellets
        this.parseLayoutData();
    }

    parseLayoutData() {
        this.totalPellets = 0;
        this.powerPellets = [];
        this.ghostSpawns = [];
        
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
                    // Replace player spawn with empty space
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
        
        console.log(`📊 Found player spawn at: ${this.playerSpawn.x}, ${this.playerSpawn.y}`);
        console.log(`📊 Found ${this.ghostSpawns.length} ghost spawns`);
        console.log(`📊 Found ${this.totalPellets} total pellets`);
    }

    createProceduralLevel() {
        // Fallback to original procedural generation
        this.createBaseMaze();
        this.placePellets();
        this.setSpawnPoints();
        this.applyLevelModifications();
    }

    createBaseMaze() {
        const width = this.config.mazeWidth;
        const height = this.config.mazeHeight;
        
        // Initialize maze with walls
        for (let y = 0; y < height; y++) {
            this.maze[y] = [];
            for (let x = 0; x < width; x++) {
                this.maze[y][x] = this.WALL;
            }
        }

        // Create classic Pac-Man style maze pattern
        this.createMazePattern();
        
        // Ensure maze is properly connected
        this.ensureConnectivity();
    }

    createMazePattern() {
        const width = this.config.mazeWidth;
        const height = this.config.mazeHeight;

        // Create corridors (simplified Pac-Man style layout)
        // Horizontal corridors
        for (let y = 1; y < height - 1; y += 2) {
            for (let x = 1; x < width - 1; x++) {
                if (y === 1 || y === height - 2 || y === Math.floor(height / 2)) {
                    this.maze[y][x] = this.EMPTY;
                }
            }
        }

        // Vertical corridors
        for (let x = 1; x < width - 1; x += 4) {
            for (let y = 1; y < height - 1; y++) {
                this.maze[y][x] = this.EMPTY;
            }
        }

        // Central area (ghost house)
        const centerX = Math.floor(width / 2);
        const centerY = Math.floor(height / 2);
        
        for (let y = centerY - 2; y <= centerY + 2; y++) {
            for (let x = centerX - 3; x <= centerX + 3; x++) {
                if (x >= 0 && x < width && y >= 0 && y < height) {
                    this.maze[y][x] = this.EMPTY;
                }
            }
        }

        // Side tunnels
        const tunnelY = Math.floor(height / 2);
        this.maze[tunnelY][0] = this.EMPTY;
        this.maze[tunnelY][width - 1] = this.EMPTY;
        
        // Connect tunnels
        for (let x = 0; x < width; x++) {
            this.maze[tunnelY][x] = this.EMPTY;
        }

        // Add some vertical connections
        for (let x = 3; x < width - 3; x += 6) {
            for (let y = 3; y < height - 3; y++) {
                if (this.maze[y - 1][x] === this.EMPTY || this.maze[y + 1][x] === this.EMPTY) {
                    this.maze[y][x] = this.EMPTY;
                }
            }
        }

        // Create corners and turns
        this.createCorners();
    }

    createCorners() {
        const width = this.config.mazeWidth;
        const height = this.config.mazeHeight;

        // Add corner patterns for more interesting maze
        const corners = [
            { x: 3, y: 3 },
            { x: width - 4, y: 3 },
            { x: 3, y: height - 4 },
            { x: width - 4, y: height - 4 }
        ];

        corners.forEach(corner => {
            // Create L-shaped corridors from corners
            for (let i = 0; i < 3; i++) {
                if (corner.x + i < width) this.maze[corner.y][corner.x + i] = this.EMPTY;
                if (corner.y + i < height) this.maze[corner.y + i][corner.x] = this.EMPTY;
            }
        });
    }

    ensureConnectivity() {
        // Simple connectivity check - ensure all empty spaces connect to center
        // This is a simplified version - a full implementation would use flood fill
        const centerX = Math.floor(this.config.mazeWidth / 2);
        const centerY = Math.floor(this.config.mazeHeight / 2);

        // Make sure there's always a path from edges to center
        for (let y = 1; y < this.config.mazeHeight - 1; y += 2) {
            let hasConnection = false;
            for (let x = 1; x < this.config.mazeWidth - 1; x++) {
                if (this.maze[y][x] === this.EMPTY) {
                    hasConnection = true;
                    break;
                }
            }
            if (!hasConnection) {
                this.maze[y][centerX] = this.EMPTY;
            }
        }
    }

    placePellets() {
        this.totalPellets = 0;
        this.pelletCount = 0;

        // Place regular pellets in all empty spaces
        for (let y = 0; y < this.config.mazeHeight; y++) {
            for (let x = 0; x < this.config.mazeWidth; x++) {
                if (this.maze[y][x] === this.EMPTY) {
                    this.maze[y][x] = this.PELLET;
                    this.totalPellets++;
                }
            }
        }

        // Replace some pellets with power pellets
        this.placePowerPellets();
        
        console.log(`🔸 Placed ${this.totalPellets} pellets, ${this.powerPellets.length} power pellets`);
    }

    placePowerPellets() {
        const corners = [
            { x: 2, y: 3 },
            { x: this.config.mazeWidth - 3, y: 3 },
            { x: 2, y: this.config.mazeHeight - 4 },
            { x: this.config.mazeWidth - 3, y: this.config.mazeHeight - 4 }
        ];

        this.powerPellets = [];
        
        corners.forEach(corner => {
            if (this.maze[corner.y] && 
                this.maze[corner.y][corner.x] === this.PELLET) {
                this.maze[corner.y][corner.x] = this.POWER_PELLET;
                this.powerPellets.push({ x: corner.x, y: corner.y });
            }
        });
    }

    setSpawnPoints() {
        // Player spawn (bottom center)
        const playerX = Math.floor(this.config.mazeWidth / 2);
        const playerY = this.config.mazeHeight - 4;
        this.playerSpawn = { 
            x: playerX * this.config.tileSize + this.config.tileSize / 2,
            y: playerY * this.config.tileSize + this.config.tileSize / 2
        };

        // Clear pellet from player spawn
        if (this.maze[playerY] && this.maze[playerY][playerX] !== this.WALL) {
            this.maze[playerY][playerX] = this.EMPTY;
        }

        // Ghost spawns (center area)
        const centerX = Math.floor(this.config.mazeWidth / 2);
        const centerY = Math.floor(this.config.mazeHeight / 2);
        
        this.ghostSpawns = [
            { x: centerX, y: centerY, color: 'red' },
            { x: centerX - 1, y: centerY, color: 'pink' },
            { x: centerX + 1, y: centerY, color: 'cyan' },
            { x: centerX, y: centerY + 1, color: 'orange' }
        ];

        // Convert to pixel coordinates
        this.ghostSpawns = this.ghostSpawns.map(spawn => ({
            ...spawn,
            x: spawn.x * this.config.tileSize + this.config.tileSize / 2,
            y: spawn.y * this.config.tileSize + this.config.tileSize / 2
        }));
    }

    applyLevelModifications() {
        // Apply progressive difficulty changes based on level
        const difficulty = Math.min(this.currentLevel, 10);

        // Remove some pellets on higher levels (makes it harder)
        if (this.currentLevel > 3) {
            this.removeRandomPellets(Math.floor(this.totalPellets * 0.1 * (difficulty - 3)));
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
    }

    addMazeComplexity() {
        // Add some additional walls to make navigation more challenging
        const additions = Math.min(this.currentLevel - 5, 15);
        
        for (let i = 0; i < additions; i++) {
            const x = Math.floor(Math.random() * (this.config.mazeWidth - 2)) + 1;
            const y = Math.floor(Math.random() * (this.config.mazeHeight - 2)) + 1;

            // Only add walls in empty spaces that won't block critical paths
            if (this.maze[y][x] === this.EMPTY && !this.isSpawnArea(x, y)) {
                this.maze[y][x] = this.WALL;
            }
        }
    }

    isSpawnArea(x, y) {
        // Check if position is near spawn points
        const playerSpawnGrid = {
            x: Math.floor(this.playerSpawn.x / this.config.tileSize),
            y: Math.floor(this.playerSpawn.y / this.config.tileSize)
        };

        const distToPlayer = Math.abs(x - playerSpawnGrid.x) + Math.abs(y - playerSpawnGrid.y);
        if (distToPlayer < 3) return true;

        // Check ghost spawn area
        const centerX = Math.floor(this.config.mazeWidth / 2);
        const centerY = Math.floor(this.config.mazeHeight / 2);
        const distToCenter = Math.abs(x - centerX) + Math.abs(y - centerY);
        
        return distToCenter < 4;
    }

    // Pellet management
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

    // Level completion check
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

    // Debug and development helpers
    debugMaze() {
        console.log('=== MAZE DEBUG ===');
        console.log('Level:', this.currentLevel);
        console.log('Pellets eaten:', this.pelletCount, '/', this.totalPellets);
        console.log('Player spawn:', this.playerSpawn);
        console.log('Ghost spawns:', this.ghostSpawns);
        console.log('Maze size:', this.config.mazeWidth, 'x', this.config.mazeHeight);
        
        // Print maze to console
        const symbols = { 0: ' ', 1: '█', 2: '·', 3: '●' };
        this.maze.forEach(row => {
            console.log(row.map(cell => symbols[cell] || '?').join(''));
        });
    }

    // Reset for new level
    resetLevel() {
        this.pelletCount = 0;
        console.log('🔄 Level reset');
    }
}

// Export for use in other modules
window.LevelManager = LevelManager;