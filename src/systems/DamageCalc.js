/**
 * DamageCalc — pure JS, no Phaser dependency.
 *
 * Calculates outgoing damage from weapon tier, class, and attack type.
 *
 * Formula:
 *   base = 1
 *   tierMult  = 1 + weaponTier * 0.3   (Tier 0: 1.0×, Tier 1: 1.3×, Tier 2: 1.6×)
 *   heavyMult = isHeavy ? 1.5 : 1.0
 *   classMult = knight ? 1.2 : 1.0
 *   result    = Math.ceil(base * tierMult * heavyMult * classMult)
 */

const TIER_MULT = [1.0, 1.3, 1.6, 2.0];

/**
 * @param {object} opts
 * @param {number} [opts.weaponTier=0]  - 0 (Iron), 1 (Tempered), 2 (Flame), 3 (Void Edge)
 * @param {string} [opts.classId='shinobi'] - 'shinobi' | 'knight'
 * @param {boolean} [opts.isHeavy=false]  - true for the heavy/final combo hit
 * @returns {number} integer damage value ≥ 1
 */
export function calculateDamage({
  weaponTier = 0,
  classId = "shinobi",
  isHeavy = false,
} = {}) {
  const tierMult = TIER_MULT[weaponTier] ?? 1.0;
  const heavyMult = isHeavy ? 1.5 : 1.0;
  const classMult = classId === "knight" ? 1.2 : 1.0;
  return Math.ceil(tierMult * heavyMult * classMult);
}
