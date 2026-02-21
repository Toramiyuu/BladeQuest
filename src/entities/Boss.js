import Phaser from "phaser";
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
 * Boss — large enemy with two-phase AI and a type-specific special attack.
 *
 * Receives an optional bossConfig (from bossTypes.js) that controls tint,
 * scale, AI speeds, and the periodic special attack behaviour.
 */
const DEFAULT_SCALE = 1.1;
const DEFAULT_TINT = 0xff2222;

export default class Boss extends Enemy {
  constructor(scene, x, y, leftBound, rightBound, health, bossConfig) {
    const sp = bossConfig?.sprites;
    super(scene, x, y, sp?.idleKey ?? "skel-idle", health);

    this._cfg = bossConfig ?? null;
    this._maxHealth = health;

    const ai = bossConfig?.aiParams ?? {};
    this._ai = new BossAI({
      leftBound,
      rightBound,
      maxHealth: health,
      patrolSpeed: ai.patrolSpeed ?? BOSS_PATROL_SPEED,
      chargeSpeed: ai.chargeSpeed ?? BOSS_CHARGE_SPEED,
      chargeRange: ai.chargeRange ?? BOSS_CHARGE_RANGE,
      jumpForce: ai.jumpForce ?? BOSS_JUMP_FORCE,
    });

    this.setScale(bossConfig?.scale ?? DEFAULT_SCALE);
    if ((bossConfig?.tint ?? DEFAULT_TINT) !== 0xffffff) {
      this.setTint(bossConfig.tint);
    }
    const hb = bossConfig?.hitbox ?? { w: 28, h: 44, ox: 18, oy: 16 };
    this.body.setSize(hb.w, hb.h);
    this.body.setOffset(hb.ox, hb.oy);
    this.setDepth(5);
    this.body.setGravityY(0);
    this.body.setMaxVelocityX(300);

    this.play(sp?.walkKey ?? "boss-walk");

    this._specialCooldownMs = (bossConfig?.special?.intervalMs ?? 5000) * 0.5;
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

    if (this._cfg?.special && player?.active) {
      this._specialCooldownMs -= dt;
      if (this._specialCooldownMs <= 0) {
        this._specialCooldownMs = this._cfg.special.intervalMs;
        this._doSpecial(player);
      }
    }
  }

  /**
   * Fires a telegraphed special attack:
   *   1. Expanding coloured zone shows the danger area (220 ms warning)
   *   2. Delayed hit-check damages the player if still inside the radius
   */
  _doSpecial(player) {
    const cfg = this._cfg.special;
    const diameter = cfg.range * 2.2;

    const flash = this.scene.add
      .rectangle(this.x, this.y, diameter, diameter, cfg.color, 0.38)
      .setDepth(8);
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 460,
      ease: "Quad.easeOut",
      onComplete: () => flash.destroy(),
    });

    this.scene.time.delayedCall(220, () => {
      if (!this.active || !player.active) return;
      const dist = Phaser.Math.Distance.Between(
        this.x,
        this.y,
        player.x,
        player.y,
      );
      if (dist <= cfg.range) {
        this.scene._onBossSpecialHitPlayer?.(cfg.damage);
      }
    });
  }

  _die() {
    this._isDead = true;
    this.body.enable = false;
    this.play(this._cfg?.sprites?.deathKey ?? "boss-death");

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
