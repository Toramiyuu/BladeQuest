/**
 * ClassRegistry — character class data definitions.
 *
 * Pure JS, no Phaser dependency. Each class is a plain config object
 * with stats, ability info, sprite keys, and display metadata.
 */

const CLASSES = [
  {
    id: "shinobi",
    name: "Shinobi",
    description: "A swift shadow warrior who strikes from afar",
    spriteKeys: {
      idle: "player-idle",
      run: "player-run",
      jump: "player-jump",
      fall: "player-fall",
      attack1: "player-slash1",
      attack2: "player-slash2",
      heavy: "player-heavy",
      airAttack: "player-air-attack",
    },
    ability: { id: "kunai", manaCost: 25, cooldownMs: 500 },
    stats: { maxHealth: 4, maxMana: 100, manaRegenRate: 8 },
  },
  {
    id: "knight",
    name: "Holy Knight",
    description: "A righteous warrior wielding holy power",
    spriteKeys: {
      idle: "player-idle",
      run: "player-run",
      jump: "player-jump",
      fall: "player-fall",
      attack1: "player-slash1",
      attack2: "player-slash2",
      heavy: "player-heavy",
      airAttack: "player-air-attack",
    },
    ability: { id: "holy-slash", manaCost: 35, cooldownMs: 1000 },
    stats: { maxHealth: 6, maxMana: 100, manaRegenRate: 5 },
  },
];

const classMap = new Map(CLASSES.map((c) => [c.id, c]));

const ClassRegistry = {
  getClass(id) {
    return classMap.get(id);
  },

  getAllClasses() {
    return [...CLASSES];
  },

  getDefault() {
    return CLASSES[0];
  },
};

export default ClassRegistry;
