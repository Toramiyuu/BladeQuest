/**
 * DungeonEffects — screen-space visual effect helpers mixed into DungeonScene.
 *
 * Applied via Object.assign(DungeonScene.prototype, DungeonEffectsMixin).
 */

export const DungeonEffectsMixin = {
  /** Two-tone RGB-split flash for chromatic aberration on player damage. */
  _spawnChromaFlash() {
    const spawn = (dx, color) => {
      const r = this.add
        .rectangle(240 + dx, 135, 480, 270, color, 0.2)
        .setScrollFactor(0)
        .setDepth(196)
        .setBlendMode(1);
      this.tweens.add({
        targets: r,
        alpha: 0,
        duration: 55,
        onComplete: () => r.destroy(),
      });
    };
    spawn(3, 0xff2200);
    spawn(-3, 0x0033ff);
  },

  /** "FIRST BLOOD!" text pop above the enemy that triggered it. */
  _showFirstBloodIndicator(x, y) {
    const txt = this.add
      .bitmapText(x, y - 28, "pixel", "FIRST BLOOD!", 9)
      .setOrigin(0.5)
      .setTint(0xff6622)
      .setDepth(65);
    this.tweens.add({
      targets: txt,
      y: y - 52,
      alpha: 0,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 900,
      ease: "Quad.easeOut",
      onComplete: () => txt.destroy(),
    });
  },

  /** Burst of 7 pixel-square particles outward when an enemy dies. */
  _spawnDeathParticles(x, y) {
    const COLORS = [0xeeeeee, 0xcccccc, 0xaaaaaa, 0x888888];
    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI * 2;
      const dist = 18 + Math.random() * 26;
      const ex = x + Math.cos(angle) * dist;
      const ey = y + Math.sin(angle) * dist - 14;
      const size = 2 + Math.floor(Math.random() * 2);
      const p = this.add
        .rectangle(x, y, size, size, COLORS[i % COLORS.length])
        .setDepth(30)
        .setOrigin(0.5);
      this.tweens.add({
        targets: p,
        x: ex,
        y: ey,
        alpha: 0,
        duration: 320 + Math.floor(Math.random() * 160),
        ease: "Quad.easeOut",
        onComplete: () => p.destroy(),
      });
    }
  },
};
