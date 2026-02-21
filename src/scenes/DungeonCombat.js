/**
 * DungeonCombat — combat callback methods mixed into DungeonScene prototype.
 *
 * Applied via Object.assign(DungeonScene.prototype, DungeonCombatMixin).
 */

import {
  HEAVY_KNOCKBACK_X,
  SLIME_DAMAGE,
  ARROW_DAMAGE,
} from "../config/constants.js";
import InventorySystem from "../systems/InventorySystem.js";
import { calculateDamage } from "../systems/DamageCalc.js";
import { calculateIncoming } from "../systems/DefenseCalc.js";
import { getDropsForEnemy } from "../systems/DropSystem.js";
import { PIXEL_FONT } from "../config/PixelFont.js";
import GuildQuestSystem from "../systems/GuildQuestSystem.js";
import SchoolSystem from "../systems/SchoolSystem.js";
import SaveManager from "../systems/SaveManager.js";
import TitleSystem from "../systems/TitleSystem.js";

export const DungeonCombatMixin = {
  _setupOverlaps() {
    if (!this._dropShutdownRegistered) {
      this._dropShutdownRegistered = true;
      this.events.on("shutdown", () => InventorySystem.saveInventory());
    }
    const inv = InventorySystem.getInventory();
    this._weaponTier = inv.weaponTier ?? 0;
    this.player._armorTier = inv.armorTier ?? 0;
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
    if (this.arrowGroup) {
      this._trackCollider(
        this.physics.add.overlap(
          this.arrowGroup,
          this.player,
          this._onArrowHitPlayer,
          null,
          this,
        ),
      );
    }
  },

  _onGroundSlashHit(_hitbox, enemy) {
    if (this.player.hitEnemies.has(enemy)) return;
    this.player.hitEnemies.add(enemy);
    const isHeavy = this.player.combatSystem.currentAttack === "heavy";
    if (isHeavy) {
      enemy.body.setVelocityX(this.player.facing * HEAVY_KNOCKBACK_X);
    }
    const now = this.time.now;
    const isFirstBlood = SchoolSystem.isFirstBlood(enemy, now);
    SchoolSystem.recordHit(enemy, now);
    if (isFirstBlood) {
      SchoolSystem.addFirstBloodXP();
      this._showFirstBloodIndicator(enemy.x, enemy.y);
    }
    const base = calculateDamage({
      weaponTier: this._weaponTier,
      classId: this._classId,
      isHeavy,
      isFirstBlood,
    });
    const dmg = Math.ceil(base * (this.player._damageMultiplier ?? 1));
    const wasDead = enemy.isDead;
    enemy.takeDamage(dmg);
    this._audio?.play(isHeavy ? "heavyHit" : "hit");
    if (isHeavy) {
      this.cameras.main.shake(200, 0.012);
      this.tweens.add({
        targets: this.cameras.main,
        zoom: 1.07,
        duration: 55,
        yoyo: true,
        ease: "Quad.easeOut",
      });
    }
    if (!wasDead && enemy.isDead) this._onEnemyDied(enemy);
    this._showDamageNumber(enemy.x, enemy.y, dmg, isHeavy, isFirstBlood);
  },

  _onAirSlashHit(_hitbox, enemy) {
    if (this.player.hitEnemies.has(enemy)) return;
    this.player.hitEnemies.add(enemy);
    const now = this.time.now;
    const isFirstBlood = SchoolSystem.isFirstBlood(enemy, now);
    SchoolSystem.recordHit(enemy, now);
    if (isFirstBlood) {
      SchoolSystem.addFirstBloodXP();
      this._showFirstBloodIndicator(enemy.x, enemy.y);
    }
    const base = calculateDamage({
      weaponTier: this._weaponTier,
      classId: this._classId,
      isFirstBlood,
    });
    const dmg = Math.ceil(base * (this.player._damageMultiplier ?? 1));
    const wasDead = enemy.isDead;
    enemy.takeDamage(dmg);
    this.player.applyAirSlashBounce();
    this._audio?.play("hit");
    if (!wasDead && enemy.isDead) this._onEnemyDied(enemy);
    this._showDamageNumber(enemy.x, enemy.y, dmg, false, isFirstBlood);
  },

  _onPlayerContactEnemy(_player, enemy) {
    if (!enemy.active) return;
    const before = this._healthSystem.currentHealth;
    const def = calculateIncoming(SLIME_DAMAGE, this.player._armorTier ?? 0);
    this.player.takeDamage(def, enemy.x);
    if (this._healthSystem.currentHealth !== before) {
      this._emitHealthChanged();
      this._audio?.play("playerHit");
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

      this._spawnChromaFlash();
    }
  },

  _onKunaiHitEnemy(kunai, enemy) {
    if (!enemy.active) return;
    const base = calculateDamage({
      weaponTier: this._weaponTier,
      classId: this._classId,
    });
    const dmg = Math.ceil(base * (this.player._damageMultiplier ?? 1));
    const wasDead = enemy.isDead;
    enemy.takeDamage(dmg);
    kunai.destroy();
    this._audio?.play("hit");
    if (!wasDead && enemy.isDead) this._onEnemyDied(enemy);
    this._showDamageNumber(enemy.x, enemy.y, dmg, false);
  },

  _onArrowHitPlayer(arrow, _player) {
    if (!arrow.active) return;
    const before = this._healthSystem.currentHealth;
    const dmg = calculateIncoming(ARROW_DAMAGE, this.player._armorTier ?? 0);
    this.player.takeDamage(dmg, arrow.x);
    arrow.destroy();
    if (this._healthSystem.currentHealth !== before) {
      this._emitHealthChanged();
      this._audio?.play("playerHit");
      this.cameras.main.shake(80, 0.004);
      this._spawnChromaFlash();
    }
  },

  /** Called when an enemy transitions from alive → dead. Awards drops and shows floating text. */
  _onEnemyDied(enemy) {
    if (enemy === this._boss) return;
    SchoolSystem.onEnemyDied(enemy);
    const type = enemy.enemyType ?? "skeleton";
    const drops = getDropsForEnemy(type, this._currentFloor);

    if (drops.gold > 0) {
      const goldBonus = TitleSystem.getGoldBonus();
      const gold =
        goldBonus > 0 ? Math.round(drops.gold * (1 + goldBonus)) : drops.gold;
      InventorySystem.addGold(gold);
      this._audio?.play("pickup");
    }
    if (drops.bones > 0) InventorySystem.addMaterial("bones", drops.bones);
    if (drops.crystals > 0)
      InventorySystem.addMaterial("crystals", drops.crystals);
    if (drops.essence > 0)
      InventorySystem.addMaterial("essence", drops.essence);

    if (this._runStats) this._runStats.kills++;
    SaveManager.incrementKills();
    GuildQuestSystem.advanceKillQuest(type, 1);
    GuildQuestSystem.checkCollectionQuests(
      InventorySystem.getInventory().materials,
    );
    TitleSystem.checkUnlocks();
    this._showDropText(enemy.x, enemy.y, drops);
    this._spawnDeathParticles(enemy.x, enemy.y);
  },

  /** Floating damage number above enemy on hit. Red-orange for First Blood, yellow for heavy, white otherwise. */
  _showDamageNumber(x, y, dmg, isHeavy, isFirstBlood = false) {
    const tint = isFirstBlood ? 0xff6622 : isHeavy ? 0xffdd44 : 0xffffff;
    const txt = this.add
      .bitmapText(x, y - 16, "pixel", `${dmg}`, 8)
      .setOrigin(0.5)
      .setTint(tint)
      .setDepth(60);
    this.tweens.add({
      targets: txt,
      y: y - 36,
      alpha: 0,
      duration: 700,
      ease: "Quad.easeOut",
      onComplete: () => txt.destroy(),
    });
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
