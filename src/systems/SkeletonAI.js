/**
 * SkeletonAI — pure JS, no Phaser dependency.
 *
 * State machine: walk → pause → lunge → recover → walk …
 *
 * The caller passes sensor readings each frame and receives a velocity command.
 *
 * Usage:
 *   const ai = new SkeletonAI();
 *   const { vx, state } = ai.update({ dt, blockedLeft, blockedRight,
 *                                      atLeftBound, atRightBound, hasGroundAhead,
 *                                      playerOffsetX });
 */

const WALK_SPEED = 55;
const LUNGE_SPEED = 220;
const WALK_MS = 1800;
const PAUSE_MS = 600;
const LUNGE_MS = 300;
const RECOVER_MS = 400;
const AGGRO_RANGE = 100;

export default class SkeletonAI {
  constructor() {
    this._dir = -1;
    this._state = "walk";
    this._timer = WALK_MS;
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
   * @param {boolean} p.blockedLeft
   * @param {boolean} p.blockedRight
   * @param {boolean} p.atLeftBound
   * @param {boolean} p.atRightBound
   * @param {boolean} p.hasGroundAhead
   * @param {number}  p.playerOffsetX  - (playerX - myX), signed
   * @returns {{ vx: number, state: string }}
   */
  update({
    dt = 16,
    blockedLeft = false,
    blockedRight = false,
    atLeftBound = false,
    atRightBound = false,
    hasGroundAhead = true,
    playerOffsetX = 999,
  }) {
    this._timer -= dt;

    switch (this._state) {
      case "walk": {
        const hitWall =
          (this._dir === -1 && (blockedLeft || atLeftBound)) ||
          (this._dir === 1 && (blockedRight || atRightBound)) ||
          !hasGroundAhead;
        if (hitWall) this._dir = -this._dir;

        const playerClose =
          Math.abs(playerOffsetX) < AGGRO_RANGE &&
          Math.sign(playerOffsetX) === this._dir;
        if (this._timer <= 0 || playerClose) {
          this._state = "pause";
          this._timer = PAUSE_MS;
          if (Math.abs(playerOffsetX) < AGGRO_RANGE) {
            this._dir = Math.sign(playerOffsetX) || this._dir;
          }
        }
        return { vx: this._dir * WALK_SPEED, state: this._state };
      }

      case "pause":
        if (this._timer <= 0) {
          this._state = "lunge";
          this._timer = LUNGE_MS;
        }
        return { vx: 0, state: this._state };

      case "lunge": {
        if (this._timer <= 0) {
          this._state = "recover";
          this._timer = RECOVER_MS;
        }
        return { vx: this._dir * LUNGE_SPEED, state: this._state };
      }

      case "recover":
        if (this._timer <= 0) {
          this._state = "walk";
          this._timer = WALK_MS;
        }
        return { vx: 0, state: this._state };

      default:
        return { vx: 0, state: this._state };
    }
  }
}
