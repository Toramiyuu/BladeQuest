/**
 * DungeonFloor — floor construction and traversal methods mixed into DungeonScene.
 *
 * Handles: tilemap, player/enemy spawning, passage, dust particles, floor advance.
 * Applied via Object.assign(DungeonScene.prototype, DungeonFloorMixin).
 */

import Player from "../entities/Player.js";
import Slime from "../entities/Slime.js";
import Bat from "../entities/Bat.js";
import SkeletonWarrior from "../entities/SkeletonWarrior.js";
import ArcherGoblin from "../entities/ArcherGoblin.js";
import HealthSystem from "../systems/HealthSystem.js";
import GuildQuestSystem from "../systems/GuildQuestSystem.js";

const TILE_SIZE = 16;

export const DungeonFloorMixin = {
  _destroyColliders() {
    if (this._colliders) {
      for (const c of this._colliders) c.destroy();
    }
    this._colliders = [];
  },

  _trackCollider(collider) {
    if (!this._colliders) this._colliders = [];
    this._colliders.push(collider);
    return collider;
  },

  _buildTilemap() {
    if (this._map) this._map.destroy();

    const { width, height, groundTiles } = this._layout;
    const worldW = width * TILE_SIZE;
    const worldH = height * TILE_SIZE;

    if (this._bgRect) this._bgRect.destroy();
    this._bgRect = this.add
      .rectangle(0, 0, worldW, worldH, 0x1a1a2e)
      .setOrigin(0, 0)
      .setDepth(-30);

    if (this._flickerTween) {
      this._flickerTween.stop();
      this._flickerTween = null;
    }
    const _CA = { r: 0x1a, g: 0x1a, b: 0x2e };
    const _CB = { r: 0x22, g: 0x22, b: 0x44 };
    this._flickerTween = this.tweens.addCounter({
      from: 0,
      to: 1,
      duration: 3000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
      onUpdate: (tween) => {
        if (!this._bgRect || !this._bgRect.active) return;
        const t = tween.getValue();
        const r = Math.round(_CA.r + (_CB.r - _CA.r) * t);
        const g = Math.round(_CA.g + (_CB.g - _CA.g) * t);
        const b = Math.round(_CA.b + (_CB.b - _CA.b) * t);
        this._bgRect.setFillStyle((r << 16) | (g << 8) | b);
      },
    });

    this._map = this.make.tilemap({
      data: groundTiles,
      tileWidth: TILE_SIZE,
      tileHeight: TILE_SIZE,
    });
    const tileset = this._map.addTilesetImage("tiles");
    this._groundLayer = this._map.createLayer(0, tileset, 0, 0);
    this._groundLayer.setCollisionByExclusion([0]);

    this.physics.world.setBounds(0, 0, worldW, worldH);
    this.cameras.main.setBounds(0, 0, worldW, worldH);
  },

  _spawnPlayer() {
    const sp = this._layout.spawns.player;
    const px = sp.x * TILE_SIZE + TILE_SIZE / 2;
    const py = sp.y * TILE_SIZE + TILE_SIZE / 2;

    if (this.player) {
      this.player.respawn(px, py);
    } else {
      this.player = new Player(this, px, py, this._classConfig);
      this._healthSystem = new HealthSystem(this._classConfig.stats.maxHealth);
      this._healthSystem.grantInvulnerability();
      this.player.healthSystem = this._healthSystem;
    }

    this._trackCollider(
      this.physics.add.collider(this.player, this._groundLayer),
    );

    this.kunaiGroup = this.physics.add.group({
      runChildUpdate: true,
      allowGravity: false,
    });
  },

  _spawnEnemies() {
    if (this.enemyGroup) {
      this.enemyGroup.clear(true, true);
    }
    this.enemyGroup = this.physics.add.group();

    if (this.arrowGroup) {
      this.arrowGroup.clear(true, true);
    }
    this.arrowGroup = this.physics.add.group({ runChildUpdate: true });

    for (const sp of this._layout.spawns.enemies) {
      const ex = sp.x * TILE_SIZE + TILE_SIZE / 2;
      const ey = sp.y * TILE_SIZE + TILE_SIZE / 2;
      let enemy;
      if (sp.type === "bat") {
        const room = this._layout.rooms[sp.roomIndex];
        const lb = room.x * TILE_SIZE;
        const rb = (room.x + room.w) * TILE_SIZE;
        enemy = new Bat(this, ex, ey, lb, rb, sp.hp);
      } else if (sp.type === "skeleton-warrior") {
        enemy = new SkeletonWarrior(this, ex, ey, this._groundLayer, sp.hp);
      } else if (sp.type === "archer") {
        enemy = new ArcherGoblin(this, ex, ey, sp.hp);
      } else {
        enemy = new Slime(this, ex, ey, this._groundLayer);
        if (sp.hp > 1) enemy._health = sp.hp;
      }
      enemy.enemyType = sp.type;
      this.enemyGroup.add(enemy, true);
    }

    this._trackCollider(
      this.physics.add.collider(this.enemyGroup, this._groundLayer),
    );
  },

  _spawnPassage() {
    if (this._passageTween) {
      this._passageTween.stop();
      this._passageTween = null;
    }
    if (this._passage) this._passage.destroy();
    this._passage = null;

    const passData = this._layout.spawns.passage;
    if (!passData) return;

    const px = passData.x * TILE_SIZE + TILE_SIZE / 2;
    const py = passData.y * TILE_SIZE + TILE_SIZE / 2;
    this._createPassageSprite(px, py);
  },

  _createPassageSprite(px, py) {
    this._passage = this.add.rectangle(px, py, 16, 24, 0x44ff44, 0.7);
    this.physics.add.existing(this._passage, true);
    this._passage.setDepth(5);
    this._passageTween = this.tweens.add({
      targets: this._passage,
      alpha: { from: 0.4, to: 0.9 },
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  },

  _spawnDustParticles() {
    if (this._dustEmitter) {
      this._dustEmitter.destroy();
      this._dustEmitter = null;
    }
    const { width, height } = this._layout;
    const worldW = width * TILE_SIZE;
    const worldH = height * TILE_SIZE;
    this._dustEmitter = this.add
      .particles(0, 0, "particle-dust", {
        x: { min: 0, max: worldW },
        y: { min: 0, max: worldH },
        speedX: { min: -4, max: 4 },
        speedY: { min: 12, max: 24 },
        lifespan: { min: 5000, max: 9000 },
        quantity: 1,
        frequency: 600,
        alpha: { start: 0.35, end: 0 },
        maxParticles: 40,
      })
      .setDepth(-5);
  },

  _checkPassage() {
    if (!this._passage) return;

    const pass = this._passage;
    const guardRadius = 80;
    let blocked = false;
    this.enemyGroup.getChildren().forEach((e) => {
      if (
        e.active &&
        Math.abs(e.x - pass.x) < guardRadius &&
        Math.abs(e.y - pass.y) < guardRadius
      ) {
        blocked = true;
      }
    });
    if (blocked) return;

    const p = this.player;
    const dx = Math.abs(p.x - pass.x);
    const dy = Math.abs(p.y - pass.y);
    if (dx < 28 && dy < 28) {
      this._advanceFloor();
    }
  },

  _advanceFloor() {
    this._currentFloor++;
    GuildQuestSystem.advanceExploreQuest(this._currentFloor);
    this._emitFloorChanged();
    this.enemyGroup.clear(true, true);
    this.kunaiGroup.clear(true, true);
    if (this.arrowGroup) this.arrowGroup.clear(true, true);
    if (this._passageTween) {
      this._passageTween.stop();
      this._passageTween = null;
    }
    if (this._passage) {
      this._passage.destroy();
      this._passage = null;
    }
    if (this._groundLayer) this._groundLayer.destroy();

    this._buildFloor();
    const { width, height } = this._layout;
    this.cameras.main.setBounds(0, 0, width * TILE_SIZE, height * TILE_SIZE);
  },
};
