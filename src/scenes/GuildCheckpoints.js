/**
 * GuildCheckpoints — checkpoint floor buttons for GuildBoardScene.
 *
 * Renders up to 5 checkpoint buttons that let the player start a dungeon
 * run from a previously cleared boss floor.
 */

import { PIXEL_FONT } from "../config/PixelFont.js";

const D = 2;

export function buildCheckpoints(scene, PX, PW, PY, cleared, onFloorSelect) {
  if (!cleared || cleared.length === 0) return;
  const CX = PX + PW / 2;
  const floors = cleared.slice(0, 5);
  const btnW = 36,
    gap = 6;
  const totalW = floors.length * btnW + (floors.length - 1) * gap;
  const startX = CX - totalW / 2 + btnW / 2;

  floors.forEach((floor, i) => {
    const bx = startX + i * (btnW + gap);
    const btn = scene.add
      .rectangle(bx, PY + 120, btnW, 12, 0x1a1a33)
      .setStrokeStyle(1, 0x4466aa)
      .setScrollFactor(0)
      .setDepth(D)
      .setInteractive();
    scene.add
      .bitmapText(bx, PY + 120, PIXEL_FONT, `F${floor + 1}`, 8)
      .setOrigin(0.5, 0.5)
      .setTint(0x88aaff)
      .setScrollFactor(0)
      .setDepth(D);
    btn.on("pointerover", () => {
      btn.setScale(1.05);
      btn.setStrokeStyle(2, 0xffffff);
    });
    btn.on("pointerout", () => {
      btn.setScale(1.0);
      btn.setStrokeStyle(1, 0x4466aa);
    });
    btn.on("pointerdown", () => onFloorSelect(floor + 1));
  });
}
