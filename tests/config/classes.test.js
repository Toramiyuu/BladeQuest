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

    it("returns undefined for unknown class", () => {
      expect(ClassRegistry.getClass("wizard")).toBeUndefined();
    });
  });

  describe("getAllClasses()", () => {
    it("returns array of both classes", () => {
      const all = ClassRegistry.getAllClasses();
      expect(all).toHaveLength(2);
      const ids = all.map((c) => c.id);
      expect(ids).toContain("shinobi");
      expect(ids).toContain("knight");
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
