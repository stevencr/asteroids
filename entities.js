// Entity Factory - Creates entities with appropriate components

import {
  Position,
  Velocity,
  Rotation,
  Collider,
  Renderable,
  PlayerController,
  AsteroidData,
  Lifetime,
  ScreenWrap,
  Tag,
  Vector,
  Star,
  Trail,
  PowerUp,
  UFOData,
} from "./components.js";
import { settings } from "./settings.js";

// Create a player entity
export function createPlayer(x, y) {
  return {
    position: new Position(x, y),
    velocity: new Velocity(),
    rotation: new Rotation(0, 0),
    collider: new Collider(settings.collision.playerRadius),
    renderable: new Renderable("player"),
    playerController: new PlayerController(),
    trail: new Trail(settings.trail.maxPoints),
    screenWrap: new ScreenWrap(),
    tag: new Tag("player"),
  };
}

// Create an asteroid entity
export function createAsteroid(x, y, size) {
  const radiusMap = {
    3: settings.collision.asteroidSize3Radius,
    2: settings.collision.asteroidSize2Radius,
    1: settings.collision.asteroidSize1Radius,
  };
  const radius = radiusMap[size] || 15;
  const points = generateAsteroidPoints(radius);

  const speed =
    settings.asteroids.speedMin +
    Math.random() * (settings.asteroids.speedMax - settings.asteroids.speedMin);
  const angle = Math.random() * Math.PI * 2;
  const velX = Math.cos(angle) * speed;
  const velY = Math.sin(angle) * speed;

  const rotationAngle = Math.random() * Math.PI * 2;
  const rotationSpeed = (Math.random() - 0.5) * 2;

  return {
    position: new Position(x, y),
    velocity: new Velocity(velX, velY),
    rotation: new Rotation(rotationAngle, rotationSpeed),
    collider: new Collider(radius),
    renderable: new Renderable("asteroid"),
    asteroidData: new AsteroidData(size, points),
    screenWrap: new ScreenWrap(),
    tag: new Tag("asteroid"),
  };
}

// Generate random points for asteroid shape
function generateAsteroidPoints(radius) {
  const points = [];
  const numPoints = 8 + Math.floor(Math.random() * 6);
  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * Math.PI * 2;
    const r = radius * (0.8 + Math.random() * 0.4);
    points.push(new Vector(Math.cos(angle) * r, Math.sin(angle) * r));
  }
  return points;
}

// Create a bullet entity
export function createBullet(x, y, velocityX, velocityY) {
  return {
    position: new Position(x, y),
    velocity: new Velocity(velocityX, velocityY),
    collider: new Collider(settings.collision.bulletRadius),
    renderable: new Renderable("bullet"),
    lifetime: new Lifetime(settings.weapons.bulletLifetime),
    screenWrap: new ScreenWrap(),
    tag: new Tag("bullet"),
  };
}

// Create a particle entity
export function createParticle(
  x,
  y,
  velocityX,
  velocityY,
  lifetime,
  color = "white",
) {
  return {
    position: new Position(x, y),
    velocity: new Velocity(velocityX, velocityY),
    renderable: new Renderable("particle", { color }),
    lifetime: new Lifetime(lifetime),
    screenWrap: new ScreenWrap(),
    tag: new Tag("particle"),
  };
}

// Create a star entity for background
export function createStar(x, y, depth) {
  return {
    position: new Position(x, y),
    star: new Star(depth),
    renderable: new Renderable("star"),
    tag: new Tag("star"),
  };
}

// Create a power-up entity
export function createPowerUp(x, y, type) {
  return {
    position: new Position(x, y),
    velocity: new Velocity(0, 20), // Slow drift
    collider: new Collider(settings.collision.powerUpRadius),
    renderable: new Renderable("powerup"),
    powerUp: new PowerUp(type),
    lifetime: new Lifetime(8),
    tag: new Tag("powerup"),
  };
}

// Create a UFO enemy entity
export function createUFO(x, y) {
  return {
    position: new Position(x, y),
    velocity: new Velocity(settings.enemies.ufoSpeed, 0),
    rotation: new Rotation(0, 0),
    collider: new Collider(settings.collision.ufoRadius),
    renderable: new Renderable("ufo"),
    ufoData: new UFOData(),
    screenWrap: new ScreenWrap(),
    tag: new Tag("ufo", "enemy"),
  };
}
