/**
 * DungeonTileBuilder — tile-level construction helpers for DungeonGenerator.
 *
 * Pure functions that operate on a 2D tile array.
 * Tile IDs: 0=empty, 1=ground (solid)
 */

export const TILE_EMPTY = 0;
export const TILE_GROUND = 1;

export const ROOM_MIN_W = 14;
export const ROOM_MAX_W = 22;
export const ROOM_MIN_H = 8;
export const ROOM_MAX_H = 12;
export const CORRIDOR_HEIGHT = 3;
export const ROOM_GAP_X = 6;
export const PADDING = 2;
export const PLATFORM_MIN_W = 4;
export const PLATFORM_MAX_W = 8;

export const BOSS_ROOM_W = 40;
export const BOSS_ROOM_H = 15;

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function fillFloor(tiles, room) {
  const floorRow1 = room.y + room.h - 2;
  const floorRow2 = room.y + room.h - 1;
  for (let c = room.x; c < room.x + room.w; c++) {
    tiles[floorRow1][c] = TILE_GROUND;
    tiles[floorRow2][c] = TILE_GROUND;
  }
}

export function buildSteppedCorridor(
  tiles,
  startX,
  endX,
  aFloor,
  bFloor,
  maxRow,
) {
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

export function addPlatforms(tiles, room, totalHeight) {
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
