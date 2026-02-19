import Phaser from "phaser";
import {
  HUD_HEART_X,
  HUD_HEART_Y,
  HUD_HEART_SPACING,
} from "../config/constants.js";

export default class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: "UIScene" });
  }

  create() {
    const events = this.registry.get("events");

    events.off("health-changed", this._onHealthChanged, this);
    events.on("health-changed", this._onHealthChanged, this);

    this._hearts = [];
    this._maxHearts = 0;
    this._prevHealth = 0;
  }

  /** Lazily build or rebuild heart images when max changes. */
  _buildHearts(max) {
    this._hearts.forEach((h) => h.destroy());
    this._hearts = [];
    this._maxHearts = max;

    for (let i = 0; i < max; i++) {
      const x = HUD_HEART_X + i * HUD_HEART_SPACING;
      const img = this.add
        .image(x, HUD_HEART_Y, "heart-full")
        .setOrigin(0, 0)
        .setScrollFactor(0)
        .setDepth(100);
      this._hearts.push(img);
    }
  }

  _onHealthChanged({ current, max }) {
    if (max !== this._maxHearts) {
      this._buildHearts(max);
    }

    this._hearts.forEach((heart, i) => {
      const isFull = i < current;
      heart.setTexture(isFull ? "heart-full" : "heart-empty");
    });

    const damagedIndex = current;
    const isDamage = current < this._prevHealth;
    this._prevHealth = current;

    if (isDamage && damagedIndex >= 0 && damagedIndex < this._hearts.length) {
      const h = this._hearts[damagedIndex];
      this.tweens.add({
        targets: h,
        scaleX: 1.4,
        scaleY: 1.4,
        duration: 80,
        yoyo: true,
        ease: "Quad.easeOut",
      });
    }
  }
}
