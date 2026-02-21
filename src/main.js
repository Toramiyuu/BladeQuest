import Phaser from "phaser";
import { GAME_WIDTH, GAME_HEIGHT, GRAVITY_Y } from "./config/constants.js";
import BootScene from "./scenes/BootScene.js";
import GameScene from "./scenes/GameScene.js";
import HubScene from "./scenes/HubScene.js";
import DungeonScene from "./scenes/DungeonScene.js";
import UIScene from "./scenes/UIScene.js";
import BlacksmithScene from "./scenes/BlacksmithScene.js";
import PotionShopScene from "./scenes/PotionShopScene.js";
import GuildBoardScene from "./scenes/GuildBoardScene.js";
import KeybindingsScene from "./scenes/KeybindingsScene.js";
import NarrativeScene from "./scenes/NarrativeScene.js";

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
  scene: [
    BootScene,
    NarrativeScene,
    HubScene,
    DungeonScene,
    GameScene,
    UIScene,
    BlacksmithScene,
    PotionShopScene,
    GuildBoardScene,
    KeybindingsScene,
  ],
};

export default new Phaser.Game(config);
