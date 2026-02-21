/**
 * GuildRankInfo — RANK tab content for GuildBoardScene.
 *
 * Shows a rank badge, reputation score, next-rank requirements,
 * and the list of active perks for the player's current guild rank.
 *
 * Called via buildRankInfo(scene, PX, PW, PY) — same convention as
 * buildQuestBoard / buildDropTrading / buildBossFloors.
 */

import { PIXEL_FONT } from "../config/PixelFont.js";
import GuildQuestSystem from "../systems/GuildQuestSystem.js";

const RANK_COLORS = {
  F: 0x888888,
  E: 0x44aa44,
  D: 0x4499ff,
  C: 0xff9900,
  B: 0xff4422,
  A: 0xffdd00,
};

function bt(scene, x, y, str, size, tint, ox = 0.5, oy = 0) {
  return scene.add
    .bitmapText(x, y, PIXEL_FONT, str, size)
    .setOrigin(ox, oy)
    .setTint(tint)
    .setScrollFactor(0)
    .setDepth(2);
}

export function buildRankInfo(scene, PX, PW, PY) {
  const CX = PX + PW / 2;
  const S = PY + 148;
  const BADGE_X = PX + 44;
  const STAT_X = PX + 100;

  const rank = GuildQuestSystem.getRank();
  const color = RANK_COLORS[rank] ?? 0xffffff;
  const rep = GuildQuestSystem.getReputation();
  const done = GuildQuestSystem.getQuestsCompleted();
  const next = GuildQuestSystem.getNextRankRequirements();
  const perks = GuildQuestSystem.getPerkList();

  scene.add
    .rectangle(BADGE_X, S + 22, 52, 44, 0x111133)
    .setStrokeStyle(2, color)
    .setScrollFactor(0)
    .setDepth(2);
  bt(scene, BADGE_X, S + 5, "RANK", 7, 0x666666);
  bt(scene, BADGE_X, S + 18, rank, 18, color, 0.5, 0);

  bt(scene, STAT_X, S + 3, "REPUTATION", 7, 0x888888, 0, 0);
  bt(scene, STAT_X, S + 13, `${rep}`, 12, 0xffcc44, 0, 0);

  if (next) {
    const bReq = next.bossFloor ? `  F${next.bossFloor} boss` : "";
    bt(scene, STAT_X, S + 28, "NEXT RANK", 7, 0x666666, 0, 0);
    bt(
      scene,
      STAT_X,
      S + 38,
      `${done}/${next.quests} quests${bReq}`,
      7,
      0x8899bb,
      0,
      0,
    );
  } else {
    bt(scene, STAT_X, S + 28, "MAX RANK ACHIEVED", 7, color, 0, 0);
  }

  scene.add
    .rectangle(CX, S + 54, PW - 30, 1, 0x334466)
    .setScrollFactor(0)
    .setDepth(2);

  bt(scene, PX + 10, S + 61, "ACTIVE PERKS", 7, 0xaaaaaa, 0, 0);
  perks.forEach((perk, i) => {
    bt(scene, PX + 16, S + 72 + i * 10, `\u2022 ${perk}`, 7, 0x88aaff, 0, 0);
  });
}
