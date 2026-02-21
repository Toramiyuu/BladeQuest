/**
 * GuildQuestSystem — pure JS, no Phaser dependency.
 *
 * Manages the Adventurer's Guild quest board: active quests (up to 3),
 * progress tracking, turn-in rewards, and rank progression.
 *
 * Rank gates (questsCompleted + boss floors from save):
 *   F  → starting rank
 *   E  → 3 quests completed
 *   D  → 5 quests + floor 10 boss cleared
 *   C  → 10 quests + floor 20 boss cleared
 *   B  → 20 quests + floor 30 boss cleared
 *   A  → 30 quests + floor 40 boss cleared
 */

import SaveManager from "./SaveManager.js";
import { GUILD_PERKS } from "../config/guildPerks.js";

const RANKS = ["F", "E", "D", "C", "B", "A"];

const RANK_GATES = [
  { rank: "F", quests: 0, bossFloor: null },
  { rank: "E", quests: 3, bossFloor: null },
  { rank: "D", quests: 5, bossFloor: 10 },
  { rank: "C", quests: 10, bossFloor: 20 },
  { rank: "B", quests: 20, bossFloor: 30 },
  { rank: "A", quests: 30, bossFloor: 40 },
];

/** Full quest pool. Each entry is a template — progress always starts at 0. */
const QUEST_POOL = [
  {
    id: "kill-skeleton-10",
    type: "kill",
    enemyType: "skeleton",
    label: "Slay 10 Skeletons",
    required: 10,
    reward: { gold: 50, rep: 1 },
  },
  {
    id: "kill-bat-5",
    type: "kill",
    enemyType: "bat",
    label: "Slay 5 Bats",
    required: 5,
    reward: { gold: 30, rep: 1 },
  },
  {
    id: "kill-warrior-5",
    type: "kill",
    enemyType: "skeleton-warrior",
    label: "Slay 5 Skeleton Warriors",
    required: 5,
    reward: { gold: 60, rep: 1 },
  },
  {
    id: "kill-archer-3",
    type: "kill",
    enemyType: "archer",
    label: "Slay 3 Archer Goblins",
    required: 3,
    reward: { gold: 50, rep: 1 },
  },
  {
    id: "explore-floor-3",
    type: "explore",
    targetFloor: 3,
    label: "Reach Floor 3",
    required: 1,
    reward: { gold: 40, rep: 1 },
  },
  {
    id: "explore-floor-5",
    type: "explore",
    targetFloor: 5,
    label: "Reach Floor 5",
    required: 1,
    reward: { gold: 80, rep: 2 },
  },
  {
    id: "explore-floor-10",
    type: "explore",
    targetFloor: 10,
    label: "Reach Floor 10",
    required: 1,
    reward: { gold: 150, rep: 3 },
  },
  {
    id: "collect-bones-5",
    type: "collection",
    materialType: "bones",
    label: "Collect 5 Bones",
    required: 5,
    reward: { gold: 35, rep: 1 },
  },
  {
    id: "collect-crystals-3",
    type: "collection",
    materialType: "crystals",
    label: "Collect 3 Crystals",
    required: 3,
    reward: { gold: 55, rep: 1 },
  },
];

const MAX_ACTIVE = 3;

/** In-memory cache of current guild state (synced with SaveManager). */
let _guild = null;

function _load() {
  _guild = SaveManager.getGuild();
}

function _persist() {
  SaveManager.saveGuild(_guild);
}

const GuildQuestSystem = {
  /** Re-loads guild state from save and fills empty quest slots. */
  refresh() {
    _load();
    this._fillSlots();
    _persist();
  },

  /** Returns a snapshot of the current active quests. */
  getActiveQuests() {
    if (!_guild) _load();
    return _guild.activeQuests.map((q) => ({ ...q }));
  },

  /** Returns the player's current guild rank string ("F"–"A"). */
  getRank() {
    if (!_guild) _load();
    const save = SaveManager.load();
    const cleared = save.clearedBossFloors ?? [];
    const completed = _guild.questsCompleted ?? 0;

    let rank = "F";
    for (const gate of RANK_GATES) {
      const questsOk = completed >= gate.quests;
      const bossOk = gate.bossFloor == null || cleared.includes(gate.bossFloor);
      if (questsOk && bossOk) rank = gate.rank;
    }
    return rank;
  },

  /** Whether a quest object has been completed (progress >= required). */
  isComplete(quest) {
    return quest.progress >= quest.required;
  },

  /**
   * Advances all active kill quests matching enemyType by n kills.
   * Progress is capped at required.
   */
  advanceKillQuest(enemyType, n = 1) {
    if (!_guild) _load();
    let changed = false;
    for (const q of _guild.activeQuests) {
      if (
        q.type === "kill" &&
        q.enemyType === enemyType &&
        q.progress < q.required
      ) {
        q.progress = Math.min(q.required, q.progress + n);
        changed = true;
      }
    }
    if (changed) _persist();
  },

  /**
   * Advances all active exploration quests whose targetFloor <= floor.
   */
  advanceExploreQuest(floor) {
    if (!_guild) _load();
    let changed = false;
    for (const q of _guild.activeQuests) {
      if (
        q.type === "explore" &&
        q.progress < q.required &&
        floor >= q.targetFloor
      ) {
        q.progress = q.required;
        changed = true;
      }
    }
    if (changed) _persist();
  },

  /**
   * Checks and advances all active collection quests where the player
   * currently holds >= required of the material.
   * @param {{ bones: number, crystals: number, essence: number }} materials
   */
  checkCollectionQuests(materials) {
    if (!_guild) _load();
    let changed = false;
    for (const q of _guild.activeQuests) {
      if (q.type === "collection" && q.progress < q.required) {
        const held = materials[q.materialType] ?? 0;
        if (held >= q.required) {
          q.progress = q.required;
          changed = true;
        }
      }
    }
    if (changed) _persist();
  },

  /**
   * Turns in a completed quest by id.
   * @returns {{ gold: number, rep: number }} reward on success, or null if
   *   the quest wasn't found or isn't complete.
   */
  turnIn(questId) {
    if (!_guild) _load();
    const idx = _guild.activeQuests.findIndex((q) => q.id === questId);
    if (idx === -1) return null;
    const quest = _guild.activeQuests[idx];
    if (!this.isComplete(quest)) return null;

    const reward = { ...quest.reward };
    _guild.activeQuests.splice(idx, 1);
    _guild.reputation = (_guild.reputation ?? 0) + reward.rep;
    _guild.questsCompleted = (_guild.questsCompleted ?? 0) + 1;
    _persist();
    this._fillSlots(new Set([questId]));
    _persist();
    return reward;
  },

  /** Returns the maximum quest slots for the current rank. */
  getMaxSlots() {
    return GUILD_PERKS[this.getRank()]?.slots ?? MAX_ACTIVE;
  },

  /** Returns the shop discount fraction (0–0.25) for the current rank. */
  getDiscount() {
    return GUILD_PERKS[this.getRank()]?.discount ?? 0;
  },

  /** Returns the free-potion type for current rank ("health"), or null if none. */
  hasFreePotion() {
    return GUILD_PERKS[this.getRank()]?.freePotion ?? null;
  },

  /** Returns the active perk label array for the current rank. */
  getPerkList() {
    return GUILD_PERKS[this.getRank()]?.perks ?? [];
  },

  /** Returns total reputation earned. */
  getReputation() {
    if (!_guild) _load();
    return _guild.reputation ?? 0;
  },

  /** Returns total quests completed. */
  getQuestsCompleted() {
    if (!_guild) _load();
    return _guild.questsCompleted ?? 0;
  },

  /** Returns next rank gate requirements, or null if already at rank A. */
  getNextRankRequirements() {
    const idx = RANKS.indexOf(this.getRank());
    if (idx < 0 || idx >= RANKS.length - 1) return null;
    const gate = RANK_GATES[idx + 1];
    return { rank: gate.rank, quests: gate.quests, bossFloor: gate.bossFloor };
  },

  /** Internal: fill empty quest slots from the pool. skipIds prevents immediate re-offer. */
  _fillSlots(skipIds = new Set()) {
    const max = this.getMaxSlots();
    const activeIds = new Set(_guild.activeQuests.map((q) => q.id));
    const available = QUEST_POOL.filter(
      (t) => !activeIds.has(t.id) && !skipIds.has(t.id),
    );
    let i = 0;
    while (_guild.activeQuests.length < max && i < available.length) {
      const template = available[i++];
      _guild.activeQuests.push({ ...template, progress: 0 });
    }
  },
};

export default GuildQuestSystem;
