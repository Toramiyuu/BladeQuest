/**
 * Tests for DungeonEventsMixin — the three event emit helpers.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { DungeonEventsMixin } from "../../src/scenes/DungeonEvents.js";

function makeCtx(overrides = {}) {
  return {
    _events: { emit: vi.fn() },
    _healthSystem: { currentHealth: 5, maxHealth: 10 },
    _currentFloor: 3,
    _lastMana: undefined,
    player: { manaSystem: { currentMana: 4, maxMana: 8 } },
    ...overrides,
  };
}

describe("DungeonEventsMixin", () => {
  describe("_emitHealthChanged()", () => {
    it("emits health-changed with current and max", () => {
      const ctx = makeCtx();
      DungeonEventsMixin._emitHealthChanged.call(ctx);
      expect(ctx._events.emit).toHaveBeenCalledWith("health-changed", {
        current: 5,
        max: 10,
      });
    });

    it("does nothing when _events is null", () => {
      const ctx = makeCtx({ _events: null });
      expect(() => DungeonEventsMixin._emitHealthChanged.call(ctx)).not.toThrow();
    });
  });

  describe("_emitFloorChanged()", () => {
    it("emits floor-changed with current floor number", () => {
      const ctx = makeCtx();
      DungeonEventsMixin._emitFloorChanged.call(ctx);
      expect(ctx._events.emit).toHaveBeenCalledWith("floor-changed", 3);
    });

    it("does nothing when _events is null", () => {
      const ctx = makeCtx({ _events: null });
      expect(() => DungeonEventsMixin._emitFloorChanged.call(ctx)).not.toThrow();
    });
  });

  describe("_emitManaChanged()", () => {
    it("emits mana-changed with current and max", () => {
      const ctx = makeCtx();
      DungeonEventsMixin._emitManaChanged.call(ctx);
      expect(ctx._events.emit).toHaveBeenCalledWith("mana-changed", {
        current: 4,
        max: 8,
      });
      expect(ctx._lastMana).toBe(4);
    });

    it("skips emit when mana has not changed since last call", () => {
      const ctx = makeCtx({ _lastMana: 4 });
      DungeonEventsMixin._emitManaChanged.call(ctx);
      expect(ctx._events.emit).not.toHaveBeenCalled();
    });

    it("does nothing when _events is null", () => {
      const ctx = makeCtx({ _events: null });
      expect(() => DungeonEventsMixin._emitManaChanged.call(ctx)).not.toThrow();
    });

    it("does nothing when player has no manaSystem", () => {
      const ctx = makeCtx({ player: {} });
      expect(() => DungeonEventsMixin._emitManaChanged.call(ctx)).not.toThrow();
      expect(ctx._events.emit).not.toHaveBeenCalled();
    });
  });
});
