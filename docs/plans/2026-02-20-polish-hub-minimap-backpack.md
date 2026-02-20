# Polish Pass + Hub Minimap + Backpack Panel Implementation Plan

Created: 2026-02-20
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

**Goal:** Add visual polish across all scenes (fade transitions, camera shake, portal pulse, NPC prompt bubbles, drop text pop, enemy hit flash, panel styling, building signs, death overlay, minimap colors), add a hub town minimap, and add a grid-style backpack inventory panel.

**Architecture:** All polish tweaks are small modifications to existing files. The hub minimap is a new mixin on HubScene (following UISceneMinimap pattern). The backpack panel is a new mixin on HubScene (following UISceneStats modal pattern). No new systems or dependencies needed — everything reads from existing InventorySystem/SaveManager.

**Tech Stack:** Phaser 3 (existing), PIXEL_FONT bitmap text, Phaser tweens/camera effects

## Scope

### In Scope

- 10 visual polish items across existing scenes
- Hub town minimap overlay (new HubScene mixin)
- Backpack inventory panel with grid layout (new HubScene mixin)

### Out of Scope

- New game mechanics, items, or systems
- Changes to InventorySystem data model
- Changes to SaveManager persistence
- New asset loading (all using existing generated textures/loaded sprites)

## Prerequisites

- Existing PIXEL_FONT system working (confirmed)
- InventorySystem with gold, materials, potionLoadout, potionCounts, weaponTier, armorTier
- All scene files already converted to bitmapText

## Context for Implementer

- **Patterns to follow:**
  - Mixin pattern: `Object.assign(Scene.prototype, Mixin)` — see `src/scenes/UISceneMinimap.js` for minimap, `src/scenes/UISceneStats.js` for modal panel
  - bt() helper for facility scenes: `src/scenes/GuildBoardScene.js:18-25`
  - PIXEL_FONT import: `import { PIXEL_FONT } from "../config/PixelFont.js"`
  - All text uses `bitmapText(x, y, PIXEL_FONT, str, 8)` with `.setTint(0xrrggbb)`
- **Conventions:**
  - Depth layers: negative=parallax, 0-10=world, 50=hub title, 90-93=dungeon minimap, 100-102=HUD, 200-201=toasts, 300-302=modals
  - `setScrollFactor(0)` for all camera-fixed UI elements
  - Events via `this.registry.get("events")` EventEmitter for inter-scene communication
- **Key files:**
  - `src/scenes/HubScene.js` — hub scene controller, applies HubSceneWorldMixin
  - `src/scenes/HubSceneWorld.js` — buildings/NPCs/parallax, BUILDINGS array, _buildNPCs()
  - `src/scenes/DungeonScene.js` — dungeon controller, launches UIScene
  - `src/scenes/DungeonFloor.js` — _createPassageSprite(), _spawnDustParticles()
  - `src/scenes/DungeonCombat.js` — _showDropText(), _onPlayerContactEnemy(), _onEnemyDied()
  - `src/scenes/DungeonBoss.js` — _handleDeath(), _checkBossDefeated()
  - `src/scenes/UISceneMinimap.js` — minimap pattern (graphics at depths 90-93)
  - `src/scenes/UISceneStats.js` — modal panel pattern (depths 300-302, _statsObjects array, toggle/show/hide)
  - `src/entities/HubNPC.js` — _prompt bitmapText at depth 10
  - `src/scenes/GuildBoardScene.js` — facility panel with rectangle bg + stroke border
  - `src/scenes/BlacksmithScene.js` — facility panel pattern
  - `src/scenes/PotionShopScene.js` — facility panel pattern
  - `src/systems/InventorySystem.js` — getInventory() returns {gold, materials, weaponTier, armorTier, potionLoadout, potionCounts}
- **Gotchas:**
  - PIXEL_FONT only covers ASCII 32-126 — no Unicode arrows/symbols
  - BitmapText at 8px = 8px per character width for layout calculations
  - Game resolution is 480x270, scaled to display via Phaser.Scale.FIT
  - HubScene does NOT launch UIScene — only DungeonScene does
  - Enemy entities (Slime, Bat, Boss) all have `takeDamage()` — hit flash goes in the entity base or each file
  - `cameras.main.fadeIn/fadeOut/shake` are built-in Phaser camera effects

## Runtime Environment

- **Start command:** `npm run dev` (Vite dev server)
- **Build:** `npm run build` (Vite production build)
- **Verify:** `npm run build` exits 0 with no errors

## Progress Tracking

**MANDATORY: Update this checklist as tasks complete. Change `[ ]` to `[x]`.**

- [x] Task 1: Scene fade transitions
- [x] Task 2: Camera shake on damage + death screen overlay
- [x] Task 3: Dungeon passage portal pulse
- [x] Task 4: NPC interaction prompt bubble
- [x] Task 5: Drop text pop scale + enemy hit flash
- [x] Task 6: Facility panel double-border + building name signs
- [x] Task 7: Minimap room color differentiation
- [x] Task 8: Hub town minimap
- [x] Task 9: Backpack panel

**Total Tasks:** 9 | **Completed:** 9 | **Remaining:** 0

## Implementation Tasks

### Task 1: Scene Fade Transitions

**Objective:** Add fade-to-black transitions for all scene changes: hub→dungeon, dungeon→hub (death), entering/exiting facility scenes.

**Dependencies:** None

**Files:**

- Modify: `src/scenes/HubScene.js` — fadeIn on create(), fadeOut before _startDungeon() and facility launches
- Modify: `src/scenes/DungeonScene.js` — fadeIn on create()
- Modify: `src/scenes/DungeonBoss.js` — fadeOut during _handleDeath() before scene transition
- Modify: `src/scenes/GuildBoardScene.js` — fadeIn on create(), fadeOut on _close() and _startDungeon()
- Modify: `src/scenes/BlacksmithScene.js` — fadeIn on create(), fadeOut on close
- Modify: `src/scenes/PotionShopScene.js` — fadeIn on create(), fadeOut on close

**Key Decisions / Notes:**

- Use `this.cameras.main.fadeIn(300, 0, 0, 0)` and `this.cameras.main.fadeOut(300, 0, 0, 0)`
- For transitions that start a new scene, use fadeOut with `once("camerafadeoutcomplete")` callback to trigger scene.start/stop
- Facility scenes use short 200ms fades; dungeon transitions use 400ms
- HubScene.create() calls fadeIn; _startDungeon uses fadeOut → callback → scene.start
- _onNPCInteract wraps facility launch in fadeOut → callback

**Definition of Done:**

- [ ] `npm run build` succeeds with no errors
- [ ] Entering dungeon from hub shows black fade out then fade in
- [ ] Dying in dungeon fades out before returning to hub
- [ ] Opening/closing any facility (blacksmith, potion, guild) has brief fade
- [ ] No flash of wrong scene during transitions

**Verify:**

- `npm run build` — zero errors

### Task 2: Camera Shake on Damage + Death Screen Overlay

**Objective:** Add camera shake when player takes damage in dungeon. Add dark semi-transparent overlay behind the "You Died" text.

**Dependencies:** None

**Files:**

- Modify: `src/scenes/DungeonCombat.js` — add camera shake in _onPlayerContactEnemy() when health actually decreases
- Modify: `src/scenes/DungeonBoss.js` — add dark overlay rectangle in _handleDeath() before the "You Died" text

**Key Decisions / Notes:**

- Camera shake: `this.cameras.main.shake(120, 0.005)` — subtle, short duration
- Death overlay: `this.add.rectangle(cx, cy, 480, 270, 0x000000, 0.7).setScrollFactor(0).setDepth(199)` — below the death text at depth 200
- Only shake when health actually changes (the `before !== after` check already exists in _onPlayerContactEnemy)

**Definition of Done:**

- [ ] `npm run build` succeeds
- [ ] Camera shakes briefly when player takes damage from an enemy
- [ ] Death screen shows dark overlay behind "You Died" text
- [ ] Shake doesn't trigger during invulnerability frames

**Verify:**

- `npm run build` — zero errors

### Task 3: Dungeon Passage Portal Pulse

**Objective:** Make the dungeon floor exit portal pulse with a looping alpha tween instead of being a static green rectangle.

**Dependencies:** None

**Files:**

- Modify: `src/scenes/DungeonFloor.js` — add alpha tween in _createPassageSprite()

**Key Decisions / Notes:**

- After creating `this._passage`, add: `this.tweens.add({ targets: this._passage, alpha: { from: 0.4, to: 0.9 }, duration: 800, yoyo: true, repeat: -1, ease: "Sine.easeInOut" })`
- Store tween reference to clean up on destroy: `this._passageTween`
- Clean up in `_spawnPassage()` before recreating and in `_advanceFloor()` before destroying

**Definition of Done:**

- [ ] `npm run build` succeeds
- [ ] Dungeon exit portal pulses between 0.4 and 0.9 alpha continuously
- [ ] No tween leak when advancing floors (tween cleaned up)

**Verify:**

- `npm run build` — zero errors

### Task 4: NPC Interaction Prompt Bubble

**Objective:** Add a small dark semi-transparent rectangle behind the "E  Interact" prompt text for readability.

**Dependencies:** None

**Files:**

- Modify: `src/entities/HubNPC.js` — add background rectangle behind _prompt bitmapText

**Key Decisions / Notes:**

- Create a rectangle at same position as prompt text, slightly larger (padding 4px horizontal, 2px vertical)
- Prompt text is at `(x, y - 30)` with origin (0.5, 1), size 8, "E  Interact" = 11 chars = 88px wide
- Background: `scene.add.rectangle(x, y - 30 - 4, 96, 14, 0x000000, 0.6).setOrigin(0.5, 0.5).setDepth(9)` — below prompt at depth 10
- Store as `this._promptBg`, toggle visibility alongside `this._prompt`
- Destroy in `destroy()` method

**Definition of Done:**

- [ ] `npm run build` succeeds
- [ ] NPC prompt shows dark bubble background behind "E  Interact" text
- [ ] Bubble appears/disappears with the prompt text on proximity
- [ ] Bubble is properly destroyed when NPC is destroyed

**Verify:**

- `npm run build` — zero errors

### Task 5: Drop Text Pop Scale + Enemy Hit Flash

**Objective:** Add a scale pop tween to floating drop text. Add a brief white flash to enemies when they take damage.

**Dependencies:** None

**Files:**

- Modify: `src/scenes/DungeonCombat.js` — add scale tween to drop text in _showDropText()
- Modify: `src/entities/Slime.js` — add hit flash in takeDamage()
- Modify: `src/entities/Bat.js` — add hit flash in takeDamage()
- Modify: `src/entities/Boss.js` — add hit flash in takeDamage()

**Key Decisions / Notes:**

- Drop text: start at scaleX/Y 1.5, tween to 1.0 over 200ms with Quad.easeOut, concurrent with existing float-up tween
- Enemy hit flash: in each entity's `takeDamage()`, call `this.setTint(0xffffff)` then `this.scene.time.delayedCall(80, () => this.clearTint())` — simple delayed call, no tween needed
- If enemy is dead after damage, skip the tint reset (it'll be destroyed anyway)

**Definition of Done:**

- [ ] `npm run build` succeeds
- [ ] Drop text appears with a pop-in scale effect
- [ ] Enemies flash white briefly when hit
- [ ] Dead enemies don't error on tint reset

**Verify:**

- `npm run build` — zero errors

### Task 6: Facility Panel Double-Border + Hub Building Name Signs

**Objective:** Upgrade facility scene panel borders to double-border style. Add dark sign-plank rectangles behind hub building name labels.

**Dependencies:** None

**Files:**

- Modify: `src/scenes/BlacksmithScene.js` — add outer border rectangle
- Modify: `src/scenes/PotionShopScene.js` — add outer border rectangle
- Modify: `src/scenes/GuildBoardScene.js` — add outer border rectangle
- Modify: `src/scenes/HubSceneWorld.js` — add dark rectangle behind each building label in _buildBuildings()

**Key Decisions / Notes:**

- Double border: add a second rectangle 2px larger than the inner panel with a darker stroke color (0x223344) at depth just below the inner border. Inner keeps existing stroke.
- Building signs: for each building label, add `this.add.rectangle(cx, labelY + 4, labelW, 14, 0x0a0a1a, 0.75).setDepth(4)` just behind the label text at depth 5
- Label widths vary: "DUNGEON\nENTRANCE" is multiline (2 lines), "BLACK-\nSMITH" is multiline, etc. Use a fixed sign width of ~70px (covers all labels) centered on building cx

**Definition of Done:**

- [ ] `npm run build` succeeds
- [ ] Facility panels (blacksmith, potion shop, guild board) show double-border styling
- [ ] Hub building labels have dark sign-plank background rectangles
- [ ] Signs are properly centered behind text

**Verify:**

- `npm run build` — zero errors

### Task 7: Minimap Room Color Differentiation

**Objective:** Color dungeon minimap rooms differently based on type: current room green, boss room red, cleared rooms grey, unvisited rooms dark.

**Dependencies:** None

**Files:**

- Modify: `src/scenes/UISceneMinimap.js` — update _onLayoutChanged() and _onPlayerMoved() to color rooms by type
- Modify: `src/scenes/DungeonEvents.js` — pass boss room index in layout-changed event
- Modify: `src/scenes/DungeonFloor.js` — track visited rooms, emit room data

**Key Decisions / Notes:**

- Currently all rooms are drawn as 0x334433. Change to: current room 0x448844, boss room 0x884444, visited 0x334433, unvisited 0x222233
- The layout-changed event already sends `{ rooms, width, height }` — extend with `bossRoomIndex` (last room)
- Player-moved event sends `{ tx, ty }` — UISceneMinimap can determine which room the player is in by checking room bounds
- Track visited rooms as a Set of room indices in UISceneMinimap; mark room as visited when player enters it
- Redraw room colors on each player-moved event (rooms don't change often, cheap to redraw)

**Definition of Done:**

- [ ] `npm run build` succeeds
- [ ] Current room shows brighter green on minimap
- [ ] Boss room shows red tint on minimap
- [ ] Visited rooms show medium color, unvisited show dark

**Verify:**

- `npm run build` — zero errors

### Task 8: Hub Town Minimap

**Objective:** Add a small fixed-position minimap overlay in HubScene showing building positions and player dot.

**Dependencies:** None

**Files:**

- Create: `src/scenes/HubSceneMinimap.js` — new mixin following UISceneMinimap pattern
- Modify: `src/scenes/HubScene.js` — import and apply mixin, call _createHubMinimap() in create(), _updateHubMinimap() in update()

**Key Decisions / Notes:**

- Position: bottom-left corner, same as dungeon minimap (x=4, y=196, w=80, h=40) — shorter since hub is wider than tall
- Depth: 90-93 (same range as dungeon minimap since they never coexist — HubScene doesn't launch UIScene)
- Draw: dark background, border, then colored rectangles for each BUILDINGS entry, and a green dot for player
- Buildings rendered as small colored rectangles: dungeon=green, blacksmith=orange, potion=blue, guild=yellow
- Player dot updated each frame from `this.player.x` mapped to minimap space
- WORLD_W=1440 is already exported from HubSceneWorld.js

**Definition of Done:**

- [ ] `npm run build` succeeds
- [ ] Hub scene shows small minimap in bottom-left
- [ ] Each building appears as a colored dot/rectangle
- [ ] Player dot moves as player walks
- [ ] Minimap doesn't interfere with facility scene overlays

**Verify:**

- `npm run build` — zero errors

### Task 9: Backpack Panel

**Objective:** Add a grid-style backpack panel that opens with B key in HubScene, showing potion loadout slots with icons/counts, gold, and materials.

**Dependencies:** None

**Files:**

- Create: `src/scenes/HubSceneBackpack.js` — new mixin following UISceneStats modal pattern
- Modify: `src/scenes/HubScene.js` — import and apply mixin, call _initBackpackKey() in create()

**Key Decisions / Notes:**

- Pattern: follow UISceneStats exactly — toggle with B key, ESC to close, _backpackVisible flag, _backpackObjects array for cleanup
- Panel: centered, ~280x160, dark background (0x0a0a1a, 0.93), border stroke, depth 300-302
- Layout:
  - Title: "BACKPACK [B]" at top, tinted 0xaaccff
  - Gold row: "GOLD" label + value
  - Materials row: "BONES" / "CRYSTALS" / "ESSENCE" with values
  - Separator
  - Potion loadout: 3 slots showing icon (item-01/05/10), type name, count — use existing item icon textures
  - Equipment: "SWORD Tier X" / "ARMOR Tier X"
- Data source: `InventorySystem.getInventory()` returns all needed fields
- Potion icon map: health="item-01", speed="item-05", strength="item-10" (same as UISceneHUD)
- Each slot: 16x16 icon image + count text
- Import InventorySystem, not SaveManager (InventorySystem has the live state)

**Definition of Done:**

- [ ] `npm run build` succeeds
- [ ] Pressing B in hub opens backpack panel
- [ ] Panel shows gold, materials (bones/crystals/essence), potion slots with icons and counts
- [ ] Panel shows weapon and armor tier
- [ ] ESC or B again closes the panel
- [ ] Panel data reads from InventorySystem.getInventory()

**Verify:**

- `npm run build` — zero errors

## Testing Strategy

- Unit tests: Skip — this is a Phaser 3 game with no test infrastructure; all changes are visual
- Integration tests: N/A
- Manual verification: Build succeeds (`npm run build`), then visually verify each polish item and new panel in the running game

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
| ---- | ---------- | ------ | ---------- |
| Fade transition delays feel sluggish | Med | Low | Use short durations (200-400ms) and tune if needed |
| Camera shake on damage feels annoying | Low | Low | Use very subtle intensity (0.005) and short duration (120ms) |
| Hub minimap overlaps facility scenes | Low | Med | Facility scenes render at higher scene index (above HubScene), so they draw on top. Minimap at depth 90 won't show through |
| Backpack panel conflicts with stats panel keys | Low | Med | B key is distinct from TAB/I. ESC closes whichever is open. Backpack is HubScene-only; stats panel is UIScene-only (dungeon) |
| Tween cleanup missed on scene transitions | Med | Low | Store tween references and destroy in shutdown/cleanup handlers |
| Enemy hit flash fires after enemy destroyed | Low | Low | Guard tint reset with `if (this.active)` check |

## Open Questions

None — all requirements are clear.

### Deferred Ideas

- Animated building sprites (smoke from chimney, door opening)
- Hub NPC dialogue system with text bubbles
- Backpack drag-and-drop potion rearrangement
