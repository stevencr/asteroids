# Asteroids Game - ECS Architecture

A classic Asteroids game built with vanilla JavaScript using an Entity-Component-System (ECS) architecture.

## Project Structure

```
asteroids/
├── index.html          # Minimal HTML structure
├── styles.css          # All styles separated from HTML
├── components.js       # ECS components (data containers)
├── systems.js          # ECS systems (logic processors)
├── entities.js         # Entity factory functions
├── game.js             # Main game controller
└── README.md           # This file
```

## Architecture Overview

### ECS Pattern

This project follows the **Entity-Component-System** architectural pattern:

- **Components**: Pure data containers without logic (Position, Velocity, Rotation, etc.)
- **Entities**: Collections of components that represent game objects (player, asteroids, bullets)
- **Systems**: Logic processors that operate on entities with specific components

### Benefits

- **Single Responsibility**: Each module has one clear purpose
- **Maintainability**: Easy to locate and modify specific features
- **Extensibility**: Add new components/systems without touching existing code
- **Testability**: Pure components and isolated systems are easy to test

## File Responsibilities

### `components.js`

Defines all ECS components:

- `Vector` - 2D vector math utility
- `Position`, `Velocity`, `Rotation` - Transform components
- `Collider` - Circular collision detection
- `Renderable` - Visual representation type
- `PlayerController`, `AsteroidData` - Entity-specific data
- `Lifetime`, `ScreenWrap`, `Tag` - Behavior components

### `systems.js`

Contains all game logic systems:

- `MovementSystem` - Updates positions based on velocity
- `RotationSystem` - Updates rotation angles
- `ScreenWrapSystem` - Wraps entities around screen edges
- `PlayerControlSystem` - Handles player input and controls
- `LifetimeSystem` - Removes expired entities
- `CollisionSystem` - Detects and handles collisions
- `RenderSystem` - Draws all entities to canvas

### `entities.js`

Factory functions for creating entities:

- `createPlayer()` - Player ship with controls
- `createAsteroid()` - Asteroids of varying sizes
- `createBullet()` - Player projectiles
- `createParticle()` - Explosion particles

### `game.js`

Main game controller:

- Initializes all systems
- Manages entity list
- Coordinates game loop
- Handles game state (score, level, game over)

### `styles.css`

All visual styling:

- Layout and positioning
- UI elements (score, level, controls)
- Mobile touch controls
- Responsive design

### `index.html`

Minimal HTML structure:

- Canvas element
- UI containers
- Module script loader

## How to Run

Simply open `index.html` in a modern browser. No build step required.

## Controls

### Desktop

- **Arrow Left/Right** - Rotate ship
- **Arrow Up** - Thrust
- **Space** - Shoot

### Mobile

- Touch buttons appear automatically on small screens

## Game Features

- Progressive difficulty (more asteroids each level)
- Score tracking
- Invulnerability period after level completion
- Screen shake on explosions
- Particle effects
- Responsive canvas sizing

## Adding New Features

### New Component

Add to `components.js`:

```javascript
export class MyComponent {
  constructor(data) {
    this.data = data;
  }
}
```

### New System

Add to `systems.js`:

```javascript
export class MySystem {
  update(entities, dt) {
    for (const entity of entities) {
      if (!entity.myComponent) continue;
      // Process entity
    }
  }
}
```

### New Entity

Add to `entities.js`:

```javascript
export function createMyEntity(x, y) {
  return {
    position: new Position(x, y),
    myComponent: new MyComponent(data),
    tag: new Tag("myEntity"),
  };
}
```

Then register the system in `game.js` constructor and add to the game loop.
