/**
 * AudioSFX — procedural sound effect definitions for AudioManager.
 *
 * Each method is called with `this` bound to an AudioManager instance,
 * so `this._ctx` and `this._sfxGain` are available.
 */

export const AudioSFX = {
  sword() {
    const dur = 0.12;
    const buf = this._noise(dur);
    const src = this._ctx.createBufferSource();
    src.buffer = buf;
    const hp = this._ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 3000;
    const gain = this._ctx.createGain();
    gain.gain.setValueAtTime(0.55, this._ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this._ctx.currentTime + dur);
    src.connect(hp).connect(gain).connect(this._sfxGain);
    src.start();
    src.stop(this._ctx.currentTime + dur);
  },

  hit() {
    const t = this._ctx.currentTime;
    const dur = 0.09;
    const osc = this._ctx.createOscillator();
    osc.type = "square";
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + dur);
    const gain = this._ctx.createGain();
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(gain).connect(this._sfxGain);
    osc.start(t);
    osc.stop(t + dur);
  },

  heavyHit() {
    const t = this._ctx.currentTime;
    const dur = 0.18;
    const osc = this._ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(90, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + dur);
    const gainO = this._ctx.createGain();
    gainO.gain.setValueAtTime(0.5, t);
    gainO.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(gainO).connect(this._sfxGain);
    osc.start(t);
    osc.stop(t + dur);

    const buf = this._noise(dur * 0.6);
    const src = this._ctx.createBufferSource();
    src.buffer = buf;
    const lp = this._ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 800;
    const gainN = this._ctx.createGain();
    gainN.gain.setValueAtTime(0.3, t);
    gainN.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    src.connect(lp).connect(gainN).connect(this._sfxGain);
    src.start(t);
    src.stop(t + 0.15);
  },

  playerHit() {
    const t = this._ctx.currentTime;
    const dur = 0.15;
    const osc = this._ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + dur);
    const gain = this._ctx.createGain();
    gain.gain.setValueAtTime(0.45, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(gain).connect(this._sfxGain);
    osc.start(t);
    osc.stop(t + dur);
  },

  jump() {
    const t = this._ctx.currentTime;
    const dur = 0.1;
    const osc = this._ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(480, t + dur);
    const gain = this._ctx.createGain();
    gain.gain.setValueAtTime(0.22, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(gain).connect(this._sfxGain);
    osc.start(t);
    osc.stop(t + dur);
  },

  land() {
    const t = this._ctx.currentTime;
    const dur = 0.08;
    const buf = this._noise(dur);
    const src = this._ctx.createBufferSource();
    src.buffer = buf;
    const lp = this._ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 400;
    const gain = this._ctx.createGain();
    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(lp).connect(gain).connect(this._sfxGain);
    src.start(t);
    src.stop(t + dur);
  },

  pickup() {
    const t = this._ctx.currentTime;
    [880, 1100].forEach((freq, i) => {
      const osc = this._ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      const gain = this._ctx.createGain();
      gain.gain.setValueAtTime(0, t + i * 0.06);
      gain.gain.linearRampToValueAtTime(0.28, t + i * 0.06 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.06 + 0.25);
      osc.connect(gain).connect(this._sfxGain);
      osc.start(t + i * 0.06);
      osc.stop(t + i * 0.06 + 0.28);
    });
  },

  potion() {
    const t = this._ctx.currentTime;
    const osc = this._ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.08);
    osc.frequency.exponentialRampToValueAtTime(220, t + 0.22);
    const gain = this._ctx.createGain();
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    osc.connect(gain).connect(this._sfxGain);
    osc.start(t);
    osc.stop(t + 0.28);
  },

  death() {
    const t = this._ctx.currentTime;
    const osc = this._ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.6);
    const gain = this._ctx.createGain();
    gain.gain.setValueAtTime(0.45, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
    osc.connect(gain).connect(this._sfxGain);
    osc.start(t);
    osc.stop(t + 0.7);
  },

  bossRoar() {
    const t = this._ctx.currentTime;
    [55, 82, 110].forEach((freq, i) => {
      const osc = this._ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq, t + i * 0.04);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.7, t + 0.6);
      const gain = this._ctx.createGain();
      gain.gain.setValueAtTime(0.2, t + i * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
      osc.connect(gain).connect(this._sfxGain);
      osc.start(t + i * 0.04);
      osc.stop(t + 0.75);
    });
  },

  floorClear() {
    const t = this._ctx.currentTime;
    [440, 550, 660, 880].forEach((freq, i) => {
      const osc = this._ctx.createOscillator();
      osc.type = "square";
      osc.frequency.value = freq;
      const gain = this._ctx.createGain();
      gain.gain.setValueAtTime(0, t + i * 0.1);
      gain.gain.linearRampToValueAtTime(0.2, t + i * 0.1 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.1 + 0.35);
      osc.connect(gain).connect(this._sfxGain);
      osc.start(t + i * 0.1);
      osc.stop(t + i * 0.1 + 0.4);
    });
  },

  menuClick() {
    const t = this._ctx.currentTime;
    const osc = this._ctx.createOscillator();
    osc.type = "square";
    osc.frequency.value = 660;
    const gain = this._ctx.createGain();
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
    osc.connect(gain).connect(this._sfxGain);
    osc.start(t);
    osc.stop(t + 0.08);
  },

  footstep() {
    const t = this._ctx.currentTime;
    const dur = 0.04;
    const buf = this._noise(dur);
    const src = this._ctx.createBufferSource();
    src.buffer = buf;
    const lp = this._ctx.createBiquadFilter();
    lp.type = "bandpass";
    lp.frequency.value = 600;
    lp.Q.value = 0.5;
    const gain = this._ctx.createGain();
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(lp).connect(gain).connect(this._sfxGain);
    src.start(t);
    src.stop(t + dur);
  },
};
