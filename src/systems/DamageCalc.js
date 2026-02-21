/**
 * DamageCalc — pure JS, no Phaser dependency.
 *
 * Calculates outgoing damage from weapon tier, class, attack type,
 * and Combat School bonuses (Phase 1A: First Blood multiplier).
 *
 * Formula:
 *   base = 1
 *   tierMult       = 1 + weaponTier * 0.3
 *   heavyMult      = isHeavy ? 1.5 : 1.0
 *   classMult      = knight ? 1.2 : 1.0
 *   firstBloodMult = from SchoolSystem (1.25–1.80 at Crimson Fang ranks)
 *   result         = Math.ceil(base * tierMult * heavyMult * classMult * firstBloodMult)
 */

import SchoolSystem from "./SchoolSystem.js";

const TIER_MULT = [1.0, 1.3, 1.6, 2.0];

/**
 * @param {object} opts
 * @param {number}  [opts.weaponTier=0]    - 0 (Iron) … 3 (Void Edge)
 * @param {string}  [opts.classId='shinobi']
 * @param {boolean} [opts.isHeavy=false]   - true for heavy/final combo hit
 * @param {boolean} [opts.isFirstBlood=false] - true when SchoolSystem confirms First Blood
 * @returns {number} integer damage value ≥ 1
 */
export function calculateDamage({
  weaponTier = 0,
  classId = "shinobi",
  isHeavy = false,
  isFirstBlood = false,
} = {}) {
  const tierMult = TIER_MULT[weaponTier] ?? 1.0;
  const heavyMult = isHeavy ? 1.5 : 1.0;
  const classMult = classId === "knight" ? 1.2 : 1.0;
  const firstBloodMult = isFirstBlood ? SchoolSystem.getFirstBloodMult() : 1.0;
  return Math.ceil(tierMult * heavyMult * classMult * firstBloodMult);
}
