/**
 * DefenseCalc — pure JS, no Phaser dependency.
 *
 * Calculates actual incoming damage after armor reduction.
 *
 * Formula:
 *   reduction = armorTier * 0.2   (Tier 0: 0%, Tier 1: 20%)
 *   result    = Math.max(1, Math.ceil(rawDamage * (1 - reduction)))
 *
 * Minimum damage is always 1 — armor never makes the player fully immune.
 */

/**
 * @param {number} rawDamage  - damage before armor
 * @param {number} [armorTier=0] - 0 (Leather), 1 (Chain Mail)
 * @returns {number} integer damage value ≥ 1
 */
export function calculateIncoming(rawDamage, armorTier = 0) {
  const reduction = armorTier * 0.2;
  return Math.max(1, Math.ceil(rawDamage * (1 - reduction)));
}
