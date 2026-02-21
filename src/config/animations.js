/**
 * animations — entry point that registers all animation definitions.
 * Called once from DungeonScene.create() via createAnimations(this.anims).
 */
import { createClassAnimations } from "./animationsClasses.js";
import { createEnemyAnimations } from "./animationsEnemies.js";

export function createAnimations(anims) {
  if (anims.exists("player-idle")) return;
  createClassAnimations(anims);
  createEnemyAnimations(anims);
}
