import { describe, it, expect, beforeEach } from "vitest";
import SkeletonAI from "../../src/systems/SkeletonAI.js";

describe("SkeletonAI", () => {
  let ai;

  beforeEach(() => {
    ai = new SkeletonAI();
  });


  it("starts in walk state moving left", () => {
    expect(ai.state).toBe("walk");
    expect(ai.direction).toBe(-1);
  });


  it("walk returns non-zero vx matching direction", () => {
    const { vx, state } = ai.update({ dt: 16 });
    expect(state).toBe("walk");
    expect(vx).toBeLessThan(0);
  });

  it("walk reverses direction when hitting left wall", () => {
    ai.update({ dt: 16, blockedLeft: true });
    expect(ai.direction).toBe(1);
  });

  it("walk reverses direction at left world bound", () => {
    ai.update({ dt: 16, atLeftBound: true });
    expect(ai.direction).toBe(1);
  });

  it("walk reverses direction when no ground ahead", () => {
    ai.update({ dt: 16, hasGroundAhead: false });
    expect(ai.direction).toBe(1);
  });

  it("walk transitions to pause when timer expires", () => {
    let state = "walk";
    for (let i = 0; i < 200 && state === "walk"; i++) {
      ({ state } = ai.update({ dt: 16 }));
    }
    expect(state).toBe("pause");
  });

  it("walk aggressively transitions to pause when player is close and in same direction", () => {
    ai.update({ dt: 16, blockedLeft: true });
    const { state } = ai.update({ dt: 16, playerOffsetX: 50 });
    expect(state).toBe("pause");
  });


  it("pause returns vx=0", () => {
    ai._state = "pause";
    ai._timer = 600;
    const { vx } = ai.update({ dt: 16 });
    expect(vx).toBe(0);
  });

  it("pause transitions to lunge after timer expires", () => {
    ai._state = "pause";
    ai._timer = 16;
    const { state } = ai.update({ dt: 16 });
    expect(state).toBe("lunge");
  });


  it("lunge returns high vx in current direction", () => {
    ai._state = "lunge";
    ai._dir = 1;
    ai._timer = 300;
    const { vx } = ai.update({ dt: 16 });
    expect(vx).toBeGreaterThan(100);
  });

  it("lunge transitions to recover after timer expires", () => {
    ai._state = "lunge";
    ai._timer = 16;
    const { state } = ai.update({ dt: 16 });
    expect(state).toBe("recover");
  });


  it("recover returns vx=0", () => {
    ai._state = "recover";
    ai._timer = 400;
    const { vx } = ai.update({ dt: 16 });
    expect(vx).toBe(0);
  });

  it("recover transitions back to walk after timer expires", () => {
    ai._state = "recover";
    ai._timer = 16;
    const { state } = ai.update({ dt: 16 });
    expect(state).toBe("walk");
  });


  it("completes full walk→pause→lunge→recover→walk cycle", () => {
    const states = [];
    let prev = "";
    for (let i = 0; i < 5000; i++) {
      const { state } = ai.update({ dt: 16 });
      if (state !== prev) {
        states.push(state);
        prev = state;
      }
      if (states.length >= 5) break;
    }
    expect(states[0]).toBe("walk");
    expect(states[1]).toBe("pause");
    expect(states[2]).toBe("lunge");
    expect(states[3]).toBe("recover");
    expect(states[4]).toBe("walk");
  });
});
