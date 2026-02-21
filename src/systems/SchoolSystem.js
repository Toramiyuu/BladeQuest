/**
 * SchoolSystem — singleton tracking the player's active Combat School,
 * Style XP, rank, and First Blood eligibility.
 *
 * Phase 1A: Crimson Fang (First Blood) only.
 * Iron Tide and Phantom Gale mechanics slot in during Phase 1B/1C.
 *
 * Usage:
 *   SchoolSystem.init(classId)          — call at dungeon start
 *   SchoolSystem.isFirstBlood(enemy, now) — true if hit qualifies
 *   SchoolSystem.recordHit(enemy, now)  — call after every hit lands
 *   SchoolSystem.onEnemyDied(enemy)     — clean up per-enemy tracking
 *   SchoolSystem.getFirstBloodMult()    — damage multiplier for First Blood hits
 *   SchoolSystem.addStyleXP(amount)     — award XP and check rank-up
 */

import SaveManager from "./SaveManager.js";
import {
  ALL_SCHOOLS,
  CLASS_PRIMARY_SCHOOL,
  FIRST_BLOOD_TIMER_MS,
  STYLE_XP,
} from "../config/combatSchools.js";

const SAVE_KEY = "bladequest_schools";

const SchoolSystem = {
  _activeSchool: "crimsonFang",
  _xp: { crimsonFang: 0, ironTide: 0, phantomGale: 0 },
  _lastHitGlobal: -Infinity,
  _lastHitByEnemy: null,
  _onRankUp: null,

  /** Call once at the start of each dungeon run. */
  init(classId) {
    this._activeSchool = CLASS_PRIMARY_SCHOOL[classId] ?? "crimsonFang";
    this._lastHitGlobal = -Infinity;
    this._lastHitByEnemy = new Map();
    this._loadXP();
  },

  /** Set a callback fired when a rank-up occurs: fn(schoolId, rankIndex, rankName). */
  onRankUp(fn) {
    this._onRankUp = fn;
  },

  /**
   * Returns true if hitting `enemy` right now qualifies as First Blood:
   *   • The enemy has never been hit this run, OR
   *   • No enemy has been hit for FIRST_BLOOD_TIMER_MS milliseconds.
   */
  isFirstBlood(enemy, now) {
    if (now - this._lastHitGlobal > FIRST_BLOOD_TIMER_MS) return true;
    return !this._lastHitByEnemy.has(enemy);
  },

  /** Call immediately after a hit lands to update tracking state. */
  recordHit(enemy, now) {
    this._lastHitGlobal = now;
    this._lastHitByEnemy.set(enemy, now);
  },

  /** Remove the enemy from per-enemy tracking when it dies. */
  onEnemyDied(enemy) {
    this._lastHitByEnemy?.delete(enemy);
  },

  /**
   * Returns the First Blood damage multiplier for the active school + rank.
   * Returns 1.0 if the active school has no First Blood mechanic.
   */
  getFirstBloodMult() {
    const school = ALL_SCHOOLS[this._activeSchool];
    const rank = this._getRankIndex(this._activeSchool);
    return school?.ranks?.[rank]?.firstBloodMult ?? 1.0;
  },

  addStyleXP(amount) {
    const school = this._activeSchool;
    const before = this._getRankIndex(school);
    this._xp[school] = (this._xp[school] ?? 0) + amount;
    const after = this._getRankIndex(school);
    this._saveXP();
    if (after > before && this._onRankUp) {
      const rankName = ALL_SCHOOLS[school]?.ranks?.[after]?.name ?? "Adept";
      this._onRankUp(school, after, rankName);
    }
  },

  addFirstBloodXP() {
    this.addStyleXP(STYLE_XP.firstBlood);
  },

  addBossKillXP() {
    this.addStyleXP(STYLE_XP.bossKill);
  },

  getActiveSchool() {
    return this._activeSchool;
  },

  getActiveSchoolName() {
    return ALL_SCHOOLS[this._activeSchool]?.name ?? "Unknown";
  },

  getActiveSchoolColor() {
    return ALL_SCHOOLS[this._activeSchool]?.color ?? 0xffffff;
  },

  getActiveRankIndex() {
    return this._getRankIndex(this._activeSchool);
  },

  /** Returns rank index for any school (used by TitleSystem unlock checks). */
  getSchoolRankIndex(schoolId) {
    return this._getRankIndex(schoolId);
  },

  getActiveRankName() {
    const school = ALL_SCHOOLS[this._activeSchool];
    const idx = this._getRankIndex(this._activeSchool);
    return school?.ranks?.[idx]?.name ?? "Initiate";
  },

  getActiveXP() {
    return this._xp[this._activeSchool] ?? 0;
  },

  /** XP required for next rank, or null if already at Master. */
  getXPForNextRank() {
    const school = ALL_SCHOOLS[this._activeSchool];
    const next = this._getRankIndex(this._activeSchool) + 1;
    return school?.ranks?.[next]?.xpRequired ?? null;
  },

  /**
   * Returns a 0–1 fraction of progress within the current rank toward the next.
   * Returns 1.0 when at Master rank.
   */
  getXPFraction() {
    const school = ALL_SCHOOLS[this._activeSchool];
    if (!school) return 0;
    const ranks = school.ranks;
    const idx = this._getRankIndex(this._activeSchool);
    if (idx >= ranks.length - 1) return 1.0;
    const lo = ranks[idx].xpRequired;
    const hi = ranks[idx + 1].xpRequired;
    const xp = this._xp[this._activeSchool] ?? 0;
    return Math.min(1.0, (xp - lo) / (hi - lo));
  },

  _loadXP() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        this._xp = { ...this._xp, ...parsed };
      }
    } catch {}
  },

  _saveXP() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(this._xp));
    } catch {}
  },

  _getRankIndex(schoolId) {
    const xp = this._xp[schoolId] ?? 0;
    const ranks = ALL_SCHOOLS[schoolId]?.ranks ?? [];
    let idx = 0;
    for (let i = ranks.length - 1; i >= 0; i--) {
      if (xp >= ranks[i].xpRequired) {
        idx = i;
        break;
      }
    }
    return idx;
  },
};

export default SchoolSystem;
