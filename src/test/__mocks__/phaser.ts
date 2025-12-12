// Mock Phaser module for testing
// This prevents Phaser from attempting to create canvas elements in tests
import { jest } from '@jest/globals';

export const AUTO = 0;
export const CANVAS = 1;
export const WEBGL = 2;

export const Scale = {
  FIT: 'FIT',
  CENTER_BOTH: 'CENTER_BOTH',
  NONE: 'NONE',
  WIDTH_CONTROLS_HEIGHT: 'WIDTH_CONTROLS_HEIGHT',
  HEIGHT_CONTROLS_WIDTH: 'HEIGHT_CONTROLS_WIDTH',
  ENVELOP: 'ENVELOP',
  RESIZE: 'RESIZE',
};

// Create a mock Game class that is also a jest mock function
class MockGame {
  config: unknown;
  events = {
    once: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  };
  scene = {
    add: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
  };
  scale = {
    refresh: jest.fn(),
  };
  destroy = jest.fn();

  constructor(config: unknown) {
    this.config = config;
  }
}

// Create the Game export as a jest.fn that creates MockGame instances
export const Game = jest.fn().mockImplementation((config: unknown) => {
  return new MockGame(config);
});

// Mock Graphics object
const createMockGraphics = () => ({
  fillStyle: jest.fn().mockReturnThis(),
  fillRect: jest.fn().mockReturnThis(),
  fillRoundedRect: jest.fn().mockReturnThis(),
  lineStyle: jest.fn().mockReturnThis(),
  lineBetween: jest.fn().mockReturnThis(),
  strokeRect: jest.fn().mockReturnThis(),
  clear: jest.fn().mockReturnThis(),
});

// Mock Circle object
const createMockCircle = () => ({
  setStrokeStyle: jest.fn().mockReturnThis(),
  setFillStyle: jest.fn().mockReturnThis(),
  x: 0,
  y: 0,
});

// Mock Sprite object
const createMockSprite = () => ({
  x: 0,
  y: 0,
  setScale: jest.fn().mockReturnThis(),
  setOrigin: jest.fn().mockReturnThis(),
  setTexture: jest.fn().mockReturnThis(),
});

// Mock Graphics for texture generation
const createMockMakeGraphics = () => ({
  fillStyle: jest.fn().mockReturnThis(),
  fillCircle: jest.fn().mockReturnThis(),
  lineStyle: jest.fn().mockReturnThis(),
  strokeCircle: jest.fn().mockReturnThis(),
  generateTexture: jest.fn().mockReturnThis(),
  destroy: jest.fn(),
});

// Mock Text object
const createMockText = () => ({
  setOrigin: jest.fn().mockReturnThis(),
  setText: jest.fn().mockReturnThis(),
});

export class Scene {
  key: string = '';

  add = {
    circle: jest.fn().mockImplementation(() => createMockCircle()),
    rectangle: jest.fn(),
    text: jest.fn().mockImplementation(() => createMockText()),
    graphics: jest.fn().mockImplementation(() => createMockGraphics()),
    sprite: jest.fn().mockImplementation(() => createMockSprite()),
    image: jest.fn(),
  };
  make = {
    graphics: jest.fn().mockImplementation(() => createMockMakeGraphics()),
  };
  textures = {
    exists: jest.fn().mockReturnValue(false),
    get: jest.fn(),
    addCanvas: jest.fn(),
  };
  physics = {
    add: {
      sprite: jest.fn(),
    },
    world: {
      setBounds: jest.fn(),
    },
  };
  scale = {
    width: 1024,
    height: 768,
  };
  input = {
    on: jest.fn(),
  };
  cameras = {
    main: {
      setBounds: jest.fn(),
    },
  };
  game = {
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
  };
  events = {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  };
  load = {
    audio: jest.fn(),
    image: jest.fn(),
  };
  sound = {
    add: jest.fn(),
    play: jest.fn(),
  };
  tweens = {
    add: jest.fn(),
  };
  time = {
    addEvent: jest.fn(),
  };

  constructor(config?: { key?: string }) {
    if (config?.key) {
      this.key = config.key;
    }
  }
}

export const Math = {
  FloatBetween: jest.fn((min: number, max: number) => (min + max) / 2),
  Between: jest.fn((min: number, max: number) =>
    globalThis.Math.floor((min + max) / 2)
  ),
  Clamp: jest.fn((value: number, min: number, max: number) =>
    globalThis.Math.min(globalThis.Math.max(value, min), max)
  ),
};

export const Types = {};

// Default export for compatibility
const Phaser = {
  AUTO,
  CANVAS,
  WEBGL,
  Scale,
  Game,
  Scene,
  Math,
  Types,
};

export default Phaser;
