import { useMemo, useCallback } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import GameContainer from './components/GameContainer';
import TapButton from './components/TapButton';
import Timer from './components/Timer';
import FinishedScreen from './components/FinishedScreen';
import { GameProvider } from './context/GameContext';
import { useGame } from './hooks/useGame';
import { RaceScene } from './game/scenes/RaceScene';
import * as Phaser from 'phaser';

/**
 * Inner app component that uses the game context
 */
function AppContent() {
  const { setGame, emitTap, emitRestart, isRacing, isFinished, finishTime } =
    useGame();

  // Memoize game config to prevent recreation on re-renders
  const gameConfig = useMemo(
    () => ({
      scene: [RaceScene],
    }),
    []
  );

  // Handle game ready - store reference in context
  const handleGameReady = useCallback(
    (game: Phaser.Game) => {
      setGame(game);
    },
    [setGame]
  );

  // Handle tap button press
  const handleTap = useCallback(() => {
    emitTap();
  }, [emitTap]);

  // Handle restart race
  const handleRestart = useCallback(() => {
    emitRestart();
  }, [emitRestart]);

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
      }}
    >
      {/* Timer - always visible at top, never pauses */}
      <Timer isRunning={isRacing} />

      {/* Header area - will contain timer and volume control */}
      <Box
        component="header"
        sx={{
          py: { xs: 1, sm: 2 },
          px: { xs: 2, sm: 3 },
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Typography
          variant="h4"
          color="primary"
          sx={{
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.25rem' },
          }}
        >
          Rosie Races
        </Typography>
      </Box>

      {/* Main game area - contains Phaser canvas */}
      <Box
        component="main"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          px: { xs: 1, sm: 2 },
          py: { xs: 1, sm: 2 },
          minHeight: 0, // Allows flex child to shrink
        }}
      >
        <Container
          maxWidth="lg"
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Game canvas container */}
          <Box
            sx={{
              width: '100%',
              maxWidth: { xs: '100%', sm: 600, md: 800, lg: 1024 },
              aspectRatio: '4/3',
              borderRadius: 2,
              overflow: 'hidden',
              boxShadow: 3,
            }}
          >
            <GameContainer config={gameConfig} onGameReady={handleGameReady} />
          </Box>
        </Container>
      </Box>

      {/* Footer area - TAP button */}
      <Box
        component="footer"
        sx={{
          py: { xs: 2, sm: 3 },
          px: { xs: 2, sm: 3 },
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <TapButton onTap={handleTap} />
      </Box>

      {/* Finished screen overlay */}
      {isFinished && finishTime !== null && (
        <FinishedScreen finishTime={finishTime} onRestart={handleRestart} />
      )}
    </Box>
  );
}

/**
 * Main App component with GameProvider wrapper
 */
function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}

export default App;
