# Premium Visual & Atmosphere Pass Implementation Plan

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

**Goal:** Add premium visual effects across combat feel (hit stop, red flash, death particles, chromatic aberration), scene progression (floor entry card, boss warning, death slow-mo), atmosphere (vignette, dungeon flicker, hub warm tint), and UI polish (smooth mana bar, button hover glow, panel slide-in) to elevate the game's visual quality.

**Architecture:** All features are additive visual effects layered onto existing scene/entity code via the established mixin pattern. No new gameplay mechanics, no new data models, no new scenes. Each effect is self-contained and uses existing Phaser 3 APIs (tweens, particles, camera effects, graphics). A new `particle-death` texture is generated in BootScene for enemy death bursts.

**Tech Stack:** Phaser 3.87, existing mixin architecture, bitmap text, Phaser camera effects, Phaser tweens

## Scope

### In Scope

- Combat feel: hit stop, red screen flash, enemy death particles, chromatic aberration on hit
- Scene/progression: floor entry title card, boss room warning, slow-motion death
- Atmosphere: screen vignette (dungeon), dungeon ambient flicker, hub warm tint
- UI polish: smooth mana bar lerp, button hover glow (facility scenes), panel slide-in animation (facility scenes)

### Out of Scope

- Sound effects / music (audio system not in scope)
- New gameplay mechanics or enemy behaviors
- Changes to InventorySystem, SaveManager, or any data models
- Health bar changes (hearts are image-based, not bars — lerp doesn't apply to discrete hearts)

## Prerequisites

- Previous polish plan (2026-02-20-polish-hub-minimap-backpack.md) must be VERIFIED
- All existing 193 tests must pass

## Context for Implementer

> This section is critical for cross-session continuity.

- **Patterns to follow:**
  - Mixin pattern: `Object.assign(Scene.prototype, Mixin)` — see `src/scenes/DungeonCombat.js:142`
  - Particle textures: generated in `src/scenes/BootScene.js:212` via `make.graphics → generateTexture`
  - Camera effects: `cameras.main.fadeIn/fadeOut/shake` — see `src/scenes/HubScene.js:91`
  - Tweens: `this.tweens.add({ targets, props, duration, ease })` — see `src/scenes/DungeonFloor.js:127`
  - Depth conventions: negative=parallax, 0-10=world, 50=drop text, 90-93=minimap, 100-102=HUD, 195-200=overlays, 300-302=modals
- **Conventions:**
  - PIXEL_FONT bitmap text: `bitmapText(x, y, PIXEL_FONT, str, 8)` — ASCII 32-126 only
  - ScrollFactor(0) for all HUD/overlay elements
  - Guard patterns: `if (this._closing) return;` for preventing double-triggers
  - Facility scenes: PX=70, PY=45, PW=340, PH=180 panel dimensions
- **Key files:**
  - `src/scenes/DungeonCombat.js` — combat callbacks (hit stop, red flash, death particles)
  - `src/scenes/DungeonBoss.js` — death handling, boss defeat
  - `src/scenes/DungeonScene.js` — main dungeon scene, update loop, floor transitions
  - `src/scenes/DungeonFloor.js` — floor construction, _advanceFloor()
  - `src/scenes/UISceneHUD.js` — health hearts, mana bar, HUD elements
  - `src/entities/Enemy.js` — base enemy class with takeDamage(), _die()
  - `src/scenes/BootScene.js` — particle texture generation
  - `src/scenes/BlacksmithScene.js` — facility panel pattern (button hover, slide-in)
  - `src/scenes/PotionShopScene.js` — facility panel pattern
  - `src/scenes/GuildBoardScene.js` — facility panel pattern
  - `src/scenes/HubScene.js` — hub scene, warm tint target
- **Gotchas:**
  - PIXEL_FONT only covers ASCII 32-126 — no Unicode
  - Game resolution is 480x270
  - `_handleDeath()` runs every frame during dying sequence — place one-time effects inside the `if (!this._isDying)` guard
  - `_onPlayerContactEnemy` already has camera shake — hit stop goes alongside it
  - Hearts are image-based (heart-full/heart-empty), not bars — "smooth health bar" from the user request translates to smooth mana bar only
  - The mana bar width is set directly via `this._manaFill.width = MANA_BAR_W * ratio` — lerp replaces this with gradual interpolation
  - `_advanceFloor()` calls `_buildFloor()` which calls `_emitFloorChanged()` — floor card should trigger on floor-changed event in UIScene
  - Boss room is always room index 0 (`this._layout.rooms[0]`)

## Runtime Environment

- **Start command:** `npm run dev` (Vite dev server, default http://localhost:5173)
- **Build:** `npm run build` (Vite production build)
- **Verify:** `npm run build` exits 0 with no errors

## Progress Tracking

**MANDATORY: Update this checklist as tasks complete. Change `[ ]` to `[x]`.**

- [x] Task 1: Hit stop + red screen flash + chromatic aberration
- [x] Task 2: Enemy death particles
- [x] Task 3: Slow-motion death
- [x] Task 4: Floor entry title card
- [x] Task 5: Boss room warning
- [x] Task 6: Screen vignette + dungeon ambient flicker
- [x] Task 7: Hub warm tint
- [x] Task 8: Smooth mana bar
- [x] Task 9: Button hover glow
- [x] Task 10: Panel slide-in animation

**Total Tasks:** 10 | **Completed:** 10 | **Remaining:** 0

## Implementation Tasks

### Task 1: Hit Stop + Red Screen Flash + Chromatic Aberration

**Objective:** When the player takes damage, briefly freeze physics (hit stop), flash a red overlay, and offset the camera by 1px then back (chromatic aberration effect) to make hits feel impactful.

**Dependencies:** None

**Files:**

- Modify: `src/scenes/DungeonCombat.js` — add hit stop, red flash, and chromatic offset in `_onPlayerContactEnemy()`

**Key Decisions / Notes:**

- Hit stop: call `this.physics.world.pause()`, then `this.time.delayedCall(50, () => this.physics.world.resume())` — 50ms freeze
- Red flash: create a `this.add.rectangle(240, 135, 480, 270, 0xff0000, 0.3).setScrollFactor(0).setDepth(195)`, tween alpha to 0 over 150ms, then destroy
- Chromatic aberration: offset `this._cameraTarget.x += 1` (works within the existing camera follow system), then reset after 33ms via delayedCall: `this._cameraTarget.x -= 1`. This avoids fighting the camera lerp system.
- All three effects trigger inside the existing `if (health changed)` block at `DungeonCombat.js:80`
- Scope: "any hit" means when the player takes damage (not when enemies are hit by the player) — the red flash and chromatic aberration are player-centric screen effects that wouldn't make sense on enemy hits
- Guard with local flag: set `this._hitStopActive = true` before pause, `false` in resume callback. Check `if (!this._hitStopActive)` before pausing. This is version-agnostic (avoids relying on `physics.world.isPaused` internal API).

**Definition of Done:**

- [ ] `npm run build` succeeds
- [ ] Player damage triggers 50ms physics pause (hit stop)
- [ ] Red overlay flashes at depth 195 and fades to transparent in 150ms
- [ ] Camera offsets by 1px and returns after ~33ms
- [ ] Effects only trigger when health actually decreases (not during invulnerability)

**Verify:**

- `npm run build` — zero errors
- Grep `DungeonCombat.js` for `physics.world.pause` and `0xff0000` to confirm implementation

### Task 2: Enemy Death Particles

**Objective:** When an enemy dies, emit a burst of small particles at its position before it disappears.

**Dependencies:** None

**Files:**

- Modify: `src/scenes/BootScene.js` — add `particle-death` texture generation (white 2x2 square)
- Modify: `src/entities/Enemy.js` — add particle burst in `_die()` method

**Key Decisions / Notes:**

- New texture in BootScene._generateParticleTextures(): white (0xffffff) 2x2 square named `particle-death`
- In Enemy._die(), add particle burst BEFORE setActive(false): capture `this.x, this.y` then emit particles, then proceed with setActive(false)
- Code: `const dx = this.x, dy = this.y; this.scene.add.particles(dx, dy, "particle-death", { speed: { min: 20, max: 80 }, angle: { min: 0, max: 360 }, lifespan: 300, quantity: 8, maxParticles: 8, tint: 0xff4444, alpha: { start: 1, end: 0 }, gravityY: 100 })`
- One-shot emitter (maxParticles = quantity = 8) — auto-destroys after lifespan
- Tint 0xff4444 for a blood-like burst. Set depth to the enemy's depth so it renders at the correct layer.
- IMPORTANT: Check if Boss.js overrides _die() — if so, ensure it calls super._die() so particles fire for boss deaths too

**Definition of Done:**

- [ ] `npm run build` succeeds
- [ ] `particle-death` texture is generated in BootScene
- [ ] Killing any enemy (slime, bat, boss) produces a particle burst at death position
- [ ] Particles fade out and don't leak (maxParticles limit)

**Verify:**

- `npm run build` — zero errors
- Grep `Enemy.js` for `particle-death` to confirm burst code
- Grep `BootScene.js` for `particle-death` to confirm texture generation

### Task 3: Slow-Motion Death

**Objective:** When the player dies, slow game time to 0.2x speed for 400ms before the death overlay appears, creating a dramatic death moment.

**Dependencies:** None

**Files:**

- Modify: `src/scenes/DungeonBoss.js` — add slow-motion in `_handleDeath()` before the death overlay

**Key Decisions / Notes:**

- Inside the `if (!this._isDying)` guard, BEFORE creating the overlay and text:
  - Set `this.time.timeScale = 0.2` and `this.physics.world.timeScale = 5` (physics timeScale is inverse — 5x = 0.2x speed)
  - After 400ms real time (use `this.time.delayedCall(80, ...)` — 80ms * 0.2 timeScale = 400ms real): restore `this.time.timeScale = 1` and `this.physics.world.timeScale = 1`
- Restructure _handleDeath into two phases:
  - Phase 1 (inside `if (!this._isDying)`): set `_isDying = true`, `_dyingMs = Infinity` (prevent countdown), stop player, tint red, start slow-mo (`this.time.timeScale = 0.2; this.physics.world.timeScale = 5`)
  - Phase 2 (via `setTimeout(400)` for real-time delay): restore `timeScale = 1`, set `_dyingMs = 1500`, create overlay + "You Died" text
  - The per-frame `_dyingMs -= dt` check skips countdown while _dyingMs is Infinity
- Use `this._deathPhase2Timer = setTimeout(...)` and clear in shutdown event handler

**Definition of Done:**

- [ ] `npm run build` succeeds
- [ ] Player death triggers slow-motion effect for ~400ms before death overlay
- [ ] Time scale restores to 1.0 after slow-motion ends
- [ ] Death overlay and "You Died" text appear after slow-motion completes
- [ ] No timer leaks (setTimeout cleared on scene shutdown)

**Verify:**

- `npm run build` — zero errors
- Grep `DungeonBoss.js` for `timeScale` to confirm slow-motion implementation

### Task 4: Floor Entry Title Card

**Objective:** Show a centered "FLOOR X" title card with tween-in/out animation when the player enters a new dungeon floor.

**Dependencies:** None

**Files:**

- Modify: `src/scenes/UISceneHUD.js` — add floor card display in `_onFloorChanged()`

**Key Decisions / Notes:**

- In `_onFloorChanged(floor)`, after updating floor text, create a centered title card:
  - `const card = this.add.bitmapText(240, 135, PIXEL_FONT, "FLOOR " + floor, 16).setOrigin(0.5).setTint(0xffcc44).setScrollFactor(0).setDepth(150).setAlpha(0)`
  - Tween in: alpha 0→1, scaleX/Y 0.5→1.0, duration 300ms, ease Quad.easeOut
  - Hold for 800ms
  - Tween out: alpha 1→0, y -20 (float up), duration 400ms, onComplete → destroy
- Use `this.tweens.chain()` or sequential tweens with delay
- Clean up any existing card before creating a new one (store as `this._floorCard`)

**Definition of Done:**

- [ ] `npm run build` succeeds
- [ ] Entering a new floor shows "FLOOR X" centered on screen
- [ ] Card fades in with scale effect, holds briefly, then fades out
- [ ] No stacking if floors advance rapidly (previous card destroyed)

**Verify:**

- `npm run build` — zero errors
- Grep `UISceneHUD.js` for `FLOOR` to confirm card code

### Task 5: Boss Room Warning

**Objective:** When a floor has a boss room, show a warning flash + shake + "WARNING" text when the player first enters the boss room area.

**Dependencies:** None

**Files:**

- Modify: `src/scenes/DungeonScene.js` — add boss room proximity detection in update(), emit `boss-warning` event
- Modify: `src/scenes/UIScene.js` — bind `boss-warning` event
- Modify: `src/scenes/UISceneHUD.js` — add `_onBossWarning()` handler with flash + text

**Key Decisions / Notes:**

- In DungeonScene.update(), after `_checkPassage()`:
  - If `this._layout.spawns.boss` exists and `!this._bossWarningShown`:
    - Get boss room bounds from `this._layout.rooms[0]`
    - Check if player is inside room bounds
    - If yes: set `this._bossWarningShown = true`, emit `boss-warning` event, shake camera
  - Initialize `this._bossWarningShown = false` in DungeonScene.create() alongside `_bossDefeated`
  - Also reset `this._bossWarningShown = false` at top of `_buildFloor()` (each new floor)
- In UISceneHUD._onBossWarning():
  - Flash: white rectangle 480x270, alpha 0.6, tween to 0 over 200ms, depth 196 (above floor card at 150)
  - Text: "WARNING" in PIXEL_FONT size 16, red tint 0xff4444, centered, depth 197, tween in (scale 2→1, alpha 0→1, 200ms), hold 600ms, tween out (alpha→0, 300ms), destroy
  - Camera shake is done from DungeonScene side: `this.cameras.main.shake(300, 0.01)`

**Definition of Done:**

- [ ] `npm run build` succeeds
- [ ] Entering the boss room triggers a white screen flash, camera shake, and "WARNING" text
- [ ] Warning only triggers once per floor (not on re-entry)
- [ ] Non-boss floors don't trigger warnings

**Verify:**

- `npm run build` — zero errors
- Grep `DungeonScene.js` for `boss-warning` and `_bossWarningShown`

### Task 6: Screen Vignette + Dungeon Ambient Flicker

**Objective:** Add a permanent dark vignette overlay to dungeon scenes for atmosphere. Add a subtle ambient brightness flicker to simulate torch/firelight.

**Dependencies:** None

**Files:**

- Modify: `src/scenes/DungeonScene.js` — add vignette and flicker in create()

**Key Decisions / Notes:**

- Vignette: Generate a radial gradient vignette texture in BootScene using canvas API:
  - In BootScene, create a canvas texture 480x270, use `ctx.createRadialGradient(240, 135, 100, 240, 135, 280)` with transparent center → black edges
  - Generate as texture named `vignette-overlay`
  - In DungeonScene.create(): `this.add.image(240, 135, "vignette-overlay").setScrollFactor(0).setDepth(-1)` — depth -1 sits above parallax (-20/-10) but behind ground tiles (0+)
- Ambient flicker: Add the flicker tween inside `_buildTilemap()` in DungeonFloor.js, immediately after creating `_bgRect`. Stop/nullify any existing `this._flickerTween` before creating a new one. This ensures each floor rebuild gets a fresh tween targeting the correct _bgRect.
- Tween `_bgRect` tint between 0x1a1a2e and 0x222244 (subtle blue shift), yoyo, repeat -1, duration 3000ms, ease Sine.easeInOut
- Cleanup: tween auto-cleans on scene shutdown; explicit cleanup in `_buildTilemap` handles floor advance

**Definition of Done:**

- [ ] `npm run build` succeeds
- [ ] Dungeon scene has radial gradient vignette (dark edges, transparent center) at depth -1
- [ ] Dungeon background subtly pulses between two tones (ambient flicker)
- [ ] Vignette stays fixed on screen (scrollFactor 0)
- [ ] Flicker tween is cleaned up when leaving dungeon

**Verify:**

- `npm run build` — zero errors
- Grep `DungeonScene.js` for `vignette` or `flicker` to confirm implementation

### Task 7: Hub Warm Tint

**Objective:** Apply a subtle warm amber tint to the hub scene camera to create a cozy town atmosphere.

**Dependencies:** None

**Files:**

- Modify: `src/scenes/HubScene.js` — add camera tint in create()

**Key Decisions / Notes:**

- Phaser 3's Camera doesn't have a direct tint property, but we can overlay a warm-tinted rectangle:
  - `this.add.rectangle(240, 135, 480, 270, 0xff8833, 0.04).setScrollFactor(0).setDepth(45)` — very low alpha warm orange overlay, above world (depth 45) but below HUD title (depth 50)
- Alternative: use `this.cameras.main.setBackgroundColor(0x1a150e)` — but this would show through gaps
- The overlay approach is more flexible and matches the existing pattern

**Definition of Done:**

- [ ] `npm run build` succeeds
- [ ] Hub scene has a subtle warm amber tone compared to dungeon's cooler blue tone
- [ ] Tint doesn't obscure UI elements (positioned below HUD depth)

**Verify:**

- `npm run build` — zero errors
- Grep `HubScene.js` for `0xff8833` or warm tint rectangle

### Task 8: Smooth Mana Bar

**Objective:** Make the mana bar width lerp smoothly to target value each frame instead of snapping instantly.

**Dependencies:** None

**Files:**

- Modify: `src/scenes/UISceneHUD.js` — change `_onManaChanged()` to set target, add lerp in an update method
- Modify: `src/scenes/UIScene.js` — add `update()` method to call mana bar lerp

**Key Decisions / Notes:**

- Currently `_onManaChanged` sets `this._manaFill.width = MANA_BAR_W * ratio` instantly
- Change to: store `this._manaTarget = MANA_BAR_W * ratio` in `_onManaChanged()`
- Add `_updateManaBar()` method: `this._manaFill.width = Phaser.Math.Linear(this._manaFill.width, this._manaTarget, 0.15)` — lerp 15% per frame toward target
- Add update() directly to the UIScene class body (NOT a mixin) so it doesn't conflict with any mixin update() methods. UIScene.update() calls `this._updateManaBar()`.
- Before implementing, grep all four mixin files for `update(` to check for conflicts.
- Initialize `this._manaTarget = MANA_BAR_W` in `_createManaBar()`
- Ability cooldown bar is left as-is (uses tween-based animation already, not instant snap)

**Definition of Done:**

- [ ] `npm run build` succeeds
- [ ] Mana bar slides smoothly when mana changes instead of snapping
- [ ] Mana bar reaches target value within ~0.5s of change
- [ ] No visual artifacts when mana regenerates continuously

**Verify:**

- `npm run build` — zero errors
- Grep `UISceneHUD.js` for `Linear` or `_manaTarget` to confirm lerp

### Task 9: Button Hover Glow

**Objective:** Add hover feedback to interactive buttons in facility scenes — scale up slightly and change stroke color on pointerover.

**Dependencies:** None

**Files:**

- Modify: `src/scenes/BlacksmithScene.js` — add hover effects to UPGRADE button
- Modify: `src/scenes/PotionShopScene.js` — add hover effects to BUY buttons and loadout slots
- Modify: `src/scenes/GuildBoardScene.js` — add hover effects to ENTER DUNGEON button, class cards, checkpoint buttons

**Key Decisions / Notes:**

- Pattern for each interactive rectangle button:
  ```
  btn.on("pointerover", () => { btn.setScale(1.05); btn.setStrokeStyle(2, 0xffffff); });
  btn.on("pointerout", () => { btn.setScale(1.0); btn.setStrokeStyle(1, originalColor); });
  ```
- For BlacksmithScene: UPGRADE buttons at `_buildSection()` line 124
- For GuildBoardScene: ENTER DUNGEON button at line 66, class card backgrounds at line 105, checkpoint buttons at line 150
- For PotionShopScene: BUY buttons and loadout slot buttons (need to read file for exact locations)
- Keep hover subtle — scale 1.05 max, stroke brightens to white

**Definition of Done:**

- [ ] `npm run build` succeeds
- [ ] Hovering over any interactive button in facility scenes shows visual feedback (scale + stroke change)
- [ ] Pointer returns button to original state on pointerout
- [ ] Hover doesn't break existing click/pointerdown behavior

**Verify:**

- `npm run build` — zero errors
- Grep for `pointerover` in all three facility scene files

### Task 10: Panel Slide-In Animation

**Objective:** Make facility scene panels slide in from slightly below instead of appearing instantly, creating a smooth entrance.

**Dependencies:** None

**Files:**

- Modify: `src/scenes/BlacksmithScene.js` — add slide-in tween on create
- Modify: `src/scenes/PotionShopScene.js` — add slide-in tween on create
- Modify: `src/scenes/GuildBoardScene.js` — add slide-in tween on create

**Key Decisions / Notes:**

- After all panel elements are created, collect all scene display objects and tween them from y+20 to their final position over 200ms:
  - Simpler approach: wrap all panel content in a Phaser Container, start it at y+15, tween to y=0 over 200ms with Quad.easeOut
  - Simplest approach: since each scene already uses `cameras.main.fadeIn(200)`, combine with a y-offset tween:
    - At end of create(): `this.cameras.main.setScroll(0, -15)` then tween `this.cameras.main.scrollY` to 0 over 200ms
  - But facility scenes are overlay scenes — camera scroll affects the overlay camera, not the hub
  - Best approach: collect only panel content objects (excluding the full-screen black background overlay) and tween them. Skip the first child (the 0x000000 background rectangle at index 0) to avoid a visible gap at top edge during animation.
    ```
    const panelChildren = this.children.list.slice(1);
    panelChildren.forEach(c => c.y += 20);
    this.tweens.add({ targets: panelChildren, y: "-=20", duration: 200, ease: "Quad.easeOut" });
    ```

**Definition of Done:**

- [ ] `npm run build` succeeds
- [ ] Opening any facility scene panel slides it in from below over ~200ms
- [ ] Slide-in doesn't interfere with existing fadeIn transition
- [ ] Final positions match original layout exactly after animation completes

**Verify:**

- `npm run build` — zero errors
- Grep for `y += 20` or slide-in tween in all three facility scene files

## Testing Strategy

- Unit tests: Existing 193 tests must continue to pass. No new unit tests needed — all features are visual effects with no testable logic.
- Integration tests: N/A — no new data flows or system interactions
- Manual verification: Run `npm run dev` and verify each effect visually in the browser

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| Hit stop feels jarring if too long | Low | Med | Use 50ms pause — barely perceptible but adds weight. If too much, reduce to 33ms. |
| Slow-motion death setTimeout leaks on rapid scene restart | Med | Low | Clear the timeout in scene shutdown handler: `this.events.on("shutdown", () => clearTimeout(this._deathPhase2Timer))` |
| Vignette overlaps HUD elements | Low | Med | Use depth 194 for vignette — below HUD at depth 100+ but above world. Vignette rectangles at screen edges only. |
| Panel slide-in conflicts with fadeIn | Low | Low | Both run concurrently — fadeIn affects alpha, slide-in affects y position. No conflict. |
| Physics world.pause() during hit stop causes enemy desync | Low | Med | Resume physics after 50ms via delayedCall. Guard: check `!this.physics.world.isPaused` before pausing. |
| Boss warning triggers during death sequence | Low | Low | Guard with `if (this._isDying) return` before boss proximity check |

## Open Questions

- None — all requirements are clear and implementation approaches are defined.

### Deferred Ideas

- Chromatic aberration via PostFX pipeline (WebGL2-dependent, overkill for pixel art)
- Health bar smooth lerp (hearts are image-based, not bars — would require redesigning the health display)
- Screen shake intensity curve (ease-in/out instead of constant)
