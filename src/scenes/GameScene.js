import Phaser from "phaser";
import Player from "../entities/Player.js";
import Slime from "../entities/Slime.js";
import HealthSystem from "../systems/HealthSystem.js";
import {
  PLAYER_SPAWN_X,
  PLAYER_SPAWN_Y,
  MAX_HEALTH,
  MAX_DELTA_MS,
  SLIME_DAMAGE,
  HEAVY_KNOCKBACK_X,
  CAMERA_LEAD_X,
  CAMERA_LERP_X,
  CAMERA_LERP_Y,
  FALL_DEATH_MARGIN,
} from "../config/constants.js";
import { createAnimations } from "../config/animations.js";

const DEATH_FREEZE_MS = 800;

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameScene" });
  }

  create() {
    // NOTE: EventEmitter initialized once in BootScene — only retrieve here.
    this._events = this.registry.get("events");

    this._loadTilemap();
    createAnimations(this.anims);
    this._spawnEntities();
    this._setupOverlaps();
    this._setupCamera();

    this._healthSystem = new HealthSystem(MAX_HEALTH);
    this._healthSystem.grantInvulnerability();
    this.player.healthSystem = this._healthSystem;

    this._dyingMs = 0;
    this._isDying = false;
    this._prevHealth = MAX_HEALTH;

    this._needsInitialHealthEmit = true;
    this.scene.launch("UIScene");
  }

  _loadTilemap() {
    this.map = this.make.tilemap({ key: "test-level" });
    const tileset = this.map.addTilesetImage("tiles", "tiles");

    this._createParallaxBackground();

    this.bgLayer = this.map.createLayer("background", tileset, 0, 0);
    this.bgLayer.setAlpha(0);
    this.groundLayer = this.map.createLayer("ground", tileset, 0, 0);
    this.groundLayer.setCollisionByExclusion([-1]);

    this.physics.world.setBounds(
      0,
      0,
      this.map.widthInPixels,
      this.map.heightInPixels,
    );
    this.cameras.main.setBounds(
      0,
      0,
      this.map.widthInPixels,
      this.map.heightInPixels,
    );
  }

  _spawnEntities() {
    const objects = this.map.getObjectLayer("spawns").objects;
    const playerSpawn = objects.find((o) => o.type === "player");
    const slimeSpawns = objects.filter((o) => o.type === "slime");

    const px = playerSpawn ? playerSpawn.x : PLAYER_SPAWN_X;
    const py = playerSpawn ? playerSpawn.y : PLAYER_SPAWN_Y;
    this._spawnX = px;
    this._spawnY = py;

    this.player = new Player(this, px, py);
    this.physics.add.collider(this.player, this.groundLayer);

    this.slimeGroup = this.physics.add.group();
    for (const sp of slimeSpawns) {
      const slime = new Slime(this, sp.x, sp.y, this.groundLayer);
      this.slimeGroup.add(slime, true);
    }
    this.physics.add.collider(this.slimeGroup, this.groundLayer);
  }

  _setupOverlaps() {
    this.physics.add.overlap(
      this.player.groundHitbox,
      this.slimeGroup,
      this._onGroundSlashHit,
      null,
      this,
    );
    this.physics.add.overlap(
      this.player.airHitbox,
      this.slimeGroup,
      this._onAirSlashHit,
      null,
      this,
    );
    this.physics.add.overlap(
      this.player,
      this.slimeGroup,
      this._onPlayerContactSlime,
      null,
      this,
    );
  }

  _setupCamera() {
    this.cameraTarget = this.add
      .rectangle(this.player.x, this.player.y, 1, 1)
      .setVisible(false);
    this.cameras.main.startFollow(this.cameraTarget, true);
    this.cameras.main.setDeadzone(40, 20);
  }

  _onGroundSlashHit(_hitbox, slime) {
    if (this.player.hitEnemies.has(slime)) return;
    this.player.hitEnemies.add(slime);
    if (this.player.combatSystem.currentAttack === "heavy") {
      slime.body.setVelocityX(this.player.facing * HEAVY_KNOCKBACK_X);
    }
    slime.takeDamage(1);
  }

  _onAirSlashHit(_hitbox, slime) {
    if (this.player.hitEnemies.has(slime)) return;
    this.player.hitEnemies.add(slime);
    slime.takeDamage(1);
    this.player.applyAirSlashBounce();
  }

  _onPlayerContactSlime(_player, slime) {
    if (!slime.active) return;
    const before = this._healthSystem.currentHealth;
    this.player.takeDamage(SLIME_DAMAGE, slime.x);
    if (this._healthSystem.currentHealth !== before) {
      this._emitHealthChanged();
    }
  }

  _createParallaxBackground() {
    const cam = this.cameras.main;
    const vw = cam.width;
    const vh = cam.height;

    const sky = this.add.tileSprite(0, 0, vw, vh, "bg-sky");
    sky.setOrigin(0, 0);
    sky.setScrollFactor(0, 0);
    sky.setDisplaySize(vw, vh);
    sky.setDepth(-30);

    const hills = this.add.tileSprite(0, vh * 0.55, vw, 176, "bg-hills");
    hills.setOrigin(0, 0);
    hills.setScrollFactor(0, 0);
    hills.setDisplaySize(vw, 50);
    hills.setDepth(-20);

    const trees = this.add.tileSprite(0, vh * 0.45, vw, 387, "bg-trees");
    trees.setOrigin(0, 0);
    trees.setScrollFactor(0, 0);
    trees.setDisplaySize(vw, 70);
    trees.setAlpha(0.7);
    trees.setDepth(-10);

    this._bgLayers = { sky, hills, trees };
  }

  _emitHealthChanged() {
    if (this._events) {
      this._events.emit("health-changed", {
        current: this._healthSystem.currentHealth,
        max: this._healthSystem.maxHealth,
      });
    }
  }

  _handleDeath(dt) {
    if (!this._isDying) {
      this._isDying = true;
      this._dyingMs = DEATH_FREEZE_MS;
      this.player.body.setVelocity(0, 0);
      this.player.body.setAcceleration(0, 0);
      this.player.setTint(0xff4444);
      this.player.setAlpha(1);
    }
    this._dyingMs -= dt;
    if (this._dyingMs <= 0) {
      this._respawnPlayer();
    }
  }

  _respawnPlayer() {
    this._isDying = false;
    this._healthSystem.reset();
    this.player.respawn(this._spawnX, this._spawnY);
    this._emitHealthChanged();
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

    if (this.player.y > this.map.heightInPixels + FALL_DEATH_MARGIN) {
      this._healthSystem.kill();
      this._emitHealthChanged();
      this._handleDeath(dt);
      return;
    }

    this._prevHealth = this._healthSystem.currentHealth;
    this._healthSystem.update(dt);
    if (this._healthSystem.currentHealth !== this._prevHealth) {
      this._emitHealthChanged();
    }

    this.player.update(_time, dt);
    this.player.updateInvulnerabilityFlash(dt);

    this.slimeGroup.getChildren().forEach((slime) => {
      if (slime.active) slime.update(_time, dt);
    });

    const camX = this.cameras.main.scrollX;
    this._bgLayers.hills.tilePositionX = camX * 0.2;
    this._bgLayers.trees.tilePositionX = camX * 0.5;

    const leadX = this.player.x + this.player.facing * CAMERA_LEAD_X;
    this.cameraTarget.x = Phaser.Math.Linear(
      this.cameraTarget.x,
      leadX,
      CAMERA_LERP_X,
    );
    this.cameraTarget.y = Phaser.Math.Linear(
      this.cameraTarget.y,
      this.player.y,
      CAMERA_LERP_Y,
    );
  }
}
