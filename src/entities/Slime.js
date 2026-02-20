import Enemy from "./Enemy.js";
import SlimeAI from "../systems/SlimeAI.js";
import { SLIME_HEALTH, MAX_DELTA_MS } from "../config/constants.js";

/**
 * Slime — ground-patrolling enemy.
 *
 * Receives a `groundLayer` reference (Phaser.Tilemaps.TilemapLayer or null).
 * When null (temp-ground mode), bounds detection uses world bounds only.
 */
const SKEL_SCALE = 0.55;

export default class Slime extends Enemy {
  constructor(scene, x, y, groundLayer = null) {
    super(scene, x, y, "skel-idle", SLIME_HEALTH);

    this._ai = new SlimeAI();
    this._groundLayer = groundLayer;

    this.setScale(SKEL_SCALE);
    this.body.setSize(24, 40);
    this.body.setOffset(20, 20);
    this.setDepth(5);
    this.body.setGravityY(0);
    this.body.setMaxVelocityX(200);

    this.play("skel-walk");
  }

  /**
   * Call from GameScene.update() while the slime is alive.
   * @param {number} _time
   * @param {number} delta
   */
  update(_time, delta) {
    if (!this.active) return;
    const _dt = Math.min(delta, MAX_DELTA_MS);

    const body = this.body;
    const halfW = this.width * 0.5;

    let hasGroundAhead = true;
    const lookX = this.x + this._ai.direction * halfW;
    const lookY = this.y + this.height * 0.5 + 4;

    if (this._groundLayer) {
      const tile = this._groundLayer.getTileAtWorldXY(lookX, lookY);
      hasGroundAhead = tile !== null;

      const atLeftBound = lookX < 0;
      const atRightBound = lookX > this._groundLayer.layer.widthInPixels;

      const { direction, speed } = this._ai.update({
        blockedLeft: body.blocked.left,
        blockedRight: body.blocked.right,
        hasGroundAhead,
        atLeftBound,
        atRightBound,
      });

      body.setVelocityX(direction * speed);
    } else {
      const worldW = this.scene.physics.world.bounds.width;
      const atLeftBound = lookX < 0;
      const atRightBound = lookX > worldW;

      const { direction, speed } = this._ai.update({
        blockedLeft: body.blocked.left,
        blockedRight: body.blocked.right,
        hasGroundAhead: true,
        atLeftBound,
        atRightBound,
      });

      body.setVelocityX(direction * speed);
    }

    this.setFlipX(this._ai.direction === 1);
  }

  _die() {
    this._isDead = true;
    this.body.enable = false;
    this.play("skel-death");
    this.once("animationcomplete", () => {
      this.scene.tweens.add({
        targets: this,
        alpha: 0,
        duration: 200,
        onComplete: () => {
          this.setActive(false);
          this.destroy();
        },
      });
    });
  }
}
