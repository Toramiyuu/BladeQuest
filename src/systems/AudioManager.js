/**
 * AudioManager — procedural sound effects via Web Audio API.
 *
 * No audio file dependencies. All SFX are synthesised via AudioSFX.js.
 * Music is generated from oscillator stacks with slow LFO tremolo.
 *
 * Usage:
 *   this._audio = new AudioManager(this.game);
 *   this._audio.play("sword");
 *   this._audio.startMusic("dungeon");
 *   this._audio.destroy();
 */

import { AudioSFX } from "./AudioSFX.js";

const MASTER_VOLUME = 0.4;

export default class AudioManager {
  constructor(game) {
    const sm = game.sound;
    this._ctx = sm.context ?? sm.masterVolumeNode?.context ?? null;
    if (!this._ctx) return;

    this._master = this._ctx.createGain();
    this._master.gain.value = MASTER_VOLUME;
    this._master.connect(this._ctx.destination);

    this._musicGain = this._ctx.createGain();
    this._musicGain.gain.value = 0.18;
    this._musicGain.connect(this._master);

    this._sfxGain = this._ctx.createGain();
    this._sfxGain.gain.value = 1;
    this._sfxGain.connect(this._master);

    this._musicOscillators = [];
    this._muted = false;
  }

  /** Play a named one-shot SFX. */
  play(name) {
    if (!this._ctx || this._muted) return;
    const fn = AudioSFX[name];
    if (fn) fn.call(this);
  }

  /** Start looping ambient music for a given location ("dungeon" | "hub"). */
  startMusic(type) {
    if (!this._ctx) return;
    this.stopMusic();
    if (type === "dungeon") this._startDungeonMusic();
    else if (type === "hub") this._startHubMusic();
  }

  stopMusic() {
    this._musicOscillators.forEach((o) => {
      try {
        o.gain.gain.setTargetAtTime(0, this._ctx.currentTime, 0.3);
        o.osc.stop(this._ctx.currentTime + 0.5);
        o.lfo?.stop(this._ctx.currentTime + 0.5);
      } catch (_) {}
    });
    this._musicOscillators = [];
  }

  setMasterVolume(v) {
    if (!this._ctx) return;
    this._master.gain.value = Math.max(0, Math.min(1, v));
  }

  setMusicVolume(v) {
    if (!this._ctx) return;
    this._musicGain.gain.value = Math.max(0, Math.min(1, v));
  }

  setMuted(muted) {
    this._muted = muted;
    if (this._master) {
      this._master.gain.value = muted ? 0 : MASTER_VOLUME;
    }
  }

  destroy() {
    this.stopMusic();
    try {
      this._master?.disconnect();
    } catch (_) {}
  }

  /** Generate a mono white-noise buffer (used by SFX definitions). */
  _noise(durationSec) {
    const sampleRate = this._ctx.sampleRate;
    const length = Math.ceil(sampleRate * durationSec);
    const buf = this._ctx.createBuffer(1, length, sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buf;
  }

  _addOscLayer(freq, type, gainVal, lfoFreq) {
    const t = this._ctx.currentTime;
    const osc = this._ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;

    const lfo = this._ctx.createOscillator();
    lfo.frequency.value = lfoFreq;
    const lfoGain = this._ctx.createGain();
    lfoGain.gain.value = 0.04;
    lfo.connect(lfoGain).connect(osc.frequency);

    const gain = this._ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(gainVal, t + 2);

    osc.connect(gain).connect(this._musicGain);
    osc.start(t);
    lfo.start(t);
    this._musicOscillators.push({ osc, gain, lfo });
  }

  _startDungeonMusic() {
    const base = 55;
    [
      [base, "sawtooth", 0.14, 0.2],
      [base * 1.5, "sawtooth", 0.12, 0.27],
      [base * 1.75, "sine", 0.1, 0.34],
      [base * 2, "sine", 0.08, 0.41],
    ].forEach(([f, t, g, l]) => {
      this._addOscLayer(f, t, g, l);
    });
  }

  _startHubMusic() {
    const base = 110;
    [
      [base, "triangle", 0.1, 0.15],
      [base * 1.25, "sine", 0.085, 0.2],
      [base * 1.5, "sine", 0.07, 0.25],
      [base * 2, "sine", 0.055, 0.3],
    ].forEach(([f, t, g, l]) => {
      this._addOscLayer(f, t, g, l);
    });
  }
}
