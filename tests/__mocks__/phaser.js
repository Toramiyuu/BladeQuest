/**
 * Minimal Phaser mock for Vitest.
 * Provides stub classes so modules extending Phaser objects can be imported.
 */

class GameObjectStub {
  setScale() {
    return this;
  }
  setDepth() {
    return this;
  }
  setPosition() {
    return this;
  }
  setFlipX() {
    return this;
  }
  setVisible() {
    return this;
  }
  setAlpha() {
    return this;
  }
  setTint() {
    return this;
  }
  clearTint() {
    return this;
  }
  setOrigin() {
    return this;
  }
  play() {
    return this;
  }
  destroy() {}
}

class SpriteStub extends GameObjectStub {
  constructor() {
    super();
    this.body = {
      enable: true,
      setSize: () => {},
      setOffset: () => {},
      setVelocity: () => {},
      setVelocityX: () => {},
      setVelocityY: () => {},
      setAccelerationX: () => {},
      setMaxVelocityX: () => {},
      setDragX: () => {},
      setGravityY: () => {},
      reset: () => {},
      velocity: { x: 0, y: 0 },
      blocked: { down: false, left: false, right: false, up: false },
    };
    this.anims = { currentAnim: null };
    this.x = 0;
    this.y = 0;
  }
}

class ImageStub extends GameObjectStub {
  constructor() {
    super();
    this.body = {
      enable: true,
      setSize: () => {},
      setOffset: () => {},
      setVelocity: () => {},
      setVelocityX: () => {},
      setVelocityY: () => {},
      velocity: { x: 0, y: 0 },
    };
    this.x = 0;
    this.y = 0;
  }
}

const Phaser = {
  Physics: {
    Arcade: {
      Sprite: SpriteStub,
      Image: ImageStub,
    },
  },
  Input: {
    Keyboard: {
      KeyCodes: {
        LEFT: 37,
        RIGHT: 39,
        UP: 38,
        DOWN: 40,
        SPACE: 32,
        A: 65,
        D: 68,
        W: 87,
        X: 88,
        K: 75,
        C: 67,
        V: 86,
        ENTER: 13,
      },
      JustDown: () => false,
    },
  },
  Scene: class SceneStub {},
  GameObjects: {
    Sprite: SpriteStub,
    Image: ImageStub,
  },
  Math: {
    Clamp: (val, min, max) => Math.min(Math.max(val, min), max),
  },
};

export default Phaser;
