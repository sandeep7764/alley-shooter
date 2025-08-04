class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.audioManager = new AudioManager();
        this.levelManager = new LevelManager();
        
        // Game state
        this.isRunning = false; // Start as false - game starts from menu
        this.isPaused = false;
        this.isGameStarted = false; // Track if game has been started
        this.lastTime = 0;
        this.score = 0;
        
        // Game objects
        this.player = new Player(100, 300);
        this.bullets = [];
        this.enemies = [];
        this.enemyBullets = [];
        this.boss = null;
        
        // Shield system for level 10
        this.shield = null;
        this.shieldDragOffset = { x: 0, y: 0 };
        this.isDraggingShield = false;
        
        // Level management
        this.enemiesSpawned = 0;
        this.enemiesKilled = 0;
        this.enemySpawnTimer = 0;
        
        // Background elements
        this.dumpsters = [];
        
        // Only setup event listeners - don't start game
        this.setupEventListeners();
        
        // Make game globally accessible
        window.game = this;
    }
    
    startGameFromMenu() {
        // Hide start menu and show game UI
        document.getElementById('startMenu').style.display = 'none';
        document.getElementById('gameUI').style.display = 'block';
        
        // Initialize game state
        this.isRunning = true;
        this.isGameStarted = true;
        this.setupLevel();
        this.gameLoop();
    }
    
    returnToMainMenu() {
        // Stop game
        this.isRunning = false;
        this.isGameStarted = false;
        
        // Reset game state
        this.resetGameState();
        
        // Hide all overlays and game UI
        document.getElementById('gameUI').style.display = 'none';
        document.getElementById('gameOver').style.display = 'none';
        document.getElementById('victory').style.display = 'none';
        document.getElementById('levelTransition').style.display = 'none';
        
        // Show start menu
        document.getElementById('startMenu').style.display = 'flex';
    }
    
    resetGameState() {
        // Reset all game variables to initial state
        this.score = 0;
        this.bullets = [];
        this.enemies = [];
        this.enemyBullets = [];
        this.boss = null;
        this.shield = null;
        this.isDraggingShield = false;
        this.enemiesSpawned = 0;
        this.enemiesKilled = 0;
        this.enemySpawnTimer = 0;
        
        // Reset level manager
        this.levelManager.reset();
        
        // Reset player
        this.player = new Player(100, 300);
        
        // Update UI
        document.getElementById('score').textContent = '0';
        this.player.updateHealthDisplay();
        this.player.updateAmmoDisplay();
    }
    
    setupEventListeners() {
        // Mouse shooting (only when game is running)
        this.canvas.addEventListener('click', (e) => {
            if (!this.isRunning || this.levelManager.isTransitioning) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Check if clicking on shield (don't shoot if so)
            if (this.shield && this.isPointInShield(x, y)) {
                return;
            }
            
            const bullet = this.player.shoot(x, y);
            if (bullet) {
                this.bullets.push(bullet);
            }
        });
        
        // Shield dragging
        this.canvas.addEventListener('mousedown', (e) => {
            if (!this.shield || !this.isRunning) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            if (this.isPointInShield(x, y)) {
                this.isDraggingShield = true;
                this.shieldDragOffset.x = x - this.shield.x;
                this.shieldDragOffset.y = y - this.shield.y;
                this.canvas.style.cursor = 'grabbing';
                e.preventDefault();
            }
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            if (!this.shield || !this.isRunning) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            if (this.isDraggingShield) {
                this.shield.x = Math.max(50, Math.min(480, x - this.shieldDragOffset.x));
                this.shield.y = Math.max(50, Math.min(470, y - this.shieldDragOffset.y));
            } else {
                this.canvas.style.cursor = this.isPointInShield(x, y) ? 'grab' : 'crosshair';
            }
        });
        
        this.canvas.addEventListener('mouseup', () => {
            this.isDraggingShield = false;
            if (this.shield && this.isRunning) {
                this.canvas.style.cursor = 'crosshair';
            }
        });
        
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (!this.isGameStarted) return; // Only work when game is started
            
            this.player.keys[e.code] = true;
            
            if (e.code === 'KeyR') {
                this.player.reload();
            }
            
            if (e.code === 'KeyP') {
                this.togglePause();
            }
            
            // Debug: Skip to level 10
            if (e.code === 'Digit0' && e.ctrlKey) {
                this.skipToLevel(10);
            }
        });
        
        document.addEventListener('keyup', (e) => {
            if (!this.isGameStarted) return;
            this.player.keys[e.code] = false;
        });
    }
    
    skipToLevel(targetLevel) {
        if (targetLevel < 1 || targetLevel > 10) return;
        
        this.levelManager.currentLevel = targetLevel;
        this.levelManager.isTransitioning = false;
        this.setupLevel();
        
        console.log(`Skipped to Level ${targetLevel}`);
    }
    
    setupLevel() {
        const config = this.levelManager.getCurrentConfig();
        
        // Reset level state
        this.enemies = [];
        this.enemyBullets = [];
        this.boss = null;
        this.shield = null;
        this.isDraggingShield = false;
        this.enemiesSpawned = 0;
        this.enemiesKilled = 0;
        this.enemySpawnTimer = 0;
        
        // Set up dumpsters for current level
        this.dumpsters = config.layout;
        
        // Update player ammo capacity
        this.player.setMaxAmmo(config.playerAmmo);
        
        // Create shield for level 10 (boss level)
        if (config.level === 10) {
            this.createShield();
        }
        
        // Update UI
        document.getElementById('currentLevel').textContent = config.level;
        document.getElementById('enemiesLeft').textContent = config.enemyCount;
        
        // Reset player position
        this.player.resetPosition();
        
        // Spawn initial enemies or boss
        if (config.isBossLevel) {
            this.spawnBoss();
        } else {
            this.spawnInitialEnemies();
        }
    }
    
    createShield() {
        this.shield = {
            x: 200,
            y: 250,
            width: 12,
            height: 80,
            health: 15,
            maxHealth: 15,
            hitFlash: 0,
            destroyed: false
        };
    }
    
    isPointInShield(x, y) {
        if (!this.shield || this.shield.destroyed) return false;
        
        return x >= this.shield.x && 
               x <= this.shield.x + this.shield.width &&
               y >= this.shield.y && 
               y <= this.shield.y + this.shield.height;
    }
    
    checkShieldCollision(bullet) {
        if (!this.shield || this.shield.destroyed) return false;
        
        return bullet.x + bullet.radius > this.shield.x &&
               bullet.x - bullet.radius < this.shield.x + this.shield.width &&
               bullet.y + bullet.radius > this.shield.y &&
               bullet.y - bullet.radius < this.shield.y + this.shield.height;
    }
    
    spawnInitialEnemies() {
        const config = this.levelManager.getCurrentConfig();
        const initialSpawns = Math.min(config.maxEnemies, Math.ceil(config.enemyCount / 2));
        
        for (let i = 0; i < initialSpawns; i++) {
            this.spawnEnemy();
        }
    }
    
    spawnEnemy() {
        const config = this.levelManager.getCurrentConfig();
        if (this.enemiesSpawned >= config.enemyCount || this.enemies.length >= config.maxEnemies) return;
        
        const availableSpots = this.dumpsters.filter(dumpster => {
            return !this.enemies.some(enemy => 
                Math.abs(enemy.coverX - (dumpster.x + dumpster.width + 10)) < 50
            );
        });
        
        if (availableSpots.length > 0) {
            const spot = availableSpots[Math.floor(Math.random() * availableSpots.length)];
            const enemy = new Enemy(
                spot.x + spot.width + 10,
                spot.y + spot.height - 60,
                config.level
            );
            this.enemies.push(enemy);
            this.enemiesSpawned++;
            
            document.getElementById('enemiesLeft').textContent = config.enemyCount - this.enemiesKilled;
        }
    }
    
    spawnBoss() {
        this.boss = new Boss(750, 250);
        document.getElementById('enemiesLeft').textContent = '1 (BOSS)';
    }
    
    update(deltaTime) {
        if (!this.isRunning || this.isPaused) return;
        
        // Handle level transition
        if (this.levelManager.updateTransition(deltaTime)) {
            this.setupLevel();
            return;
        }
        
        if (this.levelManager.isTransitioning) return;
        
        // Update shield
        if (this.shield && !this.shield.destroyed) {
            this.shield.hitFlash = Math.max(0, this.shield.hitFlash - deltaTime * 3);
            
            if (this.shield.health <= 0) {
                this.shield.destroyed = true;
            }
        }
        
        // Update player
        this.player.update(deltaTime);
        this.player.updateReloadDisplay();
        
        // Update bullets
        this.bullets = this.bullets.filter(bullet => {
            bullet.update();
            return bullet.active;
        });
        
        // Update enemies or boss
        const config = this.levelManager.getCurrentConfig();
        
        if (config.isBossLevel && this.boss) {
            const bossBullets = this.boss.update(deltaTime, this.player.x, this.player.y);
            if (bossBullets && bossBullets.length > 0) {
                this.enemyBullets.push(...bossBullets);
            }
        } else {
            // Update regular enemies
            this.enemies.forEach(enemy => {
                const bullet = enemy.update(deltaTime, this.player.x, this.player.y);
                if (bullet) {
                    this.enemyBullets.push(bullet);
                }
            });
            
            // Spawn new enemies
            this.enemySpawnTimer += deltaTime;
            if (this.enemySpawnTimer >= config.spawnDelay) {
                this.spawnEnemy();
                this.enemySpawnTimer = 0;
            }
        }
        
        // Update enemy bullets
        this.enemyBullets = this.enemyBullets.filter(bullet => {
            bullet.update();
            return bullet.active;
        });
        
        // Collision detection
        this.checkCollisions();
        
        // Check level completion
        this.checkLevelCompletion();
        
        // Check game over
        if (this.player.health <= 0) {
            this.gameOver();
        }
    }
    
    checkCollisions() {
        // Player bullets collision detection
        this.bullets.forEach((bullet, bulletIndex) => {
            let hitSomething = false;
            
            // Priority 1: Check shield collision first
            if (this.shield && !this.shield.destroyed && this.checkShieldCollision(bullet)) {
                bullet.active = false;
                hitSomething = true;
                
                this.shield.hitFlash = 1;
                this.shield.health = Math.max(0, this.shield.health - 1);
                
                if (this.audioManager) {
                    this.audioManager.play('shieldHit');
                }
                
                if (this.shield.health <= 0) {
                    this.shield.destroyed = true;
                }
            }
            
            // Priority 2: Check regular enemies
            if (!hitSomething) {
                this.enemies.forEach((enemy, enemyIndex) => {
                    if (bullet.checkCollision(enemy)) {
                        bullet.active = false;
                        hitSomething = true;
                        
                        const killed = enemy.takeDamage();
                        
                        if (killed) {
                            this.enemies.splice(enemyIndex, 1);
                            this.enemiesKilled++;
                            
                            let points = 10;
                            switch(enemy.type) {
                                case 1: points = 20; break;
                                case 2: points = 30; break;
                                default: points = 10; break;
                            }
                            this.addScore(points);
                            
                            const config = this.levelManager.getCurrentConfig();
                            document.getElementById('enemiesLeft').textContent = 
                                config.enemyCount - this.enemiesKilled;
                        }
                    }
                });
            }
            
            // Priority 3: Check boss
            if (this.boss && !hitSomething && bullet.checkCollision(this.boss)) {
                bullet.active = false;
                hitSomething = true;
                
                const killed = this.boss.takeDamage();
                
                if (killed) {
                    this.addScore(500);
                    this.boss = null;
                    document.getElementById('enemiesLeft').textContent = '0';
                }
            }
        });
        
        // Enemy bullets collision detection
        this.enemyBullets.forEach((bullet, bulletIndex) => {
            let hitSomething = false;
            
            // Priority 1: Check shield collision first
            if (this.shield && !this.shield.destroyed && this.checkShieldCollision(bullet)) {
                bullet.active = false;
                hitSomething = true;
                
                this.shield.hitFlash = 1;
                this.shield.health = Math.max(0, this.shield.health - 1);
                
                if (this.audioManager) {
                    this.audioManager.play('shieldHit');
                }
                
                if (this.shield.health <= 0) {
                    this.shield.destroyed = true;
                }
            }
            
            // Priority 2: Check player collision
            if (!hitSomething && bullet.checkPlayerCollision(this.player.x, this.player.y)) {
                bullet.active = false;
                hitSomething = true;
                
                const killed = this.player.takeDamage();
                
                if (killed) {
                    this.gameOver();
                }
            }
        });
        
        // Clean up inactive bullets
        this.bullets = this.bullets.filter(bullet => bullet.active);
        this.enemyBullets = this.enemyBullets.filter(bullet => bullet.active);
    }
    
    checkLevelCompletion() {
        const config = this.levelManager.getCurrentConfig();
        
        let levelComplete = false;
        
        if (config.isBossLevel) {
            levelComplete = !this.boss;
        } else {
            levelComplete = this.enemiesKilled >= config.enemyCount;
        }
        
        if (levelComplete) {
            if (this.levelManager.currentLevel >= this.levelManager.maxLevel) {
                this.victory();
            } else {
                this.player.heal(20);
                this.levelManager.startTransition();
            }
        }
    }
    
    addScore(points) {
        this.score += points;
        document.getElementById('score').textContent = this.score;
    }
    
    drawBackground() {
        const level = this.levelManager.currentLevel;
        const intensity = Math.min(level * 0.1, 1);
        
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, `rgba(44, 62, 80, ${1 - intensity * 0.3})`);
        gradient.addColorStop(1, `rgba(52, 73, 94, ${1 - intensity * 0.3})`);
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw dumpsters
        this.dumpsters.forEach((dumpster, index) => {
            const hue = (level * 20 + index * 30) % 360;
            
            this.ctx.fillStyle = `hsl(${hue}, 30%, 40%)`;
            this.ctx.fillRect(dumpster.x, dumpster.y, dumpster.width, dumpster.height);
            
            this.ctx.fillStyle = `hsl(${hue}, 25%, 35%)`;
            this.ctx.fillRect(dumpster.x - 5, dumpster.y - 10, dumpster.width + 10, 15);
            
            this.ctx.strokeStyle = '#2c3e50';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(dumpster.x, dumpster.y, dumpster.width, dumpster.height);
            
            this.ctx.fillStyle = `hsl(${hue}, 20%, 30%)`;
            this.ctx.fillRect(dumpster.x + dumpster.width - 20, dumpster.y + 20, 15, 5);
        });
        
        // Draw ground
        this.ctx.fillStyle = `hsl(${level * 15}, 20%, 25%)`;
        this.ctx.fillRect(0, this.canvas.height - 50, this.canvas.width, 50);
    }
    
    drawShield() {
        if (!this.shield || this.shield.destroyed) return;
        
        // Shield glow effect
        this.ctx.shadowColor = this.shield.hitFlash > 0 ? '#ff6b6b' : '#3498db';
        this.ctx.shadowBlur = this.shield.hitFlash > 0 ? 10 : 5;
        
        // Shield pole body
        if (this.shield.hitFlash > 0) {
            this.ctx.fillStyle = '#fff';
        } else {
            const gradient = this.ctx.createLinearGradient(
                this.shield.x, this.shield.y, 
                this.shield.x + this.shield.width, this.shield.y
            );
            gradient.addColorStop(0, '#2980b9');
            gradient.addColorStop(0.5, '#3498db');
            gradient.addColorStop(1, '#5dade2');
            this.ctx.fillStyle = gradient;
        }
        
        // Draw main pole
        this.ctx.fillRect(this.shield.x, this.shield.y, this.shield.width, this.shield.height);
        
        // Pole outline
        this.ctx.shadowBlur = 0;
        this.ctx.strokeStyle = '#2980b9';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(this.shield.x, this.shield.y, this.shield.width, this.shield.height);
        
        // Pole details
        this.ctx.strokeStyle = '#85c1e9';
        this.ctx.lineWidth = 1;
        
        for (let i = 1; i < 4; i++) {
            const y = this.shield.y + (this.shield.height / 4) * i;
            this.ctx.beginPath();
            this.ctx.moveTo(this.shield.x + 1, y);
            this.ctx.lineTo(this.shield.x + this.shield.width - 1, y);
            this.ctx.stroke();
        }
        
        // Health indicator
        const barWidth = Math.max(this.shield.width, 30);
        const barHeight = 3;
        const barX = this.shield.x - (barWidth - this.shield.width) / 2;
        const barY = this.shield.y - 10;
        
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(barX, barY, barWidth, barHeight);
        
        const healthPercentage = this.shield.health / this.shield.maxHealth;
        this.ctx.fillStyle = healthPercentage > 0.6 ? '#3498db' : 
                            healthPercentage > 0.3 ? '#f39c12' : '#e74c3c';
        this.ctx.fillRect(barX, barY, barWidth * healthPercentage, barHeight);
        
        // Shield label
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '8px Courier New';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('POLE', this.shield.x + this.shield.width/2, barY - 4);
        this.ctx.textAlign = 'left';
        
        // Drag indicator
        if (this.isDraggingShield) {
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
            this.ctx.lineWidth = 1;
            this.ctx.setLineDash([3, 3]);
            this.ctx.strokeRect(this.shield.x - 5, this.shield.y - 5, 
                              this.shield.width + 10, this.shield.height + 10);
            this.ctx.setLineDash([]);
        }
        
        // Pole base
        this.ctx.fillStyle = '#34495e';
        this.ctx.fillRect(this.shield.x - 2, this.shield.y + this.shield.height, 
                         this.shield.width + 4, 4);
        
        this.ctx.shadowBlur = 0;
    }
    
    draw() {
        if (!this.isRunning) return;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background
        this.drawBackground();
        
        // Draw game objects
        this.player.draw(this.ctx);
        
        this.bullets.forEach(bullet => bullet.draw(this.ctx));
        this.enemies.forEach(enemy => enemy.draw(this.ctx));
        if (this.boss) this.boss.draw(this.ctx);
        this.enemyBullets.forEach(bullet => bullet.draw(this.ctx));
        
        // Draw shield
        this.drawShield();
        
        // Draw pause overlay
        if (this.isPaused) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '48px Courier New';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.font = '16px Courier New';
            this.ctx.fillText('Press P to resume', this.canvas.width / 2, this.canvas.height / 2 + 40);
            this.ctx.textAlign = 'left';
        }
    }
    
    togglePause() {
        this.isPaused = !this.isPaused;
    }
    
    gameLoop(currentTime = 0) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.draw();
        
        if (this.isRunning) {
            requestAnimationFrame((time) => this.gameLoop(time));
        }
    }
    
    gameOver() {
        this.isRunning = false;
        this.audioManager.play('gameOver');
        
        document.getElementById('levelReached').textContent = this.levelManager.currentLevel;
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOver').style.display = 'block';
    }
    
    victory() {
        this.isRunning = false;
        
        document.getElementById('victoryScore').textContent = this.score;
        document.getElementById('victory').style.display = 'block';
    }
}

// Global functions for menu system
function startGame() {
    if (!window.game) {
        window.game = new Game();
    }
    window.game.startGameFromMenu();
}

function restartGame() {
    document.getElementById('gameOver').style.display = 'none';
    document.getElementById('victory').style.display = 'none';
    
    // Reset and restart game
    window.game.resetGameState();
    window.game.isRunning = true;
    window.game.setupLevel();
    window.game.gameLoop();
}

function returnToMenu() {
    if (window.game) {
        window.game.returnToMainMenu();
    }
}

// Initialize when page loads - but don't start game
let game;
window.addEventListener('load', () => {
    // Don't create game instance yet - wait for user to click start
    console.log('Alley Revolver Showdown loaded. Click START GAME to begin!');
});
