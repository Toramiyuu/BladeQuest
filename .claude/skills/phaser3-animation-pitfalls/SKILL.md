---
name: phaser3-animation-pitfalls
description: |
  Phaser 3 animation and timing gotchas discovered during BladeQuest development.
  Use when: (1) tweening a rectangle/graphics fill color doesn't work, (2) implementing
  slow-motion effects where delayedCall fires too late, (3) adding update() to a scene
  that uses Object.assign mixin pattern. Covers: tweens.addCounter for color interpolation,
  setTimeout vs delayedCall with timeScale, mixin update() collision.
author: Claude Code
version: 1.0.0
---

# Phaser 3 Animation Pitfalls

## Pitfall 1: Tweening Rectangle Fill Color

### Problem

`this.tweens.add({ targets: rect, fillColor: 0x222244, ... })` silently fails — Phaser's
tween system cannot directly interpolate the `fillStyle` of a `Phaser.GameObjects.Rectangle`.

### Solution

Use `tweens.addCounter` with manual RGB interpolation in `onUpdate`:

```javascript
const CA = { r: 0x1a, g: 0x1a, b: 0x2e }; // start color
const CB = { r: 0x22, g: 0x22, b: 0x44 }; // end color

this._flickerTween = this.tweens.addCounter({
  from: 0,
  to: 1,
  duration: 3000,
  yoyo: true,
  repeat: -1,
  ease: "Sine.easeInOut",
  onUpdate: (tween) => {
    if (!this._bgRect || !this._bgRect.active) return;
    const t = tween.getValue();
    const r = Math.round(CA.r + (CB.r - CA.r) * t);
    const g = Math.round(CA.g + (CB.g - CA.g) * t);
    const b = Math.round(CA.b + (CB.b - CA.b) * t);
    this._bgRect.setFillStyle((r << 16) | (g << 8) | b);
  },
});
```

**No Phaser import needed** — manual bit-shift avoids `Phaser.Display.Color` dependency.

Guard `!this._bgRect.active` to prevent errors when the rect is destroyed on floor advance.

---

## Pitfall 2: `time.delayedCall` Is Scaled by `time.timeScale`

### Problem

When implementing slow-motion (`this.time.timeScale = 0.2`), a `delayedCall(400, ...)` fires
after 2000ms of real time (400ms ÷ 0.2 = 2000ms). The intent was a 400ms real-time delay.

### Solution

Use `setTimeout` for real-time delays that must be independent of timeScale:

```javascript
// Phase 1: enter slow-mo
this._isDying = true;
this._dyingMs = Infinity;          // prevent countdown while slow-mo active
this.time.timeScale = 0.2;
this.physics.world.timeScale = 5;  // physics timeScale is INVERSE: 5 = 0.2x speed

// Phase 2: restore after real 400ms
this._deathPhase2Timer = setTimeout(() => {
  this._deathPhase2Timer = null;
  this.time.timeScale = 1;
  this.physics.world.timeScale = 1;
  this._dyingMs = 1500;            // start countdown now
  // ... create overlay, text, etc.
}, 400);

// Cleanup on shutdown
this.events.once("shutdown", () => {
  if (this._deathPhase2Timer) {
    clearTimeout(this._deathPhase2Timer);
    this._deathPhase2Timer = null;
  }
  this.time.timeScale = 1;
  this.physics.world.timeScale = 1;
});
```

**Key**: `physics.world.timeScale` is inverse — set to `5` to get 0.2x physics speed.
**Key**: Set `_dyingMs = Infinity` in Phase 1 so per-frame `_dyingMs -= dt` doesn't race.

---

## Pitfall 3: `Object.assign` Mixin Silently Drops Duplicate Method Names

### Problem

When using the mixin pattern `Object.assign(Scene.prototype, MixinA, MixinB, ...)`,
if two mixins define `update()`, the last one in the argument list silently overwrites
the earlier ones. No error is thrown.

### Solution

Add `update()` directly to the Scene class body — not a mixin:

```javascript
export default class UIScene extends Phaser.Scene {
  update() {
    this._updateManaBar(); // from UISceneHUDMixin
    // other mixin updates called explicitly here
  }
}

Object.assign(UIScene.prototype, UISceneHUDMixin, UISceneMinimapMixin, ...);
```

**Before adding `update()` to any mixin**, grep all mixin files first:
```bash
grep -n "update(" src/scenes/UIScene*.js
```

---

## References

- [Phaser 3 Tweens docs](https://newdocs.phaser.io/docs/3.87.0/Phaser.Tweens.TweenManager)
- `tweens.addCounter` — undocumented but supported in Phaser 3.50+
