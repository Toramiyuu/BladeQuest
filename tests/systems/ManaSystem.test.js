import { describe, it, expect } from "vitest";
import ManaSystem from "../../src/systems/ManaSystem.js";

describe("ManaSystem", () => {
  describe("constructor", () => {
    it("initializes with full mana", () => {
      const ms = new ManaSystem(100, 5);
      expect(ms.currentMana).toBe(100);
      expect(ms.maxMana).toBe(100);
    });
  });

  describe("spend()", () => {
    it("returns true and deducts mana when sufficient", () => {
      const ms = new ManaSystem(100, 5);
      expect(ms.spend(25)).toBe(true);
      expect(ms.currentMana).toBe(75);
    });

    it("returns false and keeps mana unchanged when insufficient", () => {
      const ms = new ManaSystem(100, 5);
      ms.spend(90);
      expect(ms.spend(25)).toBe(false);
      expect(ms.currentMana).toBe(10);
    });

    it("returns false when mana is exactly 0", () => {
      const ms = new ManaSystem(100, 5);
      ms.spend(100);
      expect(ms.spend(1)).toBe(false);
      expect(ms.currentMana).toBe(0);
    });

    it("allows spending exact remaining mana", () => {
      const ms = new ManaSystem(100, 5);
      ms.spend(75);
      expect(ms.spend(25)).toBe(true);
      expect(ms.currentMana).toBe(0);
    });
  });

  describe("update() — mana regeneration", () => {
    it("regenerates mana at regenRate per second", () => {
      const ms = new ManaSystem(100, 10);
      ms.spend(50);
      for (let i = 0; i < 20; i++) ms.update(50);
      expect(ms.currentMana).toBe(60);
    });

    it("does not exceed maxMana", () => {
      const ms = new ManaSystem(100, 10);
      ms.spend(5);
      for (let i = 0; i < 20; i++) ms.update(50);
      expect(ms.currentMana).toBe(100);
    });

    it("handles fractional delta correctly", () => {
      const ms = new ManaSystem(100, 10);
      ms.spend(50);
      for (let i = 0; i < 10; i++) ms.update(50);
      expect(ms.currentMana).toBe(55);
    });

    it("clamps large delta to MAX_DELTA", () => {
      const ms = new ManaSystem(100, 10);
      ms.spend(50);
      ms.update(200);
      expect(ms.currentMana).toBeLessThanOrEqual(50.5);
    });

    it("does not regenerate when already full", () => {
      const ms = new ManaSystem(100, 10);
      ms.update(50);
      expect(ms.currentMana).toBe(100);
    });
  });

  describe("restore()", () => {
    it("adds mana up to maxMana", () => {
      const ms = new ManaSystem(100, 5);
      ms.spend(60);
      ms.restore(30);
      expect(ms.currentMana).toBe(70);
    });

    it("caps at maxMana", () => {
      const ms = new ManaSystem(100, 5);
      ms.spend(10);
      ms.restore(50);
      expect(ms.currentMana).toBe(100);
    });
  });

  describe("reset()", () => {
    it("restores mana to full", () => {
      const ms = new ManaSystem(100, 5);
      ms.spend(80);
      ms.reset();
      expect(ms.currentMana).toBe(100);
    });
  });

  describe("mana never goes below 0", () => {
    it("spend does not go negative", () => {
      const ms = new ManaSystem(30, 5);
      ms.spend(30);
      expect(ms.currentMana).toBe(0);
      ms.spend(10);
      expect(ms.currentMana).toBe(0);
    });
  });
});
