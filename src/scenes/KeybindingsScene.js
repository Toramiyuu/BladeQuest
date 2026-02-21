/**
 * KeybindingsScene — semi-transparent overlay showing all keybindings.
 * Launched as a parallel scene (pause-friendly). Close with ESC, H, or F1.
 */
import Phaser from "phaser";
import { PIXEL_FONT } from "../config/PixelFont.js";

const BINDINGS = [
  ["Move Left / Right", "A / D"],
  ["Jump", "W  or  Space"],
  ["Light Attack", "J"],
  ["Heavy Attack", "K"],
  ["Air Attack", "J  (in air)"],
  ["Ability", "E  or  F"],
  ["Potion Slot 1", "1"],
  ["Potion Slot 2", "2"],
  ["Potion Slot 3", "3"],
  ["Dodge Roll", "Shift"],
  ["Interact / Enter", "X"],
  ["Stats Panel", "Tab  or  I"],
  ["Keybindings", "H  or  F1"],
  ["Close / Back", "Esc"],
];

const PX = 80,
  PY = 20,
  PW = 320,
  PH = 230,
  CX = 240;
const D = 5;

export default class KeybindingsScene extends Phaser.Scene {
  constructor() {
    super({ key: "KeybindingsScene" });
  }

  create() {
    this.add
      .rectangle(0, 0, 480, 270, 0x000000, 0.7)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(D - 1);

    this.add
      .rectangle(CX, PY + PH / 2, PW + 6, PH + 6)
      .setStrokeStyle(1, 0x223344)
      .setFillStyle()
      .setScrollFactor(0)
      .setDepth(D);
    this.add
      .rectangle(CX, PY + PH / 2, PW, PH, 0x08080f)
      .setStrokeStyle(2, 0x4466aa)
      .setScrollFactor(0)
      .setDepth(D);

    this.add
      .bitmapText(CX, PY + 8, PIXEL_FONT, "CONTROLS", 16)
      .setOrigin(0.5, 0)
      .setTint(0xaaddff)
      .setScrollFactor(0)
      .setDepth(D + 1);

    const col1 = PX + 12,
      col2 = PX + PW - 12;
    const headerY = PY + 28;
    this.add
      .bitmapText(col1, headerY, PIXEL_FONT, "ACTION", 8)
      .setOrigin(0, 0)
      .setTint(0x888888)
      .setScrollFactor(0)
      .setDepth(D + 1);
    this.add
      .bitmapText(col2, headerY, PIXEL_FONT, "KEY", 8)
      .setOrigin(1, 0)
      .setTint(0x888888)
      .setScrollFactor(0)
      .setDepth(D + 1);

    this.add
      .rectangle(CX, headerY + 12, PW - 16, 1, 0x334466)
      .setScrollFactor(0)
      .setDepth(D + 1);

    const rowH = 14;
    const startY = headerY + 18;
    BINDINGS.forEach(([action, key], i) => {
      const y = startY + i * rowH;
      const tint = i % 2 === 0 ? 0xcccccc : 0xaaaaaa;
      this.add
        .bitmapText(col1, y, PIXEL_FONT, action, 8)
        .setOrigin(0, 0)
        .setTint(tint)
        .setScrollFactor(0)
        .setDepth(D + 1);
      this.add
        .bitmapText(col2, y, PIXEL_FONT, key, 8)
        .setOrigin(1, 0)
        .setTint(0xffdd88)
        .setScrollFactor(0)
        .setDepth(D + 1);
    });

    this.add
      .bitmapText(CX, PY + PH - 4, PIXEL_FONT, "ESC / H / F1 to close", 8)
      .setOrigin(0.5, 1)
      .setTint(0x555555)
      .setScrollFactor(0)
      .setDepth(D + 1);

    const all = this.children.list.slice(1);
    all.forEach((c) => (c.y += 16));
    this.tweens.add({
      targets: all,
      y: "-=16",
      duration: 180,
      ease: "Quad.easeOut",
    });
    this.cameras.main.fadeIn(150, 0, 0, 0);

    const closeKeys = [
      this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC),
      this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.H),
      this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F1),
    ];
    this.input.keyboard.on("keydown", (e) => {
      if (
        e.keyCode === Phaser.Input.Keyboard.KeyCodes.ESC ||
        e.keyCode === Phaser.Input.Keyboard.KeyCodes.H ||
        e.keyCode === Phaser.Input.Keyboard.KeyCodes.F1
      ) {
        this._close();
      }
    });
    void closeKeys;
    this.input.on("pointerdown", () => this._close());
  }

  _close() {
    if (this._closing) return;
    this._closing = true;
    this.cameras.main.fadeOut(150, 0, 0, 0);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      this.scene.stop("KeybindingsScene");
    });
  }
}
