import Enemy from "./Enemy.js";
import BatAI from "../systems/BatAI.js";
import { BAT_HEALTH, BAT_SPEED, MAX_DELTA_MS } from "../config/constants.js";

/**
 * Bat — flying enemy using sine-wave AI.
 *
 * Receives room pixel bounds so it stays within its spawn room.
 * Uses skeleton idle sprite with blue tint and smaller scale as placeholder.
 */
const BAT_SCALE = 0.4;

export default class Bat extends Enemy {
  constructor(scene, x, y, leftBound, rightBound, health = BAT_HEALTH) {
    super(scene, x, y, "skel-idle", health);

    this._ai = new BatAI({ speed: BAT_SPEED, leftBound, rightBound }, x);

    this.setScale(BAT_SCALE);
    this.setTint(0x4488ff);
    this.body.setSize(24, 30);
    this.body.setOffset(20, 20);
    this.setDepth(5);

    this.body.setAllowGravity(false);
    this.body.setCollideWorldBounds(false);

    this.play("bat-fly");
  }

  update(_time, delta) {
    if (!this.active) return;
    const dt = Math.min(delta, MAX_DELTA_MS);

    const { vx, vy } = this._ai.update(this.x, dt);
    this.body.setVelocity(vx, vy);
    this.setFlipX(vx > 0);
  }

  _die() {
    this._isDead = true;
    this.body.enable = false;
    this.setTint(0xff4444);
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 300,
      onComplete: () => {
        this.setActive(false);
        this.destroy();
      },
    });
  }
}
