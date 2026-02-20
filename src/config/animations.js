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
}
