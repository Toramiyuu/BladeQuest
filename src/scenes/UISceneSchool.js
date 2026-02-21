/**
 * UISceneSchool — Combat School HUD methods mixed into UIScene.
 *
 * Displays school name, rank, and XP progress bar at bottom-left.
 * Shows a "RANK UP!" notification when Style XP crosses a threshold.
 *
 * Applied via Object.assign(UIScene.prototype, UISceneSchoolMixin).
 */

import { PIXEL_FONT } from "../config/PixelFont.js";
import SchoolSystem from "../systems/SchoolSystem.js";

export const UISceneSchoolMixin = {
  /** School name + rank label + XP bar at bottom-left of screen. */
  _createSchoolHUD() {
    const BAR_X = 4,
      BAR_Y = 258,
      BAR_W = 68,
      BAR_H = 4;

    this._schoolLabel = this.add
      .bitmapText(4, 256, PIXEL_FONT, "", 7)
      .setOrigin(0, 1)
      .setScrollFactor(0)
      .setDepth(100);

    this.add
      .rectangle(BAR_X, BAR_Y, BAR_W, BAR_H, 0x222222)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(100);

    this._schoolXPBar = this.add
      .rectangle(BAR_X, BAR_Y, 0, BAR_H, 0xff4422)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(101);

    this._schoolXPBarMaxW = BAR_W;

    SchoolSystem.onRankUp((_schoolId, _idx, rankName) => {
      this._showRankUpNotification(rankName);
    });

    this._updateSchoolHUD();
  },

  _updateSchoolHUD() {
    if (!this._schoolLabel) return;
    const name = SchoolSystem.getActiveSchoolName();
    const rank = SchoolSystem.getActiveRankName();
    const color = SchoolSystem.getActiveSchoolColor();
    this._schoolLabel.setText(`${name}  ${rank}`).setTint(color);
    if (this._schoolXPBar) {
      this._schoolXPBar
        .setFillStyle(color)
        .setWidth(this._schoolXPBarMaxW * SchoolSystem.getXPFraction());
    }
  },

  _showRankUpNotification(rankName) {
    const txt = this.add
      .bitmapText(240, 120, PIXEL_FONT, `RANK UP!\n${rankName}`, 12)
      .setOrigin(0.5)
      .setTint(0xff6622)
      .setScrollFactor(0)
      .setDepth(150);
    this.tweens.add({
      targets: txt,
      y: 80,
      alpha: 0,
      duration: 2200,
      ease: "Quad.easeOut",
      onComplete: () => txt.destroy(),
    });
  },
};
