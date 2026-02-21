/**
 * UISceneMinimap — minimap display methods mixed into UIScene prototype.
 *
 * Renders dungeon room layout and player position as a small overlay.
 * Applied via Object.assign(UIScene.prototype, UISceneMinimapMixin).
 */

export const UISceneMinimapMixin = {
  _createMinimap() {
    this._mmX = 4;
    this._mmY = 196;
    this._mmW = 80;
    this._mmH = 60;

    this._mmBg = this.add
      .rectangle(this._mmX, this._mmY, this._mmW, this._mmH, 0x000000, 0.6)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(90);

    this._mmBorder = this.add
      .rectangle(this._mmX, this._mmY, this._mmW, this._mmH)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0x556655)
      .setFillStyle()
      .setScrollFactor(0)
      .setDepth(91);

    this._mmRooms = this.add.graphics().setScrollFactor(0).setDepth(92);
    this._mmPlayer = this.add.graphics().setScrollFactor(0).setDepth(93);

    this._mmLayout = null;
  },

  _onLayoutChanged({ rooms, width, height, bossRoomIndex }) {
    this._mmLayout = {
      rooms,
      width,
      height,
      bossRoomIndex: bossRoomIndex ?? -1,
    };
    this._mmVisited = new Set();
    this._mmCurrentRoom = -1;
    this._mmRooms.clear();

    if (!rooms || width === 0 || height === 0) return;
    this._mmDrawRooms();
    this._updateRoomProgress();
  },

  _mmDrawRooms() {
    this._mmRooms.clear();
    const { rooms, width, height, bossRoomIndex } = this._mmLayout;
    if (!rooms || width === 0 || height === 0) return;
    const sx = this._mmW / width;
    const sy = this._mmH / height;

    for (let i = 0; i < rooms.length; i++) {
      const r = rooms[i];
      let color;
      if (i === this._mmCurrentRoom) {
        color = 0x448844;
      } else if (i === bossRoomIndex) {
        color = 0x884444;
      } else if (this._mmVisited.has(i)) {
        color = 0x334433;
      } else {
        color = 0x222233;
      }
      this._mmRooms.fillStyle(color, 1);
      this._mmRooms.fillRect(
        this._mmX + r.x * sx,
        this._mmY + r.y * sy,
        Math.max(1, r.w * sx),
        Math.max(1, r.h * sy),
      );
    }
  },

  _onPlayerMoved({ tx, ty }) {
    this._mmPlayer.clear();
    if (!this._mmLayout) return;
    const { rooms, width, height } = this._mmLayout;
    if (width === 0 || height === 0) return;

    const sx = this._mmW / width;
    const sy = this._mmH / height;
    const px = this._mmX + tx * sx;
    const py = this._mmY + ty * sy;

    let currentRoom = -1;
    for (let i = 0; i < rooms.length; i++) {
      const r = rooms[i];
      if (tx >= r.x && tx < r.x + r.w && ty >= r.y && ty < r.y + r.h) {
        currentRoom = i;
        break;
      }
    }

    if (currentRoom !== this._mmCurrentRoom) {
      if (this._mmCurrentRoom >= 0) this._mmVisited.add(this._mmCurrentRoom);
      this._mmCurrentRoom = currentRoom;
      this._mmDrawRooms();
      this._updateRoomProgress();
    }

    this._mmPlayer.fillStyle(0x88ff88, 1);
    this._mmPlayer.fillRect(px - 1, py - 1, 3, 3);
  },
};
