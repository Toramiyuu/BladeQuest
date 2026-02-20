/**
 * PotionLoadoutBuilder — builds and manages the loadout + picker columns
 * for PotionShopScene. Receives the scene as `ctx` so it can call ctx.add.*.
 */

import InventorySystem from "../systems/InventorySystem.js";
import { PIXEL_FONT } from "../config/PixelFont.js";

const D = 2;

function bt(scene, x, y, str, size, tint, ox = 0.5, oy = 0) {
  return scene.add
    .bitmapText(x, y, PIXEL_FONT, str, size)
    .setOrigin(ox, oy)
    .setTint(tint)
    .setScrollFactor(0)
    .setDepth(D);
}

export function buildLoadoutColumn(ctx, POTIONS, PY, CX) {
  return [0, 1, 2].map((slot) => {
    const sy = PY + 40 + slot * 40;
    bt(ctx, CX + 30, sy - 8, `Slot ${slot + 1}`, 8, 0x888888);
    const icon = ctx.add
      .image(CX + 30, sy + 6, "item-01")
      .setDisplaySize(16, 16)
      .setScrollFactor(0)
      .setDepth(D)
      .setVisible(false);
    const emptyBox = ctx.add
      .rectangle(CX + 30, sy + 6, 16, 16, 0x222222)
      .setStrokeStyle(1, 0x555555)
      .setScrollFactor(0)
      .setDepth(D);
    const typeTxt = bt(ctx, CX + 42, sy, "", 8, 0xaaaaaa, 0, 0);
    const countTxt = bt(ctx, CX + 42, sy + 8, "", 8, 0x888888, 0, 0);
    const slotHit = ctx.add
      .rectangle(CX + 30, sy + 6, 90, 20, 0x000000, 0)
      .setScrollFactor(0)
      .setDepth(D + 1)
      .setInteractive()
      .on("pointerdown", () => ctx._openPicker(slot))
      .on("pointerover", () => {
        slotHit.setScale(1.05);
        emptyBox.setStrokeStyle(2, 0xffffff);
      })
      .on("pointerout", () => {
        slotHit.setScale(1.0);
        emptyBox.setStrokeStyle(1, 0x555555);
      });
    return { slot, icon, emptyBox, typeTxt, countTxt };
  });
}

export function buildPicker(ctx, POTIONS, PY, CX) {
  const pickerBg = ctx.add
    .rectangle(CX + 30, PY + 90, 100, 80, 0x111122)
    .setStrokeStyle(1, 0xaaaaaa)
    .setScrollFactor(0)
    .setDepth(D + 2)
    .setVisible(false);
  const pickerItems = POTIONS.map((p, i) => {
    const py = PY + 75 + i * 22;
    const row = ctx.add
      .rectangle(CX + 30, py, 90, 18, 0x223322)
      .setScrollFactor(0)
      .setDepth(D + 3)
      .setVisible(false)
      .setInteractive();
    const rowTxt = bt(ctx, CX + 30, py, p.name, 8, 0xcccccc)
      .setDepth(D + 4)
      .setVisible(false);
    row.on("pointerdown", () => {
      if (ctx._pickerSlot !== null)
        InventorySystem.setLoadoutSlot(ctx._pickerSlot, p.type);
      ctx._closePicker();
      ctx._refresh();
    });
    return { row, rowTxt };
  });
  const cy = PY + 75 + POTIONS.length * 22;
  const pickerCancel = ctx.add
    .rectangle(CX + 30, cy, 90, 18, 0x332222)
    .setScrollFactor(0)
    .setDepth(D + 3)
    .setVisible(false)
    .setInteractive();
  const pickerCancelTxt = bt(ctx, CX + 30, cy, "Clear Slot", 8, 0xff8888)
    .setDepth(D + 4)
    .setVisible(false);
  pickerCancel.on("pointerdown", () => {
    if (ctx._pickerSlot !== null)
      InventorySystem.setLoadoutSlot(ctx._pickerSlot, null);
    ctx._closePicker();
    ctx._refresh();
  });
  return { pickerBg, pickerItems, pickerCancel, pickerCancelTxt };
}
