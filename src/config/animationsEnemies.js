/**
 * animationsEnemies — enemy and boss animation definitions.
 */
export function createEnemyAnimations(anims) {
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
    key: "slime-idle",
    frames: anims.generateFrameNumbers("slime-idle", { start: 0, end: 7 }),
    frameRate: 6,
    repeat: -1,
  });
  anims.create({
    key: "slime-walk",
    frames: anims.generateFrameNumbers("slime-walk", { start: 0, end: 6 }),
    frameRate: 8,
    repeat: -1,
  });
  anims.create({
    key: "slime-dead",
    frames: anims.generateFrameNumbers("slime-dead", { start: 0, end: 2 }),
    frameRate: 8,
    repeat: 0,
  });

  anims.create({
    key: "bat-idle",
    frames: anims.generateFrameNumbers("bat-idle", { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1,
  });
  anims.create({
    key: "bat-dead",
    frames: anims.generateFrameNumbers("bat-dead", { start: 0, end: 3 }),
    frameRate: 10,
    repeat: 0,
  });

  anims.create({
    key: "goblin-melee-idle",
    frames: anims.generateFrameNumbers("goblin-melee-idle", {
      start: 0,
      end: 3,
    }),
    frameRate: 5,
    repeat: -1,
  });
  anims.create({
    key: "goblin-melee-walk",
    frames: anims.generateFrameNumbers("goblin-melee-walk", {
      start: 0,
      end: 5,
    }),
    frameRate: 8,
    repeat: -1,
  });
  anims.create({
    key: "goblin-melee-dead",
    frames: anims.generateFrameNumbers("goblin-melee-dead", {
      start: 0,
      end: 3,
    }),
    frameRate: 8,
    repeat: 0,
  });

  anims.create({
    key: "goblin-range-idle",
    frames: anims.generateFrameNumbers("goblin-range-idle", {
      start: 0,
      end: 3,
    }),
    frameRate: 5,
    repeat: -1,
  });
  anims.create({
    key: "goblin-range-dead",
    frames: anims.generateFrameNumbers("goblin-range-dead", {
      start: 0,
      end: 3,
    }),
    frameRate: 8,
    repeat: 0,
  });

  anims.create({
    key: "hollow-knight-idle",
    frames: anims.generateFrameNumbers("hollow-knight-idle", {
      start: 0,
      end: 3,
    }),
    frameRate: 6,
    repeat: -1,
  });
  anims.create({
    key: "hollow-knight-walk",
    frames: anims.generateFrameNumbers("hollow-knight-walk", {
      start: 0,
      end: 5,
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
