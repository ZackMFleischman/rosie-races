import { useContext } from 'react';
import GameContext, { type GameContextValue } from '../context/GameContext';

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
