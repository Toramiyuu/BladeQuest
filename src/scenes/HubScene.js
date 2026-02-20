import Phaser from "phaser";
import ClassRegistry from "../config/classes.js";
import { createAnimations } from "../config/animations.js";
import { GAME_HEIGHT } from "../config/constants.js";
import { HubSceneWorldMixin, WORLD_W } from "./HubSceneWorld.js";
import { HubSceneMinimapMixin } from "./HubSceneMinimap.js";
import { HubSceneBackpackMixin } from "./HubSceneBackpack.js";

export default class HubScene extends Phaser.Scene {
  constructor() {
    super({ key: "HubScene" });
  }

  init(data) {
    this._fromDungeon = data?.fromDungeon ?? false;
  }

  create() {
    createAnimations(this.anims);

    if (!this.registry.get("selectedClassId")) {
      this.registry.set("selectedClassId", ClassRegistry.getDefault().id);
    }

    this.physics.world.setBounds(0, 0, WORLD_W, GAME_HEIGHT);

    this._buildParallax();
    this._buildGround();
    this._buildBuildings();
    this._buildNPCs();
    this._buildPlayer();
    this._setupCamera();
    this._createAmbientParticles();

    this.add
      .rectangle(240, 135, 480, 270, 0xff8833, 0.04)
      .setScrollFactor(0)
      .setDepth(45);

    this._eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this._createHubMinimap();
    this._initBackpackKey();
    this.cameras.main.fadeIn(300, 0, 0, 0);
  }

  update() {
    this.player.update();
    this._checkNPCProximity();
    this._updateHubMinimap();
  }

  _checkNPCProximity() {
    if (!this._npcs) return;
    const px = this.player.x;
    const py = this.player.y;
    let nearNPC = null;
    for (const npc of this._npcs) {
      const dist = Math.sqrt((px - npc.x) ** 2 + (py - npc.y) ** 2);
      npc.setNearby(dist < 48);
      if (dist < 48) nearNPC = npc;
    }
    if (nearNPC && Phaser.Input.Keyboard.JustDown(this._eKey)) {
      this._onNPCInteract(nearNPC.role);
    }
  }

  _onNPCInteract(role) {
    if (this._backpackVisible) this._hideBackpack();
    if (role === "dungeon") {
      this._startDungeon(1);
    } else {
      const keyMap = {
        blacksmith: "BlacksmithScene",
        merchant: "PotionShopScene",
        guild: "GuildBoardScene",
      };
      const sceneKey = keyMap[role];
      if (sceneKey && !this.scene.isActive(sceneKey)) {
        this.cameras.main.fadeOut(200, 0, 0, 0);
        this.cameras.main.once("camerafadeoutcomplete", () => {
          this.scene.launch(sceneKey);
          this.scene.pause("HubScene");
        });
      }
    }
  }

  /** Called by facility scenes when they close, to resume hub input. */
  resumeFromFacility() {
    this.scene.resume("HubScene");
  }

  _startDungeon(startFloor) {
    const classId =
      this.registry.get("selectedClassId") || ClassRegistry.getDefault().id;
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      this.scene.start("DungeonScene", { classId, startFloor });
    });
  }
}

Object.assign(
  HubScene.prototype,
  HubSceneWorldMixin,
  HubSceneMinimapMixin,
  HubSceneBackpackMixin,
);
