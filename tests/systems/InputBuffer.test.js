import { describe, it, expect } from 'vitest';
import { CoyoteTimer } from '../../src/systems/InputBuffer.js';

describe('CoyoteTimer', () => {
  it('allows jump when grounded', () => {
    const ct = new CoyoteTimer(100);
    ct.update({ isGrounded: true, jumpPressed: false, deltaMs: 16 });
    expect(ct.canJump).toBe(true);
  });

  it('allows jump within coyote window after leaving ground', () => {
    const ct = new CoyoteTimer(100);
    ct.update({ isGrounded: true, jumpPressed: false, deltaMs: 16 });
    ct.update({ isGrounded: false, jumpPressed: false, deltaMs: 16 });
    expect(ct.canJump).toBe(true);
  });

  it('disallows jump after coyote window expires', () => {
    const ct = new CoyoteTimer(100);
    ct.update({ isGrounded: true, jumpPressed: false, deltaMs: 16 });
    ct.update({ isGrounded: false, jumpPressed: false, deltaMs: 16 });
    ct.update({ isGrounded: false, jumpPressed: false, deltaMs: 50 });
    ct.update({ isGrounded: false, jumpPressed: false, deltaMs: 50 });
    expect(ct.canJump).toBe(false);
  });

  it('resets canJump to false after jump is consumed', () => {
    const ct = new CoyoteTimer(100);
    ct.update({ isGrounded: true, jumpPressed: false, deltaMs: 16 });
    ct.consumeJump();
    expect(ct.canJump).toBe(false);
  });

  it('does not allow jump if never grounded', () => {
    const ct = new CoyoteTimer(100);
    ct.update({ isGrounded: false, jumpPressed: false, deltaMs: 16 });
    expect(ct.canJump).toBe(false);
  });

  it('resets timer when re-grounded', () => {
    const ct = new CoyoteTimer(100);
    ct.update({ isGrounded: true, jumpPressed: false, deltaMs: 16 });
    ct.update({ isGrounded: false, jumpPressed: false, deltaMs: 50 });
    ct.update({ isGrounded: false, jumpPressed: false, deltaMs: 50 });
    ct.update({ isGrounded: false, jumpPressed: false, deltaMs: 16 });
    expect(ct.canJump).toBe(false);
    ct.update({ isGrounded: true, jumpPressed: false, deltaMs: 16 });
    expect(ct.canJump).toBe(true);
  });

  it('caps delta at MAX_DELTA_MS (50ms)', () => {
    const ct = new CoyoteTimer(100);
    ct.update({ isGrounded: true, jumpPressed: false, deltaMs: 16 });
    ct.update({ isGrounded: false, jumpPressed: false, deltaMs: 5000 });
    expect(ct.canJump).toBe(true);
  });
});
