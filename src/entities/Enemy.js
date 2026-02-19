import Phaser from "phaser";

/**
 * Enemy — base class for all enemies.
 *
 * Extends Phaser.Physics.Arcade.Sprite and provides shared behaviour:
 * basic health tracking and a virtual `takeDamage(amount)` method.
 * Subclasses implement AI via their own `update()` override.
 */
export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, health) {
    super(scene, x, y, texture);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setCollideWorldBounds(true);

    this._health = health;
    this._isDead = false;
  }

  get isDead() {
    return this._isDead;
  }

  /** Reduce HP and trigger death when depleted. */
  takeDamage(amount) {
    if (this._isDead) return;
    this._health -= amount;
    if (this._health <= 0) {
      this._die();
    }
  }

  /** Override in subclass for custom death effects; call super._die(). */
  _die() {
    this._isDead = true;
    this.setActive(false);
    this.body.enable = false;
  }
}
