class Enemy {
    constructor(x, y, level = 1) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 60;
        
        // Scale with level
        this.health = level > 5 ? 2 : 1;
        this.maxHealth = this.health;
        
        // Peeking mechanics with level scaling
        this.isPeeking = false;
        this.peekTimer = 0;
        this.peekDuration = Utils.random(2000, 4000);
        this.hideDuration = Utils.random(1000, 2500);
        this.shootTimer = 0;
        this.shootDelay = Math.max(1000, 3000 - (level * 200));
        this.hasShot = false;
        
        // Position behind cover
        this.coverX = x;
        this.hiddenX = x - 30;
        this.targetX = x;
        
        // Visual
        this.color = level > 7 ? '#e74c3c' : level > 4 ? '#f39c12' : '#2ecc71';
        this.hitFlash = 0;
        this.moveSpeed = 2 + (level * 0.2);
        
        // Different enemy types based on level
        this.type = level > 8 ? 2 : level > 5 ? 1 : 0;
        this.setupType(level);
    }
    
    setupType(level) {
        switch (this.type) {
            case 0: // Regular
                break;
            case 1: // Fast
                this.shootDelay *= 0.7;
                this.color = '#ff4757';
                break;
            case 2: // Tank
                this.health += 1;
                this.maxHealth = this.health;
                this.width = 50;
                this.height = 70;
                this.color = '#2f3542';
                break;
        }
    }
    
    update(deltaTime, playerX, playerY) {
        this.peekTimer += deltaTime;
        this.hitFlash = Math.max(0, this.hitFlash - deltaTime * 3);
        
        // Peeking logic (same as before but return bullet if shot)
        if (!this.isPeeking) {
            this.targetX = this.hiddenX;
            if (this.peekTimer >= this.hideDuration) {
                this.isPeeking = true;
                this.peekTimer = 0;
                this.shootTimer = 0;
                this.hasShot = false;
            }
        } else {
            this.targetX = this.coverX;
            this.shootTimer += deltaTime;
            
            if (this.peekTimer >= this.peekDuration) {
                this.isPeeking = false;
                this.peekTimer = 0;
                this.hideDuration = Utils.random(1000, 2500);
                this.peekDuration = Utils.random(2000, 4000);
            }
        }
        
        // Smooth movement
        const dx = this.targetX - this.x;
        this.x += dx * 0.1;
        
        // Shooting logic
        if (this.isPeeking && !this.hasShot && this.shootTimer >= this.shootDelay) {
            this.hasShot = true;
            return this.shoot(playerX, playerY);
        }
        
        return null;
    }
    
    shoot(playerX, playerY) {
        return new EnemyBullet(
            this.x + this.width / 2,
            this.y + this.height / 2,
            playerX,
            playerY
        );
    }
    
    takeDamage(damage = 1) {
        this.health -= damage;
        this.hitFlash = 1;
        
        // Play enemy hit sound
        if (window.game && window.game.audioManager) {
            window.game.audioManager.play('enemyHit');
        }
        
        return this.health <= 0;
    }
    
    draw(ctx) {
        if (this.x < this.hiddenX + 10) return;
        
        if (this.hitFlash > 0) {
            ctx.fillStyle = '#fff';
        } else {
            ctx.fillStyle = this.color;
        }
        
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        // Draw simple face
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x + 10, this.y + 15, 4, 4);
        ctx.fillRect(this.x + 26, this.y + 15, 4, 4);
        ctx.fillRect(this.x + 15, this.y + 30, 10, 3);
        
        // Draw health bar if damaged
        if (this.health < this.maxHealth) {
            const barWidth = this.width;
            const barHeight = 4;
            const barY = this.y - 10;
            
            ctx.fillStyle = '#333';
            ctx.fillRect(this.x, barY, barWidth, barHeight);
            
            ctx.fillStyle = '#e74c3c';
            ctx.fillRect(this.x, barY, (this.health / this.maxHealth) * barWidth, barHeight);
        }
        
        // Draw weapon if peeking
        if (this.isPeeking && Math.abs(this.x - this.targetX) < 5) {
            ctx.fillStyle = '#333';
            ctx.fillRect(this.x + this.width, this.y + 20, 15, 3);
        }
    }
}

class EnemyBullet {
    constructor(x, y, targetX, targetY, speed = 8) {
        this.x = x;
        this.y = y;
        this.radius = 4;
        this.speed = speed;
        this.active = true;
        
        const dx = targetX - x;
        const dy = targetY - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        this.velocityX = (dx / distance) * this.speed;
        this.velocityY = (dy / distance) * this.speed;
    }
    
    update() {
        if (!this.active) return;
        
        this.x += this.velocityX;
        this.y += this.velocityY;
        
        if (this.x < -20 || this.x > 1020 || this.y < -20 || this.y > 620) {
            this.active = false;
        }
    }
    
    draw(ctx) {
        if (!this.active) return;
        
        ctx.fillStyle = '#e74c3c';
        ctx.strokeStyle = '#c0392b';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }
    
    checkPlayerCollision(playerX, playerY, playerRadius = 25) {
        return Utils.circleCollision(
            this.x, this.y, this.radius,
            playerX, playerY, playerRadius
        );
    }
}
