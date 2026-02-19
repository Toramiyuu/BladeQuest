/**
 * StateMachine — pure JS, no Phaser dependency.
 * Tracks named states with enter/exit/update callbacks.
 * Used for player movement states (idle, run, jump, fall)
 * and attack states (attack1, attack2, attack3, air_attack).
 */
export default class StateMachine {
  constructor(initialState) {
    this._states = {};
    this._current = initialState;
    this._previous = null;
    this._states[initialState] = {};
  }

  /** Register a state with optional enter/exit/update callbacks. */
  addState(name, { enter, exit, update } = {}) {
    this._states[name] = { enter, exit, update };
  }

  get currentState() {
    return this._current;
  }

  get previousState() {
    return this._previous;
  }

  /** Transition to a new state. No-op if already in that state. */
  transition(name) {
    if (!Object.hasOwn(this._states, name)) {
      throw new Error(`StateMachine: unknown state "${name}"`);
    }
    if (name === this._current) return;

    const exitFn = this._states[this._current]?.exit;
    if (exitFn) exitFn();

    this._previous = this._current;
    this._current = name;

    const enterFn = this._states[this._current]?.enter;
    if (enterFn) enterFn();
  }

  /** Call the update callback of the current state. */
  update(deltaMs) {
    const updateFn = this._states[this._current]?.update;
    if (updateFn) updateFn(deltaMs);
  }
}
