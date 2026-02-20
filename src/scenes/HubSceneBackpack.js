/**
 * HubSceneBackpack — grid-style backpack panel mixin for HubScene.
 *
 * Press B to open, ESC or B again to close. Shows potion loadout slots with
 * icons/counts, gold, materials, and equipment tiers. Reads live state from
 * InventorySystem.
 * Applied via Object.assign(HubScene.prototype, HubSceneBackpackMixin).
 */

import Phaser from "phaser";
import InventorySystem from "../systems/InventorySystem.js";
import { GAME_WIDTH, GAME_HEIGHT } from "../config/constants.js";
import { PIXEL_FONT } from "../config/PixelFont.js";

const POTION_ICONS = {
  health: "item-01",
  speed: "item-05",
  strength: "item-10",
};
const POTION_NAMES = { health: "Health", speed: "Speed", strength: "Strength" };

export const HubSceneBackpackMixin = {
  _initBackpackKey() {
    const kB = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.B);
    const kEsc = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    kB.on("down", () => this._toggleBackpack());
    kEsc.on("down", () => {
      if (this._backpackVisible) this._hideBackpack();
    });
  },

  _toggleBackpack() {
    if (this._backpackVisible) {
      this._hideBackpack();
    } else {
      this._showBackpack();
    }
  },

  _showBackpack() {
    if (this._backpackVisible) return;
    this._backpackVisible = true;

    const inv = InventorySystem.getInventory();
    const panelW = 280,
      panelH = 160;
    const cx = GAME_WIDTH / 2,
      cy = GAME_HEIGHT / 2;

    this._backpackObjects = [];

    const bg = this.add
      .rectangle(cx, cy, panelW, panelH, 0x0a0a1a, 0.93)
      .setScrollFactor(0)
      .setDepth(300);
    this._backpackObjects.push(bg);

    const border = this.add
      .rectangle(cx, cy, panelW, panelH)
      .setStrokeStyle(1, 0x445566)
      .setFillStyle()
      .setScrollFactor(0)
      .setDepth(301);
    this._backpackObjects.push(border);

    const title = this.add
      .bitmapText(cx, cy - panelH / 2 + 6, PIXEL_FONT, "BACKPACK  [B]", 8)
      .setOrigin(0.5, 0)
      .setTint(0xaaccff)
      .setScrollFactor(0)
      .setDepth(302);
    this._backpackObjects.push(title);

    const lx = cx - panelW / 2 + 12;
    const vx = cx + 10;
    let y = cy - panelH / 2 + 20;

    this._backpackObjects.push(
      this.add
        .bitmapText(lx, y, PIXEL_FONT, "GOLD", 8)
        .setTint(0xffcc44)
        .setScrollFactor(0)
        .setDepth(302),
      this.add
        .bitmapText(vx, y, PIXEL_FONT, `${inv.gold}`, 8)
        .setTint(0xffffff)
        .setScrollFactor(0)
        .setDepth(302),
    );
    y += 13;

    const mat = inv.materials ?? { bones: 0, crystals: 0, essence: 0 };
    this._backpackObjects.push(
      this.add
        .bitmapText(lx, y, PIXEL_FONT, "MATERIALS", 8)
        .setTint(0xffcc44)
        .setScrollFactor(0)
        .setDepth(302),
      this.add
        .bitmapText(
          vx,
          y,
          PIXEL_FONT,
          `B:${mat.bones ?? 0} C:${mat.crystals ?? 0} E:${mat.essence ?? 0}`,
          8,
        )
        .setTint(0xaabbcc)
        .setScrollFactor(0)
        .setDepth(302),
    );
    y += 10;

    this._backpackObjects.push(
      this.add
        .rectangle(cx, y + 3, panelW - 20, 1, 0x334455)
        .setScrollFactor(0)
        .setDepth(302),
    );
    y += 10;

    const loadout = inv.potionLoadout ?? [null, null, null];
    const counts = inv.potionCounts ?? { health: 0, speed: 0, strength: 0 };
    for (let i = 0; i < 3; i++) {
      const type = loadout[i];
      const slotLabel = `SLOT ${i + 1}`;
      this._backpackObjects.push(
        this.add
          .bitmapText(lx, y, PIXEL_FONT, slotLabel, 8)
          .setTint(0x888899)
          .setScrollFactor(0)
          .setDepth(302),
      );

      if (type) {
        const icon = this.add
          .image(lx + 46, y + 4, POTION_ICONS[type])
          .setDisplaySize(10, 10)
          .setScrollFactor(0)
          .setDepth(302);
        const nameTxt = this.add
          .bitmapText(lx + 58, y, PIXEL_FONT, POTION_NAMES[type], 8)
          .setTint(0xddffdd)
          .setScrollFactor(0)
          .setDepth(302);
        const countTxt = this.add
          .bitmapText(lx + 116, y, PIXEL_FONT, `x${counts[type] ?? 0}`, 8)
          .setTint(0xaaffaa)
          .setScrollFactor(0)
          .setDepth(302);
        this._backpackObjects.push(icon, nameTxt, countTxt);
      } else {
        this._backpackObjects.push(
          this.add
            .bitmapText(lx + 46, y, PIXEL_FONT, "(empty)", 8)
            .setTint(0x555566)
            .setScrollFactor(0)
            .setDepth(302),
        );
      }
      y += 13;
    }

    this._backpackObjects.push(
      this.add
        .rectangle(cx, y + 3, panelW - 20, 1, 0x334455)
        .setScrollFactor(0)
        .setDepth(302),
    );
    y += 10;

    const weaponNames = ["Iron Blade", "Tempered Blade", "Flame Blade"];
    const armorNames = ["Leather Armor", "Chain Mail"];
    this._backpackObjects.push(
      this.add
        .bitmapText(lx, y, PIXEL_FONT, "SWORD", 8)
        .setTint(0xffcc44)
        .setScrollFactor(0)
        .setDepth(302),
      this.add
        .bitmapText(
          vx,
          y,
          PIXEL_FONT,
          `Tier ${inv.weaponTier} - ${weaponNames[inv.weaponTier] ?? ""}`,
          8,
        )
        .setTint(0xffffff)
        .setScrollFactor(0)
        .setDepth(302),
    );
    y += 13;
    this._backpackObjects.push(
      this.add
        .bitmapText(lx, y, PIXEL_FONT, "ARMOR", 8)
        .setTint(0xffcc44)
        .setScrollFactor(0)
        .setDepth(302),
      this.add
        .bitmapText(
          vx,
          y,
          PIXEL_FONT,
          `Tier ${inv.armorTier} - ${armorNames[inv.armorTier] ?? ""}`,
          8,
        )
        .setTint(0xffffff)
        .setScrollFactor(0)
        .setDepth(302),
    );
  },

  _hideBackpack() {
    if (!this._backpackVisible) return;
    this._backpackVisible = false;
    this._backpackObjects?.forEach((o) => o.destroy());
    this._backpackObjects = [];
  },
};
