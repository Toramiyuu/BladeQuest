/**
 * DungeonCombat — combat callback methods mixed into DungeonScene prototype.
 *
 * Applied via Object.assign(DungeonScene.prototype, DungeonCombatMixin).
 */

import { HEAVY_KNOCKBACK_X, SLIME_DAMAGE } from "../config/constants.js";
import InventorySystem from "../systems/InventorySystem.js";
import { getDropsForEnemy } from "../systems/DropSystem.js";
import { PIXEL_FONT } from "../config/PixelFont.js";

export const DungeonCombatMixin = {
  _setupOverlaps() {
    if (!this._dropShutdownRegistered) {
      this._dropShutdownRegistered = true;
      this.events.on("shutdown", () => InventorySystem.saveInventory());
    }
    this._trackCollider(
      this.physics.add.overlap(
        this.player.groundHitbox,
        this.enemyGroup,
        this._onGroundSlashHit,
        null,
        this,
      ),
    );
    this._trackCollider(
      this.physics.add.overlap(
        this.player.airHitbox,
        this.enemyGroup,
        this._onAirSlashHit,
        null,
        this,
      ),
    );
    this._trackCollider(
      this.physics.add.overlap(
        this.player,
        this.enemyGroup,
        this._onPlayerContactEnemy,
        null,
        this,
      ),
    );
    this._trackCollider(
      this.physics.add.overlap(
        this.kunaiGroup,
        this.enemyGroup,
        this._onKunaiHitEnemy,
        null,
        this,
      ),
    );
  },

  _onGroundSlashHit(_hitbox, enemy) {
    if (this.player.hitEnemies.has(enemy)) return;
    this.player.hitEnemies.add(enemy);
    if (this.player.combatSystem.currentAttack === "heavy") {
      enemy.body.setVelocityX(this.player.facing * HEAVY_KNOCKBACK_X);
    }
    const wasDead = enemy.isDead;
    enemy.takeDamage(this.player._damageMultiplier ?? 1);
    if (!wasDead && enemy.isDead) this._onEnemyDied(enemy);
  },

  _onAirSlashHit(_hitbox, enemy) {
    if (this.player.hitEnemies.has(enemy)) return;
    this.player.hitEnemies.add(enemy);
    const wasDead = enemy.isDead;
    enemy.takeDamage(this.player._damageMultiplier ?? 1);
    this.player.applyAirSlashBounce();
    if (!wasDead && enemy.isDead) this._onEnemyDied(enemy);
  },

  _onPlayerContactEnemy(_player, enemy) {
    if (!enemy.active) return;
    const before = this._healthSystem.currentHealth;
    this.player.takeDamage(SLIME_DAMAGE, enemy.x);
    if (this._healthSystem.currentHealth !== before) {
      this._emitHealthChanged();
      this.cameras.main.shake(120, 0.005);

      if (!this._hitStopActive) {
        this._hitStopActive = true;
        this.physics.world.pause();
        this.time.delayedCall(50, () => {
          this.physics.world.resume();
          this._hitStopActive = false;
        });
      }

      const flash = this.add
        .rectangle(240, 135, 480, 270, 0xff0000, 0.3)
        .setScrollFactor(0)
        .setDepth(195);
      this.tweens.add({
        targets: flash,
        alpha: 0,
        duration: 150,
        onComplete: () => flash.destroy(),
      });

      if (this._cameraTarget) {
        this._cameraTarget.x += 1;
        this.time.delayedCall(33, () => {
          if (this._cameraTarget) this._cameraTarget.x -= 1;
        });
      }
    }
  },

  _onKunaiHitEnemy(kunai, enemy) {
    if (!enemy.active) return;
    const wasDead = enemy.isDead;
    enemy.takeDamage(1);
    kunai.destroy();
    if (!wasDead && enemy.isDead) this._onEnemyDied(enemy);
  },

  /** Called when an enemy transitions from alive → dead. Awards drops and shows floating text. */
  _onEnemyDied(enemy) {
    if (enemy === this._boss) return;
    const type = enemy.enemyType ?? "skeleton";
    const drops = getDropsForEnemy(type, this._currentFloor);

    if (drops.gold > 0) InventorySystem.addGold(drops.gold);
    if (drops.bones > 0) InventorySystem.addMaterial("bones", drops.bones);
    if (drops.crystals > 0)
      InventorySystem.addMaterial("crystals", drops.crystals);
    if (drops.essence > 0)
      InventorySystem.addMaterial("essence", drops.essence);

    this._showDropText(enemy.x, enemy.y, drops);
  },

  /** Shows a floating drop text at the given world position that floats up and fades. */
  _showDropText(x, y, drops) {
    const parts = [];
    if (drops.gold > 0) parts.push(`+${drops.gold}g`);
    if (drops.bones > 0) parts.push(`+${drops.bones} bone`);
    if (drops.crystals > 0) parts.push(`+${drops.crystals} crystal`);
    if (drops.essence > 0) parts.push(`+${drops.essence} essence`);
    if (parts.length === 0) return;

    const txt = this.add
      .bitmapText(x, y - 10, PIXEL_FONT, parts.join("  "), 8)
      .setOrigin(0.5)
      .setTint(0xffdd44)
      .setDepth(50)
      .setScale(1.5);

    this.tweens.add({
      targets: txt,
      scaleX: 1,
      scaleY: 1,
      duration: 200,
      ease: "Quad.easeOut",
    });

    this.tweens.add({
      targets: txt,
      y: y - 40,
      alpha: 0,
      duration: 1000,
      onComplete: () => txt.destroy(),
    });
  },
};
