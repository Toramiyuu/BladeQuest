/**
 * PlayerAnimations — state machine and animation helpers mixed into Player.
 *
 * Defines all states for the player's StateMachine and maps them to
 * class-specific sprite animation keys. Audio cues for state transitions
 * (jump, sword swings) are triggered here via this.scene._audio.
 *
 * Applied via Object.assign(Player.prototype, PlayerAnimationsMixin).
 */

export const PlayerAnimationsMixin = {
  _setupStateMachine() {
    const sm = this._stateMachine;
    const sk = this.classConfig?.spriteKeys ?? {};

    sm.addState("idle", {
      enter: () => this._playAnim(sk.idle ?? "player-idle"),
    });
    sm.addState("run", {
      enter: () => this._playAnim(sk.run ?? "player-run"),
    });
    sm.addState("jump", {
      enter: () => {
        this._playAnim(sk.jump ?? "player-jump-up");
        this.scene._audio?.play("jump");
      },
    });
    sm.addState("fall", {
      enter: () => this._playAnim(sk.fall ?? "player-fall"),
    });
    sm.addState("attack1", {
      enter: () => {
        this._playAnim(sk.attack1 ?? "player-attack1");
        this.scene._audio?.play("sword");
      },
    });
    sm.addState("attack2", {
      enter: () => {
        this._playAnim(sk.attack1 ?? "player-attack1");
        this.scene._audio?.play("sword");
      },
    });
    sm.addState("attack3", {
      enter: () => {
        this._playAnim(sk.attack2 ?? "player-attack2");
        this.scene._audio?.play("sword");
      },
    });
    sm.addState("air_attack", {
      enter: () => {
        this._playAnim(sk.attack1 ?? "player-attack1");
        this.scene._audio?.play("sword");
      },
    });
    sm.addState("roll", {
      enter: () => this._playAnim(sk.run ?? "player-run"),
    });
  },

  _playAnim(key) {
    if (this.anims.currentAnim?.key !== key) {
      this.play(key, true);
    }
  },
};
