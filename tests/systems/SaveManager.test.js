import { describe, it, expect, beforeEach, vi } from "vitest";
import SaveManager from "../../src/systems/SaveManager.js";

const DEFAULT_SAVE = {
  unlockedClasses: ["knight", "shinobi"],
  clearedBossFloors: [],
  highestFloor: 0,
};

describe("SaveManager", () => {
  let storage;

  beforeEach(() => {
    storage = {};
    vi.stubGlobal("localStorage", {
      getItem: (key) => storage[key] ?? null,
      setItem: (key, value) => { storage[key] = value; },
      removeItem: (key) => { delete storage[key]; },
    });
  });

  describe("load()", () => {
    it("returns defaults when no save exists", () => {
      const result = SaveManager.load();
      expect(result).toEqual(DEFAULT_SAVE);
    });

    it("returns saved data when save exists", () => {
      const data = { unlockedClasses: ["knight"], clearedBossFloors: [10], highestFloor: 12 };
      storage["bladequest-save"] = JSON.stringify(data);
      expect(SaveManager.load()).toEqual(data);
    });

    it("returns defaults when save data is invalid JSON", () => {
      storage["bladequest-save"] = "not-valid-json{{{";
      expect(SaveManager.load()).toEqual(DEFAULT_SAVE);
    });
  });

  describe("save()", () => {
    it("persists data to localStorage", () => {
      const data = { unlockedClasses: ["knight"], clearedBossFloors: [10], highestFloor: 5 };
      SaveManager.save(data);
      expect(JSON.parse(storage["bladequest-save"])).toEqual(data);
    });
  });

  describe("reset()", () => {
    it("clears the save and returns defaults", () => {
      storage["bladequest-save"] = JSON.stringify({ clearedBossFloors: [10] });
      const result = SaveManager.reset();
      expect(result).toEqual(DEFAULT_SAVE);
      expect(storage["bladequest-save"]).toBeUndefined();
    });
  });

  describe("clearBossFloor()", () => {
    it("adds the floor to clearedBossFloors and persists", () => {
      SaveManager.clearBossFloor(10);
      const saved = JSON.parse(storage["bladequest-save"]);
      expect(saved.clearedBossFloors).toContain(10);
    });

    it("does not add duplicate floor numbers", () => {
      SaveManager.clearBossFloor(10);
      SaveManager.clearBossFloor(10);
      const saved = JSON.parse(storage["bladequest-save"]);
      expect(saved.clearedBossFloors.filter((f) => f === 10)).toHaveLength(1);
    });

    it("accumulates multiple boss floors", () => {
      SaveManager.clearBossFloor(10);
      SaveManager.clearBossFloor(20);
      expect(SaveManager.getClearedFloors()).toEqual([10, 20]);
    });
  });

  describe("getClearedFloors()", () => {
    it("returns empty array when no floors cleared", () => {
      expect(SaveManager.getClearedFloors()).toEqual([]);
    });

    it("returns cleared floors from save", () => {
      storage["bladequest-save"] = JSON.stringify({ ...DEFAULT_SAVE, clearedBossFloors: [10, 20] });
      expect(SaveManager.getClearedFloors()).toEqual([10, 20]);
    });
  });

  describe("getUnlockedClasses()", () => {
    it("returns both classes by default", () => {
      expect(SaveManager.getUnlockedClasses()).toEqual(["knight", "shinobi"]);
    });
  });

  describe("unlockClass()", () => {
    it("adds new class to unlockedClasses and persists", () => {
      storage["bladequest-save"] = JSON.stringify({ ...DEFAULT_SAVE, unlockedClasses: ["knight"] });
      SaveManager.unlockClass("mage");
      expect(SaveManager.getUnlockedClasses()).toContain("mage");
    });

    it("does not add duplicate class ids", () => {
      SaveManager.unlockClass("knight");
      expect(SaveManager.getUnlockedClasses().filter((c) => c === "knight")).toHaveLength(1);
    });
  });
});
