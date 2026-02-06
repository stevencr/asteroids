Copilot instructions
=====================

Purpose
-------
Provide brief, actionable guidance for an AI coding assistant working in this Asteroids game repository built with ECS architecture.

Architecture
------------
This project uses an **Entity-Component-System (ECS)** pattern:
- **Components** (`components.js`): Pure data containers, no logic
- **Systems** (`systems.js`): Logic that processes entities with specific components
- **Entities** (`entities.js`): Factory functions that assemble components
- **Game** (`game.js`): Orchestrates systems and manages game state

Key rules
---------
- **Separation of concerns**: Keep components pure data, put all logic in systems
- **Single responsibility**: Each file has one clear purpose - respect boundaries
- **No mixing**: Don't put rendering logic in components or data in systems
- **Follow existing patterns**: New components/systems should mirror existing structure
- **Test changes**: Use `python -m http.server 8000` and check browser console for errors
- **No dependencies**: This is vanilla JS - keep it that way

Adding features
---------------
1. **New component**: Add to `components.js` as a class with constructor
2. **New system**: Add to `systems.js` with `update(entities, dt)` method
3. **New entity**: Add factory function to `entities.js` that returns component object
4. **Wire up**: Register system in `game.js` constructor and call in game loop

Modifying systems
-----------------
- Systems iterate over entities and check for required components
- Always check component existence before accessing: `if (!entity.myComponent) continue`
- Keep systems focused on one responsibility (movement, rendering, collision, etc.)

File structure
--------------
- `index.html` - Minimal HTML, loads game module
- `styles.css` - All visual styling
- `components.js` - Component definitions
- `systems.js` - System implementations  
- `entities.js` - Entity factories
- `game.js` - Main controller

Testing
-------
Run local server to test: `python -m http.server 8000` then open `http://localhost:8000`

Communication
-------------
- Provide concise explanations for non-obvious architectural choices
- Reference specific systems/components when discussing changes
- Ask clarifying questions if requirements are ambiguous

Contact
-------
If unsure about architectural decisions, request clarification before making changes.
