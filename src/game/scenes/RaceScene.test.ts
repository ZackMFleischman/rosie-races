import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { RaceScene } from './RaceScene';

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
      // Should have calls for clouds (5 clouds * 3 circles each = 15) plus Rosie (1)
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

    it('creates Rosie as a pink circle', () => {
      const { scene } = setupTest();
      const circleCalls = (scene.add.circle as jest.Mock).mock.calls;

      // Rosie should be a pink circle (0xff69b4) with radius 30
      const rosieCall = circleCalls.find(
        (call: unknown[]) => call[2] === 30 && call[3] === 0xff69b4
      );
      expect(rosieCall).toBeDefined();
    });

    it('positions Rosie at start position in lane 1', () => {
      const { scene } = setupTest();
      const circleCalls = (scene.add.circle as jest.Mock).mock.calls;

      // Find Rosie by color and radius
      const rosieCall = circleCalls.find(
        (call: unknown[]) => call[2] === 30 && call[3] === 0xff69b4
      );

      // Rosie should be at x=80 (ROSIE_START_X)
      expect(rosieCall?.[0]).toBe(80);

      // Rosie should be in lane 1 (first lane Y position)
      const lanePositions = scene.getLaneYPositions();
      expect(rosieCall?.[1]).toBe(lanePositions[0]);
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
});
