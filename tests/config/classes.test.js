import { describe, it, expect } from "vitest";
import ClassRegistry from "../../src/config/classes.js";

describe("ClassRegistry", () => {
  describe("getClass()", () => {
    it("returns shinobi config", () => {
      const shinobi = ClassRegistry.getClass("shinobi");
      expect(shinobi).toBeDefined();
      expect(shinobi.id).toBe("shinobi");
      expect(shinobi.name).toBe("Shinobi");
      expect(shinobi.stats.maxHealth).toBe(4);
      expect(shinobi.stats.maxMana).toBe(100);
      expect(shinobi.ability.id).toBe("kunai");
    });

    it("returns knight config", () => {
      const knight = ClassRegistry.getClass("knight");
      expect(knight).toBeDefined();
      expect(knight.id).toBe("knight");
      expect(knight.name).toBe("Holy Knight");
      expect(knight.stats.maxHealth).toBe(6);
      expect(knight.stats.maxMana).toBe(100);
      expect(knight.ability.id).toBe("holy-slash");
    });

    it("returns rogue config", () => {
      const rogue = ClassRegistry.getClass("rogue");
      expect(rogue).toBeDefined();
      expect(rogue.id).toBe("rogue");
      expect(rogue.stats.maxHealth).toBe(3);
      expect(rogue.stats.maxMana).toBe(80);
      expect(rogue.ability.id).toBe("blink");
    });

    it("returns mage config", () => {
      const mage = ClassRegistry.getClass("mage");
      expect(mage).toBeDefined();
      expect(mage.id).toBe("mage");
      expect(mage.stats.maxHealth).toBe(4);
      expect(mage.stats.maxMana).toBe(120);
      expect(mage.ability.id).toBe("burst");
    });

    it("returns berserker config", () => {
      const berserker = ClassRegistry.getClass("berserker");
      expect(berserker).toBeDefined();
      expect(berserker.id).toBe("berserker");
      expect(berserker.stats.maxHealth).toBe(5);
      expect(berserker.stats.maxMana).toBe(60);
      expect(berserker.ability.id).toBe("rage");
    });

    it("returns undefined for unknown class", () => {
      expect(ClassRegistry.getClass("wizard")).toBeUndefined();
    });
  });

  describe("getAllClasses()", () => {
    it("returns array of all 5 classes", () => {
      const all = ClassRegistry.getAllClasses();
      expect(all).toHaveLength(5);
      const ids = all.map((c) => c.id);
      expect(ids).toContain("shinobi");
      expect(ids).toContain("knight");
      expect(ids).toContain("rogue");
      expect(ids).toContain("mage");
      expect(ids).toContain("berserker");
    });
  });

  describe("getDefault()", () => {
    it("returns a valid class config", () => {
      const def = ClassRegistry.getDefault();
      expect(def).toBeDefined();
      expect(def.id).toBeDefined();
      expect(def.stats).toBeDefined();
    });
  });

  describe("class config shape", () => {
    it("each class has required fields", () => {
      for (const cls of ClassRegistry.getAllClasses()) {
        expect(cls).toHaveProperty("id");
        expect(cls).toHaveProperty("name");
        expect(cls).toHaveProperty("description");
        expect(cls).toHaveProperty("spriteKeys");
        expect(cls).toHaveProperty("ability");
        expect(cls).toHaveProperty("stats");
        expect(cls.ability).toHaveProperty("id");
        expect(cls.ability).toHaveProperty("manaCost");
        expect(cls.ability).toHaveProperty("cooldownMs");
        expect(cls.stats).toHaveProperty("maxHealth");
        expect(cls.stats).toHaveProperty("maxMana");
      }
    });
  });
});
