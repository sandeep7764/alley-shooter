class Boss extends Enemy {
    constructor(x, y) {
    super(x, y);
    
    // Boss-specific properties
    this.width = 80;
    this.height = 120;
    this.health = 50;
    this.maxHealth = 50;
    this.moveSpeed = 1.5;
    
    // Movement
    this.targetY = y;
    this.moveDirection = 1;
    this.moveTimer = 0;
    this.moveChangeDelay = 2000;
    
    // Rapid fire mode - UPDATED
    this.rapidFireMode = false;
    this.rapidFireTimer = 0;
    this.rapidFireDuration = 3000; // 3 seconds of rapid fire
    this.rapidFireCooldownTimer = 0; // Start immediately for first cycle
    this.rapidFireShootTimer = 0;
    this.rapidFireShootDelay = 150; // Very fast shooting
    
    // Normal shooting
    this.normalShootTimer = 0;
    this.normalShootDelay = 1500;
    
    // Visual
    this.color = '#8e44ad';
    this.isFlashing = false;
    this.flashTimer = 0;
    
    // Always visible (no peeking mechanic)
    this.isPeeking = true;
    this.hasShot = false;
}
    
    update(deltaTime, playerX, playerY) {
    this.hitFlash = Math.max(0, this.hitFlash - deltaTime * 3);
    this.flashTimer += deltaTime;
    
    // Movement logic
    this.moveTimer += deltaTime;
    if (this.moveTimer >= this.moveChangeDelay) {
        this.moveDirection *= -1;
        this.moveTimer = 0;
        this.moveChangeDelay = Utils.random(1500, 3000);
    }
    
    // Move up and down
    this.targetY += this.moveDirection * this.moveSpeed;
    this.targetY = Utils.clamp(this.targetY, 100, 500 - this.height);
    
    // Smooth movement
    const dy = this.targetY - this.y;
    this.y += dy * 0.05;
    
    // UPDATED RAPID FIRE LOGIC - Every 4 seconds
    if (!this.rapidFireMode) {
        this.rapidFireCooldownTimer += deltaTime;
        
        // Enter rapid fire every 4 seconds (4000ms)
        if (this.rapidFireCooldownTimer >= 4000) {
            this.enterRapidFire();
            this.rapidFireCooldownTimer = 0;
        }
    }
    
    // Handle shooting modes
    const bullets = [];
    
    if (this.rapidFireMode) {
        this.rapidFireTimer += deltaTime;
        this.rapidFireShootTimer += deltaTime;
        
        // Flash effect during rapid fire
        this.isFlashing = Math.sin(this.flashTimer * 0.02) > 0;
        
        if (this.rapidFireShootTimer >= this.rapidFireShootDelay) {
            bullets.push(this.createBullet(playerX, playerY));
            this.rapidFireShootTimer = 0;
        }
        
        if (this.rapidFireTimer >= this.rapidFireDuration) {
            this.exitRapidFire();
        }
    } else {
        this.isFlashing = false;
        this.normalShootTimer += deltaTime;
        
        if (this.normalShootTimer >= this.normalShootDelay) {
            bullets.push(this.createBullet(playerX, playerY));
            this.normalShootTimer = 0;
            this.normalShootDelay = Utils.random(1200, 2000);
        }
    }
    
    return bullets;
    }
    
    enterRapidFire() {
        this.rapidFireMode = true;
        this.rapidFireTimer = 0;
        this.rapidFireShootTimer = 0;
        this.rapidFireCooldownTimer = this.rapidFireCooldown;
        
        // Play rapid fire sound twice
        if (window.game && window.game.audioManager) {
            window.game.audioManager.play('bossRapidFire');
            
            // Play it again after a short delay
            setTimeout(() => {
                if (this.rapidFireMode && window.game && window.game.audioManager) {
                    window.game.audioManager.play('bossRapidFire');
                }
            }, 1500);
        }
}
    
    exitRapidFire() {
        this.rapidFireMode = false;
        this.isFlashing = false;
        
        // Stop rapid fire sound
        if (window.game && window.game.audioManager) {
            window.game.audioManager.stop('bossRapidFire');
        }
    }
    
    createBullet(playerX, playerY) {
        return new EnemyBullet(
            this.x + this.width / 2,
            this.y + this.height / 2,
            playerX,
            playerY,
            this.rapidFireMode ? 10 : 8
        );
    }
    
    takeDamage(damage = 1) {
        const wasDead = super.takeDamage(damage);
        
        if (wasDead) {
            this.exitRapidFire();
        }
        
        return wasDead;
    }
    
    draw(ctx) {
        // Boss glow effect
        ctx.shadowColor = this.isFlashing ? '#ff6b6b' : '#8e44ad';
        ctx.shadowBlur = this.isFlashing ? 20 : 10;
        
        // Hit flash or rapid fire flash
        if (this.hitFlash > 0 || this.isFlashing) {
            ctx.fillStyle = this.isFlashing ? '#ff6b6b' : '#fff';
        } else {
            ctx.fillStyle = this.color;
        }
        
        // Draw boss body
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Draw boss details
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        // Draw menacing face
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x + 15, this.y + 25, 8, 8); // Left eye
        ctx.fillRect(this.x + 55, this.y + 25, 8, 8); // Right eye
        ctx.fillRect(this.x + 25, this.y + 50, 30, 6); // Mouth
        
        // Draw weapons
        if (this.rapidFireMode) {
            // Multiple gun barrels during rapid fire
            ctx.fillStyle = '#333';
            for (let i = 0; i < 3; i++) {
                ctx.fillRect(this.x + this.width, this.y + 30 + (i * 15), 20, 4);
            }
        } else {
            // Single large weapon
            ctx.fillStyle = '#333';
            ctx.fillRect(this.x + this.width, this.y + 40, 25, 8);
            ctx.fillRect(this.x + this.width - 5, this.y + 35, 15, 18);
        }
        
        // Health bar
        const barWidth = this.width + 20;
        const barHeight = 8;
        const barX = this.x - 10;
        const barY = this.y - 20;
        
        // Background
        ctx.fillStyle = '#333';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Health
        const healthPercentage = this.health / this.maxHealth;
        ctx.fillStyle = healthPercentage > 0.5 ? '#e74c3c' : '#c0392b';
        ctx.fillRect(barX, barY, barWidth * healthPercentage, barHeight);
        
        // Health text
        ctx.fillStyle = '#fff';
        ctx.font = '12px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText(`BOSS: ${this.health}/${this.maxHealth}`, this.x + this.width/2, barY - 5);
        ctx.textAlign = 'left';
        
        // Rapid fire cooldown indicator
        if (this.rapidFireCooldownTimer > 0 && !this.rapidFireMode) {
            const cooldownPercentage = 1 - (this.rapidFireCooldownTimer / this.rapidFireCooldown);
            ctx.fillStyle = '#3498db';
            ctx.fillRect(barX, barY + barHeight + 2, barWidth * cooldownPercentage, 4);
        }
    }
}
