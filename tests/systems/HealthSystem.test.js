import { describe, it, expect, beforeEach } from 'vitest';
import HealthSystem from '../../src/systems/HealthSystem.js';

const INVULNERABILITY_MS = 1500;
const MAX_DELTA = 50;

/** Advance the health system by totalMs, in ≤50ms ticks. */
function advance(hs, totalMs) {
  let remaining = totalMs;
  while (remaining > 0) {
    const tick = Math.min(remaining, MAX_DELTA);
    hs.update(tick);
    remaining -= tick;
  }
}

describe('HealthSystem', () => {
  let hs;
  beforeEach(() => {
    hs = new HealthSystem(5);
  });

  describe('initial state', () => {
    it('starts at max health', () => {
      expect(hs.currentHealth).toBe(5);
    });

    it('reports max health', () => {
      expect(hs.maxHealth).toBe(5);
    });

    it('is not dead at full health', () => {
      expect(hs.isDead()).toBe(false);
    });

    it('is not invulnerable at start', () => {
      expect(hs.isInvulnerable()).toBe(false);
    });
  });

  describe('takeDamage', () => {
    it('reduces health by the damage amount', () => {
      hs.takeDamage(1);
      expect(hs.currentHealth).toBe(4);
    });

    it('triggers invulnerability after taking damage', () => {
      hs.takeDamage(1);
      expect(hs.isInvulnerable()).toBe(true);
    });

    it('does not reduce health below zero', () => {
      hs.takeDamage(99);
      expect(hs.currentHealth).toBe(0);
    });

    it('does not take damage while invulnerable', () => {
      hs.takeDamage(1);
      hs.takeDamage(1);
      expect(hs.currentHealth).toBe(4);
    });
  });

  describe('isDead', () => {
    it('returns true when health reaches 0', () => {
      hs.takeDamage(5);
      expect(hs.isDead()).toBe(true);
    });

    it('returns false when health is above 0', () => {
      hs.takeDamage(4);
      expect(hs.isDead()).toBe(false);
    });
  });

  describe('invulnerability timing', () => {
    it('remains invulnerable before window expires', () => {
      hs.takeDamage(1);
      advance(hs, INVULNERABILITY_MS - 1);
      expect(hs.isInvulnerable()).toBe(true);
    });

    it('becomes vulnerable after invulnerability window expires', () => {
      hs.takeDamage(1);
      advance(hs, INVULNERABILITY_MS);
      expect(hs.isInvulnerable()).toBe(false);
    });

    it('can take damage again after invulnerability expires', () => {
      hs.takeDamage(1);
      advance(hs, INVULNERABILITY_MS);
      hs.takeDamage(1);
      expect(hs.currentHealth).toBe(3);
    });

    it('caps delta at MAX_DELTA internally — large spike still tracks time correctly', () => {
      hs.takeDamage(1);
      hs.update(5000);
      expect(hs.isInvulnerable()).toBe(true);
    });
  });

  describe('heal', () => {
    it('restores health by the given amount', () => {
      hs.takeDamage(2);
      advance(hs, INVULNERABILITY_MS);
      hs.heal(1);
      expect(hs.currentHealth).toBe(4);
    });

    it('does not heal above max health', () => {
      hs.heal(10);
      expect(hs.currentHealth).toBe(5);
    });
  });

  describe('reset', () => {
    it('restores full health and clears invulnerability', () => {
      hs.takeDamage(3);
      hs.reset();
      expect(hs.currentHealth).toBe(5);
      expect(hs.isInvulnerable()).toBe(false);
    });
  });
});
