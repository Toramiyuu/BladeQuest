/**
 * NarrativeScene — opening story crawl shown once on first launch.
 *
 * Checks localStorage for "bladequest_narrative_seen". If not set, scrolls
 * lore text upward over ~8 seconds then transitions to HubScene.
 * Press Space / Enter to skip at any time.
 */
import Phaser from "phaser";
import { GAME_WIDTH, GAME_HEIGHT } from "../config/constants.js";
import { PIXEL_FONT } from "../config/PixelFont.js";

const SEEN_KEY = "bladequest_narrative_seen";
const SCROLL_DURATION = 8500;

const LORE = [
  "A G E S   A G O",
  "",
  "The kingdom of Ashveil was torn apart",
  "when the Shadow Sovereign shattered",
  "the Seal of Light.",
  "",
  "Monsters flooded the ancient ruins",
  "beneath the city. The dungeon grew",
  "deeper — and darker — with every year.",
  "",
  "You are a Seeker.",
  "Armed with blade and will alone,",
  "you descend to reclaim what was lost.",
  "",
  "The Sovereign waits at floor 40.",
  "",
  "G O O D   L U C K.",
];

export default class NarrativeScene extends Phaser.Scene {
  constructor() {
    super({ key: "NarrativeScene" });
  }

  create() {
    if (localStorage.getItem(SEEN_KEY)) {
      this.scene.start("HubScene");
      return;
    }
    localStorage.setItem(SEEN_KEY, "1");

    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000).setOrigin(0, 0);

    const lineH = 14;
    const startY = GAME_HEIGHT + 20;
    const totalH = LORE.length * lineH;
    const endY = -totalH - 20;

    this._texts = LORE.map((line, i) => {
      const isTitle = i === 0;
      return this.add
        .bitmapText(
          GAME_WIDTH / 2,
          startY + i * lineH,
          PIXEL_FONT,
          line,
          isTitle ? 10 : 8,
        )
        .setOrigin(0.5, 0)
        .setTint(isTitle ? 0xffcc44 : 0xcccccc)
        .setAlpha(0);
    });

    this.tweens.add({
      targets: this._texts,
      alpha: 1,
      duration: 1200,
    });

    this.tweens.add({
      targets: this._texts,
      y: (target, _targetKey, value) => value + (endY - startY),
      duration: SCROLL_DURATION,
      ease: "Linear",
      onComplete: () => this._finish(),
    });

    const skip = () => this._finish();
    this.input.keyboard.once("keydown-SPACE", skip);
    this.input.keyboard.once("keydown-ENTER", skip);
    this.input.on("pointerdown", skip);

    this.add
      .bitmapText(
        GAME_WIDTH / 2,
        GAME_HEIGHT - 12,
        PIXEL_FONT,
        "SPACE to skip",
        7,
      )
      .setOrigin(0.5, 1)
      .setTint(0x666666)
      .setAlpha(0.7);
  }

  _finish() {
    this.tweens.killAll();
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      this.scene.start("HubScene");
    });
  }
}
