/**
 * HubSceneMinimap — small fixed-position minimap for HubScene.
 *
 * Renders building positions as colored markers and tracks the player dot.
 * Applied via Object.assign(HubScene.prototype, HubSceneMinimapMixin).
 */

import { BUILDINGS, WORLD_W } from "./HubSceneWorld.js";

const MM_X = 396;
const MM_Y = 4;
const MM_W = 80;
const MM_H = 40;

const BUILDING_COLORS = {
  dungeon: 0x44ff44,
  blacksmith: 0xff8844,
  merchant: 0x4488ff,
  guild: 0xffdd44,
};

export const HubSceneMinimapMixin = {
  _createHubMinimap() {
    this._hmBg = this.add
      .rectangle(MM_X, MM_Y, MM_W, MM_H, 0x000000, 0.6)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(90);

    this._hmBorder = this.add
      .rectangle(MM_X, MM_Y, MM_W, MM_H)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0x556655)
      .setFillStyle()
      .setScrollFactor(0)
      .setDepth(91);

    this._hmGraphics = this.add.graphics().setScrollFactor(0).setDepth(92);
    this._hmPlayer = this.add.graphics().setScrollFactor(0).setDepth(93);

    const midY = MM_Y + MM_H / 2;
    for (const b of BUILDINGS) {
      const cx = b.x + b.w / 2;
      const mmx = MM_X + (cx / WORLD_W) * MM_W;
      const color = BUILDING_COLORS[b.role] ?? 0x888888;
      this._hmGraphics.fillStyle(color, 0.9);
      this._hmGraphics.fillRect(mmx - 2, midY - 3, 4, 6);
    }
  },

  _updateHubMinimap() {
    if (!this._hmPlayer || !this.player) return;
    this._hmPlayer.clear();
    const px = MM_X + (this.player.x / WORLD_W) * MM_W;
    const py = MM_Y + MM_H / 2;
    this._hmPlayer.fillStyle(0x88ff88, 1);
    this._hmPlayer.fillRect(px - 1, py - 1, 3, 3);
  },
};
