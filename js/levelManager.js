class LevelManager {
    constructor() {
        this.currentLevel = 1;
        this.maxLevel = 10;
        this.isTransitioning = false;
        this.transitionTimer = 0;
        this.transitionDuration = 3000; // 3 seconds
        
        this.levelConfigs = this.generateLevelConfigs();
    }
    
    generateLevelConfigs() {
        const configs = [];
        
        for (let level = 1; level <= 10; level++) {
            if (level === 10) {
                // Boss level
                configs.push({
                    level: level,
                    enemyCount: 1,
                    enemyHealth: 1,
                    enemySpeed: 1,
                    shootDelay: 2000,
                    spawnDelay: 0,
                    maxEnemies: 1,
                    isBossLevel: true,
                    layout: this.generateLayout(level),
                    playerAmmo: 6 + ((level - 1) * 2)
                });
            } else {
                configs.push({
                    level: level,
                    enemyCount: Math.min(3 + Math.floor(level / 2), 8),
                    enemyHealth: level > 5 ? 2 : 1,
                    enemySpeed: 1 + (level * 0.1),
                    shootDelay: Math.max(1000, 3000 - (level * 200)),
                    spawnDelay: Math.max(1500, 4000 - (level * 250)),
                    maxEnemies: Math.min(2 + Math.floor(level / 3), 4),
                    isBossLevel: false,
                    layout: this.generateLayout(level),
                    playerAmmo: 6 + ((level - 1) * 2)
                });
            }
        }
        
        return configs;
    }
    
    generateLayout(level) {
        const layouts = [
            // Level 1 - Simple
            [
                { x: 300, y: 450, width: 100, height: 80 },
                { x: 600, y: 400, width: 120, height: 100 },
                { x: 800, y: 430, width: 110, height: 90 }
            ],
            // Level 2 - More spread
            [
                { x: 200, y: 200, width: 90, height: 70 },
                { x: 450, y: 450, width: 100, height: 80 },
                { x: 750, y: 300, width: 110, height: 90 },
                { x: 600, y: 150, width: 100, height: 80 }
            ],
            // Level 3 - Zigzag
            [
                { x: 250, y: 400, width: 95, height: 75 },
                { x: 500, y: 200, width: 100, height: 80 },
                { x: 750, y: 450, width: 105, height: 85 },
                { x: 400, y: 350, width: 90, height: 70 }
            ],
            // Level 4 - Cross formation
            [
                { x: 300, y: 300, width: 100, height: 80 },
                { x: 600, y: 300, width: 100, height: 80 },
                { x: 450, y: 150, width: 100, height: 80 },
                { x: 450, y: 450, width: 100, height: 80 },
                { x: 750, y: 200, width: 90, height: 70 }
            ],
            // Level 5 - Dense
            [
                { x: 200, y: 350, width: 80, height: 60 },
                { x: 350, y: 200, width: 85, height: 65 },
                { x: 500, y: 400, width: 90, height: 70 },
                { x: 650, y: 250, width: 85, height: 65 },
                { x: 800, y: 380, width: 90, height: 70 },
                { x: 420, y: 320, width: 80, height: 60 }
            ],
            // Level 6 - Corridor
            [
                { x: 200, y: 150, width: 100, height: 80 },
                { x: 200, y: 400, width: 100, height: 80 },
                { x: 500, y: 150, width: 100, height: 80 },
                { x: 500, y: 400, width: 100, height: 80 },
                { x: 800, y: 275, width: 100, height: 80 }
            ],
            // Level 7 - Maze-like
            [
                { x: 180, y: 200, width: 80, height: 60 },
                { x: 320, y: 350, width: 85, height: 65 },
                { x: 480, y: 180, width: 90, height: 70 },
                { x: 620, y: 380, width: 85, height: 65 },
                { x: 750, y: 220, width: 90, height: 70 },
                { x: 400, y: 450, width: 100, height: 80 },
                { x: 650, y: 120, width: 80, height: 60 }
            ],
            // Level 8 - Scattered
            [
                { x: 150, y: 300, width: 90, height: 70 },
                { x: 300, y: 180, width: 85, height: 65 },
                { x: 450, y: 420, width: 95, height: 75 },
                { x: 600, y: 220, width: 90, height: 70 },
                { x: 750, y: 350, width: 85, height: 65 },
                { x: 380, y: 300, width: 80, height: 60 },
                { x: 550, y: 380, width: 90, height: 70 },
                { x: 220, y: 450, width: 85, height: 65 }
            ],
            // Level 9 - Final defense
            [
                { x: 200, y: 250, width: 100, height: 80 },
                { x: 400, y: 150, width: 95, height: 75 },
                { x: 600, y: 350, width: 105, height: 85 },
                { x: 350, y: 400, width: 90, height: 70 },
                { x: 750, y: 200, width: 100, height: 80 },
                { x: 500, y: 450, width: 95, height: 75 },
                { x: 800, y: 400, width: 90, height: 70 },
                { x: 250, y: 380, width: 85, height: 65 }
            ],
            // Level 10 - Boss arena
            [
                { x: 200, y: 200, width: 120, height: 100 },
                { x: 700, y: 200, width: 120, height: 100 },
                { x: 200, y: 400, width: 120, height: 100 },
                { x: 700, y: 400, width: 120, height: 100 },
                { x: 450, y: 150, width: 100, height: 80 }
            ]
        ];
        
        return layouts[Math.min(level - 1, layouts.length - 1)];
    }
    
    getCurrentConfig() {
        return this.levelConfigs[this.currentLevel - 1];
    }
    
    startTransition() {
        this.isTransitioning = true;
        this.transitionTimer = 0;
        
        document.getElementById('levelTransition').style.display = 'block';
        document.getElementById('transitionTitle').textContent = 
            this.currentLevel < this.maxLevel ? 'LEVEL COMPLETE!' : 'FINAL LEVEL!';
        document.getElementById('transitionText').textContent = 
            this.currentLevel < this.maxLevel ? 
                `Preparing Level ${this.currentLevel + 1}...` : 
                'Preparing Boss Battle...';
    }
    
    updateTransition(deltaTime) {
        if (!this.isTransitioning) return false;
        
        this.transitionTimer += deltaTime;
        const progress = (this.transitionTimer / this.transitionDuration) * 100;
        document.getElementById('progressFill').style.width = Math.min(progress, 100) + '%';
        
        if (this.transitionTimer >= this.transitionDuration) {
            this.isTransitioning = false;
            document.getElementById('levelTransition').style.display = 'none';
            this.currentLevel++;
            return true; // Level changed
        }
        
        return false;
    }
    
    reset() {
        this.currentLevel = 1;
        this.isTransitioning = false;
        this.transitionTimer = 0;
        document.getElementById('levelTransition').style.display = 'none';
    }
}
