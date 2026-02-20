import Phaser from "phaser";

const SCALE = 0.35;
const MOVE_SPEED = 120;
const JUMP_VELOCITY = -320;
const BODY_W = 30;
const BODY_H = 64;
const BODY_OFFSET_X = 50;
const BODY_OFFSET_Y = 58;

/**
 * HubPlayer — lightweight player for the hub town scene.
 * Handles left/right movement and jumping only.
 * Does NOT instantiate HealthSystem, ManaSystem, AbilitySystem, or combat hitboxes.
 */
export default class HubPlayer extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "player-idle", 0);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(SCALE);
    this.body.setSize(BODY_W, BODY_H);
    this.body.setOffset(BODY_OFFSET_X, BODY_OFFSET_Y);
    this.body.setCollideWorldBounds(true);
    this.setDepth(10);

    this._cursors = scene.input.keyboard.addKeys({
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      arrowLeft: Phaser.Input.Keyboard.KeyCodes.LEFT,
      arrowRight: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      jump: Phaser.Input.Keyboard.KeyCodes.SPACE,
      jumpW: Phaser.Input.Keyboard.KeyCodes.W,
      jumpUp: Phaser.Input.Keyboard.KeyCodes.UP,
    });

    this._jumpPressed = false;
  }

  update() {
    const body = this.body;
    const keys = this._cursors;
    const onGround = body.blocked.down;

    const goLeft =
      Phaser.Input.Keyboard.JustDown(keys.left) ||
      keys.left.isDown ||
      keys.arrowLeft.isDown;
    const goRight =
      Phaser.Input.Keyboard.JustDown(keys.right) ||
      keys.right.isDown ||
      keys.arrowRight.isDown;

    if (goLeft && !goRight) {
      body.setVelocityX(-MOVE_SPEED);
      this.setFlipX(true);
    } else if (goRight && !goLeft) {
      body.setVelocityX(MOVE_SPEED);
      this.setFlipX(false);
    } else {
      body.setVelocityX(0);
    }

    const wantsJump =
      keys.jump.isDown || keys.jumpW.isDown || keys.jumpUp.isDown;
    if (wantsJump && onGround && !this._jumpPressed) {
      body.setVelocityY(JUMP_VELOCITY);
      this._jumpPressed = true;
    }
    if (!wantsJump) this._jumpPressed = false;

    if (!onGround) {
      if (this.anims.currentAnim?.key !== "player-jump-up") {
        this.play("player-jump-up", true);
      }
    } else if (body.velocity.x !== 0) {
      if (this.anims.currentAnim?.key !== "player-run") {
        this.play("player-run", true);
      }
    } else {
      if (this.anims.currentAnim?.key !== "player-idle") {
        this.play("player-idle", true);
      }
    }
  }
}
