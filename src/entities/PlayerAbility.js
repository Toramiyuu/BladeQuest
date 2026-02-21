/**
 * PlayerAbility — ability behaviour methods mixed into Player prototype.
 *
 * Applied via Object.assign(Player.prototype, PlayerAbilityMixin) at the
 * bottom of Player.js. All methods use `this` which resolves to the Player
 * instance at call-time.
 */

import Phaser from "phaser";
import Kunai from "./Kunai.js";

export const PlayerAbilityMixin = {
  _updateAbilitySystem(dt) {
    if (this.manaSystem) this.manaSystem.update(dt);
    if (this.abilitySystem) {
      this.abilitySystem.update(dt);
      const abilityPressed =
        Phaser.Input.Keyboard.JustDown(this._keys.ability) ||
        Phaser.Input.Keyboard.JustDown(this._keys.ability2);
      if (abilityPressed && !this.isInAttackState) {
        const fired = this.abilitySystem.tryUse(this.manaSystem);
        if (fired) {
          this.scene._events?.emit("ability-used", {
            abilityId: this.classConfig.ability.id,
            cooldownMs: this.classConfig.ability.cooldownMs,
          });
        }
      }
    }
  },

  _executeAbility() {
    if (!this.classConfig) return;
    const abilityId = this.classConfig.ability.id;
    if (abilityId === "kunai") {
      const kunai = new Kunai(this.scene, this.x, this.y, this.facing);
      if (this.scene.kunaiGroup) this.scene.kunaiGroup.add(kunai);
    } else if (abilityId === "holy-slash") {
      this._executeHolySlash();
    } else if (abilityId === "blink") {
      this._executeBlink();
    } else if (abilityId === "burst") {
      this._executeArcanesBurst();
    } else if (abilityId === "rage") {
      this._executeRage();
    }
  },

  _executeBlink() {
    const dx = this.facing * 64;
    this.setPosition(this.x + dx, this.y);
    this.setTint(0xaa44ff);
    const flash = this.scene.add
      .rectangle(this.x - dx * 0.5, this.y, Math.abs(dx), 20, 0xaa44ff, 0.45)
      .setDepth(15);
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      scaleX: 1.5,
      duration: 180,
      ease: "Quad.easeOut",
      onComplete: () => flash.destroy(),
    });
    this.scene.time.delayedCall(160, () => this.clearTint());
  },

  _executeArcanesBurst() {
    const hb = this.groundHitbox;
    hb.body.enable = true;
    hb.body.setSize(120, 80);
    hb.setPosition(this.x + this.facing * 40, this.y);
    this.setTint(0x8844ff);
    this.hitEnemies.clear();

    const flash = this.scene.add
      .rectangle(this.x + this.facing * 40, this.y, 120, 80, 0x8844ff, 0.45)
      .setDepth(15);
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      scaleX: 1.8,
      scaleY: 1.4,
      duration: 280,
      ease: "Quad.easeOut",
      onComplete: () => flash.destroy(),
    });
    this.scene.time.delayedCall(220, () => {
      hb.body.enable = false;
      this.clearTint();
    });
  },

  _executeRage() {
    const hb = this.groundHitbox;
    hb.body.enable = true;
    hb.body.setSize(80, 64);
    hb.setPosition(this.x + this.facing * 24, this.y);
    this.setTint(0xff4422);
    this.hitEnemies.clear();

    const flash = this.scene.add
      .rectangle(this.x + this.facing * 24, this.y, 80, 64, 0xff4422, 0.5)
      .setDepth(15);
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      scaleX: 1.5,
      duration: 250,
      ease: "Quad.easeOut",
      onComplete: () => flash.destroy(),
    });
    this.scene.time.delayedCall(180, () => {
      hb.body.enable = false;
      this.scene.time.delayedCall(2000, () => {
        if (this.active) this.clearTint();
      });
    });
  },

  _executeHolySlash() {
    const hb = this.groundHitbox;
    hb.body.enable = true;
    hb.body.setSize(80, 64);
    hb.setPosition(this.x + this.facing * 30, this.y);
    this.setTint(0xffdd44);
    this.hitEnemies.clear();

    const flash = this.scene.add
      .rectangle(this.x + this.facing * 40, this.y, 80, 56, 0xffdd44, 0.55)
      .setDepth(15);
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      scaleX: 1.6,
      duration: 220,
      ease: "Quad.easeOut",
      onComplete: () => flash.destroy(),
    });

    this.scene.time.delayedCall(200, () => {
      hb.body.enable = false;
      this.clearTint();
    });
  },
};
