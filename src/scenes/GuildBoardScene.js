import Phaser from "phaser";
import ClassRegistry from "../config/classes.js";
import SaveManager from "../systems/SaveManager.js";
import { PIXEL_FONT } from "../config/PixelFont.js";

const PX = 70,
  PY = 45,
  PW = 340,
  PH = 180,
  CX = PX + PW / 2;
const D = 2;
const RANKS = ["F", "E", "D", "C", "B", "A"];

function rank(floor) {
  return RANKS[Math.min(Math.floor(floor / 10), RANKS.length - 1)];
}

function bt(scene, x, y, str, size, tint, ox = 0.5, oy = 0) {
  return scene.add
    .bitmapText(x, y, PIXEL_FONT, str, size)
    .setOrigin(ox, oy)
    .setTint(tint)
    .setScrollFactor(0)
    .setDepth(D);
}

export default class GuildBoardScene extends Phaser.Scene {
  constructor() {
    super({ key: "GuildBoardScene" });
  }

  create() {
    this.add
      .rectangle(0, 0, 480, 270, 0x000000, 0.75)
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
      .rectangle(CX, PY + PH / 2, PW, PH, 0x0d0d22)
      .setStrokeStyle(2, 0x4466aa)
      .setScrollFactor(0)
      .setDepth(1);

    const save = SaveManager.load();
    const highest = save.highestFloor ?? 0;
    bt(this, CX, PY + 6, "GUILD BOARD", 16, 0xaaddff);
    bt(this, PX + PW - 6, PY + 6, `Rank: ${rank(highest)}`, 8, 0xffcc44, 1, 0);
    this._feedbackText = bt(this, CX, PY + PH - 7, "", 8, 0xff4444, 0.5, 1);
    bt(this, CX, PY + PH - 1, "ESC to close", 8, 0x555555, 0.5, 1);

    bt(this, CX, PY + 20, "SELECT CLASS", 8, 0xaaaaaa);
    const classes = ClassRegistry.getAllClasses();
    const selectedId =
      this.registry.get("selectedClassId") || ClassRegistry.getDefault().id;
    this._selectedId = selectedId;
    this._classCards = classes.map((cls, i) =>
      this._buildClassCard(cls, i, classes.length),
    );

    this._enterBtn = this.add
      .rectangle(CX, PY + 118, 100, 14, 0x1a3a1a)
      .setStrokeStyle(1, 0x44ff44)
      .setScrollFactor(0)
      .setDepth(D)
      .setInteractive();
    this._enterTxt = bt(
      this,
      CX,
      PY + 118,
      "ENTER DUNGEON",
      8,
      0x44ff44,
      0.5,
      0.5,
    );
    this._enterBtn.on("pointerover", () => {
      this._enterBtn.setScale(1.05);
      this._enterBtn.setStrokeStyle(2, 0xffffff);
    });
    this._enterBtn.on("pointerout", () => {
      this._enterBtn.setScale(1.0);
      this._enterBtn.setStrokeStyle(1, 0x44ff44);
    });
    this._enterBtn.on("pointerdown", () => this._startDungeon(1));

    this._buildCheckpoints(SaveManager.getClearedFloors());
    this._refreshCards();

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

  _buildClassCard(cls, index, total) {
    const cardW = 130,
      cardH = 65;
    const spacing = 20;
    const totalW = total * cardW + (total - 1) * spacing;
    const startX = CX - totalW / 2 + cardW / 2;
    const cx = startX + index * (cardW + spacing);
    const cy = PY + 68;

    const bg = this.add
      .rectangle(cx, cy, cardW, cardH, 0x111133)
      .setStrokeStyle(1, 0x334466)
      .setScrollFactor(0)
      .setDepth(D)
      .setInteractive();
    bt(this, cx, cy - 22, cls.name, 8, 0xcccccc);
    bt(
      this,
      cx,
      cy + 8,
      `HP: ${cls.stats.maxHealth}  MP: ${cls.stats.maxMana}`,
      8,
      0x7799cc,
    );
    bt(this, cx, cy + 18, cls.ability.id.toUpperCase(), 8, 0x9955ff);

    bg.on("pointerover", () => {
      bg.setScale(1.05);
      bg.setStrokeStyle(2, 0xffffff);
    });
    bg.on("pointerout", () => {
      bg.setScale(1.0);
      this._refreshCards();
    });
    bg.on("pointerdown", () => {
      this._selectedId = cls.id;
      this.registry.set("selectedClassId", cls.id);
      this._refreshCards();
    });

    return { bg, classId: cls.id };
  }

  _refreshCards() {
    for (const card of this._classCards) {
      const selected = card.classId === this._selectedId;
      card.bg
        .setFillStyle(selected ? 0x223355 : 0x111133)
        .setStrokeStyle(selected ? 2 : 1, selected ? 0x4499ff : 0x334466);
    }
  }

  _buildCheckpoints(cleared) {
    if (!cleared || cleared.length === 0) return;
    bt(this, CX, PY + 135, "CHECKPOINTS:", 8, 0x888888);
    const floors = cleared.slice(0, 5);
    const btnW = 40,
      gap = 8;
    const totalW = floors.length * btnW + (floors.length - 1) * gap;
    const startX = CX - totalW / 2 + btnW / 2;
    floors.forEach((floor, i) => {
      const bx = startX + i * (btnW + gap);
      const btn = this.add
        .rectangle(bx, PY + 147, btnW, 12, 0x1a1a33)
        .setStrokeStyle(1, 0x4466aa)
        .setScrollFactor(0)
        .setDepth(D)
        .setInteractive();
      bt(this, bx, PY + 147, `F${floor + 1}`, 8, 0x88aaff, 0.5, 0.5);
      btn.on("pointerover", () => {
        btn.setScale(1.05);
        btn.setStrokeStyle(2, 0xffffff);
      });
      btn.on("pointerout", () => {
        btn.setScale(1.0);
        btn.setStrokeStyle(1, 0x4466aa);
      });
      btn.on("pointerdown", () => this._startDungeon(floor + 1));
    });
  }

  _startDungeon(floor) {
    if (this._closing) return;
    this._closing = true;
    const classId = this._selectedId || ClassRegistry.getDefault().id;
    this.registry.set("selectedClassId", classId);
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      this.scene.stop("GuildBoardScene");
      this.scene.stop("HubScene");
      this.scene.start("DungeonScene", { classId, startFloor: floor });
    });
  }

  _close() {
    if (this._closing) return;
    this._closing = true;
    this.cameras.main.fadeOut(200, 0, 0, 0);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      const hub = this.scene.get("HubScene");
      if (hub) hub.resumeFromFacility();
      this.scene.stop("GuildBoardScene");
    });
  }
}
