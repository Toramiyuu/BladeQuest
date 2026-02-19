import Phaser from "phaser";
import { GAME_WIDTH, GAME_HEIGHT, GRAVITY_Y } from "./config/constants.js";
import BootScene from "./scenes/BootScene.js";
import GameScene from "./scenes/GameScene.js";
import UIScene from "./scenes/UIScene.js";

const config = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  pixelArt: true,
  roundPixels: true,
  backgroundColor: "#000000",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: GRAVITY_Y },
      debug: false,
    },
  },
  scene: [BootScene, GameScene, UIScene],
};

export default new Phaser.Game(config);
