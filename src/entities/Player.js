import Phaser from "phaser";
import StateMachine from "../systems/StateMachine.js";
import { CoyoteTimer } from "../systems/InputBuffer.js";
import CombatSystem from "../systems/CombatSystem.js";
import { PlayerCombatMixin } from "./PlayerCombat.js";
import ManaSystem from "../systems/ManaSystem.js";
import AbilitySystem from "../systems/AbilitySystem.js";
import { PlayerAbilityMixin } from "./PlayerAbility.js";
import {
  PLAYER_SPEED,
  PLAYER_ACCELERATION,
  PLAYER_DRAG_X,
  JUMP_VELOCITY,
  JUMP_GRAVITY_REDUCTION,
  JUMP_HOLD_MAX_MS,
  COYOTE_TIME_MS,
  MAX_DELTA_MS,
  SLASH1_WINDUP_MS,
  SLASH1_ACTIVE_MS,
  SLASH1_RECOVERY_MS,
  SLASH2_WINDUP_MS,
  SLASH2_ACTIVE_MS,
  SLASH2_RECOVERY_MS,
  HEAVY_WINDUP_MS,
  HEAVY_ACTIVE_MS,
  HEAVY_RECOVERY_MS,
  AIR_WINDUP_MS,
  AIR_ACTIVE_MS,
  AIR_RECOVERY_MS,
  COMBO_WINDOW_MS,
  AIR_BOUNCE_FORCE,
  DODGE_COOLDOWN_MS,
} from "../config/constants.js";

const PLAYER_SCALE = 0.35;

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, classConfig = null) {
    super(scene, x, y, "player-idle", 0);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.classConfig = classConfig;

    this.setScale(PLAYER_SCALE);
    this.body.setSize(30, 64);
    this.body.setOffset(50, 58);
    this.body.setMaxVelocityX(PLAYER_SPEED);
    this.body.setDragX(PLAYER_DRAG_X);
    this.setDepth(10);

    this.facing = 1;

    this._jumpHoldMs = 0;
    this._isJumping = false;
    this._coyoteTimer = new CoyoteTimer(COYOTE_TIME_MS);

    this._knockbackLockMs = 0;

    this._flashMs = 0;

    this.justBounced = false;
    this._bounceGuardMs = 0;

    this._stateMachine = new StateMachine("idle");
    this._setupStateMachine();

    this._combatSystem = new CombatSystem({
      slash1: {
        windup: SLASH1_WINDUP_MS,
        active: SLASH1_ACTIVE_MS,
        recovery: SLASH1_RECOVERY_MS,
      },
      slash2: {
        windup: SLASH2_WINDUP_MS,
        active: SLASH2_ACTIVE_MS,
        recovery: SLASH2_RECOVERY_MS,
      },
      heavy: {
        windup: HEAVY_WINDUP_MS,
        active: HEAVY_ACTIVE_MS,
        recovery: HEAVY_RECOVERY_MS,
      },
      air: {
        windup: AIR_WINDUP_MS,
        active: AIR_ACTIVE_MS,
        recovery: AIR_RECOVERY_MS,
      },
      comboWindow: COMBO_WINDOW_MS,
    });

    this.groundHitbox = scene.physics.add
      .image(x, y, "hitbox")
      .setVisible(false);
    this.groundHitbox.body.enable = false;
    this.airHitbox = scene.physics.add.image(x, y, "hitbox").setVisible(false);
    this.airHitbox.body.enable = false;

    this.hitEnemies = new Set();

    this.healthSystem = null;

    this.manaSystem = null;
    this.abilitySystem = null;
    if (classConfig) {
      const { stats, ability } = classConfig;
      this.manaSystem = new ManaSystem(stats.maxMana, stats.manaRegenRate);
      this.abilitySystem = new AbilitySystem({
        manaCost: ability.manaCost,
        cooldownMs: ability.cooldownMs,
        execute: () => this._executeAbility(),
      });
    }

    this._keys = scene.input.keyboard.addKeys({
      left: Phaser.Input.Keyboard.KeyCodes.LEFT,
      right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      d: Phaser.Input.Keyboard.KeyCodes.D,
      jump: Phaser.Input.Keyboard.KeyCodes.SPACE,
      jumpW: Phaser.Input.Keyboard.KeyCodes.W,
      jumpUp: Phaser.Input.Keyboard.KeyCodes.UP,
      attack: Phaser.Input.Keyboard.KeyCodes.X,
      attack2: Phaser.Input.Keyboard.KeyCodes.K,
      ability: Phaser.Input.Keyboard.KeyCodes.C,
      ability2: Phaser.Input.Keyboard.KeyCodes.V,
      dodge: Phaser.Input.Keyboard.KeyCodes.SHIFT,
    });

    this._rollMs = 0;
    this._rollCooldownMs = 0;
    this._rollIframeMs = 0;
  }

  _setupStateMachine() {
    const sm = this._stateMachine;

    sm.addState("idle", {
      enter: () => this._playAnim("player-idle"),
    });
    sm.addState("run", {
      enter: () => this._playAnim("player-run"),
    });
    sm.addState("jump", {
      enter: () => this._playAnim("player-jump-up"),
    });
    sm.addState("fall", {
      enter: () => this._playAnim("player-fall"),
    });
    sm.addState("attack1", {
      enter: () => this._playAnim("player-attack1"),
    });
    sm.addState("attack2", {
      enter: () => this._playAnim("player-attack1"),
    });
    sm.addState("attack3", {
      enter: () => this._playAnim("player-attack2"),
    });
    sm.addState("air_attack", {
      enter: () => this._playAnim("player-attack1"),
    });
    sm.addState("roll", {
      enter: () => this._playAnim("player-run"),
    });
  }

  _playAnim(key) {
    if (this.anims.currentAnim?.key !== key) {
      this.play(key, true);
    }
  }

  get stateMachine() {
    return this._stateMachine;
  }
  get combatSystem() {
    return this._combatSystem;
  }

  get isInAttackState() {
    const s = this._stateMachine.currentState;
    return s.startsWith("attack") || s === "air_attack";
  }

  update(_time, delta) {
    const dt = Math.min(delta, MAX_DELTA_MS);
    const body = this.body;
    const isGrounded = body.blocked.down;

    this._coyoteTimer.update({ isGrounded, deltaMs: dt });

    if (this._rollCooldownMs > 0) this._rollCooldownMs -= dt;

    const dodgeJustPressed = Phaser.Input.Keyboard.JustDown(this._keys.dodge);
    if (
      dodgeJustPressed &&
      !this.isInAttackState &&
      this._rollMs <= 0 &&
      this._rollCooldownMs <= 0
    ) {
      this._startDodge();
    }

    if (this._rollMs > 0) {
      this._updateDodge(dt);
      this._updateHitboxPositions();
      return;
    }

    if (this._knockbackLockMs > 0) {
      this._knockbackLockMs -= dt;
      this._updateHitboxPositions();
      this._updateCombatSystem(dt, isGrounded);
      return;
    }

    if (this.justBounced) {
      this._bounceGuardMs -= dt;
      if (this._bounceGuardMs <= 0) {
        this.justBounced = false;
      } else if (isGrounded) {
        body.setVelocityY(-AIR_BOUNCE_FORCE);
      }
    }

    const leftDown = this._keys.left.isDown || this._keys.a.isDown;
    const rightDown = this._keys.right.isDown || this._keys.d.isDown;

    if (!this.isInAttackState) {
      if (rightDown) {
        body.setAccelerationX(PLAYER_ACCELERATION);
        this.facing = 1;
        this.setFlipX(false);
      } else if (leftDown) {
        body.setAccelerationX(-PLAYER_ACCELERATION);
        this.facing = -1;
        this.setFlipX(true);
      } else {
        body.setAccelerationX(0);
      }
    } else {
      body.setAccelerationX(0);
    }

    const jumpJustPressed =
      Phaser.Input.Keyboard.JustDown(this._keys.jump) ||
      Phaser.Input.Keyboard.JustDown(this._keys.jumpW) ||
      Phaser.Input.Keyboard.JustDown(this._keys.jumpUp);

    const jumpHeld =
      this._keys.jump.isDown ||
      this._keys.jumpW.isDown ||
      this._keys.jumpUp.isDown;

    if (jumpJustPressed && this._coyoteTimer.canJump && !this.isInAttackState) {
      body.setVelocityY(JUMP_VELOCITY);
      this._isJumping = true;
      this._jumpHoldMs = 0;
      this._coyoteTimer.consumeJump();
    }

    if (this._isJumping && jumpHeld && body.velocity.y < 0) {
      this._jumpHoldMs += dt;
      if (this._jumpHoldMs < JUMP_HOLD_MAX_MS) {
        body.setGravityY(JUMP_GRAVITY_REDUCTION);
      } else {
        body.setGravityY(0);
        this._isJumping = false;
      }
    } else {
      body.setGravityY(0);
      if (!jumpHeld) this._isJumping = false;
    }

    if (isGrounded) {
      this._isJumping = false;
      this._jumpHoldMs = 0;
    }

    if (!this.isInAttackState) {
      this._updateMovementState(isGrounded, leftDown || rightDown);
    }
    this._stateMachine.update(dt);

    this._updateCombatSystem(dt, isGrounded);

    this._updateAbilitySystem(dt);

    this._updateHitboxPositions();
  }

  _updateMovementState(isGrounded, isMovingHorizontally) {
    const sm = this._stateMachine;
    if (isGrounded) {
      sm.transition(isMovingHorizontally ? "run" : "idle");
    } else {
      sm.transition(this.body.velocity.y < 0 ? "jump" : "fall");
    }
  }

  respawn(x, y) {
    this.setPosition(x, y);
    this.body.reset(x, y);
    this.body.setVelocity(0, 0);
    this._isJumping = false;
    this._jumpHoldMs = 0;
    this._knockbackLockMs = 0;
    this._combatSystem.reset();
    this.groundHitbox.body.enable = false;
    this.airHitbox.body.enable = false;
    this.hitEnemies.clear();
    this.setAlpha(1);
    this.clearTint();
    if (this.manaSystem) this.manaSystem.reset();
    if (this.abilitySystem) this.abilitySystem.reset();
    this._rollMs = 0;
    this._rollCooldownMs = 0;
    this._rollIframeMs = 0;
    this.setAlpha(1);
    this._stateMachine.transition("idle");
  }
}

Object.assign(Player.prototype, PlayerCombatMixin);
Object.assign(Player.prototype, PlayerAbilityMixin);
