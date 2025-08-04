# Alley Revolver Showdown

A simple 2D browser-based shooting game with 10 levels and a boss battle.

## 🎮 Game Overview

Point-and-shoot game where you fight enemies in alley settings. Progress through 10 levels with increasing difficulty and face a final boss with shield mechanics.

## Features

- **10 Levels** - Progressive difficulty
- **Revolver Combat** - 6-bullet capacity, 2-second reload
- **Player Movement** - W/S keys to dodge bullets
- **Enemy Types** - Regular, fast, and tank enemies
- **Boss Battle** - Level 10 with movable shield defense
- **Ammo Upgrades** - +2 bullets per level completed

## Controls

- **Mouse** - Aim and shoot
- **W/S** - Move up/down
- **R** - Manual reload
- **P** - Pause

## Play Online

**Live Demo**: [https://sandeep7764.github.io/alley-shooter/](https://sandeep7764.github.io/alley-shooter/)

## Setup

1. Clone repository
2. Start local server: `python -m http.server 8000`
3. Open `http://localhost:8000`

## Tech Stack

- HTML5 Canvas
- Vanilla JavaScript
- CSS3
- Web Audio API

## File Structure

```
├── index.html
├── js/
│   ├── game.js
│   ├── player.js
│   ├── enemy.js
│   └── boss.js
├── css/style.css
└── assets/sounds/
```

## Audio (Optional)

Add MP3 files to `assets/sounds/`:
- `gunshot.mp3`, `reload.mp3`, `player_hit.mp3`, `enemy_hit.mp3`, `game_over.mp3`, `boss_rapid_fire.mp3`, `shield_hit.mp3`

## Author

Made by Sandeep7764

Simple 2D shooting game built with vanilla JavaScript.
