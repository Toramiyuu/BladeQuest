/**
 * ArcherAI — pure JS, no Phaser dependency.
 *
 * State machine: idle → aim → fire → cooldown → idle …
 *
 * The archer stands still and fires arrows on a timer whenever the player
 * is within horizontal range. Direction is recalculated each cycle.
 *
 * Usage:
 *   const ai = new ArcherAI();
 *   const { shouldFire, facingDir, state } = ai.update({ dt, playerOffsetX });
 */

const FIRE_RANGE = 300;
const AIM_MS = 600;
const FIRE_MS = 100;
const COOLDOWN_MS = 2000;

export default class ArcherAI {
  constructor() {
    this._dir = -1;
    this._state = "idle";
    this._timer = 0;
  }

  get direction() {
    return this._dir;
  }
  get state() {
    return this._state;
  }

  /**
   * @param {object} p
   * @param {number}  p.dt            - delta ms (already capped)
   * @param {number}  p.playerOffsetX - (playerX - myX), signed
   * @returns {{ shouldFire: boolean, facingDir: number, state: string }}
   */
  update({ dt = 16, playerOffsetX = 999 }) {
    this._timer -= dt;

    switch (this._state) {
      case "idle": {
        const playerClose = Math.abs(playerOffsetX) < FIRE_RANGE;
        if (playerClose) {
          this._dir = Math.sign(playerOffsetX) || this._dir;
          this._state = "aim";
          this._timer = AIM_MS;
        }
        return { shouldFire: false, facingDir: this._dir, state: this._state };
      }

      case "aim": {
        if (Math.abs(playerOffsetX) < FIRE_RANGE) {
          this._dir = Math.sign(playerOffsetX) || this._dir;
        }
        if (this._timer <= 0) {
          this._state = "fire";
          this._timer = FIRE_MS;
        }
        return { shouldFire: false, facingDir: this._dir, state: this._state };
      }

      case "fire": {
        if (this._timer <= 0) {
          this._state = "cooldown";
          this._timer = COOLDOWN_MS;
          return {
            shouldFire: false,
            facingDir: this._dir,
            state: this._state,
          };
        }
        return { shouldFire: true, facingDir: this._dir, state: this._state };
      }

      case "cooldown": {
        if (this._timer <= 0) {
          this._state = "idle";
          this._timer = 0;
        }
        return { shouldFire: false, facingDir: this._dir, state: this._state };
      }

      default:
        return { shouldFire: false, facingDir: this._dir, state: this._state };
    }
  }
}
