/**
 * loadAssets — all Phaser preload() calls extracted from BootScene.
 *
 * Call once from BootScene.preload() via loadAssets(this).
 */
export function loadAssets(scene) {
  scene.load.tilemapTiledJSON("test-level", "assets/tilemaps/test-level.json");

  scene.load.image("bg-sky", "assets/backgrounds/bg-sky.png");
  scene.load.image("bg-hills", "assets/backgrounds/bg-hills.png");
  scene.load.image("bg-trees", "assets/backgrounds/bg-trees.png");

  const p128 = { frameWidth: 128, frameHeight: 128 };
  ["idle", "run", "attack1", "attack2", "jump", "dead", "hurt"].forEach((a) =>
    scene.load.spritesheet(
      `player-${a}`,
      `assets/sprites/player/${a}.png`,
      p128,
    ),
  );

  const cls96 = { frameWidth: 96, frameHeight: 96 };
  ["idle", "run", "attack1", "attack2", "jump", "dead", "hurt"].forEach((a) =>
    scene.load.spritesheet(
      `shinobi-${a}`,
      `assets/sprites/shinobi/${a}.png`,
      cls96,
    ),
  );

  const cls128 = { frameWidth: 128, frameHeight: 128 };
  ["idle", "run", "attack1", "attack2", "jump", "dead", "hurt"].forEach((a) => {
    scene.load.spritesheet(
      `knight-${a}`,
      `assets/sprites/knight/${a}.png`,
      cls128,
    );
    scene.load.spritesheet(`mage-${a}`, `assets/sprites/mage/${a}.png`, cls128);
    scene.load.spritesheet(
      `berserker-${a}`,
      `assets/sprites/berserker/${a}.png`,
      cls128,
    );
  });

  ["idle", "run", "attack1", "attack2", "dead", "hurt"].forEach((a) =>
    scene.load.spritesheet(
      `rogue-${a}`,
      `assets/sprites/rogue/${a}.png`,
      cls128,
    ),
  );

  const boss72 = { frameWidth: 72, frameHeight: 72 };
  const boss256 = { frameWidth: 256, frameHeight: 256 };
  ["idle", "walk", "dead"].forEach((a) => {
    scene.load.spritesheet(
      `hollow-knight-${a}`,
      `assets/sprites/boss/goblin-king/${a}.png`,
      boss72,
    );
    scene.load.spritesheet(
      `frost-lich-${a}`,
      `assets/sprites/boss/frost-lich/${a}.png`,
      cls128,
    );
    scene.load.spritesheet(
      `inferno-wyrm-${a}`,
      `assets/sprites/boss/inferno-wyrm/${a}.png`,
      boss256,
    );
    scene.load.spritesheet(
      `shadow-sovereign-${a}`,
      `assets/sprites/boss/shadow-sovereign/${a}.png`,
      boss256,
    );
  });

  const cls64 = { frameWidth: 64, frameHeight: 64 };
  ["idle", "walk", "death", "hurt"].forEach((a) =>
    scene.load.spritesheet(
      `skel-${a}`,
      `assets/sprites/skeleton/${a}.png`,
      cls64,
    ),
  );

  scene.load.spritesheet("slime-idle", "assets/sprites/slime/idle.png", cls128);
  scene.load.spritesheet("slime-walk", "assets/sprites/slime/run.png", cls128);
  scene.load.spritesheet("slime-dead", "assets/sprites/slime/dead.png", cls128);

  const cls32 = { frameWidth: 32, frameHeight: 32 };
  scene.load.spritesheet("bat-idle", "assets/sprites/bat/idle.png", cls32);
  scene.load.spritesheet("bat-dead", "assets/sprites/bat/dead.png", cls32);

  const cls42 = { frameWidth: 42, frameHeight: 42 };
  ["idle", "walk", "dead"].forEach((a) => {
    scene.load.spritesheet(
      `goblin-melee-${a}`,
      `assets/sprites/goblin-melee/${a}.png`,
      cls42,
    );
    scene.load.spritesheet(
      `goblin-range-${a}`,
      `assets/sprites/goblin-range/${a}.png`,
      cls42,
    );
  });

  const npc128 = { frameWidth: 128, frameHeight: 128 };
  [
    "blacksmith-idle",
    "blacksmith-dialogue",
    "merchant-idle",
    "merchant-sell",
    "guildmaster-idle",
    "guildmaster-dialogue",
  ].forEach((k) =>
    scene.load.spritesheet(k, `assets/sprites/npcs/${k}.png`, npc128),
  );

  scene.load.image("hub-bg-far", "assets/backgrounds/hub-bg-far.png");
  scene.load.image("hub-bg-near", "assets/backgrounds/hub-bg-near.png");
  [
    "wall-a",
    "wall-b",
    "wall-c",
    "roof-a",
    "roof-b",
    "canopy",
    "door-a",
    "door-b",
    "door-wide",
    "chimney",
  ].forEach((k) => scene.load.image(`hub-${k}`, `assets/sprites/hub/${k}.png`));

  for (let i = 1; i <= 30; i++) {
    const n = String(i).padStart(2, "0");
    scene.load.image(`weapon-${n}`, `assets/icons/weapons/weapon-${n}.png`);
    scene.load.image(`armor-${n}`, `assets/icons/armor/armor-${n}.png`);
  }
  for (let i = 1; i <= 15; i++) {
    const n = String(i).padStart(2, "0");
    scene.load.image(`item-${n}`, `assets/icons/items/item-${n}.png`);
  }
}
