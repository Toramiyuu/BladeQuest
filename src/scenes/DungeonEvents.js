/**
 * DungeonEvents — event emission helpers mixed into DungeonScene prototype.
 *
 * Applied via Object.assign(DungeonScene.prototype, DungeonEventsMixin).
 */

export const DungeonEventsMixin = {
  _emitHealthChanged() {
    if (this._events) {
      this._events.emit("health-changed", {
        current: this._healthSystem.currentHealth,
        max: this._healthSystem.maxHealth,
      });
    }
  },

  _emitFloorChanged() {
    if (this._events) {
      this._events.emit("floor-changed", this._currentFloor);
    }
  },

  /** Emits the player's current ability info once per floor build so UIScene can show the correct slot. */
  _emitAbilityInfo() {
    if (!this._events || !this.player?.classConfig) return;
    const { id, cooldownMs } = this.player.classConfig.ability;
    this._events.emit("ability-info", { abilityId: id, cooldownMs });
  },

  /** Emits the full room layout whenever a new floor is loaded. UIScene uses this for the minimap. */
  _emitLayoutChanged() {
    if (this._events && this._layout) {
      this._events.emit("layout-changed", {
        rooms: this._layout.rooms,
        width: this._layout.width,
        height: this._layout.height,
        bossRoomIndex: this._layout.spawns.boss ? 0 : -1,
      });
    }
  },

  /**
   * Emits the player's current tile position. Throttled — only fires when the
   * player has moved at least 1 tile since the last emit.
   */
  _emitPlayerMoved() {
    if (!this._events || !this.player || !this._layout) return;
    const tx = Math.floor(this.player.x / 16);
    const ty = Math.floor(this.player.y / 16);
    if (tx === this._lastEmitTileX && ty === this._lastEmitTileY) return;
    this._lastEmitTileX = tx;
    this._lastEmitTileY = ty;
    this._events.emit("player-moved", { tx, ty });
  },

  _emitManaChanged() {
    if (this._events && this.player.manaSystem) {
      const current = this.player.manaSystem.currentMana;
      if (current === this._lastMana) return;
      this._lastMana = current;
      this._events.emit("mana-changed", {
        current,
        max: this.player.manaSystem.maxMana,
      });
    }
  },
};
