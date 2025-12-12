import {
  createContext,
  useCallback,
  useRef,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import * as Phaser from 'phaser';
import { GAME_EVENTS } from '../game/events';

export interface GameContextValue {
  game: Phaser.Game | null;
  setGame: (game: Phaser.Game | null) => void;
  emitTap: () => void;
  isRacing: boolean;
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
  const [gameVersion, setGameVersion] = useState(0);

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

  // Listen for game events
  useEffect(() => {
    const game = gameRef.current;
    if (!game) return;

    const handleRaceStarted = () => setIsRacing(true);
    const handleRaceFinished = () => setIsRacing(false);
    const handleRestartRace = () => setIsRacing(false);

    game.events.on(GAME_EVENTS.RACE_STARTED, handleRaceStarted);
    game.events.on(GAME_EVENTS.RACE_FINISHED, handleRaceFinished);
    game.events.on(GAME_EVENTS.RESTART_RACE, handleRestartRace);

    return () => {
      game.events.off(GAME_EVENTS.RACE_STARTED, handleRaceStarted);
      game.events.off(GAME_EVENTS.RACE_FINISHED, handleRaceFinished);
      game.events.off(GAME_EVENTS.RESTART_RACE, handleRestartRace);
    };
  }, [gameVersion]);

  const value: GameContextValue = {
    get game() {
      return gameRef.current;
    },
    setGame,
    emitTap,
    isRacing,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export default GameContext;
