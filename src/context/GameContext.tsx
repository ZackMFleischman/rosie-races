import { createContext, useCallback, useRef, useState, useEffect, type ReactNode } from 'react';
import * as Phaser from 'phaser';
import {
  GAME_EVENTS,
  type MathAnswerPayload,
  type GameState,
  type RacerResult,
  type GameStatePayload,
  type CountdownPayload,
  type AllRacersFinishedPayload,
  type RaceResultsUpdatedPayload,
} from '../game/events';
import { generateProblem, type MathProblem } from '../game/systems/MathGenerator';

export interface GameContextValue {
  game: Phaser.Game | null;
  setGame: (game: Phaser.Game | null) => void;
  emitTap: () => void;
  emitRestart: () => void;
  isRacing: boolean;
  isFinished: boolean;
  finishTime: number | null;
  // Math problem state
  currentProblem: MathProblem | null;
  submitMathAnswer: (correct: boolean, timeTaken: number) => void;
  // Game state for Phase 6
  gameState: GameState;
  countdownValue: number | null;
  raceResults: RacerResult[] | null;
}

const GameContext = createContext<GameContextValue | null>(null);

interface GameProviderProps {
  children: ReactNode;
}

/**
 * GameProvider - Provides game instance and event communication to React components.
 * Enables React components to communicate with Phaser game via custom events.
 */
export function GameProvider({ children }: GameProviderProps) {
  const gameRef = useRef<Phaser.Game | null>(null);
  const [isRacing, setIsRacing] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [finishTime, setFinishTime] = useState<number | null>(null);
  const [gameVersion, setGameVersion] = useState(0);
  const [currentProblem, setCurrentProblem] = useState<MathProblem | null>(null);
  const raceStartTimeRef = useRef<number | null>(null);
  // Phase 6 state
  const [gameState, setGameState] = useState<GameState>('ready');
  const [countdownValue, setCountdownValue] = useState<number | null>(null);
  const [raceResults, setRaceResults] = useState<RacerResult[] | null>(null);

  const setGame = useCallback((game: Phaser.Game | null) => {
    gameRef.current = game;
    // Trigger effect to re-run when game is set
    setGameVersion((v) => v + 1);
  }, []);

  const emitTap = useCallback(() => {
    if (gameRef.current) {
      gameRef.current.events.emit(GAME_EVENTS.TAP);
    }
  }, []);

  const emitRestart = useCallback(() => {
    if (gameRef.current) {
      gameRef.current.events.emit(GAME_EVENTS.RESTART_RACE);
    }
  }, []);

  const submitMathAnswer = useCallback((correct: boolean, timeTaken: number) => {
    if (gameRef.current) {
      const payload: MathAnswerPayload = { correct, timeTaken };
      gameRef.current.events.emit(GAME_EVENTS.MATH_ANSWER_SUBMITTED, payload);
    }
    setCurrentProblem(null);
  }, []);

  // Listen for game events
  useEffect(() => {
    const game = gameRef.current;
    if (!game) return;

    const handleRaceStarted = () => {
      raceStartTimeRef.current = performance.now();
      setIsRacing(true);
      setIsFinished(false);
      setFinishTime(null);
      setCurrentProblem(null);
      setCountdownValue(null);
    };

    const handleRaceFinished = () => {
      if (raceStartTimeRef.current !== null) {
        const elapsed = performance.now() - raceStartTimeRef.current;
        setFinishTime(elapsed);
      }
      setIsRacing(false);
      setIsFinished(true);
      setCurrentProblem(null);
    };

    const handleRestartRace = () => {
      raceStartTimeRef.current = null;
      setIsRacing(false);
      setIsFinished(false);
      setFinishTime(null);
      setCurrentProblem(null);
      setGameState('ready');
      setCountdownValue(null);
      setRaceResults(null);
    };

    const handleShowMathProblem = () => {
      // Generate a new math problem and show modal
      const problem = generateProblem();
      setCurrentProblem(problem);
    };

    const handleGameStateChanged = (payload: GameStatePayload) => {
      setGameState(payload.state);
    };

    const handleCountdownTick = (payload: CountdownPayload) => {
      setCountdownValue(payload.count);
    };

    const handleAllRacersFinished = (payload: AllRacersFinishedPayload) => {
      setRaceResults(payload.results);
    };

    const handleRaceResultsUpdated = (payload: RaceResultsUpdatedPayload) => {
      setRaceResults(payload.results);
    };

    game.events.on(GAME_EVENTS.RACE_STARTED, handleRaceStarted);
    game.events.on(GAME_EVENTS.RACE_FINISHED, handleRaceFinished);
    game.events.on(GAME_EVENTS.RESTART_RACE, handleRestartRace);
    game.events.on(GAME_EVENTS.SHOW_MATH_PROBLEM, handleShowMathProblem);
    game.events.on(GAME_EVENTS.GAME_STATE_CHANGED, handleGameStateChanged);
    game.events.on(GAME_EVENTS.COUNTDOWN_TICK, handleCountdownTick);
    game.events.on(GAME_EVENTS.ALL_RACERS_FINISHED, handleAllRacersFinished);
    game.events.on(GAME_EVENTS.RACE_RESULTS_UPDATED, handleRaceResultsUpdated);

    return () => {
      game.events.off(GAME_EVENTS.RACE_STARTED, handleRaceStarted);
      game.events.off(GAME_EVENTS.RACE_FINISHED, handleRaceFinished);
      game.events.off(GAME_EVENTS.RESTART_RACE, handleRestartRace);
      game.events.off(GAME_EVENTS.SHOW_MATH_PROBLEM, handleShowMathProblem);
      game.events.off(GAME_EVENTS.GAME_STATE_CHANGED, handleGameStateChanged);
      game.events.off(GAME_EVENTS.COUNTDOWN_TICK, handleCountdownTick);
      game.events.off(GAME_EVENTS.ALL_RACERS_FINISHED, handleAllRacersFinished);
      game.events.off(GAME_EVENTS.RACE_RESULTS_UPDATED, handleRaceResultsUpdated);
    };
  }, [gameVersion]);

  const value: GameContextValue = {
    get game() {
      return gameRef.current;
    },
    setGame,
    emitTap,
    emitRestart,
    isRacing,
    isFinished,
    finishTime,
    currentProblem,
    submitMathAnswer,
    // Phase 6 state
    gameState,
    countdownValue,
    raceResults,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export default GameContext;
