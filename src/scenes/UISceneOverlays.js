/**
 * UISceneOverlays — modal/toast overlay methods mixed into UIScene prototype.
 *
 * Handles: save confirmation toast, future stats panel, keybinding help.
 * Applied via Object.assign(UIScene.prototype, UISceneOverlaysMixin).
 */

import Phaser from "phaser";
import { GAME_WIDTH, GAME_HEIGHT } from "../config/constants.js";
import { PIXEL_FONT } from "../config/PixelFont.js";
const TOAST_DURATION = 2000;
const TOAST_SLIDE = 14;

const HELP_ROWS = [
  { cat: "Movement" },
  { action: "Walk Left / Right", key: "<- -> / A D" },
  { action: "Jump", key: "Z / Space" },
  { action: "Dash", key: "Shift" },
  { cat: "Combat" },
  { action: "Attack (3-hit combo)", key: "X" },
  { action: "Air Downslash", key: "X (airborne)" },
  { action: "Parry", key: "C" },
  { cat: "Abilities" },
  { action: "Spin Attack", key: "C + <- ->" },
  { action: "Blade Beam", key: "C + ^" },
  { cat: "Items" },
  { action: "Use Potion Slot 1 / 2 / 3", key: "1  2  3" },
  { cat: "UI" },
  { action: "Stats Panel", key: "TAB / I" },
  { action: "Help Screen", key: "H / F1" },
  { action: "Pause", key: "Esc / P" },
];

export const UISceneOverlaysMixin = {
  _initHelpKeys() {
    const kH = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.H);
    const kF1 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F1);
    const kEsc = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    kH.on("down", () => this._toggleHelpScreen());
    kF1.on("down", () => this._toggleHelpScreen());
    kEsc.on("down", () => {
      if (this._helpVisible) this._hideHelpScreen();
    });
  },

  _toggleHelpScreen() {
    if (this._helpVisible) {
      this._hideHelpScreen();
    } else {
      this._showHelpScreen();
    }
  },

  _showHelpScreen() {
    if (this._helpVisible) return;
    this._helpVisible = true;

    const panelW = 340,
      panelH = 220;
    const cx = GAME_WIDTH / 2,
      cy = GAME_HEIGHT / 2;

    this._helpObjects = [];

    const bg = this.add
      .rectangle(cx, cy, panelW, panelH, 0x0a0a1a, 0.93)
      .setScrollFactor(0)
      .setDepth(300);
    this._helpObjects.push(bg);

    const border = this.add
      .rectangle(cx, cy, panelW, panelH)
      .setStrokeStyle(1, 0x445566)
      .setFillStyle()
      .setScrollFactor(0)
      .setDepth(301);
    this._helpObjects.push(border);

    const title = this.add
      .bitmapText(
        cx,
        cy - panelH / 2 + 10,
        PIXEL_FONT,
        "CONTROLS   [H / F1 to close]",
        8,
      )
      .setOrigin(0.5, 0)
      .setTint(0xaaccff)
      .setScrollFactor(0)
      .setDepth(302);
    this._helpObjects.push(title);

    let row = cy - panelH / 2 + 26;
    const colL = cx - panelW / 2 + 14;
    const colR = cx + 50;
    const rowH = 11;

    for (const r of HELP_ROWS) {
      if (r.cat) {
        const catTxt = this.add
          .bitmapText(colL, row, PIXEL_FONT, r.cat.toUpperCase(), 8)
          .setTint(0xffcc44)
          .setScrollFactor(0)
          .setDepth(302);
        this._helpObjects.push(catTxt);
        row += rowH + 1;
      } else {
        const actionTxt = this.add
          .bitmapText(colL, row, PIXEL_FONT, r.action, 8)
          .setTint(0xccddee)
          .setScrollFactor(0)
          .setDepth(302);
        const keyTxt = this.add
          .bitmapText(colR, row, PIXEL_FONT, r.key, 8)
          .setTint(0xffffff)
          .setScrollFactor(0)
          .setDepth(302);
        this._helpObjects.push(actionTxt, keyTxt);
        row += rowH;
      }
    }
  },

  _hideHelpScreen() {
    if (!this._helpVisible) return;
    this._helpVisible = false;
    this._helpObjects?.forEach((o) => o.destroy());
    this._helpObjects = [];
  },

  _onSaveComplete() {
    this._showSaveToast(true);
  },

  _onSaveFailed() {
    this._showSaveToast(false);
  },

  /**
   * Shows a non-intrusive toast in the bottom-right corner.
   * Debounced: cancels any in-flight toast before starting a new one.
   */
  _showSaveToast(success) {
    if (this._saveToastTween) {
      this._saveToastTween.stop();
      this._saveToastTween = null;
    }
    if (this._saveToastBg) {
      this._saveToastBg.destroy();
      this._saveToastBg = null;
    }
    if (this._saveToastText) {
      this._saveToastText.destroy();
      this._saveToastText = null;
    }

    const label = success ? "+ Progress Saved" : "! Save Failed";
    const bgColor = success ? 0x113311 : 0x331111;
    const textColor = success ? 0x88ff88 : 0xff8888;

    const toastW = 110,
      toastH = 18;
    const toastX = GAME_WIDTH - toastW - 4;
    const toastY = GAME_HEIGHT - toastH - 4;
    const startY = toastY + TOAST_SLIDE;

    this._saveToastBg = this.add
      .rectangle(toastX, startY, toastW, toastH, bgColor, 0.85)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(200)
      .setAlpha(0);

    this._saveToastText = this.add
      .bitmapText(
        toastX + toastW / 2,
        startY + toastH / 2,
        PIXEL_FONT,
        label,
        8,
      )
      .setOrigin(0.5, 0.5)
      .setTint(textColor)
      .setScrollFactor(0)
      .setDepth(201)
      .setAlpha(0);

    this.tweens.add({
      targets: [this._saveToastBg, this._saveToastText],
      y: `-=${TOAST_SLIDE}`,
      alpha: 1,
      duration: 180,
      ease: "Quad.easeOut",
      onComplete: () => {
        this._saveToastTween = this.tweens.add({
          targets: [this._saveToastBg, this._saveToastText],
          alpha: 0,
          delay: TOAST_DURATION,
          duration: 300,
          ease: "Quad.easeIn",
          onComplete: () => {
            this._saveToastBg?.destroy();
            this._saveToastText?.destroy();
            this._saveToastBg = null;
            this._saveToastText = null;
            this._saveToastTween = null;
          },
        });
      },
    });
  },
};
