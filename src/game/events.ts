/**
 * Game state types for race flow
 */
export type GameState = 'ready' | 'countdown' | 'racing' | 'paused' | 'finished';

/**
 * Game events for React-Phaser communication
 */
export const GAME_EVENTS = {
  TAP: 'tap',
  RACE_STARTED: 'raceStarted',
  RACE_FINISHED: 'raceFinished',
  RESTART_RACE: 'restartRace',
  // Checkpoint events
  SHOW_MATH_PROBLEM: 'showMathProblem',
  MATH_ANSWER_SUBMITTED: 'mathAnswerSubmitted',
  // State events
  GAME_STATE_CHANGED: 'gameStateChanged',
  COUNTDOWN_TICK: 'countdownTick',
  ALL_RACERS_FINISHED: 'allRacersFinished',
  RACE_RESULTS_UPDATED: 'raceResultsUpdated',
} as const;

/**
 * Payload for game state change events
 */
export interface GameStatePayload {
  state: GameState;
}

/**
 * Payload for countdown tick events
 */
export interface CountdownPayload {
  count: number; // 3, 2, 1, 0 (0 = GO!)
}

/**
 * Racer finish result for results screen
 * finishTime and position are null if the racer hasn't finished yet
 */
export interface RacerResult {
  name: string;
  color: number;
  finishTime: number | null;
  position: number | null;
  isRosie: boolean;
  avatar?: string; // Optional avatar image URL
}

/**
 * Payload for all racers finished event
 */
export interface AllRacersFinishedPayload {
  results: RacerResult[];
}

/**
 * Payload for race results updated event (emitted as each racer finishes)
 */
export interface RaceResultsUpdatedPayload {
  results: RacerResult[];
  allFinished: boolean;
}

/**
 * Payload for math problem events
 */
export interface MathProblemPayload {
  checkpointIndex: number;
}

/**
 * Payload for math answer submission
 */
export interface MathAnswerPayload {
  correct: boolean;
  timeTaken: number; // in milliseconds
}
