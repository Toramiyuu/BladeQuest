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
      idle: "shinobi-idle",
      run: "shinobi-run",
      jump: "shinobi-jump-up",
      fall: "shinobi-fall",
      attack1: "shinobi-attack1",
      attack2: "shinobi-attack2",
      dead: "shinobi-dead",
      hurt: "shinobi-hurt",
    },
    ability: { id: "kunai", manaCost: 25, cooldownMs: 500 },
    stats: { maxHealth: 4, maxMana: 100, manaRegenRate: 8 },
  },
  {
    id: "knight",
    name: "Holy Knight",
    description: "A righteous warrior wielding holy power",
    spriteKeys: {
      idle: "knight-idle",
      run: "knight-run",
      jump: "knight-jump-up",
      fall: "knight-fall",
      attack1: "knight-attack1",
      attack2: "knight-attack2",
      dead: "knight-dead",
      hurt: "knight-hurt",
    },
    ability: { id: "holy-slash", manaCost: 35, cooldownMs: 1000 },
    stats: { maxHealth: 6, maxMana: 100, manaRegenRate: 5 },
  },
  {
    id: "rogue",
    name: "Rogue",
    description: "A shadow dancer who blinks through enemies",
    spriteKeys: {
      idle: "rogue-idle",
      run: "rogue-run",
      jump: "rogue-jump-up",
      fall: "rogue-fall",
      attack1: "rogue-attack1",
      attack2: "rogue-attack2",
      dead: "rogue-dead",
      hurt: "rogue-hurt",
    },
    ability: { id: "blink", manaCost: 25, cooldownMs: 600 },
    stats: { maxHealth: 3, maxMana: 80, manaRegenRate: 8 },
  },
  {
    id: "mage",
    name: "Mage",
    description: "An arcane spellcaster who commands elemental forces",
    spriteKeys: {
      idle: "mage-idle",
      run: "mage-run",
      jump: "mage-jump-up",
      fall: "mage-fall",
      attack1: "mage-attack1",
      attack2: "mage-attack2",
      dead: "mage-dead",
      hurt: "mage-hurt",
    },
    ability: { id: "burst", manaCost: 45, cooldownMs: 1200 },
    stats: { maxHealth: 4, maxMana: 120, manaRegenRate: 20 },
  },
  {
    id: "berserker",
    name: "Berserker",
    description: "A rage-fueled warrior who thrives in the heat of battle",
    spriteKeys: {
      idle: "berserker-idle",
      run: "berserker-run",
      jump: "berserker-jump-up",
      fall: "berserker-fall",
      attack1: "berserker-attack1",
      attack2: "berserker-attack2",
      dead: "berserker-dead",
      hurt: "berserker-hurt",
    },
    ability: { id: "rage", manaCost: 20, cooldownMs: 3000 },
    stats: { maxHealth: 5, maxMana: 60, manaRegenRate: 15 },
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
