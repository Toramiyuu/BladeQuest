import Enemy from "./Enemy.js";
import SkeletonAI from "../systems/SkeletonAI.js";
import { MAX_DELTA_MS } from "../config/constants.js";

/**
 * SkeletonWarrior — melee enemy with a lunge attack.
 *
 * Uses the skeleton sprite set with a red tint as a placeholder.
 * AI: walk → pause → lunge → recover (see SkeletonAI).
 */
const SCALE = 0.6;
const BASE_HEALTH = 4;

export default class SkeletonWarrior extends Enemy {
  constructor(scene, x, y, groundLayer = null, health = BASE_HEALTH) {
    super(scene, x, y, "skel-idle", health);

    this._ai = new SkeletonAI();
    this._groundLayer = groundLayer;

    this.setScale(SCALE);
    this.setTint(0xff8866);
    this.body.setSize(22, 42);
    this.body.setOffset(21, 18);
    this.setDepth(5);
    this.body.setGravityY(0);
    this.body.setMaxVelocityX(250);

    this.play("skel-walk");
  }

  /**
   * @param {number} _time
   * @param {number} delta
   * @param {Phaser.GameObjects.Sprite} player  - used to supply playerOffsetX
   */
  update(_time, delta, player) {
    if (!this.active) return;
    const dt = Math.min(delta, MAX_DELTA_MS);

    const body = this.body;
    const halfW = this.width * 0.5;
    const lookX = this.x + this._ai.direction * halfW;
    const lookY = this.y + this.height * 0.5 + 4;

    let hasGroundAhead = true;
    let atLeftBound = false;
    let atRightBound = false;

    if (this._groundLayer) {
      const tile = this._groundLayer.getTileAtWorldXY(lookX, lookY);
      hasGroundAhead = tile !== null;
      atLeftBound = lookX < 0;
      atRightBound = lookX > this._groundLayer.layer.widthInPixels;
    } else {
      const worldW = this.scene.physics.world.bounds.width;
      atLeftBound = lookX < 0;
      atRightBound = lookX > worldW;
    }

    const playerOffsetX = player ? player.x - this.x : 999;

    const { vx } = this._ai.update({
      dt,
      blockedLeft: body.blocked.left,
      blockedRight: body.blocked.right,
      atLeftBound,
      atRightBound,
      hasGroundAhead,
      playerOffsetX,
    });

    body.setVelocityX(vx);
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
