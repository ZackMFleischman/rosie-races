import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import {
  RaceScene,
  MOVEMENT_CONFIG,
  TRACK_CONFIG,
  ANIMATION_CONFIG,
  CHECKPOINT_CONFIG,
} from './RaceScene';

describe('RaceScene', () => {
  const setupTest = () => {
    const scene = new RaceScene();
    // Call create to initialize the scene
    scene.create();
    return { scene };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('creates a scene with key "RaceScene"', () => {
      const scene = new RaceScene();
      // The scene key is set in the constructor via super({ key: 'RaceScene' })
      // We check the internal key property
      expect((scene as unknown as { key: string }).key).toBe('RaceScene');
    });
  });

  describe('create', () => {
    it('sets world bounds to match canvas dimensions', () => {
      const { scene } = setupTest();
      expect(scene.physics.world.setBounds).toHaveBeenCalledWith(0, 0, 1024, 768);
    });

    it('creates background graphics', () => {
      const { scene } = setupTest();
      // Graphics should be created for background, lanes, and start/finish lines
      expect(scene.add.graphics).toHaveBeenCalled();
    });

    it('creates clouds using circles', () => {
      const { scene } = setupTest();
      // Clouds are drawn as white circles
      const circleCalls = (scene.add.circle as jest.Mock).mock.calls;
      // Should have calls for clouds (5 clouds * 3 circles each = 15)
      // Note: Rosie is now a sprite, not a circle
      expect(circleCalls.length).toBeGreaterThanOrEqual(15);
    });

    it('creates start and finish line labels', () => {
      const { scene } = setupTest();
      const textCalls = (scene.add.text as jest.Mock).mock.calls;

      // Find the START label
      const startLabel = textCalls.find(
        (call: unknown[]) => call[2] === 'START'
      );
      expect(startLabel).toBeDefined();
      expect(startLabel?.[0]).toBe(50); // START_LINE_X

      // Find the FINISH label
      const finishLabel = textCalls.find(
        (call: unknown[]) => call[2] === 'FINISH'
      );
      expect(finishLabel).toBeDefined();
      expect(finishLabel?.[0]).toBe(974); // FINISH_LINE_X
    });

    it('loads Rosie sprite in preload', () => {
      const scene = new RaceScene();
      // Call preload to load assets
      scene.preload();
      // The image should be loaded with 'rosie-sprite' key
      expect(scene.load.image).toHaveBeenCalledWith('rosie-sprite', expect.any(String));
    });

    it('creates Rosie as a sprite using loaded image', () => {
      const { scene } = setupTest();
      const spriteCalls = (scene.add.sprite as jest.Mock).mock.calls;

      // Rosie should be created as a sprite with 'rosie-sprite' texture
      const rosieCall = spriteCalls.find(
        (call: unknown[]) => call[2] === 'rosie-sprite'
      );
      expect(rosieCall).toBeDefined();
    });

    it('positions Rosie at start position in lane 1', () => {
      const { scene } = setupTest();
      const spriteCalls = (scene.add.sprite as jest.Mock).mock.calls;

      // Find Rosie by texture name
      const rosieCall = spriteCalls.find(
        (call: unknown[]) => call[2] === 'rosie-sprite'
      );

      // Rosie should be at x=80 (ROSIE_START_X)
      expect(rosieCall?.[0]).toBe(80);

      // Rosie should be in lane 1 (first lane Y position)
      const lanePositions = scene.getLaneYPositions();
      expect(rosieCall?.[1]).toBe(lanePositions[0]);
    });

    it('sets up tap event listener on game events', () => {
      const { scene } = setupTest();
      expect(scene.game.events.on).toHaveBeenCalledWith(
        'tap',
        expect.any(Function),
        scene
      );
    });

    it('sets up restart event listener on game events', () => {
      const { scene } = setupTest();
      expect(scene.game.events.on).toHaveBeenCalledWith(
        'restartRace',
        expect.any(Function),
        scene
      );
    });
  });

  describe('getRosie', () => {
    it('returns Rosie game object after create', () => {
      const { scene } = setupTest();
      const rosie = scene.getRosie();
      expect(rosie).not.toBeNull();
    });

    it('returns null before create is called', () => {
      const scene = new RaceScene();
      // Don't call create
      const rosie = scene.getRosie();
      expect(rosie).toBeNull();
    });
  });

  describe('getLaneYPositions', () => {
    it('returns 6 lane positions', () => {
      const { scene } = setupTest();
      const positions = scene.getLaneYPositions();
      expect(positions).toHaveLength(6);
    });

    it('returns a copy of lane positions (not the original array)', () => {
      const { scene } = setupTest();
      const positions1 = scene.getLaneYPositions();
      const positions2 = scene.getLaneYPositions();
      expect(positions1).not.toBe(positions2);
      expect(positions1).toEqual(positions2);
    });

    it('returns lane positions in ascending order', () => {
      const { scene } = setupTest();
      const positions = scene.getLaneYPositions();

      for (let i = 1; i < positions.length; i++) {
        expect(positions[i]).toBeGreaterThan(positions[i - 1]);
      }
    });

    it('lane positions are within canvas bounds', () => {
      const { scene } = setupTest();
      const positions = scene.getLaneYPositions();
      const canvasHeight = 768;
      const skyHeight = canvasHeight * 0.2; // 20% of canvas is sky

      positions.forEach((pos) => {
        expect(pos).toBeGreaterThan(skyHeight);
        expect(pos).toBeLessThan(canvasHeight);
      });
    });
  });

  describe('getVelocity', () => {
    it('returns 0 initially', () => {
      const { scene } = setupTest();
      expect(scene.getVelocity()).toBe(0);
    });
  });

  describe('getHasFinished', () => {
    it('returns false initially', () => {
      const { scene } = setupTest();
      expect(scene.getHasFinished()).toBe(false);
    });
  });

  describe('MOVEMENT_CONFIG', () => {
    it('has expected tap velocity boost', () => {
      expect(MOVEMENT_CONFIG.TAP_VELOCITY_BOOST).toBe(15);
    });

    it('has expected max velocity', () => {
      expect(MOVEMENT_CONFIG.MAX_VELOCITY).toBe(300);
    });

    it('has expected friction value', () => {
      expect(MOVEMENT_CONFIG.FRICTION).toBe(0.98);
    });
  });

  describe('TRACK_CONFIG', () => {
    it('has 6 lanes', () => {
      expect(TRACK_CONFIG.LANE_COUNT).toBe(6);
    });

    it('has expected start and finish positions', () => {
      expect(TRACK_CONFIG.START_LINE_X).toBe(50);
      expect(TRACK_CONFIG.FINISH_LINE_X).toBe(974);
    });

    it('has Rosie start position after start line', () => {
      expect(TRACK_CONFIG.ROSIE_START_X).toBeGreaterThan(TRACK_CONFIG.START_LINE_X);
    });
  });

  describe('ANIMATION_CONFIG', () => {
    it('has expected bobbing frequency', () => {
      expect(ANIMATION_CONFIG.BOB_FREQUENCY).toBe(0.015);
    });

    it('has expected bob amplitude factor', () => {
      expect(ANIMATION_CONFIG.BOB_AMPLITUDE_FACTOR).toBe(0.1);
    });

    it('has expected max bob amplitude', () => {
      expect(ANIMATION_CONFIG.BOB_MAX_AMPLITUDE).toBe(8);
    });

    it('has expected scale pulse settings', () => {
      expect(ANIMATION_CONFIG.SCALE_PULSE_FREQUENCY).toBe(0.02);
      expect(ANIMATION_CONFIG.SCALE_PULSE_AMOUNT).toBe(0.05);
    });
  });

  describe('getRosieBaseY', () => {
    it('returns the base Y position for Rosie', () => {
      const { scene } = setupTest();
      const baseY = scene.getRosieBaseY();
      const lanePositions = scene.getLaneYPositions();
      // Rosie's base Y should be the first lane position
      expect(baseY).toBe(lanePositions[0]);
    });

    it('returns 0 before create is called', () => {
      const scene = new RaceScene();
      // Don't call create
      expect(scene.getRosieBaseY()).toBe(0);
    });
  });

  describe('CHECKPOINT_CONFIG', () => {
    it('has 2 checkpoint positions', () => {
      expect(CHECKPOINT_CONFIG.POSITIONS).toHaveLength(2);
    });

    it('has checkpoint positions between start and finish', () => {
      CHECKPOINT_CONFIG.POSITIONS.forEach((pos) => {
        expect(pos).toBeGreaterThan(TRACK_CONFIG.START_LINE_X);
        expect(pos).toBeLessThan(TRACK_CONFIG.FINISH_LINE_X);
      });
    });

    it('has checkpoint positions roughly at 1/3 and 2/3 of track', () => {
      const trackLength = TRACK_CONFIG.FINISH_LINE_X - TRACK_CONFIG.START_LINE_X;
      expect(CHECKPOINT_CONFIG.POSITIONS[0]).toBeCloseTo(TRACK_CONFIG.START_LINE_X + trackLength * 0.27, -1);
      expect(CHECKPOINT_CONFIG.POSITIONS[1]).toBeCloseTo(TRACK_CONFIG.START_LINE_X + trackLength * 0.60, -1);
    });

    it('has velocity boost values configured', () => {
      expect(CHECKPOINT_CONFIG.FAST_ANSWER_BOOST).toBe(50);
      expect(CHECKPOINT_CONFIG.SLOW_ANSWER_BOOST).toBe(20);
      expect(CHECKPOINT_CONFIG.FAST_ANSWER_THRESHOLD).toBe(3000);
    });
  });

  describe('getIsPaused', () => {
    it('returns false initially', () => {
      const { scene } = setupTest();
      expect(scene.getIsPaused()).toBe(false);
    });
  });

  describe('getPassedCheckpoints', () => {
    it('returns array of false values initially', () => {
      const { scene } = setupTest();
      const checkpoints = scene.getPassedCheckpoints();
      expect(checkpoints).toHaveLength(CHECKPOINT_CONFIG.POSITIONS.length);
      checkpoints.forEach((passed) => {
        expect(passed).toBe(false);
      });
    });

    it('returns a copy of passed checkpoints (not the original array)', () => {
      const { scene } = setupTest();
      const checkpoints1 = scene.getPassedCheckpoints();
      const checkpoints2 = scene.getPassedCheckpoints();
      expect(checkpoints1).not.toBe(checkpoints2);
      expect(checkpoints1).toEqual(checkpoints2);
    });
  });

  describe('create with checkpoints', () => {
    it('sets up math answer event listener on game events', () => {
      const { scene } = setupTest();
      expect(scene.game.events.on).toHaveBeenCalledWith(
        'mathAnswerSubmitted',
        expect.any(Function),
        scene
      );
    });

    it('creates checkpoint visual markers with ? symbols', () => {
      const { scene } = setupTest();
      const textCalls = (scene.add.text as jest.Mock).mock.calls;

      // Find the ? labels for checkpoints
      const questionMarks = textCalls.filter(
        (call: unknown[]) => call[2] === '?'
      );
      expect(questionMarks).toHaveLength(CHECKPOINT_CONFIG.POSITIONS.length);
    });
  });
});
