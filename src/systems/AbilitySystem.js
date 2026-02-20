/**
 * AbilitySystem — pure JS, no Phaser dependency.
 *
 * Manages cooldown timer and mana check for a single ability.
 * The actual ability effect is delegated to an `execute` callback.
 *
 * Usage:
 *   const ability = new AbilitySystem({ manaCost: 25, cooldownMs: 500, execute: () => {...} });
 *   ability.update(dt);
 *   ability.tryUse(manaSystem);
 */

export default class AbilitySystem {
  /**
   * @param {Object} config
   * @param {number} config.manaCost
   * @param {number} config.cooldownMs
   * @param {Function} config.execute - Called when ability fires
   */
  constructor({ manaCost, cooldownMs, execute }) {
    this._manaCost = manaCost;
    this._cooldownMs = cooldownMs;
    this._execute = execute;
    this._cooldownRemaining = 0;
  }

  get isOnCooldown() {
    return this._cooldownRemaining > 0;
  }

  /**
   * @param {number} deltaMs
   */
  update(deltaMs) {
    if (this._cooldownRemaining > 0) {
      this._cooldownRemaining = Math.max(0, this._cooldownRemaining - deltaMs);
    }
  }

  /**
   * Attempt to use the ability. Returns true if successful.
   * @param {ManaSystem} mana
   * @returns {boolean}
   */
  tryUse(mana) {
    if (this.isOnCooldown) return false;
    if (!mana.spend(this._manaCost)) return false;
    this._cooldownRemaining = this._cooldownMs;
    this._execute();
    return true;
  }

  reset() {
    this._cooldownRemaining = 0;
  }
}
