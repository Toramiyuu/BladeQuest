import { describe, it, expect, beforeEach } from 'vitest';
import CombatSystem from '../../src/systems/CombatSystem.js';

const FRAME_DATA = {
  slash1: { windup: 50, active: 67, recovery: 83 },
  slash2: { windup: 50, active: 67, recovery: 83 },
  heavy:  { windup: 83, active: 100, recovery: 133 },
  air:    { windup: 33, active: 100, recovery: 67 },
  comboWindow: 67,
};

function advance(cs, totalMs, inputOnFirst = {}) {
  const MAX_TICK = 50;
  let remaining = totalMs;
  let firstTick = true;
  while (remaining > 0) {
    const tick = Math.min(remaining, MAX_TICK);
    cs.update(tick, firstTick ? inputOnFirst : {});
    remaining -= tick;
    firstTick = false;
  }
}

describe('CombatSystem', () => {
  let cs;
  beforeEach(() => {
    cs = new CombatSystem(FRAME_DATA);
  });

  describe('idle state', () => {
    it('starts in idle state', () => {
      expect(cs.state).toBe('idle');
    });

    it('does nothing when attack not pressed in idle', () => {
      cs.update(16, { attackJustPressed: false, isAirborne: false });
      expect(cs.state).toBe('idle');
    });
  });

  describe('Slash 1 timing', () => {
    it('transitions to windup on attack press', () => {
      cs.update(16, { attackJustPressed: true, isAirborne: false });
      expect(cs.state).toBe('slash1_windup');
    });

    it('transitions to active after windup elapses (50ms)', () => {
      cs.update(16, { attackJustPressed: true, isAirborne: false });
      advance(cs, 50);
      expect(cs.state).toBe('slash1_active');
    });

    it('hitbox is enabled during active frames', () => {
      cs.update(16, { attackJustPressed: true, isAirborne: false });
      advance(cs, 50);
      expect(cs.hitboxActive).toBe(true);
    });

    it('transitions to recovery after active elapses (67ms)', () => {
      cs.update(16, { attackJustPressed: true, isAirborne: false });
      advance(cs, 50);
      advance(cs, 67);
      expect(cs.state).toBe('slash1_recovery');
    });

    it('hitbox is disabled during recovery', () => {
      cs.update(16, { attackJustPressed: true, isAirborne: false });
      advance(cs, 50);
      advance(cs, 67);
      expect(cs.hitboxActive).toBe(false);
    });

    it('returns to idle after recovery elapses without combo input (83ms)', () => {
      cs.update(16, { attackJustPressed: true, isAirborne: false });
      advance(cs, 50);
      advance(cs, 67);
      advance(cs, 90);
      expect(cs.state).toBe('idle');
    });
  });

  describe('combo chaining', () => {
    function enterSlash1Recovery(cs) {
      cs.update(16, { attackJustPressed: true, isAirborne: false });
      advance(cs, 50);
      advance(cs, 67);
    }

    it('chains to Slash 2 when attack pressed during combo window', () => {
      enterSlash1Recovery(cs);
      advance(cs, 20);
      cs.update(0, { attackJustPressed: true, isAirborne: false });
      advance(cs, 80);
      expect(cs.state).toBe('slash2_windup');
    });

    it('does not chain if attack pressed before combo window opens', () => {
      enterSlash1Recovery(cs);
      cs.update(0, { attackJustPressed: true, isAirborne: false });
      expect(cs.state).toBe('slash1_recovery');
      advance(cs, 100);
      expect(cs.state).toBe('idle');
    });

    it('chains Slash 2 → Heavy Slash', () => {
      enterSlash1Recovery(cs);
      advance(cs, 20);
      cs.update(0, { attackJustPressed: true, isAirborne: false });
      advance(cs, 80);
      expect(cs.state).toBe('slash2_windup');

      advance(cs, 50);
      advance(cs, 67);
      advance(cs, 20);
      cs.update(0, { attackJustPressed: true, isAirborne: false });
      advance(cs, 80);
      expect(cs.state).toBe('heavy_windup');
    });

    it('Heavy Slash resets combo after recovery (no slash4)', () => {
      enterSlash1Recovery(cs);
      advance(cs, 20); cs.update(0, { attackJustPressed: true }); advance(cs, 80);
      advance(cs, 50); advance(cs, 67);
      advance(cs, 20); cs.update(0, { attackJustPressed: true }); advance(cs, 80);
      advance(cs, 83); advance(cs, 100);
      advance(cs, 140);
      expect(cs.state).toBe('idle');
    });
  });

  describe('air slash', () => {
    it('uses air_slash when airborne', () => {
      cs.update(16, { attackJustPressed: true, isAirborne: true });
      expect(cs.state).toBe('air_windup');
    });

    it('does not enter air_slash when grounded', () => {
      cs.update(16, { attackJustPressed: true, isAirborne: false });
      expect(cs.state).not.toBe('air_windup');
    });
  });

  describe('millisecond timing', () => {
    it('caps delta at 50ms internally — spike only advances 50ms', () => {
      cs.update(16, { attackJustPressed: true, isAirborne: false });
      cs.update(5000, { attackJustPressed: false, isAirborne: false });
      expect(cs.state).toBe('slash1_active');
    });

    it('reports correct current attack type', () => {
      cs.update(16, { attackJustPressed: true, isAirborne: false });
      expect(cs.currentAttack).toBe('slash1');
    });
  });
});
