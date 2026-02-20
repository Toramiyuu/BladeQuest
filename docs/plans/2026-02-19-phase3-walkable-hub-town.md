# Phase 3: Walkable Hub Town (Ashveil Settlement) Implementation Plan

Created: 2026-02-19
Status: VERIFIED
Approved: Yes
Iterations: 0
Worktree: No

> **Status Lifecycle:** PENDING → COMPLETE → VERIFIED
> **Iterations:** Tracks implement→verify cycles
>
> **Approval Gate:** Implementation CANNOT proceed until `Approved: Yes`

## Summary

**Goal:** Transform BladeQuest's menu-based HubScene into a fully walkable side-scrolling town (Ashveil Settlement) with animated NPC shopkeepers, persistent inventory/equipment system, blacksmith, potion shop, guild board, material drops from enemies, and integration of all 13 downloaded craftpix asset packs.

**Architecture:** The existing `HubScene` is replaced with a walkable platformer scene. The player walks left/right between building facades using a lightweight `HubPlayer` entity (movement only, no combat). Three facility overlay scenes (BlacksmithScene, PotionShopScene, GuildBoardScene) are added as Phaser parallel scenes that open when the player interacts with NPCs (press E). A new `InventorySystem` (pure JS) extends `SaveManager` to persist gold, materials, equipment tiers, and potion loadouts between runs. Enemies in `DungeonScene` auto-grant gold/materials on death. Potions are activated via number keys (1–3) in the dungeon.

**Tech Stack:** Phaser 3.90, Arcade Physics, localStorage persistence, craftpix PNG assets extracted from zip files.

## Scope

### In Scope
- Walkable HubScene with parallax farm market backgrounds, ground, 4 building areas
- HubPlayer (movement + animations, no combat)
- 3 animated NPC sprites (Peasants_1=blacksmith, Peasants_3=merchant, Elf_3=guild master)
- Interaction prompt UI (press E) with proximity detection (< 48px)
- InventorySystem: gold, materials (bones/crystals/essence), equipment tiers, potion loadout (3 slots)
- SaveManager extended with inventory fields
- Blacksmith UI: 2 weapon upgrade tiers (Sword → Tempered → Flame), 2 armor tiers
- Potion Shop UI: 3 potion types (Health, Speed, Strength), 3 loadout slots
- Guild Board UI: floor select, checkpoint teleport, rank display
- Enemy auto-drop system: skeletons drop bones (70%), bats drop crystals (50%), bosses drop essence
- Potion usage in dungeon: keys 1/2/3 trigger loaded potion, shown in HUD
- Asset extraction: unzip craftpix NPC, background, icon packs to `public/assets/`
- BootScene updates to load all new textures

### Out of Scope
- Training grounds / ability unlock system (deferred Phase 4)
- Companion/party system
- Town upgrades / town level system
- Cooking system
- Rift events
- Ability icon display in shop UI (future)
- Wand/book class items (no mage class yet)

## Prerequisites
- 13 craftpix zip files present in `/Users/harvey/Downloads/`
- Vite dev server (`npm run dev`) running for testing at http://localhost:5175

## Context for Implementer

> This section is critical for cross-session continuity.

- **Patterns to follow:**
  - Scene mixin pattern: `Object.assign(Scene.prototype, Mixin)` — see `src/scenes/DungeonScene.js:308`
  - Overlay scenes running in parallel: `this.scene.launch("UIScene")` — see `src/scenes/DungeonScene.js:49`
  - Pure JS systems with no Phaser dependency: `src/systems/SaveManager.js`, `src/systems/HealthSystem.js`
  - Event bus via `this.registry.get("events")` shared across scenes — see `src/scenes/DungeonScene.js:33`
  - All textures generated procedurally or loaded in BootScene: `src/scenes/BootScene.js`

- **Conventions:**
  - Files in `src/scenes/` for Phaser scenes, `src/systems/` for pure-JS logic, `src/entities/` for Phaser GameObjects
  - Private methods prefixed with `_`
  - Constants exported from `src/config/constants.js`
  - Assets served from `public/assets/` (Vite serves public/ at root)
  - ES module imports throughout

- **Key files:**
  - `src/scenes/HubScene.js` — existing menu scene, will be heavily rewritten (keep `_startDungeon`)
  - `src/scenes/BootScene.js` — add new asset loads here; generates procedural textures
  - `src/systems/SaveManager.js` — extend DEFAULT_SAVE and add inventory methods
  - `src/main.js` — add new scenes to scene array here
  - `src/config/constants.js` — add new constants here

- **Gotchas:**
  - Game resolution is 480×270 px (internal), scaled to 1280×720 via `Phaser.Scale.FIT`. All positions are in 480×270 space.
  - Player/NPC sprites are 128×128 per frame but displayed much smaller via scale — match the player scale (~0.35) for NPCs. NPC scale must be explicitly set to 0.35 in HubNPC constructor.
  - `pixelArt: true` and `roundPixels: true` are set globally — all images must be crisp pixel art; do NOT use bilinear filtering.
  - The `UIScene` runs as an overlay above `DungeonScene` using `setScrollFactor(0)`. Hub facility scenes should do the same for their UI panels.
  - Tilemap asset `tiles` is a 16×48 PNG with 3 tiles stacked vertically (tile IDs 0=empty/bg, 1=ground, 2=platform) — see `BootScene._generateTileAssets()`.
  - NPC sprites from craftpix are large files. Extract to `public/assets/sprites/npcs/` subdirectory.
  - Farm market background PNGs are `~1334×750` cartoon style. Use as parallax with `setScrollFactor(0.2)` / `setScrollFactor(0.5)` and scale to fit hub width.
  - **Phaser mock is empty** (`src/__mocks__/phaser.js` exports `export default {}`). Any new test that imports a Phaser-dependent module (scenes, entities) will fail. All new test files must only import pure-JS modules (`InventorySystem`, `DropSystem`, `SaveManager`) — never Phaser scenes or entities.
  - **InventorySystem must save on dungeon shutdown**: In `DungeonScene.create()`, register `this.events.on("shutdown", () => InventorySystem.saveInventory())`. This ensures drops accumulated during a run persist even on death or scene transitions without explicit save calls.

- **Domain context:**
  - `SaveManager.getClearedFloors()` returns array of boss floor numbers (multiples of 10). Floor `n` cleared = can start at `n+1`.
  - `ClassRegistry` holds the two classes: `"shinobi"` and `"knight"`. Hub must preserve class selection.
  - Death in dungeon currently returns to `HubScene` — the hub must handle incoming data gracefully (check `data.fromDeath` or similar).

## Runtime Environment

- **Start command:** `npm run dev` (Vite dev server)
- **Port:** 5175 (5174 may be in use)
- **Health check:** `curl -s http://localhost:5175 | head -5`
- **Restart procedure:** Server auto-reloads on file changes (Vite HMR)

## Progress Tracking

**MANDATORY: Update this checklist as tasks complete. Change `[ ]` to `[x]`.**

- [x] Task 1: Extract craftpix assets and update BootScene loading
- [x] Task 2: InventorySystem + SaveManager extension
- [x] Task 3: Enemy material drop system (auto-collect on death)
- [x] Task 4: Walkable HubScene with parallax background and HubPlayer
- [x] Task 5: NPC entities with animations and interaction system
- [x] Task 6: Blacksmith UI scene (weapon/armor upgrade tree)
- [x] Task 7: Potion Shop UI scene (buy/loadout)
- [x] Task 8: Guild Board UI scene (floor select, checkpoints)
- [x] Task 9: Potion usage in dungeon (hotkeys 1/2/3, HUD slots)

**Total Tasks:** 9 | **Completed:** 9 | **Remaining:** 0

## Implementation Tasks

---

### Task 1: Extract Craftpix Assets and Update BootScene Loading

**Objective:** Unzip all craftpix NPC, background, and icon files into `public/assets/` subdirectories and register them in BootScene so all subsequent tasks can reference them by key.

**Dependencies:** None

**Files:**
- Create: `scripts/extract-assets.sh` (one-time extraction script)
- Modify: `src/scenes/BootScene.js`

**Key Decisions / Notes:**
- Extract to these target paths (relative to `public/assets/`):
  - `sprites/npcs/blacksmith-idle.png` ← `Peasants_1/Idle.png` (1536×128, 12 frames)
  - `sprites/npcs/blacksmith-dialogue.png` ← `Peasants_1/Dialogue.png` (1408×128, 11 frames)
  - `sprites/npcs/merchant-idle.png` ← `Peasants_3/Idle.png` (896×128, 7 frames)
  - `sprites/npcs/merchant-sell.png` ← `Peasants_3/Sell.png` (1792×128, 14 frames)
  - `sprites/npcs/guildmaster-idle.png` ← `Elf_3/Idle.png` (896×128, 7 frames)
  - `sprites/npcs/guildmaster-dialogue.png` ← `Elf_3/Dialogue.png` (1024×128, 8 frames)
  - `backgrounds/hub-bg-far.png` ← farm market Layer 00 PNG
  - `backgrounds/hub-bg-near.png` ← farm market Layer 01 PNG
  - `icons/weapons/` ← sample icons from weapon icon pack 1 (icons 01–30)
  - `icons/armor/` ← sample icons from armor icon pack 1 (icons 01–30)
  - `icons/items/` ← sample icons from RPG things pack (icons 01–10)
- Frame counts: divide sheet width (px) by 128 to get frame count
- In BootScene, load each spritesheet with `frameWidth: 128, frameHeight: 128`
- Load 32×32 icons as individual `this.load.image()` calls (not spritesheets)
- No changes to existing load calls — append only

**Definition of Done:**
- [ ] `scripts/extract-assets.sh` exists and extracts all files when run
- [ ] All 6 NPC sprite sheets loaded in BootScene with correct frameWidth/frameHeight
- [ ] 2 hub background images loaded in BootScene
- [ ] At least 3 weapon icons, 3 armor icons, 3 item icons loaded as images
- [ ] `npx vitest run` passes (no new failures)
- [ ] `npm run build` succeeds

**Verify:**
- `bash scripts/extract-assets.sh && ls public/assets/sprites/npcs/`
- `npx vitest run --reporter=verbose 2>&1 | tail -5`

---

### Task 2: InventorySystem + SaveManager Extension

**Objective:** Create a pure-JS `InventorySystem` that tracks gold, materials, equipment tiers, and potion loadout, with full persistence via an extended `SaveManager`.

**Dependencies:** None

**Files:**
- Create: `src/systems/InventorySystem.js`
- Modify: `src/systems/SaveManager.js`
- Create: `tests/systems/InventorySystem.test.js`

**Key Decisions / Notes:**
- `InventorySystem` is a singleton object (same pattern as `SaveManager`) — pure JS, no Phaser
- Inventory schema (to be added to `DEFAULT_SAVE` in SaveManager):
  ```js
  inventory: {
    gold: 0,
    materials: { bones: 0, crystals: 0, essence: 0 },
    weaponTier: 0,   // 0=basic, 1=tempered, 2=flame
    armorTier: 0,    // 0=basic, 1=reinforced
    potionLoadout: [ null, null, null ],  // 3 slots: {type, count} or null
  }
  ```
- Methods: `addGold(n)`, `spendGold(n)` (returns bool), `addMaterial(type, n)`, `spendMaterial(type, n)`, `getInventory()`, `upgradeWeapon()`, `upgradeArmor()`, `buyPotion(type)`, `setLoadoutSlot(slot, type)`, `consumePotion(slot)` (returns type or null), `canAffordUpgrade(type, tier)`
- Upgrade costs (weapon): tier 1 = 20 gold + 5 bones; tier 2 = 50 gold + 10 bones + 3 crystals
- Upgrade costs (armor): tier 1 = 15 gold + 8 bones; tier 2 = 40 gold + 5 crystals
- Potion costs: health=10g, speed=12g, strength=15g
- `SaveManager` gets 3 new methods: `getInventory()`, `saveInventory(data)`, `resetInventory()`
- On `SaveManager.load()` for saves without `inventory` key, return `DEFAULT_SAVE.inventory` (backward compat). The existing merge pattern already handles this since `load()` does `Object.assign({}, DEFAULT_SAVE, loaded)`.
- `InventorySystem.init()` must call `SaveManager.load()` to hydrate state on module first use.
- `InventorySystem.saveInventory()` calls `SaveManager.saveInventory(this._state)`.

**Definition of Done:**
- [ ] `InventorySystem.js` exports singleton with all listed methods
- [ ] `SaveManager.js` extended with inventory persistence, backward-compatible with existing saves
- [ ] `InventorySystem.test.js` covers: gold add/spend, material add/spend, upgrade gating, potion buy/consume, loadout set, persistence round-trip
- [ ] **Backward compat test**: `SaveManager.getInventory()` returns default inventory when loaded save has no `inventory` key (simulated by `localStorage.setItem("bladequest-save", JSON.stringify({unlockedClasses:["shinobi"]}))` before `load()`)
- [ ] All existing SaveManager tests still pass
- [ ] `npx vitest run` passes with ≥90% coverage on new files

**Verify:**
- `npx vitest run tests/systems/InventorySystem.test.js --reporter=verbose`
- `npx vitest run tests/systems/SaveManager.test.js --reporter=verbose`

---

### Task 3: Enemy Material Drop System

**Objective:** When enemies die in the dungeon, automatically award the player gold and materials based on enemy type and floor depth, stored in `InventorySystem`.

**Dependencies:** Task 2

**Files:**
- Modify: `src/scenes/DungeonCombat.js`
- Modify: `src/scenes/DungeonBoss.js`
- Create: `tests/systems/DropSystem.test.js` (pure logic unit test)

**Key Decisions / Notes:**
- Drop logic (pure function, extractable and testable): `getDropsForEnemy(type, floor)`
  - Skeleton: `{ gold: randInt(1,3), bones: Math.random() < 0.7 ? 1 : 0 }`
  - Bat: `{ gold: randInt(1,2), crystals: Math.random() < 0.5 ? 1 : 0 }`
  - Boss: `{ gold: 20 + floor * 2, essence: 1, bones: 3, crystals: 2 }`
- Call `InventorySystem.addGold()` and `InventorySystem.addMaterial()` from combat handlers
- No visual pickup object (auto-collect). Show floating `+Ng +1 bone` text using `this.scene.add.text()` at enemy position, then fade/float up over 1s
- Floating text added to `DungeonCombatMixin` (where enemy death is already handled)
- Boss drops handled in `DungeonBossMixin._checkBossDefeated()` callback
- Extract `getDropsForEnemy` as a standalone function exported from `src/systems/DropSystem.js` so it can be unit-tested without Phaser
- **InventorySystem shutdown save**: In `DungeonScene.create()`, add `this.events.on("shutdown", () => InventorySystem.saveInventory())` so inventory is persisted on every dungeon exit (death, floor advance to hub, ESC, or crash recovery).

**Definition of Done:**
- [ ] `DropSystem.js` exports `getDropsForEnemy(type, floor)` returning `{gold, bones?, crystals?, essence?}`
- [ ] Skeleton death triggers gold + bones award (verified via `InventorySystem.getInventory()`)
- [ ] Bat death triggers gold + crystals award
- [ ] Boss death triggers large gold + essence + bones + crystals award
- [ ] Floating pickup text appears at enemy position and fades up
- [ ] `DropSystem.test.js` covers: correct types per enemy, correct floor scaling, no negative drops
- [ ] `npx vitest run` passes

**Verify:**
- `npx vitest run tests/systems/DropSystem.test.js --reporter=verbose`

---

### Task 4: Walkable HubScene with Parallax Background and HubPlayer

**Objective:** Replace the existing menu-based `HubScene` with a fully walkable side-scrolling platformer town scene featuring a parallax background, ground, and a `HubPlayer` entity the player controls.

**Dependencies:** Task 1

**Files:**
- Modify: `src/scenes/HubScene.js` (major rewrite — preserve `_startDungeon(floor, classId)`)
- Create: `src/entities/HubPlayer.js`

**Key Decisions / Notes:**
- Hub world width: 1440px (3× screen width). Camera follows HubPlayer with same lerp as dungeon.
- Ground: solid tile layer at y=248 (height 22px), full world width, using existing `tile-ground` generated texture. Build as 16px tiles with Arcade physics body.
- Parallax: `hub-bg-far` at scrollFactor 0.15, `hub-bg-near` at scrollFactor 0.35. Both tiled horizontally (`setTileScaleX` or placed as repeated images) to cover world width. Scale vertically to fill screen height.
- Building zones (static rectangles as visual markers, styled as building facades):
  - x=100: Dungeon Entrance (dark archway, `0x2a1a3e`)
  - x=380: Blacksmith (orange/red forge colors, `0x3d1a00`)
  - x=720: Potion Shop (green/teal, `0x003d1a`)
  - x=1100: Guild Board (blue/gold, `0x001a3d`)
- Building facades are `this.add.rectangle()` + drawn signs, no complex art needed at this stage
- `HubPlayer` extends `Phaser.Physics.Arcade.Sprite` **directly** — NOT the existing `Player` class. The full `Player` class instantiates `HealthSystem`, `ManaSystem`, `AbilitySystem`, combat hitboxes, and input state machines that are irrelevant in the hub. `HubPlayer` has only: left/right movement (A/D/arrows), jump (space/up/W), idle/run/jump animation playback, and scale 0.35.
- Player spawns at x=80, y=220. On return from dungeon (`data.fromDungeon=true`), spawn near dungeon entrance.
- Preserve class selection: store `_selectedClassId` in registry or pass through scene data so DungeonScene still gets it.
- Remove all old HubScene UI (class cards, start button etc.) — these move to GuildBoard (Task 8).

**Definition of Done:**
- [ ] HubScene renders parallax background, ground, and 4 building zones without errors in browser console
- [ ] HubPlayer moves left/right and jumps; physics collision with ground works (player does not fall through floor)
- [ ] Camera follows HubPlayer through the 1440px world with lerp (player can walk off-screen left or right and camera follows)
- [ ] `HubPlayer` does NOT instantiate HealthSystem, ManaSystem, AbilitySystem, or combat hitboxes
- [ ] Returning from DungeonScene (`scene.start("HubScene", {fromDungeon:true})`) does not crash
- [ ] Old `ENTER DUNGEON` button removed; HubScene no longer starts DungeonScene directly
- [ ] `npx vitest run` passes (no regressions)

**Verify:**
- `npx vitest run --reporter=verbose 2>&1 | tail -5`
- Manual: open http://localhost:5175, player walks across town, camera follows, parallax scrolls

---

### Task 5: NPC Entities with Animations and Interaction System

**Objective:** Place 3 animated NPC shopkeepers in the hub town that display an interaction prompt when the player approaches and respond to E key press.

**Dependencies:** Task 4

**Files:**
- Create: `src/entities/HubNPC.js`
- Modify: `src/scenes/HubScene.js`

**Key Decisions / Notes:**
- `HubNPC` extends `Phaser.GameObjects.Sprite` (NOT physics — NPCs don't move)
- Constructor: `(scene, x, y, idleKey, dialogueKey, frameCount, role)`
- Plays idle animation by default (looping). On proximity, plays dialogue animation, then loops back to idle when player leaves.
- Frame counts (width / 128):
  - blacksmith-idle: 12 frames | blacksmith-dialogue: 11 frames
  - merchant-idle: 7 frames | merchant-sell: 14 frames
  - guildmaster-idle: 7 frames | guildmaster-dialogue: 8 frames
- Scale: 0.35 (same as HubPlayer)
- setDepth(5) so NPCs appear in front of background
- Proximity detection in HubScene.update(): `dist < 48px` between player and NPC
- Prompt: `this.add.text(npc.x, npc.y - 30, "E  Interact", {...}).setDepth(10)` — show/hide each frame
- E key press calls `npc.onInteract()` → emits event via registry: `events.emit("npc-interact", npc.role)`
- HubScene listens for `npc-interact` and launches the appropriate facility scene:
  - `"blacksmith"` → `this.scene.launch("BlacksmithScene")`
  - `"merchant"` → `this.scene.launch("PotionShopScene")`
  - `"guild"` → `this.scene.launch("GuildBoardScene")`
- NPCs placed at: blacksmith x=430, merchant x=760, guildmaster x=1140. All y=210 (standing on ground).
- Animations registered in `createAnimations` or directly in HubNPC constructor using `scene.anims.create()`

**Definition of Done:**
- [ ] 3 NPCs visible in hub scene with idle animations playing
- [ ] Interaction prompt appears when player is within 48px of any NPC
- [ ] Prompt disappears when player moves away
- [ ] E key triggers correct facility scene launch for each NPC
- [ ] NPC plays dialogue animation while prompt is showing; returns to idle after
- [ ] `npx vitest run` passes

**Verify:**
- Manual: walk up to each NPC, see prompt, press E, verify correct scene launches

---

### Task 6: Blacksmith UI Scene

**Objective:** Build a `BlacksmithScene` overlay scene that shows weapon and armor upgrade tiers using craftpix weapon/armor icons, checks inventory for affordability, and applies upgrades.

**Dependencies:** Tasks 2, 5

**Files:**
- Create: `src/scenes/BlacksmithScene.js`
- Modify: `src/main.js` (add BlacksmithScene to scene array)

**Key Decisions / Notes:**
- `BlacksmithScene` extends `Phaser.Scene` with key `"BlacksmithScene"`. Launched as parallel scene (`this.scene.launch()`).
- Semi-transparent backdrop: `this.add.rectangle(0, 0, 480, 270, 0x000000, 0.7).setOrigin(0,0).setScrollFactor(0)`
- UI panel: centered rect 340×180 with border
- Two sections: "WEAPON" and "ARMOR"
- Weapon tiers displayed as 3 weapon icons (32×32) with tier names and material costs:
  - Tier 0 (Basic Sword): icon `weapon-01`, name "Iron Blade" — starting gear
  - Tier 1 (Tempered Sword): icon `weapon-10`, "20g + 5 bones" — upgrades at this cost
  - Tier 2 (Flame Blade): icon `weapon-20`, "50g + 10 bones + 3 crystals"
- Armor tiers:
  - Tier 0: icon `armor-01`, "Leather Armor" — starting
  - Tier 1: icon `armor-10`, "15g + 8 bones" — chain mail
- Current tier highlighted in gold; unavailable tiers greyed out; affordable next tier shows "UPGRADE" button
- "UPGRADE" button calls `InventorySystem.upgradeWeapon()` / `upgradeArmor()` — refreshes display
- ESC key closes scene: `this.input.keyboard.on("keydown-ESC", () => { this.scene.stop("BlacksmithScene"); })`. HubScene must NOT be stopped when launching facility scenes — use `this.scene.launch()` (not `start()`), so HubScene continues running in the background.
- Also close when clicking outside the panel rect bounds
- Apply `setScrollFactor(0)` to all UI elements
- **Input isolation**: `this.input.keyboard.on(...)` in facility scenes only fires when that scene is active. HubScene's own input keys (A/D/E/space) will still fire since HubScene is still active. This is intentional — if player movement during open shop UI is undesirable, add `this.scene.pause("HubScene")` on open and `this.scene.resume("HubScene")` on close.

**Definition of Done:**
- [ ] BlacksmithScene opens over HubScene without stopping it
- [ ] Weapon and armor tiers displayed with craftpix icons
- [ ] Current tier highlighted; next tier shows cost
- [ ] Clicking UPGRADE with sufficient resources: deducts cost, advances tier, refreshes UI
- [ ] Clicking UPGRADE without resources: shows "Not enough [material]" in red for 1.5s
- [ ] ESC closes scene and resumes HubScene
- [ ] `npx vitest run` passes

**Verify:**
- Manual: interact with blacksmith NPC, see upgrade UI, attempt upgrade with/without funds

---

### Task 7: Potion Shop UI Scene

**Objective:** Build a `PotionShopScene` overlay where the player buys potions and equips them to 3 loadout slots, persisted in `InventorySystem`.

**Dependencies:** Tasks 2, 5

**Files:**
- Create: `src/scenes/PotionShopScene.js`
- Modify: `src/main.js`

**Key Decisions / Notes:**
- Same overlay pattern as BlacksmithScene
- Shop section: 3 potion types for purchase using craftpix RPG item icons:
  - Health Potion: icon `item-01`, "10g — Restores 2 HP"
  - Speed Potion: icon `item-05`, "12g — +50% speed for 10s"
  - Strength Potion: icon `item-10`, "15g — +1 attack dmg for 10s"
- Loadout section: 3 slots (labeled "1", "2", "3") showing currently equipped potion or empty
- Buy flow: click potion → adds to inventory count (max 5 per type). Shows count next to icon.
- Equip flow: click slot → shows potion picker → click potion → assigns to slot
- `InventorySystem.buyPotion(type)`: checks gold, deducts, increments count
- `InventorySystem.setLoadoutSlot(slotIndex, type)`: assigns potion type to slot
- ESC closes: `this.scene.stop("PotionShopScene")`. Same pause/resume pattern as BlacksmithScene.
- Gold display in top corner of panel.

**Definition of Done:**
- [ ] PotionShopScene opens over HubScene (HubScene continues running behind it)
- [ ] 3 potion types shown with icons, names, costs, and current owned count
- [ ] Buying deducts gold; buying with no gold shows "Not enough gold" in red for 1.5s
- [ ] 3 loadout slots shown; clicking assigns a potion type to that slot
- [ ] Loadout slots and potion counts persist after closing and reopening (round-trip via InventorySystem)
- [ ] ESC closes scene, HubScene input resumes normally
- [ ] `npx vitest run` passes

**Verify:**
- Manual: buy potions, assign to loadout slots, close and reopen to confirm persistence

---

### Task 8: Guild Board UI Scene

**Objective:** Build a `GuildBoardScene` overlay for floor selection, checkpoint teleport, class selection, and dungeon entry — replacing the current direct-start functionality.

**Dependencies:** Task 5

**Files:**
- Create: `src/scenes/GuildBoardScene.js`
- Modify: `src/main.js`

**Key Decisions / Notes:**
- Same overlay pattern as other facility scenes
- Sections:
  1. **Class Selection** — shows Shinobi / Holy Knight cards (styled same as old HubScene but smaller), highlights selected. Left/right arrows or clickable.
  2. **Floor Entry** — "[ ENTER DUNGEON ]" button starts from Floor 1
  3. **Checkpoints** — lists `SaveManager.getClearedFloors()` as teleport buttons (same logic as old HubScene)
  4. **Rank Display** — "Adventurer Rank: F" based on highest floor reached (F=0-9, E=10-19, D=20-29, C=30-39, B=40-49, A=50+)
- On floor start: `this.scene.stop("GuildBoardScene"); this.scene.stop("HubScene"); this.scene.start("DungeonScene", { classId, startFloor })`. Both scenes stopped before DungeonScene starts to avoid orphaned scenes consuming memory.
- Persists selected class to registry: `this.registry.set("selectedClassId", classId)`
- On return from dungeon, HubScene reads `this.registry.get("selectedClassId")` for display

**Definition of Done:**
- [ ] GuildBoardScene shows class cards, floor entry button, checkpoints, rank
- [ ] Selecting a class updates highlight; entering dungeon passes correct classId
- [ ] Checkpoint buttons start at correct floor (boss floor + 1)
- [ ] Rank correctly computed from `SaveManager.load().highestFloor`
- [ ] ESC closes without starting dungeon
- [ ] `npx vitest run` passes

**Verify:**
- Manual: open guild board, select class, enter dungeon — DungeonScene starts with correct classId and floor

---

### Task 9: Potion Usage in Dungeon (Hotkeys 1/2/3)

**Objective:** Allow the player to consume potions during dungeon runs using keys 1/2/3 mapped to loadout slots, with visual HUD slots showing remaining counts and potion effects applied to the player/game.

**Dependencies:** Task 7

**Files:**
- Modify: `src/scenes/DungeonScene.js`
- Modify: `src/scenes/UIScene.js`

**Key Decisions / Notes:**
- Load potion loadout at dungeon start: `this._potionLoadout = InventorySystem.getInventory().potionLoadout`
- Keys 1/2/3 bound in DungeonScene.create() via `this.input.keyboard.addKey("ONE")` etc.
- On press: `InventorySystem.consumePotion(slotIndex)` returns `{type, count}` or null. If type returned, apply effect:
  - `"health"`: `this._healthSystem.heal(2)` (capped at max), emit health-changed
  - `"speed"`: set `this.player._speedMultiplier = 1.5`, schedule reset after 10000ms
  - `"strength"`: set `this.player._damageMultiplier = 2`, schedule reset after 10000ms
- HUD: add 3 potion slot icons in UIScene at bottom-right of screen (y=255, x from right). Each slot shows potion icon (32×32, scaled to 16px) and count. Update via `events.emit("potion-loadout-changed", loadout)`.
- Empty slot shown as grey box. Non-empty slot shows icon and count badge.
- After consuming, emit `potion-loadout-changed` to update HUD.
- `_speedMultiplier` and `_damageMultiplier` used in Player movement and CombatSystem respectively. Default 1.0 if not set.

**Definition of Done:**
- [ ] Keys 1/2/3 consume the corresponding loadout slot potion in dungeon
- [ ] Health potion restores 2 HP (clamped to max), heart HUD updates
- [ ] Speed potion increases player move speed for 10s; reverts after
- [ ] Strength potion doubles player damage for 10s; reverts after
- [ ] Potion slots shown in UIScene HUD with correct counts
- [ ] Consuming removes one from count; slot shows grey when count = 0
- [ ] `npx vitest run` passes

**Verify:**
- Manual: enter dungeon with potions loaded, press 1/2/3, verify effects apply and HUD updates

---

## Testing Strategy

- **Unit tests** (pure JS, no Phaser): InventorySystem, DropSystem, SaveManager extension — full coverage of logic paths
- **Integration tests**: Not applicable (Phaser scenes can't be unit tested meaningfully)
- **Manual verification**: Each UI scene tested manually via browser — open facility, perform actions, verify persistence
- All tests: `npx vitest run` must pass with 0 failures after each task

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| NPC sprite scale mismatch with hub player | Med | Med | Set NPC scale to 0.35 matching HubPlayer; adjust if visually off |
| Farm market cartoon backgrounds clash with pixel art characters | Med | Low | Use background as distant parallax layer at low scroll factor (0.15); contrast distinguishes layers |
| InventorySystem state not synced between DungeonScene and hub on return | Med | High | Always call `InventorySystem.saveInventory()` on dungeon scene shutdown (`shutdown` event); reload fresh on hub create |
| Phaser parallel scene input conflicts (ESC closes wrong scene) | Low | Med | Each facility scene captures its own ESC handler and calls `this.scene.stop()` on itself only |
| SaveManager backward compatibility broken by new inventory field | Low | High | `load()` merges loaded data with defaults — if `inventory` key missing, default inventory used |
| Asset extraction script hardcodes paths that differ on other machines | Low | Low | Script only needed once to populate public/assets/; document clearly in plan |

## Open Questions

None — all requirements are clear.

### Deferred Ideas
- Training Grounds / skill unlock tree (Phase 4)
- Companion/party hire board
- Town upgrade system (blacksmith levels up)
- Cooking system (inn)
- Rift events on dungeon floors
- Trophy room with boss display
