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
} as const;

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
