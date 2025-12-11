import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import * as Phaser from 'phaser';
import Box from '@mui/material/Box';

// Default game configuration with responsive scaling
const DEFAULT_GAME_CONFIG: Omit<Phaser.Types.Core.GameConfig, 'parent'> = {
  type: Phaser.AUTO,
  width: 1024,
  height: 768,
  backgroundColor: '#4CAF50', // Grass green
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
};

export interface GameContainerHandle {
  game: Phaser.Game | null;
}

interface GameContainerProps {
  config?: Partial<Phaser.Types.Core.GameConfig>;
  onGameReady?: (game: Phaser.Game) => void;
}

const GameContainer = forwardRef<GameContainerHandle, GameContainerProps>(
  ({ config, onGameReady }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const gameRef = useRef<Phaser.Game | null>(null);

    // Expose game instance via ref
    useImperativeHandle(ref, () => ({
      get game() {
        return gameRef.current;
      },
    }));

    useEffect(() => {
      if (!containerRef.current) return;

      // Merge configs
      const gameConfig: Phaser.Types.Core.GameConfig = {
        ...DEFAULT_GAME_CONFIG,
        ...config,
        parent: containerRef.current,
        scale: {
          ...DEFAULT_GAME_CONFIG.scale,
          ...(config?.scale || {}),
          parent: containerRef.current,
        },
      };

      // Create Phaser game instance
      const game = new Phaser.Game(gameConfig);
      gameRef.current = game;

      // Notify parent when game is ready
      if (onGameReady) {
        game.events.once('ready', () => {
          onGameReady(game);
        });
      }

      // Cleanup on unmount
      return () => {
        if (gameRef.current) {
          gameRef.current.destroy(true);
          gameRef.current = null;
        }
      };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
      <Box
        ref={containerRef}
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          // Ensure canvas fills container properly
          '& canvas': {
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
          },
        }}
        data-testid="game-container"
      />
    );
  }
);

GameContainer.displayName = 'GameContainer';

export default GameContainer;
