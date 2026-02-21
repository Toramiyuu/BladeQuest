import Phaser from "phaser";

const ARROW_SPEED = 200;
const ARROW_MAX_DISTANCE = 300;
const ARROW_DAMAGE = 1;
const ARROW_SCALE = 0.3;

export { ARROW_DAMAGE };

/**
 * Arrow — projectile fired by ArcherGoblin enemies.
 *
 * Reuses the "kunai" texture with an orange tint as a placeholder.
 */
export default class Arrow extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, direction) {
    super(scene, x, y, "kunai", 0);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(ARROW_SCALE);
    this.setTint(0xff9944);
    this.body.setAllowGravity(false);
    this.setFlipX(direction < 0);
    this.setDepth(9);

    this._startX = x;
    this._maxDistance = ARROW_MAX_DISTANCE;
    this._direction = direction;
  }

  update() {
    this.body.setVelocityX(ARROW_SPEED * this._direction);
    if (Math.abs(this.x - this._startX) >= this._maxDistance) {
      this.destroy();
    }
  }
}
