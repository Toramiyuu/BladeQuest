import Phaser from "phaser";
import { PIXEL_FONT } from "../config/PixelFont.js";
import { NPC_DIALOGUE } from "../config/npcDialogue.js";

const SCALE = 0.35;
const PROMPT_TEXT = "E  Interact";

/**
 * HubNPC — animated, non-physics NPC for the hub town scene.
 * Shows an interaction prompt and switches between idle and dialogue
 * animations based on player proximity.
 */
export default class HubNPC extends Phaser.GameObjects.Sprite {
  constructor(
    scene,
    x,
    y,
    idleKey,
    dialogueKey,
    idleFrames,
    dialogueFrames,
    role,
  ) {
    super(scene, x, y, idleKey, 0);
    scene.add.existing(this);

    this.role = role;
    this._idleKey = idleKey;
    this._dialogueKey = dialogueKey;
    this._dialogueLines = NPC_DIALOGUE[role] ?? [];
    this._dialogueIndex = 0;
    this._speechBubble = null;
    this._speechTimer = null;

    this.setScale(SCALE);
    this.setDepth(5);

    if (!scene.anims.exists(`${idleKey}-anim`)) {
      scene.anims.create({
        key: `${idleKey}-anim`,
        frames: scene.anims.generateFrameNumbers(idleKey, {
          start: 0,
          end: idleFrames - 1,
        }),
        frameRate: 8,
        repeat: -1,
      });
    }

    if (!scene.anims.exists(`${dialogueKey}-anim`)) {
      scene.anims.create({
        key: `${dialogueKey}-anim`,
        frames: scene.anims.generateFrameNumbers(dialogueKey, {
          start: 0,
          end: dialogueFrames - 1,
        }),
        frameRate: 8,
        repeat: -1,
      });
    }

    this.play(`${idleKey}-anim`);

    this._promptBg = scene.add
      .rectangle(x, y - 34, 96, 14, 0x000000, 0.6)
      .setOrigin(0.5, 0.5)
      .setDepth(9)
      .setVisible(false);

    this._prompt = scene.add
      .bitmapText(x, y - 30, PIXEL_FONT, PROMPT_TEXT, 8)
      .setOrigin(0.5, 1)
      .setTint(0xffffff)
      .setDepth(10)
      .setVisible(false);
  }

  /** Call each frame from HubScene.update() with whether player is within 48px. */
  setNearby(isNear) {
    this._promptBg.setVisible(isNear);
    this._prompt.setVisible(isNear);

    if (isNear) {
      if (this.anims.currentAnim?.key !== `${this._dialogueKey}-anim`) {
        this.play(`${this._dialogueKey}-anim`);
      }
    } else {
      if (this.anims.currentAnim?.key !== `${this._idleKey}-anim`) {
        this.play(`${this._idleKey}-anim`);
      }
    }
  }

  /** Cycle to the next dialogue line and show a speech bubble for 3 seconds. */
  showDialogueLine() {
    if (this._dialogueLines.length === 0) return;
    this._speechBubble?.destroy();
    if (this._speechTimer) {
      this._speechTimer.remove();
      this._speechTimer = null;
    }
    const line =
      this._dialogueLines[this._dialogueIndex % this._dialogueLines.length];
    this._dialogueIndex++;
    const bx = this.x;
    const by = this.y - 52;
    const txt = this.scene.add
      .bitmapText(bx, by, PIXEL_FONT, line, 7)
      .setOrigin(0.5, 1)
      .setTint(0xffffff)
      .setDepth(20)
      .setMaxWidth(110);
    const bounds = txt.getTextBounds();
    const padX = 8,
      padY = 5;
    const bg = this.scene.add
      .rectangle(
        bx,
        by - bounds.local.height / 2 - padY,
        bounds.local.width + padX * 2,
        bounds.local.height + padY * 2,
        0x000000,
        0.75,
      )
      .setDepth(19);
    this._speechBubble = this.scene.add.container(0, 0, [bg, txt]);
    this._speechBubble.setDepth(19);
    this._speechTimer = this.scene.time.delayedCall(3000, () => {
      this._speechBubble?.destroy();
      this._speechBubble = null;
    });
  }

  destroy(fromScene) {
    this._promptBg?.destroy();
    this._prompt?.destroy();
    this._speechBubble?.destroy();
    if (this._speechTimer) this._speechTimer.remove();
    super.destroy(fromScene);
  }
}
