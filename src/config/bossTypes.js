/**
 * Boss type configurations — one per tier (floor 10/20/30/40).
 * Index 0 = Hollow Knight (floor 10), index 3 = Shadow Sovereign (floor 40).
 */

import {
  BOSS_PATROL_SPEED,
  BOSS_CHARGE_SPEED,
  BOSS_CHARGE_RANGE,
  BOSS_JUMP_FORCE,
} from "./constants.js";

export const BOSS_TYPES = [
  {
    name: "Hollow Knight",
    tint: 0xffffff,
    scale: 0.95,
    sprites: {
      idleKey: "hollow-knight-idle",
      walkKey: "hollow-knight-walk",
      deathKey: "hollow-knight-dead",
    },
    hitbox: { w: 28, h: 44, ox: 21, oy: 13 },
    aiParams: {
      patrolSpeed: BOSS_PATROL_SPEED,
      chargeSpeed: BOSS_CHARGE_SPEED,
      chargeRange: BOSS_CHARGE_RANGE,
      jumpForce: BOSS_JUMP_FORCE,
    },
    special: {
      label: "THORN BURST",
      range: 80,
      damage: 1,
      intervalMs: 4500,
      color: 0x33ff33,
    },
  },
  {
    name: "Inferno Wyrm",
    tint: 0xffffff,
    scale: 0.7,
    sprites: {
      idleKey: "inferno-wyrm-idle",
      walkKey: "inferno-wyrm-walk",
      deathKey: "inferno-wyrm-dead",
    },
    hitbox: { w: 60, h: 80, ox: 98, oy: 88 },
    aiParams: {
      patrolSpeed: BOSS_PATROL_SPEED * 0.7,
      chargeSpeed: BOSS_CHARGE_SPEED * 1.4,
      chargeRange: BOSS_CHARGE_RANGE * 1.3,
      jumpForce: BOSS_JUMP_FORCE * 1.2,
    },
    special: {
      label: "MAGMA SLAM",
      range: 140,
      damage: 1,
      intervalMs: 4000,
      color: 0xff6600,
    },
  },
  {
    name: "Frost Lich",
    tint: 0xffffff,
    scale: 1.1,
    sprites: {
      idleKey: "frost-lich-idle",
      walkKey: "frost-lich-walk",
      deathKey: "frost-lich-dead",
    },
    hitbox: { w: 28, h: 44, ox: 50, oy: 40 },
    aiParams: {
      patrolSpeed: BOSS_PATROL_SPEED * 0.8,
      chargeSpeed: BOSS_CHARGE_SPEED * 0.9,
      chargeRange: BOSS_CHARGE_RANGE * 1.5,
      jumpForce: BOSS_JUMP_FORCE * 0.7,
    },
    special: {
      label: "ICE NOVA",
      range: 110,
      damage: 1,
      intervalMs: 5500,
      color: 0x88eeff,
    },
  },
  {
    name: "Shadow Sovereign",
    tint: 0xffffff,
    scale: 0.65,
    sprites: {
      idleKey: "shadow-sovereign-idle",
      walkKey: "shadow-sovereign-walk",
      deathKey: "shadow-sovereign-dead",
    },
    hitbox: { w: 60, h: 80, ox: 98, oy: 88 },
    aiParams: {
      patrolSpeed: BOSS_PATROL_SPEED * 1.3,
      chargeSpeed: BOSS_CHARGE_SPEED * 1.6,
      chargeRange: BOSS_CHARGE_RANGE * 0.8,
      jumpForce: BOSS_JUMP_FORCE * 1.3,
    },
    special: {
      label: "VOID STRIKE",
      range: 90,
      damage: 2,
      intervalMs: 3500,
      color: 0xaa44ff,
    },
  },
];
