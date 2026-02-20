import Phaser from "phaser";
import InventorySystem from "../systems/InventorySystem.js";
import { buildLoadoutColumn, buildPicker } from "./PotionLoadoutBuilder.js";
import { PIXEL_FONT } from "../config/PixelFont.js";

const PX = 70,
  PY = 45,
  PW = 340,
  PH = 180,
  CX = PX + PW / 2;
const D = 2;

const POTIONS = [
  {
    type: "health",
    icon: "item-01",
    name: "Health Potion",
    cost: 10,
    desc: "Restores 2 HP",
  },
  {
    type: "speed",
    icon: "item-05",
    name: "Speed Potion",
    cost: 12,
    desc: "+50% speed 10s",
  },
  {
    type: "strength",
    icon: "item-10",
    name: "Strength Potion",
    cost: 15,
    desc: "+1 dmg 10s",
  },
];

function bt(scene, x, y, str, size, tint, ox = 0.5, oy = 0) {
  return scene.add
    .bitmapText(x, y, PIXEL_FONT, str, size)
    .setOrigin(ox, oy)
    .setTint(tint)
    .setScrollFactor(0)
    .setDepth(D);
}

export default class PotionShopScene extends Phaser.Scene {
  constructor() {
    super({ key: "PotionShopScene" });
  }

  create() {
    this.add
      .rectangle(0, 0, 480, 270, 0x000000, 0.7)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(0);
    this.add
      .rectangle(CX, PY + PH / 2, PW + 6, PH + 6)
      .setStrokeStyle(1, 0x223344)
      .setFillStyle()
      .setScrollFactor(0)
      .setDepth(1);
    this.add
      .rectangle(CX, PY + PH / 2, PW, PH, 0x0d1a0d)
      .setStrokeStyle(2, 0x448844)
      .setScrollFactor(0)
      .setDepth(1);
    this.add
      .rectangle(CX + 10, PY + PH / 2, 1, PH - 20, 0x444444)
      .setScrollFactor(0)
      .setDepth(D);

    bt(this, CX, PY + 6, "POTION SHOP", 16, 0x88ff88);
    bt(this, CX - 60, PY + 20, "SHOP", 8, 0xcccccc);
    bt(this, CX + 70, PY + 20, "LOADOUT", 8, 0xcccccc);
    bt(this, CX, PY + PH - 1, "ESC to close", 8, 0x555555, 0.5, 1);

    this._goldText = bt(
      this,
      PX + PW - 6,
      PY + 6,
      "Gold: 0",
      8,
      0xffdd44,
      1,
      0,
    );
    this._feedbackText = bt(this, CX, PY + PH - 7, "", 8, 0xff4444, 0.5, 1);

    this._pickerSlot = null;
    this._shopRows = this._buildShopColumn();
    this._loadoutSlots = buildLoadoutColumn(this, POTIONS, PY, CX);
    const picker = buildPicker(this, POTIONS, PY, CX);
    this._pickerBg = picker.pickerBg;
    this._pickerItems = picker.pickerItems;
    this._pickerCancel = picker.pickerCancel;
    this._pickerCancelTxt = picker.pickerCancelTxt;
    this._refresh();

    this.input.keyboard.on("keydown-ESC", () => this._close());
    this.input.on("pointerdown", (ptr) => {
      const gx = ptr.x / (this.scale.width / 480);
      const gy = ptr.y / (this.scale.height / 270);
      if (gx < PX || gx > PX + PW || gy < PY || gy > PY + PH) this._close();
    });

    const panelChildren = this.children.list.slice(1);
    panelChildren.forEach((c) => (c.y += 20));
    this.tweens.add({
      targets: panelChildren,
      y: "-=20",
      duration: 200,
      ease: "Quad.easeOut",
    });

    this.cameras.main.fadeIn(200, 0, 0, 0);
  }

  _buildShopColumn() {
    return POTIONS.map((p, i) => {
      const ry = PY + 34 + i * 40;
      this.add
        .image(PX + 30, ry, p.icon)
        .setDisplaySize(16, 16)
        .setScrollFactor(0)
        .setDepth(D);
      bt(this, PX + 45, ry - 6, p.name, 8, 0xcccccc, 0, 0);
      bt(this, PX + 45, ry + 3, p.desc, 8, 0x888888, 0, 0);
      bt(this, PX + 45, ry + 12, `${p.cost}g`, 8, 0xffdd44, 0, 0);
      const countTxt = bt(this, PX + 100, ry - 6, "x0", 8, 0xaaaaaa, 0, 0);
      const btn = this.add
        .rectangle(PX + 130, ry, 30, 12, 0x224422)
        .setStrokeStyle(1, 0x44ff44)
        .setScrollFactor(0)
        .setDepth(D)
        .setInteractive();
      const btnTxt = bt(this, PX + 130, ry, "BUY", 8, 0x44ff44, 0.5, 0.5);
      btn.on("pointerover", () => {
        btn.setScale(1.05);
        btn.setStrokeStyle(2, 0xffffff);
      });
      btn.on("pointerout", () => {
        btn.setScale(1.0);
        btn.setStrokeStyle(1, 0x44ff44);
      });
      btn.on("pointerdown", () => {
        if (!InventorySystem.buyPotion(p.type)) {
          const inv = InventorySystem.getInventory();
          this._showFeedback(
            inv.gold < p.cost ? "Not enough gold" : "Max stock reached",
          );
        }
        this._refresh();
      });
      return { countTxt, btn, btnTxt };
    });
  }

  _openPicker(slot) {
    this._pickerSlot = slot;
    this._pickerBg.setVisible(true);
    for (const pi of this._pickerItems) {
      pi.row.setVisible(true);
      pi.rowTxt.setVisible(true);
    }
    this._pickerCancel.setVisible(true);
    this._pickerCancelTxt.setVisible(true);
  }

  _closePicker() {
    this._pickerSlot = null;
    this._pickerBg.setVisible(false);
    for (const pi of this._pickerItems) {
      pi.row.setVisible(false);
      pi.rowTxt.setVisible(false);
    }
    this._pickerCancel.setVisible(false);
    this._pickerCancelTxt.setVisible(false);
  }

  _refresh() {
    const inv = InventorySystem.getInventory();
    this._goldText.setText(`Gold: ${inv.gold}`);
    POTIONS.forEach((p, i) => {
      const count = inv.potionCounts[p.type] ?? 0;
      this._shopRows[i].countTxt.setText(`x${count}`);
      const can = inv.gold >= p.cost && count < 5;
      this._shopRows[i].btn.setFillStyle(can ? 0x224422 : 0x333333);
      this._shopRows[i].btnTxt.setTint(can ? 0x44ff44 : 0x666666);
    });
    this._loadoutSlots.forEach((s) => {
      const type = inv.potionLoadout[s.slot];
      if (type) {
        const p = POTIONS.find((x) => x.type === type);
        s.icon.setTexture(p?.icon ?? "item-01").setVisible(true);
        s.emptyBox.setVisible(false);
        s.typeTxt.setText(p?.name ?? type);
        s.countTxt.setText(`x${inv.potionCounts[type] ?? 0}`);
      } else {
        s.icon.setVisible(false);
        s.emptyBox.setVisible(true);
        s.typeTxt.setText("(empty)");
        s.countTxt.setText("");
      }
    });
  }

  _showFeedback(msg) {
    this._feedbackText.setText(msg);
    if (this._feedbackTimer) this._feedbackTimer.remove();
    this._feedbackTimer = this.time.delayedCall(1500, () =>
      this._feedbackText.setText(""),
    );
  }

  _close() {
    if (this._closing) return;
    this._closing = true;
    this.cameras.main.fadeOut(200, 0, 0, 0);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      const hub = this.scene.get("HubScene");
      if (hub) hub.resumeFromFacility();
      this.scene.stop("PotionShopScene");
    });
  }
}
