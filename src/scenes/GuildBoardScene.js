import Phaser from "phaser";
import ClassRegistry from "../config/classes.js";
import SaveManager from "../systems/SaveManager.js";
import GuildQuestSystem from "../systems/GuildQuestSystem.js";
import { buildQuestBoard } from "./GuildQuestBoard.js";
import { buildDropTrading } from "./GuildDropTrading.js";
import { buildBossFloors } from "./GuildBossFloors.js";
import { PIXEL_FONT } from "../config/PixelFont.js";

const PX = 50,
  PY = 10,
  PW = 380,
  PH = 250,
  CX = 240;
const D = 2;
const TAB_Y = PY + 131;

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
    GuildQuestSystem.refresh();

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

    bt(this, CX, PY + 6, "GUILD BOARD", 16, 0xaaddff);
    bt(
      this,
      PX + PW - 6,
      PY + 6,
      `Rank: ${GuildQuestSystem.getRank()}`,
      8,
      0xffcc44,
      1,
      0,
    );

    bt(this, CX, PY + 24, "SELECT CLASS", 8, 0xaaaaaa);
    const classes = ClassRegistry.getAllClasses();
    this._selectedId =
      this.registry.get("selectedClassId") || ClassRegistry.getDefault().id;
    this._classCards = classes.map((cls, i) =>
      this._buildClassCard(cls, i, classes.length),
    );

    this._enterBtn = this.add
      .rectangle(CX, PY + 106, 100, 14, 0x1a3a1a)
      .setStrokeStyle(1, 0x44ff44)
      .setScrollFactor(0)
      .setDepth(D)
      .setInteractive();
    bt(this, CX, PY + 106, "ENTER DUNGEON", 8, 0x44ff44, 0.5, 0.5);
    this._enterBtn.on("pointerover", () =>
      this._enterBtn.setScale(1.05).setStrokeStyle(2, 0xffffff),
    );
    this._enterBtn.on("pointerout", () =>
      this._enterBtn.setScale(1.0).setStrokeStyle(1, 0x44ff44),
    );
    this._enterBtn.on("pointerdown", () => this._startDungeon(1));

    this._buildCheckpoints(SaveManager.getClearedFloors());
    this._refreshCards();

    this.add
      .rectangle(CX, PY + 126, PW - 20, 1, 0x334466)
      .setScrollFactor(0)
      .setDepth(D);

    this._buildTabs();

    const qBefore = this.children.list.length;
    buildQuestBoard(this, PX, PW, PY);
    this.add
      .rectangle(CX, PY + 197, PW - 20, 1, 0x334466)
      .setScrollFactor(0)
      .setDepth(D);
    bt(this, PX + 6, PY + 201, "SELL DROPS", 8, 0xffcc44, 0, 0);
    this._sellFeedback = bt(this, CX + 80, PY + 201, "", 8, 0x44ff44, 0, 0);
    buildDropTrading(this, PX, PW, PY);
    this._questTabObjects = this.children.list.slice(qBefore);

    const bBefore = this.children.list.length;
    buildBossFloors(this, PX, PW, PY + 135, SaveManager.getClearedFloors());
    this._bossTabObjects = this.children.list.slice(bBefore);
    for (const obj of this._bossTabObjects) obj.setVisible(false);

    this._activeTab = "quests";

    bt(this, CX, PY + PH - 2, "ESC to close", 8, 0x555555, 0.5, 1);

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

  _buildTabs() {
    const defs = [
      { key: "quests", label: "QUESTS", x: CX - 60 },
      { key: "bosses", label: "BOSS FLOORS", x: CX + 65 },
    ];
    this._tabBtns = {};
    defs.forEach(({ key, label, x }) => {
      const active = key === "quests";
      const btn = this.add
        .rectangle(x, TAB_Y, 90, 10, active ? 0x223355 : 0x111133)
        .setStrokeStyle(active ? 2 : 1, active ? 0x4499ff : 0x334466)
        .setScrollFactor(0)
        .setDepth(D)
        .setInteractive();
      const txt = bt(
        this,
        x,
        TAB_Y,
        label,
        8,
        active ? 0xffffff : 0x888888,
        0.5,
        0.5,
      );
      btn.on("pointerdown", () => this._switchTab(key));
      this._tabBtns[key] = { btn, txt };
    });
  }

  _switchTab(key) {
    if (this._activeTab === key) return;
    this._activeTab = key;

    const showQuests = key === "quests";

    for (const obj of this._questTabObjects) {
      if (obj?.active) obj.setVisible(showQuests);
    }
    for (const obj of this._questObjects ?? []) {
      if (obj?.active) obj.setVisible(showQuests);
    }
    for (const obj of this._bossTabObjects) {
      if (obj?.active) obj.setVisible(!showQuests);
    }

    for (const [k, { btn, txt }] of Object.entries(this._tabBtns)) {
      const active = k === key;
      btn
        .setFillStyle(active ? 0x223355 : 0x111133)
        .setStrokeStyle(active ? 2 : 1, active ? 0x4499ff : 0x334466);
      txt.setTint(active ? 0xffffff : 0x888888);
    }
  }

  _buildClassCard(cls, index, total) {
    const cardW = total > 3 ? 64 : 100;
    const cardH = 55;
    const spacing = total > 3 ? 6 : 16;
    const totalW = total * cardW + (total - 1) * spacing;
    const cx = CX - totalW / 2 + cardW / 2 + index * (cardW + spacing);
    const cy = PY + 60;

    const bg = this.add
      .rectangle(cx, cy, cardW, cardH, 0x111133)
      .setStrokeStyle(1, 0x334466)
      .setScrollFactor(0)
      .setDepth(D)
      .setInteractive();
    bt(this, cx, cy - 20, cls.name, 8, 0xcccccc);
    bt(
      this,
      cx,
      cy + 4,
      `HP:${cls.stats.maxHealth} MP:${cls.stats.maxMana}`,
      8,
      0x7799cc,
    );
    bt(this, cx, cy + 14, cls.ability.id.toUpperCase(), 8, 0x9955ff);

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
      const sel = card.classId === this._selectedId;
      card.bg
        .setFillStyle(sel ? 0x223355 : 0x111133)
        .setStrokeStyle(sel ? 2 : 1, sel ? 0x4499ff : 0x334466);
    }
  }

  _buildCheckpoints(cleared) {
    if (!cleared || cleared.length === 0) return;
    const floors = cleared.slice(0, 5);
    const btnW = 36,
      gap = 6;
    const totalW = floors.length * btnW + (floors.length - 1) * gap;
    const startX = CX - totalW / 2 + btnW / 2;
    floors.forEach((floor, i) => {
      const bx = startX + i * (btnW + gap);
      const btn = this.add
        .rectangle(bx, PY + 120, btnW, 12, 0x1a1a33)
        .setStrokeStyle(1, 0x4466aa)
        .setScrollFactor(0)
        .setDepth(D)
        .setInteractive();
      bt(this, bx, PY + 120, `F${floor + 1}`, 8, 0x88aaff, 0.5, 0.5);
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
