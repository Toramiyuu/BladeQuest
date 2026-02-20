/**
 * HubSceneWorld — world-building methods mixed into HubScene.
 *
 * Handles: parallax, ground tiles, buildings (sprite-based), NPCs,
 * player spawn, camera, and ambient particles.
 * Applied via Object.assign(HubScene.prototype, HubSceneWorldMixin).
 */

import HubPlayer from "../entities/HubPlayer.js";
import HubNPC from "../entities/HubNPC.js";
import { GAME_WIDTH, GAME_HEIGHT } from "../config/constants.js";
import { PIXEL_FONT } from "../config/PixelFont.js";

export const WORLD_W = 1440;
const WORLD_H = GAME_HEIGHT;
export const GROUND_Y = 248;
const GROUND_H = 22;
const TILE_W = 16;

export const BUILDINGS = [
  {
    x: 60,
    w: 80,
    h: 110,
    label: "DUNGEON\nENTRANCE",
    role: "dungeon",
    wall: "hub-wall-c",
    roof: "hub-roof-b",
    door: "hub-door-a",
    doorW: 18,
    doorH: 28,
  },
  {
    x: 340,
    w: 100,
    h: 120,
    label: "BLACK-\nSMITH",
    role: "blacksmith",
    wall: "hub-wall-b",
    roof: "hub-roof-a",
    door: "hub-door-a",
    doorW: 20,
    doorH: 28,
    chimney: true,
  },
  {
    x: 680,
    w: 100,
    h: 115,
    label: "POTION\nSHOP",
    role: "merchant",
    wall: "hub-wall-a",
    roof: "hub-roof-b",
    door: "hub-door-b",
    doorW: 20,
    doorH: 28,
    canopy: true,
  },
  {
    x: 1060,
    w: 110,
    h: 125,
    label: "GUILD\nBOARD",
    role: "guild",
    wall: "hub-wall-c",
    roof: "hub-roof-a",
    door: "hub-door-wide",
    doorW: 28,
    doorH: 28,
  },
];

export const HubSceneWorldMixin = {
  _buildParallax() {
    this.add
      .image(WORLD_W / 2, GAME_HEIGHT / 2, "hub-bg-far")
      .setDisplaySize(WORLD_W + 200, GAME_HEIGHT)
      .setScrollFactor(0.15)
      .setDepth(-20);

    this.add
      .image(WORLD_W / 2, GAME_HEIGHT / 2, "hub-bg-near")
      .setDisplaySize(WORLD_W + 400, GAME_HEIGHT)
      .setScrollFactor(0.35)
      .setDepth(-10);
  },

  _buildGround() {
    this._ground = this.physics.add.staticGroup();
    const cols = Math.ceil(WORLD_W / TILE_W);
    for (let i = 0; i < cols; i++) {
      const tile = this.add
        .image(i * TILE_W + TILE_W / 2, GROUND_Y + GROUND_H / 2, "tile-ground")
        .setDepth(0);
      this.physics.add.existing(tile, true);
      tile.body.setSize(TILE_W, GROUND_H);
      tile.body.reset(tile.x, tile.y);
      this._ground.add(tile);
    }
  },

  _buildBuildings() {
    for (const b of BUILDINGS) {
      const cx = b.x + b.w / 2;
      const roofH = 24;

      this.add
        .image(cx, GROUND_Y - b.h / 2, b.wall)
        .setDisplaySize(b.w, b.h)
        .setDepth(1);

      this.add
        .image(cx, GROUND_Y - b.h - roofH / 2, b.roof)
        .setDisplaySize(b.w + 8, roofH)
        .setDepth(2);

      this.add
        .image(cx, GROUND_Y - b.doorH / 2, b.door)
        .setDisplaySize(b.doorW, b.doorH)
        .setDepth(3);

      if (b.chimney) {
        this.add
          .image(cx + b.w / 2 - 9, GROUND_Y - b.h - 16, "hub-chimney")
          .setDisplaySize(10, 22)
          .setDepth(2);
      }

      if (b.canopy) {
        this.add
          .image(cx, GROUND_Y - b.h * 0.32, "hub-canopy")
          .setDisplaySize(b.w + 14, 16)
          .setDepth(4);
      }

      this.add
        .rectangle(cx, GROUND_Y - b.h + 16, 72, 22, 0x0a0a1a, 0.75)
        .setDepth(4);

      this.add
        .bitmapText(cx, GROUND_Y - b.h + 6, PIXEL_FONT, b.label, 8)
        .setOrigin(0.5, 0)
        .setTint(0xeeeeee)
        .setDepth(5);
    }

    this.add
      .bitmapText(WORLD_W / 2, 12, PIXEL_FONT, "ASHVEIL SETTLEMENT", 8)
      .setOrigin(0.5, 0)
      .setTint(0xffcc44)
      .setScrollFactor(0)
      .setDepth(50);
  },

  _buildNPCs() {
    this._npcs = [
      new HubNPC(
        this,
        105,
        210,
        "guildmaster-idle",
        "guildmaster-dialogue",
        7,
        8,
        "dungeon",
      ),
      new HubNPC(
        this,
        430,
        210,
        "blacksmith-idle",
        "blacksmith-dialogue",
        12,
        11,
        "blacksmith",
      ),
      new HubNPC(
        this,
        760,
        210,
        "merchant-idle",
        "merchant-sell",
        7,
        14,
        "merchant",
      ),
      new HubNPC(
        this,
        1140,
        210,
        "guildmaster-idle",
        "guildmaster-dialogue",
        7,
        8,
        "guild",
      ),
    ];
  },

  _buildPlayer() {
    const spawnX = this._fromDungeon ? 140 : 80;
    this.player = new HubPlayer(this, spawnX, GROUND_Y - 30);
    this.physics.add.collider(this.player, this._ground);
  },

  _setupCamera() {
    this.cameras.main.setBounds(0, 0, WORLD_W, WORLD_H);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
  },

  _createAmbientParticles() {
    this.add
      .particles(0, 0, "particle-firefly", {
        x: { min: 0, max: WORLD_W },
        y: { min: 30, max: GROUND_Y - 30 },
        speedX: { min: -12, max: 12 },
        speedY: { min: -6, max: 6 },
        lifespan: { min: 5000, max: 9000 },
        quantity: 1,
        frequency: 350,
        alpha: { start: 0.85, end: 0 },
        maxParticles: 25,
      })
      .setDepth(8);

    const emberSources = [390, 440, 1110, 1160];
    for (const ex of emberSources) {
      this.add
        .particles(ex, GROUND_Y - 10, "particle-ember", {
          speedX: { min: -8, max: 8 },
          speedY: { min: -35, max: -15 },
          lifespan: { min: 800, max: 1600 },
          quantity: 1,
          frequency: 200,
          alpha: { start: 0.75, end: 0 },
          maxParticles: 20,
          gravityY: -18,
        })
        .setDepth(8);
    }
  },
};
