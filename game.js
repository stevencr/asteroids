// Main Game Controller - Orchestrates ECS systems and delegates to managers

import {
  MovementSystem,
  RotationSystem,
  ScreenWrapSystem,
  PlayerControlSystem,
  LifetimeSystem,
  CollisionSystem,
  RenderSystem,
  TrailSystem,
  StarfieldSystem,
  UFOSystem,
  PowerUpSystem,
} from "./systems.js";

import { settings } from "./settings.js";
import { InputManager } from "./input.js";
import { HUDManager } from "./hud.js";
import { CollisionHandler } from "./collision-handler.js";
import { EntitySpawner } from "./spawner.js";
import { WelcomeGuide } from "./welcome-guide.js";

export class Game {
  constructor() {
    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.resize();
    window.addEventListener("resize", () => this.resize());

    // Game state
    this.entities = [];
    this.score = 0;
    this.level = 1;
    this.lives = settings.player.startingLives;
    this.highScore = parseInt(localStorage.getItem("asteroidsHighScore")) || 0;
    this.gameOver = false;
    this.gameStarted = false;
    this.shake = 0;
    this.ufoSpawnTimer = settings.enemies.ufoSpawnInterval;
    this.playerPowerUps = {
      rapidFire: { remaining: 0 },
      tripleShot: { remaining: 0 },
    };

    // Managers (Single Responsibility)
    this.input = new InputManager();
    this.hud = new HUDManager();
    this.spawner = new EntitySpawner(this.canvas, this.entities);
    this.collisionHandler = new CollisionHandler(this);
    this.welcomeGuide = new WelcomeGuide();

    // ECS Systems
    this.systems = {
      playerControl: new PlayerControlSystem(this.input.keys),
      movement: new MovementSystem(),
      rotation: new RotationSystem(),
      trail: new TrailSystem(),
      starfield: new StarfieldSystem(() => this.getPlayer()),
      powerUp: new PowerUpSystem(),
      ufo: new UFOSystem((x, y, vx, vy) =>
        this.spawner.spawnEnemyBullet(x, y, vx, vy),
      ),
      screenWrap: new ScreenWrapSystem(this.canvas),
      lifetime: new LifetimeSystem(),
      collision: new CollisionSystem((a, b) =>
        this.collisionHandler.handle(a, b),
      ),
      render: new RenderSystem(this.ctx),
    };

    // Setup and start
    this.hud.hide();
    this.input.onStartGame(() => this.startGame());
    this.input.setup();
    this.reset();
    this.welcomeGuide.draw();

    this.lastTime = performance.now();
    requestAnimationFrame(this.loop.bind(this));
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  startGame() {
    if (this.gameStarted) return;
    this.gameStarted = true;
    this.input._startGameCallback = null;

    document.getElementById("welcomeScreen").classList.add("hidden");
    this.hud.show();
    this.syncHUD();
  }

  reset() {
    this.entities.length = 0;
    this.spawner.createStarfield();
    this.spawner.spawnPlayer();
    const player = this.getPlayer();
    this.spawner.spawnAsteroids(this.level, player.position.value);
  }

  restart() {
    this.score = 0;
    this.level = 1;
    this.lives = settings.player.startingLives;
    this.gameOver = false;
    this.playerPowerUps.rapidFire.remaining = 0;
    this.playerPowerUps.tripleShot.remaining = 0;
    this.reset();
    this.syncHUD();
  }

  getPlayer() {
    return this.entities.find((e) => e.tag && e.tag.has("player"));
  }

  syncHUD() {
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem("asteroidsHighScore", this.highScore);
    }
    this.hud.update({
      score: this.score,
      highScore: this.highScore,
      level: this.level,
      lives: this.lives,
      player: this.getPlayer(),
      playerPowerUps: this.playerPowerUps,
    });
  }

  handlePlayerDeath(player) {
    this.spawner.createExplosion(
      player.position.value.x,
      player.position.value.y,
      settings.effects.playerDeathParticles,
    );
    this.shake = settings.effects.screenShakeDuration;

    this.lives--;

    if (this.lives <= 0) {
      this.gameOver = true;
    } else {
      const centerX = this.canvas.width / 2;
      const centerY = this.canvas.height / 2;
      player.position.value.x = centerX;
      player.position.value.y = centerY;
      player.velocity.value.x = 0;
      player.velocity.value.y = 0;
      player.rotation.angle = 0;
      player.playerController.invulnerable =
        settings.invulnerability.respawnDuration;
    }
    this.syncHUD();
  }

  handleShooting(dt) {
    const player = this.getPlayer();
    if (!player || !player.playerController) return;

    const shootCooldown =
      this.playerPowerUps.rapidFire.remaining > 0
        ? settings.weapons.rapidFireCooldown
        : settings.weapons.normalCooldown;

    if (
      this.input.isPressed(" ") &&
      player.playerController.shootCooldown <= 0
    ) {
      this.spawner.spawnBullets(player, this.playerPowerUps);
      player.playerController.shootCooldown = shootCooldown;
    }
  }

  checkLevelComplete() {
    const hasAsteroids = this.entities.some(
      (e) => e.tag && e.tag.has("asteroid"),
    );
    if (!hasAsteroids) {
      this.level++;
      const player = this.getPlayer();
      if (player && player.playerController) {
        player.playerController.invulnerable =
          settings.invulnerability.levelCompleteDuration;
      }
      this.spawner.spawnAsteroids(
        this.level,
        player ? player.position.value : null,
      );
      this.syncHUD();
    }
  }

  update(dt) {
    if (!this.gameStarted) return;
    if (this.gameOver) {
      if (this.input.isPressed(" ")) this.restart();
      return;
    }

    this.handleShooting(dt);

    // UFO spawning
    this.ufoSpawnTimer -= dt;
    if (this.ufoSpawnTimer <= 0) {
      this.spawner.spawnUFO();
      this.ufoSpawnTimer =
        settings.enemies.ufoSpawnInterval +
        Math.random() * settings.enemies.ufoSpawnVariation;
    }

    // Run ECS systems
    const s = this.systems;
    s.playerControl.update(this.entities, dt);
    s.movement.update(this.entities, dt);
    s.rotation.update(this.entities, dt);
    s.trail.update(this.entities, dt);
    s.starfield.update(this.entities, dt);
    s.powerUp.update(this.entities, dt);

    const player = this.getPlayer();
    const playerPos = player ? player.position.value : null;
    s.ufo.update(this.entities, dt, playerPos);

    s.screenWrap.update(this.entities);
    s.lifetime.update(this.entities, dt);

    // Decrement power-up timers
    if (this.playerPowerUps.rapidFire.remaining > 0) {
      this.playerPowerUps.rapidFire.remaining = Math.max(
        0,
        this.playerPowerUps.rapidFire.remaining - dt,
      );
    }
    if (this.playerPowerUps.tripleShot.remaining > 0) {
      this.playerPowerUps.tripleShot.remaining = Math.max(
        0,
        this.playerPowerUps.tripleShot.remaining - dt,
      );
    }

    this.syncHUD();
    s.collision.update(this.entities);
    this.checkLevelComplete();

    this.shake = Math.max(
      0,
      this.shake - dt * settings.effects.screenShakeDecay,
    );
  }

  draw() {
    this.systems.render.render(this.entities, this.shake, this.gameOver);
  }

  loop(time) {
    const dt = Math.min((time - this.lastTime) / 1000, 0.1);
    this.lastTime = time;
    this.update(dt);
    this.draw();
    requestAnimationFrame(this.loop.bind(this));
  }
}
