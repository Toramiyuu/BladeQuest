/**
 * PlayerCombat — combat behaviour methods mixed into Player prototype.
 *
 * Applied via Object.assign(Player.prototype, PlayerCombatMixin) at the
 * bottom of Player.js. All methods use `this` which resolves to the Player
 * instance at call-time, so they behave exactly as class methods.
 */

import Phaser from "phaser";
import {
  KNOCKBACK_X,
  KNOCKBACK_Y,
  KNOCKBACK_LOCK_MS,
  FLASH_INTERVAL_MS,
  AIR_BOUNCE_FORCE,
  BOUNCE_GUARD_MS,
  PLAYER_DRAG_X,
  DODGE_SPEED,
  DODGE_DURATION_MS,
  DODGE_IFRAME_MS,
  DODGE_COOLDOWN_MS,
} from "../config/constants.js";

export const PlayerCombatMixin = {
  _updateCombatSystem(dt, isGrounded) {
    const attackJustPressed =
      Phaser.Input.Keyboard.JustDown(this._keys.attack) ||
      Phaser.Input.Keyboard.JustDown(this._keys.attack2);

    const wasActive = this._combatSystem.hitboxActive;
    this._combatSystem.update(dt, {
      attackJustPressed,
      isAirborne: !isGrounded,
    });
    const isActive = this._combatSystem.hitboxActive;

    this._syncStateMachineWithCombat();

    if (isActive !== wasActive) {
      if (isActive) {
        const attack = this._combatSystem.currentAttack;
        if (attack === "air") {
          this.airHitbox.body.enable = true;
          this.groundHitbox.body.enable = false;
        } else {
          this.groundHitbox.body.enable = true;
          this.airHitbox.body.enable = false;
        }
        this.hitEnemies.clear();
      } else {
        this.groundHitbox.body.enable = false;
        this.airHitbox.body.enable = false;
        this.hitEnemies.clear();
      }
    }
  },

  _syncStateMachineWithCombat() {
    const cs = this._combatSystem;
    const sm = this._stateMachine;

    if (cs.state === "idle") {
      if (this.isInAttackState) {
        const onGround = this.body.blocked.down;
        sm.transition(onGround ? "idle" : "fall");
      }
    } else {
      const attackState = this._combatStateToSMState(cs.state);
      if (attackState && sm.currentState !== attackState) {
        sm.transition(attackState);
      }
    }
  },

  _combatStateToSMState(combatState) {
    if (combatState.startsWith("slash1")) return "attack1";
    if (combatState.startsWith("slash2")) return "attack2";
    if (combatState.startsWith("heavy")) return "attack3";
    if (combatState.startsWith("air")) return "air_attack";
    return null;
  },

  _updateHitboxPositions() {
    const HITBOX_OFFSET_X = 18;
    const HITBOX_OFFSET_Y = -4;
    this.groundHitbox.setPosition(
      this.x + this.facing * HITBOX_OFFSET_X,
      this.y + HITBOX_OFFSET_Y,
    );
    this.airHitbox.setPosition(this.x, this.y + 14);
  },

  _startDodge() {
    this._rollMs = DODGE_DURATION_MS;
    this._rollIframeMs = DODGE_IFRAME_MS;
    this.body.setVelocityX(this.facing * DODGE_SPEED);
    this.body.setAccelerationX(0);
    this.body.setDragX(0);
    this._stateMachine.transition("roll");
  },

  _updateDodge(dt) {
    this._rollMs -= dt;
    if (this._rollIframeMs > 0) this._rollIframeMs -= dt;
    this.setAlpha(this._rollIframeMs > 0 ? 0.45 : 0.75);
    if (this._rollMs <= 0) {
      this._rollMs = 0;
      this._rollCooldownMs = DODGE_COOLDOWN_MS;
      this.body.setDragX(PLAYER_DRAG_X);
      this.setAlpha(1);
      this._stateMachine.transition(this.body.blocked.down ? "idle" : "fall");
    }
  },

  /** Called when player takes damage (from GameScene overlap callback). */
  takeDamage(amount, sourceX) {
    if (
      this.healthSystem &&
      !this.healthSystem.isInvulnerable() &&
      this._rollIframeMs <= 0
    ) {
      this.healthSystem.takeDamage(amount);

      const dir = this.x > sourceX ? 1 : -1;
      this.body.setVelocity(dir * KNOCKBACK_X, KNOCKBACK_Y);
      this._knockbackLockMs = KNOCKBACK_LOCK_MS;

      this._flashMs = 0;
    }
  },

  /** Update invulnerability visual flash. Call from GameScene update after takeDamage. */
  updateInvulnerabilityFlash(dt) {
    if (this._rollMs > 0) return;
    if (!this.healthSystem || !this.healthSystem.isInvulnerable()) {
      this.setAlpha(1);
      this._flashMs = 0;
      return;
    }
    this._flashMs += dt;
    if (this._flashMs >= FLASH_INTERVAL_MS) {
      this._flashMs = 0;
      this.setAlpha(this.alpha < 0.6 ? 1 : 0.3);
    }
  },

  /** Called from GameScene onSlimeHit overlap when air slash hits enemy. */
  applyAirSlashBounce() {
    this.body.setVelocityY(-AIR_BOUNCE_FORCE);
    this.justBounced = true;
    this._bounceGuardMs = BOUNCE_GUARD_MS;
    this._combatSystem.reset();
    this._stateMachine.transition("fall");
  },
};
