import { describe, it, expect, beforeEach, vi } from "vitest";
import SaveManager from "../../src/systems/SaveManager.js";

let InventorySystem;

const DEFAULT_INVENTORY = {
  gold: 0,
  materials: { bones: 0, crystals: 0, essence: 0 },
  weaponTier: 0,
  armorTier: 0,
  potionLoadout: [null, null, null],
  potionCounts: { health: 0, speed: 0, strength: 0 },
};

describe("InventorySystem", () => {
  let storage;

  beforeEach(async () => {
    storage = {};
    vi.stubGlobal("localStorage", {
      getItem: (key) => storage[key] ?? null,
      setItem: (key, value) => {
        storage[key] = value;
      },
      removeItem: (key) => {
        delete storage[key];
      },
    });
    vi.resetModules();
    const mod = await import("../../src/systems/InventorySystem.js");
    InventorySystem = mod.default;
  });

  describe("getInventory()", () => {
    it("returns default inventory when no save exists", () => {
      const inv = InventorySystem.getInventory();
      expect(inv).toMatchObject(DEFAULT_INVENTORY);
    });

    it("returns stored inventory when save has inventory key", () => {
      const save = { unlockedClasses: ["knight"], clearedBossFloors: [], highestFloor: 0, inventory: { ...DEFAULT_INVENTORY, gold: 50 } };
      storage["bladequest-save"] = JSON.stringify(save);
      vi.resetModules();
      const inv = InventorySystem.getInventory();
      InventorySystem.init();
      expect(InventorySystem.getInventory().gold).toBe(50);
    });
  });

  describe("addGold() / spendGold()", () => {
    it("adds gold correctly", () => {
      InventorySystem.addGold(10);
      expect(InventorySystem.getInventory().gold).toBe(10);
    });

    it("accumulates gold", () => {
      InventorySystem.addGold(5);
      InventorySystem.addGold(3);
      expect(InventorySystem.getInventory().gold).toBe(8);
    });

    it("spendGold deducts gold and returns true when sufficient", () => {
      InventorySystem.addGold(20);
      const result = InventorySystem.spendGold(15);
      expect(result).toBe(true);
      expect(InventorySystem.getInventory().gold).toBe(5);
    });

    it("spendGold returns false and does not deduct when insufficient", () => {
      InventorySystem.addGold(5);
      const result = InventorySystem.spendGold(10);
      expect(result).toBe(false);
      expect(InventorySystem.getInventory().gold).toBe(5);
    });

    it("does not allow negative gold from addGold", () => {
      InventorySystem.addGold(-5);
      expect(InventorySystem.getInventory().gold).toBe(0);
    });
  });

  describe("addMaterial() / spendMaterial()", () => {
    it("adds bones correctly", () => {
      InventorySystem.addMaterial("bones", 3);
      expect(InventorySystem.getInventory().materials.bones).toBe(3);
    });

    it("adds crystals correctly", () => {
      InventorySystem.addMaterial("crystals", 2);
      expect(InventorySystem.getInventory().materials.crystals).toBe(2);
    });

    it("adds essence correctly", () => {
      InventorySystem.addMaterial("essence", 1);
      expect(InventorySystem.getInventory().materials.essence).toBe(1);
    });

    it("spendMaterial returns true and deducts when sufficient", () => {
      InventorySystem.addMaterial("bones", 5);
      const result = InventorySystem.spendMaterial("bones", 3);
      expect(result).toBe(true);
      expect(InventorySystem.getInventory().materials.bones).toBe(2);
    });

    it("spendMaterial returns false and does not deduct when insufficient", () => {
      InventorySystem.addMaterial("bones", 2);
      const result = InventorySystem.spendMaterial("bones", 5);
      expect(result).toBe(false);
      expect(InventorySystem.getInventory().materials.bones).toBe(2);
    });

    it("ignores unknown material types", () => {
      InventorySystem.addMaterial("unknown", 5);
      expect(InventorySystem.getInventory().materials).toEqual(DEFAULT_INVENTORY.materials);
    });
  });

  describe("upgradeWeapon()", () => {
    it("upgrades weapon from tier 0 to 1 when affordable", () => {
      InventorySystem.addGold(25);
      InventorySystem.addMaterial("bones", 6);
      const result = InventorySystem.upgradeWeapon();
      expect(result).toBe(true);
      expect(InventorySystem.getInventory().weaponTier).toBe(1);
    });

    it("deducts correct cost for tier 0→1 (20g + 5 bones)", () => {
      InventorySystem.addGold(30);
      InventorySystem.addMaterial("bones", 8);
      InventorySystem.upgradeWeapon();
      const inv = InventorySystem.getInventory();
      expect(inv.gold).toBe(10);
      expect(inv.materials.bones).toBe(3);
    });

    it("upgrades weapon from tier 1 to 2 when affordable", () => {
      InventorySystem.addGold(80);
      InventorySystem.addMaterial("bones", 20);
      InventorySystem.addMaterial("crystals", 5);
      InventorySystem.upgradeWeapon();
      const result = InventorySystem.upgradeWeapon();
      expect(result).toBe(true);
      expect(InventorySystem.getInventory().weaponTier).toBe(2);
    });

    it("returns false when max weapon tier reached", () => {
      InventorySystem.addGold(200);
      InventorySystem.addMaterial("bones", 50);
      InventorySystem.addMaterial("crystals", 20);
      InventorySystem.upgradeWeapon();
      InventorySystem.upgradeWeapon();
      const result = InventorySystem.upgradeWeapon();
      expect(result).toBe(false);
      expect(InventorySystem.getInventory().weaponTier).toBe(2);
    });

    it("returns false when insufficient resources", () => {
      InventorySystem.addGold(5);
      const result = InventorySystem.upgradeWeapon();
      expect(result).toBe(false);
      expect(InventorySystem.getInventory().weaponTier).toBe(0);
    });
  });

  describe("upgradeArmor()", () => {
    it("upgrades armor from tier 0 to 1 when affordable (15g + 8 bones)", () => {
      InventorySystem.addGold(20);
      InventorySystem.addMaterial("bones", 10);
      const result = InventorySystem.upgradeArmor();
      expect(result).toBe(true);
      expect(InventorySystem.getInventory().armorTier).toBe(1);
      expect(InventorySystem.getInventory().gold).toBe(5);
      expect(InventorySystem.getInventory().materials.bones).toBe(2);
    });

    it("returns false at max armor tier", () => {
      InventorySystem.addGold(50);
      InventorySystem.addMaterial("bones", 20);
      InventorySystem.upgradeArmor();
      const result = InventorySystem.upgradeArmor();
      expect(result).toBe(false);
      expect(InventorySystem.getInventory().armorTier).toBe(1);
    });
  });

  describe("canAffordUpgrade()", () => {
    it("returns false when cannot afford weapon upgrade", () => {
      expect(InventorySystem.canAffordUpgrade("weapon", 0)).toBe(false);
    });

    it("returns true when can afford weapon upgrade", () => {
      InventorySystem.addGold(25);
      InventorySystem.addMaterial("bones", 6);
      expect(InventorySystem.canAffordUpgrade("weapon", 0)).toBe(true);
    });

    it("returns false for max tier upgrade", () => {
      InventorySystem.addGold(200);
      InventorySystem.addMaterial("bones", 50);
      InventorySystem.addMaterial("crystals", 20);
      expect(InventorySystem.canAffordUpgrade("weapon", 2)).toBe(false);
    });
  });

  describe("buyPotion() / consumePotion()", () => {
    it("buys health potion for 10g", () => {
      InventorySystem.addGold(15);
      const result = InventorySystem.buyPotion("health");
      expect(result).toBe(true);
      expect(InventorySystem.getInventory().gold).toBe(5);
      expect(InventorySystem.getInventory().potionCounts.health).toBe(1);
    });

    it("returns false when insufficient gold", () => {
      InventorySystem.addGold(5);
      const result = InventorySystem.buyPotion("health");
      expect(result).toBe(false);
      expect(InventorySystem.getInventory().potionCounts.health).toBe(0);
    });

    it("cannot buy more than 5 of a potion type", () => {
      InventorySystem.addGold(100);
      for (let i = 0; i < 5; i++) InventorySystem.buyPotion("health");
      expect(InventorySystem.getInventory().potionCounts.health).toBe(5);
      const result = InventorySystem.buyPotion("health");
      expect(result).toBe(false);
    });
  });

  describe("setLoadoutSlot() / consumePotion()", () => {
    it("assigns potion type to slot", () => {
      InventorySystem.setLoadoutSlot(0, "health");
      expect(InventorySystem.getInventory().potionLoadout[0]).toBe("health");
    });

    it("consumePotion returns type and decrements count when loaded and in stock", () => {
      InventorySystem.addGold(15);
      InventorySystem.buyPotion("health");
      InventorySystem.setLoadoutSlot(1, "health");
      const result = InventorySystem.consumePotion(1);
      expect(result).toBe("health");
      expect(InventorySystem.getInventory().potionCounts.health).toBe(0);
    });

    it("consumePotion returns null when slot has no potion type assigned", () => {
      const result = InventorySystem.consumePotion(0);
      expect(result).toBeNull();
    });

    it("consumePotion returns null when potion count is 0", () => {
      InventorySystem.setLoadoutSlot(0, "health");
      const result = InventorySystem.consumePotion(0);
      expect(result).toBeNull();
    });
  });

  describe("saveInventory() / persistence round-trip", () => {
    it("saves inventory to localStorage and reloads correctly", () => {
      InventorySystem.addGold(50);
      InventorySystem.addMaterial("bones", 5);
      InventorySystem.saveInventory();
      const loaded = SaveManager.getInventory();
      expect(loaded.gold).toBe(50);
      expect(loaded.materials.bones).toBe(5);
    });

    it("init() loads saved inventory from SaveManager", () => {
      InventorySystem.addGold(100);
      InventorySystem.saveInventory();
      InventorySystem.init();
      expect(InventorySystem.getInventory().gold).toBe(100);
    });
  });

  describe("SaveManager backward compatibility", () => {
    it("getInventory() returns default inventory when save has no inventory key", () => {
      storage["bladequest-save"] = JSON.stringify({ unlockedClasses: ["shinobi"], clearedBossFloors: [], highestFloor: 0 });
      const inv = SaveManager.getInventory();
      expect(inv).toMatchObject(DEFAULT_INVENTORY);
    });

    it("saveInventory() persists inventory without corrupting other save fields", () => {
      storage["bladequest-save"] = JSON.stringify({ unlockedClasses: ["shinobi"], clearedBossFloors: [10], highestFloor: 12 });
      SaveManager.saveInventory({ ...DEFAULT_INVENTORY, gold: 99 });
      const saved = JSON.parse(storage["bladequest-save"]);
      expect(saved.gold).toBeUndefined();
      expect(saved.inventory.gold).toBe(99);
      expect(saved.clearedBossFloors).toEqual([10]);
      expect(saved.highestFloor).toBe(12);
    });
  });
});
