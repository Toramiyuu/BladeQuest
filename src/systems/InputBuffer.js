import { MAX_DELTA_MS } from "../config/constants.js";

/**
 * CoyoteTimer — pure JS, no Phaser dependency.
 *
 * Tracks whether the player can jump based on recent ground contact.
 * "Coyote time" lets the player jump for a short window after walking off a ledge.
 *
 * Usage:
 *   const ct = new CoyoteTimer(COYOTE_TIME_MS);
 *   ct.update({ isGrounded, jumpPressed, deltaMs });
 *   if (ct.canJump && jumpJustPressed) { ct.consumeJump(); doJump(); }
 */
export class CoyoteTimer {
  constructor(coyoteTimeMs) {
    this._coyoteTimeMs = coyoteTimeMs;
    this._remainingMs = 0;
    this._wasGrounded = false;
    this.canJump = false;
  }

  update({ isGrounded, deltaMs }) {
    const dt = Math.min(deltaMs, MAX_DELTA_MS);

    if (isGrounded) {
      this._remainingMs = this._coyoteTimeMs;
      this._wasGrounded = true;
      this.canJump = true;
    } else {
      if (this._wasGrounded) {
        this._remainingMs -= dt;
        if (this._remainingMs <= 0) {
          this._remainingMs = 0;
          this.canJump = false;
        }
      } else {
        this.canJump = false;
      }
    }
  }

  /** Call when a jump is performed to prevent double-jumping via coyote time. */
  consumeJump() {
    this._remainingMs = 0;
    this.canJump = false;
    this._wasGrounded = false;
  }
}
