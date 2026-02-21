import Phaser from "phaser";
import InventorySystem from "../systems/InventorySystem.js";
import { PIXEL_FONT } from "../config/PixelFont.js";

const PX = 70,
  PY = 45,
  PW = 340,
  PH = 180,
  CX = PX + PW / 2;
const D = 2;

const SECTIONS = [
  {
    label: "WEAPON",
    stateKey: "weaponTier",
    upgradeMethod: "upgradeWeapon",
    affordMethod: "weapon",
    tiers: [
      { icon: "weapon-01", name: "Iron Blade" },
      { icon: "weapon-10", name: "Tempered Blade", cost: "20g + 5 bones" },
      {
        icon: "weapon-20",
        name: "Flame Blade",
        cost: "50g + 10 bones + 3 crystals",
      },
      { icon: "weapon-30", name: "Void Edge", cost: "500g + 3 essence" },
    ],
    iconXs: [150, 210, 270, 330],
    sectionY: 20,
  },
  {
    label: "ARMOR",
    stateKey: "armorTier",
    upgradeMethod: "upgradeArmor",
    affordMethod: "armor",
    tiers: [
      { icon: "armor-01", name: "Leather Armor" },
      { icon: "armor-10", name: "Chain Mail", cost: "15g + 8 bones" },
      { icon: "armor-20", name: "Knight Plate", cost: "300g + 4 crystals" },
      { icon: "armor-30", name: "Sacred Armor", cost: "600g + 2 essence" },
    ],
    iconXs: [150, 210, 270, 330],
    sectionY: 100,
  },
];

/** Add a bitmap text object (always crisp — rendered from texture atlas). */
function btxt(scene, x, y, str, size, tint, originX = 0.5, originY = 0) {
  return scene.add
    .bitmapText(x, y, PIXEL_FONT, str, size)
    .setOrigin(originX, originY)
    .setTint(tint)
    .setScrollFactor(0)
    .setDepth(D);
}

export default class BlacksmithScene extends Phaser.Scene {
  constructor() {
    super({ key: "BlacksmithScene" });
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
      .rectangle(CX, PY + PH / 2, PW, PH, 0x1a1a2e)
      .setStrokeStyle(2, 0x888888)
      .setScrollFactor(0)
      .setDepth(1);

    btxt(this, CX, PY + 6, "BLACKSMITH", 16, 0xffcc44);
    this._goldText = btxt(
      this,
      PX + PW - 6,
      PY + 6,
      "Gold: 0",
      8,
      0xffdd44,
      1,
      0,
    );
    this._feedbackText = btxt(this, CX, PY + PH - 14, "", 8, 0xff4444, 0.5, 0);
    btxt(this, CX, PY + PH - 6, "ESC to close", 8, 0x555555, 0.5, 0);

    this._sections = SECTIONS.map((cfg) => this._buildSection(cfg));
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

  _buildSection(cfg) {
    const sy = PY + cfg.sectionY;

    btxt(this, CX, sy, cfg.label, 8, 0xcccccc);

    const icons = [];
    for (let i = 0; i < cfg.tiers.length; i++) {
      icons.push(
        this.add
          .image(cfg.iconXs[i], sy + 20, cfg.tiers[i].icon)
          .setDisplaySize(18, 18)
          .setScrollFactor(0)
          .setDepth(D),
      );
    }

    const tierNameTxt = btxt(this, CX, sy + 36, "", 8, 0xffcc44);
    const costTxt = btxt(this, CX, sy + 50, "", 8, 0xddbb44);

    const btnX = CX;
    const btnY = sy + 64;
    const btn = this.add
      .rectangle(btnX, btnY, 100, 14, 0x336633)
      .setStrokeStyle(1, 0x44ff44)
      .setScrollFactor(0)
      .setDepth(D)
      .setVisible(false)
      .setInteractive();
    const btnTxt = this.add
      .bitmapText(btnX, btnY, PIXEL_FONT, "UPGRADE", 8)
      .setOrigin(0.5, 0.5)
      .setTint(0x44ff44)
      .setScrollFactor(0)
      .setDepth(D + 1)
      .setVisible(false);

    btn.on("pointerover", () => {
      btn.setScale(1.05);
      btn.setStrokeStyle(2, 0xffffff);
    });
    btn.on("pointerout", () => {
      btn.setScale(1.0);
      btn.setStrokeStyle(1, 0x44ff44);
    });
    btn.on("pointerdown", () => {
      const ok = InventorySystem[cfg.upgradeMethod]();
      if (!ok) this._showFeedback("Not enough resources");
      this._refresh();
    });

    return { cfg, icons, tierNameTxt, costTxt, btn, btnTxt };
  }

  _refresh() {
    const inv = InventorySystem.getInventory();
    this._goldText.setText(`Gold: ${inv.gold}`);

    for (const s of this._sections) {
      const tier = inv[s.cfg.stateKey];

      for (let i = 0; i < s.cfg.tiers.length; i++) {
        if (i === tier) s.icons[i].setTint(0xffcc44);
        else if (i < tier) s.icons[i].setTint(0x555555);
        else s.icons[i].clearTint();
      }

      s.tierNameTxt.setText(s.cfg.tiers[tier].name).setX(s.cfg.iconXs[tier]);

      const next = tier + 1;
      if (next < s.cfg.tiers.length) {
        s.costTxt.setText(s.cfg.tiers[next].cost ?? "");
        const can = InventorySystem.canAffordUpgrade(s.cfg.affordMethod, tier);
        s.btn.setVisible(true).setFillStyle(can ? 0x336633 : 0x553333);
        s.btnTxt.setVisible(true).setTint(can ? 0x44ff44 : 0xaa4444);
      } else {
        s.costTxt.setText("MAX TIER");
        s.btn.setVisible(false);
        s.btnTxt.setVisible(false);
      }
    }
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
      this.scene.stop("BlacksmithScene");
    });
  }
}
