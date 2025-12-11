import { useContext } from 'react';
import * as Phaser from 'phaser';
import GameContext from '../context/GameContext';

interface GameContextValue {
  game: Phaser.Game | null;
  setGame: (game: Phaser.Game | null) => void;
  emitTap: () => void;
}

/**
 * Hook to access game context
 */
export function useGame(): GameContextValue {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
