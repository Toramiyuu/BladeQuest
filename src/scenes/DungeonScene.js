import Phaser from "phaser";
import ClassRegistry from "../config/classes.js";
import DungeonGenerator from "../systems/DungeonGenerator.js";
import InventorySystem from "../systems/InventorySystem.js";
import { createAnimations } from "../config/animations.js";
import { DungeonFloorMixin } from "./DungeonFloor.js";
import { DungeonCombatMixin } from "./DungeonCombat.js";
import { DungeonBossMixin } from "./DungeonBoss.js";
import { DungeonEventsMixin } from "./DungeonEvents.js";
import { DungeonPotionMixin } from "./DungeonPotion.js";
import { DungeonEffectsMixin } from "./DungeonEffects.js";
import AudioManager from "../systems/AudioManager.js";
import {
  MAX_DELTA_MS,
  CAMERA_LEAD_X,
  CAMERA_LERP_X,
  CAMERA_LERP_Y,
  FALL_DEATH_MARGIN,
} from "../config/constants.js";

const TILE_SIZE = 16;

export default class DungeonScene extends Phaser.Scene {
  constructor() {
    super({ key: "DungeonScene" });
  }

  init(data) {
    this._classId = data.classId || ClassRegistry.getDefault().id;
    this._startFloor = data.startFloor || 1;
    this._currentFloor = this._startFloor;
  }

  create() {
    this._events = this.registry.get("events");
    this._classConfig = ClassRegistry.getClass(this._classId);
    createAnimations(this.anims);

    this.player = null;
    this.enemyGroup = null;
    this.kunaiGroup = null;
    this.arrowGroup = null;
    this._buildFloor();
    this._setupCamera();

    this._isDying = false;
    this._dyingMs = 0;
    this._needsInitialHealthEmit = true;
    this._boss = null;
    this._bossDefeated = false;
    this._bossWarningShown = false;

    const startGold = InventorySystem.getInventory().gold;
    this._runStats = { kills: 0, goldStart: startGold };

    this.add
      .image(240, 135, "vignette-overlay")
      .setScrollFactor(0)
      .setDepth(-1);

    this._audio = new AudioManager(this.game);
    this.events.once("shutdown", () => this._audio?.destroy());
    this._audio.startMusic("dungeon");

    this.scene.launch("UIScene");
    this._emitFloorChanged();
    this._setupPotionKeys();
    this.input.keyboard.on("keydown", (e) => {
      if (
        e.keyCode === Phaser.Input.Keyboard.KeyCodes.H ||
        e.keyCode === Phaser.Input.Keyboard.KeyCodes.F1
      ) {
        if (!this.scene.isActive("KeybindingsScene")) {
          this.scene.launch("KeybindingsScene");
        }
      }
    });
    this.cameras.main.fadeIn(400, 0, 0, 0);
  }

  _buildFloor() {
    this._destroyColliders();
    this._layout = DungeonGenerator.generate(this._currentFloor);
    this._buildTilemap();
    this._spawnPlayer();
    this._spawnEnemies();
    this._spawnBoss();
    this._spawnPassage();
    this._setupOverlaps();
    this._bossDefeated = false;
    this._bossWarningShown = false;
    this._spawnDustParticles();
    this._emitLayoutChanged();
    this._emitAbilityInfo();
  }

  _setupCamera() {
    this._cameraTarget = this.add
      .rectangle(this.player.x, this.player.y, 1, 1)
      .setVisible(false);
    this.cameras.main.startFollow(this._cameraTarget, true);
    this.cameras.main.setDeadzone(40, 20);
  }

  update(_time, delta) {
    const dt = Math.min(delta, MAX_DELTA_MS);

    if (this._needsInitialHealthEmit) {
      this._needsInitialHealthEmit = false;
      this._emitHealthChanged();
    }

    if (this._isDying) {
      this._handleDeath(dt);
      return;
    }

    if (this._healthSystem.isDead()) {
      this._handleDeath(dt);
      return;
    }

    const worldH = this._layout.height * TILE_SIZE;
    if (this.player.y > worldH + FALL_DEATH_MARGIN) {
      this._healthSystem.kill();
      this._emitHealthChanged();
      this._handleDeath(dt);
      return;
    }

    this._healthSystem.update(dt);
    this.player.update(_time, dt);
    this.player.updateInvulnerabilityFlash(dt);

    const fallLimit = worldH + FALL_DEATH_MARGIN;
    this.enemyGroup.getChildren().forEach((enemy) => {
      if (!enemy.active) return;
      if (enemy.y > fallLimit) {
        enemy.setActive(false);
        enemy.destroy();
        return;
      }
      enemy.update(_time, dt, this.player);
    });

    this._emitManaChanged();
    this._emitPlayerMoved();
    this._checkBossDefeated();
    this._checkPassage();
    this._checkBossWarning();
    this._checkPotionKeys();

    const leadX = this.player.x + this.player.facing * CAMERA_LEAD_X;
    this._cameraTarget.x = Phaser.Math.Linear(
      this._cameraTarget.x,
      leadX,
      CAMERA_LERP_X,
    );
    this._cameraTarget.y = Phaser.Math.Linear(
      this._cameraTarget.y,
      this.player.y,
      CAMERA_LERP_Y,
    );
  }
}

Object.assign(
  DungeonScene.prototype,
  DungeonFloorMixin,
  DungeonCombatMixin,
  DungeonBossMixin,
  DungeonEventsMixin,
  DungeonPotionMixin,
  DungeonEffectsMixin,
);
