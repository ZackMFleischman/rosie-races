import * as Phaser from 'phaser';
import { GAME_EVENTS } from '../events';
import type {
  MathAnswerPayload,
  GameState,
  RacerResult,
  RaceResultsUpdatedPayload,
  SettingsUpdatedPayload,
} from '../events';
// Assets in public/ - use relative path for correct base URL resolution
const rosieSpriteUrl = 'assets/rosie-sprite.png';
import { AudioManager, AUDIO_KEYS } from '../systems/AudioManager';
import {
  getRandomRacers,
  getMinSpeed,
  getMaxSpeed,
  FAMILY_MEMBERS,
  SPEED_CONFIG,
  type FamilyMember,
} from '../../data/familyMembers';

/**
 * Competitor state for AI racers
 */
interface Competitor {
  sprite: Phaser.GameObjects.Sprite;
  familyMember: FamilyMember;
  speed: number; // Current speed (pixels per second)
  baseY: number; // Base Y position for bobbing animation
  lastSpeedChangeTime: number; // Time when speed was last varied (ms)
  finishTime: number | null; // Time when crossed finish line (ms since race start)
  finishPosition: number | null; // Position when finished (1st, 2nd, etc.)
}

// Constants for track layout
export const TRACK_CONFIG = {
  LANE_COUNT: 6,
  // Position ratios (percentage of canvas width)
  START_LINE_RATIO: 0.065, //  from left
  FINISH_LINE_RATIO: 0.85, // from left -  leaves space for TAP button overlay
  ROSIE_START_RATIO: 0.03, // from left
  ROSIE_RADIUS: 44, // Size for mobile sprites (2x for high-DPI displays)
  ROSIE_COLOR: 0xff69b4, // Pink
};

// Constants for checkpoints
// Positions are calculated dynamically as fractions of track length (between start and finish)
export const CHECKPOINT_CONFIG = {
  // Checkpoint positions as ratios of track length (0 = start line, 1 = finish line)
  POSITION_RATIOS: [1 / 3, 2 / 3], // 1/3 and 2/3 of the way through the track
  ARCH_HEIGHT: 60, // Height of the checkpoint arch
  ARCH_WIDTH: 30, // Width of the arch
  COLORS: {
    PRIMARY: 0xff0000, // Red
    SECONDARY: 0xffffff, // White
    QUESTION_MARK: 0xffff00, // Yellow
  },
  // Velocity boosts for correct answers
  FAST_ANSWER_THRESHOLD: 3000, // 3 seconds in ms
  FAST_ANSWER_BOOST: 50,
  SLOW_ANSWER_BOOST: 20,
};

// Constants for movement physics
export const MOVEMENT_CONFIG = {
  TAP_VELOCITY_BOOST: 15, // Velocity added per tap
  MAX_VELOCITY: 300, // Maximum velocity cap
  FRICTION: 0.98, // Velocity multiplier per frame (decay)
};

// Constants for animation
export const ANIMATION_CONFIG = {
  BOB_FREQUENCY: 0.015, // How fast the bobbing cycles (radians per ms)
  BOB_AMPLITUDE_FACTOR: 0.1, // Bobbing amplitude relative to velocity
  BOB_MAX_AMPLITUDE: 8, // Maximum bobbing amplitude in pixels
  SCALE_PULSE_FREQUENCY: 0.02, // How fast the scale pulses
  SCALE_PULSE_AMOUNT: 0.05, // How much the scale changes
};

// Constants for AI competitor behavior
export const AI_CONFIG = {
  SPEED_VARIATION_INTERVAL: 2000, // Time between speed changes (ms)
  SPEED_VARIATION_AMOUNT: 5, // Max speed change per variation (+/-)
};

// Constants for countdown
export const COUNTDOWN_CONFIG = {
  START_COUNT: 3, // Start from 3
  INTERVAL_MS: 1000, // 1 second between counts
};

// Constants for fairy dust trail effect
export const SPARKLE_CONFIG = {
  // Texture settings - tiny soft dots
  TEXTURE_SIZE: 6,
  OUTER_RADIUS: 3,
  INNER_RADIUS: 1,

  // Particle behavior - stay in place and fade slowly for trail effect
  SPEED_MIN: 0,
  SPEED_MAX: 3,
  ANGLE_MIN: 160,
  ANGLE_MAX: 200,
  SCALE_START: 0.5,
  SCALE_END: 0.15,
  ALPHA_START: 0.9,
  ALPHA_END: 0,

  // Spawn spread
  SPAWN_SPREAD_X: 8, // Random spread in X
  SPAWN_SPREAD_Y: 10, // Random spread in Y
  LIFESPAN_MIN: 1200, // Long fade for visible trail
  LIFESPAN_MAX: 1800,
  BASE_FREQUENCY: 40,

  // Velocity-based emission
  VELOCITY_THRESHOLD: 10,
  FREQUENCY_MIN: 15,
  FREQUENCY_MAX: 60,
  FREQUENCY_VELOCITY_DIVISOR: 4,

  // Fairy dust colors - soft whites, golds, pale pinks
  COLORS: [0xffffff, 0xfffacd, 0xffefd5, 0xffb6c1, 0xffe4b5],
};

/**
 * RaceScene - Main gameplay scene for the racing game.
 * Features:
 * - Fixed viewport (no camera follow)
 * - 6 horizontal lanes
 * - Placeholder circle for Rosie in lane 1
 * - Tap-to-run movement system with momentum
 */
export class RaceScene extends Phaser.Scene {
  private rosie: Phaser.GameObjects.Sprite | null = null;
  private laneHeight: number = 0;
  private laneYPositions: number[] = [];

  // Track positions (calculated proportionally in create() for responsive sizing)
  private startLineX: number = 0;
  private finishLineX: number = 0;
  private rosieStartX: number = 0;
  private checkpointPositions: number[] = [];

  // Game state
  private gameState: GameState = 'ready';
  private raceStartTime: number = 0; // Time when racing started (for finish time calculation)

  // Movement state
  private velocity: number = 0;
  private hasStarted: boolean = false;
  private hasFinished: boolean = false;

  // Rosie finish tracking
  private rosieFinishTime: number | null = null;
  private rosieFinishPosition: number | null = null;
  private nextFinishPosition: number = 1; // Next position to assign

  // Animation state
  private rosieBaseY: number = 0; // Base Y position for bobbing animation
  private rosieBaseScale: number = 1; // Base scale for the sprite

  // Checkpoint state
  private isPaused: boolean = false; // Whether Rosie is paused at a checkpoint
  private passedCheckpoints: boolean[] = []; // Track which checkpoints have been passed

  // Competitor state
  private competitors: Competitor[] = [];
  private selectedRacers: FamilyMember[] = [];
  private speedScale: number = SPEED_CONFIG.SPEED_SCALE;

  // UI elements
  private laneNameLabels: Phaser.GameObjects.Text[] = [];
  private leadIndicator: Phaser.GameObjects.Text | null = null;
  private countdownText: Phaser.GameObjects.Text | null = null;

  // Countdown state
  private countdownTimer: Phaser.Time.TimerEvent | null = null;

  // Sparkle trail effect
  private sparkleEmitter: Phaser.GameObjects.Particles.ParticleEmitter | null = null;

  private scaleSupportsEvents: boolean = false;

  constructor() {
    super({ key: 'RaceScene' });
  }

  preload(): void {
    // Load Rosie's sprite image
    this.load.image('rosie-sprite', rosieSpriteUrl);

    // Preload all audio assets
    const audioManager = AudioManager.getInstance();
    audioManager.preloadAudio(this);

    // Preload ALL family member sprite images (so they're ready for race restarts)
    FAMILY_MEMBERS.forEach((member) => {
      const spriteKey = `sprite-${member.id}`;
      const spriteUrl = `assets/${member.sprite}`;
      this.load.image(spriteKey, spriteUrl);
    });

    // Select random racers for this race
    this.selectedRacers = getRandomRacers(5);
  }

  create(): void {
    this.scaleSupportsEvents = typeof this.scale.on === 'function';

    if (this.scaleSupportsEvents) {
      this.scale.on('resize', this.handleResize, this);
    }

    // Calculate track positions proportionally based on actual canvas width using config ratios
    this.startLineX = this.scale.width * TRACK_CONFIG.START_LINE_RATIO;
    this.finishLineX = this.scale.width * TRACK_CONFIG.FINISH_LINE_RATIO;
    this.rosieStartX = this.scale.width * TRACK_CONFIG.ROSIE_START_RATIO;
    const trackLength = this.finishLineX - this.startLineX;
    // Calculate checkpoint positions using config ratios
    this.checkpointPositions = CHECKPOINT_CONFIG.POSITION_RATIOS.map(
      (ratio) => this.startLineX + trackLength * ratio
    );

    // Calculate lane dimensions
    this.laneHeight = this.scale.height / TRACK_CONFIG.LANE_COUNT;
    this.calculateLanePositions();

    // Initialize checkpoint state
    this.passedCheckpoints = this.checkpointPositions.map(() => false);

    // Set world bounds to match camera (fixed viewport)
    this.physics.world.setBounds(0, 0, this.scale.width, this.scale.height);

    // Initialize AudioManager with this scene
    const audioManager = AudioManager.getInstance();
    audioManager.init(this);

    // Draw the track background
    this.drawBackground();

    // Draw the lanes
    this.drawLanes();

    // Draw start and finish lines
    this.drawStartFinishLines();

    // Draw checkpoints
    this.drawCheckpoints();

    // Create Rosie placeholder
    this.createRosie();

    // Create sparkle trail emitter for Rosie
    this.createSparkleEmitter();

    // Create AI competitors
    this.createCompetitors();

    // Add lane name labels
    this.createLaneLabels();

    // Add lead indicator
    this.createLeadIndicator();

    // "TAP TO START" prompt is now handled by React overlay

    // Listen for tap events from React
    this.setupTapListener();

    // Emit initial game state
    this.emitGameState();
  }

  update(time: number, delta: number): void {
    // Only process updates during racing or paused (checkpoint) states
    if (this.gameState !== 'racing' && this.gameState !== 'paused') return;

    const deltaSeconds = delta / 1000;

    // Update AI competitors (they move even when Rosie is paused at checkpoint)
    this.updateCompetitors(time, deltaSeconds);

    // Check for AI competitors crossing finish line
    this.checkCompetitorFinishes();

    if (this.isPaused) return; // Don't move Rosie while paused at checkpoint

    // Apply friction (momentum decay)
    this.velocity *= MOVEMENT_CONFIG.FRICTION;

    // Clamp very small velocities to 0 to prevent eternal drift
    if (Math.abs(this.velocity) < 0.1) {
      this.velocity = 0;
    }

    // Move Rosie based on velocity (delta-time independent)
    if (this.rosie && this.velocity > 0) {
      this.rosie.x += this.velocity * deltaSeconds;

      // Clamp position to track bounds (allow starting from left of start line)
      this.rosie.x = Phaser.Math.Clamp(this.rosie.x, this.rosieStartX, this.finishLineX);

      // Check for checkpoints
      this.checkForCheckpoint();

      // Check for finish line
      if (this.rosie.x >= this.finishLineX && this.rosieFinishTime === null) {
        this.handleRosieFinish();
      }
    }

    // Apply bobbing animation when moving
    this.updateRosieAnimation(time);

    // Update lead indicator to show current positions
    this.updateLeadIndicator();

    // Check if all racers have finished
    this.checkAllRacersFinished();
  }

  private handleResize = (gameSize: Phaser.Structs.Size): void => {
    const { width, height } = gameSize;

    this.scale.resize(width, height);
    this.scene.restart();
  };

  /**
   * Set up listener for tap events from React
   */
  private setupTapListener(): void {
    this.game.events.on(GAME_EVENTS.TAP, this.handleTap, this);

    // Clean up listener when scene is destroyed
    this.events.on('shutdown', () => {
      this.game.events.off(GAME_EVENTS.TAP, this.handleTap, this);
      if (this.scaleSupportsEvents) {
        this.scale.off('resize', this.handleResize, this);
      }
    });

    // Also listen for restart events
    this.game.events.on(GAME_EVENTS.RESTART_RACE, this.handleRestart, this);
    this.events.on('shutdown', () => {
      this.game.events.off(GAME_EVENTS.RESTART_RACE, this.handleRestart, this);
    });

    // Listen for math answer submissions
    this.game.events.on(GAME_EVENTS.MATH_ANSWER_SUBMITTED, this.handleMathAnswer, this);
    this.events.on('shutdown', () => {
      this.game.events.off(GAME_EVENTS.MATH_ANSWER_SUBMITTED, this.handleMathAnswer, this);
    });

    // Listen for settings updates (speed scale changes)
    this.game.events.on(GAME_EVENTS.SETTINGS_UPDATED, this.handleSettingsUpdated, this);
    this.events.on('shutdown', () => {
      this.game.events.off(GAME_EVENTS.SETTINGS_UPDATED, this.handleSettingsUpdated, this);
    });
  }

  /**
   * Handle tap event - manages game states and increases velocity
   */
  private handleTap = (): void => {
    // In 'ready' state, start countdown on first tap
    if (this.gameState === 'ready') {
      this.startCountdown();
      return;
    }

    // During countdown, ignore taps
    if (this.gameState === 'countdown') {
      return;
    }

    // In finished state, ignore taps
    if (this.gameState === 'finished' || this.hasFinished) {
      return;
    }

    // During racing but paused at checkpoint, ignore taps
    if (this.isPaused) {
      return;
    }

    // In 'racing' state, handle normal tap movement
    if (this.gameState === 'racing') {
      // Add velocity boost
      this.velocity += MOVEMENT_CONFIG.TAP_VELOCITY_BOOST;

      // Cap at maximum velocity
      this.velocity = Math.min(this.velocity, MOVEMENT_CONFIG.MAX_VELOCITY);
    }
  };

  private handleSettingsUpdated = (payload: SettingsUpdatedPayload): void => {
    this.speedScale = payload.speedScale;
    this.competitors.forEach((competitor) => {
      competitor.speed = Phaser.Math.Clamp(
        competitor.speed,
        getMinSpeed(competitor.familyMember, this.speedScale),
        getMaxSpeed(competitor.familyMember, this.speedScale)
      );
    });
  };

  /**
   * Handle Rosie crossing the finish line
   */
  private handleRosieFinish(): void {
    // Record Rosie's finish time and position
    this.rosieFinishTime = performance.now() - this.raceStartTime;
    this.rosieFinishPosition = this.nextFinishPosition;
    this.nextFinishPosition++;
    this.hasFinished = true;
    this.velocity = 0;

    // Stop race music and play finish celebration sound
    const audioManager = AudioManager.getInstance();
    audioManager.stopMusic(true); // Stop race music immediately when Rosie finishes
    audioManager.playSFX(AUDIO_KEYS.FINISH);

    // Emit race finished event for React (legacy support for timer)
    this.game.events.emit(GAME_EVENTS.RACE_FINISHED);

    // Emit current race results (Rosie finished, show results screen immediately)
    this.emitRaceResultsUpdate();
  }

  /**
   * Handle race restart
   */
  private handleRestart = (): void => {
    // Reset game state
    this.gameState = 'ready';
    this.hasStarted = false;
    this.hasFinished = false;
    this.velocity = 0;
    this.isPaused = false;
    this.passedCheckpoints = this.checkpointPositions.map(() => false);
    this.raceStartTime = 0;

    // Reset finish tracking
    this.rosieFinishTime = null;
    this.rosieFinishPosition = null;
    this.nextFinishPosition = 1;

    // Cancel any running countdown
    if (this.countdownTimer) {
      this.countdownTimer.destroy();
      this.countdownTimer = null;
    }

    // Stop any playing music when restarting
    AudioManager.getInstance().stopMusic(false);

    if (this.rosie) {
      this.rosie.x = this.rosieStartX;
      this.rosie.y = this.rosieBaseY;
      this.rosie.setScale(this.rosieBaseScale);
    }

    // Reset competitors and select new random racers
    this.resetCompetitors();

    // Hide countdown text
    if (this.countdownText) {
      this.countdownText.setVisible(false);
    }

    // Emit state change
    this.emitGameState();
  };

  /**
   * Check if Rosie has reached a checkpoint
   */
  private checkForCheckpoint(): void {
    if (!this.rosie) return;

    this.checkpointPositions.forEach((checkpointX, index) => {
      // Check if Rosie has just crossed this checkpoint
      if (!this.passedCheckpoints[index] && this.rosie!.x >= checkpointX) {
        this.passedCheckpoints[index] = true;
        this.isPaused = true;
        this.velocity = 0; // Stop momentum while paused

        // Emit event to show math problem
        this.game.events.emit(GAME_EVENTS.SHOW_MATH_PROBLEM, { checkpointIndex: index });
      }
    });
  }

  /**
   * Handle math answer submission from React
   */
  private handleMathAnswer = (payload: MathAnswerPayload): void => {
    // Resume the race
    this.isPaused = false;

    const audioManager = AudioManager.getInstance();

    if (payload.correct) {
      // Play correct answer sound
      audioManager.playSFX(AUDIO_KEYS.CORRECT);

      // Apply velocity boost based on answer speed
      if (payload.timeTaken < CHECKPOINT_CONFIG.FAST_ANSWER_THRESHOLD) {
        this.velocity = CHECKPOINT_CONFIG.FAST_ANSWER_BOOST;
      } else {
        this.velocity = CHECKPOINT_CONFIG.SLOW_ANSWER_BOOST;
      }
    } else {
      // Play wrong answer sound
      audioManager.playSFX(AUDIO_KEYS.WRONG);
    }
    // Wrong answers: no boost, just resume (stumble delay handled in React)
  };

  /**
   * Calculate the Y center position for each lane
   */
  private calculateLanePositions(): void {
    this.laneYPositions = [];
    for (let i = 0; i < TRACK_CONFIG.LANE_COUNT; i++) {
      // Y position is the center of each lane
      const laneY = this.laneHeight * i + this.laneHeight / 2;
      this.laneYPositions.push(laneY);
    }
  }

  /**
   * Draw the background (sky gradient and grass)
   */
  private drawBackground(): void {
    const graphics = this.add.graphics();

    // Sky gradient at top 20%
    const skyHeight = this.scale.height * 0.2;
    graphics.fillStyle(0x87ceeb, 1); // Sky blue
    graphics.fillRect(0, 0, this.scale.width, skyHeight);

    // Add some clouds (simple white circles)
    this.addClouds();

    // Grass base (main track area)
    graphics.fillStyle(0x4caf50, 1); // Grass green
    graphics.fillRect(0, skyHeight, this.scale.width, this.scale.height - skyHeight);
  }

  /**
   * Add decorative clouds to the sky
   */
  private addClouds(): void {
    const cloudPositions = [
      { x: 100, y: 40 },
      { x: 300, y: 60 },
      { x: 500, y: 35 },
      { x: 700, y: 55 },
      { x: 900, y: 45 },
    ];

    cloudPositions.forEach((pos) => {
      // Each cloud is a group of circles
      this.add.circle(pos.x, pos.y, 25, 0xffffff, 0.9);
      this.add.circle(pos.x + 30, pos.y - 5, 30, 0xffffff, 0.9);
      this.add.circle(pos.x + 60, pos.y, 25, 0xffffff, 0.9);
    });
  }

  /**
   * Draw the 6 horizontal lanes with alternating colors
   * Lane 1 (Rosie's lane) is highlighted with a pink tint
   */
  private drawLanes(): void {
    const graphics = this.add.graphics();
    const skyHeight = this.scale.height * 0.2;
    const actualLaneHeight = (this.scale.height - skyHeight) / TRACK_CONFIG.LANE_COUNT;

    for (let i = 0; i < TRACK_CONFIG.LANE_COUNT; i++) {
      const laneY = skyHeight + actualLaneHeight * i;

      // Lane 1 (index 0) is Rosie's lane - highlight with pink tint
      if (i === 0) {
        graphics.fillStyle(0xffb6c1, 1); // Light pink for Rosie's lane
      } else {
        // Alternating lane colors (light and dark grass)
        const isEvenLane = i % 2 === 0;
        const laneColor = isEvenLane ? 0x66bb6a : 0x4caf50;
        graphics.fillStyle(laneColor, 1);
      }

      graphics.fillRect(0, laneY, this.scale.width, actualLaneHeight);

      // Add lane separator lines
      graphics.lineStyle(2, 0xffffff, 0.3);
      graphics.lineBetween(0, laneY, this.scale.width, laneY);
    }

    // Recalculate lane Y positions based on actual track area
    this.laneYPositions = [];
    for (let i = 0; i < TRACK_CONFIG.LANE_COUNT; i++) {
      const laneCenterY = skyHeight + actualLaneHeight * i + actualLaneHeight / 2;
      this.laneYPositions.push(laneCenterY);
    }
  }

  /**
   * Draw start and finish line markers
   */
  private drawStartFinishLines(): void {
    const graphics = this.add.graphics();
    const skyHeight = this.scale.height * 0.2;

    // Start line - dashed vertical line
    graphics.lineStyle(4, 0xffffff, 1);
    this.drawDashedLine(
      graphics,
      this.startLineX,
      skyHeight,
      this.startLineX,
      this.scale.height,
      10,
      5
    );

    // Finish line - proper checkerboard pattern like a racing flag
    const checkerWidth = 24; // Total width of the checkered strip
    const squareSize = 12; // Size of each checker square
    const finishStartY = skyHeight;
    const finishEndY = this.scale.height;
    const finishStartX = this.finishLineX - checkerWidth / 2;

    // Draw checkerboard pattern
    const rows = Math.ceil((finishEndY - finishStartY) / squareSize);
    const cols = Math.ceil(checkerWidth / squareSize);

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // Alternate colors in checkerboard pattern
        const isBlack = (row + col) % 2 === 0;
        graphics.fillStyle(isBlack ? 0x000000 : 0xffffff, 1);

        const x = finishStartX + col * squareSize;
        const y = finishStartY + row * squareSize;
        // Clamp height for the last row if it extends beyond canvas
        const height = Math.min(squareSize, finishEndY - y);

        graphics.fillRect(x, y, squareSize, height);
      }
    }

    // Add labels with dark text and white stroke for visibility
    this.add
      .text(this.startLineX, skyHeight - 10, 'START', {
        fontSize: '18px',
        color: '#1a1a1a',
        fontStyle: 'bold',
        stroke: '#ffffff',
        strokeThickness: 3,
      })
      .setOrigin(0.5, 1);

    this.add
      .text(this.finishLineX, skyHeight - 10, 'FINISH', {
        fontSize: '18px',
        color: '#1a1a1a',
        fontStyle: 'bold',
        stroke: '#ffffff',
        strokeThickness: 3,
      })
      .setOrigin(0.5, 1);
  }

  /**
   * Draw checkpoint markers (arches with ? symbols)
   */
  private drawCheckpoints(): void {
    const graphics = this.add.graphics();
    const skyHeight = this.scale.height * 0.2;

    this.checkpointPositions.forEach((checkpointX) => {
      // Draw arch poles (vertical red/white striped banners)
      const poleWidth = 8;
      const stripeHeight = 15;

      // Draw pole on the track
      for (let y = skyHeight; y < this.scale.height; y += stripeHeight * 2) {
        // Red stripe
        graphics.fillStyle(CHECKPOINT_CONFIG.COLORS.PRIMARY, 1);
        graphics.fillRect(checkpointX - poleWidth / 2, y, poleWidth, stripeHeight);

        // White stripe
        graphics.fillStyle(CHECKPOINT_CONFIG.COLORS.SECONDARY, 1);
        graphics.fillRect(
          checkpointX - poleWidth / 2,
          y + stripeHeight,
          poleWidth,
          Math.min(stripeHeight, this.scale.height - y - stripeHeight)
        );
      }

      // Draw arch top (curved banner in sky area)
      const archCenterY = skyHeight - 20;
      graphics.fillStyle(CHECKPOINT_CONFIG.COLORS.PRIMARY, 1);
      graphics.fillRoundedRect(
        checkpointX - CHECKPOINT_CONFIG.ARCH_WIDTH / 2,
        archCenterY - 15,
        CHECKPOINT_CONFIG.ARCH_WIDTH,
        30,
        8
      );

      // Add "?" symbol on the arch
      this.add
        .text(checkpointX, archCenterY, '?', {
          fontSize: '24px',
          color: '#ffff00',
          fontStyle: 'bold',
        })
        .setOrigin(0.5, 0.5);
    });
  }

  /**
   * Draw a dashed line
   */
  private drawDashedLine(
    graphics: Phaser.GameObjects.Graphics,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    dashLength: number,
    gapLength: number
  ): void {
    const totalLength = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    // Use ceil to ensure the line extends all the way to the end point
    const dashCount = Math.ceil(totalLength / (dashLength + gapLength));
    const dx = (x2 - x1) / totalLength;
    const dy = (y2 - y1) / totalLength;

    for (let i = 0; i < dashCount; i++) {
      const startOffset = i * (dashLength + gapLength);
      const startX = x1 + dx * startOffset;
      const startY = y1 + dy * startOffset;
      // Clamp the end point so the last dash doesn't overshoot
      const endX = Math.min(startX + dx * dashLength, x2);
      const endY = Math.min(startY + dy * dashLength, y2);

      graphics.lineBetween(startX, startY, endX, endY);
    }
  }

  /**
   * Create Rosie sprite using the loaded image
   */
  private createRosie(): void {
    // Rosie starts in lane 1 (index 0)
    this.rosieBaseY = this.laneYPositions[0];

    this.rosie = this.add.sprite(this.rosieStartX, this.rosieBaseY, 'rosie-sprite');

    // Scale the sprite to fit nicely in the lane
    // Target height is roughly 2x the radius (diameter) of the original circle
    const targetHeight = TRACK_CONFIG.ROSIE_RADIUS * 2;
    this.rosieBaseScale = targetHeight / this.rosie.height;
    this.rosie.setScale(this.rosieBaseScale);
    // Render on top of lane labels (depth 10)
    this.rosie.setDepth(15);
  }

  /**
   * Create sparkle particle emitter for Rosie's trail effect
   */
  private createSparkleEmitter(): void {
    const cfg = SPARKLE_CONFIG;

    // Create a sparkle texture (star-like shape)
    const graphics = this.add.graphics();
    const center = cfg.TEXTURE_SIZE / 2;
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(center, center, cfg.OUTER_RADIUS);
    // Add a bright center
    graphics.fillStyle(0xffffcc, 1);
    graphics.fillCircle(center, center, cfg.INNER_RADIUS);
    graphics.generateTexture('sparkle', cfg.TEXTURE_SIZE, cfg.TEXTURE_SIZE);
    graphics.destroy();

    // Create the particle emitter
    this.sparkleEmitter = this.add.particles(0, 0, 'sparkle', {
      speed: { min: cfg.SPEED_MIN, max: cfg.SPEED_MAX },
      angle: { min: cfg.ANGLE_MIN, max: cfg.ANGLE_MAX },
      scale: { start: cfg.SCALE_START, end: cfg.SCALE_END },
      alpha: { start: cfg.ALPHA_START, end: cfg.ALPHA_END },
      lifespan: { min: cfg.LIFESPAN_MIN, max: cfg.LIFESPAN_MAX },
      frequency: cfg.BASE_FREQUENCY,
      emitting: false, // Start inactive
      tint: cfg.COLORS,
    });

    // Set depth below Rosie so trail appears behind her
    this.sparkleEmitter.setDepth(14);
  }

  /**
   * Create AI competitor sprites in lanes 2-6
   */
  private createCompetitors(): void {
    this.competitors = [];

    // Create 5 competitors in lanes 2-6 (indices 1-5)
    this.selectedRacers.forEach((familyMember, index) => {
      const laneIndex = index + 1; // Lanes 1-5 (indices 1-5), Rosie is in lane 0
      const baseY = this.laneYPositions[laneIndex];

      // Use the preloaded sprite image
      const spriteKey = `sprite-${familyMember.id}`;

      // Create the sprite using the loaded image
      const sprite = this.add.sprite(this.rosieStartX, baseY, spriteKey);

      // Scale to match Rosie's size
      const targetHeight = TRACK_CONFIG.ROSIE_RADIUS * 2;
      const scale = targetHeight / sprite.height;
      sprite.setScale(scale);
      // Render on top of lane labels (depth 10)
      sprite.setDepth(15);

      // Assign random speed within the family member's range (using scaled speeds)
      const speed = Phaser.Math.FloatBetween(
        getMinSpeed(familyMember, this.speedScale),
        getMaxSpeed(familyMember, this.speedScale)
      );

      this.competitors.push({
        sprite,
        familyMember,
        speed,
        baseY,
        lastSpeedChangeTime: 0, // Will be set when race starts
        finishTime: null,
        finishPosition: null,
      });
    });
  }

  /**
   * Update AI competitors' movement with realistic speed variations
   * AI competitors don't stop for checkpoints - they race continuously
   */
  private updateCompetitors(time: number, deltaSeconds: number): void {
    this.competitors.forEach((competitor) => {
      // Skip if this competitor has already finished
      if (competitor.finishTime !== null) return;

      // Initialize lastSpeedChangeTime on first update
      if (competitor.lastSpeedChangeTime === 0) {
        competitor.lastSpeedChangeTime = time;
      }

      // Apply speed variation every SPEED_VARIATION_INTERVAL ms for realism
      if (time - competitor.lastSpeedChangeTime >= AI_CONFIG.SPEED_VARIATION_INTERVAL) {
        competitor.lastSpeedChangeTime = time;

        // Add random speed fluctuation
        const variation = Phaser.Math.FloatBetween(
          -AI_CONFIG.SPEED_VARIATION_AMOUNT,
          AI_CONFIG.SPEED_VARIATION_AMOUNT
        );
        competitor.speed += variation;

        // Clamp speed within the family member's min/max bounds (using scaled speeds)
        competitor.speed = Phaser.Math.Clamp(
          competitor.speed,
          getMinSpeed(competitor.familyMember, this.speedScale),
          getMaxSpeed(competitor.familyMember, this.speedScale)
        );
      }

      // Move at current speed
      competitor.sprite.x += competitor.speed * deltaSeconds;

      // Clamp to track bounds (allow starting from left of start line)
      competitor.sprite.x = Phaser.Math.Clamp(
        competitor.sprite.x,
        this.rosieStartX,
        this.finishLineX
      );
    });
  }

  /**
   * Reset competitors to starting position with new random racers and speeds
   */
  private resetCompetitors(): void {
    // Destroy existing competitor sprites
    this.competitors.forEach((competitor) => {
      competitor.sprite.destroy();
    });
    this.competitors = [];

    // Select new random racers
    this.selectedRacers = getRandomRacers(5);

    // Recreate competitors
    this.createCompetitors();

    // Update lane labels for new racers
    this.updateLaneLabels();
  }

  /**
   * Create lane name labels to the right of the starting line
   */
  private createLaneLabels(): void {
    const skyHeight = this.scale.height * 0.2;
    const actualLaneHeight = (this.scale.height - skyHeight) / TRACK_CONFIG.LANE_COUNT;
    const labelX = this.startLineX + 10; // Right of the starting line

    // Clear existing labels
    this.laneNameLabels.forEach((label) => label.destroy());
    this.laneNameLabels = [];

    // Create label for Rosie in lane 1
    const rosieLaneY = skyHeight + actualLaneHeight * 0.5;
    const rosieLabel = this.add
      .text(labelX, rosieLaneY, 'Rosie', {
        fontSize: '14px',
        color: '#ffffff',
        fontStyle: 'bold',
        backgroundColor: '#ff69b4',
        padding: { x: 4, y: 2 },
      })
      .setOrigin(0, 0.5)
      .setDepth(10);
    this.laneNameLabels.push(rosieLabel);

    // Create labels for competitors in lanes 2-6
    this.selectedRacers.forEach((racer, index) => {
      const laneIndex = index + 1;
      const laneY = skyHeight + actualLaneHeight * laneIndex + actualLaneHeight * 0.5;
      const label = this.add
        .text(labelX, laneY, racer.name, {
          fontSize: '14px',
          color: '#ffffff',
          fontStyle: 'bold',
          backgroundColor: `#${racer.color.toString(16).padStart(6, '0')}`,
          padding: { x: 4, y: 2 },
        })
        .setOrigin(0, 0.5)
        .setDepth(10);
      this.laneNameLabels.push(label);
    });
  }

  /**
   * Update lane labels when racers change (after restart)
   */
  private updateLaneLabels(): void {
    // Recreate all labels with new racer names
    this.createLaneLabels();
  }

  /**
   * Create the lead indicator text at the top of the screen
   */
  private createLeadIndicator(): void {
    // Position at the very top of the screen to avoid obscuring FINISH text
    this.leadIndicator = this.add
      .text(this.scale.width - 10, 25, '1st: -', {
        fontSize: '18px',
        color: '#ffffff',
        fontStyle: 'bold',
        backgroundColor: '#333333',
        padding: { x: 8, y: 4 },
      })
      .setOrigin(1, 0.5)
      .setDepth(20);
  }

  /**
   * Update the lead indicator to show the current leader
   */
  private updateLeadIndicator(): void {
    if (!this.leadIndicator || !this.rosie) return;
    if (!this.hasStarted) {
      this.leadIndicator.setText('1st: -');
      return;
    }

    // Get all racers with their positions
    const racers: { name: string; x: number }[] = [
      { name: 'Rosie', x: this.rosie.x },
      ...this.competitors.map((c) => ({
        name: c.familyMember.name,
        x: c.sprite.x,
      })),
    ];

    // Sort by x position (descending - furthest ahead is first)
    racers.sort((a, b) => b.x - a.x);

    // Update the lead indicator with the leader's name
    const leader = racers[0];
    this.leadIndicator.setText(`1st: ${leader.name}`);
  }

  /**
   * Get current race positions for all racers
   * Returns array sorted by position (1st place first)
   */
  getRacePositions(): { name: string; x: number; position: number }[] {
    if (!this.rosie) return [];

    const racers: { name: string; x: number }[] = [
      { name: 'Rosie', x: this.rosie.x },
      ...this.competitors.map((c) => ({
        name: c.familyMember.name,
        x: c.sprite.x,
      })),
    ];

    // Sort by x position (descending - furthest ahead is first)
    racers.sort((a, b) => b.x - a.x);

    // Add position numbers
    return racers.map((racer, index) => ({
      ...racer,
      position: index + 1,
    }));
  }

  /**
   * Update Rosie's bobbing animation based on velocity
   */
  private updateRosieAnimation(time: number): void {
    if (!this.rosie) return;

    if (this.velocity > 0) {
      // Calculate bobbing amplitude based on velocity (faster = more bounce)
      const bobAmplitude = Math.min(
        this.velocity * ANIMATION_CONFIG.BOB_AMPLITUDE_FACTOR,
        ANIMATION_CONFIG.BOB_MAX_AMPLITUDE
      );

      // Apply sine wave to Y position for bobbing effect
      const bobOffset = Math.sin(time * ANIMATION_CONFIG.BOB_FREQUENCY) * bobAmplitude;
      this.rosie.y = this.rosieBaseY + bobOffset;

      // Apply subtle scale pulse for "running" feel (relative to base scale)
      const scalePulse =
        1 +
        Math.sin(time * ANIMATION_CONFIG.SCALE_PULSE_FREQUENCY) *
          ANIMATION_CONFIG.SCALE_PULSE_AMOUNT;
      this.rosie.setScale(this.rosieBaseScale * scalePulse);

      // Update sparkle trail - position behind Rosie and emit based on velocity
      if (this.sparkleEmitter) {
        // Emit fairy dust underneath Rosie - particles stay in world space
        if (this.velocity > SPARKLE_CONFIG.VELOCITY_THRESHOLD) {
          if (Math.random() < 0.6) {
            const spriteHeight = this.rosie.height * this.rosieBaseScale;
            // Random spread around spawn point
            const spreadX = (Math.random() - 0.5) * SPARKLE_CONFIG.SPAWN_SPREAD_X;
            const spreadY = (Math.random() - 0.5) * SPARKLE_CONFIG.SPAWN_SPREAD_Y;
            // Emit directly underneath Rosie
            this.sparkleEmitter.emitParticleAt(
              this.rosie.x + spreadX,
              this.rosie.y + spriteHeight * 0.4 + spreadY
            );
          }
        }
      }
    } else {
      // Reset to base position when not moving
      this.rosie.y = this.rosieBaseY;
      this.rosie.setScale(this.rosieBaseScale);

      // Stop sparkle trail when not moving
      if (this.sparkleEmitter && this.sparkleEmitter.emitting) {
        this.sparkleEmitter.stop();
      }
    }
  }

  /**
   * Get Rosie's game object (for external access)
   */
  getRosie(): Phaser.GameObjects.Sprite | null {
    return this.rosie;
  }

  /**
   * Get Rosie's base Y position (for external access/testing)
   */
  getRosieBaseY(): number {
    return this.rosieBaseY;
  }

  /**
   * Get lane Y positions (for external access)
   */
  getLaneYPositions(): number[] {
    return [...this.laneYPositions];
  }

  /**
   * Get current velocity (for external access/testing)
   */
  getVelocity(): number {
    return this.velocity;
  }

  /**
   * Check if race has finished (for external access)
   */
  getHasFinished(): boolean {
    return this.hasFinished;
  }

  /**
   * Check if Rosie is paused at a checkpoint (for external access/testing)
   */
  getIsPaused(): boolean {
    return this.isPaused;
  }

  /**
   * Get array of passed checkpoints (for external access/testing)
   */
  getPassedCheckpoints(): boolean[] {
    return [...this.passedCheckpoints];
  }

  /**
   * Get competitors array (for external access/testing)
   */
  getCompetitors(): Competitor[] {
    return [...this.competitors];
  }

  /**
   * Get selected racers (for external access/testing)
   */
  getSelectedRacers(): FamilyMember[] {
    return [...this.selectedRacers];
  }

  /**
   * Get current game state (for external access/testing)
   */
  getGameState(): GameState {
    return this.gameState;
  }

  // ==================== Game State Management ====================

  /**
   * Emit current game state to React
   */
  private emitGameState(): void {
    this.game.events.emit(GAME_EVENTS.GAME_STATE_CHANGED, { state: this.gameState });
  }

  /**
   * Set game state and emit change event
   */
  private setGameState(newState: GameState): void {
    this.gameState = newState;
    this.emitGameState();
  }

  /**
   * Start the countdown sequence
   */
  private startCountdown(): void {
    // Set state to countdown
    this.setGameState('countdown');

    // Create countdown text
    this.countdownText = this.add
      .text(this.scale.width / 2, this.scale.height / 2, '3', {
        fontSize: '120px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5, 0.5)
      .setDepth(100)
      .setStroke('#333333', 8);

    // Start countdown from 3
    let count = COUNTDOWN_CONFIG.START_COUNT;
    const audioManager = AudioManager.getInstance();

    // Play countdown audio ONCE - the sound file contains the full "3, 2, 1, GO" sequence
    audioManager.playSFX(AUDIO_KEYS.COUNTDOWN);
    this.game.events.emit(GAME_EVENTS.COUNTDOWN_TICK, { count });

    // Animate the countdown number
    this.animateCountdownNumber();

    // Set up timer for subsequent counts (visual only - audio plays through naturally)
    this.countdownTimer = this.time.addEvent({
      delay: COUNTDOWN_CONFIG.INTERVAL_MS,
      callback: () => {
        count--;

        if (count > 0) {
          // Update countdown text
          if (this.countdownText) {
            this.countdownText.setText(count.toString());
            this.animateCountdownNumber();
          }
          // Emit event for React (no audio - it's handled by the single countdown sound)
          this.game.events.emit(GAME_EVENTS.COUNTDOWN_TICK, { count });
        } else if (count === 0) {
          // Show "GO!"
          if (this.countdownText) {
            this.countdownText.setText('GO!');
            this.countdownText.setFontSize(100);
            this.countdownText.setColor('#00ff00');
            this.animateCountdownNumber();
          }
          // Emit GO event (no additional audio - countdown sound includes GO)
          this.game.events.emit(GAME_EVENTS.COUNTDOWN_TICK, { count: 0 });

          // Start the race after a brief moment
          this.time.delayedCall(500, () => {
            this.startRacing();
          });
        }
      },
      repeat: COUNTDOWN_CONFIG.START_COUNT,
    });
  }

  /**
   * Animate countdown number with a pop effect
   */
  private animateCountdownNumber(): void {
    if (!this.countdownText) return;

    this.countdownText.setScale(1.5);
    this.tweens.add({
      targets: this.countdownText,
      scale: 1,
      duration: 200,
      ease: 'Back.easeOut',
    });
  }

  /**
   * Start the racing phase after countdown
   */
  private startRacing(): void {
    // Hide countdown text
    if (this.countdownText) {
      this.countdownText.setVisible(false);
    }

    // Set state to racing
    this.setGameState('racing');
    this.hasStarted = true;
    this.raceStartTime = performance.now();

    // Emit race started event for React timer
    this.game.events.emit(GAME_EVENTS.RACE_STARTED);

    // Start race music
    AudioManager.getInstance().playMusic(AUDIO_KEYS.RACE_MUSIC);
  }

  // ==================== Finish Tracking ====================

  /**
   * Check if any AI competitors have crossed the finish line
   */
  private checkCompetitorFinishes(): void {
    let anyFinished = false;
    this.competitors.forEach((competitor) => {
      // Skip if already finished
      if (competitor.finishTime !== null) return;

      // Check if crossed finish line
      if (competitor.sprite.x >= this.finishLineX) {
        competitor.finishTime = performance.now() - this.raceStartTime;
        competitor.finishPosition = this.nextFinishPosition;
        this.nextFinishPosition++;
        anyFinished = true;
      }
    });

    // If Rosie has finished and a competitor just finished, update results
    if (anyFinished && this.rosieFinishTime !== null) {
      this.emitRaceResultsUpdate();
    }
  }

  /**
   * Check if all racers have finished and emit results
   */
  private checkAllRacersFinished(): void {
    // Check if Rosie has finished
    if (this.rosieFinishTime === null) return;

    // Check if all competitors have finished
    const allCompetitorsFinished = this.competitors.every((c) => c.finishTime !== null);
    if (!allCompetitorsFinished) return;

    // All racers have finished - compile results
    const results = this.compileRaceResults();

    // Set game state to finished
    this.setGameState('finished');

    // Stop race music
    AudioManager.getInstance().stopMusic(true);

    // Emit results to React
    this.game.events.emit(GAME_EVENTS.ALL_RACERS_FINISHED, { results });
  }

  /**
   * Emit current race results to React
   * Called when Rosie finishes and when each competitor finishes
   */
  private emitRaceResultsUpdate(): void {
    const results = this.compileCurrentRaceResults();
    const allFinished = this.competitors.every((c) => c.finishTime !== null);

    const payload: RaceResultsUpdatedPayload = {
      results,
      allFinished,
    };

    this.game.events.emit(GAME_EVENTS.RACE_RESULTS_UPDATED, payload);

    // If all finished, also set game state and stop music
    if (allFinished) {
      this.setGameState('finished');
      AudioManager.getInstance().stopMusic(true);
    }
  }

  /**
   * Compile current race results including unfinished racers
   * Finished racers are sorted by position, unfinished racers are at the end
   */
  private compileCurrentRaceResults(): RacerResult[] {
    const finished: RacerResult[] = [];
    const stillRacing: RacerResult[] = [];

    // Add Rosie's result (she must be finished if this is called)
    finished.push({
      name: 'Rosie',
      color: TRACK_CONFIG.ROSIE_COLOR,
      finishTime: this.rosieFinishTime,
      position: this.rosieFinishPosition,
      isRosie: true,
      avatar: rosieSpriteUrl,
    });

    // Add competitor results
    this.competitors.forEach((competitor) => {
      const result: RacerResult = {
        name: competitor.familyMember.name,
        color: competitor.familyMember.color,
        finishTime: competitor.finishTime,
        position: competitor.finishPosition,
        isRosie: false,
        avatar: `assets/${competitor.familyMember.sprite}`,
      };

      if (competitor.finishTime !== null) {
        finished.push(result);
      } else {
        stillRacing.push(result);
      }
    });

    // Sort finished racers by position
    finished.sort((a, b) => (a.position ?? 999) - (b.position ?? 999));

    // Append still-racing racers at the end
    return [...finished, ...stillRacing];
  }

  /**
   * Compile final race results sorted by position (legacy - used by ALL_RACERS_FINISHED)
   */
  private compileRaceResults(): RacerResult[] {
    const results: RacerResult[] = [];

    // Add Rosie's result
    results.push({
      name: 'Rosie',
      color: TRACK_CONFIG.ROSIE_COLOR,
      finishTime: this.rosieFinishTime!,
      position: this.rosieFinishPosition!,
      isRosie: true,
      avatar: rosieSpriteUrl,
    });

    // Add competitor results
    this.competitors.forEach((competitor) => {
      results.push({
        name: competitor.familyMember.name,
        color: competitor.familyMember.color,
        finishTime: competitor.finishTime!,
        position: competitor.finishPosition!,
        isRosie: false,
        avatar: `assets/${competitor.familyMember.sprite}`,
      });
    });

    // Sort by position
    results.sort((a, b) => (a.position ?? 999) - (b.position ?? 999));

    return results;
  }
}

export default RaceScene;
export type { Competitor };
