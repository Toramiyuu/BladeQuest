/**
 * Animation definitions — called once from GameScene.create().
 * Separated to keep GameScene under 300 lines.
 */
export function createAnimations(anims) {
  if (anims.exists("player-idle")) return;

  anims.create({
    key: "player-idle",
    frames: anims.generateFrameNumbers("player-idle", { start: 0, end: 5 }),
    frameRate: 6,
    repeat: -1,
  });
  anims.create({
    key: "player-run",
    frames: anims.generateFrameNumbers("player-run", { start: 0, end: 11 }),
    frameRate: 14,
    repeat: -1,
  });
  anims.create({
    key: "player-jump-up",
    frames: anims.generateFrameNumbers("player-jump", { start: 0, end: 3 }),
    frameRate: 10,
    repeat: 0,
  });
  anims.create({
    key: "player-fall",
    frames: anims.generateFrameNumbers("player-jump", { start: 7, end: 9 }),
    frameRate: 8,
    repeat: 0,
  });
  anims.create({
    key: "player-attack1",
    frames: anims.generateFrameNumbers("player-attack1", { start: 0, end: 4 }),
    frameRate: 20,
    repeat: 0,
  });
  anims.create({
    key: "player-attack2",
    frames: anims.generateFrameNumbers("player-attack2", { start: 0, end: 2 }),
    frameRate: 14,
    repeat: 0,
  });
  anims.create({
    key: "player-dead",
    frames: anims.generateFrameNumbers("player-dead", { start: 0, end: 4 }),
    frameRate: 8,
    repeat: 0,
  });
  anims.create({
    key: "player-hurt",
    frames: anims.generateFrameNumbers("player-hurt", { start: 0, end: 2 }),
    frameRate: 10,
    repeat: 0,
  });

  anims.create({
    key: "skel-idle",
    frames: anims.generateFrameNumbers("skel-idle", { start: 0, end: 3 }),
    frameRate: 5,
    repeat: -1,
  });
  anims.create({
    key: "skel-walk",
    frames: anims.generateFrameNumbers("skel-walk", { start: 0, end: 5 }),
    frameRate: 8,
    repeat: -1,
  });
  anims.create({
    key: "skel-death",
    frames: anims.generateFrameNumbers("skel-death", { start: 0, end: 5 }),
    frameRate: 8,
    repeat: 0,
  });

  anims.create({
    key: "boss-walk",
    frames: anims.generateFrameNumbers("skel-walk", { start: 0, end: 5 }),
    frameRate: 6,
    repeat: -1,
  });
  anims.create({
    key: "boss-death",
    frames: anims.generateFrameNumbers("skel-death", { start: 0, end: 5 }),
    frameRate: 8,
    repeat: 0,
  });

  anims.create({
    key: "bat-fly",
    frames: anims.generateFrameNumbers("skel-idle", { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1,
  });

  anims.create({
    key: "shinobi-idle",
    frames: anims.generateFrameNumbers("shinobi-idle", { start: 0, end: 5 }),
    frameRate: 6,
    repeat: -1,
  });
  anims.create({
    key: "shinobi-run",
    frames: anims.generateFrameNumbers("shinobi-run", { start: 0, end: 7 }),
    frameRate: 12,
    repeat: -1,
  });
  anims.create({
    key: "shinobi-jump-up",
    frames: anims.generateFrameNumbers("shinobi-jump", { start: 0, end: 3 }),
    frameRate: 10,
    repeat: 0,
  });
  anims.create({
    key: "shinobi-fall",
    frames: anims.generateFrameNumbers("shinobi-jump", { start: 6, end: 8 }),
    frameRate: 8,
    repeat: 0,
  });
  anims.create({
    key: "shinobi-attack1",
    frames: anims.generateFrameNumbers("shinobi-attack1", { start: 0, end: 3 }),
    frameRate: 20,
    repeat: 0,
  });
  anims.create({
    key: "shinobi-attack2",
    frames: anims.generateFrameNumbers("shinobi-attack2", { start: 0, end: 4 }),
    frameRate: 18,
    repeat: 0,
  });
  anims.create({
    key: "shinobi-dead",
    frames: anims.generateFrameNumbers("shinobi-dead", { start: 0, end: 5 }),
    frameRate: 8,
    repeat: 0,
  });
  anims.create({
    key: "shinobi-hurt",
    frames: anims.generateFrameNumbers("shinobi-hurt", { start: 0, end: 2 }),
    frameRate: 10,
    repeat: 0,
  });

  anims.create({
    key: "knight-idle",
    frames: anims.generateFrameNumbers("knight-idle", { start: 0, end: 3 }),
    frameRate: 6,
    repeat: -1,
  });
  anims.create({
    key: "knight-run",
    frames: anims.generateFrameNumbers("knight-run", { start: 0, end: 6 }),
    frameRate: 12,
    repeat: -1,
  });
  anims.create({
    key: "knight-jump-up",
    frames: anims.generateFrameNumbers("knight-jump", { start: 0, end: 2 }),
    frameRate: 10,
    repeat: 0,
  });
  anims.create({
    key: "knight-fall",
    frames: anims.generateFrameNumbers("knight-jump", { start: 4, end: 5 }),
    frameRate: 8,
    repeat: 0,
  });
  anims.create({
    key: "knight-attack1",
    frames: anims.generateFrameNumbers("knight-attack1", { start: 0, end: 4 }),
    frameRate: 20,
    repeat: 0,
  });
  anims.create({
    key: "knight-attack2",
    frames: anims.generateFrameNumbers("knight-attack2", { start: 0, end: 3 }),
    frameRate: 18,
    repeat: 0,
  });
  anims.create({
    key: "knight-dead",
    frames: anims.generateFrameNumbers("knight-dead", { start: 0, end: 5 }),
    frameRate: 8,
    repeat: 0,
  });
  anims.create({
    key: "knight-hurt",
    frames: anims.generateFrameNumbers("knight-hurt", { start: 0, end: 1 }),
    frameRate: 10,
    repeat: 0,
  });

  anims.create({
    key: "rogue-idle",
    frames: anims.generateFrameNumbers("rogue-idle", { start: 0, end: 6 }),
    frameRate: 6,
    repeat: -1,
  });
  anims.create({
    key: "rogue-run",
    frames: anims.generateFrameNumbers("rogue-run", { start: 0, end: 11 }),
    frameRate: 14,
    repeat: -1,
  });
  anims.create({
    key: "rogue-jump-up",
    frames: anims.generateFrameNumbers("rogue-idle", { start: 0, end: 2 }),
    frameRate: 8,
    repeat: 0,
  });
  anims.create({
    key: "rogue-fall",
    frames: anims.generateFrameNumbers("rogue-idle", { start: 3, end: 5 }),
    frameRate: 8,
    repeat: 0,
  });
  anims.create({
    key: "rogue-attack1",
    frames: anims.generateFrameNumbers("rogue-attack1", { start: 0, end: 5 }),
    frameRate: 20,
    repeat: 0,
  });
  anims.create({
    key: "rogue-attack2",
    frames: anims.generateFrameNumbers("rogue-attack2", { start: 0, end: 3 }),
    frameRate: 18,
    repeat: 0,
  });
  anims.create({
    key: "rogue-dead",
    frames: anims.generateFrameNumbers("rogue-dead", { start: 0, end: 4 }),
    frameRate: 8,
    repeat: 0,
  });
  anims.create({
    key: "rogue-hurt",
    frames: anims.generateFrameNumbers("rogue-hurt", { start: 0, end: 2 }),
    frameRate: 10,
    repeat: 0,
  });

  anims.create({
    key: "mage-idle",
    frames: anims.generateFrameNumbers("mage-idle", { start: 0, end: 7 }),
    frameRate: 6,
    repeat: -1,
  });
  anims.create({
    key: "mage-run",
    frames: anims.generateFrameNumbers("mage-run", { start: 0, end: 7 }),
    frameRate: 12,
    repeat: -1,
  });
  anims.create({
    key: "mage-jump-up",
    frames: anims.generateFrameNumbers("mage-jump", { start: 0, end: 3 }),
    frameRate: 10,
    repeat: 0,
  });
  anims.create({
    key: "mage-fall",
    frames: anims.generateFrameNumbers("mage-jump", { start: 5, end: 7 }),
    frameRate: 8,
    repeat: 0,
  });
  anims.create({
    key: "mage-attack1",
    frames: anims.generateFrameNumbers("mage-attack1", { start: 0, end: 6 }),
    frameRate: 20,
    repeat: 0,
  });
  anims.create({
    key: "mage-attack2",
    frames: anims.generateFrameNumbers("mage-attack2", { start: 0, end: 8 }),
    frameRate: 18,
    repeat: 0,
  });
  anims.create({
    key: "mage-dead",
    frames: anims.generateFrameNumbers("mage-dead", { start: 0, end: 3 }),
    frameRate: 8,
    repeat: 0,
  });
  anims.create({
    key: "mage-hurt",
    frames: anims.generateFrameNumbers("mage-hurt", { start: 0, end: 3 }),
    frameRate: 10,
    repeat: 0,
  });

  anims.create({
    key: "berserker-idle",
    frames: anims.generateFrameNumbers("berserker-idle", { start: 0, end: 5 }),
    frameRate: 6,
    repeat: -1,
  });
  anims.create({
    key: "berserker-run",
    frames: anims.generateFrameNumbers("berserker-run", { start: 0, end: 11 }),
    frameRate: 14,
    repeat: -1,
  });
  anims.create({
    key: "berserker-jump-up",
    frames: anims.generateFrameNumbers("berserker-jump", { start: 0, end: 3 }),
    frameRate: 10,
    repeat: 0,
  });
  anims.create({
    key: "berserker-fall",
    frames: anims.generateFrameNumbers("berserker-jump", { start: 7, end: 9 }),
    frameRate: 8,
    repeat: 0,
  });
  anims.create({
    key: "berserker-attack1",
    frames: anims.generateFrameNumbers("berserker-attack1", {
      start: 0,
      end: 3,
    }),
    frameRate: 20,
    repeat: 0,
  });
  anims.create({
    key: "berserker-attack2",
    frames: anims.generateFrameNumbers("berserker-attack2", {
      start: 0,
      end: 3,
    }),
    frameRate: 18,
    repeat: 0,
  });
  anims.create({
    key: "berserker-dead",
    frames: anims.generateFrameNumbers("berserker-dead", { start: 0, end: 4 }),
    frameRate: 8,
    repeat: 0,
  });
  anims.create({
    key: "berserker-hurt",
    frames: anims.generateFrameNumbers("berserker-hurt", { start: 0, end: 2 }),
    frameRate: 10,
    repeat: 0,
  });

  anims.create({
    key: "hollow-knight-idle",
    frames: anims.generateFrameNumbers("hollow-knight-idle", {
      start: 0,
      end: 5,
    }),
    frameRate: 6,
    repeat: -1,
  });
  anims.create({
    key: "hollow-knight-walk",
    frames: anims.generateFrameNumbers("hollow-knight-walk", {
      start: 0,
      end: 11,
    }),
    frameRate: 10,
    repeat: -1,
  });
  anims.create({
    key: "hollow-knight-dead",
    frames: anims.generateFrameNumbers("hollow-knight-dead", {
      start: 0,
      end: 3,
    }),
    frameRate: 8,
    repeat: 0,
  });

  anims.create({
    key: "inferno-wyrm-idle",
    frames: anims.generateFrameNumbers("inferno-wyrm-idle", {
      start: 0,
      end: 6,
    }),
    frameRate: 6,
    repeat: -1,
  });
  anims.create({
    key: "inferno-wyrm-walk",
    frames: anims.generateFrameNumbers("inferno-wyrm-walk", {
      start: 0,
      end: 11,
    }),
    frameRate: 10,
    repeat: -1,
  });
  anims.create({
    key: "inferno-wyrm-dead",
    frames: anims.generateFrameNumbers("inferno-wyrm-dead", {
      start: 0,
      end: 2,
    }),
    frameRate: 6,
    repeat: 0,
  });

  anims.create({
    key: "frost-lich-idle",
    frames: anims.generateFrameNumbers("frost-lich-idle", { start: 0, end: 5 }),
    frameRate: 6,
    repeat: -1,
  });
  anims.create({
    key: "frost-lich-walk",
    frames: anims.generateFrameNumbers("frost-lich-walk", { start: 0, end: 9 }),
    frameRate: 10,
    repeat: -1,
  });
  anims.create({
    key: "frost-lich-dead",
    frames: anims.generateFrameNumbers("frost-lich-dead", { start: 0, end: 5 }),
    frameRate: 8,
    repeat: 0,
  });

  anims.create({
    key: "shadow-sovereign-idle",
    frames: anims.generateFrameNumbers("shadow-sovereign-idle", {
      start: 0,
      end: 7,
    }),
    frameRate: 6,
    repeat: -1,
  });
  anims.create({
    key: "shadow-sovereign-walk",
    frames: anims.generateFrameNumbers("shadow-sovereign-walk", {
      start: 0,
      end: 7,
    }),
    frameRate: 10,
    repeat: -1,
  });
  anims.create({
    key: "shadow-sovereign-dead",
    frames: anims.generateFrameNumbers("shadow-sovereign-dead", {
      start: 0,
      end: 7,
    }),
    frameRate: 8,
    repeat: 0,
  });
}
