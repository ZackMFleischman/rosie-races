import * as Phaser from 'phaser';

/** Audio keys for all game sounds */
export const AUDIO_KEYS = {
  BEEP: 'beep',
  GO: 'go',
  RACE_MUSIC: 'race-music',
  FINISH: 'finish',
  RESULTS_MUSIC: 'results-music',
  CORRECT: 'correct',
  WRONG: 'wrong',
  TAP: 'tap',
} as const;

export type AudioKey = (typeof AUDIO_KEYS)[keyof typeof AUDIO_KEYS];

/** Audio file paths for preloading */
export const AUDIO_PATHS: Record<AudioKey, string> = {
  [AUDIO_KEYS.BEEP]: 'assets/audio/beep.mp3',
  [AUDIO_KEYS.GO]: 'assets/audio/go.mp3',
  [AUDIO_KEYS.RACE_MUSIC]: 'assets/audio/race-music.mp3',
  [AUDIO_KEYS.FINISH]: 'assets/audio/finish.mp3',
  [AUDIO_KEYS.RESULTS_MUSIC]: 'assets/audio/results-music.mp3',
  [AUDIO_KEYS.CORRECT]: 'assets/audio/correct.mp3',
  [AUDIO_KEYS.WRONG]: 'assets/audio/wrong.mp3',
  [AUDIO_KEYS.TAP]: 'assets/audio/tap.mp3',
};

const VOLUME_STORAGE_KEY = 'rosie-races-volume';
const MUTED_STORAGE_KEY = 'rosie-races-muted';
const DEFAULT_VOLUME = 0.7;
const FADE_DURATION = 500;

export interface AudioManagerConfig {
  volume?: number;
  muted?: boolean;
}

/**
 * Singleton AudioManager for managing all game audio.
 * Handles music, sound effects, volume control, and smooth transitions.
 */
export class AudioManager {
  private static instance: AudioManager | null = null;
  private scene: Phaser.Scene | null = null;
  private currentMusic: Phaser.Sound.BaseSound | null = null;
  private volume: number;
  private muted: boolean;

  private constructor() {
    this.volume = this.loadVolume();
    this.muted = this.loadMuted();
  }

  /** Get the singleton instance of AudioManager */
  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  /** Reset the singleton (useful for testing) */
  static resetInstance(): void {
    AudioManager.instance = null;
  }

  /** Initialize the AudioManager with a Phaser scene */
  init(scene: Phaser.Scene): void {
    this.scene = scene;
    this.applyMuteState();
  }

  /** Preload all audio assets */
  preloadAudio(scene: Phaser.Scene): void {
    Object.entries(AUDIO_PATHS).forEach(([key, path]) => {
      scene.load.audio(key, path);
    });
  }

  /** Play a sound effect (one-shot) */
  playSFX(key: AudioKey): void {
    if (!this.scene || this.muted) return;

    try {
      this.scene.sound.play(key, { volume: this.volume });
    } catch (error) {
      console.warn(`Failed to play SFX: ${key}`, error);
    }
  }

  /** Play music with optional loop and fade-in */
  playMusic(key: AudioKey, loop = true, fadeIn = true): void {
    if (!this.scene) return;

    // Stop current music with fade-out
    if (this.currentMusic) {
      this.stopMusic(true);
    }

    try {
      const config: Phaser.Types.Sound.SoundConfig = {
        volume: fadeIn && !this.muted ? 0 : this.volume,
        loop,
        mute: this.muted,
      };

      this.currentMusic = this.scene.sound.add(key, config);
      this.currentMusic.play();

      // Fade in if requested
      if (fadeIn && !this.muted && this.scene) {
        this.scene.tweens.add({
          targets: this.currentMusic,
          volume: this.volume,
          duration: FADE_DURATION,
          ease: 'Linear',
        });
      }
    } catch (error) {
      console.warn(`Failed to play music: ${key}`, error);
    }
  }

  /** Stop current music with optional fade-out */
  stopMusic(fadeOut = true): void {
    if (!this.currentMusic || !this.scene) {
      this.currentMusic = null;
      return;
    }

    const music = this.currentMusic;
    this.currentMusic = null;

    if (fadeOut) {
      this.scene.tweens.add({
        targets: music,
        volume: 0,
        duration: FADE_DURATION,
        ease: 'Linear',
        onComplete: () => {
          music.stop();
          music.destroy();
        },
      });
    } else {
      music.stop();
      music.destroy();
    }
  }

  /** Crossfade to new music */
  crossfadeMusic(key: AudioKey, loop = true): void {
    if (!this.scene) return;

    // If no current music, just play new one
    if (!this.currentMusic) {
      this.playMusic(key, loop, true);
      return;
    }

    // Fade out current music
    const oldMusic = this.currentMusic;
    this.scene.tweens.add({
      targets: oldMusic,
      volume: 0,
      duration: FADE_DURATION,
      ease: 'Linear',
      onComplete: () => {
        oldMusic.stop();
        oldMusic.destroy();
      },
    });

    // Start new music with fade-in
    try {
      const config: Phaser.Types.Sound.SoundConfig = {
        volume: 0,
        loop,
        mute: this.muted,
      };

      this.currentMusic = this.scene.sound.add(key, config);
      this.currentMusic.play();

      if (!this.muted) {
        this.scene.tweens.add({
          targets: this.currentMusic,
          volume: this.volume,
          duration: FADE_DURATION,
          ease: 'Linear',
        });
      }
    } catch (error) {
      console.warn(`Failed to crossfade to music: ${key}`, error);
    }
  }

  /** Set the volume (0-1) */
  setVolume(value: number): void {
    this.volume = Math.max(0, Math.min(1, value));
    this.saveVolume();

    // Update current music volume
    if (this.currentMusic && !this.muted) {
      (this.currentMusic as Phaser.Sound.WebAudioSound).setVolume(this.volume);
    }
  }

  /** Get the current volume (0-1) */
  getVolume(): number {
    return this.volume;
  }

  /** Toggle mute state */
  toggleMute(): boolean {
    this.muted = !this.muted;
    this.saveMuted();
    this.applyMuteState();
    return this.muted;
  }

  /** Set mute state */
  setMuted(value: boolean): void {
    this.muted = value;
    this.saveMuted();
    this.applyMuteState();
  }

  /** Get the current mute state */
  isMuted(): boolean {
    return this.muted;
  }

  /** Apply mute state to all sounds */
  private applyMuteState(): void {
    if (!this.scene) return;

    this.scene.sound.mute = this.muted;

    if (this.currentMusic) {
      (this.currentMusic as Phaser.Sound.WebAudioSound).setMute(this.muted);
    }
  }

  /** Load volume from localStorage */
  private loadVolume(): number {
    try {
      const stored = localStorage.getItem(VOLUME_STORAGE_KEY);
      if (stored !== null) {
        const value = parseFloat(stored);
        if (!isNaN(value) && value >= 0 && value <= 1) {
          return value;
        }
      }
    } catch {
      // localStorage not available
    }
    return DEFAULT_VOLUME;
  }

  /** Save volume to localStorage */
  private saveVolume(): void {
    try {
      localStorage.setItem(VOLUME_STORAGE_KEY, this.volume.toString());
    } catch {
      // localStorage not available
    }
  }

  /** Load muted state from localStorage */
  private loadMuted(): boolean {
    try {
      const stored = localStorage.getItem(MUTED_STORAGE_KEY);
      return stored === 'true';
    } catch {
      // localStorage not available
    }
    return false;
  }

  /** Save muted state to localStorage */
  private saveMuted(): void {
    try {
      localStorage.setItem(MUTED_STORAGE_KEY, this.muted.toString());
    } catch {
      // localStorage not available
    }
  }

  /** Clean up resources */
  destroy(): void {
    this.stopMusic(false);
    this.scene = null;
  }
}

export default AudioManager;
