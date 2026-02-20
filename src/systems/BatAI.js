/**
 * BatAI — pure JS, no Phaser dependency.
 *
 * Moves horizontally, oscillates Y with sine wave, reverses at room bounds.
 *
 * Usage:
 *   const ai = new BatAI({ speed, leftBound, rightBound }, startX);
 *   const { vx, vy } = ai.update(currentX, deltaMs);
 */

const SINE_AMPLITUDE = 30;
const SINE_FREQUENCY = 0.003;

export default class BatAI {
  constructor({ speed, leftBound, rightBound }, startX) {
    this._speed = speed;
    this._leftBound = leftBound;
    this._rightBound = rightBound;
    this._direction = startX < (leftBound + rightBound) / 2 ? 1 : -1;
    this._elapsed = 0;
  }

  update(currentX, deltaMs) {
    this._elapsed += deltaMs;

    if (currentX >= this._rightBound) this._direction = -1;
    if (currentX <= this._leftBound) this._direction = 1;

    const vx = this._speed * this._direction;
    const vy = Math.cos(this._elapsed * SINE_FREQUENCY) * SINE_AMPLITUDE;

    return { vx, vy };
  }
}
