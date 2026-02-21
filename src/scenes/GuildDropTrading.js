/**
 * GuildDropTrading — builds the drop-selling section of GuildBoardScene.
 */

import InventorySystem from "../systems/InventorySystem.js";
import { PIXEL_FONT } from "../config/PixelFont.js";

const D = 2;
const SELL_PRICES = { bones: 5, crystals: 15, essence: 30 };

function bt(scene, x, y, str, size, tint, ox = 0.5, oy = 0) {
  return scene.add
    .bitmapText(x, y, PIXEL_FONT, str, size)
    .setOrigin(ox, oy)
    .setTint(tint)
    .setScrollFactor(0)
    .setDepth(D);
}

export function buildDropTrading(scene, PX, PW, PY) {
  const materials = InventorySystem.getInventory().materials;
  const types = ["bones", "crystals", "essence"];
  const colW = (PW - 20) / 3;

  types.forEach((type, i) => {
    const x = PX + 10 + i * colW + colW / 2;
    const y = PY + 215;
    const held = materials[type] ?? 0;
    const price = SELL_PRICES[type];
    const canSell = held > 0;

    bt(
      scene,
      x,
      y - 8,
      `${type} x${held}`,
      8,
      canSell ? 0xcccccc : 0x555566,
      0.5,
      0.5,
    );
    bt(scene, x, y + 4, `${price}g ea`, 8, 0xffcc44, 0.5, 0.5);

    const btn = scene.add
      .rectangle(x, y + 16, colW - 12, 12, canSell ? 0x1a2a1a : 0x111122)
      .setStrokeStyle(1, canSell ? 0x44aa44 : 0x333344)
      .setScrollFactor(0)
      .setDepth(D);
    const btnLbl = bt(
      scene,
      x,
      y + 16,
      "SELL ALL",
      8,
      canSell ? 0x88cc88 : 0x444455,
      0.5,
      0.5,
    );

    if (!canSell) return;

    btn.setInteractive();
    btn.on("pointerover", () => btn.setStrokeStyle(2, 0xffffff));
    btn.on("pointerout", () => btn.setStrokeStyle(1, 0x44aa44));
    btn.on("pointerdown", () => {
      const current = InventorySystem.getInventory().materials[type] ?? 0;
      if (current <= 0) return;
      const earned = current * price;
      InventorySystem.spendMaterial(type, current);
      InventorySystem.addGold(earned);
      InventorySystem.saveInventory();
      btnLbl.setText("SOLD!");
      btn
        .setFillStyle(0x111122)
        .setStrokeStyle(1, 0x333344)
        .removeInteractive();
      scene._sellFeedback?.setText(`+${earned}g`).setTint(0xffcc44);
      scene.time.delayedCall(1800, () => {
        if (scene._sellFeedback?.active) scene._sellFeedback.setText("");
      });
    });
  });
}
