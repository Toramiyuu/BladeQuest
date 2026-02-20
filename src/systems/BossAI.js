/**
 * BossAI — pure JS, no Phaser dependency.
 *
 * Two-phase AI for dungeon bosses:
 *   Phase 1 (>50% HP): patrol left-right, charge at player when close
 *   Phase 2 (≤50% HP): faster movement, occasional jump attack
 *
 * Usage:
 *   const ai = new BossAI({ leftBound, rightBound, maxHealth, ... });
 *   const { vx, vy } = ai.update(bossX, playerX, playerY, currentHP, deltaMs);
 */

const PHASE2_SPEED_MULT = 1.5;
const JUMP_COOLDOWN_MS = 2000;
const JUMP_CHANCE = 0.02;

export default class BossAI {
  constructor({
    leftBound,
    rightBound,
    maxHealth,
    patrolSpeed,
    chargeSpeed,
    chargeRange,
    jumpForce,
  }) {
    this._leftBound = leftBound;
    this._rightBound = rightBound;
    this._maxHealth = maxHealth;
    this._patrolSpeed = patrolSpeed;
    this._chargeSpeed = chargeSpeed;
    this._chargeRange = chargeRange;
    this._jumpForce = jumpForce;
    this._direction = 1;
    this._phase = 1;
    this._jumpCooldown = 0;
  }

  get phase() {
    return this._phase;
  }

  /**
   * @param {number} bossX
   * @param {number} playerX
   * @param {number} playerY
   * @param {number} currentHP
   * @param {number} deltaMs
   * @returns {{ vx: number, vy: number }}
   */
  update(bossX, playerX, playerY, currentHP, deltaMs) {
    this._phase = currentHP <= this._maxHealth / 2 ? 2 : 1;

    if (bossX >= this._rightBound) this._direction = -1;
    if (bossX <= this._leftBound) this._direction = 1;

    const distToPlayer = Math.abs(bossX - playerX);
    const playerDir = playerX > bossX ? 1 : -1;

    let vx;
    if (distToPlayer < this._chargeRange) {
      const speed =
        this._phase === 2
          ? this._chargeSpeed * PHASE2_SPEED_MULT
          : this._chargeSpeed;
      vx = playerDir * speed;
    } else {
      const speed =
        this._phase === 2
          ? this._patrolSpeed * PHASE2_SPEED_MULT
          : this._patrolSpeed;
      vx = this._direction * speed;
    }

    let vy = 0;
    if (this._phase === 2) {
      this._jumpCooldown -= deltaMs;
      if (this._jumpCooldown <= 0 && Math.random() < JUMP_CHANCE) {
        vy = this._jumpForce;
        this._jumpCooldown = JUMP_COOLDOWN_MS;
      }
    }

    return { vx, vy };
  }
}
