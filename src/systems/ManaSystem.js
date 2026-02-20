/**
 * ManaSystem — pure JS, no Phaser dependency.
 *
 * Tracks current mana, max mana, and passive regeneration.
 *
 * Usage:
 *   const ms = new ManaSystem(100, 5);
 *
 *   ms.update(deltaMs);
 *   ms.spend(25)      → boolean (true if spent, false if insufficient)
 *   ms.restore(amount)
 *   ms.reset()
 *   ms.currentMana   → number
 *   ms.maxMana       → number
 */

const MAX_DELTA = 50;

export default class ManaSystem {
  /**
   * @param {number} maxMana - Maximum mana capacity
   * @param {number} regenRate - Mana regenerated per second
   */
  constructor(maxMana, regenRate) {
    this._maxMana = maxMana;
    this._currentMana = maxMana;
    this._regenRate = regenRate;
  }

  get currentMana() {
    return this._currentMana;
  }

  get maxMana() {
    return this._maxMana;
  }

  /**
   * @param {number} deltaMs - Elapsed ms since last frame (clamped to MAX_DELTA)
   */
  update(deltaMs) {
    const dt = Math.min(deltaMs, MAX_DELTA);
    if (this._currentMana < this._maxMana) {
      this._currentMana = Math.min(
        this._maxMana,
        this._currentMana + this._regenRate * (dt / 1000),
      );
    }
  }

  /**
   * Attempt to spend mana. Returns false if insufficient.
   * @param {number} cost
   * @returns {boolean}
   */
  spend(cost) {
    if (this._currentMana < cost) return false;
    this._currentMana -= cost;
    return true;
  }

  /**
   * Restore mana, capped at maxMana.
   * @param {number} amount
   */
  restore(amount) {
    this._currentMana = Math.min(this._maxMana, this._currentMana + amount);
  }

  /** Full reset — restore to max mana. */
  reset() {
    this._currentMana = this._maxMana;
  }
}
