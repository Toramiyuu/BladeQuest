import Phaser from "phaser";
import SaveManager from "../systems/SaveManager.js";
import { generatePixelFont } from "../config/PixelFont.js";

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "BootScene" });
  }

  preload() {
    this.load.tilemapTiledJSON("test-level", "assets/tilemaps/test-level.json");

    this.load.image("bg-sky", "assets/backgrounds/bg-sky.png");
    this.load.image("bg-hills", "assets/backgrounds/bg-hills.png");
    this.load.image("bg-trees", "assets/backgrounds/bg-trees.png");

    this.load.spritesheet("player-idle", "assets/sprites/player/idle.png", {
      frameWidth: 128,
      frameHeight: 128,
    });
    this.load.spritesheet("player-run", "assets/sprites/player/run.png", {
      frameWidth: 128,
      frameHeight: 128,
    });
    this.load.spritesheet(
      "player-attack1",
      "assets/sprites/player/attack1.png",
      {
        frameWidth: 128,
        frameHeight: 128,
      },
    );
    this.load.spritesheet(
      "player-attack2",
      "assets/sprites/player/attack2.png",
      {
        frameWidth: 128,
        frameHeight: 128,
      },
    );
    this.load.spritesheet("player-jump", "assets/sprites/player/jump.png", {
      frameWidth: 128,
      frameHeight: 128,
    });
    this.load.spritesheet("player-dead", "assets/sprites/player/dead.png", {
      frameWidth: 128,
      frameHeight: 128,
    });
    this.load.spritesheet("player-hurt", "assets/sprites/player/hurt.png", {
      frameWidth: 128,
      frameHeight: 128,
    });

    const cls128 = { frameWidth: 128, frameHeight: 128 };
    ["idle", "run", "attack1", "attack2", "jump", "dead", "hurt"].forEach(
      (a) => {
        this.load.spritesheet(
          `shinobi-${a}`,
          `assets/sprites/shinobi/${a}.png`,
          cls128,
        );
        this.load.spritesheet(
          `knight-${a}`,
          `assets/sprites/knight/${a}.png`,
          cls128,
        );
        this.load.spritesheet(
          `mage-${a}`,
          `assets/sprites/mage/${a}.png`,
          cls128,
        );
        this.load.spritesheet(
          `berserker-${a}`,
          `assets/sprites/berserker/${a}.png`,
          cls128,
        );
      },
    );
    ["idle", "run", "attack1", "attack2", "dead", "hurt"].forEach((a) => {
      this.load.spritesheet(
        `rogue-${a}`,
        `assets/sprites/rogue/${a}.png`,
        cls128,
      );
    });

    ["idle", "walk", "dead"].forEach((a) => {
      this.load.spritesheet(
        `hollow-knight-${a}`,
        `assets/sprites/boss/hollow-knight/${a}.png`,
        cls128,
      );
      this.load.spritesheet(
        `frost-lich-${a}`,
        `assets/sprites/boss/frost-lich/${a}.png`,
        cls128,
      );
    });
    const boss256 = { frameWidth: 256, frameHeight: 256 };
    ["idle", "walk", "dead"].forEach((a) => {
      this.load.spritesheet(
        `inferno-wyrm-${a}`,
        `assets/sprites/boss/inferno-wyrm/${a}.png`,
        boss256,
      );
      this.load.spritesheet(
        `shadow-sovereign-${a}`,
        `assets/sprites/boss/shadow-sovereign/${a}.png`,
        boss256,
      );
    });

    this.load.spritesheet("skel-idle", "assets/sprites/skeleton/idle.png", {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.spritesheet("skel-walk", "assets/sprites/skeleton/walk.png", {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.spritesheet("skel-death", "assets/sprites/skeleton/death.png", {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.spritesheet("skel-hurt", "assets/sprites/skeleton/hurt.png", {
      frameWidth: 64,
      frameHeight: 64,
    });

    this.load.spritesheet(
      "blacksmith-idle",
      "assets/sprites/npcs/blacksmith-idle.png",
      { frameWidth: 128, frameHeight: 128 },
    );
    this.load.spritesheet(
      "blacksmith-dialogue",
      "assets/sprites/npcs/blacksmith-dialogue.png",
      { frameWidth: 128, frameHeight: 128 },
    );
    this.load.spritesheet(
      "merchant-idle",
      "assets/sprites/npcs/merchant-idle.png",
      { frameWidth: 128, frameHeight: 128 },
    );
    this.load.spritesheet(
      "merchant-sell",
      "assets/sprites/npcs/merchant-sell.png",
      { frameWidth: 128, frameHeight: 128 },
    );
    this.load.spritesheet(
      "guildmaster-idle",
      "assets/sprites/npcs/guildmaster-idle.png",
      { frameWidth: 128, frameHeight: 128 },
    );
    this.load.spritesheet(
      "guildmaster-dialogue",
      "assets/sprites/npcs/guildmaster-dialogue.png",
      { frameWidth: 128, frameHeight: 128 },
    );

    this.load.image("hub-bg-far", "assets/backgrounds/hub-bg-far.png");
    this.load.image("hub-bg-near", "assets/backgrounds/hub-bg-near.png");

    this.load.image("hub-wall-a", "assets/sprites/hub/wall-a.png");
    this.load.image("hub-wall-b", "assets/sprites/hub/wall-b.png");
    this.load.image("hub-wall-c", "assets/sprites/hub/wall-c.png");
    this.load.image("hub-roof-a", "assets/sprites/hub/roof-a.png");
    this.load.image("hub-roof-b", "assets/sprites/hub/roof-b.png");
    this.load.image("hub-canopy", "assets/sprites/hub/canopy.png");
    this.load.image("hub-door-a", "assets/sprites/hub/door-a.png");
    this.load.image("hub-door-b", "assets/sprites/hub/door-b.png");
    this.load.image("hub-door-wide", "assets/sprites/hub/door-wide.png");
    this.load.image("hub-chimney", "assets/sprites/hub/chimney.png");

    for (let i = 1; i <= 30; i++) {
      const n = String(i).padStart(2, "0");
      this.load.image(`weapon-${n}`, `assets/icons/weapons/weapon-${n}.png`);
    }

    for (let i = 1; i <= 30; i++) {
      const n = String(i).padStart(2, "0");
      this.load.image(`armor-${n}`, `assets/icons/armor/armor-${n}.png`);
    }

    for (let i = 1; i <= 15; i++) {
      const n = String(i).padStart(2, "0");
      this.load.image(`item-${n}`, `assets/icons/items/item-${n}.png`);
    }
  }

  create() {
    const events = new Phaser.Events.EventEmitter();
    this.registry.set("events", events);

    SaveManager.onSaveResult((success) => {
      events.emit(success ? "save-complete" : "save-failed");
    });

    this._generateTileAssets();
    this._generateParticleTextures();
    this._generateKunaiTexture();
    this._generateVignetteTexture();
    generatePixelFont(this);
    this.scene.start("HubScene");
  }

  _generateTileAssets() {
    const gfx = this.make.graphics({ add: false });

    gfx.clear();
    gfx.fillStyle(0x8b6914, 1);
    gfx.fillRect(0, 0, 16, 16);
    gfx.fillStyle(0x6b4f10, 1);
    gfx.fillRect(0, 0, 16, 3);
    gfx.fillStyle(0x5a8c2e, 1);
    gfx.fillRect(0, 0, 16, 3);
    gfx.fillStyle(0x7a5c12, 1);
    gfx.fillRect(8, 0, 1, 16);
    gfx.fillRect(0, 8, 16, 1);
    gfx.generateTexture("tile-ground", 16, 16);

    gfx.clear();
    gfx.fillStyle(0xa07830, 1);
    gfx.fillRect(0, 0, 16, 16);
    gfx.fillStyle(0x70b830, 1);
    gfx.fillRect(0, 0, 16, 3);
    gfx.generateTexture("tile-platform", 16, 16);

    gfx.clear();
    gfx.fillStyle(0x1a1a2e, 1);
    gfx.fillRect(0, 0, 16, 16);
    gfx.generateTexture("tile-bg", 16, 16);

    gfx.clear();
    gfx.fillStyle(0xff2222, 1);
    gfx.fillCircle(5, 5, 4);
    gfx.fillCircle(11, 5, 4);
    gfx.fillTriangle(2, 7, 14, 7, 8, 14);
    gfx.generateTexture("heart-full", 16, 16);

    gfx.clear();
    gfx.fillStyle(0x444444, 1);
    gfx.fillCircle(5, 5, 4);
    gfx.fillCircle(11, 5, 4);
    gfx.fillTriangle(2, 7, 14, 7, 8, 14);
    gfx.generateTexture("heart-empty", 16, 16);

    gfx.clear();
    gfx.fillStyle(0xff0000, 0.3);
    gfx.fillRect(0, 0, 20, 16);
    gfx.generateTexture("hitbox", 20, 16);

    gfx.clear();
    gfx.fillStyle(0x1a1a2e, 1);
    gfx.fillRect(0, 0, 16, 16);
    gfx.fillStyle(0x8b6914, 1);
    gfx.fillRect(0, 16, 16, 16);
    gfx.fillStyle(0x5a8c2e, 1);
    gfx.fillRect(0, 16, 16, 3);
    gfx.fillStyle(0x7a5c12, 1);
    gfx.fillRect(8, 16, 1, 16);
    gfx.fillRect(0, 24, 16, 1);
    gfx.fillStyle(0xa07830, 1);
    gfx.fillRect(0, 32, 16, 16);
    gfx.fillStyle(0x70b830, 1);
    gfx.fillRect(0, 32, 16, 3);
    gfx.generateTexture("tiles", 16, 48);

    gfx.destroy();
  }

  _generateParticleTextures() {
    const gfx = this.make.graphics({ add: false });

    gfx.clear();
    gfx.fillStyle(0xccff44, 1);
    gfx.fillRect(1, 0, 1, 3);
    gfx.fillRect(0, 1, 3, 1);
    gfx.generateTexture("particle-firefly", 3, 3);

    gfx.clear();
    gfx.fillStyle(0xff8833, 1);
    gfx.fillRect(0, 0, 2, 2);
    gfx.generateTexture("particle-ember", 2, 2);

    gfx.clear();
    gfx.fillStyle(0xaabbcc, 1);
    gfx.fillRect(0, 0, 2, 2);
    gfx.generateTexture("particle-dust", 2, 2);

    gfx.clear();
    gfx.fillStyle(0xffffff, 1);
    gfx.fillRect(0, 0, 2, 2);
    gfx.generateTexture("particle-death", 2, 2);

    gfx.destroy();
  }

  _generateVignetteTexture() {
    const canvas = this.textures.createCanvas("vignette-overlay", 480, 270);
    const ctx = canvas.getCanvas().getContext("2d");
    const grad = ctx.createRadialGradient(240, 135, 100, 240, 135, 280);
    grad.addColorStop(0, "rgba(0,0,0,0)");
    grad.addColorStop(1, "rgba(0,0,0,0.75)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 480, 270);
    canvas.refresh();
  }

  _generateKunaiTexture() {
    const gfx = this.make.graphics({ add: false });
    gfx.fillStyle(0xcccccc, 1);
    gfx.fillTriangle(0, 4, 12, 0, 12, 8);
    gfx.fillStyle(0x886633, 1);
    gfx.fillRect(12, 3, 8, 2);
    gfx.generateTexture("kunai", 20, 8);
    gfx.destroy();
  }
}
