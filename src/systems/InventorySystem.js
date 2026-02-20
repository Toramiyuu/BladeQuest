/**
 * InventorySystem — pure JS, no Phaser dependency.
 *
 * Tracks gold, crafting materials, equipment tiers, and potion loadout.
 * Persisted via SaveManager.saveInventory() / SaveManager.getInventory().
 */

import SaveManager from "./SaveManager.js";

const DEFAULT_INVENTORY = {
  gold: 0,
  materials: { bones: 0, crystals: 0, essence: 0 },
  weaponTier: 0,
  armorTier: 0,
  potionLoadout: [null, null, null],
  potionCounts: { health: 0, speed: 0, strength: 0 },
};

const WEAPON_COSTS = [
  { gold: 20, bones: 5 },
  { gold: 50, bones: 10, crystals: 3 },
];

const ARMOR_COSTS = [{ gold: 15, bones: 8 }];

const POTION_COSTS = {
  health: 10,
  speed: 12,
  strength: 15,
};

const MAX_POTION_COUNT = 5;
const VALID_MATERIALS = ["bones", "crystals", "essence"];
const VALID_POTIONS = ["health", "speed", "strength"];

function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function _canAffordCost(state, cost) {
  if ((cost.gold ?? 0) > state.gold) return false;
  if ((cost.bones ?? 0) > (state.materials.bones ?? 0)) return false;
  if ((cost.crystals ?? 0) > (state.materials.crystals ?? 0)) return false;
  if ((cost.essence ?? 0) > (state.materials.essence ?? 0)) return false;
  return true;
}

function _applyCost(state, cost) {
  state.gold -= cost.gold ?? 0;
  state.materials.bones -= cost.bones ?? 0;
  state.materials.crystals -= cost.crystals ?? 0;
  state.materials.essence -= cost.essence ?? 0;
}

const InventorySystem = {
  _state: null,

  /** Load inventory from SaveManager. Called automatically on first use. */
  init() {
    const saved = SaveManager.getInventory();
    this._state = deepCopy({ ...DEFAULT_INVENTORY, ...saved });
    this._state.materials = {
      ...DEFAULT_INVENTORY.materials,
      ...(saved.materials ?? {}),
    };
    this._state.potionCounts = {
      ...DEFAULT_INVENTORY.potionCounts,
      ...(saved.potionCounts ?? {}),
    };
    if (
      !Array.isArray(this._state.potionLoadout) ||
      this._state.potionLoadout.length !== 3
    ) {
      this._state.potionLoadout = [null, null, null];
    }
  },

  _ensureInit() {
    if (!this._state) this.init();
  },

  getInventory() {
    this._ensureInit();
    return deepCopy(this._state);
  },

  saveInventory() {
    this._ensureInit();
    SaveManager.saveInventory(deepCopy(this._state));
  },

  addGold(amount) {
    this._ensureInit();
    if (amount <= 0) return;
    this._state.gold += amount;
  },

  /** Returns true and deducts if sufficient; false otherwise. */
  spendGold(amount) {
    this._ensureInit();
    if (amount <= 0) return false;
    if (this._state.gold < amount) return false;
    this._state.gold -= amount;
    return true;
  },

  addMaterial(type, amount) {
    this._ensureInit();
    if (!VALID_MATERIALS.includes(type)) return;
    if (amount <= 0) return;
    this._state.materials[type] += amount;
  },

  /** Returns true and deducts if sufficient; false otherwise. */
  spendMaterial(type, amount) {
    this._ensureInit();
    if (!VALID_MATERIALS.includes(type)) return false;
    if (amount <= 0) return false;
    if (this._state.materials[type] < amount) return false;
    this._state.materials[type] -= amount;
    return true;
  },

  /** Returns true if upgrade from currentTier to next is affordable. */
  canAffordUpgrade(type, currentTier) {
    this._ensureInit();
    let costs;
    if (type === "weapon") costs = WEAPON_COSTS;
    else if (type === "armor") costs = ARMOR_COSTS;
    else return false;
    if (currentTier >= costs.length) return false;
    return _canAffordCost(this._state, costs[currentTier]);
  },

  /** Upgrades weapon tier. Returns true on success, false if max or unaffordable. */
  upgradeWeapon() {
    this._ensureInit();
    const tier = this._state.weaponTier;
    if (tier >= WEAPON_COSTS.length) return false;
    const cost = WEAPON_COSTS[tier];
    if (!_canAffordCost(this._state, cost)) return false;
    _applyCost(this._state, cost);
    this._state.weaponTier++;
    return true;
  },

  /** Upgrades armor tier. Returns true on success, false if max or unaffordable. */
  upgradeArmor() {
    this._ensureInit();
    const tier = this._state.armorTier;
    if (tier >= ARMOR_COSTS.length) return false;
    const cost = ARMOR_COSTS[tier];
    if (!_canAffordCost(this._state, cost)) return false;
    _applyCost(this._state, cost);
    this._state.armorTier++;
    return true;
  },

  /** Buys one of type potion if gold sufficient and count < max. Returns true on success. */
  buyPotion(type) {
    this._ensureInit();
    if (!VALID_POTIONS.includes(type)) return false;
    const cost = POTION_COSTS[type];
    if (this._state.gold < cost) return false;
    if (this._state.potionCounts[type] >= MAX_POTION_COUNT) return false;
    this._state.gold -= cost;
    this._state.potionCounts[type]++;
    return true;
  },

  /** Assigns a potion type to a loadout slot (0-2). Use null to clear. */
  setLoadoutSlot(slot, type) {
    this._ensureInit();
    if (slot < 0 || slot > 2) return;
    this._state.potionLoadout[slot] = type;
  },

  /**
   * Consumes one potion from the given loadout slot.
   * Returns the potion type string if consumed, null if empty/unassigned.
   */
  consumePotion(slot) {
    this._ensureInit();
    if (slot < 0 || slot > 2) return null;
    const type = this._state.potionLoadout[slot];
    if (!type || !VALID_POTIONS.includes(type)) return null;
    if (this._state.potionCounts[type] <= 0) return null;
    this._state.potionCounts[type]--;
    return type;
  },
};

export default InventorySystem;
