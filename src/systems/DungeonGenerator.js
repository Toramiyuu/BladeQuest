/**
 * DungeonGenerator — pure JS, no Phaser dependency.
 *
 * Produces procedural floor layouts for the dungeon.
 * Output is a data object consumed by DungeonScene to build a Phaser tilemap.
 *
 * Tile IDs: 0=empty, 1=ground (solid), 2=platform (one-way)
 */

const TILE_EMPTY = 0;
const TILE_GROUND = 1;

const ROOM_MIN_W = 14;
const ROOM_MAX_W = 22;
const ROOM_MIN_H = 8;
const ROOM_MAX_H = 12;
const CORRIDOR_HEIGHT = 3;
const ROOM_GAP_X = 6;
const PADDING = 2;
const PLATFORM_MIN_W = 4;
const PLATFORM_MAX_W = 8;

const BOSS_ROOM_W = 40;
const BOSS_ROOM_H = 15;

const BAT_MIN_FLOOR = 3;
const BASE_ENEMIES_PER_ROOM = 2;
const ENEMIES_ROOM_SCALE = 2;
const MAX_RETRIES = 3;

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function fillFloor(tiles, room) {
  const floorRow1 = room.y + room.h - 2;
  const floorRow2 = room.y + room.h - 1;
  for (let c = room.x; c < room.x + room.w; c++) {
    tiles[floorRow1][c] = TILE_GROUND;
    tiles[floorRow2][c] = TILE_GROUND;
  }
}

function buildSteppedCorridor(tiles, startX, endX, aFloor, bFloor, maxRow) {
  const totalCols = endX - startX;
  if (totalCols <= 0) return;
  let curY = aFloor;
  for (let c = startX; c < endX; c++) {
    const t = totalCols > 1 ? (c - startX) / (totalCols - 1) : 1;
    const targetY = Math.round(aFloor + t * (bFloor - aFloor));
    if (targetY < curY) curY = Math.max(targetY, curY - 1);
    else if (targetY > curY) curY = Math.min(targetY, curY + 1);
    if (curY >= 0 && curY < maxRow) tiles[curY][c] = TILE_GROUND;
    if (curY + 1 >= 0 && curY + 1 < maxRow) tiles[curY + 1][c] = TILE_GROUND;
  }
}

function addPlatforms(tiles, room, totalHeight) {
  const count = randInt(1, 3);
  for (let p = 0; p < count; p++) {
    const pw = randInt(PLATFORM_MIN_W, PLATFORM_MAX_W);
    const maxX = room.x + room.w - pw - 2;
    if (maxX <= room.x + 2) continue;
    const px = randInt(room.x + 2, maxX);
    const py = room.y + randInt(3, room.h - 5);
    if (py < 0 || py >= totalHeight) continue;
    for (let c = px; c < px + pw && c < room.x + room.w - 1; c++) {
      tiles[py][c] = TILE_GROUND;
    }
  }
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
      const type =
        floor >= BAT_MIN_FLOOR && Math.random() < 0.4 ? "bat" : "skeleton";
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
      groundTiles[floorRow1][x] = 1;
      groundTiles[floorRow2][x] = 1;
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
