// Collision Handler - Processes collision responses between entity pairs (Single Responsibility)

import { createAsteroid } from "./entities.js";
import { settings } from "./settings.js";

export class CollisionHandler {
  constructor(game) {
    this.game = game;
  }

  handle(a, b) {
    const aTag = a.tag;
    const bTag = b.tag;

    this._handlePlayerVsAsteroid(a, b, aTag, bTag);
    this._handleBulletVsAsteroid(a, b, aTag, bTag);
    this._handlePlayerVsPowerUp(a, b, aTag, bTag);
    this._handlePlayerVsUFO(a, b, aTag, bTag);
    this._handleBulletVsUFO(a, b, aTag, bTag);
    this._handleEnemyBulletVsPlayer(a, b, aTag, bTag);
  }

  _handlePlayerVsAsteroid(a, b, aTag, bTag) {
    if (
      !(aTag.has("player") && bTag.has("asteroid")) &&
      !(aTag.has("asteroid") && bTag.has("player"))
    )
      return;

    const player = aTag.has("player") ? a : b;
    if (
      player.playerController &&
      player.playerController.invulnerable <= 0
    ) {
      this.game.handlePlayerDeath(player);
    }
  }

  _handleBulletVsAsteroid(a, b, aTag, bTag) {
    if (
      !(aTag.has("bullet") && bTag.has("asteroid")) &&
      !(aTag.has("asteroid") && bTag.has("bullet"))
    )
      return;

    const bullet = aTag.has("bullet") ? a : b;
    const asteroid = aTag.has("asteroid") ? a : b;

    if (bullet.lifetime) {
      bullet.lifetime.remaining = 0;
    }

    const index = this.game.entities.indexOf(asteroid);
    if (index === -1) return;

    this.game.entities.splice(index, 1);

    if (asteroid.asteroidData && asteroid.asteroidData.size > 1) {
      const pos = asteroid.position.value;
      this.game.entities.push(
        createAsteroid(pos.x, pos.y, asteroid.asteroidData.size - 1),
      );
      this.game.entities.push(
        createAsteroid(pos.x, pos.y, asteroid.asteroidData.size - 1),
      );
    }

    const scoreMap = {
      3: settings.scoring.asteroidSize3,
      2: settings.scoring.asteroidSize2,
      1: settings.scoring.asteroidSize1,
    };
    this.game.score += scoreMap[asteroid.asteroidData.size] || 100;

    this.game.spawner.spawnPowerUp(
      asteroid.position.value.x,
      asteroid.position.value.y,
    );
    this.game.spawner.createExplosion(
      asteroid.position.value.x,
      asteroid.position.value.y,
    );
    this.game.shake = settings.effects.screenShakeDuration;
  }

  _handlePlayerVsPowerUp(a, b, aTag, bTag) {
    if (
      !(aTag.has("player") && bTag.has("powerup")) &&
      !(aTag.has("powerup") && bTag.has("player"))
    )
      return;

    const powerup = aTag.has("powerup") ? a : b;
    const player = aTag.has("player") ? a : b;

    if (powerup.powerUp.type === "shield") {
      player.playerController.invulnerable = settings.powerUps.shieldDuration;
    } else if (powerup.powerUp.type === "rapidFire") {
      this.game.playerPowerUps.rapidFire.remaining =
        settings.powerUps.rapidFireDuration;
    } else if (powerup.powerUp.type === "tripleShot") {
      this.game.playerPowerUps.tripleShot.remaining =
        settings.powerUps.tripleShotDuration;
    }

    const index = this.game.entities.indexOf(powerup);
    if (index !== -1) {
      this.game.entities.splice(index, 1);
    }

    this.game.spawner.createExplosion(
      powerup.position.value.x,
      powerup.position.value.y,
      settings.effects.powerUpExplosionParticles,
      "cyan",
    );
    this.game.shake = settings.effects.screenShakeDuration;
  }

  _handlePlayerVsUFO(a, b, aTag, bTag) {
    if (
      !(aTag.has("player") && bTag.has("ufo")) &&
      !(aTag.has("ufo") && bTag.has("player"))
    )
      return;

    const player = aTag.has("player") ? a : b;
    const ufo = aTag.has("ufo") ? a : b;

    const index = this.game.entities.indexOf(ufo);
    if (index !== -1) {
      this.game.entities.splice(index, 1);
      this.game.score += settings.enemies.ufoScore;
      this.game.spawner.createExplosion(
        ufo.position.value.x,
        ufo.position.value.y,
        settings.effects.ufoExplosionParticles,
        "cyan",
      );
      this.game.shake = settings.effects.screenShakeDuration;
    }

    if (
      player.playerController &&
      player.playerController.invulnerable <= 0
    ) {
      this.game.handlePlayerDeath(player);
    }
  }

  _handleBulletVsUFO(a, b, aTag, bTag) {
    if (
      !(aTag.has("bullet") && bTag.has("ufo") && !aTag.has("enemy")) &&
      !(aTag.has("ufo") && bTag.has("bullet") && !bTag.has("enemy"))
    )
      return;

    const bullet = aTag.has("bullet") ? a : b;
    const ufo = aTag.has("ufo") ? a : b;

    if (bullet.lifetime) {
      bullet.lifetime.remaining = 0;
    }

    const index = this.game.entities.indexOf(ufo);
    if (index !== -1) {
      this.game.entities.splice(index, 1);
      this.game.score += settings.enemies.ufoScore;
      this.game.spawner.createExplosion(
        ufo.position.value.x,
        ufo.position.value.y,
        settings.effects.ufoExplosionParticles,
        "cyan",
      );
      this.game.shake = settings.effects.screenShakeDuration;
    }
  }

  _handleEnemyBulletVsPlayer(a, b, aTag, bTag) {
    if (
      !(aTag.has("bullet") && aTag.has("enemy") && bTag.has("player")) &&
      !(bTag.has("bullet") && bTag.has("enemy") && aTag.has("player"))
    )
      return;

    const bullet = aTag.has("bullet") ? a : b;
    const player = aTag.has("player") ? a : b;

    if (bullet.lifetime) {
      bullet.lifetime.remaining = 0;
    }

    if (
      player.playerController &&
      player.playerController.invulnerable <= 0
    ) {
      this.game.handlePlayerDeath(player);
    }
  }
}
