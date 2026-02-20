/**
 * DungeonPotion — potion hotkey (1/2/3) and effect logic mixed into DungeonScene prototype.
 *
 * Applied via Object.assign(DungeonScene.prototype, DungeonPotionMixin).
 */

import Phaser from "phaser";
import InventorySystem from "../systems/InventorySystem.js";
import { PLAYER_SPEED } from "../config/constants.js";

export const DungeonPotionMixin = {
  /** Call once from DungeonScene.create() after UIScene launches. */
  _setupPotionKeys() {
    this._potionKeys = [
      this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
      this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
      this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE),
    ];
    this.events.once("shutdown", () => {
      if (this._speedPotionTimer) {
        this._speedPotionTimer.remove();
        this._speedPotionTimer = null;
      }
      if (this._strengthPotionTimer) {
        this._strengthPotionTimer.remove();
        this._strengthPotionTimer = null;
      }
    });
    this._emitPotionLoadout();
  },

  /** Call each frame from DungeonScene.update(). */
  _checkPotionKeys() {
    for (let slot = 0; slot < 3; slot++) {
      if (Phaser.Input.Keyboard.JustDown(this._potionKeys[slot])) {
        this._consumePotion(slot);
      }
    }
  },

  _consumePotion(slot) {
    const type = InventorySystem.consumePotion(slot);
    if (!type) return;

    if (type === "health") {
      this._healthSystem.heal(2);
      this._emitHealthChanged();
    } else if (type === "speed") {
      this.player.body.setMaxVelocityX(PLAYER_SPEED * 1.5);
      if (this._speedPotionTimer) this._speedPotionTimer.remove();
      this._speedPotionTimer = this.time.delayedCall(10000, () => {
        if (this.player?.body) this.player.body.setMaxVelocityX(PLAYER_SPEED);
      });
    } else if (type === "strength") {
      this.player._damageMultiplier = 1.5;
      if (this._strengthPotionTimer) this._strengthPotionTimer.remove();
      this._strengthPotionTimer = this.time.delayedCall(10000, () => {
        if (this.player) this.player._damageMultiplier = 1;
      });
    }

    this._emitPotionLoadout();
  },

  _emitPotionLoadout() {
    const inv = InventorySystem.getInventory();
    this._events.emit("potion-loadout-changed", {
      loadout: inv.potionLoadout,
      counts: inv.potionCounts,
    });
  },
};
