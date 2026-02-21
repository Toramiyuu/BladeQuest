import Enemy from "./Enemy.js";
import ArcherAI from "../systems/ArcherAI.js";
import Arrow from "./Arrow.js";
import { MAX_DELTA_MS } from "../config/constants.js";

/**
 * ArcherGoblin — ranged enemy that fires arrows at the player.
 *
 * Stands still and periodically fires when the player is within range.
 * Uses the skeleton idle sprite with a green tint as a placeholder.
 *
 * Arrow spawning adds to scene.arrowGroup (created by DungeonFloor).
 */
const SCALE = 0.5;
const BASE_HEALTH = 2;

export default class ArcherGoblin extends Enemy {
  constructor(scene, x, y, health = BASE_HEALTH) {
    super(scene, x, y, "skel-idle", health);

    this._ai = new ArcherAI();
    this._hasFired = false;

    this.setScale(SCALE);
    this.setTint(0x66dd66);
    this.body.setSize(20, 38);
    this.body.setOffset(22, 22);
    this.setDepth(5);
    this.body.setGravityY(0);
    this.body.setImmovable(true);

    this.play("skel-idle");
  }

  /**
   * @param {number} _time
   * @param {number} delta
   * @param {Phaser.GameObjects.Sprite} player
   */
  update(_time, delta, player) {
    if (!this.active) return;
    const dt = Math.min(delta, MAX_DELTA_MS);

    const playerOffsetX = player ? player.x - this.x : 999;
    const { shouldFire, facingDir } = this._ai.update({ dt, playerOffsetX });

    this.setFlipX(facingDir === 1);

    if (shouldFire && !this._hasFired) {
      this._hasFired = true;
      this._spawnArrow(facingDir);
    } else if (!shouldFire) {
      this._hasFired = false;
    }
  }

  _spawnArrow(dir) {
    if (!this.scene?.arrowGroup) return;
    const arrow = new Arrow(this.scene, this.x + dir * 12, this.y - 4, dir);
    this.scene.arrowGroup.add(arrow, true);
  }

  _die() {
    this._isDead = true;
    this.body.enable = false;
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 250,
      onComplete: () => {
        this.setActive(false);
        this.destroy();
      },
    });
  }
}
