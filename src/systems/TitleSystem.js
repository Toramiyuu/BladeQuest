/**
 * TitleSystem — singleton tracking earned titles and the equipped title.
 *
 * Persistence: earnedTitles[] and equippedTitle stored in SaveManager.
 *
 * Usage:
 *   TitleSystem.init()              — call once at dungeon/hub start
 *   TitleSystem.checkUnlocks()      — call after stats change (kills, floors, quests, school)
 *   TitleSystem.equip(id|null)      — player equips a title (null = unequip)
 *   TitleSystem.getEquipped()       — returns full title definition or null
 *   TitleSystem.getDamageBonus()    — fraction to add to damage multiplier
 *   TitleSystem.getHPBonus()        — fraction to add to max HP multiplier
 *   TitleSystem.getGoldBonus()      — fraction to add to gold drops multiplier
 *   TitleSystem.getStartResources() — { potion?, bones?, crystals? } to grant at run start
 */

import SaveManager from "./SaveManager.js";
import { TITLES } from "../config/titles.js";
import GuildQuestSystem from "./GuildQuestSystem.js";
import SchoolSystem from "./SchoolSystem.js";

const TitleSystem = {
  _earned: null,
  _equipped: null,
  onUnlock: null,

  init() {
    this._earned = new Set(SaveManager.getEarnedTitles());
    this._equipped = SaveManager.getEquippedTitle();
  },

  /** Re-evaluate all title unlock conditions and persist newly earned ones. */
  checkUnlocks() {
    if (!this._earned) this.init();
    const questsDone = GuildQuestSystem.getQuestsCompleted();
    const totalKills = SaveManager.getTotalKills();
    const highestFloor = SaveManager.load().highestFloor ?? 0;

    let changed = false;
    for (const title of TITLES) {
      if (this._earned.has(title.id)) continue;

      let earned = false;
      if (title.trigger === "quests") {
        earned = questsDone >= title.required;
      } else if (title.trigger === "kills") {
        earned = totalKills >= title.required;
      } else if (title.trigger === "floor") {
        earned = highestFloor >= title.required;
      } else if (title.trigger === "school") {
        earned =
          SchoolSystem.getSchoolRankIndex(title.school) >= title.required;
      }

      if (earned) {
        this._earned.add(title.id);
        changed = true;
        if (this.onUnlock) this.onUnlock(title);
      }
    }

    if (changed) {
      SaveManager.saveEarnedTitles([...this._earned]);
    }
  },

  isEarned(id) {
    return this._earned?.has(id) ?? false;
  },

  /** Returns all title definitions annotated with earned/equipped flags. */
  getAll() {
    if (!this._earned) this.init();
    return TITLES.map((t) => ({
      ...t,
      earned: this._earned.has(t.id),
      equipped: t.id === this._equipped,
    }));
  },

  /** Equip a title by id. Pass null to unequip. */
  equip(id) {
    if (id !== null && !this._earned?.has(id)) return;
    this._equipped = id;
    SaveManager.saveEquippedTitle(id);
  },

  /** Returns the full title definition of the equipped title, or null. */
  getEquipped() {
    if (!this._equipped) return null;
    return TITLES.find((t) => t.id === this._equipped) ?? null;
  },

  getDamageBonus() {
    const t = this.getEquipped();
    return t?.bonus.type === "dmg" ? t.bonus.value : 0;
  },

  getHPBonus() {
    const t = this.getEquipped();
    return t?.bonus.type === "hp" ? t.bonus.value : 0;
  },

  getGoldBonus() {
    const t = this.getEquipped();
    return t?.bonus.type === "gold" ? t.bonus.value : 0;
  },

  /**
   * Returns start-of-run resource grants from the equipped title, or null.
   * Shape: { potion?: "health", potionCount?: n, bones?: n, crystals?: n }
   */
  getStartResources() {
    const t = this.getEquipped();
    if (!t) return null;
    if (t.bonus.type === "potion")
      return { potion: "health", potionCount: t.bonus.value };
    if (t.bonus.type === "bones") return { bones: t.bonus.value };
    if (t.bonus.type === "crystals") return { crystals: t.bonus.value };
    return null;
  },
};

export default TitleSystem;
