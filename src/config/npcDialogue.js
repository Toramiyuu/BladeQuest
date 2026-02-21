/**
 * NPC dialogue lines indexed by NPC role.
 * Each role has an array of short lines that cycle on repeated interaction.
 */
export const NPC_DIALOGUE = {
  dungeon: [
    "The ruins below grow darker\nwith every floor descended.",
    "Many seekers enter Ashveil\nDungeon. Few see floor 10.",
    "The Shadow Sovereign stirs\nat floor 40. Tread carefully.",
    "Collect bones and crystals—\nthe blacksmith pays well.",
  ],
  blacksmith: [
    "Bring me bones and I'll forge\nyou something fearsome.",
    "Void Edge — finest blade I\never tempered. Costs plenty.",
    "That armour of yours has\nseen better days, friend.",
    "Floor 20 drops wyrmscale.\nGood for reinforcing plate.",
  ],
  merchant: [
    "Speed potions, fresh today.\nWon't last against a boss.",
    "Strength draught — doubles\nyour strike for ten seconds!",
    "Stock up before descending.\nI don't do dungeon delivery.",
    "Buy three, the fourth is\nalmost free. Almost.",
  ],
  guild: [
    "Complete quests, earn rank.\nHigher rank, better rewards.",
    "The guild tracks every kill.\nBones count as trophies too.",
    "Boss bounties pay triple.\nCheck the board before diving.",
    "Rank up to unlock the drop\ntrading window. Worth it.",
  ],
};
