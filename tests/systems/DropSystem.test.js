import { describe, it, expect } from "vitest";
import { getDropsForEnemy } from "../../src/systems/DropSystem.js";

describe("DropSystem", () => {
  describe("getDropsForEnemy(type, floor)", () => {
    it("skeleton returns gold in range 1-3", () => {
      for (let i = 0; i < 50; i++) {
        const drops = getDropsForEnemy("skeleton", 1);
        expect(drops.gold).toBeGreaterThanOrEqual(1);
        expect(drops.gold).toBeLessThanOrEqual(3);
      }
    });

    it("skeleton can return bones (probabilistic — at least 1 in 50 runs)", () => {
      let hasBones = false;
      for (let i = 0; i < 50; i++) {
        const drops = getDropsForEnemy("skeleton", 1);
        if (drops.bones > 0) hasBones = true;
      }
      expect(hasBones).toBe(true);
    });

    it("skeleton bones is always 0 or 1", () => {
      for (let i = 0; i < 50; i++) {
        const drops = getDropsForEnemy("skeleton", 1);
        expect([0, 1]).toContain(drops.bones);
      }
    });

    it("bat returns gold in range 1-2", () => {
      for (let i = 0; i < 50; i++) {
        const drops = getDropsForEnemy("bat", 1);
        expect(drops.gold).toBeGreaterThanOrEqual(1);
        expect(drops.gold).toBeLessThanOrEqual(2);
      }
    });

    it("bat can return crystals (probabilistic — at least 1 in 50 runs)", () => {
      let hasCrystals = false;
      for (let i = 0; i < 50; i++) {
        const drops = getDropsForEnemy("bat", 1);
        if (drops.crystals > 0) hasCrystals = true;
      }
      expect(hasCrystals).toBe(true);
    });

    it("bat crystals is always 0 or 1", () => {
      for (let i = 0; i < 50; i++) {
        const drops = getDropsForEnemy("bat", 1);
        expect([0, 1]).toContain(drops.crystals);
      }
    });

    it("boss returns fixed essence=1 bones=3 crystals=2", () => {
      const drops = getDropsForEnemy("boss", 10);
      expect(drops.essence).toBe(1);
      expect(drops.bones).toBe(3);
      expect(drops.crystals).toBe(2);
    });

    it("boss gold scales with floor (floor 10 = 20 + 10*2 = 40)", () => {
      const drops = getDropsForEnemy("boss", 10);
      expect(drops.gold).toBe(40);
    });

    it("boss gold scales with floor (floor 1 = 20 + 1*2 = 22)", () => {
      const drops = getDropsForEnemy("boss", 1);
      expect(drops.gold).toBe(22);
    });

    it("returns no negative values", () => {
      const types = ["skeleton", "bat", "boss"];
      for (const type of types) {
        for (let i = 0; i < 20; i++) {
          const drops = getDropsForEnemy(type, 5);
          for (const val of Object.values(drops)) {
            expect(val).toBeGreaterThanOrEqual(0);
          }
        }
      }
    });

    it("unknown enemy type returns zero drops", () => {
      const drops = getDropsForEnemy("slime", 1);
      expect(drops.gold).toBe(0);
    });
  });
});
