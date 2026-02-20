import Enemy from "./Enemy.js";
import BossAI from "../systems/BossAI.js";
import {
  BOSS_PATROL_SPEED,
  BOSS_CHARGE_SPEED,
  BOSS_CHARGE_RANGE,
  BOSS_JUMP_FORCE,
  MAX_DELTA_MS,
} from "../config/constants.js";

/**
 * Boss — large enemy with two-phase AI.
 *
 * Uses scaled-up skeleton sprite with red tint as placeholder.
 * Receives pixel bounds of the boss room.
 */
const BOSS_SCALE = 1.1;

export default class Boss extends Enemy {
  constructor(scene, x, y, leftBound, rightBound, health) {
    super(scene, x, y, "skel-idle", health);

    this._maxHealth = health;
    this._ai = new BossAI({
      leftBound,
      rightBound,
      maxHealth: health,
      patrolSpeed: BOSS_PATROL_SPEED,
      chargeSpeed: BOSS_CHARGE_SPEED,
      chargeRange: BOSS_CHARGE_RANGE,
      jumpForce: BOSS_JUMP_FORCE,
    });

    this.setScale(BOSS_SCALE);
    this.setTint(0xff2222);
    this.body.setSize(28, 44);
    this.body.setOffset(18, 16);
    this.setDepth(5);
    this.body.setGravityY(0);
    this.body.setMaxVelocityX(300);

    this.play("boss-walk");
  }

  get phase() {
    return this._ai.phase;
  }

  update(_time, delta) {
    if (!this.active) return;
    const dt = Math.min(delta, MAX_DELTA_MS);

    const player = this.scene.player;
    const playerX = player ? player.x : this.x;
    const playerY = player ? player.y : this.y;

    const { vx, vy } = this._ai.update(
      this.x,
      playerX,
      playerY,
      this._health,
      dt,
    );
    this.body.setVelocityX(vx);
    if (vy !== 0) {
      this.body.setVelocityY(vy);
    }

    this.setFlipX(vx > 0);
  }

  _die() {
    this._isDead = true;
    this.body.enable = false;
    this.play("boss-death");

    const dx = this.x;
    const dy = this.y;
    if (this.scene && this.scene.add) {
      this.scene.add.particles(dx, dy, "particle-death", {
        speed: { min: 30, max: 120 },
        angle: { min: 0, max: 360 },
        lifespan: 500,
        quantity: 20,
        maxParticles: 20,
        tint: 0xff4444,
        alpha: { start: 1, end: 0 },
        gravityY: 80,
      });
    }

    const fadeOut = () => {
      if (!this.scene) return;
      this.scene.tweens.add({
        targets: this,
        alpha: 0,
        duration: 400,
        onComplete: () => {
          this.setActive(false);
          this.destroy();
        },
      });
    };

    this.once("animationcomplete", fadeOut);
    this.scene.time.delayedCall(2000, () => {
      if (this.active && this.alpha > 0) fadeOut();
    });
  }
}
