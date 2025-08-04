class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.startY = y;
        this.radius = 25;
        this.health = 100;
        this.maxHealth = 100;
        
        // Movement
        this.moveSpeed = 4;
        this.targetY = y;
        
        // Revolver mechanics
        this.ammo = 6;
        this.maxAmmo = 6;
        this.isReloading = false;
        this.reloadTimer = 0;
        this.reloadTime = 2000;
        
        // Visual
        this.hitFlash = 0;
        this.muzzleFlash = 0;
        
        // Input tracking
        this.keys = {};
    }
    
    update(deltaTime) {
        // Update timers
        this.hitFlash = Math.max(0, this.hitFlash - deltaTime * 3);
        this.muzzleFlash = Math.max(0, this.muzzleFlash - deltaTime * 10);
        
        // Handle movement
        this.handleMovement(deltaTime);
        
        // Handle reloading
        if (this.isReloading) {
            this.reloadTimer += deltaTime;
            if (this.reloadTimer >= this.reloadTime) {
                this.ammo = this.maxAmmo;
                this.isReloading = false;
                this.reloadTimer = 0;
                this.updateAmmoDisplay();
            }
        }
    }
    
    handleMovement(deltaTime) {
        // Vertical movement with W/S keys
        if (this.keys['KeyW'] || this.keys['ArrowUp']) {
            this.targetY = Math.max(50, this.targetY - this.moveSpeed);
        }
        if (this.keys['KeyS'] || this.keys['ArrowDown']) {
            this.targetY = Math.min(550, this.targetY + this.moveSpeed);
        }
        
        // Smooth movement
        const dy = this.targetY - this.y;
        this.y += dy * 0.15;
    }
    
    setMaxAmmo(newMaxAmmo) {
        const oldMaxAmmo = this.maxAmmo;
        this.maxAmmo = newMaxAmmo;
        
        // If we had full ammo before, give full ammo now
        if (this.ammo === oldMaxAmmo) {
            this.ammo = this.maxAmmo;
        } else {
            // Add the difference to current ammo
            this.ammo = Math.min(this.maxAmmo, this.ammo + (newMaxAmmo - oldMaxAmmo));
        }
        
        this.updateAmmoDisplay();
    }
    
    shoot(targetX, targetY) {
        if (this.isReloading || this.ammo <= 0) {
            if (this.ammo <= 0 && !this.isReloading) {
                this.reload();
            }
            return null;
        }
        
        this.ammo--;
        this.muzzleFlash = 1;
        this.updateAmmoDisplay();
        
        // Play gunshot sound
        if (window.game && window.game.audioManager) {
            window.game.audioManager.play('gunshot');
        }
        
        return new Bullet(
            this.x + 30,
            this.y,
            targetX,
            targetY
        );
    }
    
    reload() {
        if (this.isReloading || this.ammo === this.maxAmmo) return;
        
        this.isReloading = true;
        this.reloadTimer = 0;
        this.updateReloadDisplay();
        
        // Play reload sound
        if (window.game && window.game.audioManager) {
            window.game.audioManager.play('reload');
        }
    }
    
    takeDamage(damage = 20) {
        this.health = Math.max(0, this.health - damage);
        this.hitFlash = 1;
        this.updateHealthDisplay();
        
        // Play player hit sound
        if (window.game && window.game.audioManager) {
            window.game.audioManager.play('playerHit');
        }
        
        return this.health <= 0;
    }
    
    heal(amount = 20) {
        this.health = Math.min(this.maxHealth, this.health + amount);
        this.updateHealthDisplay();
    }
    
    updateHealthDisplay() {
        const healthFill = document.getElementById('healthFill');
        const healthText = document.getElementById('healthText');
        const percentage = (this.health / this.maxHealth) * 100;
        
        healthFill.style.width = percentage + '%';
        healthText.textContent = `${this.health}/${this.maxHealth}`;
        
        if (percentage > 60) {
            healthFill.style.background = 'linear-gradient(90deg, #4CAF50, #8BC34A)';
        } else if (percentage > 30) {
            healthFill.style.background = 'linear-gradient(90deg, #FF9800, #FFC107)';
        } else {
            healthFill.style.background = 'linear-gradient(90deg, #F44336, #E91E63)';
        }
    }
    
    updateAmmoDisplay() {
        const bulletSlots = document.getElementById('bulletSlots');
        bulletSlots.innerHTML = '';
        
        for (let i = 0; i < this.maxAmmo; i++) {
            const slot = document.createElement('div');
            slot.className = `bullet-slot ${i < this.ammo ? 'filled' : ''}`;
            slot.id = `bullet-${i}`;
            bulletSlots.appendChild(slot);
        }
    }
    
    updateReloadDisplay() {
        const reloadStatus = document.getElementById('reloadStatus');
        if (this.isReloading) {
            const progress = Math.round((this.reloadTimer / this.reloadTime) * 100);
            reloadStatus.textContent = `RELOADING... ${progress}%`;
        } else {
            reloadStatus.textContent = '';
        }
    }
    
    resetPosition() {
        this.y = this.startY;
        this.targetY = this.startY;
    }
    
    draw(ctx) {
        // Hit flash effect
        if (this.hitFlash > 0) {
            ctx.fillStyle = '#fff';
        } else {
            ctx.fillStyle = '#3498db';
        }
        
        // Draw player body
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw outline
        ctx.strokeStyle = '#2980b9';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Draw revolver
        ctx.fillStyle = '#333';
        ctx.fillRect(this.x + 20, this.y - 3, 25, 6);
        ctx.fillRect(this.x + 15, this.y - 5, 10, 10);
        
        // Muzzle flash
        if (this.muzzleFlash > 0) {
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(this.x + 45, this.y, 8 * this.muzzleFlash, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Draw simple face
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x - 8, this.y - 8, 3, 3);
        ctx.fillRect(this.x + 5, this.y - 8, 3, 3);
        ctx.fillRect(this.x - 5, this.y + 2, 10, 2);
    }
}
