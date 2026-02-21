import { describe, it, expect, beforeEach } from "vitest";
import ArcherAI from "../../src/systems/ArcherAI.js";

describe("ArcherAI", () => {
  let ai;

  beforeEach(() => {
    ai = new ArcherAI();
  });


  it("starts in idle state", () => {
    expect(ai.state).toBe("idle");
    expect(ai.direction).toBe(-1);
  });


  it("idle returns shouldFire=false when player is out of range", () => {
    const { shouldFire } = ai.update({ dt: 16, playerOffsetX: 999 });
    expect(shouldFire).toBe(false);
    expect(ai.state).toBe("idle");
  });

  it("idle transitions to aim when player enters range", () => {
    ai.update({ dt: 16, playerOffsetX: 200 });
    expect(ai.state).toBe("aim");
  });

  it("idle faces toward player on aggro", () => {
    ai.update({ dt: 16, playerOffsetX: 150 });
    expect(ai.direction).toBe(1);
  });

  it("idle faces left when player is to the left", () => {
    ai.update({ dt: 16, playerOffsetX: -150 });
    expect(ai.direction).toBe(-1);
  });


  it("aim returns shouldFire=false", () => {
    ai._state = "aim";
    ai._timer = 600;
    const { shouldFire } = ai.update({ dt: 16 });
    expect(shouldFire).toBe(false);
  });

  it("aim tracks player direction while winding up", () => {
    ai._state = "aim";
    ai._timer = 600;
    ai._dir = -1;
    ai.update({ dt: 16, playerOffsetX: 100 });
    expect(ai.direction).toBe(1);
  });

  it("aim transitions to fire when timer expires", () => {
    ai._state = "aim";
    ai._timer = 16;
    const { state } = ai.update({ dt: 16 });
    expect(state).toBe("fire");
  });


  it("fire returns shouldFire=true", () => {
    ai._state = "fire";
    ai._timer = 100;
    const { shouldFire } = ai.update({ dt: 16 });
    expect(shouldFire).toBe(true);
  });

  it("fire provides correct facingDir", () => {
    ai._state = "fire";
    ai._timer = 100;
    ai._dir = 1;
    const { facingDir } = ai.update({ dt: 16 });
    expect(facingDir).toBe(1);
  });

  it("fire transitions to cooldown after timer expires", () => {
    ai._state = "fire";
    ai._timer = 16;
    const { state } = ai.update({ dt: 16 });
    expect(state).toBe("cooldown");
  });


  it("cooldown returns shouldFire=false", () => {
    ai._state = "cooldown";
    ai._timer = 2000;
    const { shouldFire } = ai.update({ dt: 16 });
    expect(shouldFire).toBe(false);
  });

  it("cooldown returns to idle after timer expires", () => {
    ai._state = "cooldown";
    ai._timer = 16;
    const { state } = ai.update({ dt: 16 });
    expect(state).toBe("idle");
  });


  it("completes full idle→aim→fire→cooldown→idle cycle when player in range", () => {
    const states = [];
    let prev = "";
    for (let i = 0; i < 5000; i++) {
      const { state } = ai.update({ dt: 16, playerOffsetX: 100 });
      if (state !== prev) {
        states.push(state);
        prev = state;
      }
      if (states.length >= 5) break;
    }
    expect(states[0]).toBe("aim");
    expect(states[1]).toBe("fire");
    expect(states[2]).toBe("cooldown");
    expect(states[3]).toBe("idle");
    expect(states[4]).toBe("aim");
  });

  it("stays in idle indefinitely when player is out of range", () => {
    for (let i = 0; i < 300; i++) {
      ai.update({ dt: 16, playerOffsetX: 999 });
    }
    expect(ai.state).toBe("idle");
  });
});
