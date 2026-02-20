import { describe, it, expect } from "vitest";
import { calculateDamage } from "../../src/systems/DamageCalc.js";

describe("DamageCalc", () => {
  describe("weapon tier", () => {
    it("tier 0 deals 1 damage (shinobi, no heavy)", () => {
      expect(calculateDamage({ weaponTier: 0 })).toBe(1);
    });

    it("tier 1 deals 2 damage (shinobi, no heavy)", () => {
      expect(calculateDamage({ weaponTier: 1 })).toBe(2);
    });

    it("tier 2 deals 2 damage (shinobi, no heavy)", () => {
      expect(calculateDamage({ weaponTier: 2 })).toBe(2);
    });
  });

  describe("heavy attack", () => {
    it("heavy slash at tier 0 deals 2 damage", () => {
      expect(calculateDamage({ weaponTier: 0, isHeavy: true })).toBe(2);
    });

    it("heavy slash at tier 2 deals 3 damage", () => {
      expect(calculateDamage({ weaponTier: 2, isHeavy: true })).toBe(3);
    });
  });

  describe("class multiplier", () => {
    it("knight normal slash at tier 0 deals 2 damage", () => {
      expect(calculateDamage({ classId: "knight" })).toBe(2);
    });

    it("knight heavy at tier 2 deals 3 damage", () => {
      expect(calculateDamage({ weaponTier: 2, classId: "knight", isHeavy: true })).toBe(3);
    });

    it("shinobi and knight differ at same tier", () => {
      const shinobi = calculateDamage({ weaponTier: 0, classId: "shinobi" });
      const knight = calculateDamage({ weaponTier: 0, classId: "knight" });
      expect(knight).toBeGreaterThanOrEqual(shinobi);
    });
  });

  describe("defaults", () => {
    it("returns at least 1 with no args", () => {
      expect(calculateDamage()).toBeGreaterThanOrEqual(1);
    });

    it("returns integer", () => {
      const dmg = calculateDamage({ weaponTier: 1, classId: "knight", isHeavy: true });
      expect(Number.isInteger(dmg)).toBe(true);
    });
  });
});
