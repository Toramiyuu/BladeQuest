/**
 * combatSchools.js — Combat School definitions for Phase 1A (Crimson Fang).
 *
 * Iron Tide and Phantom Gale are stubbed here for future phases.
 * SchoolSystem.js consumes these definitions at runtime.
 */

/** ms without hitting ANY enemy before next hit qualifies as First Blood. */
export const FIRST_BLOOD_TIMER_MS = 3000;

/** Style XP awarded per event. */
export const STYLE_XP = {
  firstBlood: 10,
  bossKill: 50,
};

/**
 * Crimson Fang — offense-first school.
 * Core mechanic: First Blood. The first hit on a fresh target (or after
 * FIRST_BLOOD_TIMER_MS of no hits) deals bonus damage.
 */
export const CRIMSON_FANG = {
  id: "crimsonFang",
  name: "Crimson Fang",
  motto: "The first blade drawn is the last blade needed.",
  color: 0xff4422,
  ranks: [
    {
      name: "Initiate",
      xpRequired: 0,
      firstBloodMult: 1.25,
      critBonus: 0.05,
    },
    {
      name: "Adept",
      xpRequired: 500,
      firstBloodMult: 1.4,
      critBonus: 0.1,
    },
    {
      name: "Expert",
      xpRequired: 1500,
      firstBloodMult: 1.6,
      critBonus: 0.15,
    },
    {
      name: "Master",
      xpRequired: 4000,
      firstBloodMult: 1.8,
      critBonus: 0.2,
    },
  ],
};

/** Stub entries for future phases — no mechanics active yet. */
export const IRON_TIDE = {
  id: "ironTide",
  name: "Iron Tide",
  color: 0x4488cc,
  ranks: [
    { name: "Initiate", xpRequired: 0 },
    { name: "Adept", xpRequired: 500 },
    { name: "Expert", xpRequired: 1500 },
    { name: "Master", xpRequired: 4000 },
  ],
};

export const PHANTOM_GALE = {
  id: "phantomGale",
  name: "Phantom Gale",
  color: 0x88ddaa,
  ranks: [
    { name: "Initiate", xpRequired: 0 },
    { name: "Adept", xpRequired: 500 },
    { name: "Expert", xpRequired: 1500 },
    { name: "Master", xpRequired: 4000 },
  ],
};

export const ALL_SCHOOLS = {
  crimsonFang: CRIMSON_FANG,
  ironTide: IRON_TIDE,
  phantomGale: PHANTOM_GALE,
};

/**
 * Each class's natural school alignment.
 * Shinobi / Berserker → Crimson Fang
 * Holy Knight         → Iron Tide
 * Rogue / Mage        → Phantom Gale
 */
export const CLASS_PRIMARY_SCHOOL = {
  shinobi: "crimsonFang",
  knight: "ironTide",
  rogue: "phantomGale",
  mage: "phantomGale",
  berserker: "crimsonFang",
};
