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

export class Scene {
  add = {
    circle: jest.fn(),
    rectangle: jest.fn(),
    text: jest.fn(),
    graphics: jest.fn(),
    sprite: jest.fn(),
    image: jest.fn(),
  };
  physics = {
    add: {
      sprite: jest.fn(),
    },
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
      emit: jest.fn(),
    },
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
}

export const Math = {
  FloatBetween: jest.fn((min: number, max: number) => (min + max) / 2),
  Between: jest.fn((min: number, max: number) =>
    globalThis.Math.floor((min + max) / 2)
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
