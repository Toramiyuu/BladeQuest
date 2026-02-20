import { describe, it, expect } from "vitest";
import DungeonGenerator from "../../src/systems/DungeonGenerator.js";

describe("DungeonGenerator", () => {
  describe("generate() — normal floor", () => {
    it("returns an object with required structure", () => {
      const result = DungeonGenerator.generate(1);
      expect(result).toHaveProperty("width");
      expect(result).toHaveProperty("height");
      expect(result).toHaveProperty("groundTiles");
      expect(result).toHaveProperty("spawns");
      expect(result).toHaveProperty("rooms");
      expect(result.spawns).toHaveProperty("player");
      expect(result.spawns).toHaveProperty("enemies");
      expect(result.spawns).toHaveProperty("passage");
    });

    it("generates 7-10 rooms for normal floors", () => {
      for (let i = 0; i < 20; i++) {
        const result = DungeonGenerator.generate(1);
        expect(result.rooms.length).toBeGreaterThanOrEqual(7);
        expect(result.rooms.length).toBeLessThanOrEqual(10);
      }
    });

    it("places player spawn in the first (leftmost) room", () => {
      const result = DungeonGenerator.generate(1);
      const firstRoom = result.rooms.reduce((a, b) => (a.x < b.x ? a : b));
      const sp = result.spawns.player;
      expect(sp.x).toBeGreaterThanOrEqual(firstRoom.x);
      expect(sp.x).toBeLessThanOrEqual(firstRoom.x + firstRoom.w);
      expect(sp.y).toBeGreaterThanOrEqual(firstRoom.y);
      expect(sp.y).toBeLessThanOrEqual(firstRoom.y + firstRoom.h);
    });

    it("places passage in the last (rightmost) room", () => {
      const result = DungeonGenerator.generate(1);
      const lastRoom = result.rooms.reduce((a, b) => (a.x > b.x ? a : b));
      const pass = result.spawns.passage;
      expect(pass).not.toBeNull();
      expect(pass.x).toBeGreaterThanOrEqual(lastRoom.x);
      expect(pass.x).toBeLessThanOrEqual(lastRoom.x + lastRoom.w);
    });

    it("has enemies in spawn list", () => {
      const result = DungeonGenerator.generate(1);
      expect(result.spawns.enemies.length).toBeGreaterThan(0);
    });

    it("enemy count increases with floor number", () => {
      const floor1 = DungeonGenerator.generate(1);
      const floor5 = DungeonGenerator.generate(5);
      let total1 = 0;
      let total5 = 0;
      for (let i = 0; i < 10; i++) {
        total1 += DungeonGenerator.generate(1).spawns.enemies.length;
        total5 += DungeonGenerator.generate(5).spawns.enemies.length;
      }
      expect(total5).toBeGreaterThan(total1);
    });

    it("groundTiles is a 2D array of tile IDs (0, 1, or 2)", () => {
      const result = DungeonGenerator.generate(1);
      expect(result.groundTiles.length).toBe(result.height);
      for (const row of result.groundTiles) {
        expect(row.length).toBe(result.width);
        for (const tile of row) {
          expect([0, 1, 2]).toContain(tile);
        }
      }
    });

    it("rooms do not overlap", () => {
      for (let i = 0; i < 10; i++) {
        const result = DungeonGenerator.generate(1);
        const rooms = result.rooms;
        for (let a = 0; a < rooms.length; a++) {
          for (let b = a + 1; b < rooms.length; b++) {
            const ra = rooms[a];
            const rb = rooms[b];
            const overlapX = ra.x < rb.x + rb.w && ra.x + ra.w > rb.x;
            const overlapY = ra.y < rb.y + rb.h && ra.y + ra.h > rb.y;
            expect(overlapX && overlapY).toBe(false);
          }
        }
      }
    });

    it("every room is reachable from player spawn (connectivity)", () => {
      const result = DungeonGenerator.generate(1);
      const { groundTiles, rooms, width, height } = result;
      const sp = result.spawns.player;

      const visited = Array.from({ length: height }, () =>
        new Array(width).fill(false),
      );
      const queue = [[sp.y, sp.x]];
      visited[sp.y][sp.x] = true;

      while (queue.length > 0) {
        const [r, c] = queue.shift();
        for (const [dr, dc] of [
          [-1, 0],
          [1, 0],
          [0, -1],
          [0, 1],
        ]) {
          const nr = r + dr;
          const nc = c + dc;
          if (
            nr >= 0 &&
            nr < height &&
            nc >= 0 &&
            nc < width &&
            !visited[nr][nc] &&
            groundTiles[nr][nc] !== 0
          ) {
            visited[nr][nc] = true;
            queue.push([nr, nc]);
          }
        }
      }

      for (const room of rooms) {
        let found = false;
        for (let r = room.y; r < room.y + room.h && !found; r++) {
          for (let c = room.x; c < room.x + room.w && !found; c++) {
            if (visited[r][c]) found = true;
          }
        }
        expect(found).toBe(true);
      }
    });

    it("spawns.boss is null for normal floors", () => {
      const result = DungeonGenerator.generate(1);
      expect(result.spawns.boss).toBeNull();
    });
  });

  describe("enemy scaling", () => {
    it("floor 1-2 spawns only skeleton enemies", () => {
      for (let i = 0; i < 20; i++) {
        const result = DungeonGenerator.generate(2);
        for (const e of result.spawns.enemies) {
          expect(e.type).toBe("skeleton");
        }
      }
    });

    it("floor 3+ can spawn bat enemies", () => {
      let hasBat = false;
      for (let i = 0; i < 50; i++) {
        const result = DungeonGenerator.generate(5);
        if (result.spawns.enemies.some((e) => e.type === "bat")) {
          hasBat = true;
          break;
        }
      }
      expect(hasBat).toBe(true);
    });

    it("enemies have hp property that scales with floor depth", () => {
      const floor1 = DungeonGenerator.generate(1);
      const floor11 = DungeonGenerator.generate(11);
      expect(floor1.spawns.enemies[0].hp).toBe(1);
      expect(floor11.spawns.enemies[0].hp).toBe(2);
    });

    it("enemies have roomIndex property", () => {
      const result = DungeonGenerator.generate(3);
      for (const e of result.spawns.enemies) {
        expect(typeof e.roomIndex).toBe("number");
        expect(e.roomIndex).toBeGreaterThanOrEqual(0);
        expect(e.roomIndex).toBeLessThan(result.rooms.length);
      }
    });
  });

  describe("generate() — boss floor", () => {
    it("generates a single large room on floor 10", () => {
      const result = DungeonGenerator.generate(10);
      expect(result.rooms).toHaveLength(1);
    });

    it("has a boss spawn on floor 10", () => {
      const result = DungeonGenerator.generate(10);
      expect(result.spawns.boss).not.toBeNull();
      expect(result.spawns.boss).toHaveProperty("x");
      expect(result.spawns.boss).toHaveProperty("y");
    });

    it("has no passage on boss floor (passage spawns after boss defeat)", () => {
      const result = DungeonGenerator.generate(10);
      expect(result.spawns.passage).toBeNull();
    });

    it("floor 20 is also a boss floor", () => {
      const result = DungeonGenerator.generate(20);
      expect(result.rooms).toHaveLength(1);
      expect(result.spawns.boss).not.toBeNull();
    });
  });
});
