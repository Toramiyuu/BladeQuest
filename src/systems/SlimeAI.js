/**
 * SlimeAI — pure JS, no Phaser dependency.
 *
 * Implements simple patrol AI: move in one direction until a wall,
 * ledge, or world boundary is detected, then reverse.
 *
 * Usage:
 *   const ai = new SlimeAI();
 *   const { direction, speed } = ai.update({
 *     blockedLeft,
 *     blockedRight,
 *     hasGroundAhead,
 *     atLeftBound,
 *     atRightBound,
 *     deltaMs,
 *   });
 *
 */

import { SLIME_SPEED } from "../config/constants.js";

export default class SlimeAI {
  constructor() {
    this._direction = -1;
  }

  get direction() {
    return this._direction;
  }

  /**
   * @param {Object} params
   * @returns {{ direction: number, speed: number }}
   */
  update({
    blockedLeft = false,
    blockedRight = false,
    hasGroundAhead = true,
    atLeftBound = false,
    atRightBound = false,
  }) {
    const movingLeft = this._direction === -1;
    const movingRight = this._direction === 1;

    const shouldReverse =
      (movingLeft && (blockedLeft || atLeftBound)) ||
      (movingRight && (blockedRight || atRightBound)) ||
      !hasGroundAhead;

    if (shouldReverse) {
      this._direction = -this._direction;
    }

    return { direction: this._direction, speed: SLIME_SPEED };
  }
}
