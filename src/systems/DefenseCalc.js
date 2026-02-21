/**
 * DefenseCalc — pure JS, no Phaser dependency.
 *
 * Calculates actual incoming damage after armor reduction.
 *
 * Tier 0 (Leather): 0%, Tier 1 (Chain Mail): 20%,
 * Tier 2 (Knight Plate): 35%, Tier 3 (Sacred Armor): 50%
 *
 * Minimum damage is always 1 — armor never makes the player fully immune.
 */

const REDUCTION = [0, 0.2, 0.35, 0.5];

/**
 * @param {number} rawDamage  - damage before armor
 * @param {number} [armorTier=0] - 0..3
 * @returns {number} integer damage value ≥ 1
 */
export function calculateIncoming(rawDamage, armorTier = 0) {
  const reduction = REDUCTION[armorTier] ?? 0;
  return Math.max(1, Math.ceil(rawDamage * (1 - reduction)));
}
