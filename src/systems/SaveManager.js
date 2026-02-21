/**
 * SaveManager — pure JS, no Phaser dependency.
 *
 * Persists player progression to localStorage:
 *   { unlockedClasses, clearedBossFloors, highestFloor, inventory? }
 */

const SAVE_KEY = "bladequest-save";

const DEFAULT_SAVE = {
  unlockedClasses: ["knight", "shinobi"],
  clearedBossFloors: [],
  highestFloor: 0,
};

const DEFAULT_INVENTORY = {
  gold: 0,
  materials: { bones: 0, crystals: 0, essence: 0 },
  weaponTier: 0,
  armorTier: 0,
  potionLoadout: [null, null, null],
  potionCounts: { health: 0, speed: 0, strength: 0 },
};

const DEFAULT_GUILD = {
  reputation: 0,
  questsCompleted: 0,
  activeQuests: [],
};

const SaveManager = {
  _saveListeners: [],

  /** Register a callback invoked after every save attempt. fn(success: boolean) */
  onSaveResult(fn) {
    this._saveListeners.push(fn);
  },

  load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw)
        return {
          ...DEFAULT_SAVE,
          clearedBossFloors: [],
          unlockedClasses: [...DEFAULT_SAVE.unlockedClasses],
        };
      return JSON.parse(raw);
    } catch {
      return {
        ...DEFAULT_SAVE,
        clearedBossFloors: [],
        unlockedClasses: [...DEFAULT_SAVE.unlockedClasses],
      };
    }
  },

  save(data) {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
      this._saveListeners.forEach((fn) => fn(true));
    } catch (e) {
      console.warn("[SaveManager] save failed:", e);
      this._saveListeners.forEach((fn) => fn(false));
    }
  },

  reset() {
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch (e) {
      console.warn("[SaveManager] reset failed:", e);
    }
    return {
      ...DEFAULT_SAVE,
      clearedBossFloors: [],
      unlockedClasses: [...DEFAULT_SAVE.unlockedClasses],
    };
  },

  clearBossFloor(floor) {
    const data = this.load();
    if (!data.clearedBossFloors.includes(floor)) {
      data.clearedBossFloors.push(floor);
    }
    if (floor > data.highestFloor) data.highestFloor = floor;
    this.save(data);
  },

  getClearedFloors() {
    return this.load().clearedBossFloors;
  },

  getUnlockedClasses() {
    return this.load().unlockedClasses;
  },

  unlockClass(id) {
    const data = this.load();
    if (!data.unlockedClasses.includes(id)) {
      data.unlockedClasses.push(id);
      this.save(data);
    }
  },

  /**
   * Returns the saved inventory object, or DEFAULT_INVENTORY if not present.
   * Backward-compatible: old saves without the inventory key return defaults.
   */
  getInventory() {
    const data = this.load();
    if (!data.inventory) return JSON.parse(JSON.stringify(DEFAULT_INVENTORY));
    return data.inventory;
  },

  /**
   * Persists the inventory object nested under the save's `inventory` key.
   * Does not overwrite other save fields (clearedBossFloors, highestFloor, etc.).
   */
  saveInventory(inventoryData) {
    const data = this.load();
    data.inventory = inventoryData;
    this.save(data);
  },

  /** Removes the inventory key from the save, resetting to defaults. */
  resetInventory() {
    const data = this.load();
    delete data.inventory;
    this.save(data);
  },

  /** Returns guild state, merging with defaults for backward compatibility. */
  getGuild() {
    const data = this.load();
    return {
      ...DEFAULT_GUILD,
      ...(data.guild ?? {}),
      activeQuests: Array.isArray(data.guild?.activeQuests)
        ? data.guild.activeQuests
        : [],
    };
  },

  /** Persists guild state under the save's `guild` key. */
  saveGuild(guildData) {
    const data = this.load();
    data.guild = guildData;
    this.save(data);
  },

  /** Increment persistent kill counter by n (default 1). */
  incrementKills(n = 1) {
    const data = this.load();
    data.totalKills = (data.totalKills ?? 0) + n;
    this.save(data);
  },

  getTotalKills() {
    return this.load().totalKills ?? 0;
  },

  /** Update highestFloor if floor is greater (called on every floor advance). */
  recordFloor(floor) {
    const data = this.load();
    if (floor > (data.highestFloor ?? 0)) {
      data.highestFloor = floor;
      this.save(data);
    }
  },

  getEarnedTitles() {
    return this.load().earnedTitles ?? [];
  },

  saveEarnedTitles(ids) {
    const data = this.load();
    data.earnedTitles = ids;
    this.save(data);
  },

  getEquippedTitle() {
    return this.load().equippedTitle ?? null;
  },

  saveEquippedTitle(id) {
    const data = this.load();
    data.equippedTitle = id;
    this.save(data);
  },
};

export default SaveManager;
