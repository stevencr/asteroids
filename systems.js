// ECS Systems - Logic that operates on entities with specific components

import { Vector } from "./components.js";
import { settings } from "./settings.js";

// System: Update entity positions based on velocity
export class MovementSystem {
  update(entities, dt) {
    for (const entity of entities) {
      if (!entity.position || !entity.velocity) continue;

      const movement = entity.velocity.value.clone().multiply(dt);
      entity.position.value.add(movement);
    }
  }
}

// System: Update rotation based on rotation speed
export class RotationSystem {
  update(entities, dt) {
    for (const entity of entities) {
      if (!entity.rotation) continue;

      entity.rotation.angle += entity.rotation.speed * dt;
    }
  }
}

// System: Wrap entities around screen edges
export class ScreenWrapSystem {
  constructor(canvas) {
    this.canvas = canvas;
  }

  update(entities) {
    for (const entity of entities) {
      if (!entity.position || !entity.screenWrap) continue;

      const pos = entity.position.value;
      if (pos.x < 0) pos.x = this.canvas.width;
      if (pos.x > this.canvas.width) pos.x = 0;
      if (pos.y < 0) pos.y = this.canvas.height;
      if (pos.y > this.canvas.height) pos.y = 0;
    }
  }
}

// System: Handle player input and controls
export class PlayerControlSystem {
  constructor(keys) {
    this.keys = keys;
  }

  update(entities, dt) {
    for (const entity of entities) {
      if (!entity.playerController || !entity.rotation || !entity.velocity)
        continue;

      const controller = entity.playerController;

      // Handle rotation
      if (this.keys["ArrowLeft"]) {
        entity.rotation.angle -= controller.rotationSpeed * dt;
      }
      if (this.keys["ArrowRight"]) {
        entity.rotation.angle += controller.rotationSpeed * dt;
      }

      // Handle thrust
      controller.thrust = this.keys["ArrowUp"];
      if (controller.thrust) {
        const force = settings.player.thrustAcceleration;
        const direction = new Vector(
          Math.sin(entity.rotation.angle),
          -Math.cos(entity.rotation.angle),
        );
        const thrustForce = direction.multiply(force * dt);
        entity.velocity.value.add(thrustForce);
      }

      // Apply drag
      entity.velocity.value.multiply(settings.player.friction);

      // Update timers
      controller.shootCooldown = Math.max(0, controller.shootCooldown - dt);
      controller.invulnerable = Math.max(0, controller.invulnerable - dt);
    }
  }
}

// System: Decrease lifetime and mark for removal
export class LifetimeSystem {
  update(entities, dt) {
    const toRemove = [];
    for (let i = entities.length - 1; i >= 0; i--) {
      const entity = entities[i];
      if (!entity.lifetime) continue;

      entity.lifetime.remaining -= dt;
      if (entity.lifetime.remaining <= 0) {
        toRemove.push(i);
      }
    }
    // Remove expired entities
    for (const index of toRemove) {
      entities.splice(index, 1);
    }
  }
}

// System: Update particle trails
export class TrailSystem {
  update(entities, dt) {
    for (const entity of entities) {
      if (!entity.trail || !entity.position) continue;

      // Add current position to trail
      entity.trail.points.push(entity.position.value.clone());

      // Limit trail length
      if (entity.trail.points.length > entity.trail.maxLength) {
        entity.trail.points.shift();
      }
    }
  }
}

// System: Animate starfield with parallax
export class StarfieldSystem {
  constructor(playerGetter) {
    this.getPlayer = playerGetter;
  }

  update(entities, dt) {
    const player = this.getPlayer();
    if (!player || !player.velocity) return;

    for (const entity of entities) {
      if (!entity.star || !entity.position) continue;

      // Move stars opposite to player velocity for parallax effect
      const parallaxFactor = entity.star.depth * 0.1;
      entity.position.value.x -= player.velocity.value.x * parallaxFactor * dt;
      entity.position.value.y -= player.velocity.value.y * parallaxFactor * dt;

      // Wrap stars around screen
      const canvas = document.getElementById("gameCanvas");
      if (entity.position.value.x < 0) entity.position.value.x = canvas.width;
      if (entity.position.value.x > canvas.width) entity.position.value.x = 0;
      if (entity.position.value.y < 0) entity.position.value.y = canvas.height;
      if (entity.position.value.y > canvas.height) entity.position.value.y = 0;
    }
  }
}

// System: UFO behavior and shooting
export class UFOSystem {
  constructor(spawnBullet) {
    this.spawnBullet = spawnBullet;
  }

  update(entities, dt, playerPos) {
    for (const entity of entities) {
      if (!entity.ufoData || !entity.velocity || !entity.position) continue;

      const ufo = entity.ufoData;

      // Change direction periodically
      ufo.changeDirectionTimer -= dt;
      if (ufo.changeDirectionTimer <= 0) {
        ufo.direction *= -1;
        entity.velocity.value.x = ufo.direction * 80;
        ufo.changeDirectionTimer = 1 + Math.random() * 2;
      }

      // Shoot at player
      ufo.shootCooldown -= dt;
      if (ufo.shootCooldown <= 0 && playerPos) {
        const dx = playerPos.x - entity.position.value.x;
        const dy = playerPos.y - entity.position.value.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 0) {
          const accuracy = 0.85; // Not perfect aim
          const targetAngle = Math.atan2(dy, dx);
          const spread = (Math.random() - 0.5) * (1 - accuracy);
          const angle = targetAngle + spread;

          const speed = 300;
          this.spawnBullet(
            entity.position.value.x,
            entity.position.value.y,
            Math.cos(angle) * speed,
            Math.sin(angle) * speed,
            "enemy",
          );
        }

        ufo.shootCooldown = 1.5;
      }
    }
  }
}

// System: Power-up animation
export class PowerUpSystem {
  update(entities, dt) {
    for (const entity of entities) {
      if (!entity.powerUp) continue;

      // Animate pulsing effect
      entity.powerUp.pulsePhase += dt * 3;
    }
  }
}

// System: Check and handle collisions
export class CollisionSystem {
  constructor(onCollision) {
    this.onCollision = onCollision;
  }

  update(entities) {
    const colliders = entities.filter((e) => e.collider && e.position);

    for (let i = 0; i < colliders.length; i++) {
      for (let j = i + 1; j < colliders.length; j++) {
        const a = colliders[i];
        const b = colliders[j];

        const dx = a.position.value.x - b.position.value.x;
        const dy = a.position.value.y - b.position.value.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = a.collider.radius + b.collider.radius;

        if (distance < minDistance) {
          this.onCollision(a, b);
        }
      }
    }
  }
}

// System: Render all entities
export class RenderSystem {
  constructor(ctx) {
    this.ctx = ctx;
  }

  render(entities, shake = 0, gameOver = false) {
    const ctx = this.ctx;
    const canvas = ctx.canvas;

    // Clear canvas
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Render stars first (background layer)
    for (const entity of entities) {
      if (entity.star && entity.position) {
        this.renderStar(entity, entity.position.value);
      }
    }

    ctx.save();

    // Apply screen shake
    if (shake > 0) {
      const magnitude = 10 * (shake / 0.3);
      ctx.translate(
        Math.random() * magnitude - magnitude / 2,
        Math.random() * magnitude - magnitude / 2,
      );
    }

    // Render all entities
    for (const entity of entities) {
      if (!entity.renderable || !entity.position) continue;

      const renderable = entity.renderable;
      const pos = entity.position.value;

      // Render trails first (behind entities)
      if (entity.trail) {
        this.renderTrail(entity);
      }

      switch (renderable.type) {
        case "player":
          this.renderPlayer(entity, pos);
          break;
        case "asteroid":
          this.renderAsteroid(entity, pos);
          break;
        case "bullet":
          this.renderBullet(pos);
          break;
        case "particle":
          this.renderParticle(entity, pos);
          break;
        case "powerup":
          this.renderPowerUp(entity, pos);
          break;
        case "ufo":
          this.renderUFO(entity, pos);
          break;
      }
    }

    ctx.restore();

    // Draw game over screen
    if (gameOver) {
      ctx.fillStyle = "white";
      ctx.font = '48px "Courier New"';
      ctx.textAlign = "center";
      ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
      ctx.font = '24px "Courier New"';
      ctx.fillText(
        "Press SPACE to restart",
        canvas.width / 2,
        canvas.height / 2 + 40,
      );
    }
  }

  renderPlayer(entity, pos) {
    const controller = entity.playerController;
    const ctx = this.ctx;
    const time = performance.now() / 1000;

    ctx.save();
    ctx.translate(pos.x, pos.y);
    ctx.rotate(entity.rotation.angle);

    // Shield bubble (when invulnerable)
    if (controller && controller.invulnerable > 0) {
      const shieldPulse = Math.sin(time * 4) * 0.15 + 0.85;
      const shieldRadius = 26 * shieldPulse;

      // Outer glow ring
      ctx.strokeStyle = `rgba(0, 255, 255, ${0.2 + Math.sin(time * 6) * 0.1})`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, shieldRadius + 3, 0, Math.PI * 2);
      ctx.stroke();

      // Main shield
      ctx.strokeStyle = `rgba(0, 255, 255, ${0.5 + Math.sin(time * 3) * 0.2})`;
      ctx.fillStyle = `rgba(0, 255, 255, ${0.05 + Math.sin(time * 5) * 0.03})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, shieldRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Hexagonal facets on shield
      ctx.strokeStyle = `rgba(0, 255, 255, ${0.15 + Math.sin(time * 2) * 0.05})`;
      ctx.lineWidth = 1;
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 + time * 0.5;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a) * shieldRadius, Math.sin(a) * shieldRadius);
        ctx.stroke();
      }
      ctx.lineWidth = 1;
    }

    // Engine thrust (drawn behind the ship)
    if (controller && controller.thrust) {
      const flicker = 0.7 + Math.random() * 0.3;
      const thrustLen = (12 + Math.random() * 8) * flicker;

      // Outer flame (orange-red)
      ctx.fillStyle = `rgba(255, 100, 20, ${0.6 * flicker})`;
      ctx.beginPath();
      ctx.moveTo(-5, 13);
      ctx.lineTo(0, 13 + thrustLen);
      ctx.lineTo(5, 13);
      ctx.closePath();
      ctx.fill();

      // Middle flame (yellow)
      ctx.fillStyle = `rgba(255, 200, 50, ${0.7 * flicker})`;
      ctx.beginPath();
      ctx.moveTo(-3.5, 13);
      ctx.lineTo(0, 13 + thrustLen * 0.7);
      ctx.lineTo(3.5, 13);
      ctx.closePath();
      ctx.fill();

      // Inner flame (white-hot core)
      ctx.fillStyle = `rgba(255, 255, 220, ${0.9 * flicker})`;
      ctx.beginPath();
      ctx.moveTo(-1.5, 13);
      ctx.lineTo(0, 13 + thrustLen * 0.4);
      ctx.lineTo(1.5, 13);
      ctx.closePath();
      ctx.fill();

      // Engine glow halo
      ctx.shadowBlur = 15;
      ctx.shadowColor = "rgba(255, 150, 50, 0.6)";
      ctx.fillStyle = "rgba(255, 120, 30, 0.15)";
      ctx.beginPath();
      ctx.arc(0, 15, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Ship hull glow
    ctx.shadowBlur = 8;
    ctx.shadowColor = "rgba(0, 200, 255, 0.4)";

    // Main hull (filled with dark interior)
    ctx.fillStyle = "rgba(10, 20, 40, 0.9)";
    ctx.strokeStyle = "#8cf";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, -18); // Nose
    ctx.lineTo(4, -6); // Right shoulder
    ctx.lineTo(12, 14); // Right wingtip
    ctx.lineTo(6, 11); // Right inner wing
    ctx.lineTo(4, 14); // Right engine
    ctx.lineTo(-4, 14); // Left engine
    ctx.lineTo(-6, 11); // Left inner wing
    ctx.lineTo(-12, 14); // Left wingtip
    ctx.lineTo(-4, -6); // Left shoulder
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.shadowBlur = 0;

    // Wing panel lines (structural detail)
    ctx.strokeStyle = "rgba(100, 180, 255, 0.3)";
    ctx.lineWidth = 1;
    // Left wing line
    ctx.beginPath();
    ctx.moveTo(-3, -2);
    ctx.lineTo(-9, 12);
    ctx.stroke();
    // Right wing line
    ctx.beginPath();
    ctx.moveTo(3, -2);
    ctx.lineTo(9, 12);
    ctx.stroke();

    // Cockpit window
    ctx.fillStyle = "rgba(0, 200, 255, 0.25)";
    ctx.strokeStyle = "rgba(0, 200, 255, 0.6)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, -14);
    ctx.lineTo(2.5, -5);
    ctx.lineTo(0, -2);
    ctx.lineTo(-2.5, -5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Engine nozzle accents
    ctx.fillStyle = "rgba(255, 150, 50, 0.5)";
    ctx.fillRect(-4, 13, 2, 2);
    ctx.fillRect(2, 13, 2, 2);

    // Wingtip lights (blinking)
    const blink = Math.sin(time * 8) > 0;
    if (blink) {
      ctx.fillStyle = "#f44";
      ctx.beginPath();
      ctx.arc(-12, 14, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#4f4";
      ctx.beginPath();
      ctx.arc(12, 14, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  renderAsteroid(entity, pos) {
    if (!entity.asteroidData || !entity.rotation) return;

    this.ctx.save();
    this.ctx.translate(pos.x, pos.y);
    this.ctx.rotate(entity.rotation.angle);

    this.ctx.strokeStyle = "white";
    this.ctx.beginPath();
    const points = entity.asteroidData.points;
    const first = points[0];
    this.ctx.moveTo(first.x, first.y);
    for (let i = 1; i < points.length; i++) {
      this.ctx.lineTo(points[i].x, points[i].y);
    }
    this.ctx.closePath();
    this.ctx.stroke();

    this.ctx.restore();
  }

  renderBullet(pos) {
    this.ctx.fillStyle = "white";
    this.ctx.beginPath();
    this.ctx.arc(pos.x, pos.y, 2, 0, Math.PI * 2);
    this.ctx.fill();
  }

  renderParticle(entity, pos) {
    if (!entity.lifetime) return;

    const alpha = entity.lifetime.remaining / entity.lifetime.initial;
    const color = entity.renderable.data.color || "white";

    // Color mapping for different particle types
    let rgb = "255, 255, 255";
    if (color === "orange") rgb = "255, 150, 50";
    else if (color === "cyan") rgb = "0, 255, 255";
    else if (color === "red") rgb = "255, 50, 50";

    this.ctx.fillStyle = `rgba(${rgb}, ${alpha})`;
    this.ctx.beginPath();
    this.ctx.arc(pos.x, pos.y, 1, 0, Math.PI * 2);
    this.ctx.fill();
  }

  renderStar(entity, pos) {
    const depth = entity.star.depth;
    const brightness = depth === 1 ? 0.3 : depth === 2 ? 0.6 : 1.0;
    const size = depth === 1 ? 0.5 : depth === 2 ? 1 : 1.5;

    this.ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
    this.ctx.fillRect(pos.x, pos.y, size, size);
  }

  renderTrail(entity) {
    if (!entity.trail || entity.trail.points.length < 2) return;

    const ctx = this.ctx;
    const points = entity.trail.points;
    const len = points.length;

    for (let i = 1; i < len; i++) {
      const alpha = (i / len) * 0.4;
      const width = (i / len) * 2.5;
      ctx.strokeStyle = `rgba(80, 160, 255, ${alpha})`;
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo(points[i - 1].x, points[i - 1].y);
      ctx.lineTo(points[i].x, points[i].y);
      ctx.stroke();
    }
  }

  renderPowerUp(entity, pos) {
    if (!entity.powerUp) return;

    const pulse = Math.sin(entity.powerUp.pulsePhase) * 0.3 + 1;
    const size = 12 * pulse;

    this.ctx.save();
    this.ctx.translate(pos.x, pos.y);

    // Different colors for different power-up types
    let color = "#0ff";
    if (entity.powerUp.type === "shield") color = "#00f8ff";
    else if (entity.powerUp.type === "rapidFire") color = "#ff0";
    else if (entity.powerUp.type === "tripleShot") color = "#f0f";

    // Outer glow
    this.ctx.shadowBlur = 15;
    this.ctx.shadowColor = color;

    // Draw diamond
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(0, -size);
    this.ctx.lineTo(size, 0);
    this.ctx.lineTo(0, size);
    this.ctx.lineTo(-size, 0);
    this.ctx.closePath();
    this.ctx.stroke();

    // Inner icon
    this.ctx.shadowBlur = 0;
    this.ctx.fillStyle = color;
    this.ctx.font = "12px Arial";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    const icon =
      entity.powerUp.type === "shield"
        ? "◆"
        : entity.powerUp.type === "rapidFire"
          ? "»"
          : "∗";
    this.ctx.fillText(icon, 0, 0);

    this.ctx.restore();
  }

  renderUFO(entity, pos) {
    this.ctx.save();
    this.ctx.translate(pos.x, pos.y);

    // UFO body with glow
    this.ctx.shadowBlur = 10;
    this.ctx.shadowColor = "#0f0";
    this.ctx.strokeStyle = "#0f0";
    this.ctx.lineWidth = 2;

    // Top dome
    this.ctx.beginPath();
    this.ctx.arc(0, -5, 8, 0, Math.PI, true);
    this.ctx.stroke();

    // Middle saucer
    this.ctx.beginPath();
    this.ctx.moveTo(-15, -5);
    this.ctx.lineTo(-10, 0);
    this.ctx.lineTo(10, 0);
    this.ctx.lineTo(15, -5);
    this.ctx.moveTo(-10, 0);
    this.ctx.lineTo(-6, 5);
    this.ctx.lineTo(6, 5);
    this.ctx.lineTo(10, 0);
    this.ctx.stroke();

    // Lights
    this.ctx.shadowBlur = 5;
    this.ctx.fillStyle = "#0ff";
    for (let i = -1; i <= 1; i++) {
      this.ctx.beginPath();
      this.ctx.arc(i * 6, 0, 1.5, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.restore();
  }
}
