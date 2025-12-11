import { createContext, useCallback, useRef, type ReactNode } from 'react';
import * as Phaser from 'phaser';
import { GAME_EVENTS } from '../game/events';

export interface GameContextValue {
  game: Phaser.Game | null;
  setGame: (game: Phaser.Game | null) => void;
  emitTap: () => void;
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

  const setGame = useCallback((game: Phaser.Game | null) => {
    gameRef.current = game;
  }, []);

  const emitTap = useCallback(() => {
    if (gameRef.current) {
      gameRef.current.events.emit(GAME_EVENTS.TAP);
    }
  }, []);

  const value: GameContextValue = {
    get game() {
      return gameRef.current;
    },
    setGame,
    emitTap,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export default GameContext;
