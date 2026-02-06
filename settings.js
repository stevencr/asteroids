// Game Configuration and Constants
// All game balance, timing, and probability settings are centralized here
// for easy tuning and modification

export const settings = {
  // Player settings
  player: {
    startingLives: 3, // Number of lives at game start
    rotationSpeed: 4, // Rotation speed in radians per second
    thrustAcceleration: 200, // Forward acceleration
    maxSpeed: 300, // Maximum movement speed
    friction: 0.99, // Velocity retention per frame (0.99 = 1% friction)
  },

  // Weapon settings
  weapons: {
    normalCooldown: 0.25, // Seconds between shots (normal)
    rapidFireCooldown: 0.15, // Seconds between shots (rapid fire power-up)
    bulletSpeed: 400, // Bullet velocity
    bulletLifetime: 2, // How long bullets last in seconds
    tripleShotSpread: 0.3, // Angle in radians between spread bullets
  },

  // Power-up settings
  powerUps: {
    spawnProbability: 0.4, // Probability (0-1) of spawning after asteroid destruction
    shieldDuration: 10, // Shield power-up duration in seconds
    rapidFireDuration: 10, // Rapid fire power-up duration in seconds
    tripleShotDuration: 20, // Triple shot power-up duration in seconds
    rotationSpeed: 1, // Rotation speed of power-up visuals
  },

  // Invulnerability settings
  invulnerability: {
    respawnDuration: 3, // Invulnerability after losing a life
    levelCompleteDuration: 3, // Invulnerability after completing a level
  },

  // Enemy settings
  enemies: {
    ufoSpawnInterval: 15, // Base UFO spawn time in seconds
    ufoSpawnVariation: 10, // Random variation added to spawn time
    ufoSpeed: 100, // UFO movement speed
    ufoShootInterval: 2, // Base time between UFO shots
    ufoShootVariation: 1, // Random variation for UFO shooting
    ufoScore: 300, // Points awarded for destroying a UFO
  },

  // Asteroid settings
  asteroids: {
    baseCount: 2, // Base number of asteroids at level 1
    levelMultiplier: 1.5, // Multiplier for additional asteroids per level
    minSpawnDistance: 100, // Minimum spawn distance from player
    speedMin: 20, // Minimum asteroid speed
    speedMax: 50, // Maximum asteroid speed
  },

  // Scoring
  scoring: {
    asteroidSize3: 100, // Points for destroying large asteroid
    asteroidSize2: 200, // Points for destroying medium asteroid
    asteroidSize1: 300, // Points for destroying small asteroid
  },

  // Visual effects
  effects: {
    explosionParticles: 20, // Particles in standard explosion
    playerDeathParticles: 40, // Particles when player dies
    ufoExplosionParticles: 30, // Particles when UFO explodes
    powerUpExplosionParticles: 15, // Particles when collecting power-up
    particleLifetimeMin: 0.5, // Minimum particle lifetime in seconds
    particleLifetimeMax: 1.5, // Maximum particle lifetime in seconds
    screenShakeDuration: 0.3, // Initial screen shake intensity
    screenShakeDecay: 1, // Screen shake decay rate per second
  },

  // Starfield settings
  starfield: {
    starCount: 100, // Number of background stars
    depths: 3, // Number of parallax layers (1, 2, 3)
  },

  // Trail settings
  trail: {
    maxPoints: 10, // Maximum trail points
    spawnInterval: 0.05, // Time between trail points
    pointLifetime: 0.3, // How long each trail point lasts
  },

  // Collision radii
  collision: {
    playerRadius: 12,
    asteroidSize3Radius: 40,
    asteroidSize2Radius: 25,
    asteroidSize1Radius: 15,
    bulletRadius: 2,
    powerUpRadius: 12,
    ufoRadius: 20,
  },
};
