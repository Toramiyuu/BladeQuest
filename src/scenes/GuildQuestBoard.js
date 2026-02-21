/**
 * GuildQuestBoard — builds the quest board section of GuildBoardScene.
 * Exported as plain functions that take the Phaser scene as first arg.
 */

import GuildQuestSystem from "../systems/GuildQuestSystem.js";
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

export function buildQuestBoard(scene, PX, PW, PY) {
  const quests = GuildQuestSystem.getActiveQuests();
  const rowH = 22;
  const startY = PY + 141;
  if (!scene._questObjects) scene._questObjects = [];

  for (let i = 0; i < 3; i++) {
    const y = startY + i * rowH;
    const q = quests[i];

    if (!q) {
      scene._questObjects.push(
        bt(scene, PX + 10, y, "— No quest —", 8, 0x444466, 0, 0.5),
      );
      continue;
    }

    const done = GuildQuestSystem.isComplete(q);
    const labelTxt = bt(
      scene,
      PX + 10,
      y,
      `${q.label}  ${q.progress}/${q.required}`,
      8,
      done ? 0x44ff88 : 0xcccccc,
      0,
      0.5,
    );
    scene._questObjects.push(labelTxt);

    if (done) {
      const btn = scene.add
        .rectangle(PX + PW - 46, y, 56, 13, 0x1a3a1a)
        .setStrokeStyle(1, 0x44ff44)
        .setScrollFactor(0)
        .setDepth(D)
        .setInteractive();
      const btnTxt = bt(
        scene,
        PX + PW - 46,
        y,
        "TURN IN",
        8,
        0x44ff44,
        0.5,
        0.5,
      );
      scene._questObjects.push(btn, btnTxt);
      const questId = q.id;
      btn.on("pointerover", () => btn.setStrokeStyle(2, 0xffffff));
      btn.on("pointerout", () => btn.setStrokeStyle(1, 0x44ff44));
      btn.on("pointerdown", () => _turnIn(scene, questId, PX, PW, PY));
    }
  }
}

function _turnIn(scene, questId, PX, PW, PY) {
  const reward = GuildQuestSystem.turnIn(questId);
  if (!reward) return;

  InventorySystem.addGold(reward.gold);
  InventorySystem.saveInventory();

  for (const obj of scene._questObjects ?? []) {
    if (obj?.active) obj.destroy();
  }
  scene._questObjects = [];
  buildQuestBoard(scene, PX, PW, PY);

  scene._sellFeedback?.setText(`+${reward.gold}g reward!`).setTint(0xffcc44);
  scene.time.delayedCall(1800, () => {
    if (scene._sellFeedback?.active) scene._sellFeedback.setText("");
  });
}
