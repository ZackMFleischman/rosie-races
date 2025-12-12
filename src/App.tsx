import { useMemo, useCallback } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import GameContainer from './components/GameContainer';
import TapButton from './components/TapButton';
import Timer from './components/Timer';
import RaceResultsScreen from './components/RaceResultsScreen';
import MathModal from './components/MathModal';
import VolumeControl from './components/VolumeControl';
import { GameProvider } from './context/GameContext';
import { useGame } from './hooks/useGame';
import { RaceScene } from './game/scenes/RaceScene';
import * as Phaser from 'phaser';

/**
 * Inner app component that uses the game context
 */
function AppContent() {
  const {
    setGame,
    emitTap,
    emitRestart,
    isRacing,
    currentProblem,
    submitMathAnswer,
    raceResults,
    gameState,
  } = useGame();

  // TAP button should be disabled during ready and countdown states
  // It only becomes enabled once gameState is 'racing'
  const isTapButtonDisabled = gameState === 'ready' || gameState === 'countdown';

  // Show overlay before race starts (when "Tap to Start" is displayed in the game)
  const showPreRaceOverlay = gameState === 'ready';

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
      {/* Volume control - always visible in top-right corner */}
      <VolumeControl />

      {/* Header area - title */}
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

      {/* Timer - positioned above gameplay area */}
      <Timer isRunning={isRacing} />

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
        <TapButton onTap={handleTap} disabled={isTapButtonDisabled} />
      </Box>

      {/* Pre-race overlay - darkens screen until user taps "Tap to Start" */}
      {showPreRaceOverlay && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1100,
          }}
        >
          {/* Tap to Start button - centered via flexbox */}
          <Box
            component="button"
            onClick={handleTap}
            sx={{
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              border: 'none',
              borderRadius: 4,
              px: { xs: 4, sm: 6 },
              py: { xs: 2, sm: 3 },
              fontSize: { xs: '1.5rem', sm: '2rem' },
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              // Pulsing animation using scale only (no translate)
              animation: 'pulse 1s ease-in-out infinite',
              '@keyframes pulse': {
                '0%, 100%': {
                  transform: 'scale(1)',
                },
                '50%': {
                  transform: 'scale(1.05)',
                },
              },
              '&:hover': {
                bgcolor: 'primary.dark',
                animation: 'none',
                transform: 'scale(1.08)',
              },
              '&:active': {
                animation: 'none',
                transform: 'scale(0.95)',
              },
            }}
          >
            Tap to Start!
          </Box>
        </Box>
      )}

      {/* Math problem modal */}
      {currentProblem && <MathModal problem={currentProblem} onAnswer={submitMathAnswer} />}

      {/* Race results screen - shown when Rosie finishes (updates as others finish) */}
      {raceResults && <RaceResultsScreen results={raceResults} onRestart={handleRestart} />}
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
