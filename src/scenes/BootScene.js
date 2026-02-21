import Phaser from "phaser";
import SaveManager from "../systems/SaveManager.js";
import { generatePixelFont } from "../config/PixelFont.js";
import { loadAssets } from "../config/loadAssets.js";

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "BootScene" });
  }

  preload() {
    loadAssets(this);
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
