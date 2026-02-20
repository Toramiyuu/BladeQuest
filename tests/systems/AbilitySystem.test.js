import { describe, it, expect, beforeEach, vi } from "vitest";
import AbilitySystem from "../../src/systems/AbilitySystem.js";
import ManaSystem from "../../src/systems/ManaSystem.js";

describe("AbilitySystem", () => {
  let mana;
  let executor;
  let ability;

  beforeEach(() => {
    mana = new ManaSystem(100, 5);
    executor = vi.fn();
    ability = new AbilitySystem({
      manaCost: 25,
      cooldownMs: 500,
      execute: executor,
    });
  });

  describe("tryUse()", () => {
    it("fires executor and spends mana when available", () => {
      const result = ability.tryUse(mana);
      expect(result).toBe(true);
      expect(executor).toHaveBeenCalledOnce();
      expect(mana.currentMana).toBe(75);
    });

    it("returns false when insufficient mana", () => {
      mana.spend(80);
      const result = ability.tryUse(mana);
      expect(result).toBe(false);
      expect(executor).not.toHaveBeenCalled();
      expect(mana.currentMana).toBe(20);
    });

    it("returns false when on cooldown", () => {
      ability.tryUse(mana);
      const result = ability.tryUse(mana);
      expect(result).toBe(false);
      expect(executor).toHaveBeenCalledOnce();
    });

    it("allows use after cooldown expires", () => {
      ability.tryUse(mana);
      ability.update(500);
      const result = ability.tryUse(mana);
      expect(result).toBe(true);
      expect(executor).toHaveBeenCalledTimes(2);
    });

    it("does not allow use before cooldown fully expires", () => {
      ability.tryUse(mana);
      ability.update(400);
      const result = ability.tryUse(mana);
      expect(result).toBe(false);
    });
  });

  describe("update()", () => {
    it("ticks down cooldown timer", () => {
      ability.tryUse(mana);
      expect(ability.isOnCooldown).toBe(true);
      ability.update(250);
      expect(ability.isOnCooldown).toBe(true);
      ability.update(250);
      expect(ability.isOnCooldown).toBe(false);
    });

    it("cooldown does not go below 0", () => {
      ability.tryUse(mana);
      ability.update(1000);
      expect(ability.isOnCooldown).toBe(false);
    });
  });

  describe("reset()", () => {
    it("clears cooldown", () => {
      ability.tryUse(mana);
      expect(ability.isOnCooldown).toBe(true);
      ability.reset();
      expect(ability.isOnCooldown).toBe(false);
    });
  });
});
