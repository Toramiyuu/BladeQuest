# Phase 1: Core Prototype Implementation Plan

Created: 2026-02-19
Status: VERIFIED
Approved: Yes
Iterations: 0
Worktree: Yes

> **Status Lifecycle:** PENDING → COMPLETE → VERIFIED
> **Iterations:** Tracks implement→verify cycles (incremented by verify phase)
>
> - PENDING: Initial state, awaiting implementation
> - COMPLETE: All tasks implemented
> - VERIFIED: All checks passed
>
> **Approval Gate:** Implementation CANNOT proceed until `Approved: Yes`
> **Worktree:** Set at plan creation (from dispatcher). `Yes` uses git worktree isolation; `No` works directly on current branch (default)

## Summary

**Goal:** Build the Phase 1 core prototype for Blade Quest: Shattered Realms — player movement with tight controls, a 3-hit sword combo system, one enemy type (Slime), and one test level with tilemap collision. The goal is to validate the core game feel before expanding scope.

**Architecture:** Phaser 3 with Arcade Physics, vanilla JavaScript ES modules. The project uses Vite for dev server and bundling. Game logic (state machines, combat frame data, AI decisions) is separated from Phaser rendering code into pure testable modules. Scenes follow the standard Phaser pattern: BootScene (loading), GameScene (gameplay), UIScene (HUD overlay).

**Tech Stack:** Phaser 3 (latest), Vite (dev/build), Vitest (unit tests), Arcade Physics, Tiled JSON tilemaps, programmatically generated placeholder art.

## Scope

### In Scope

- Project scaffolding (Vite + Phaser 3 + Vitest)
- Scene architecture (Boot, Game, UI overlay)
- Player movement: walk/run with acceleration, variable-height jump, coyote time (6 frames)
- Player sprite animations: idle, run, jump, fall
- Sword combat: 3-hit combo (Slash → Slash → Heavy Slash), airborne downward slash, hitbox frame data
- Health system: 5 hearts, invincibility frames (1.5s), knockback, death/respawn
- Slime enemy: ground patrol, contact damage, 1-hit kill, death effect
- Test level: Tiled JSON tilemap, platform collision, camera follow
- HUD: health hearts display
- Camera: smooth follow with directional lead, lazy vertical

### Out of Scope

- Special abilities (Spin Attack, Blade Beam, Parry) — Phase 2
- Additional enemy types (Bat, Skeleton, etc.) — Phase 2
- Multiple worlds/stages — Phase 3
- Boss encounters — Phase 4
- Upgrade Forge / shop — Phase 5
- Save system, checkpoints — Phase 5
- Audio/SFX — Phase 6
- Mobile touch controls — Phase 5+
- Gamepad support — Phase 5
- Double jump, wall slide/jump (unlockable abilities) — Phase 2+
- Dash mechanic — Phase 2+
- Camera arena lock (for boss/wave encounters) — Phase 2+

## Prerequisites

- Node.js (v18+) and npm installed
- A code editor and modern browser (Chrome/Firefox)
- Tiled Map Editor for level design (or hand-craft the JSON)

## Context for Implementer

> This section is critical for cross-session continuity. Write it for an implementer who has never seen the codebase.

- **Patterns to follow:** Standard Phaser 3 class-based scenes (`class GameScene extends Phaser.Scene`). Entities (Player, Slime) extend `Phaser.Physics.Arcade.Sprite` with custom logic methods. All magic numbers go in `src/config/constants.js`.
- **Conventions:** ES modules (`import/export`), vanilla JavaScript (no TypeScript). Files organized by concern: `src/scenes/`, `src/entities/`, `src/systems/`, `src/config/`. Filenames are PascalCase for classes, camelCase for utilities.
- **Key files:**
  - `src/main.js` — Game config and Phaser.Game instantiation
  - `src/config/constants.js` — All tunable values (physics, combat frame data, enemy stats)
  - `src/scenes/GameScene.js` — Core gameplay scene
  - `src/entities/Player.js` — Player entity with movement and combat
  - `src/entities/Slime.js` — Slime enemy entity
- **Gotchas:**
  - Phaser Arcade Physics is AABB only — no slopes, no angled colliders. Terrain must be flat/staircase.
  - Game resolution is 480x270 (pixel art), scaled up via Phaser's `scale` config (FIT mode). All position values are in game pixels, not screen pixels.
  - **All timing uses milliseconds with accumulated delta-time**, not frame counting. Phaser's `update(time, delta)` provides delta in ms. Use `Phaser.Math.Clamp(delta, 0, 50)` to cap delta spikes from tab switches — **apply this clamp once at the top of Player.update() and Slime.update(), then pass the clamped `dt` to ALL subsystems** (CombatSystem, HealthSystem, CoyoteTimer, SlimeAI). Pure logic modules should also self-defend: `deltaMs = Math.min(deltaMs, 50)` at the top of their update methods. Constants file stores values in ms (e.g., `COYOTE_TIME_MS = 100`, `INVULNERABILITY_MS = 1500`) with comments showing 60fps frame equivalents. This ensures frame-rate independence.
  - Hitboxes for combat are pre-allocated invisible physics bodies toggled via `body.enable`, not created/destroyed mid-frame (which corrupts Phaser's Arcade physics world).
- **Domain context:**
  - This is a 2D side-scrolling action platformer inspired by Kirby, Mario, and Hollow Knight
  - "Game feel" is the #1 priority — movement should feel responsive and tight
  - Combat uses frame data: each attack has wind-up frames (cannot hit), active frames (hitbox exists), recovery frames (committed, can't act)
  - The 3-hit combo has a timing window between hits — press attack during recovery of hit N to queue hit N+1

## Runtime Environment

- **Start command:** `npx vite` (dev server with HMR)
- **Port:** 5173 (Vite default)
- **Health check:** Open `http://localhost:5173` — should show the game canvas
- **Build:** `npx vite build` → outputs to `dist/`

## Progress Tracking

**MANDATORY: Update this checklist as tasks complete. Change `[ ]` to `[x]`.**

- [x] Task 1: Project scaffolding & scene architecture
- [x] Task 2: Player movement & physics
- [x] Task 3: Player sprite animations
- [x] Task 4: Sword combat — 3-hit combo system
- [x] Task 5: Health, damage & invincibility
- [x] Task 6: Slime enemy
- [x] Task 7: Test level with tilemap & camera
- [x] Task 8: HUD — health hearts display

**Total Tasks:** 8 | **Completed:** 8 | **Remaining:** 0

## Implementation Tasks

### Task 1: Project Scaffolding & Scene Architecture

**Objective:** Set up the Phaser 3 project with Vite dev server, testing infrastructure, scene skeleton, and game configuration matching the PRD specs (480x270 resolution, Arcade Physics).

**Dependencies:** None

**Files:**

- Create: `package.json`
- Create: `index.html`
- Create: `src/main.js`
- Create: `src/config/constants.js`
- Create: `src/scenes/BootScene.js`
- Create: `src/scenes/GameScene.js`
- Create: `src/scenes/UIScene.js`
- Create: `vite.config.js`
- Create: `vitest.config.js`

**Key Decisions / Notes:**

- Game config: `type: Phaser.AUTO`, resolution `480x270`, scale mode `Phaser.Scale.FIT` with `autoCenter: Phaser.Scale.CENTER_BOTH`, **`pixelArt: true`** (enables `roundPixels` and nearest-neighbor filtering globally — prevents sub-pixel bleed and tile seams at non-integer scale factors), `roundPixels: true`
- Arcade Physics with `gravity.y: 800` (tunable in constants)
- Vite for zero-config dev server with HMR — use `vite-plugin-static-copy` or public folder for assets
- Vitest for unit testing pure logic modules (state machines, calculations). **Critical Vitest config:** In `vitest.config.js`, set `resolve.alias` to map `phaser` to an empty stub module (e.g., `tests/__mocks__/phaser.js` exporting `{}`) so Phaser's browser globals never crash the test runner. Only include test files from `tests/systems/` and `tests/config/` — never scan scene or entity files directly.
- BootScene loads all assets, initializes the shared EventEmitter on the game registry (`this.registry.set('events', new Phaser.Events.EventEmitter())`), and transitions to GameScene
- GameScene is the core gameplay scene — it creates the player, enemies, tilemap, and physics
- UIScene runs in parallel (`this.scene.launch('UIScene')` from GameScene) as a HUD overlay
- `constants.js` centralizes all tunable values: gravity, player speed, jump force, coyote frames, combo timing, etc.
- Place placeholder assets in `public/assets/` — a simple colored rectangle spritesheet for the player and basic tiles

**Definition of Done:**

- [ ] `npm install` succeeds with phaser and vite dependencies
- [ ] `npx vite` starts dev server and game canvas renders at 480x270 scaled to window
- [ ] BootScene loads, transitions to GameScene with a visible background color
- [ ] UIScene launches in parallel and renders on top of GameScene
- [ ] `npx vitest run` executes and finds the test configuration (even if no tests yet)
- [ ] `constants.js` exports physics and game configuration values (all timing values in milliseconds)
- [ ] `pixelArt: true` and `roundPixels: true` set in game config — no sub-pixel bleed visible at non-integer scale factors

**Verify:**

- `cd <worktree> && npm install && npx vite build` — build succeeds with exit code 0
- `npx vitest run` — test runner executes successfully
- Open `http://localhost:5173` via playwright-cli — canvas visible at correct resolution

---

### Task 2: Player Movement & Physics

**Objective:** Implement the Player entity with responsive movement: horizontal walk/run with acceleration curves, variable-height jumping (hold for higher), coyote time (6 frames for forgiving ledge jumps), and ground detection. This is the foundation of game feel.

**Dependencies:** Task 1

**Files:**

- Create: `src/entities/Player.js`
- Modify: `src/scenes/GameScene.js`
- Modify: `src/config/constants.js`
- Create: `src/systems/StateMachine.js`
- Create: `src/systems/InputBuffer.js`
- Create: `tests/systems/StateMachine.test.js`
- Create: `tests/systems/InputBuffer.test.js`
- Create: `tests/config/constants.test.js`

**Key Decisions / Notes:**

- Player extends `Phaser.Physics.Arcade.Sprite`
- Movement uses acceleration-based physics, not direct velocity setting. Set `body.setMaxVelocity()` and `body.setDragX()` for responsive start/stop feel.
- Variable jump: on jump press, apply initial `JUMP_VELOCITY` (e.g., -300). While jump held AND `velocityY < 0` AND `jumpHoldMs < JUMP_HOLD_MAX_MS` (250ms), apply `body.setGravityY(JUMP_GRAVITY_REDUCTION)` (e.g., -500, partially counteracting world gravity of 800). On release or when hold timer expires or at apex, set `body.setGravityY(0)` to restore full gravity. Constants in `constants.js`: `JUMP_VELOCITY`, `JUMP_GRAVITY_REDUCTION`, `JUMP_HOLD_MAX_MS`. Target: tap jump reaches ~2 tiles height (64px at 32px tiles), hold jump reaches ~4 tiles height (128px).
- Coyote time: extract into `InputBuffer.js` — a pure JS class with `CoyoteTimer` that accepts `(isGrounded, jumpPressed, deltaMs)` inputs and outputs `canJump`. Track `coyoteMs` (starts at `COYOTE_TIME_MS = 100`, i.e. ~6 frames at 60fps). When player walks off a ledge (was grounded, now airborne, didn't jump), decrement `coyoteMs` by `deltaMs` each update. Allow jump while `coyoteMs > 0`. Reset to 0 once a jump is consumed. Fully unit-testable with no Phaser dependency.
- StateMachine is a pure JS class (no Phaser dependency) — tracks states (`idle`, `run`, `jump`, `fall`, and attack states `attack1`, `attack2`, `attack3`, `air_attack` added in Task 4) with enter/exit/update callbacks. Fully unit-testable. Task 2 creates the StateMachine with movement states only; Task 4 adds attack states and the interaction contract between StateMachine and CombatSystem.
- For now, use a simple colored rectangle sprite (`this.scene.add.rectangle()` or generate a texture) until Task 3 adds real sprites.
- Create a temporary ground platform using `this.physics.add.staticGroup()` for testing movement before the tilemap exists (Task 7).
- Input: `this.input.keyboard.addKeys('W,A,S,D,UP,LEFT,DOWN,RIGHT,SPACE')` — support both WASD and arrows.

**Definition of Done:**

- [ ] Player spawns in GameScene and stands on a ground platform
- [ ] Left/right movement has acceleration ramp-up and drag-based deceleration (not instant)
- [ ] Jump height varies based on how long the jump key is held: tap jump reaches ~2 tiles height (64px), hold jump reaches ~4 tiles height (128px)
- [ ] Coyote time allows jumping within 100ms (`COYOTE_TIME_MS`) of leaving a ledge without a jump input; verified by CoyoteTimer unit test passing with deltaMs accumulation
- [ ] Player cannot double-jump (only one jump until grounded again)
- [ ] StateMachine unit tests pass: state transitions, enter/exit callbacks fire correctly
- [ ] CoyoteTimer unit tests pass: canJump is true within 100ms of leaving ground without jumping, false after 100ms, resets to false after jump consumed
- [ ] Constants test verifies all movement values are exported and are numbers

**Verify:**

- `npx vitest run` — all unit tests pass
- Open game in browser — player moves left/right smoothly, jumps with variable height, coyote time works at ledge edges

---

### Task 3: Player Sprite Animations

**Objective:** Replace the placeholder rectangle with a programmatically-generated animated sprite. Using Phaser Graphics and `generateTexture()`, create multi-frame textures for each animation state (idle, run, jump, fall) in BootScene, then wire them to the player state machine. Sprite flips based on facing direction.

**Dependencies:** Task 2

**Files:**

- Modify: `src/entities/Player.js`
- Modify: `src/scenes/BootScene.js`
- Create: `public/assets/sprites/player.png` (placeholder spritesheet)
- Create: `public/assets/sprites/player.json` (atlas data, if using atlas format)
- Create: `CREDITS.md` (if using third-party assets)

**Key Decisions / Notes:**

- **ALL Phase 1 placeholder assets are generated programmatically** in BootScene. This avoids external asset dependencies, keeps visual consistency, and eliminates licensing concerns. Use a consistent color palette: blue=player, green=slime, brown=ground tiles, red=hearts.
- **Spritesheet generation approach:** Use Phaser's `Graphics` API to draw all animation frames side-by-side on a single canvas, then register the result as a spritesheet. Specifically: create a `Phaser.GameObjects.Graphics` object, draw frame 0 at x=0, frame 1 at x=frameWidth, etc. Call `graphics.generateTexture('player-idle-sheet', totalWidth, frameHeight)`, then register it as a spritesheet via `this.textures.addSpriteSheet('player-idle', { url: this.textures.get('player-idle-sheet').getSourceImage() }, { frameWidth, frameHeight })`. Then `this.anims.create({ key: 'player-idle', frames: this.anims.generateFrameNumbers('player-idle', { start: 0, end: 3 }), ... })` works as normal. **NOTE:** Phaser's `anims.create()` frames array requires a SINGLE texture key with frame indices — you CANNOT pass a list of different texture keys. All frames for one animation must be on a single spritesheet texture.
- **Fallback if RenderTexture/spritesheet registration is problematic:** Use single-frame textures per state (one `generateTexture()` per animation state — `player-idle`, `player-run`, `player-jump`, `player-fall`). Wire these as static sprites that swap texture key on state change (`player.setTexture('player-run')`). This loses frame-by-frame animation but keeps the state machine wired. Multi-frame animation can then be added iteratively once the base system works.
- Free itch.io asset packs are deferred to Phase 2+ when game feel is validated and real art is appropriate.
- Animation keys: `player-idle`, `player-run`, `player-jump`, `player-fall`
- Wire animations to StateMachine states: when entering `idle` state → play `player-idle`, entering `run` → play `player-run`, etc.
- `player.setFlipX(true/false)` based on last horizontal input direction.
- Jump uses a single frame (arms up), fall uses a single frame (arms down). These can be expanded later.

**Definition of Done:**

- [ ] Player renders as an animated sprite (not a colored rectangle)
- [ ] Idle animation plays when standing still (loops)
- [ ] Run animation plays when moving horizontally (loops)
- [ ] Jump frame shows when ascending, fall frame shows when descending
- [ ] Sprite flips horizontally to face movement direction
- [ ] Animations transition smoothly between states (no flickering)
- [ ] If any third-party asset packs are used, CREDITS.md exists in the project root listing asset name, author, license, and source URL

**Verify:**

- Open game in browser — visually confirm all animation states play correctly during movement
- `npx vitest run` — no regressions in existing tests

---

### Task 4: Sword Combat — 3-Hit Combo System

**Objective:** Implement the melee combat system with a 3-hit combo chain (Slash → Slash → Heavy Slash). Each attack has wind-up, active hitbox, and recovery frames. The combo has a timing window for chaining hits. Airborne downward slash bounces off enemies. Heavy slash has knockback.

**Dependencies:** Task 2

**Files:**

- Create: `src/systems/CombatSystem.js`
- Create: `tests/systems/CombatSystem.test.js`
- Modify: `src/entities/Player.js`
- Modify: `src/config/constants.js`
- Modify: `src/scenes/GameScene.js`

**Key Decisions / Notes:**

- CombatSystem is a pure logic module that tracks combo state and timing via accumulated delta-ms. It does NOT depend on Phaser — it's a state machine that accepts inputs (`attackJustPressed`, `isAirborne`, `deltaMs`) and outputs actions (`startSwing`, `activateHitbox`, `endRecovery`, `applyKnockback`). Fully unit-testable.
- **CRITICAL: `attackJustPressed` must be edge-triggered (true only on the frame the key is first pressed), NOT level-triggered (held).** In Player.js, use `Phaser.Input.Keyboard.JustDown(attackKey)` for combo input, not `attackKey.isDown`. This prevents held keys from accidentally chaining combos.
- Frame data (in constants.js, all values in milliseconds):
  - Slash 1: 50ms wind-up, 67ms active, 83ms recovery = 200ms total (~12 frames at 60fps)
  - Slash 2: 50ms wind-up, 67ms active, 83ms recovery = 200ms total
  - Heavy Slash: 83ms wind-up, 100ms active, 133ms recovery = 316ms total (~19 frames)
  - Air Slash: 33ms wind-up, 100ms active, 67ms recovery = 200ms total
- Combo window: during the last 67ms of recovery (~4 frames), pressing attack (JustDown) queues the next combo hit. If no input → return to idle. Inputs before the combo window opens are ignored (not buffered).
- Hitbox implementation in Player.js: use **pre-allocated, always-present** hitbox bodies that are toggled via `body.enable = true/false`. Create ONE invisible hitbox sprite per attack type (ground combo, air slash) at scene creation time, add them to the physics world permanently, and keep `body.enable = false` by default. During active frames: enable the hitbox body, position it in front of the player. After active frames end: disable it. Use a `hitEnemies` Set to prevent multi-hit within the same active window — reset the Set when the hitbox deactivates. **NEVER create or destroy physics bodies mid-frame** — this causes Phaser 3 Arcade physics world corruption and stale overlap callbacks.
- Hitbox position: offset from player center in facing direction. Size varies per attack type. Position updated each frame during active window.
- Heavy slash applies horizontal knockback force to hit enemies via `body.setVelocityX()`.
- Air downward slash: if airborne + attack pressed, player moves downward quickly. On hitting an enemy, player bounces upward. **Bounce implementation:** In the `onSlimeHit` overlap callback, if the player is airborne AND in air slash active frames, immediately apply `player.body.setVelocityY(-bounceForce)` directly in the callback (not deferred to next frame). Additionally, set `player.justBounced = true` and `player.bounceGuardMs = BOUNCE_GUARD_MS` (50ms). In Player's update, if `justBounced` is true, decrement `bounceGuardMs` by `deltaMs`. While `bounceGuardMs > 0`, if `body.blocked.down` (ground collision cancelling the bounce), re-apply `body.setVelocityY(-bounceForce)` — this handles the case where the enemy is at ground level and the player contacts the floor in the same physics step. Clear `justBounced` when `bounceGuardMs` reaches 0. On successful bounce, skip recovery frames and return to jump/fall state.
- **StateMachine / CombatSystem interaction contract:** The movement StateMachine must include attack states (`attack1`, `attack2`, `attack3`, `air_attack`) in addition to `idle`, `run`, `jump`, `fall`. When CombatSystem starts an attack, it drives a transition into the corresponding attack state. The StateMachine's `enter` callback for attack states plays the correct attack animation. Movement code checks `stateMachine.currentState` — if it starts with `attack`, skip all horizontal movement logic (no walk/run transitions). When CombatSystem signals attack completion (recovery ends or combo resets), transition back to `idle`/`fall` based on `body.blocked.down`. This keeps all animation control centralized in the StateMachine and prevents animation flickering from competing state systems.
- During wind-up and active frames, player movement is restricted (can't walk, reduced air control). During recovery, movement gradually unlocks.
- Placeholder visual: flash the player sprite white during active frames, or create a simple slash arc using Phaser Graphics.

**Definition of Done:**

- [ ] Pressing attack (J key) starts Slash 1 with correct wind-up → active → recovery timing
- [ ] Pressing attack during recovery window chains to Slash 2, then Heavy Slash
- [ ] Heavy Slash applies visible knockback to enemies caught in the hitbox (pushes them away from the player via body.setVelocityX)
- [ ] Airborne attack performs a downward slash that bounces the player off enemies
- [ ] Player cannot walk during attack wind-up and active frames
- [ ] Combo resets to idle if no follow-up input within the window
- [ ] CombatSystem unit tests pass: combo chaining, millisecond timing windows (wind-up, active, recovery phases), air slash detection
- [ ] All frame data values are defined in constants.js

**Verify:**

- `npx vitest run` — CombatSystem tests pass (combo chain, timing windows in ms, air slash detection)
- Open game in browser — press J three times in rapid succession: combo visually completes all three hits (three distinct attack animations/hitbox flashes). Press J once and wait: only Slash 1 plays and player returns to idle. Press J while airborne: downward slash animation plays.

---

### Task 5: Health, Damage & Invincibility

**Objective:** Implement the player health system with heart-based HP (5 hearts), damage intake with invincibility frames (1.5 seconds with sprite flashing), knockback on taking damage, and death with respawn.

**Dependencies:** Task 2

**Files:**

- Create: `src/systems/HealthSystem.js`
- Create: `tests/systems/HealthSystem.test.js`
- Modify: `src/entities/Player.js`
- Modify: `src/config/constants.js`

**Key Decisions / Notes:**

- HealthSystem is a pure logic class: `constructor(maxHealth)`, `takeDamage(amount)`, `heal(amount)`, `isDead()`, `isInvulnerable()`, `update(deltaMs)`. No Phaser dependency — fully testable.
- Invulnerability tracking: after taking damage, set `invulnerableMs = INVULNERABILITY_MS` (1500ms). Decrement by `deltaMs` each update. `isInvulnerable()` returns true while `invulnerableMs > 0`.
- Visual feedback in Player.js: when invulnerable, accumulate `flashMs += delta` each update; toggle sprite `alpha` between 0.3 and 1.0 when `flashMs >= FLASH_INTERVAL_MS` (100ms, approximately 6 frames at 60fps), then reset `flashMs = 0`.
- Knockback: on taking damage, apply a velocity impulse away from the damage source direction. Use `body.setVelocity(knockbackX, knockbackY)`. Brief loss of input control during knockback (`KNOCKBACK_LOCK_MS = 250`, approximately 15 frames at 60fps). Decrement `knockbackLockMs` by `deltaMs` each update; restore input when it reaches 0.
- Death: when health reaches 0, play a death state (freeze player, flash red, fade out). After a short delay, respawn at the spawn point with full health. For Phase 1, the "spawn point" is a fixed position stored in constants.
- Currency loss on death (10% of held currency) — defer to Phase 5 when currency exists. For now, just respawn.
- Emit events for health changes using a **shared EventEmitter on the game registry** (NOT scene-to-scene direct binding, which breaks on scene restart). **Initialize the EventEmitter exactly once in BootScene's `create()`:** `this.registry.set('events', new Phaser.Events.EventEmitter())`. GameScene and UIScene only retrieve it via `this.registry.get('events')` — they NEVER create a new one. This is critical because GameScene's `create()` runs again on `scene.restart()` (e.g., after death/respawn), and creating a new EventEmitter would orphan UIScene's existing listeners. UIScene must remove and re-add its listener in its own `create()` to avoid duplicate listeners if UIScene is relaunched: `const events = this.registry.get('events'); events.off('health-changed', this.updateHearts, this); events.on('health-changed', this.updateHearts, this);`

**Definition of Done:**

- [ ] Player starts with 5 hearts of health
- [ ] Taking damage reduces health by the damage amount
- [ ] After taking damage, player is invulnerable for 1.5 seconds with visible sprite flashing
- [ ] Taking damage applies knockback away from the damage source
- [ ] Player cannot take damage while invulnerable
- [ ] When health reaches 0, player dies and respawns at spawn point with full health
- [ ] HealthSystem unit tests pass: damage, healing, invulnerability timing, death detection
- [ ] GameScene emits a `health-changed` event (with current and max health values) whenever health changes — verified by unit test or console.log that the event fires on damage and on respawn

**Verify:**

- `npx vitest run` — HealthSystem tests pass
- Open game in browser — take damage (from slime in Task 6 or test trigger), verify flashing, knockback, and respawn

---

### Task 6: Slime Enemy

**Objective:** Create the Slime enemy — a slow ground-patrolling creature that damages the player on contact and dies in one hit from the player's sword. This is the first enemy type and establishes the enemy entity pattern for all future enemies.

**Dependencies:** Task 4, Task 5

**Files:**

- Create: `src/entities/Slime.js`
- Create: `src/entities/Enemy.js` (base class)
- Create: `src/systems/SlimeAI.js` (pure logic, no Phaser imports)
- Create: `tests/systems/SlimeAI.test.js`
- Modify: `src/scenes/GameScene.js`
- Modify: `src/config/constants.js`
- Modify: `src/scenes/BootScene.js`

**Key Decisions / Notes:**

- Create a base `Enemy` class that extends `Phaser.Physics.Arcade.Sprite` with shared behavior: health, taking damage, death, physics body setup. Slime extends Enemy.
- Slime AI is a simple patrol: move left at `SLIME_SPEED` until hitting a wall or ledge, then reverse direction. Ledge detection: GameScene passes the ground tilemap layer reference to the Slime constructor (`this.groundLayer`). In Slime's update, call `this.groundLayer.getTileAtWorldXY(x + direction * halfWidth, y + bodyHeight + 1)` to check if ground exists ahead. If null (no tile = ledge), reverse direction. Wall detection: check `body.blocked.left` or `body.blocked.right` from Arcade Physics collisions.
- **SlimeAI logic must be extracted into `src/systems/SlimeAI.js`** — a pure JS module with no Phaser imports. It accepts `({ blockedLeft, blockedRight, hasGroundAhead, deltaMs })` and returns `{ direction, speed }`. Slime.js imports and delegates to SlimeAI for decisions, while only Phaser-specific operations (velocity, position, sprite) live in Slime.js. This keeps the AI unit-testable in Vitest (which cannot import Phaser).
- Contact damage: use `this.physics.add.overlap(player, slimeGroup, onPlayerHitSlime)`. If player is not invulnerable and not in an attack active frame, deal 1 heart of damage.
- Sword hit detection: use `this.physics.add.overlap(attackHitbox, slimeGroup, onSlimeHit)`. Apply damage from CombatSystem. Slime has 1 HP — dies in one hit.
- Death effect: on death, immediately call `setActive(false)` and `body.enable = false` to stop AI updates and physics. Then play a brief "squish" animation (scale Y to 0 over 200ms via `this.scene.tweens.add()`), and destroy on tween complete. In Slime's `update()`, add an early return guard: `if (!this.active) return;` — this prevents AI logic from running on a dying slime. Drop nothing for now (currency comes in Phase 5).
- **Ledge detection bounds safety:** In SlimeAI, also check if the look-ahead position `x + direction * halfWidth` is outside `[0, groundLayer.widthInPixels]` — if so, treat as a wall and reverse direction. This prevents relying on `getTileAtWorldXY()` returning null at map boundaries for the wrong reason.
- Use a Phaser `Group` for enemy management: `this.slimeGroup = this.physics.add.group({ classType: Slime })`. Spawn slimes at fixed positions in GameScene (hardcoded for now, tilemap-based in Task 7).
- Placeholder sprite: generate a green rectangle (slightly smaller than player) in BootScene, or use a free slime asset.

**Definition of Done:**

- [ ] Slime spawns in the level and patrols back and forth on the ground
- [ ] Slime reverses direction at walls and ledge edges (doesn't fall off platforms)
- [ ] Slime deals 1 heart of contact damage to the player (triggers invincibility + knockback)
- [ ] Player's sword attack kills the slime in 1 hit
- [ ] Heavy slash knockback visibly pushes the slime before death
- [ ] Slime plays a death effect (squish) and is removed from the scene
- [ ] Air downward slash on a slime bounces the player upward
- [ ] SlimeAI unit tests pass: patrol direction changes, ledge detection logic, bounds clamping

**Verify:**

- `npx vitest run` — SlimeAI tests pass
- Open game in browser — slime patrols on the flat temporary ground, takes damage, dies with effect. Player takes contact damage from slime.

> **Note:** Elevated platform slime verification is deferred to Task 7, which introduces the tilemap with actual platforms. Task 6 verifies behavior on flat ground only.

---

### Task 7: Test Level with Tilemap & Camera

**Objective:** Create a test level using Tiled-format JSON tilemap with ground, platforms, and decorations. Load it into GameScene with proper collision. Set up the camera with smooth follow, directional lead, and lazy vertical tracking.

**Dependencies:** Task 2

**Files:**

- Create: `public/assets/tilemaps/test-level.json`
- Create: `public/assets/tilemaps/tiles.png` (tileset image)
- Modify: `src/scenes/GameScene.js`
- Modify: `src/scenes/BootScene.js`
- Modify: `src/config/constants.js`

**Key Decisions / Notes:**

- Tilemap structure (layers):
  - `background` — non-colliding decorative layer
  - `ground` — main collision layer (platforms, floor, walls)
  - `spawns` — object layer with spawn points (player spawn, slime spawns)
- Tileset: use a simple 16x16 or 32x32 tileset. For placeholder, generate a basic one with Phaser Graphics (ground tile, platform tile, background tile) or use a free tileset from itch.io / OpenGameArt.
- Hand-craft the JSON tilemap. The test level should be roughly 60 tiles wide × 17 tiles tall (1920×544 pixels at 32px tiles) — enough to scroll and test camera, with several platforms at different heights, a few gaps, and spawn points for 3-5 slimes.
- **Tiled JSON format requirements** (critical for Phaser to parse correctly): Must include `version` field, `tilesets` array with `firstgid` and embedded `image` key (NOT external `.tsx` source — Phaser cannot resolve external tileset files), `layers` array where tile layers have `type: "tilelayer"` with `data` as a flat array of tile GIDs, and object layers have `type: "objectgroup"` with objects having `x`, `y`, `name`, and `type` fields. The JSON must embed tileset data directly — never use Tiled's external tileset format.
- Loading: `this.load.tilemapTiledJSON('test-level', 'assets/tilemaps/test-level.json')` in BootScene. In GameScene: `this.make.tilemap({ key: 'test-level' })`, add tileset image, create layers, set collision on ground layer.
- Set collision: `groundLayer.setCollisionByProperty({ collides: true })` or `setCollisionByExclusion([-1])` (collide all non-empty tiles).
- Replace hardcoded ground platform from Task 2 with tilemap collision.
- Camera config — use an **invisible `cameraTarget` game object** for directional lead (Phaser's `startFollow` has no native lead offset API):
  - Create `this.cameraTarget = this.add.rectangle(0, 0, 1, 1).setVisible(false)` in GameScene
  - In GameScene's `update()`: lerp `cameraTarget.x` toward `player.x + (player.facing * CAMERA_LEAD_X)` and `cameraTarget.y` toward `player.y` each frame. Use separate lerp rates for X (0.1, responsive) and Y (0.05, lazy).
  - `this.cameras.main.startFollow(this.cameraTarget)` — camera follows the virtual target, not the player directly
  - Dead zone: `this.cameras.main.setDeadzone(40, 20)` — center dead zone
  - Lock camera to world bounds: `this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels)`
- Read spawn points from the `spawns` object layer: filter by `name` or custom properties to place player and slimes.

**Definition of Done:**

- [ ] Test level loads and renders with visible ground, platforms, and background
- [ ] Player collides with ground/platform tiles correctly (stands on them, blocked by walls)
- [ ] Camera follows player smoothly with horizontal lead in movement direction
- [ ] Camera vertical tracking is noticeably lazier than horizontal
- [ ] Camera stops at level bounds (no void visible at edges)
- [ ] Player and slimes spawn at positions defined in the tilemap's object layer
- [ ] Level has enough variety to test: flat ground, elevated platforms, gaps, walls
- [ ] Slime enemies patrol correctly on tilemap tiles — reverse direction at ledge edges and walls without falling off platforms
- [ ] At least one slime spawns on an elevated platform and correctly reverses at ledge edges without falling off (this is the primary verification of ledge detection from Task 6)

**Verify:**

- `npx vitest run` — no regressions
- Open game in browser — walk through entire test level, verify collision, camera behavior, and slime spawns

---

### Task 8: HUD — Health Hearts Display

**Objective:** Create the UIScene overlay that displays the player's health as heart icons in the top-left corner. The HUD updates reactively when the player takes damage or heals.

**Dependencies:** Task 5

**Files:**

- Modify: `src/scenes/UIScene.js`
- Modify: `src/scenes/GameScene.js`
- Modify: `src/scenes/BootScene.js`

**Key Decisions / Notes:**

- UIScene runs in parallel with GameScene via `this.scene.launch('UIScene')` called from GameScene's `create()`.
- Heart rendering: use Phaser `Image` objects positioned at the top-left. Full heart = red/filled icon, empty heart = grey/outline icon. For placeholder, draw hearts using Phaser Graphics (or simple colored circles/squares).
- Communication: Uses the shared EventEmitter on the game registry (initialized once in BootScene — see Task 1). GameScene emits `this.registry.get('events').emit('health-changed', { current: 3, max: 5 })`. UIScene listens in its `create()`: first remove any existing listener, then add: `const events = this.registry.get('events'); events.off('health-changed', this.updateHearts, this); events.on('health-changed', this.updateHearts, this);` This cleanup-then-register pattern prevents duplicate listeners if UIScene is relaunched, and works correctly across GameScene restarts because the EventEmitter instance is never recreated.
- Position: hearts start at `(12, 12)` with `24px` spacing. Scale-independent (uses UIScene camera which doesn't follow the player).
- Update logic: loop through heart images, set frame to `full` if index < currentHealth, else `empty`.
- Add a brief scale-up animation (tween) on the damaged heart for visual feedback.

**Definition of Done:**

- [ ] 5 heart icons display in the top-left corner of the screen
- [ ] Hearts visually update when player takes damage (full → empty with animation)
- [ ] Hearts update when player heals or respawns (empty → full)
- [ ] HUD stays fixed on screen (doesn't scroll with camera)
- [ ] HUD doesn't interfere with gameplay input or physics

**Verify:**

- `npx vitest run` — no regressions
- Open game in browser — take damage from slime, verify hearts decrease. Die and respawn, verify hearts reset to full.

---

## Testing Strategy

- **Unit tests** (Vitest): StateMachine (state transitions, callbacks), CombatSystem (combo chaining, timing windows, frame data), HealthSystem (damage, healing, invulnerability, death), SlimeAI (patrol logic, direction changes). These are pure JS modules with no Phaser dependency.
- **Integration tests** (playwright-cli): Open the game in a browser, verify the player can move and jump, perform combos on slimes, take damage and see HUD update, die and respawn. Visual verification of camera behavior and animations.
- **Manual verification:** Play through the test level to assess game feel — is movement responsive? Does the combo chain feel tight? Is coyote time noticeable? These are subjective quality checks.

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Phaser Arcade Physics AABB limitations make platforming feel stiff | Medium | Medium | Design terrain with flat surfaces and staircase elevation only. No slopes. Test movement feel early in Task 2 and iterate on acceleration/drag values in constants.js before proceeding. |
| Combat hitbox timing feels unresponsive or unfair | Medium | High | Frame data values in constants.js are fully tunable. Start with generous active windows (67-100ms) and tighten later. The combo input window should be forgiving (67ms or more). Iterate on constants without code changes. |
| Tilemap hand-crafting is error-prone without Tiled editor | Low | Low | Keep test level simple. Use a regular grid structure. If JSON is malformed, Phaser will throw clear errors during load. |
| Free placeholder assets look too rough to evaluate game feel | Low | Medium | Generate simple but clean placeholder sprites using Phaser Graphics (colored shapes with clear silhouettes). Distinct colors per entity: blue=player, green=slime, brown=ground. |
| Vitest + Phaser import conflicts (Phaser expects browser globals) | Medium | Low | Pure logic modules (StateMachine, CombatSystem, HealthSystem, SlimeAI) have zero Phaser imports — no conflict. `vitest.config.js` maps `phaser` to an empty stub via `resolve.alias` to prevent transitive import crashes. Entity/scene code uses integration testing only (playwright-cli). Never import Phaser-dependent files in Vitest tests. |
| Air downward slash bounce cancelled by ground collision in same physics step | Medium | Medium | Use a `bounceGranted` flag that persists for 33ms. If bounceGranted and body.blocked.down, re-apply bounce velocity. Skip recovery frames on successful bounce. |
| Non-integer scale factors cause pixel art sub-pixel bleed | Medium | Low | Set `pixelArt: true` and `roundPixels: true` in game config. These enable nearest-neighbor filtering and pixel-aligned rendering globally. |

## Open Questions

- None — all design decisions were resolved in the pre-planning Q&A session. The PRD and user clarifications cover all Phase 1 requirements.

### Deferred Ideas

- Dust particles on landing (Phase 6 — visual polish)
- Screen shake on heavy slash hits (Phase 6)
- Sound effects for sword swings and slime deaths (Phase 6)
- Currency drops from slimes (Phase 5 — economy system)
- Checkpoint crystals in the test level (Phase 5 — save system)
