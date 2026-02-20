/**
 * UISceneHUD — core HUD display methods mixed into UIScene prototype.
 *
 * Handles: hearts, mana bar, floor text, ability slot, potion slots.
 * Applied via Object.assign(UIScene.prototype, UISceneHUDMixin).
 */

import {
  GAME_WIDTH,
  HUD_HEART_X,
  HUD_HEART_Y,
  HUD_HEART_SPACING,
} from "../config/constants.js";
import { PIXEL_FONT } from "../config/PixelFont.js";

const MANA_BAR_X = 12;
const MANA_BAR_Y = 30;
const MANA_BAR_W = 60;
const MANA_BAR_H = 6;

export const UISceneHUDMixin = {
  _createManaBar() {
    this._manaBg = this.add
      .rectangle(MANA_BAR_X, MANA_BAR_Y, MANA_BAR_W, MANA_BAR_H, 0x222244)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(100);

    this._manaFill = this.add
      .rectangle(MANA_BAR_X, MANA_BAR_Y, MANA_BAR_W, MANA_BAR_H, 0x4488ff)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(101);

    this._manaTarget = MANA_BAR_W;
  },

  _createFloorText() {
    this._floorText = this.add
      .bitmapText(GAME_WIDTH - 8, 8, PIXEL_FONT, "Floor 1", 8)
      .setOrigin(1, 0)
      .setTint(0xcccccc)
      .setScrollFactor(0)
      .setDepth(100);
  },

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
  },

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
  },

  _onManaChanged({ current, max }) {
    if (!this._manaFill) return;
    const ratio = max > 0 ? current / max : 0;
    this._manaTarget = MANA_BAR_W * ratio;
  },

  _updateManaBar() {
    if (!this._manaFill || this._manaTarget === undefined) return;
    this._manaFill.width += (this._manaTarget - this._manaFill.width) * 0.15;
  },

  _onFloorChanged(floor) {
    if (this._floorText) {
      this._floorText.setText(`Floor ${floor}`);
    }

    if (this._floorCard) {
      this._floorCard.destroy();
      this._floorCard = null;
    }
    const card = this.add
      .bitmapText(240, 135, PIXEL_FONT, `FLOOR ${floor}`, 16)
      .setOrigin(0.5)
      .setTint(0xffcc44)
      .setScrollFactor(0)
      .setDepth(150)
      .setAlpha(0)
      .setScale(0.5);
    this._floorCard = card;

    this.tweens.chain({
      targets: card,
      tweens: [
        { alpha: 1, scaleX: 1, scaleY: 1, duration: 300, ease: "Quad.easeOut" },
        { alpha: 1, duration: 800 },
        {
          alpha: 0,
          y: 115,
          duration: 400,
          onComplete: () => {
            card.destroy();
            if (this._floorCard === card) this._floorCard = null;
          },
        },
      ],
    });
  },

  _onBossWarning() {
    const flash = this.add
      .rectangle(240, 135, 480, 270, 0xffffff, 0.6)
      .setScrollFactor(0)
      .setDepth(196);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 200,
      onComplete: () => flash.destroy(),
    });

    const txt = this.add
      .bitmapText(240, 135, PIXEL_FONT, "WARNING", 16)
      .setOrigin(0.5)
      .setTint(0xff4444)
      .setScrollFactor(0)
      .setDepth(197)
      .setAlpha(0)
      .setScale(2);
    this.tweens.chain({
      targets: txt,
      tweens: [
        { alpha: 1, scaleX: 1, scaleY: 1, duration: 200, ease: "Quad.easeOut" },
        { alpha: 1, duration: 600 },
        { alpha: 0, duration: 300, onComplete: () => txt.destroy() },
      ],
    });
  },

  _createPotionSlots() {
    const slotSize = 16,
      gap = 4;
    const rightEdge = GAME_WIDTH - 4;
    const slotY = 255;

    this._potionSlots = [0, 1, 2].map((i) => {
      const x = rightEdge - (2 - i) * (slotSize + gap) - slotSize / 2;
      const box = this.add
        .rectangle(x, slotY, slotSize, slotSize, 0x222222)
        .setStrokeStyle(1, 0x555555)
        .setScrollFactor(0)
        .setDepth(100);
      const icon = this.add
        .image(x, slotY, "item-01")
        .setDisplaySize(slotSize, slotSize)
        .setScrollFactor(0)
        .setDepth(101)
        .setVisible(false);
      const keyLbl = this.add
        .bitmapText(x, slotY - slotSize / 2 - 1, PIXEL_FONT, `${i + 1}`, 8)
        .setOrigin(0.5, 1)
        .setTint(0x888888)
        .setScrollFactor(0)
        .setDepth(101);
      const countLbl = this.add
        .bitmapText(x + slotSize / 2, slotY + slotSize / 2, PIXEL_FONT, "", 8)
        .setOrigin(1, 1)
        .setTint(0xffffff)
        .setScrollFactor(0)
        .setDepth(102);
      return { box, icon, keyLbl, countLbl };
    });
  },

  _createAbilitySlot() {
    const SLOT_X = 80,
      SLOT_Y = 30,
      SLOT_W = 50,
      SLOT_H = 6;
    this._abilitySlotW = SLOT_W;
    this.add
      .rectangle(SLOT_X, SLOT_Y, SLOT_W, SLOT_H, 0x222222)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(100);
    this._abilityFill = this.add
      .rectangle(SLOT_X, SLOT_Y, SLOT_W, SLOT_H, 0x4488ff)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(101);
    this._abilityLabel = this.add
      .bitmapText(
        SLOT_X + SLOT_W / 2,
        SLOT_Y + SLOT_H + 2,
        PIXEL_FONT,
        "ability [C]",
        8,
      )
      .setOrigin(0.5, 0)
      .setTint(0x888888)
      .setScrollFactor(0)
      .setDepth(100);
  },

  _onAbilityInfo({ abilityId, cooldownMs }) {
    if (!this._abilityFill) return;
    this._abilityCooldownMs = cooldownMs;
    const color = abilityId === "holy-slash" ? 0xffdd44 : 0x4488ff;
    this._abilityFill.setFillStyle(color).width = this._abilitySlotW;
    const isHoly = abilityId === "holy-slash";
    this._abilityLabel
      .setText(isHoly ? "Holy Slash [C]" : "Kunai [C]")
      .setTint(isHoly ? 0xffdd44 : 0x4488ff);
    if (this._abilityCooldownTween) this._abilityCooldownTween.stop();
  },

  _onAbilityUsed({ cooldownMs }) {
    if (!this._abilityFill) return;
    if (this._abilityCooldownTween) this._abilityCooldownTween.stop();
    this._abilityFill.width = 0;
    this._abilityCooldownTween = this.tweens.add({
      targets: this._abilityFill,
      width: this._abilitySlotW,
      duration: cooldownMs,
      ease: "Linear",
    });
  },

  _onPotionLoadoutChanged({ loadout, counts }) {
    if (!this._potionSlots) return;
    const ICON_MAP = {
      health: "item-01",
      speed: "item-05",
      strength: "item-10",
    };
    this._potionSlots.forEach((slot, i) => {
      const type = loadout[i];
      if (type) {
        const count = counts[type] ?? 0;
        slot.icon.setTexture(ICON_MAP[type] ?? "item-01").setVisible(true);
        slot.box.setFillStyle(count > 0 ? 0x112211 : 0x221111);
        slot.box.setStrokeStyle(1, count > 0 ? 0x44aa44 : 0x552222);
        slot.countLbl.setText(count > 0 ? `${count}` : "");
      } else {
        slot.icon.setVisible(false);
        slot.box.setFillStyle(0x222222).setStrokeStyle(1, 0x555555);
        slot.countLbl.setText("");
      }
    });
  },
};
