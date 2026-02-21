/**
 * GuildBossFloors — builds the boss floor preview panel for GuildBoardScene.
 * Shows floors 10/20/30/40 with boss name, difficulty, and cleared status.
 * Compact layout (rowH=26) designed to share vertical space with quest board.
 */
import { PIXEL_FONT } from "../config/PixelFont.js";

const D = 2;

const BOSS_INFO = [
  { floor: 10, name: "The Hollow Knight", theme: "Forest / Nature", skulls: 1 },
  { floor: 20, name: "Inferno Wyrm", theme: "Fire / Magma", skulls: 2 },
  { floor: 30, name: "Frost Lich", theme: "Ice / Undead", skulls: 3 },
  { floor: 40, name: "Shadow Sovereign", theme: "Dark / Final", skulls: 4 },
];

function bt(scene, x, y, str, size, tint, ox = 0.5, oy = 0) {
  return scene.add
    .bitmapText(x, y, PIXEL_FONT, str, size)
    .setOrigin(ox, oy)
    .setTint(tint)
    .setScrollFactor(0)
    .setDepth(D + 1);
}

export function buildBossFloors(scene, PX, PW, PY, cleared) {
  const clearedSet = new Set(cleared ?? []);
  const objects = [];

  const startY = PY + 4;
  const rowH = 26;

  BOSS_INFO.forEach((boss, i) => {
    const y = startY + i * rowH;
    const isCleared = clearedSet.has(boss.floor);

    const bg = scene.add
      .rectangle(
        PX + PW / 2,
        y + rowH / 2 - 2,
        PW - 20,
        rowH - 4,
        isCleared ? 0x0a1a0a : 0x0a0a1a,
      )
      .setStrokeStyle(1, isCleared ? 0x228822 : 0x334466)
      .setScrollFactor(0)
      .setDepth(D);
    objects.push(bg);

    const badgeTint = isCleared ? 0x44ff44 : 0x4466aa;
    objects.push(
      bt(scene, PX + 20, y + 6, `F${boss.floor}`, 8, badgeTint, 0.5, 0),
    );

    objects.push(
      bt(
        scene,
        PX + 42,
        y + 6,
        boss.name,
        8,
        isCleared ? 0x88ff88 : 0xeeeeff,
        0,
        0,
      ),
    );

    const skulls = "* ".repeat(boss.skulls).trim();
    objects.push(
      bt(scene, PX + 42, y + 16, `${boss.theme}  ${skulls}`, 8, 0x7788aa, 0, 0),
    );

    const statusTxt = isCleared ? "CLEARED" : "LOCKED";
    const statusTint = isCleared ? 0x44ff44 : 0x555566;
    objects.push(
      bt(scene, PX + PW - 18, y + 11, statusTxt, 8, statusTint, 1, 0.5),
    );
  });

  return objects;
}
