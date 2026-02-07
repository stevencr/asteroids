// Entity Spawner - Handles creation and spawning of game entities (Single Responsibility)

import {
  createAsteroid,
  createBullet,
  createParticle,
  createPlayer,
  createPowerUp,
  createStar,
  createUFO,
} from "./entities.js";
import { Vector } from "./components.js";
import { settings } from "./settings.js";

export class EntitySpawner {
  constructor(canvas, entities) {
    this.canvas = canvas;
    this.entities = entities;
  }

  createStarfield() {
    for (let i = 0; i < settings.starfield.starCount; i++) {
      const x = Math.random() * this.canvas.width;
      const y = Math.random() * this.canvas.height;
      const depth = Math.floor(Math.random() * settings.starfield.depths) + 1;
      this.entities.push(createStar(x, y, depth));
    }
  }

  spawnPlayer() {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    this.entities.push(createPlayer(centerX, centerY));
  }

  spawnAsteroids(level, playerPos) {
    const count =
      settings.asteroids.baseCount +
      Math.floor(level * settings.asteroids.levelMultiplier);

    for (let i = 0; i < count; i++) {
      const x = Math.random() * this.canvas.width;
      const y = Math.random() * this.canvas.height;

      if (playerPos) {
        const dx = x - playerPos.x;
        const dy = y - playerPos.y;
        const distToPlayer = Math.sqrt(dx * dx + dy * dy);
        if (distToPlayer < settings.asteroids.minSpawnDistance) continue;
      }

      this.entities.push(createAsteroid(x, y, 3));
    }
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

  spawnPowerUp(x, y) {
    if (Math.random() > settings.powerUps.spawnProbability) return;

    const types = ["shield", "rapidFire", "tripleShot"];
    const type = types[Math.floor(Math.random() * types.length)];
    this.entities.push(createPowerUp(x, y, type));
  }

  spawnBullets(player, playerPowerUps) {
    const angle = player.rotation.angle;
    const direction = new Vector(Math.sin(angle), -Math.cos(angle));

    const bulletX = player.position.value.x + direction.x * 20;
    const bulletY = player.position.value.y + direction.y * 20;
    const velX = direction.x * settings.weapons.bulletSpeed;
    const velY = direction.y * settings.weapons.bulletSpeed;

    this.entities.push(createBullet(bulletX, bulletY, velX, velY));

    if (
      playerPowerUps.tripleShot &&
      playerPowerUps.tripleShot.remaining > 0
    ) {
      const spread = settings.weapons.tripleShotSpread;

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
    return true; // signals that shake should be applied
  }
}
