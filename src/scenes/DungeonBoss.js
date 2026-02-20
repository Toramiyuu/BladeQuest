/**
 * DungeonBoss — boss spawning and defeat logic mixed into DungeonScene prototype.
 *
 * Applied via Object.assign(DungeonScene.prototype, DungeonBossMixin).
 */

import Boss from "../entities/Boss.js";
import SaveManager from "../systems/SaveManager.js";
import { BOSS_BASE_HP, BOSS_HP_PER_TIER } from "../config/constants.js";
import InventorySystem from "../systems/InventorySystem.js";
import { getDropsForEnemy } from "../systems/DropSystem.js";
import { PIXEL_FONT } from "../config/PixelFont.js";

const TILE_SIZE = 16;

export const DungeonBossMixin = {
  _spawnBoss() {
    if (this._boss) {
      this._boss.destroy();
      this._boss = null;
    }

    const bossData = this._layout.spawns.boss;
    if (!bossData) return;

    const bx = bossData.x * TILE_SIZE + TILE_SIZE / 2;
    const by = bossData.y * TILE_SIZE + TILE_SIZE / 2;
    const tier = Math.floor(this._currentFloor / 10);
    const bossHP = BOSS_BASE_HP + tier * BOSS_HP_PER_TIER;
    const room = this._layout.rooms[0];
    const lb = room.x * TILE_SIZE;
    const rb = (room.x + room.w) * TILE_SIZE;

    this._boss = new Boss(this, bx, by, lb, rb, bossHP);
    this.enemyGroup.add(this._boss, true);
    this._trackCollider(
      this.physics.add.collider(this._boss, this._groundLayer),
    );
  },

  _handleDeath(dt) {
    if (!this._isDying) {
      this._isDying = true;
      this._dyingMs = Infinity;
      this.player.body.setVelocity(0, 0);
      this.player.body.setAcceleration(0, 0);
      this.player.setTint(0xff4444);
      this.player.setAlpha(1);

      this.time.timeScale = 0.2;
      this.physics.world.timeScale = 5;

      this._deathPhase2Timer = setTimeout(() => {
        this._deathPhase2Timer = null;
        if (!this.sys?.isActive()) return;
        this.time.timeScale = 1;
        this.physics.world.timeScale = 1;
        this._dyingMs = 1500;

        this.add
          .rectangle(240, 135, 480, 270, 0x000000, 0.7)
          .setScrollFactor(0)
          .setDepth(199);

        this.add
          .bitmapText(
            this.cameras.main.worldView.centerX,
            this.cameras.main.worldView.centerY - 30,
            PIXEL_FONT,
            `You Died - Floor ${this._currentFloor}`,
            16,
          )
          .setOrigin(0.5)
          .setTint(0xff4444)
          .setScrollFactor(0)
          .setDepth(200);
      }, 400);

      this.events.once("shutdown", () => {
        if (this._deathPhase2Timer) {
          clearTimeout(this._deathPhase2Timer);
          this._deathPhase2Timer = null;
        }
        this.time.timeScale = 1;
        this.physics.world.timeScale = 1;
      });
    }
    if (this._dyingMs === Infinity) return;
    this._dyingMs -= dt;
    if (this._dyingMs <= 0 && !this._deathFading) {
      this._deathFading = true;
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        this._isDying = false;
        this._deathFading = false;
        this.scene.stop("UIScene");
        this.scene.start("HubScene", { fromDungeon: true });
      });
    }
  },

  _checkBossWarning() {
    if (this._isDying || this._bossWarningShown || !this._layout.spawns.boss)
      return;
    const room = this._layout.rooms[0];
    const rx = room.x * TILE_SIZE;
    const ry = room.y * TILE_SIZE;
    const rw = room.w * TILE_SIZE;
    const rh = room.h * TILE_SIZE;
    if (
      this.player.x >= rx &&
      this.player.x <= rx + rw &&
      this.player.y >= ry &&
      this.player.y <= ry + rh
    ) {
      this._bossWarningShown = true;
      this.cameras.main.shake(300, 0.01);
      this.registry.get("events").emit("boss-warning");
    }
  },

  _checkBossDefeated() {
    if (!this._boss || this._bossDefeated) return;
    if (!this._boss.isDead) return;

    this._bossDefeated = true;
    SaveManager.clearBossFloor(this._currentFloor);

    const drops = getDropsForEnemy("boss", this._currentFloor);
    if (drops.gold > 0) InventorySystem.addGold(drops.gold);
    if (drops.bones > 0) InventorySystem.addMaterial("bones", drops.bones);
    if (drops.crystals > 0)
      InventorySystem.addMaterial("crystals", drops.crystals);
    if (drops.essence > 0)
      InventorySystem.addMaterial("essence", drops.essence);

    this._showDropText(this._boss.x, this._boss.y, drops);

    const room = this._layout.rooms[0];
    const px = (room.x + Math.floor(room.w / 2)) * TILE_SIZE;
    const py = (room.y + Math.floor(room.h / 2)) * TILE_SIZE;
    this._createPassageSprite(px, py);

    const cx = this.cameras.main.worldView.centerX;
    const cy = this.cameras.main.worldView.centerY;
    const txt = this.add
      .bitmapText(
        cx,
        cy - 40,
        PIXEL_FONT,
        "Boss Defeated!\nCheckpoint Unlocked!",
        16,
      )
      .setOrigin(0.5)
      .setTint(0xffff00)
      .setScrollFactor(0)
      .setDepth(100);

    this.tweens.add({
      targets: txt,
      alpha: 0,
      y: cy - 80,
      duration: 2000,
      onComplete: () => txt.destroy(),
    });
  },
};
