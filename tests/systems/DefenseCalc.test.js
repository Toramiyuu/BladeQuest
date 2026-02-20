import { describe, it, expect } from "vitest";
import { calculateIncoming } from "../../src/systems/DefenseCalc.js";

describe("DefenseCalc", () => {
  it("tier 0 (no armor) passes through full damage", () => {
    expect(calculateIncoming(2, 0)).toBe(2);
    expect(calculateIncoming(1, 0)).toBe(1);
  });

  it("tier 1 (chain mail) reduces damage by 20%", () => {
    expect(calculateIncoming(2, 1)).toBe(2);
    expect(calculateIncoming(3, 1)).toBe(3);
    expect(calculateIncoming(5, 1)).toBe(4);
  });

  it("minimum damage is always 1", () => {
    expect(calculateIncoming(1, 1)).toBe(1);
    expect(calculateIncoming(1, 0)).toBe(1);
  });

  it("defaults to tier 0 when armorTier omitted", () => {
    expect(calculateIncoming(3)).toBe(3);
  });

  it("returns an integer", () => {
    expect(Number.isInteger(calculateIncoming(3, 1))).toBe(true);
  });
});
