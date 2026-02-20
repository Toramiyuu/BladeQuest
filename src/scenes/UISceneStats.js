/**
 * UISceneStats — character stats panel mixin for UIScene.
 *
 * TAB or I opens a read-only modal showing weapon/armor tier, mana,
 * abilities, gold, and materials from the save state.
 * Applied via Object.assign(UIScene.prototype, UISceneStatsMixin).
 */

import Phaser from "phaser";
import SaveManager from "../systems/SaveManager.js";
import ClassRegistry from "../config/classes.js";
import { GAME_WIDTH, GAME_HEIGHT } from "../config/constants.js";
import { PIXEL_FONT } from "../config/PixelFont.js";

/** Damage per weapon tier (tier 0 = base 1). */
const WEAPON_DAMAGE = [1, 2, 3];
/** Armour reduction per tier as a percent string. */
const ARMOR_REDUCTION = ["0%", "15%", "28%"];

export const UISceneStatsMixin = {
  _initStatsKeys() {
    const kTab = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TAB);
    const kI = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I);
    const kEsc = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    kTab.on("down", (e) => {
      e.preventDefault?.();
      this._toggleStatsPanel();
    });
    kI.on("down", () => this._toggleStatsPanel());
    kEsc.on("down", () => {
      if (this._statsVisible) this._hideStatsPanel();
    });
  },

  _toggleStatsPanel() {
    if (this._statsVisible) {
      this._hideStatsPanel();
    } else {
      this._showStatsPanel();
    }
  },

  _showStatsPanel() {
    if (this._statsVisible) return;
    this._statsVisible = true;

    const inv = SaveManager.getInventory();
    const classId =
      this.registry.get("selectedClassId") || ClassRegistry.getDefault().id;
    const cls = ClassRegistry.getClass(classId);

    const panelW = 260,
      panelH = 185;
    const cx = GAME_WIDTH / 2,
      cy = GAME_HEIGHT / 2;

    this._statsObjects = [];

    const bg = this.add
      .rectangle(cx, cy, panelW, panelH, 0x0a0a1a, 0.93)
      .setScrollFactor(0)
      .setDepth(300);
    this._statsObjects.push(bg);

    this.add
      .rectangle(cx, cy, panelW, panelH)
      .setStrokeStyle(1, 0x445566)
      .setFillStyle()
      .setScrollFactor(0)
      .setDepth(301);

    const wTier = inv.weaponTier ?? 0;
    const aTier = inv.armorTier ?? 0;
    const gold = inv.gold ?? 0;
    const mat = inv.materials ?? { bones: 0, crystals: 0, essence: 0 };
    const abilityName =
      cls.ability.id === "holy-slash" ? "Holy Slash" : "Kunai Throw";

    const lines = [
      { label: "CLASS", value: cls.label ?? classId },
      null,
      {
        label: "SWORD TIER",
        value: `${wTier}  (${WEAPON_DAMAGE[wTier] ?? wTier + 1} dmg)`,
      },
      {
        label: "ARMOR TIER",
        value: `${aTier}  (${ARMOR_REDUCTION[aTier] ?? "??"})`,
      },
      { label: "HEARTS", value: `${cls.stats.maxHealth}` },
      {
        label: "MANA",
        value: `${cls.stats.maxMana}  regen ${cls.stats.manaRegenRate}/s`,
      },
      { label: "ABILITY", value: abilityName },
      null,
      { label: "GOLD", value: `${gold}` },
      {
        label: "MATERIALS",
        value: `B:${mat.bones ?? 0} C:${mat.crystals ?? 0} E:${mat.essence ?? 0}`,
      },
    ];

    const title = this.add
      .bitmapText(
        cx,
        cy - panelH / 2 + 8,
        PIXEL_FONT,
        "CHARACTER STATS   [I / TAB]",
        8,
      )
      .setOrigin(0.5, 0)
      .setTint(0xaaccff)
      .setScrollFactor(0)
      .setDepth(302);
    this._statsObjects.push(title);

    let y = cy - panelH / 2 + 22;
    const lx = cx - panelW / 2 + 14;
    const rx = cx + 10;

    for (const row of lines) {
      if (!row) {
        y += 6;
        continue;
      }
      const lbl = this.add
        .bitmapText(lx, y, PIXEL_FONT, row.label, 8)
        .setTint(0xffcc44)
        .setScrollFactor(0)
        .setDepth(302);
      const val = this.add
        .bitmapText(rx, y, PIXEL_FONT, row.value, 8)
        .setTint(0xffffff)
        .setScrollFactor(0)
        .setDepth(302);
      this._statsObjects.push(lbl, val);
      y += 14;
    }
  },

  _hideStatsPanel() {
    if (!this._statsVisible) return;
    this._statsVisible = false;
    this._statsObjects?.forEach((o) => o.destroy());
    this._statsObjects = [];
  },
};
