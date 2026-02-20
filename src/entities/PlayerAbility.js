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
    }
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
