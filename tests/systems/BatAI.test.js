import { describe, it, expect } from "vitest";
import BatAI from "../../src/systems/BatAI.js";

describe("BatAI", () => {
  function makeBat(x = 100) {
    return new BatAI({ speed: 80, leftBound: 50, rightBound: 250 }, x);
  }

  describe("update()", () => {
    it("moves horizontally at configured speed", () => {
      const ai = makeBat(100);
      const result = ai.update(100, 16);
      expect(result.vx).not.toBe(0);
    });

    it("oscillates Y with sine wave", () => {
      const ai = makeBat(100);
      const r1 = ai.update(100, 16);
      const r2 = ai.update(100 + r1.vx * 0.016, 16);
      expect(typeof r1.vy).toBe("number");
    });

    it("reverses direction at right bound", () => {
      const ai = makeBat(248);
      const r1 = ai.update(250, 16);
      expect(r1.vx).toBeLessThan(0);
    });

    it("reverses direction at left bound", () => {
      const ai = makeBat(52);
      ai._direction = -1;
      const r1 = ai.update(50, 16);
      expect(r1.vx).toBeGreaterThan(0);
    });

    it("stays within bounds over many frames", () => {
      const ai = makeBat(150);
      let x = 150;
      for (let i = 0; i < 500; i++) {
        const r = ai.update(x, 16);
        x += r.vx * 0.016;
      }
      expect(x).toBeGreaterThanOrEqual(40);
      expect(x).toBeLessThanOrEqual(260);
    });
  });
});
