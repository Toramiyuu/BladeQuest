import Phaser from "phaser";

const KUNAI_SPEED = 350;
const KUNAI_MAX_DISTANCE = 300;
const KUNAI_DAMAGE = 1;
const KUNAI_SCALE = 0.3;

export { KUNAI_DAMAGE };

export default class Kunai extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, direction) {
    super(scene, x, y, "kunai", 0);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(KUNAI_SCALE);
    this.body.setAllowGravity(false);
    this.setFlipX(direction < 0);
    this.setDepth(9);

    this._startX = x;
    this._maxDistance = KUNAI_MAX_DISTANCE;
    this._direction = direction;
    this._launched = false;
  }

  update() {
    if (!this._launched) {
      this._launched = true;
      this.body.setAllowGravity(false);
      this.body.setVelocityX(KUNAI_SPEED * this._direction);
    }
    if (Math.abs(this.x - this._startX) >= this._maxDistance) {
      this.destroy();
    }
  }
}
