/**
 * GUILD_PERKS — rank-indexed perk definitions.
 *
 * Consumed by GuildQuestSystem (slot count, discount, free potion)
 * and GuildRankInfo (display labels).
 */

export const GUILD_PERKS = {
  F: {
    slots: 3,
    discount: 0,
    freePotion: null,
    perks: ["Quest Board Access"],
  },
  E: {
    slots: 3,
    discount: 0.05,
    freePotion: null,
    perks: ["Material Trading Board", "5% Shop Discount"],
  },
  D: {
    slots: 4,
    discount: 0.1,
    freePotion: "health",
    perks: ["4 Quest Slots", "Free Health Potion per Run", "10% Shop Discount"],
  },
  C: {
    slots: 4,
    discount: 0.15,
    freePotion: "health",
    perks: ["Rift Shard Access", "4 Quest Slots", "15% Shop Discount"],
  },
  B: {
    slots: 5,
    discount: 0.2,
    freePotion: "health",
    perks: [
      "5 Quest Slots",
      "Elite Quests",
      "Guild Storage",
      "20% Shop Discount",
    ],
  },
  A: {
    slots: 5,
    discount: 0.25,
    freePotion: "health",
    perks: [
      "5 Quest Slots",
      "Legendary Quests",
      "Party Dispatch",
      "Guild Champion Title",
      "25% Shop Discount",
    ],
  },
};
