/**
 * GuildTitles — TITLES tab content builder for GuildBoardScene.
 *
 * Displays all 14 titles in a 2-column grid.
 * Earned titles are clickable to equip/unequip.
 * Locked titles show their unlock requirement.
 *
 * Equipping triggers scene.scene.restart() to refresh state cleanly.
 */

import TitleSystem from "../systems/TitleSystem.js";
import { PIXEL_FONT } from "../config/PixelFont.js";

const D = 2;

const TRIGGER_HINTS = {
  quests: (n) => `${n} quests`,
  kills: (n) => `${n} kills`,
  floor: (n) => `floor ${n}`,
  school: (n) => `school rank ${n}`,
};

/**
 * @param {Phaser.Scene} scene
 * @param {number} PX  - panel left x
 * @param {number} PW  - panel width
 * @param {number} PY  - panel top y
 */
export function buildGuildTitles(scene, PX, PW, PY) {
  TitleSystem.checkUnlocks();
  const titles = TitleSystem.getAll();

  const startY = PY + 140;
  const rowH = 15;
  const colW = PW / 2;
  const col1X = PX + colW / 2;
  const col2X = PX + colW + colW / 2;

  for (let i = 0; i < titles.length; i++) {
    const title = titles[i];
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = col === 0 ? col1X : col2X;
    const y = startY + row * rowH;
    const isEquipped = title.equipped;

    if (title.earned) {
      const nameTint = isEquipped ? 0xffdd44 : 0xaaddff;
      const bgColor = isEquipped ? 0x1a2200 : 0x111133;
      const borderColor = isEquipped ? 0xffdd44 : 0x334466;

      const bg = scene.add
        .rectangle(x, y + 4, colW - 10, 13, bgColor)
        .setStrokeStyle(1, borderColor)
        .setScrollFactor(0)
        .setDepth(D)
        .setInteractive();
      scene.add
        .bitmapText(x, y, PIXEL_FONT, title.name, 8)
        .setOrigin(0.5, 0)
        .setTint(nameTint)
        .setScrollFactor(0)
        .setDepth(D + 1);
      scene.add
        .bitmapText(x, y + 7, PIXEL_FONT, title.desc, 6)
        .setOrigin(0.5, 0)
        .setTint(isEquipped ? 0xbbcc88 : 0x667788)
        .setScrollFactor(0)
        .setDepth(D + 1);

      bg.on("pointerover", () =>
        bg.setStrokeStyle(2, isEquipped ? 0xffffff : 0x88aaff),
      );
      bg.on("pointerout", () =>
        bg.setStrokeStyle(1, isEquipped ? 0xffdd44 : 0x334466),
      );
      bg.on("pointerdown", () => {
        TitleSystem.equip(isEquipped ? null : title.id);
        scene.scene.restart();
      });
    } else {
      scene.add
        .bitmapText(x, y, PIXEL_FONT, title.name, 8)
        .setOrigin(0.5, 0)
        .setTint(0x445566)
        .setScrollFactor(0)
        .setDepth(D);
      const hint = TRIGGER_HINTS[title.trigger]?.(title.required) ?? "";
      scene.add
        .bitmapText(x, y + 7, PIXEL_FONT, hint, 6)
        .setOrigin(0.5, 0)
        .setTint(0x2a3a44)
        .setScrollFactor(0)
        .setDepth(D);
    }
  }
}
