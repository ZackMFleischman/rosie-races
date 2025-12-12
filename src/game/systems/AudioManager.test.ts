import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { AudioManager, AUDIO_KEYS, AUDIO_PATHS } from './AudioManager';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] ?? null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock Phaser Scene
const createMockScene = () => {
  const mockSound = {
    mute: false,
    play: jest.fn(),
    add: jest.fn().mockImplementation(() => ({
      play: jest.fn(),
      stop: jest.fn(),
      destroy: jest.fn(),
      setVolume: jest.fn(),
      setMute: jest.fn(),
    })),
  };

  const mockTween = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    add: jest.fn().mockImplementation((config: any) => {
      // Immediately call onComplete if provided
      if (config?.onComplete) {
        setTimeout(() => config.onComplete(), 0);
      }
      return {};
    }),
  };

  const mockLoad = {
    audio: jest.fn(),
  };

  return {
    sound: mockSound,
    tweens: mockTween,
    load: mockLoad,
  } as unknown as Phaser.Scene;
};

describe('AudioManager', () => {
  beforeEach(() => {
    localStorageMock.clear();
    AudioManager.resetInstance();
  });

  describe('singleton pattern', () => {
    it('should return the same instance on multiple calls', () => {
      const instance1 = AudioManager.getInstance();
      const instance2 = AudioManager.getInstance();

      expect(instance1).toBe(instance2);
    });

    it('should create a new instance after reset', () => {
      const instance1 = AudioManager.getInstance();
      AudioManager.resetInstance();
      const instance2 = AudioManager.getInstance();

      expect(instance1).not.toBe(instance2);
    });
  });

  describe('volume management', () => {
    it('should have default volume of 0.7', () => {
      const manager = AudioManager.getInstance();

      expect(manager.getVolume()).toBe(0.7);
    });

    it('should load volume from localStorage', () => {
      localStorageMock.setItem('rosie-races-volume', '0.5');
      AudioManager.resetInstance();
      const manager = AudioManager.getInstance();

      expect(manager.getVolume()).toBe(0.5);
    });

    it('should clamp volume between 0 and 1', () => {
      const manager = AudioManager.getInstance();

      manager.setVolume(-0.5);
      expect(manager.getVolume()).toBe(0);

      manager.setVolume(1.5);
      expect(manager.getVolume()).toBe(1);
    });

    it('should save volume to localStorage', () => {
      const manager = AudioManager.getInstance();

      manager.setVolume(0.8);

      expect(localStorageMock.setItem).toHaveBeenCalledWith('rosie-races-volume', '0.8');
    });
  });

  describe('mute management', () => {
    it('should not be muted by default', () => {
      const manager = AudioManager.getInstance();

      expect(manager.isMuted()).toBe(false);
    });

    it('should load muted state from localStorage', () => {
      localStorageMock.setItem('rosie-races-muted', 'true');
      AudioManager.resetInstance();
      const manager = AudioManager.getInstance();

      expect(manager.isMuted()).toBe(true);
    });

    it('should toggle mute state', () => {
      const manager = AudioManager.getInstance();
      const mockScene = createMockScene();
      manager.init(mockScene);

      expect(manager.isMuted()).toBe(false);

      manager.toggleMute();
      expect(manager.isMuted()).toBe(true);

      manager.toggleMute();
      expect(manager.isMuted()).toBe(false);
    });

    it('should save muted state to localStorage', () => {
      const manager = AudioManager.getInstance();
      const mockScene = createMockScene();
      manager.init(mockScene);

      manager.setMuted(true);

      expect(localStorageMock.setItem).toHaveBeenCalledWith('rosie-races-muted', 'true');
    });
  });

  describe('preloadAudio', () => {
    it('should preload all audio assets', () => {
      const manager = AudioManager.getInstance();
      const mockScene = createMockScene();

      manager.preloadAudio(mockScene);

      expect(mockScene.load.audio).toHaveBeenCalledTimes(Object.keys(AUDIO_PATHS).length);
      expect(mockScene.load.audio).toHaveBeenCalledWith(AUDIO_KEYS.BEEP, AUDIO_PATHS.beep);
      expect(mockScene.load.audio).toHaveBeenCalledWith(AUDIO_KEYS.GO, AUDIO_PATHS.go);
      expect(mockScene.load.audio).toHaveBeenCalledWith(
        AUDIO_KEYS.RACE_MUSIC,
        AUDIO_PATHS['race-music']
      );
    });
  });

  describe('playSFX', () => {
    it('should play sound effect when not muted', () => {
      const manager = AudioManager.getInstance();
      const mockScene = createMockScene();
      manager.init(mockScene);

      manager.playSFX(AUDIO_KEYS.TAP);

      expect(mockScene.sound.play).toHaveBeenCalledWith(AUDIO_KEYS.TAP, expect.any(Object));
    });

    it('should not play sound effect when muted', () => {
      const manager = AudioManager.getInstance();
      const mockScene = createMockScene();
      manager.init(mockScene);
      manager.setMuted(true);

      manager.playSFX(AUDIO_KEYS.TAP);

      expect(mockScene.sound.play).not.toHaveBeenCalled();
    });

    it('should not throw when scene is not initialized', () => {
      const manager = AudioManager.getInstance();

      expect(() => manager.playSFX(AUDIO_KEYS.TAP)).not.toThrow();
    });
  });

  describe('playMusic', () => {
    it('should add and play music with correct config', () => {
      const manager = AudioManager.getInstance();
      const mockScene = createMockScene();
      manager.init(mockScene);

      manager.playMusic(AUDIO_KEYS.RACE_MUSIC);

      expect(mockScene.sound.add).toHaveBeenCalledWith(AUDIO_KEYS.RACE_MUSIC, expect.any(Object));
    });

    it('should apply fade-in tween when fadeIn is true', () => {
      const manager = AudioManager.getInstance();
      const mockScene = createMockScene();
      manager.init(mockScene);

      manager.playMusic(AUDIO_KEYS.RACE_MUSIC, true, true);

      expect(mockScene.tweens.add).toHaveBeenCalled();
    });

    it('should not apply fade-in when muted', () => {
      const manager = AudioManager.getInstance();
      const mockScene = createMockScene();
      manager.init(mockScene);
      manager.setMuted(true);

      manager.playMusic(AUDIO_KEYS.RACE_MUSIC, true, true);

      // Tweens should not be called for fade-in when muted
      expect(mockScene.tweens.add).not.toHaveBeenCalled();
    });
  });

  describe('stopMusic', () => {
    it('should stop music with fade-out', () => {
      const manager = AudioManager.getInstance();
      const mockScene = createMockScene();
      manager.init(mockScene);
      manager.playMusic(AUDIO_KEYS.RACE_MUSIC);

      manager.stopMusic(true);

      expect(mockScene.tweens.add).toHaveBeenCalled();
    });

    it('should stop music immediately without fade-out', () => {
      const manager = AudioManager.getInstance();
      const mockScene = createMockScene();
      const mockMusicInstance = {
        play: jest.fn(),
        stop: jest.fn(),
        destroy: jest.fn(),
        setVolume: jest.fn(),
        setMute: jest.fn(),
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (mockScene.sound as any).add = jest.fn().mockReturnValue(mockMusicInstance);
      manager.init(mockScene);
      manager.playMusic(AUDIO_KEYS.RACE_MUSIC, true, false);

      manager.stopMusic(false);

      expect(mockMusicInstance.stop).toHaveBeenCalled();
      expect(mockMusicInstance.destroy).toHaveBeenCalled();
    });
  });

  describe('destroy', () => {
    it('should clean up resources', () => {
      const manager = AudioManager.getInstance();
      const mockScene = createMockScene();
      const mockMusicInstance = {
        play: jest.fn(),
        stop: jest.fn(),
        destroy: jest.fn(),
        setVolume: jest.fn(),
        setMute: jest.fn(),
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (mockScene.sound as any).add = jest.fn().mockReturnValue(mockMusicInstance);
      manager.init(mockScene);
      manager.playMusic(AUDIO_KEYS.RACE_MUSIC, true, false);

      manager.destroy();

      expect(mockMusicInstance.stop).toHaveBeenCalled();
      expect(mockMusicInstance.destroy).toHaveBeenCalled();
    });
  });
});

describe('AUDIO_KEYS', () => {
  it('should have all required audio keys', () => {
    expect(AUDIO_KEYS.BEEP).toBe('beep');
    expect(AUDIO_KEYS.GO).toBe('go');
    expect(AUDIO_KEYS.RACE_MUSIC).toBe('race-music');
    expect(AUDIO_KEYS.FINISH).toBe('finish');
    expect(AUDIO_KEYS.RESULTS_MUSIC).toBe('results-music');
    expect(AUDIO_KEYS.CORRECT).toBe('correct');
    expect(AUDIO_KEYS.WRONG).toBe('wrong');
    expect(AUDIO_KEYS.TAP).toBe('tap');
  });
});

describe('AUDIO_PATHS', () => {
  it('should have paths for all audio keys', () => {
    Object.values(AUDIO_KEYS).forEach((key) => {
      expect(AUDIO_PATHS[key]).toBeDefined();
      expect(AUDIO_PATHS[key]).toContain('assets/audio/');
      expect(AUDIO_PATHS[key]).toContain('.mp3');
    });
  });
});
