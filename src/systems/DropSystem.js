/**
 * DropSystem — pure JS, no Phaser dependency.
 *
 * Provides getDropsForEnemy(type, floor) which returns a drops object
 * with gold and material quantities. Called by DungeonCombatMixin and
 * DungeonBossMixin when enemies die.
 */

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Returns a drops object for the given enemy type and floor depth.
 * @param {string} type - "skeleton" | "bat" | "boss"
 * @param {number} floor - current dungeon floor number
 * @returns {{ gold: number, bones?: number, crystals?: number, essence?: number }}
 */
export function getDropsForEnemy(type, floor) {
  switch (type) {
    case "skeleton":
      return {
        gold: randInt(1, 3),
        bones: Math.random() < 0.7 ? 1 : 0,
      };

    case "bat":
      return {
        gold: randInt(1, 2),
        crystals: Math.random() < 0.5 ? 1 : 0,
      };

    case "boss":
      return {
        gold: 20 + floor * 2,
        essence: 1,
        bones: 3,
        crystals: 2,
      };

    default:
      return { gold: 0 };
  }
}
