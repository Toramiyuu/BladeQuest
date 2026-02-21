/**
 * DungeonGenerator — pure JS, no Phaser dependency.
 *
 * Produces procedural floor layouts for the dungeon.
 * Output is a data object consumed by DungeonScene to build a Phaser tilemap.
 *
 * Tile-building helpers live in DungeonTileBuilder.js.
 */

import {
  TILE_EMPTY,
  TILE_GROUND,
  ROOM_MIN_W,
  ROOM_MAX_W,
  ROOM_MIN_H,
  ROOM_MAX_H,
  ROOM_GAP_X,
  PADDING,
  CORRIDOR_HEIGHT,
  BOSS_ROOM_W,
  BOSS_ROOM_H,
  fillFloor,
  buildSteppedCorridor,
  addPlatforms,
} from "./DungeonTileBuilder.js";

const BAT_MIN_FLOOR = 3;
const WARRIOR_MIN_FLOOR = 11;
const ARCHER_MIN_FLOOR = 21;
const BASE_ENEMIES_PER_ROOM = 2;
const ENEMIES_ROOM_SCALE = 2;
const MAX_RETRIES = 3;

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function _pickEnemyType(floor) {
  const r = Math.random();
  if (floor >= ARCHER_MIN_FLOOR) {
    if (r < 0.25) return "archer";
    if (r < 0.5) return "skeleton-warrior";
    if (r < 0.7) return "bat";
    return "skeleton";
  }
  if (floor >= WARRIOR_MIN_FLOOR) {
    if (r < 0.35) return "skeleton-warrior";
    if (r < 0.6) return "bat";
    return "skeleton";
  }
  if (floor >= BAT_MIN_FLOOR) {
    return r < 0.4 ? "bat" : "skeleton";
  }
  return "skeleton";
}

function generateNormalFloor(floor) {
  const roomCount = randInt(7, 10);
  const rooms = [];

  let cursorX = PADDING;
  for (let i = 0; i < roomCount; i++) {
    const w = randInt(ROOM_MIN_W, ROOM_MAX_W);
    const h = randInt(ROOM_MIN_H, ROOM_MAX_H);
    const baseY = PADDING + ROOM_MAX_H - h;
    const y = Math.max(PADDING, baseY + randInt(-3, 3));
    rooms.push({ x: cursorX, y, w, h });
    cursorX += w + ROOM_GAP_X;
  }

  const totalWidth = cursorX + PADDING;
  const totalHeight =
    Math.max(...rooms.map((r) => r.y + r.h)) + PADDING + CORRIDOR_HEIGHT;

  const tiles = Array.from({ length: totalHeight }, () =>
    new Array(totalWidth).fill(TILE_EMPTY),
  );

  for (const room of rooms) {
    fillFloor(tiles, room);
    addPlatforms(tiles, room, totalHeight);
  }

  for (let i = 0; i < rooms.length - 1; i++) {
    const a = rooms[i];
    const b = rooms[i + 1];
    const aFloor = a.y + a.h - 2;
    const bFloor = b.y + b.h - 2;
    buildSteppedCorridor(tiles, a.x + a.w, b.x, aFloor, bFloor, totalHeight);
  }

  const sortedRooms = [...rooms].sort((a, b) => a.x - b.x);
  const firstRoom = sortedRooms[0];
  const lastRoom = sortedRooms[sortedRooms.length - 1];

  const playerSpawn = {
    x: firstRoom.x + Math.floor(firstRoom.w / 2),
    y: firstRoom.y + firstRoom.h - 3,
  };

  const passageSpawn = {
    x: lastRoom.x + Math.floor(lastRoom.w / 2),
    y: lastRoom.y + lastRoom.h - 3,
  };

  const enemyRooms = sortedRooms.slice(1);
  const enemiesPerRoom =
    BASE_ENEMIES_PER_ROOM + Math.floor(floor / ENEMIES_ROOM_SCALE);
  const hpMultiplier = 1 + Math.floor(floor / 10);
  const enemies = [];

  for (const room of enemyRooms) {
    for (let i = 0; i < enemiesPerRoom; i++) {
      const type = _pickEnemyType(floor);
      const spawnY =
        type === "bat" ? room.y + Math.floor(room.h / 2) : room.y + room.h - 3;
      enemies.push({
        x: room.x + randInt(2, room.w - 3),
        y: spawnY,
        type,
        hp: hpMultiplier,
        roomIndex: rooms.indexOf(room),
      });
    }
  }

  return {
    width: totalWidth,
    height: totalHeight,
    groundTiles: tiles,
    spawns: {
      player: playerSpawn,
      enemies,
      passage: passageSpawn,
      boss: null,
    },
    rooms,
  };
}

function generateBossFloor(_floor) {
  const totalWidth = BOSS_ROOM_W + PADDING * 2;
  const totalHeight = BOSS_ROOM_H + PADDING * 2;

  const tiles = Array.from({ length: totalHeight }, () =>
    new Array(totalWidth).fill(TILE_EMPTY),
  );

  const room = { x: PADDING, y: PADDING, w: BOSS_ROOM_W, h: BOSS_ROOM_H };
  fillFloor(tiles, room);

  return {
    width: totalWidth,
    height: totalHeight,
    groundTiles: tiles,
    spawns: {
      player: {
        x: room.x + 3,
        y: room.y + room.h - 3,
      },
      enemies: [],
      passage: null,
      boss: {
        x: room.x + room.w - 5,
        y: room.y + room.h - 3,
      },
    },
    rooms: [room],
  };
}

const DungeonGenerator = {
  generate(floor) {
    if (floor % 10 === 0) {
      return generateBossFloor(floor);
    }

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      const result = generateNormalFloor(floor);
      if (this._validateConnectivity(result)) {
        return result;
      }
    }
    return this._generateGuaranteedFallback(floor);
  },

  _generateGuaranteedFallback(floor) {
    const rW = 20;
    const rH = 10;
    const gap = 5;
    const width = rW * 2 + gap + 4;
    const height = rH + 6;
    const groundTiles = Array.from({ length: height }, () =>
      new Array(width).fill(0),
    );
    const r1 = { x: 2, y: 3, w: rW, h: rH };
    const r2 = { x: 2 + rW + gap, y: 3, w: rW, h: rH };
    const rooms = [r1, r2];
    for (const room of rooms) {
      fillFloor(groundTiles, room);
    }
    const floorRow1 = r1.y + r1.h - 2;
    const floorRow2 = r1.y + r1.h - 1;
    for (let x = r1.x + r1.w; x < r2.x; x++) {
      groundTiles[floorRow1][x] = TILE_GROUND;
      groundTiles[floorRow2][x] = TILE_GROUND;
    }
    const hpMultiplier = 1 + Math.floor(floor / 10);
    const enemies = [
      {
        x: r2.x + 5,
        y: r2.y + r2.h - 3,
        type: "skeleton",
        hp: hpMultiplier,
        roomIndex: 1,
      },
    ];
    return {
      width,
      height,
      groundTiles,
      rooms,
      spawns: {
        player: { x: r1.x + 2, y: r1.y + r1.h - 3 },
        enemies,
        passage: { x: r2.x + r2.w - 3, y: r2.y + r2.h - 3 },
        boss: null,
      },
    };
  },

  _validateConnectivity(result) {
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
      if (!found) return false;
    }
    return true;
  },
};

export default DungeonGenerator;
