import Phaser from "phaser";

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "BootScene" });
  }

  preload() {
    this.load.tilemapTiledJSON("test-level", "assets/tilemaps/test-level.json");
  }

  create() {
    this.registry.set("events", new Phaser.Events.EventEmitter());

    this._generateAssets();

    this.scene.start("GameScene");
  }

  _generateAssets() {
    const gfx = this.make.graphics({ add: false });

    const PW = 16;
    const PH = 24;
    const playerFrames = 4;
    gfx.clear();
    for (let i = 0; i < playerFrames; i++) {
      gfx.fillStyle(0x2255ff, 1);
      gfx.fillRect(i * PW, 0, PW, PH);
      gfx.fillStyle(0xffffff, 1);
      gfx.fillRect(i * PW + 4, 6, 3, 3);
      gfx.fillRect(i * PW + 10, 6, 3, 3);
    }
    gfx.generateTexture("player-idle-sheet", PW * playerFrames, PH);

    const runFrames = 6;
    gfx.clear();
    for (let i = 0; i < runFrames; i++) {
      gfx.fillStyle(0x2255ff, 1);
      gfx.fillRect(i * PW, 0, PW, PH);
      gfx.fillStyle(0xffffff, 1);
      gfx.fillRect(i * PW + 4, 6, 3, 3);
      gfx.fillRect(i * PW + 10, 6, 3, 3);
      const legOffset = i % 2 === 0 ? 2 : -2;
      gfx.fillStyle(0x1a44cc, 1);
      gfx.fillRect(i * PW + 3 + legOffset, PH - 6, 4, 6);
      gfx.fillRect(i * PW + 9 - legOffset, PH - 6, 4, 6);
    }
    gfx.generateTexture("player-run-sheet", PW * runFrames, PH);

    gfx.clear();
    gfx.fillStyle(0x2255ff, 1);
    gfx.fillRect(0, 0, PW, PH);
    gfx.fillStyle(0xffffff, 1);
    gfx.fillRect(4, 8, 3, 3);
    gfx.fillRect(10, 8, 3, 3);
    gfx.fillStyle(0x1a44cc, 1);
    gfx.fillRect(0, 6, 3, 6);
    gfx.fillRect(PW - 3, 6, 3, 6);
    gfx.generateTexture("player-jump", PW, PH);

    gfx.clear();
    gfx.fillStyle(0x2255ff, 1);
    gfx.fillRect(0, 0, PW, PH);
    gfx.fillStyle(0xffffff, 1);
    gfx.fillRect(4, 8, 3, 3);
    gfx.fillRect(10, 8, 3, 3);
    gfx.fillStyle(0x1a44cc, 1);
    gfx.fillRect(-2, 10, 4, 3);
    gfx.fillRect(PW - 2, 10, 4, 3);
    gfx.generateTexture("player-fall", PW, PH);

    gfx.clear();
    gfx.fillStyle(0x22cc44, 1);
    gfx.fillEllipse(8, 10, 20, 16);
    gfx.fillStyle(0xffffff, 1);
    gfx.fillCircle(4, 8, 2);
    gfx.fillCircle(12, 8, 2);
    gfx.fillStyle(0x000000, 1);
    gfx.fillCircle(5, 8, 1);
    gfx.fillCircle(13, 8, 1);
    gfx.generateTexture("slime", 20, 16);

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

    this.textures.addSpriteSheet(
      "player-idle",
      this.textures.get("player-idle-sheet").getSourceImage(),
      {
        frameWidth: PW,
        frameHeight: PH,
      },
    );

    this.textures.addSpriteSheet(
      "player-run",
      this.textures.get("player-run-sheet").getSourceImage(),
      {
        frameWidth: PW,
        frameHeight: PH,
      },
    );
  }
}
