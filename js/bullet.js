class Bullet {
    constructor(x, y, targetX, targetY, speed = 12) {
        this.x = x;
        this.y = y;
        this.radius = 3;
        this.speed = speed;
        this.active = true;
        
        // Calculate direction
        const dx = targetX - x;
        const dy = targetY - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        this.velocityX = (dx / distance) * this.speed;
        this.velocityY = (dy / distance) * this.speed;
        
        // Visual trail effect
        this.trail = [];
    }
    
    update() {
        if (!this.active) return;
        
        // Store previous position for trail
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 5) {
            this.trail.shift();
        }
        
        // Move bullet
        this.x += this.velocityX;
        this.y += this.velocityY;
        
        // Remove if off-screen
        if (this.x < -20 || this.x > 1020 || this.y < -20 || this.y > 620) {
            this.active = false;
        }
    }
    
    draw(ctx) {
        if (!this.active) return;
        
        // Draw trail
        ctx.globalAlpha = 0.3;
        this.trail.forEach((point, index) => {
            const alpha = (index + 1) / this.trail.length * 0.3;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(point.x, point.y, this.radius * 0.5, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // Draw bullet
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#FFD700';
        ctx.strokeStyle = '#FFA500';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }
    
    checkCollision(enemy) {
        return Utils.circleCollision(
            this.x, this.y, this.radius,
            enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.width / 2
        );
    }
}
