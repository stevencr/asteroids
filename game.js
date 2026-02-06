// Main Game Controller - Orchestrates ECS systems and game logic

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

import {
  createPlayer,
  createAsteroid,
  createBullet,
  createParticle,
  createStar,
  createPowerUp,
  createUFO,
} from "./entities.js";

import { Vector } from "./components.js";
import { settings } from "./settings.js";

export class Game {
  constructor() {
    console.log("Game initializing...");

    // Setup canvas
    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.resize();
    window.addEventListener("resize", () => this.resize());

    // Game state
    this.score = 0;
    this.level = 1;
    this.lives = settings.player.startingLives;
    this.highScore = parseInt(localStorage.getItem("asteroidsHighScore")) || 0;
    this.gameOver = false;
    this.gameStarted = false;
    this.shake = 0;
    this.keys = {};
    this.ufoSpawnTimer = settings.enemies.ufoSpawnInterval;
    this.playerPowerUps = {
      rapidFire: { remaining: 0 },
      tripleShot: { remaining: 0 },
    };

    // Hide UI elements initially
    document.getElementById("hud").style.display = "none";
    document.getElementById("controls").style.display = "none";

    // Entity list
    this.entities = [];

    // Initialize ECS systems
    this.movementSystem = new MovementSystem();
    this.rotationSystem = new RotationSystem();
    this.screenWrapSystem = new ScreenWrapSystem(this.canvas);
    this.playerControlSystem = new PlayerControlSystem(this.keys);
    this.lifetimeSystem = new LifetimeSystem();
    this.trailSystem = new TrailSystem();
    this.starfieldSystem = new StarfieldSystem(() => this.getPlayer());
    this.ufoSystem = new UFOSystem((x, y, vx, vy, type) =>
      this.spawnEnemyBullet(x, y, vx, vy),
    );
    this.powerUpSystem = new PowerUpSystem();
    this.collisionSystem = new CollisionSystem((a, b) =>
      this.handleCollision(a, b),
    );
    this.renderSystem = new RenderSystem(this.ctx);

    // Setup input handlers
    this.setupInput();

    // Initialize game
    this.reset();

    // Draw welcome screen guide
    this.drawWelcomeGuide();

    // Start game loop
    this.lastTime = performance.now();
    requestAnimationFrame(this.loop.bind(this));

    console.log("Game initialized");
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    console.log(`Canvas resized to ${this.canvas.width}x${this.canvas.height}`);
  }

  setupInput() {
    // Keyboard controls
    window.addEventListener("keydown", (e) => {
      // Start game on space press if not started
      if (!this.gameStarted && e.key === " ") {
        this.startGame();
        return;
      }
      this.keys[e.key] = true;
    });
    window.addEventListener("keyup", (e) => {
      this.keys[e.key] = false;
    });

    // Touch controls
    const buttons = {
      leftBtn: "ArrowLeft",
      rightBtn: "ArrowRight",
      thrustBtn: "ArrowUp",
      shootBtn: " ",
    };

    for (const [id, key] of Object.entries(buttons)) {
      const btn = document.getElementById(id);
      ["touchstart", "touchend", "touchcancel"].forEach((eventType) => {
        btn.addEventListener(eventType, (e) => {
          e.preventDefault();
          this.keys[key] = eventType === "touchstart";
        });
      });
    }
    // Touch/click on welcome screen to start
    const welcomeScreen = document.getElementById("welcomeScreen");
    welcomeScreen.addEventListener("click", () => {
      if (!this.gameStarted) {
        this.startGame();
      }
    });
  }

  drawWelcomeGuide() {
    // Draw player ship
    const playerCanvas = document.getElementById("guidePlayer");
    if (playerCanvas) {
      const ctx = playerCanvas.getContext("2d");
      ctx.clearRect(0, 0, 60, 60);
      ctx.save();
      ctx.translate(30, 30);
      ctx.strokeStyle = "#0f0";
      ctx.fillStyle = "#0f0";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -15);
      ctx.lineTo(-10, 15);
      ctx.lineTo(0, 10);
      ctx.lineTo(10, 15);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }

    // Draw asteroid
    const asteroidCanvas = document.getElementById("guideAsteroid");
    if (asteroidCanvas) {
      const ctx = asteroidCanvas.getContext("2d");
      ctx.clearRect(0, 0, 60, 60);
      ctx.save();
      ctx.translate(30, 30);
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      const sides = 8;
      const radius = 18;
      ctx.beginPath();
      for (let i = 0; i < sides; i++) {
        const angle = (i / sides) * Math.PI * 2;
        const r = radius + (Math.random() - 0.5) * 6;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }

    // Draw UFO
    const ufoCanvas = document.getElementById("guideUFO");
    if (ufoCanvas) {
      const ctx = ufoCanvas.getContext("2d");
      ctx.clearRect(0, 0, 60, 60);
      ctx.save();
      ctx.translate(30, 30);
      ctx.strokeStyle = "#0ff";
      ctx.fillStyle = "rgba(0, 255, 255, 0.1)";
      ctx.lineWidth = 2;

      // Top dome
      ctx.beginPath();
      ctx.arc(0, -3, 8, 0, Math.PI, true);
      ctx.stroke();

      // Body
      ctx.beginPath();
      ctx.moveTo(-15, 0);
      ctx.lineTo(-8, -3);
      ctx.lineTo(8, -3);
      ctx.lineTo(15, 0);
      ctx.lineTo(10, 6);
      ctx.lineTo(-10, 6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    }

    // Draw Shield Power-up
    const shieldCanvas = document.getElementById("guideShield");
    if (shieldCanvas) {
      const ctx = shieldCanvas.getContext("2d");
      ctx.clearRect(0, 0, 60, 60);
      ctx.save();
      ctx.translate(30, 30);

      // Outer glow
      ctx.strokeStyle = "rgba(0, 200, 255, 0.4)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.stroke();

      // Inner circle
      ctx.strokeStyle = "#0ff";
      ctx.fillStyle = "rgba(0, 255, 255, 0.2)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Shield symbol (diamond)
      ctx.fillStyle = "#0ff";
      ctx.font = "bold 16px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("◆", 0, 0);

      ctx.restore();
    }

    // Draw Rapid Fire Power-up
    const rapidFireCanvas = document.getElementById("guideRapidFire");
    if (rapidFireCanvas) {
      const ctx = rapidFireCanvas.getContext("2d");
      ctx.clearRect(0, 0, 60, 60);
      ctx.save();
      ctx.translate(30, 30);

      // Outer glow
      ctx.strokeStyle = "rgba(255, 128, 0, 0.4)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.stroke();

      // Inner circle
      ctx.strokeStyle = "#ff8800";
      ctx.fillStyle = "rgba(255, 136, 0, 0.2)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Rapid fire symbol (arrows)
      ctx.fillStyle = "#ff8800";
      ctx.font = "bold 16px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("»", 0, 0);

      ctx.restore();
    }

    // Draw Triple Shot Power-up
    const tripleShotCanvas = document.getElementById("guideTripleShot");
    if (tripleShotCanvas) {
      const ctx = tripleShotCanvas.getContext("2d");
      ctx.clearRect(0, 0, 60, 60);
      ctx.save();
      ctx.translate(30, 30);

      // Outer glow
      ctx.strokeStyle = "rgba(160, 100, 255, 0.4)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.stroke();

      // Inner circle
      ctx.strokeStyle = "#a064ff";
      ctx.fillStyle = "rgba(160, 100, 255, 0.2)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Triple shot symbol (three small circles)
      ctx.fillStyle = "#a064ff";
      ctx.beginPath();
      ctx.arc(-4, -2, 2, 0, Math.PI * 2);
      ctx.arc(0, -4, 2, 0, Math.PI * 2);
      ctx.arc(4, -2, 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  startGame() {
    this.gameStarted = true;
    const welcomeScreen = document.getElementById("welcomeScreen");
    welcomeScreen.classList.add("hidden");

    // Show UI elements
    document.getElementById("hud").style.display = "block";
    document.getElementById("controls").style.display = "flex";

    // Initialize HUD
    this.updateHUD();

    console.log("Game started!");
  }

  updateHUD() {
    // Update score
    document.getElementById("score").textContent = this.score;

    // Update high score
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem("asteroidsHighScore", this.highScore);
    }
    document.getElementById("highScore").textContent = this.highScore;

    // Update level
    document.getElementById("level").textContent = this.level;

    // Update lives display
    const livesContainer = document.getElementById("lives");
    livesContainer.innerHTML = "";
    for (let i = 0; i < 3; i++) {
      const lifeIcon = document.createElement("span");
      lifeIcon.className = "life-icon";
      if (i >= this.lives) {
        lifeIcon.classList.add("lost");
      }
      lifeIcon.textContent = "\u25b2";
      livesContainer.appendChild(lifeIcon);
    }

    // Update active effects (shield + power-ups)
    const player = this.getPlayer();
    const container = document.getElementById("active-effects-container");
    const activeEffects = [];

    // Add shield if active
    if (
      player &&
      player.playerController &&
      player.playerController.invulnerable > 0
    ) {
      activeEffects.push({
        key: "shield",
        name: "SHIELD",
        icon: "◆",
        color: "#0ff",
        remaining: player.playerController.invulnerable,
        max: settings.powerUps.shieldDuration,
      });
    }

    // Add rapid fire if active
    if (
      this.playerPowerUps.rapidFire &&
      this.playerPowerUps.rapidFire.remaining > 0
    ) {
      activeEffects.push({
        key: "rapidFire",
        name: "RAPID FIRE",
        icon: "»",
        color: "#ff8800",
        remaining: this.playerPowerUps.rapidFire.remaining,
        max: settings.powerUps.rapidFireDuration,
      });
    }

    // Add triple shot if active
    if (
      this.playerPowerUps.tripleShot &&
      this.playerPowerUps.tripleShot.remaining > 0
    ) {
      activeEffects.push({
        key: "tripleShot",
        name: "TRIPLE SHOT",
        icon: "∗",
        color: "#a064ff",
        remaining: this.playerPowerUps.tripleShot.remaining,
        max: settings.powerUps.tripleShotDuration,
      });
    }

    // Render all active effects
    container.innerHTML = "";
    activeEffects.forEach((effect) => {
      const effectDiv = document.createElement("div");
      effectDiv.className = "active-effect";

      const header = document.createElement("div");
      header.className = "effect-header";

      const icon = document.createElement("span");
      icon.className = "effect-icon";
      icon.textContent = effect.icon;
      icon.style.color = effect.color;

      const name = document.createElement("span");
      name.className = "effect-label";
      name.textContent = effect.name;
      name.style.color = effect.color;

      header.appendChild(icon);
      header.appendChild(name);

      const progressContainer = document.createElement("div");
      progressContainer.className = "effect-progress-container";

      const progress = document.createElement("div");
      progress.className = "effect-progress";
      const percentage = (effect.remaining / effect.max) * 100;
      progress.style.width = percentage + "%";
      progress.style.backgroundColor = effect.color;
      progress.style.boxShadow = `0 0 10px ${effect.color}`;

      progressContainer.appendChild(progress);

      effectDiv.appendChild(header);
      effectDiv.appendChild(progressContainer);
      container.appendChild(effectDiv);
    });
  }

  reset() {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;

    this.entities = [];

    // Create starfield background
    this.createStarfield();

    // Add player
    this.entities.push(createPlayer(centerX, centerY));
    this.spawnAsteroids();
  }

  createStarfield() {
    // Create stars with different depths for parallax
    for (let i = 0; i < settings.starfield.starCount; i++) {
      const x = Math.random() * this.canvas.width;
      const y = Math.random() * this.canvas.height;
      const depth = Math.floor(Math.random() * settings.starfield.depths) + 1;
      this.entities.push(createStar(x, y, depth));
    }
  }

  spawnAsteroids() {
    const count =
      settings.asteroids.baseCount +
      Math.floor(this.level * settings.asteroids.levelMultiplier);
    const player = this.getPlayer();

    for (let i = 0; i < count; i++) {
      const x = Math.random() * this.canvas.width;
      const y = Math.random() * this.canvas.height;

      // Don't spawn too close to player
      const dx = x - player.position.value.x;
      const dy = y - player.position.value.y;
      const distToPlayer = Math.sqrt(dx * dx + dy * dy);

      if (distToPlayer < settings.asteroids.minSpawnDistance) continue;

      this.entities.push(createAsteroid(x, y, 3));
    }
    console.log(`Spawned asteroids for level ${this.level}`);
  }

  getPlayer() {
    return this.entities.find((e) => e.tag && e.tag.has("player"));
  }

  getAsteroids() {
    return this.entities.filter((e) => e.tag && e.tag.has("asteroid"));
  }

  createExplosion(
    x,
    y,
    count = settings.effects.explosionParticles,
    color = "orange",
  ) {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const speed = 50 + Math.random() * 50;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      const lifetime =
        settings.effects.particleLifetimeMin +
        Math.random() *
          (settings.effects.particleLifetimeMax -
            settings.effects.particleLifetimeMin);
      this.entities.push(createParticle(x, y, vx, vy, lifetime, color));
    }
    this.shake = settings.effects.screenShakeDuration;
  }

  spawnPowerUp(x, y) {
    // Chance to spawn a power-up
    if (Math.random() > settings.powerUps.spawnProbability) return;

    const types = ["shield", "rapidFire", "tripleShot"];
    const type = types[Math.floor(Math.random() * types.length)];
    this.entities.push(createPowerUp(x, y, type));
  }

  spawnUFO() {
    const side = Math.random() > 0.5 ? 1 : -1;
    const x = side > 0 ? -30 : this.canvas.width + 30;
    const y = Math.random() * this.canvas.height;
    this.entities.push(createUFO(x, y));
  }

  spawnEnemyBullet(x, y, vx, vy) {
    const bullet = createBullet(x, y, vx, vy);
    bullet.tag.add("enemy");
    this.entities.push(bullet);
  }

  handleShooting(dt) {
    const player = this.getPlayer();
    if (!player || !player.playerController) return;

    // Rapid fire reduces cooldown
    const shootCooldown =
      this.playerPowerUps.rapidFire &&
      this.playerPowerUps.rapidFire.remaining > 0
        ? settings.weapons.rapidFireCooldown
        : settings.weapons.normalCooldown;

    if (this.keys[" "] && player.playerController.shootCooldown <= 0) {
      const angle = player.rotation.angle;
      const direction = new Vector(Math.sin(angle), -Math.cos(angle));

      const bulletX = player.position.value.x + direction.x * 20;
      const bulletY = player.position.value.y + direction.y * 20;
      const velX = direction.x * settings.weapons.bulletSpeed;
      const velY = direction.y * settings.weapons.bulletSpeed;

      // Normal shot
      this.entities.push(createBullet(bulletX, bulletY, velX, velY));

      // Triple shot power-up
      if (
        this.playerPowerUps.tripleShot &&
        this.playerPowerUps.tripleShot.remaining > 0
      ) {
        const spread = settings.weapons.tripleShotSpread;

        // Left bullet
        const leftAngle = angle - spread;
        const leftDir = new Vector(Math.sin(leftAngle), -Math.cos(leftAngle));
        const leftX = player.position.value.x + leftDir.x * 20;
        const leftY = player.position.value.y + leftDir.y * 20;
        this.entities.push(
          createBullet(
            leftX,
            leftY,
            leftDir.x * settings.weapons.bulletSpeed,
            leftDir.y * settings.weapons.bulletSpeed,
          ),
        );

        // Right bullet
        const rightAngle = angle + spread;
        const rightDir = new Vector(
          Math.sin(rightAngle),
          -Math.cos(rightAngle),
        );
        const rightX = player.position.value.x + rightDir.x * 20;
        const rightY = player.position.value.y + rightDir.y * 20;
        this.entities.push(
          createBullet(
            rightX,
            rightY,
            rightDir.x * settings.weapons.bulletSpeed,
            rightDir.y * settings.weapons.bulletSpeed,
          ),
        );
      }

      player.playerController.shootCooldown = shootCooldown;
    }
  }

  handleCollision(a, b) {
    const aTag = a.tag;
    const bTag = b.tag;

    // Player vs Asteroid
    if (
      (aTag.has("player") && bTag.has("asteroid")) ||
      (aTag.has("asteroid") && bTag.has("player"))
    ) {
      const player = aTag.has("player") ? a : b;

      if (
        player.playerController &&
        player.playerController.invulnerable <= 0
      ) {
        this.handlePlayerDeath(player);
      }
    }

    // Bullet vs Asteroid
    if (
      (aTag.has("bullet") && bTag.has("asteroid")) ||
      (aTag.has("asteroid") && bTag.has("bullet"))
    ) {
      const bullet = aTag.has("bullet") ? a : b;
      const asteroid = aTag.has("asteroid") ? a : b;

      // Mark bullet for removal
      if (bullet.lifetime) {
        bullet.lifetime.remaining = 0;
      }

      // Destroy asteroid and create fragments
      const index = this.entities.indexOf(asteroid);
      if (index !== -1) {
        this.entities.splice(index, 1);

        // Create smaller asteroids
        if (asteroid.asteroidData && asteroid.asteroidData.size > 1) {
          const pos = asteroid.position.value;
          this.entities.push(
            createAsteroid(pos.x, pos.y, asteroid.asteroidData.size - 1),
          );
          this.entities.push(
            createAsteroid(pos.x, pos.y, asteroid.asteroidData.size - 1),
          );
        }

        // Update score
        const scoreMap = {
          3: settings.scoring.asteroidSize3,
          2: settings.scoring.asteroidSize2,
          1: settings.scoring.asteroidSize1,
        };
        const points = scoreMap[asteroid.asteroidData.size] || 100;
        this.score += points;
        this.updateHUD();

        // Chance to spawn power-up
        this.spawnPowerUp(asteroid.position.value.x, asteroid.position.value.y);

        this.createExplosion(
          asteroid.position.value.x,
          asteroid.position.value.y,
        );
      }
    }

    // Player vs PowerUp
    if (
      (aTag.has("player") && bTag.has("powerup")) ||
      (aTag.has("powerup") && bTag.has("player"))
    ) {
      const powerup = aTag.has("powerup") ? a : b;
      const player = aTag.has("player") ? a : b;

      // Apply power-up effect
      if (powerup.powerUp.type === "shield") {
        player.playerController.invulnerable = settings.powerUps.shieldDuration;
      } else if (powerup.powerUp.type === "rapidFire") {
        // Activate rapid fire
        if (!this.playerPowerUps.rapidFire)
          this.playerPowerUps.rapidFire = { remaining: 0 };
        this.playerPowerUps.rapidFire.remaining =
          settings.powerUps.rapidFireDuration;
      } else if (powerup.powerUp.type === "tripleShot") {
        // Activate triple shot
        if (!this.playerPowerUps.tripleShot)
          this.playerPowerUps.tripleShot = { remaining: 0 };
        this.playerPowerUps.tripleShot.remaining =
          settings.powerUps.tripleShotDuration;
      }

      // Remove power-up
      const index = this.entities.indexOf(powerup);
      if (index !== -1) {
        this.entities.splice(index, 1);
      }

      this.createExplosion(
        powerup.position.value.x,
        powerup.position.value.y,
        settings.effects.powerUpExplosionParticles,
        "cyan",
      );
    }

    // Player vs UFO or bullet hits UFO
    if (
      (aTag.has("player") && bTag.has("ufo")) ||
      (aTag.has("ufo") && bTag.has("player"))
    ) {
      const player = aTag.has("player") ? a : b;
      const ufo = aTag.has("ufo") ? a : b;

      // Destroy UFO
      const index = this.entities.indexOf(ufo);
      if (index !== -1) {
        this.entities.splice(index, 1);
        this.score += settings.enemies.ufoScore;
        this.updateHUD();
        this.createExplosion(
          ufo.position.value.x,
          ufo.position.value.y,
          settings.effects.ufoExplosionParticles,
          "cyan",
        );
      }

      // Damage player if not invulnerable
      if (
        player.playerController &&
        player.playerController.invulnerable <= 0
      ) {
        this.handlePlayerDeath(player);
      }
    }

    // Bullet vs UFO
    if (
      (aTag.has("bullet") && bTag.has("ufo") && !aTag.has("enemy")) ||
      (aTag.has("ufo") && bTag.has("bullet") && !bTag.has("enemy"))
    ) {
      const bullet = aTag.has("bullet") ? a : b;
      const ufo = aTag.has("ufo") ? a : b;

      // Remove bullet
      if (bullet.lifetime) {
        bullet.lifetime.remaining = 0;
      }

      // Destroy UFO
      const index = this.entities.indexOf(ufo);
      if (index !== -1) {
        this.entities.splice(index, 1);
        this.score += settings.enemies.ufoScore;
        this.updateHUD();
        this.createExplosion(
          ufo.position.value.x,
          ufo.position.value.y,
          settings.effects.ufoExplosionParticles,
          "cyan",
        );
      }
    }

    // Enemy bullet vs Player
    if (
      (aTag.has("bullet") && aTag.has("enemy") && bTag.has("player")) ||
      (bTag.has("bullet") && bTag.has("enemy") && aTag.has("player"))
    ) {
      const bullet = aTag.has("bullet") ? a : b;
      const player = aTag.has("player") ? a : b;

      // Remove bullet
      if (bullet.lifetime) {
        bullet.lifetime.remaining = 0;
      }

      // Damage player if not invulnerable
      if (
        player.playerController &&
        player.playerController.invulnerable <= 0
      ) {
        this.handlePlayerDeath(player);
      }
    }
  }

  handlePlayerDeath(player) {
    this.createExplosion(
      player.position.value.x,
      player.position.value.y,
      settings.effects.playerDeathParticles,
    );

    this.lives--;
    this.updateHUD();

    if (this.lives <= 0) {
      // Game over
      this.gameOver = true;
    } else {
      // Respawn player at center
      const centerX = this.canvas.width / 2;
      const centerY = this.canvas.height / 2;
      player.position.value.x = centerX;
      player.position.value.y = centerY;
      player.velocity.value.x = 0;
      player.velocity.value.y = 0;
      player.rotation.angle = 0;
      player.playerController.invulnerable =
        settings.invulnerability.respawnDuration;
      this.updateHUD();
    }
  }

  checkLevelComplete() {
    const asteroids = this.getAsteroids();
    if (asteroids.length === 0) {
      this.level++;
      this.updateHUD();

      const player = this.getPlayer();
      if (player && player.playerController) {
        player.playerController.invulnerable =
          settings.invulnerability.levelCompleteDuration;
      }

      this.spawnAsteroids();
    }
  }

  restart() {
    this.score = 0;
    this.level = 1;
    this.lives = settings.player.startingLives;
    this.gameOver = false;
    this.updateHUD();
    this.reset();
  }

  update(dt) {
    // Don't update game until started
    if (!this.gameStarted) {
      return;
    }
    if (this.gameOver) {
      if (this.keys[" "]) this.restart();
      return;
    }

    // Handle player shooting
    this.handleShooting(dt);

    // UFO spawning timer
    this.ufoSpawnTimer -= dt;
    if (this.ufoSpawnTimer <= 0) {
      this.spawnUFO();
      this.ufoSpawnTimer =
        settings.enemies.ufoSpawnInterval +
        Math.random() * settings.enemies.ufoSpawnVariation;
    }

    // Update all systems
    this.playerControlSystem.update(this.entities, dt);
    this.movementSystem.update(this.entities, dt);
    this.rotationSystem.update(this.entities, dt);
    this.trailSystem.update(this.entities, dt);
    this.starfieldSystem.update(this.entities, dt);
    this.powerUpSystem.update(this.entities, dt);

    const player = this.getPlayer();
    const playerPos = player ? player.position.value : null;
    this.ufoSystem.update(this.entities, dt, playerPos);

    this.screenWrapSystem.update(this.entities);
    this.lifetimeSystem.update(this.entities, dt);

    // Decrement any active power-up timers
    if (
      this.playerPowerUps.rapidFire &&
      this.playerPowerUps.rapidFire.remaining > 0
    ) {
      this.playerPowerUps.rapidFire.remaining = Math.max(
        0,
        this.playerPowerUps.rapidFire.remaining - dt,
      );
    }
    if (
      this.playerPowerUps.tripleShot &&
      this.playerPowerUps.tripleShot.remaining > 0
    ) {
      this.playerPowerUps.tripleShot.remaining = Math.max(
        0,
        this.playerPowerUps.tripleShot.remaining - dt,
      );
    }

    // Update HUD before collision detection (so shield indicator is accurate)
    this.updateHUD();

    this.collisionSystem.update(this.entities);

    // Check for level completion
    this.checkLevelComplete();

    // Update screen shake
    this.shake = Math.max(
      0,
      this.shake - dt * settings.effects.screenShakeDecay,
    );
  }

  draw() {
    this.renderSystem.render(this.entities, this.shake, this.gameOver);
  }

  loop(time) {
    const dt = Math.min((time - this.lastTime) / 1000, 0.1);
    this.lastTime = time;

    this.update(dt);
    this.draw();

    requestAnimationFrame(this.loop.bind(this));
  }
}
