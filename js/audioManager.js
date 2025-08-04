class AudioManager {
    constructor() {
        this.sounds = {
            gunshot: new Audio('assets/sounds/gunshot.mp3'),
            reload: new Audio('assets/sounds/reload.mp3'),
            playerHit: new Audio('assets/sounds/player_hit.mp3'),
            enemyHit: new Audio('assets/sounds/enemy_hit.mp3'),
            gameOver: new Audio('assets/sounds/game_over.mp3'),
            bossRapidFire: new Audio('assets/sounds/boss_rapid_fire.mp3'),
            shieldHit: new Audio('assets/sounds/shield_hit.mp3') // NEW SHIELD SOUND
        };
        
        // Configure audio settings
        Object.values(this.sounds).forEach(audio => {
            audio.preload = 'auto';
            audio.volume = 0.6;
        });
        
        // Special settings for certain sounds
        this.sounds.gameOver.volume = 0.8;
        this.sounds.bossRapidFire.volume = 0.4;
        // this.sounds.bossRapidFire.loop = true;
        this.sounds.shieldHit.volume = 0.7; // NEW: Shield sound settings
        
        this.enabled = true;
    }
    
    play(soundName) {
        if (!this.enabled || !this.sounds[soundName]) return;
        
        try {
            this.sounds[soundName].currentTime = 0;
            this.sounds[soundName].play().catch(e => {
                console.log('Audio play failed:', e);
            });
        } catch (e) {
            console.log('Audio error:', e);
        }
    }
    
    stop(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName].pause();
            this.sounds[soundName].currentTime = 0;
        }
    }
    
    toggle() {
        this.enabled = !this.enabled;
        if (!this.enabled) {
            Object.values(this.sounds).forEach(audio => {
                audio.pause();
            });
        }
    }
}
