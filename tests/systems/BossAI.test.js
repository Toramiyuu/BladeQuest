import { describe, it, expect } from "vitest";
import BossAI from "../../src/systems/BossAI.js";

describe("BossAI", () => {
  function makeBoss(opts = {}) {
    return new BossAI({
      leftBound: opts.leftBound ?? 50,
      rightBound: opts.rightBound ?? 600,
      maxHealth: opts.maxHealth ?? 10,
      patrolSpeed: opts.patrolSpeed ?? 60,
      chargeSpeed: opts.chargeSpeed ?? 180,
      chargeRange: opts.chargeRange ?? 120,
      jumpForce: opts.jumpForce ?? -300,
    });
  }

  describe("Phase 1 (>50% HP)", () => {
    it("patrols horizontally within bounds", () => {
      const ai = makeBoss();
      const result = ai.update(300, 400, 200, 10, 16);
      expect(result.vx).not.toBe(0);
      expect(Math.abs(result.vx)).toBeLessThanOrEqual(180);
    });

    it("reverses direction at bounds", () => {
      const ai = makeBoss();
      const r1 = ai.update(600, 400, 200, 10, 16);
      expect(r1.vx).toBeLessThan(0);

      const r2 = ai.update(50, 400, 200, 10, 16);
      expect(r2.vx).toBeGreaterThan(0);
    });

    it("charges toward player when in range", () => {
      const ai = makeBoss();
      const result = ai.update(300, 380, 200, 10, 16);
      expect(Math.abs(result.vx)).toBeGreaterThan(60);
    });

    it("does not trigger phase 2 behaviors above 50% HP", () => {
      const ai = makeBoss();
      expect(ai.phase).toBe(1);
      ai.update(300, 400, 200, 8, 16);
      expect(ai.phase).toBe(1);
    });
  });

  describe("Phase 2 (<50% HP)", () => {
    it("enters phase 2 when HP drops to 50% or below", () => {
      const ai = makeBoss();
      ai.update(300, 400, 200, 5, 16);
      expect(ai.phase).toBe(2);
    });

    it("moves faster in phase 2", () => {
      const ai = makeBoss();
      const r1 = ai.update(300, 9999, 200, 10, 16);
      const speed1 = Math.abs(r1.vx);

      const ai2 = makeBoss();
      const r2 = ai2.update(300, 9999, 200, 4, 16);
      const speed2 = Math.abs(r2.vx);

      expect(speed2).toBeGreaterThan(speed1);
    });

    it("occasionally triggers jump attack (vy < 0)", () => {
      const ai = makeBoss({ jumpForce: -300 });
      let hasJump = false;
      for (let i = 0; i < 200; i++) {
        const r = ai.update(300, 350, 200, 3, 16);
        if (r.vy < 0) {
          hasJump = true;
          break;
        }
      }
      expect(hasJump).toBe(true);
    });
  });

  describe("general", () => {
    it("returns { vx, vy } from update", () => {
      const ai = makeBoss();
      const result = ai.update(300, 400, 200, 10, 16);
      expect(typeof result.vx).toBe("number");
      expect(typeof result.vy).toBe("number");
    });

    it("phase is readable", () => {
      const ai = makeBoss();
      expect(ai.phase).toBe(1);
    });
  });
});
