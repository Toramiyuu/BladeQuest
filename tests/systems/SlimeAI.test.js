import { describe, it, expect, beforeEach } from 'vitest';
import SlimeAI from '../../src/systems/SlimeAI.js';

describe('SlimeAI', () => {
  let ai;
  beforeEach(() => {
    ai = new SlimeAI();
  });

  describe('initial state', () => {
    it('starts moving left', () => {
      const { direction } = ai.update({ blockedLeft: false, blockedRight: false, hasGroundAhead: true, deltaMs: 16 });
      expect(direction).toBe(-1);
    });

    it('returns a non-zero speed', () => {
      const { speed } = ai.update({ blockedLeft: false, blockedRight: false, hasGroundAhead: true, deltaMs: 16 });
      expect(speed).toBeGreaterThan(0);
    });
  });

  describe('wall collision reversal', () => {
    it('reverses to the right when blocked on the left', () => {
      ai.update({ blockedLeft: true, blockedRight: false, hasGroundAhead: true, deltaMs: 16 });
      const { direction } = ai.update({ blockedLeft: false, blockedRight: false, hasGroundAhead: true, deltaMs: 16 });
      expect(direction).toBe(1);
    });

    it('reverses back to the left when blocked on the right', () => {
      ai.update({ blockedLeft: true, blockedRight: false, hasGroundAhead: true, deltaMs: 16 });
      ai.update({ blockedLeft: false, blockedRight: true, hasGroundAhead: true, deltaMs: 16 });
      const { direction } = ai.update({ blockedLeft: false, blockedRight: false, hasGroundAhead: true, deltaMs: 16 });
      expect(direction).toBe(-1);
    });

    it('ignores blocked-right when moving left (not facing that wall)', () => {
      const { direction } = ai.update({ blockedLeft: false, blockedRight: true, hasGroundAhead: true, deltaMs: 16 });
      expect(direction).toBe(-1);
    });
  });

  describe('ledge detection reversal', () => {
    it('reverses direction at a ledge', () => {
      ai.update({ blockedLeft: false, blockedRight: false, hasGroundAhead: false, deltaMs: 16 });
      const { direction } = ai.update({ blockedLeft: false, blockedRight: false, hasGroundAhead: true, deltaMs: 16 });
      expect(direction).toBe(1);
    });

    it('does not reverse when ground is present ahead', () => {
      const { direction } = ai.update({ blockedLeft: false, blockedRight: false, hasGroundAhead: true, deltaMs: 16 });
      expect(direction).toBe(-1);
    });
  });

  describe('bounds reversal', () => {
    it('reverses when at left world boundary', () => {
      ai.update({ blockedLeft: false, blockedRight: false, hasGroundAhead: true, atLeftBound: true, deltaMs: 16 });
      const { direction } = ai.update({ blockedLeft: false, blockedRight: false, hasGroundAhead: true, deltaMs: 16 });
      expect(direction).toBe(1);
    });

    it('reverses when at right world boundary', () => {
      ai.update({ blockedLeft: true, blockedRight: false, hasGroundAhead: true, deltaMs: 16 });
      ai.update({ blockedLeft: false, blockedRight: false, hasGroundAhead: true, atRightBound: true, deltaMs: 16 });
      const { direction } = ai.update({ blockedLeft: false, blockedRight: false, hasGroundAhead: true, deltaMs: 16 });
      expect(direction).toBe(-1);
    });
  });
});
