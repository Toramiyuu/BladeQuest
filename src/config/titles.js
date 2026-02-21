/**
 * TITLES — 14 earnable titles with passive bonuses.
 *
 * trigger types:
 *   "quests"  — total quests completed (GuildQuestSystem)
 *   "kills"   — total persistent kill count (SaveManager)
 *   "floor"   — highest floor reached (SaveManager)
 *   "school"  — rank index reached in a specific school (SchoolSystem)
 *
 * bonus types:
 *   "dmg"      — damage multiplier bonus (+value fraction)
 *   "hp"       — max HP multiplier bonus (+value fraction)
 *   "gold"     — gold-from-kills multiplier bonus (+value fraction)
 *   "potion"   — extra health potions granted at run start (value = count)
 *   "bones"    — bones granted at run start (value = count)
 *   "crystals" — crystals granted at run start (value = count)
 */

export const TITLES = [
  {
    id: "errand-runner",
    name: "Errand Runner",
    desc: "+5% gold from kills",
    trigger: "quests",
    required: 5,
    bonus: { type: "gold", value: 0.05 },
  },
  {
    id: "contractor",
    name: "Contractor",
    desc: "Start with +1 health potion",
    trigger: "quests",
    required: 10,
    bonus: { type: "potion", value: 1 },
  },
  {
    id: "veteran",
    name: "Veteran",
    desc: "+10% max HP",
    trigger: "quests",
    required: 20,
    bonus: { type: "hp", value: 0.1 },
  },
  {
    id: "guild-legend",
    name: "Guild Legend",
    desc: "+15% gold from kills",
    trigger: "quests",
    required: 30,
    bonus: { type: "gold", value: 0.15 },
  },

  {
    id: "monster-hunter",
    name: "Monster Hunter",
    desc: "+5% damage",
    trigger: "kills",
    required: 50,
    bonus: { type: "dmg", value: 0.05 },
  },
  {
    id: "slaughterer",
    name: "Slaughterer",
    desc: "+10% damage",
    trigger: "kills",
    required: 200,
    bonus: { type: "dmg", value: 0.1 },
  },
  {
    id: "butcher",
    name: "Butcher",
    desc: "+15% damage",
    trigger: "kills",
    required: 500,
    bonus: { type: "dmg", value: 0.15 },
  },

  {
    id: "delver",
    name: "Delver",
    desc: "+5% max HP",
    trigger: "floor",
    required: 5,
    bonus: { type: "hp", value: 0.05 },
  },
  {
    id: "spelunker",
    name: "Spelunker",
    desc: "Start with 1 Bone",
    trigger: "floor",
    required: 10,
    bonus: { type: "bones", value: 1 },
  },
  {
    id: "abyss-walker",
    name: "Abyss Walker",
    desc: "+10% max HP",
    trigger: "floor",
    required: 20,
    bonus: { type: "hp", value: 0.1 },
  },
  {
    id: "void-touched",
    name: "Void Touched",
    desc: "Start with 1 Crystal",
    trigger: "floor",
    required: 30,
    bonus: { type: "crystals", value: 1 },
  },

  {
    id: "blood-fang",
    name: "Blood Fang",
    desc: "+10% damage (Crimson Fang Expert)",
    trigger: "school",
    school: "crimsonFang",
    required: 2,
    bonus: { type: "dmg", value: 0.1 },
  },
  {
    id: "iron-bastion",
    name: "Iron Bastion",
    desc: "+15% max HP (Iron Tide Expert)",
    trigger: "school",
    school: "ironTide",
    required: 2,
    bonus: { type: "hp", value: 0.15 },
  },
  {
    id: "phantom-strike",
    name: "Phantom Strike",
    desc: "+5% damage (Phantom Gale Expert)",
    trigger: "school",
    school: "phantomGale",
    required: 2,
    bonus: { type: "dmg", value: 0.05 },
  },
];
