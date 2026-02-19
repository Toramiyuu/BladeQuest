/**
 * HealthSystem — pure JS, no Phaser dependency.
 *
 * Tracks player HP, invulnerability frames after taking damage, and death.
 *
 * Usage:
 *   const hs = new HealthSystem(5);
 *
 *   hs.update(deltaMs);
 *   hs.takeDamage(1);
 *   hs.heal(1);
 *   hs.isDead()       → boolean
 *   hs.isInvulnerable() → boolean
 *   hs.currentHealth  → number
 *   hs.maxHealth      → number
 *   hs.reset()        → restore full health, clear iframes
 */

import { INVULNERABILITY_MS } from "../config/constants.js";

const MAX_DELTA = 50;

export default class HealthSystem {
  constructor(maxHealth) {
    this._maxHealth = maxHealth;
    this._currentHealth = maxHealth;
    this._invulnerableMs = 0;
  }

  get currentHealth() {
    return this._currentHealth;
  }

  get maxHealth() {
    return this._maxHealth;
  }

  isDead() {
    return this._currentHealth <= 0;
  }

  isInvulnerable() {
    return this._invulnerableMs > 0;
  }

  /**
   * @param {number} deltaMs - Elapsed ms since last frame (clamped to MAX_DELTA)
   */
  update(deltaMs) {
    const dt = Math.min(deltaMs, MAX_DELTA);
    if (this._invulnerableMs > 0) {
      this._invulnerableMs = Math.max(0, this._invulnerableMs - dt);
    }
  }

  /** Apply damage. Ignored while invulnerable. Triggers invulnerability on hit. */
  takeDamage(amount) {
    if (this.isInvulnerable()) return;
    this._currentHealth = Math.max(0, this._currentHealth - amount);
    this._invulnerableMs = INVULNERABILITY_MS;
  }

  /** Restore health, capped at max. */
  heal(amount) {
    this._currentHealth = Math.min(
      this._maxHealth,
      this._currentHealth + amount,
    );
  }

  /** Full reset — used on player death/respawn. */
  reset() {
    this._currentHealth = this._maxHealth;
    this._invulnerableMs = 0;
  }
}
