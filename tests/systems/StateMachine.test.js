import { describe, it, expect, vi } from 'vitest';
import StateMachine from '../../src/systems/StateMachine.js';

describe('StateMachine', () => {
  it('starts in the initial state', () => {
    const sm = new StateMachine('idle');
    expect(sm.currentState).toBe('idle');
  });

  it('transitions to a new state', () => {
    const sm = new StateMachine('idle');
    sm.addState('run', {});
    sm.transition('run');
    expect(sm.currentState).toBe('run');
  });

  it('calls enter callback on transition', () => {
    const enter = vi.fn();
    const sm = new StateMachine('idle');
    sm.addState('run', { enter });
    sm.transition('run');
    expect(enter).toHaveBeenCalledOnce();
  });

  it('calls exit callback when leaving a state', () => {
    const exit = vi.fn();
    const sm = new StateMachine('idle');
    sm.addState('idle', { exit });
    sm.addState('run', {});
    sm.transition('run');
    expect(exit).toHaveBeenCalledOnce();
  });

  it('does not call enter if already in that state', () => {
    const enter = vi.fn();
    const sm = new StateMachine('idle');
    sm.addState('idle', { enter });
    sm.transition('idle');
    expect(enter).not.toHaveBeenCalled();
  });

  it('calls update callback for current state', () => {
    const update = vi.fn();
    const sm = new StateMachine('idle');
    sm.addState('idle', { update });
    sm.update(16);
    expect(update).toHaveBeenCalledWith(16);
  });

  it('does not call update for non-current states', () => {
    const idleUpdate = vi.fn();
    const runUpdate = vi.fn();
    const sm = new StateMachine('idle');
    sm.addState('idle', { update: idleUpdate });
    sm.addState('run', { update: runUpdate });
    sm.update(16);
    expect(idleUpdate).toHaveBeenCalledOnce();
    expect(runUpdate).not.toHaveBeenCalled();
  });

  it('throws when transitioning to unknown state', () => {
    const sm = new StateMachine('idle');
    expect(() => sm.transition('nonexistent')).toThrow();
  });

  it('tracks previous state after transition', () => {
    const sm = new StateMachine('idle');
    sm.addState('run', {});
    sm.transition('run');
    expect(sm.previousState).toBe('idle');
  });

  it('supports all movement and attack states', () => {
    const sm = new StateMachine('idle');
    const states = ['idle', 'run', 'jump', 'fall', 'attack1', 'attack2', 'attack3', 'air_attack'];
    states.forEach(s => sm.addState(s, {}));
    states.forEach(s => {
      sm.transition(s);
      expect(sm.currentState).toBe(s);
    });
  });
});
