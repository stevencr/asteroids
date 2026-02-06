// ECS Components - Pure data containers

import { settings } from "./settings.js";

export class Vector {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  add(v) {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  multiply(scalar) {
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }

  clone() {
    return new Vector(this.x, this.y);
  }

  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
}

// Component: Position in world space
export class Position {
  constructor(x, y) {
    this.value = new Vector(x, y);
  }
}

// Component: Velocity (movement per second)
export class Velocity {
  constructor(x = 0, y = 0) {
    this.value = new Vector(x, y);
  }
}

// Component: Rotation angle and speed
export class Rotation {
  constructor(angle = 0, speed = 0) {
    this.angle = angle;
    this.speed = speed;
  }
}

// Component: Circular collision radius
export class Collider {
  constructor(radius) {
    this.radius = radius;
  }
}

// Component: Visual representation type
export class Renderable {
  constructor(type, data = {}) {
    this.type = type; // 'player', 'asteroid', 'bullet', 'particle'
    this.data = data;
  }
}

// Component: Player-specific data
export class PlayerController {
  constructor() {
    this.thrust = false;
    this.rotationSpeed = settings.player.rotationSpeed;
    this.shootCooldown = 0;
    this.invulnerable = settings.invulnerability.respawnDuration;
  }
}

// Component: Asteroid-specific data
export class AsteroidData {
  constructor(size, points) {
    this.size = size;
    this.points = points;
  }
}

// Component: Limited lifetime
export class Lifetime {
  constructor(duration) {
    this.remaining = duration;
    this.initial = duration;
  }
}

// Component: Screen wrapping behavior
export class ScreenWrap {
  constructor() {
    this.enabled = true;
  }
}

// Component: Tags for entity identification
export class Tag {
  constructor(...tags) {
    this.tags = new Set(tags);
  }

  has(tag) {
    return this.tags.has(tag);
  }

  add(tag) {
    this.tags.add(tag);
  }
}

// Component: Star background element
export class Star {
  constructor(depth) {
    this.depth = depth; // 1-3, controls parallax speed and brightness
  }
}

// Component: Particle trail effect
export class Trail {
  constructor(length = 5) {
    this.points = [];
    this.maxLength = length;
  }
}

// Component: Power-up data
export class PowerUp {
  constructor(type) {
    this.type = type; // 'shield', 'rapidFire', 'tripleShot'
    this.pulsePhase = 0;
  }
}

// Component: UFO enemy data
export class UFOData {
  constructor() {
    this.shootCooldown = 0;
    this.direction = Math.random() > 0.5 ? 1 : -1;
    this.changeDirectionTimer = 2;
  }
}
