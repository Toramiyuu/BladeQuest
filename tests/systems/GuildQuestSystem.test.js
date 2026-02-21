import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("../../src/systems/SaveManager.js", () => {
  let _guild = { reputation: 0, questsCompleted: 0, activeQuests: [] };
  let _save = { clearedBossFloors: [], highestFloor: 0 };
  return {
    default: {
      getGuild: () => JSON.parse(JSON.stringify(_guild)),
      saveGuild: (g) => { _guild = JSON.parse(JSON.stringify(g)); },
      load: () => JSON.parse(JSON.stringify(_save)),
      save: (d) => { _save = JSON.parse(JSON.stringify(d)); },
      _setCleared: (floors) => { _save.clearedBossFloors = floors; },
      _setGuild: (g) => { _guild = JSON.parse(JSON.stringify(g)); },
      _reset: () => {
        _guild = { reputation: 0, questsCompleted: 0, activeQuests: [] };
        _save = { clearedBossFloors: [], highestFloor: 0 };
      },
    },
  };
});

import GuildQuestSystem from "../../src/systems/GuildQuestSystem.js";
import SaveManager from "../../src/systems/SaveManager.js";

beforeEach(() => {
  SaveManager._reset();
  GuildQuestSystem.refresh();
});

describe("GuildQuestSystem", () => {
  describe("refreshQuests()", () => {
    it("fills up to 3 active quest slots on first refresh", () => {
      const quests = GuildQuestSystem.getActiveQuests();
      expect(quests.length).toBe(3);
    });

    it("each quest has id, type, label, required, progress=0, reward", () => {
      const quests = GuildQuestSystem.getActiveQuests();
      for (const q of quests) {
        expect(q).toHaveProperty("id");
        expect(q).toHaveProperty("type");
        expect(q).toHaveProperty("label");
        expect(q.required).toBeGreaterThan(0);
        expect(q.progress).toBe(0);
        expect(q.reward).toHaveProperty("gold");
        expect(q.reward).toHaveProperty("rep");
      }
    });

    it("does not duplicate active quests", () => {
      const quests = GuildQuestSystem.getActiveQuests();
      const ids = quests.map((q) => q.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  describe("advanceKillQuest()", () => {
    it("increments progress on matching kill quest", () => {
      const guild = SaveManager.getGuild();
      guild.activeQuests = [
        { id: "kill-skeleton-10", type: "kill", enemyType: "skeleton",
          label: "Slay 10 Skeletons", required: 10, progress: 0,
          reward: { gold: 50, rep: 1 } },
      ];
      SaveManager.saveGuild(guild);
      GuildQuestSystem.refresh();

      GuildQuestSystem.advanceKillQuest("skeleton", 3);
      const quests = GuildQuestSystem.getActiveQuests();
      expect(quests[0].progress).toBe(3);
    });

    it("does not exceed required count", () => {
      const guild = SaveManager.getGuild();
      guild.activeQuests = [
        { id: "kill-bat-3", type: "kill", enemyType: "bat",
          label: "Slay 3 Bats", required: 3, progress: 2,
          reward: { gold: 30, rep: 1 } },
      ];
      SaveManager.saveGuild(guild);
      GuildQuestSystem.refresh();

      GuildQuestSystem.advanceKillQuest("bat", 5);
      const quests = GuildQuestSystem.getActiveQuests();
      expect(quests[0].progress).toBe(3);
    });

    it("ignores wrong enemy type", () => {
      const guild = SaveManager.getGuild();
      guild.activeQuests = [
        { id: "kill-skeleton-10", type: "kill", enemyType: "skeleton",
          label: "Slay 10 Skeletons", required: 10, progress: 0,
          reward: { gold: 50, rep: 1 } },
      ];
      SaveManager.saveGuild(guild);
      GuildQuestSystem.refresh();

      GuildQuestSystem.advanceKillQuest("bat", 5);
      const quests = GuildQuestSystem.getActiveQuests();
      expect(quests[0].progress).toBe(0);
    });
  });

  describe("advanceExploreQuest()", () => {
    it("completes explore quest when floor target is reached", () => {
      const guild = SaveManager.getGuild();
      guild.activeQuests = [
        { id: "explore-floor-5", type: "explore", targetFloor: 5,
          label: "Reach Floor 5", required: 1, progress: 0,
          reward: { gold: 80, rep: 2 } },
      ];
      SaveManager.saveGuild(guild);
      GuildQuestSystem.refresh();

      GuildQuestSystem.advanceExploreQuest(5);
      const quests = GuildQuestSystem.getActiveQuests();
      expect(quests[0].progress).toBe(1);
    });

    it("does not mark as complete if floor not yet reached", () => {
      const guild = SaveManager.getGuild();
      guild.activeQuests = [
        { id: "explore-floor-10", type: "explore", targetFloor: 10,
          label: "Reach Floor 10", required: 1, progress: 0,
          reward: { gold: 100, rep: 2 } },
      ];
      SaveManager.saveGuild(guild);
      GuildQuestSystem.refresh();

      GuildQuestSystem.advanceExploreQuest(7);
      const quests = GuildQuestSystem.getActiveQuests();
      expect(quests[0].progress).toBe(0);
    });
  });

  describe("isComplete()", () => {
    it("returns true when progress >= required", () => {
      const q = { id: "x", type: "kill", required: 3, progress: 3, reward: { gold: 0, rep: 0 } };
      expect(GuildQuestSystem.isComplete(q)).toBe(true);
    });

    it("returns false when progress < required", () => {
      const q = { id: "x", type: "kill", required: 3, progress: 2, reward: { gold: 0, rep: 0 } };
      expect(GuildQuestSystem.isComplete(q)).toBe(false);
    });
  });

  describe("turnIn()", () => {
    it("awards gold and rep, increments questsCompleted, removes quest", () => {
      const guild = SaveManager.getGuild();
      guild.activeQuests = [
        { id: "kill-skeleton-10", type: "kill", enemyType: "skeleton",
          label: "Slay 10 Skeletons", required: 10, progress: 10,
          reward: { gold: 50, rep: 1 } },
      ];
      SaveManager.saveGuild(guild);
      GuildQuestSystem.refresh();

      const result = GuildQuestSystem.turnIn("kill-skeleton-10");
      expect(result).toEqual({ gold: 50, rep: 1 });

      const updated = SaveManager.getGuild();
      expect(updated.reputation).toBe(1);
      expect(updated.questsCompleted).toBe(1);
      expect(updated.activeQuests.find((q) => q.id === "kill-skeleton-10")).toBeUndefined();
    });

    it("returns null if quest not found", () => {
      expect(GuildQuestSystem.turnIn("nonexistent")).toBeNull();
    });

    it("returns null if quest not yet complete", () => {
      const guild = SaveManager.getGuild();
      guild.activeQuests = [
        { id: "kill-skeleton-10", type: "kill", enemyType: "skeleton",
          label: "Slay 10 Skeletons", required: 10, progress: 5,
          reward: { gold: 50, rep: 1 } },
      ];
      SaveManager.saveGuild(guild);
      GuildQuestSystem.refresh();

      expect(GuildQuestSystem.turnIn("kill-skeleton-10")).toBeNull();
    });
  });

  describe("getRank()", () => {
    it("starts at F with no quests completed", () => {
      expect(GuildQuestSystem.getRank()).toBe("F");
    });

    it("returns E after 3 quests completed", () => {
      SaveManager._setGuild({ reputation: 3, questsCompleted: 3, activeQuests: [] });
      GuildQuestSystem.refresh();
      expect(GuildQuestSystem.getRank()).toBe("E");
    });

    it("returns D after 5 quests + floor 10 boss cleared", () => {
      SaveManager._setGuild({ reputation: 5, questsCompleted: 5, activeQuests: [] });
      SaveManager._setCleared([10]);
      GuildQuestSystem.refresh();
      expect(GuildQuestSystem.getRank()).toBe("D");
    });

    it("stays E if floor 10 boss not cleared even with 5 quests", () => {
      SaveManager._setGuild({ reputation: 5, questsCompleted: 5, activeQuests: [] });
      GuildQuestSystem.refresh();
      expect(GuildQuestSystem.getRank()).toBe("E");
    });
  });
});
