# Phase 2: Character Class Selection & Dungeon Floor System

Created: 2026-02-19
Status: VERIFIED
Approved: Yes
Iterations: 0
Worktree: No

> **Status Lifecycle:** PENDING → COMPLETE → VERIFIED
> **Iterations:** Tracks implement→verify cycles (incremented by verify phase)
>
> - PENDING: Initial state, awaiting implementation
> - COMPLETE: All tasks implemented
> - VERIFIED: All checks passed
>
> **Approval Gate:** Implementation CANNOT proceed until `Approved: Yes`
> **Worktree:** No — working directly on current branch

## Summary

**Goal:** Transform BladeQuest from a single-level prototype into a dungeon-crawling roguelike with character class selection, unique class abilities, and procedurally generated dungeon floors.

**Architecture:** Scene-based flow (HubScene → DungeonScene → boss/death loops). Character classes defined as data-driven configs extending a shared base Player. Dungeon floors procedurally generated using a room-connection algorithm that builds Phaser tilemaps at runtime. Progression state persisted via `localStorage`.

**Tech Stack:** Phaser 3 (existing), Vitest (existing), localStorage for persistence, runtime tilemap generation (no external tools needed)

## Scope

### In Scope

- Hub town scene with character class selection UI
- 2 character classes: Shinobi and Holy Knight
- Shared base movement (run, jump, basic melee attack) across classes
- Unique special ability per class powered by mana bar (Shinobi: kunai throw; Holy Knight: holy slash)
- Mana bar UI and mana regeneration system
- Procedurally generated dungeon floors with 3-4 connected rooms per floor
- Passage/ladder object to advance to next floor
- Enemy spawning that scales with dungeon depth (count + new types per tier)
- Boss floor every 10 floors with a unique boss enemy
- Death resets player to floor 1
- Boss-clear checkpoints: clearing a boss floor unlocks teleport from hub
- Persistent progression via localStorage (unlocked classes, cleared checkpoints)
- DungeonScene replacing GameScene for dungeon gameplay

### Out of Scope

- More than 2 character classes (expandable later)
- Multiple unique boss designs (the user requested unique bosses — Phase 2 delivers one boss with two AI phases and floor-scaling stats as an MVP; distinct boss types with different attack patterns, sprites, and names are deferred to Phase 3)
- Online multiplayer / leaderboards
- Item drops, inventory, or equipment system
- Save/load of mid-dungeon progress (death = reset)
- Audio/music integration
- Mobile/touch controls

## Prerequisites

- Phase 1 codebase complete and verified (committed at main)
- Sprite assets already in place (warrior for player, skeleton for enemies)
- Phaser 3.87, Vite, Vitest already configured

## Context for Implementer

> This section is critical for cross-session continuity. Write it for an implementer who has never seen the codebase.

- **Patterns to follow:**
  - Pure JS systems with no Phaser dependency for testability: see `src/systems/CombatSystem.js`, `src/systems/HealthSystem.js`, `src/systems/SlimeAI.js`
  - Phaser entities extend `Phaser.Physics.Arcade.Sprite`: see `src/entities/Player.js:33`, `src/entities/Enemy.js:10`
  - Mixin pattern for combat methods: see `src/entities/PlayerCombat.js` mixed into Player via `Object.assign(Player.prototype, PlayerCombatMixin)` at `src/entities/Player.js:271`
  - Scene communication via shared EventEmitter stored in registry: `this.registry.get("events")` — set once in `src/scenes/BootScene.js:71`, used in GameScene and UIScene
  - Animation definitions extracted to config: see `src/config/animations.js`

- **Conventions:**
  - Constants in `src/config/constants.js` — ALL_CAPS naming
  - Entity classes in `src/entities/`, systems in `src/systems/`, scenes in `src/scenes/`
  - Tests mirror source structure: `tests/systems/CombatSystem.test.js` for `src/systems/CombatSystem.js`
  - Phaser mock at `tests/__mocks__/phaser.js`
  - Game resolution: 480x270 pixels, pixel art mode with `roundPixels: true`

- **Key files the implementer must read first:**
  - `src/main.js` — Game config, scene list, physics setup
  - `src/entities/Player.js` — Player class with state machine, combat system, physics body setup
  - `src/entities/PlayerCombat.js` — Combat mixin (attack input, hitbox management, knockback, air bounce)
  - `src/scenes/GameScene.js` — Current gameplay scene (tilemap loading, entity spawning, overlaps, camera, parallax, death/respawn, health system)
  - `src/scenes/BootScene.js` — Asset loading (spritesheets, backgrounds, procedural tile textures)
  - `src/config/constants.js` — All game constants

- **Gotchas:**
  - Animations MUST be created before entities that use them (GameScene calls `createAnimations()` before `_spawnEntities()`)
  - `Enemy._die()` calls `setActive(false)` which stops ALL updates including animations — Slime overrides this to keep sprite active during death animation
  - `scene.launch()` is async — events emitted immediately after launch are missed by the launched scene
  - Player body size (30x64) is much smaller than sprite frame (128x128) due to `PLAYER_SCALE=0.35` and custom offset (50,58)
  - Tilemap uses a 3-tile tileset: tile 1 = background, tile 2 = ground, tile 3 = platform. Generated programmatically in BootScene

- **Domain context:**
  - This is a 2D side-scrolling roguelike platformer with melee combat
  - The dungeon system is inspired by anime like "Jack of All Trades" — floors with rooms, passage to next floor, boss every 10 floors
  - Death is permanent (reset to floor 1) but boss-clear checkpoints let you teleport ahead from the hub town

## Runtime Environment

- **Start command:** `npm run dev` (Vite dev server)
- **Port:** 5173 (default Vite)
- **Health check:** Open `http://localhost:5173` in browser
- **Restart procedure:** Vite HMR auto-reloads on file changes

## Progress Tracking

**MANDATORY: Update this checklist as tasks complete. Change `[ ]` to `[x]`.**

- [x] Task 1: Progression persistence system (SaveManager)
- [x] Task 2: Mana system
- [x] Task 3: Character class data definitions
- [x] Task 4: Character class ability system (Shinobi kunai, Holy Knight holy slash)
- [x] Task 5: Hub town scene with class selection
- [x] Task 6: Procedural dungeon floor generator
- [x] Task 7: DungeonScene — core gameplay in generated floors
- [x] Task 8: Enemy scaling and new enemy type (Bat)
- [x] Task 9: Boss enemy and boss floor logic
- [x] Task 10: Death, respawn, checkpoint teleport flow

**Total Tasks:** 10 | **Completed:** 10 | **Remaining:** 0

## Implementation Tasks

### Task 1: Progression Persistence System (SaveManager)

**Objective:** Create a pure JS `SaveManager` that reads/writes persistent player progression to `localStorage`. This is needed by the hub scene (to know which classes are unlocked, which checkpoints are available) and by the death/respawn flow.

**Dependencies:** None

**Files:**

- Create: `src/systems/SaveManager.js`
- Create: `tests/systems/SaveManager.test.js`

**Key Decisions / Notes:**

- Pure JS, no Phaser dependency — fully unit testable
- Data shape: `{ unlockedClasses: ["knight"], clearedBossFloors: [10, 20], highestFloor: 0 }`
- Knight is unlocked by default; Shinobi is unlocked by default too (only 2 classes, both available from start — progression unlocks are for future expansion)
- `localStorage` key: `"bladequest-save"`
- Methods: `load()`, `save(data)`, `reset()`, `unlockClass(id)`, `clearBossFloor(floor)`, `getClearedFloors()`, `getUnlockedClasses()`

**Definition of Done:**

- [ ] SaveManager correctly serializes/deserializes to localStorage
- [ ] `load()` returns default data when no save exists
- [ ] `clearBossFloor(10)` adds 10 to clearedBossFloors and persists
- [ ] `reset()` clears save and returns defaults
- [ ] All unit tests pass with mocked localStorage

**Verify:**

- `npm test -- tests/systems/SaveManager.test.js`

---

### Task 2: Mana System

**Objective:** Create a pure JS `ManaSystem` analogous to `HealthSystem`. Tracks current mana, max mana, mana costs, and passive regeneration. Used by character abilities.

**Dependencies:** None

**Files:**

- Create: `src/systems/ManaSystem.js`
- Create: `tests/systems/ManaSystem.test.js`
- Modify: `src/config/constants.js` (add mana constants)

**Key Decisions / Notes:**

- Pure JS, no Phaser dependency
- Follow `HealthSystem` pattern exactly
- Constants: `MAX_MANA = 100`, `MANA_REGEN_RATE = 5` (per second), `KUNAI_MANA_COST = 25`, `HOLY_SLASH_MANA_COST = 35`
- Methods: `update(dt)` (handles regen), `spend(cost) → boolean`, `restore(amount)`, `reset()`, `get currentMana`, `get maxMana`
- `spend()` returns false if insufficient mana (caller checks before executing ability)

**Definition of Done:**

- [ ] Mana regenerates at MANA_REGEN_RATE per second during update()
- [ ] `spend(cost)` returns true and deducts mana when sufficient, false when insufficient
- [ ] Mana never exceeds maxMana or goes below 0
- [ ] `reset()` restores to full
- [ ] All unit tests pass

**Verify:**

- `npm test -- tests/systems/ManaSystem.test.js`

---

### Task 3: Character Class Data Definitions

**Objective:** Define character class configs as data objects. Each class specifies its sprite keys, ability config, and display metadata. Create a `ClassRegistry` that the hub scene and DungeonScene query.

**Dependencies:** None

**Files:**

- Create: `src/config/classes.js`
- Create: `tests/config/classes.test.js`

**Key Decisions / Notes:**

- Each class config is a plain object:
  ```js
  {
    id: "knight",
    name: "Holy Knight",
    description: "A righteous warrior wielding holy power",
    spriteKeys: { idle: "player-idle", run: "player-run", ... }, // reuse existing warrior sprites for both classes in Phase 2
    ability: { id: "holy-slash", manaCost: 35, cooldownMs: 1000 },
    stats: { maxHealth: 6, maxMana: 100 },  // knight is tankier
  }
  ```
- Both classes share the same warrior sprite set in Phase 2 (unique sprites deferred to Phase 3)
- Shinobi: lower health (4), faster mana regen, kunai projectile ability
- Holy Knight: higher health (6), holy slash melee AOE ability
- `ClassRegistry`: `getClass(id)`, `getAllClasses()`, `getDefault()` — simple lookup, no Phaser dependency

**Definition of Done:**

- [ ] Two classes defined: "shinobi" and "knight"
- [ ] `ClassRegistry.getClass("shinobi")` returns complete config
- [ ] `ClassRegistry.getAllClasses()` returns array of both classes
- [ ] Each class has id, name, description, spriteKeys, ability, stats
- [ ] Unit tests verify all lookups

**Verify:**

- `npm test -- tests/config/classes.test.js`

---

### Task 4: Character Class Ability System

**Objective:** Implement the two unique abilities: Shinobi's kunai throw (ranged projectile) and Holy Knight's holy slash (wide melee AOE). Wire abilities to a shared input key (e.g., C key) and mana system.

**Dependencies:** Task 2 (ManaSystem), Task 3 (ClassRegistry)

**Files:**

- Create: `src/entities/Kunai.js` (projectile entity)
- Create: `src/systems/AbilitySystem.js` (manages cooldown + mana check + execution)
- Create: `tests/systems/AbilitySystem.test.js`
- Modify: `src/entities/Player.js` (add ability key binding, manaSystem ref, abilitySystem ref)
- Modify: `src/config/constants.js` (add ability constants)
- Modify: `src/config/animations.js` (add kunai animation if needed)

**Key Decisions / Notes:**

- `AbilitySystem` is pure JS — tracks cooldown timer, checks mana, calls ability executor
- Ability executors are Phaser-dependent (creating sprites/hitboxes) — implemented as methods on Player or standalone factory functions
- **Kunai**: Creates a `Kunai` sprite that flies horizontally in `player.facing` direction. Extends `Phaser.Physics.Arcade.Sprite`. Despawns on enemy hit or after traveling ~300px. Deals 1 damage.
- **Holy Slash**: Enables a wider hitbox (larger than normal ground hitbox) for a brief duration (~200ms). Deals 2 damage. Uses a tinted flash effect on the player.
- Input: C key (with V as alternative, matching the X/K pattern for basic attack)
- Cooldowns: Kunai 500ms, Holy Slash 1000ms
- AbilitySystem.update(dt) ticks cooldowns. `tryUse(input) → boolean` checks cooldown + mana then fires.
- **Player constructor change:** Modify Player constructor to accept an optional `classConfig` parameter: `constructor(scene, x, y, classConfig = null)`. If provided, use `classConfig.stats.maxHealth` for the HealthSystem and `classConfig.stats.maxMana` for the ManaSystem. Default to knight config for backward compatibility with GameScene. Store `classConfig` on the Player instance for ability system reference.
- **Phaser mock extension:** Extend `tests/__mocks__/phaser.js` with minimum Arcade Sprite stubs so that AbilitySystem.test.js can mock ability executors without crashing on Phaser imports. Add stub classes for `Physics.Arcade.Sprite` and `Physics.Arcade.Image` with noop methods.

**Definition of Done:**

- [ ] Pressing C fires the class-specific ability when mana is sufficient
- [ ] Kunai spawns, travels horizontally, damages enemies on overlap, despawns after distance or hit
- [ ] Holy slash creates a wide hitbox that damages all enemies within range for 2 damage
- [ ] Ability fails silently (no action) when insufficient mana or on cooldown
- [ ] Cooldown prevents rapid re-use
- [ ] AbilitySystem unit tests pass (cooldown, mana gating)

**Verify:**

- `npm test -- tests/systems/AbilitySystem.test.js`
- Manual: run game, select Shinobi, press C — kunai flies forward

---

### Task 5: Hub Town Scene

**Objective:** Create `HubScene` — a safe area where the player selects a character class and enters the dungeon. Shows unlocked classes, cleared checkpoints for teleport, and a "Start Dungeon" trigger.

**Dependencies:** Task 1 (SaveManager), Task 3 (ClassRegistry)

**Files:**

- Create: `src/scenes/HubScene.js`
- Modify: `src/main.js` (add HubScene to scene list, make it the starting scene after boot)
- Modify: `src/scenes/BootScene.js` (start HubScene instead of GameScene after loading)

**Key Decisions / Notes:**

- Simple UI-driven scene (not a full platforming level)
- Display: Game title, class selection panel (2 character cards showing name, description, stats), checkpoint teleport list (if any boss floors cleared), "Enter Dungeon" button
- Class cards show: name, description, HP/Mana stats. Selected card is highlighted.
- If boss checkpoints exist (from SaveManager), show "Teleport to Floor X" options
- Pressing Enter or clicking "Enter Dungeon" transitions to DungeonScene with `{ classId, startFloor }` data
- Uses Phaser text objects and rectangles for UI (no external UI library)
- Scene flow: BootScene → HubScene → DungeonScene → (death) → HubScene

**Definition of Done:**

- [ ] HubScene displays class selection with 2 character cards
- [ ] Clicking/selecting a class highlights it
- [ ] "Enter Dungeon" starts DungeonScene with selected class and floor 1
- [ ] When SaveManager has clearedBossFloors containing 10, HubScene shows a "Teleport to Floor 11" option; selecting it launches DungeonScene with `{ classId, startFloor: 11 }`
- [ ] BootScene now transitions to HubScene instead of GameScene

**Verify:**

- Manual: start game, see HubScene with class cards, select a class, enter dungeon

---

### Task 6: Procedural Dungeon Floor Generator

**Objective:** Build a `DungeonGenerator` that creates a floor layout: 3-4 connected rooms with corridors, a player spawn point, enemy spawn points, and a passage/ladder to the next floor. Outputs data that DungeonScene uses to build a Phaser tilemap at runtime.

**Dependencies:** None

**Files:**

- Create: `src/systems/DungeonGenerator.js`
- Create: `tests/systems/DungeonGenerator.test.js`

**Key Decisions / Notes:**

- Pure JS, no Phaser dependency — fully unit testable
- Algorithm:
  1. Decide room count: 3-4 (random)
  2. Place rooms on a grid with no overlap. Each room is a rectangle (width: 15-25 tiles, height: 8-12 tiles)
  3. Connect rooms with horizontal/vertical corridors (2-3 tiles wide)
  4. Place player spawn in the first (leftmost) room
  5. Place passage/ladder in the last (rightmost) room
  6. Scatter enemy spawn points in middle rooms (count scales with `floor` parameter)
  7. On boss floors (floor % 10 === 0): single large room with boss spawn, no passage until boss defeated
- Output format:
  ```js
  {
    width, height,       // total tilemap size in tiles
    groundTiles: [...],  // 2D array of tile IDs (0=empty, 1=ground, 2=platform)
    spawns: { player: {x,y}, enemies: [{x,y,type}...], passage: {x,y}, boss: {x,y}|null },
    rooms: [{x,y,w,h}...],
  }
  ```
- Tile size: 16x16 (matches existing tileset)
- **Tile ID mapping:** The existing 'tiles' texture is a 16x48 image with 3 vertically-stacked 16x16 tiles. When used as a runtime tileset, Phaser assigns 0-indexed GIDs: 0=background, 1=ground, 2=platform. DungeonGenerator must use: 0=empty (no tile), 1=ground (solid, collidable), 2=platform (one-way). DungeonScene sets collision with `setCollisionByExclusion([0])` (exclude empty tiles) instead of `setCollisionByExclusion([-1])` used in the Tiled JSON convention.

**Definition of Done:**

- [ ] `generate(floor)` returns a valid floor layout with 3-4 rooms
- [ ] Rooms don't overlap and are connected by corridors
- [ ] Player spawn is in the first room, passage is in the last room
- [ ] Enemy count increases with floor number
- [ ] Boss floors (multiples of 10) generate a single large room with boss spawn
- [ ] Output data structure is well-defined and consistent
- [ ] A unit test verifies that generate(1) produces a floor where every room can be reached from the player spawn (no isolated rooms)
- [ ] A unit test verifies that generate(10) produces: rooms.length === 1, spawns.boss is non-null, and spawns.passage is null (passage only appears after boss defeat)
- [ ] All unit tests pass

**Verify:**

- `npm test -- tests/systems/DungeonGenerator.test.js`

---

### Task 7: DungeonScene — Core Gameplay in Generated Floors

**Objective:** Create `DungeonScene` that takes a generated floor layout and builds a playable Phaser level from it. Replaces GameScene as the primary gameplay scene for dungeon runs. Reuses GameScene's patterns for physics, combat overlaps, camera, and parallax.

**Dependencies:** Task 4 (AbilitySystem), Task 5 (HubScene), Task 6 (DungeonGenerator)

**Files:**

- Create: `src/scenes/DungeonScene.js`
- Modify: `src/main.js` (add DungeonScene to scene list)
- Modify: `src/config/constants.js` (add dungeon-specific constants)

**Key Decisions / Notes:**

- Receives `{ classId, startFloor }` from HubScene via `scene.start("DungeonScene", data)`
- On `create()`:
  1. Generate floor layout via `DungeonGenerator.generate(this.currentFloor)`
  2. Build Phaser tilemap from the layout data using `this.make.tilemap({ data, ... })`
  3. Spawn Player with class config (health, mana, ability from ClassRegistry)
  4. Spawn enemies at generated positions
  5. Place passage sprite at passage location
  6. Set up physics colliders and overlaps (same pattern as GameScene)
  7. Set up camera, parallax background (reuse from GameScene)
  8. Launch UIScene for HUD
- **Enemy tracking for passage gate:** Use `this.enemyGroup.countActive(true) === 0` to check if all enemies are defeated. Phaser's `countActive(true)` only counts sprites with `active=true`, so enemies in their death animation (which set `active=false` immediately) are excluded. Passage overlap callback checks this condition before advancing.
- **Floor transitions reuse the Player instance** — call `player.respawn(newSpawnX, newSpawnY)` (already implemented) to reset position and combat state. Only enemies, passage sprites, and the tilemap are destroyed and recreated per floor. This avoids orphaned hitbox physics bodies that would accumulate if Player were destroyed and recreated each floor.
- **Dungeon background:** Instead of reusing the outdoor parallax (sky/hills/trees), render a flat dark rectangle as dungeon background: `this.add.rectangle(0, 0, worldWidth, worldHeight, 0x1a1a2e).setOrigin(0,0).setDepth(-30)`. Styled dungeon backgrounds deferred to Phase 3.
- UIScene updated to show: hearts, mana bar, floor number (mana bar and floor display implemented in Task 10)
- Keep GameScene intact for now (original test level) — DungeonScene is the new dungeon mode

**Definition of Done:**

- [ ] DungeonScene builds a Phaser tilemap from DungeonGenerator output with: (a) 3-4 visible rooms connected by corridors, (b) ground tile layer has physics collision enabled so the player walks on generated floors, (c) scene successfully generates floors 1, 2, and 3 consecutively without errors
- [ ] Player spawns with correct class stats (HP, mana) at the spawn point
- [ ] Enemies spawn at generated positions and can be fought
- [ ] Passage to next floor works when all enemies are defeated
- [ ] Floor number increments and new floor generates on passage entry
- [ ] Camera follows player with parallax background
- [ ] UIScene HUD integration (mana bar, floor number) is completed in Task 10

**Verify:**

- Manual: enter dungeon from hub, fight enemies, find passage, advance to floor 2
- `npm test` — all existing tests still pass

---

### Task 8: Enemy Scaling and New Enemy Type (Bat)

**Objective:** Add a flying enemy type (Bat) and implement enemy scaling so deeper floors have more enemies, higher enemy HP, and bats appear from floor 5+.

**Dependencies:** Task 7 (DungeonScene)

**Files:**

- Create: `src/entities/Bat.js`
- Create: `src/systems/BatAI.js`
- Create: `tests/systems/BatAI.test.js`
- Modify: `src/config/constants.js` (bat constants)
- Modify: `src/config/animations.js` (bat animations — reuse skeleton sprites flipped or tinted for now)
- Modify: `src/scenes/DungeonScene.js` (spawn Bats based on floor depth)
- Modify: `src/systems/DungeonGenerator.js` (enemy type selection based on floor)

**Key Decisions / Notes:**

- Bat extends Enemy. Flies in a sine-wave pattern horizontally. No ground collision needed.
- BatAI: pure JS. Moves horizontally, oscillates Y with sine wave. Reverses at room boundaries. DungeonScene tracks each enemy's spawn room index. When spawning a Bat, pass the room's pixel bounds (roomX, roomX+roomWidth*16) to the Bat constructor. Bat.update() passes these bounds to BatAI.update() as `leftBound` and `rightBound` parameters. BatAI reverses when `x <= leftBound || x >= rightBound`.
- Scaling formula (in DungeonGenerator):
  - Base enemies per room: 1 + floor(floorNum / 3)
  - Enemy HP multiplier: 1 + floor(floorNum / 10)
  - Floor 1-4: skeletons only. Floor 5+: mix of skeletons and bats
- Bat sprites: reuse skeleton idle sprite with blue tint and smaller scale as placeholder
- Bat stats: HP=1, damage=1, speed=80

**Definition of Done:**

- [ ] Bat enemy flies in sine-wave pattern within room bounds
- [ ] Bats appear from floor 5 onward
- [ ] Enemy count per room increases with floor depth
- [ ] Enemy HP scales with depth (floor 10+ enemies have 2 HP, etc.)
- [ ] BatAI unit tests pass
- [ ] Player can damage and kill bats with attacks

**Verify:**

- `npm test -- tests/systems/BatAI.test.js`
- Manual: reach floor 5+, verify bats appear and are killable

---

### Task 9: Boss Enemy and Boss Floor Logic

**Objective:** Create a Boss enemy that spawns on every 10th floor. Boss has a large health pool, attack patterns, and defeating it unlocks a checkpoint. The passage only appears after the boss is defeated.

**Dependencies:** Task 7 (DungeonScene), Task 8 (Enemy scaling)

**Files:**

- Create: `src/entities/Boss.js`
- Create: `src/systems/BossAI.js`
- Create: `tests/systems/BossAI.test.js`
- Modify: `src/scenes/DungeonScene.js` (boss floor detection, boss spawning, checkpoint unlock on defeat)
- Modify: `src/systems/DungeonGenerator.js` (boss room layout)
- Modify: `src/config/constants.js` (boss constants)
- Modify: `src/config/animations.js` (boss animations — scaled-up skeleton as placeholder)

**Key Decisions / Notes:**

- Boss uses a scaled-up (2x) skeleton sprite with red tint as visual placeholder
- BossAI: pure JS. Two phases:
  - Phase 1 (>50% HP): patrol left-right, charge at player when close
  - Phase 2 (<50% HP): faster movement, occasional jump attack
- Boss stats scale with floor: HP = 5 + (floorNum / 10) * 3, damage = 2
- On boss defeat:
  1. SaveManager.clearBossFloor(currentFloor) — persists checkpoint
  2. Passage spawns in the room
  3. Brief victory fanfare (text overlay "Boss Defeated! Checkpoint Unlocked!")
- Boss floor has no regular enemies — just the boss in a single large room
- DungeonGenerator already handles boss floor layout (Task 6)

**Definition of Done:**

- [ ] Boss spawns on floor 10 (and multiples) in a large single room
- [ ] Boss has multi-phase AI (patrol + charge, then faster + jump attacks)
- [ ] Boss HP scales with floor number
- [ ] Defeating boss unlocks checkpoint in SaveManager
- [ ] On boss floors, no passage game object exists before the boss is defeated
- [ ] Passage spawns in the room only after boss is defeated
- [ ] "Boss Defeated!" text overlay appears on kill
- [ ] BossAI unit tests pass

**Verify:**

- `npm test -- tests/systems/BossAI.test.js`
- Manual: reach floor 10, fight boss, defeat it, verify checkpoint saved

---

### Task 10: Death, Respawn, and Checkpoint Teleport Flow

**Objective:** Wire up the complete death → hub → re-enter flow. Death resets to floor 1 (or allows teleport to cleared boss checkpoints). Ensure the full gameplay loop works end-to-end.

**Dependencies:** Task 1 (SaveManager), Task 5 (HubScene), Task 7 (DungeonScene), Task 9 (Boss)

**Files:**

- Modify: `src/scenes/DungeonScene.js` (death → transition to HubScene)
- Modify: `src/scenes/HubScene.js` (show checkpoint teleport options from SaveManager)
- Modify: `src/scenes/UIScene.js` (add mana bar display, floor number display)

**Key Decisions / Notes:**

- On player death in DungeonScene:
  1. Death freeze animation (reuse existing DEATH_FREEZE_MS pattern from GameScene)
  2. "You Died — Floor X" text overlay
  3. After 1.5s, transition to HubScene
- HubScene reads SaveManager for cleared boss floors
- If player cleared floor 10 boss: hub shows "Teleport to Floor 11" option
- Selecting teleport starts DungeonScene at that floor
- UIScene additions:
  - Mana bar below hearts (simple rectangle fill that drains/refills)
  - Floor number text in top-right corner: "Floor 7"
- Fall death still works (player falls below map bounds → kill → death flow)

**Definition of Done:**

- [ ] Player death in dungeon shows death overlay and returns to HubScene
- [ ] HubScene shows teleport options for cleared boss floors
- [ ] Selecting "Teleport to Floor 11" starts DungeonScene at floor 11
- [ ] UIScene displays mana bar that updates in real-time
- [ ] UIScene displays current floor number
- [ ] Dying on any floor shows a "You Died — Floor X" overlay and transitions to HubScene within 1.5 seconds
- [ ] HubScene shows no teleport options when no boss has been cleared
- [ ] After clearing a boss floor and dying, HubScene shows the correct teleport option
- [ ] Selecting teleport starts DungeonScene at the correct floor with class stats intact

**Verify:**

- Manual: die in dungeon → return to hub → re-enter → die on floor 10+ → see checkpoint option
- `npm test` — all tests pass

## Testing Strategy

- **Unit tests:** SaveManager, ManaSystem, AbilitySystem (cooldown/mana gating), ClassRegistry, DungeonGenerator, BatAI, BossAI — all pure JS, no Phaser dependency
- **Integration tests:** Not applicable (Phaser scenes can't be easily integration tested without browser)
- **Manual verification:** Each task includes manual play-testing steps. Full gameplay loop tested in Task 10.

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| Runtime tilemap generation fails or performs poorly | Medium | High | DungeonGenerator outputs a simple 2D array; use `Phaser.Tilemaps.Tilemap` from data (not JSON file). Test with 4-room layouts first. |
| Player abilities interact unexpectedly with existing combat system | Medium | Medium | AbilitySystem is separate from CombatSystem. Abilities use their own hitboxes and cooldowns, not the combo chain. |
| Boss AI too simple or too hard | Low | Medium | BossAI has configurable speed/damage constants. Tune after first playtest. Phase 1/2 difficulty split provides variety. |
| localStorage not available (private browsing) | Low | Low | SaveManager.load() returns defaults on any read error. Game is fully playable without persistence — just no checkpoint saves. |
| Procedural rooms sometimes generate inaccessible areas | Medium | Medium | DungeonGenerator validates connectivity: corridors always connect adjacent rooms. Rooms placed left-to-right with guaranteed horizontal overlap for corridors. If a generated layout fails connectivity validation, DungeonGenerator retries up to 3 times with a new random seed before falling back to a guaranteed 2-room layout. |

## Open Questions

- None — all requirements clarified via MCQ in previous session.

### Deferred Ideas

- Additional character classes (Mage, Archer, etc.) — Phase 3
- Unique sprites per character class — Phase 3
- Item drops and equipment system
- Multiple unique boss designs with different attack patterns
- Procedural room decoration / environmental hazards
- NPC characters in hub town
- Skill trees / ability upgrades
