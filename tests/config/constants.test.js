import { describe, it, expect } from 'vitest';
import * as C from '../../src/config/constants.js';

describe('constants', () => {
  it('exports all values as numbers', () => {
    for (const [key, value] of Object.entries(C)) {
      expect(typeof value, `${key} should be a number`).toBe('number');
    }
  });

  it('exports game resolution constants', () => {
    expect(C.GAME_WIDTH).toBe(480);
    expect(C.GAME_HEIGHT).toBe(270);
  });

  it('exports movement timing constants in milliseconds', () => {
    expect(C.COYOTE_TIME_MS).toBe(100);
    expect(C.JUMP_HOLD_MAX_MS).toBe(250);
  });

  it('exports combat timing constants in milliseconds', () => {
    expect(C.SLASH1_WINDUP_MS).toBeGreaterThan(0);
    expect(C.SLASH1_ACTIVE_MS).toBeGreaterThan(0);
    expect(C.SLASH1_RECOVERY_MS).toBeGreaterThan(0);
    expect(C.HEAVY_WINDUP_MS).toBeGreaterThan(C.SLASH1_WINDUP_MS);
    expect(C.COMBO_WINDOW_MS).toBeGreaterThan(0);
  });

  it('exports health constants', () => {
    expect(C.MAX_HEALTH).toBe(5);
    expect(C.INVULNERABILITY_MS).toBe(1500);
    expect(C.FLASH_INTERVAL_MS).toBe(100);
    expect(C.KNOCKBACK_LOCK_MS).toBe(250);
  });

  it('exports delta cap constant', () => {
    expect(C.MAX_DELTA_MS).toBe(50);
  });

  it('jump velocity is negative (upward)', () => {
    expect(C.JUMP_VELOCITY).toBeLessThan(0);
  });

  it('gravity reduction is negative (counteracts positive gravity)', () => {
    expect(C.JUMP_GRAVITY_REDUCTION).toBeLessThan(0);
  });
});
