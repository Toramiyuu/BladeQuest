import Phaser from "phaser";
import { UISceneHUDMixin } from "./UISceneHUD.js";
import { UISceneMinimapMixin } from "./UISceneMinimap.js";
import { UISceneOverlaysMixin } from "./UISceneOverlays.js";
import { UISceneStatsMixin } from "./UISceneStats.js";

export default class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: "UIScene" });
  }

  create() {
    const events = this.registry.get("events");

    this._hearts = [];
    this._maxHearts = 0;
    this._prevHealth = 0;

    const bind = (name, handler) => {
      events.off(name, handler, this);
      events.on(name, handler, this);
    };

    bind("health-changed", this._onHealthChanged);
    bind("mana-changed", this._onManaChanged);
    bind("floor-changed", this._onFloorChanged);
    bind("potion-loadout-changed", this._onPotionLoadoutChanged);
    bind("layout-changed", this._onLayoutChanged);
    bind("player-moved", this._onPlayerMoved);
    bind("ability-info", this._onAbilityInfo);
    bind("ability-used", this._onAbilityUsed);
    bind("save-complete", this._onSaveComplete);
    bind("save-failed", this._onSaveFailed);
    bind("boss-warning", this._onBossWarning);

    this._createManaBar();
    this._createAbilitySlot();
    this._createFloorText();
    this._createPotionSlots();
    this._createMinimap();
    this._initHelpKeys();
    this._initStatsKeys();
  }

  update() {
    this._updateManaBar();
  }
}

Object.assign(
  UIScene.prototype,
  UISceneHUDMixin,
  UISceneMinimapMixin,
  UISceneOverlaysMixin,
  UISceneStatsMixin,
);
