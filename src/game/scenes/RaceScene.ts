import * as Phaser from 'phaser';
import { GAME_EVENTS } from '../events';
import rosieSpriteUrl from '../../assets/rosie-sprite.png';

// Constants for track layout
export const TRACK_CONFIG = {
  LANE_COUNT: 6,
  START_LINE_X: 50,
  FINISH_LINE_X: 974,
  ROSIE_START_X: 80,
  ROSIE_RADIUS: 30,
  ROSIE_COLOR: 0xff69b4, // Pink
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

  // Movement state
  private velocity: number = 0;
  private hasFinished: boolean = false;

  // Animation state
  private rosieBaseY: number = 0; // Base Y position for bobbing animation
  private rosieBaseScale: number = 1; // Base scale for the sprite

  constructor() {
    super({ key: 'RaceScene' });
  }

  preload(): void {
    // Load Rosie's sprite image
    this.load.image('rosie-sprite', rosieSpriteUrl);
  }

  create(): void {
    // Calculate lane dimensions
    this.laneHeight = this.scale.height / TRACK_CONFIG.LANE_COUNT;
    this.calculateLanePositions();

    // Set world bounds to match camera (fixed viewport)
    this.physics.world.setBounds(0, 0, this.scale.width, this.scale.height);

    // Draw the track background
    this.drawBackground();

    // Draw the lanes
    this.drawLanes();

    // Draw start and finish lines
    this.drawStartFinishLines();

    // Create Rosie placeholder
    this.createRosie();

    // Listen for tap events from React
    this.setupTapListener();
  }

  update(time: number, delta: number): void {
    if (this.hasFinished) return;

    // Apply friction (momentum decay)
    this.velocity *= MOVEMENT_CONFIG.FRICTION;

    // Clamp very small velocities to 0 to prevent eternal drift
    if (Math.abs(this.velocity) < 0.1) {
      this.velocity = 0;
    }

    // Move Rosie based on velocity (delta-time independent)
    if (this.rosie && this.velocity > 0) {
      const deltaSeconds = delta / 1000;
      this.rosie.x += this.velocity * deltaSeconds;

      // Clamp position to track bounds
      this.rosie.x = Phaser.Math.Clamp(
        this.rosie.x,
        TRACK_CONFIG.START_LINE_X,
        TRACK_CONFIG.FINISH_LINE_X
      );

      // Check for finish line
      if (this.rosie.x >= TRACK_CONFIG.FINISH_LINE_X) {
        this.handleFinish();
      }
    }

    // Apply bobbing animation when moving
    this.updateRosieAnimation(time);
  }

  /**
   * Set up listener for tap events from React
   */
  private setupTapListener(): void {
    this.game.events.on(GAME_EVENTS.TAP, this.handleTap, this);

    // Clean up listener when scene is destroyed
    this.events.on('shutdown', () => {
      this.game.events.off(GAME_EVENTS.TAP, this.handleTap, this);
    });

    // Also listen for restart events
    this.game.events.on(GAME_EVENTS.RESTART_RACE, this.handleRestart, this);
    this.events.on('shutdown', () => {
      this.game.events.off(GAME_EVENTS.RESTART_RACE, this.handleRestart, this);
    });
  }

  /**
   * Handle tap event - increase velocity
   */
  private handleTap = (): void => {
    if (this.hasFinished) return;

    // Add velocity boost
    this.velocity += MOVEMENT_CONFIG.TAP_VELOCITY_BOOST;

    // Cap at maximum velocity
    this.velocity = Math.min(this.velocity, MOVEMENT_CONFIG.MAX_VELOCITY);
  };

  /**
   * Handle race finish
   */
  private handleFinish(): void {
    this.hasFinished = true;
    this.velocity = 0;
    this.game.events.emit(GAME_EVENTS.RACE_FINISHED);
  }

  /**
   * Handle race restart
   */
  private handleRestart = (): void => {
    this.hasFinished = false;
    this.velocity = 0;
    if (this.rosie) {
      this.rosie.x = TRACK_CONFIG.ROSIE_START_X;
      this.rosie.y = this.rosieBaseY;
      this.rosie.setScale(this.rosieBaseScale);
    }
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
   */
  private drawLanes(): void {
    const graphics = this.add.graphics();
    const skyHeight = this.scale.height * 0.2;
    const actualLaneHeight = (this.scale.height - skyHeight) / TRACK_CONFIG.LANE_COUNT;

    for (let i = 0; i < TRACK_CONFIG.LANE_COUNT; i++) {
      // Alternating lane colors (light and dark grass)
      const isEvenLane = i % 2 === 0;
      const laneColor = isEvenLane ? 0x66bb6a : 0x4caf50;
      const laneY = skyHeight + actualLaneHeight * i;

      graphics.fillStyle(laneColor, 1);
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
      TRACK_CONFIG.START_LINE_X,
      skyHeight,
      TRACK_CONFIG.START_LINE_X,
      this.scale.height,
      10,
      5
    );

    // Finish line - checkered pattern
    graphics.lineStyle(4, 0x000000, 1);
    this.drawDashedLine(
      graphics,
      TRACK_CONFIG.FINISH_LINE_X,
      skyHeight,
      TRACK_CONFIG.FINISH_LINE_X,
      this.scale.height,
      10,
      5
    );

    // Add labels
    this.add
      .text(TRACK_CONFIG.START_LINE_X, skyHeight - 15, 'START', {
        fontSize: '16px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5, 1);

    this.add
      .text(TRACK_CONFIG.FINISH_LINE_X, skyHeight - 15, 'FINISH', {
        fontSize: '16px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5, 1);
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
    const dashCount = Math.floor(totalLength / (dashLength + gapLength));
    const dx = (x2 - x1) / totalLength;
    const dy = (y2 - y1) / totalLength;

    for (let i = 0; i < dashCount; i++) {
      const startOffset = i * (dashLength + gapLength);
      const startX = x1 + dx * startOffset;
      const startY = y1 + dy * startOffset;
      const endX = startX + dx * dashLength;
      const endY = startY + dy * dashLength;

      graphics.lineBetween(startX, startY, endX, endY);
    }
  }

  /**
   * Create Rosie sprite using the loaded image
   */
  private createRosie(): void {
    // Rosie starts in lane 1 (index 0)
    this.rosieBaseY = this.laneYPositions[0];

    this.rosie = this.add.sprite(
      TRACK_CONFIG.ROSIE_START_X,
      this.rosieBaseY,
      'rosie-sprite'
    );

    // Scale the sprite to fit nicely in the lane
    // Target height is roughly 2x the radius (diameter) of the original circle
    const targetHeight = TRACK_CONFIG.ROSIE_RADIUS * 2;
    this.rosieBaseScale = targetHeight / this.rosie.height;
    this.rosie.setScale(this.rosieBaseScale);
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
        1 + Math.sin(time * ANIMATION_CONFIG.SCALE_PULSE_FREQUENCY) * ANIMATION_CONFIG.SCALE_PULSE_AMOUNT;
      this.rosie.setScale(this.rosieBaseScale * scalePulse);
    } else {
      // Reset to base position when not moving
      this.rosie.y = this.rosieBaseY;
      this.rosie.setScale(this.rosieBaseScale);
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
}

export default RaceScene;
