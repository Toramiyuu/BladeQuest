/**
 * CombatSystem — pure JS, no Phaser dependency.
 *
 * Manages the 3-hit ground combo (Slash 1 → Slash 2 → Heavy Slash) and
 * airborne downward slash. Each attack has millisecond-based wind-up,
 * active, and recovery phases. A combo window at the end of recovery
 * allows chaining to the next hit.
 *
 * State naming: '<attack>_<phase>'
 *   Phases: windup | active | recovery
 *   Attacks: slash1, slash2, heavy, air
 *
 * Usage:
 *   const cs = new CombatSystem(frameData);
 *
 *   cs.update(dt, { attackJustPressed, isAirborne });
 *
 *   cs.hitboxActive   → true during active frames
 *   cs.currentAttack  → 'slash1' | 'slash2' | 'heavy' | 'air' | null
 *   cs.state          → full state string e.g. 'slash1_active'
 */

const MAX_DELTA = 50;

export default class CombatSystem {
  constructor(frameData) {
    this._fd = frameData;
    this._state = "idle";
    this._timer = 0;
    this._comboQueued = false;
    this._comboCount = 0;

    this.hitboxActive = false;
    this.currentAttack = null;
  }

  get state() {
    return this._state;
  }

  /**
   * @param {number} deltaMs - Elapsed ms since last frame (will be clamped to MAX_DELTA)
   * @param {Object} input
   * @param {boolean} input.attackJustPressed - True only on the frame the key was first pressed (edge-triggered)
   * @param {boolean} input.isAirborne - True when player is not grounded
   */
  update(deltaMs, input = {}) {
    const dt = Math.min(deltaMs, MAX_DELTA);
    const { attackJustPressed = false, isAirborne = false } = input;

    switch (this._state) {
      case "idle":
        this._updateIdle(dt, attackJustPressed, isAirborne);
        break;
      case "slash1_windup":
        this._updatePhase(dt, this._fd.slash1.windup, "slash1_active");
        break;
      case "slash1_active":
        this._updatePhase(dt, this._fd.slash1.active, "slash1_recovery");
        break;
      case "slash1_recovery":
        this._updateRecovery(
          dt,
          this._fd.slash1.recovery,
          attackJustPressed,
          "slash2",
        );
        break;
      case "slash2_windup":
        this._updatePhase(dt, this._fd.slash2.windup, "slash2_active");
        break;
      case "slash2_active":
        this._updatePhase(dt, this._fd.slash2.active, "slash2_recovery");
        break;
      case "slash2_recovery":
        this._updateRecovery(
          dt,
          this._fd.slash2.recovery,
          attackJustPressed,
          "heavy",
        );
        break;
      case "heavy_windup":
        this._updatePhase(dt, this._fd.heavy.windup, "heavy_active");
        break;
      case "heavy_active":
        this._updatePhase(dt, this._fd.heavy.active, "heavy_recovery");
        break;
      case "heavy_recovery":
        this._updateRecovery(
          dt,
          this._fd.heavy.recovery,
          attackJustPressed,
          null,
        );
        break;
      case "air_windup":
        this._updatePhase(dt, this._fd.air.windup, "air_active");
        break;
      case "air_active":
        this._updatePhase(dt, this._fd.air.active, "air_recovery");
        break;
      case "air_recovery":
        this._updateRecovery(
          dt,
          this._fd.air.recovery,
          attackJustPressed,
          null,
        );
        break;
    }
  }

  _updateIdle(_dt, attackJustPressed, isAirborne) {
    if (attackJustPressed) {
      if (isAirborne) {
        this._enterState("air_windup", "air");
      } else {
        this._enterState("slash1_windup", "slash1");
      }
    }
  }

  _updatePhase(dt, duration, nextState) {
    this._timer += dt;
    if (this._timer >= duration) {
      const overflow = this._timer - duration;
      this._enterState(nextState, this._currentAttackFromState(nextState));
      this._timer = overflow;
    }
  }

  /**
   * Recovery phase: combo window opens in the last comboWindow ms of recovery.
   * If attackJustPressed during window → queue next attack.
   * When recovery expires → transition to queued attack or idle.
   */
  _updateRecovery(dt, duration, attackJustPressed, nextAttack) {
    this._timer += dt;
    const timeLeft = duration - this._timer;
    const inWindow = timeLeft <= this._fd.comboWindow;

    if (inWindow && attackJustPressed && nextAttack && !this._comboQueued) {
      this._comboQueued = true;
    }

    if (this._timer >= duration) {
      if (this._comboQueued && nextAttack) {
        this._comboQueued = false;
        this._enterState(`${nextAttack}_windup`, nextAttack);
      } else {
        this._reset();
      }
    }
  }

  _enterState(state, attack) {
    this._state = state;
    this._timer = 0;
    this._comboQueued = false;
    this.currentAttack = attack;
    this.hitboxActive = state.endsWith("_active");
  }

  reset() {
    this._reset();
  }

  _reset() {
    this._state = "idle";
    this._timer = 0;
    this._comboQueued = false;
    this._comboCount = 0;
    this.hitboxActive = false;
    this.currentAttack = null;
  }

  _currentAttackFromState(state) {
    if (state.startsWith("slash1")) return "slash1";
    if (state.startsWith("slash2")) return "slash2";
    if (state.startsWith("heavy")) return "heavy";
    if (state.startsWith("air")) return "air";
    return null;
  }
}
