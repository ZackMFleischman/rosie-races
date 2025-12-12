import { useMemo, useCallback } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
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

  // Detect iPhone landscape mode (height <= 500px and width > height)
  // This triggers the horizontal layout with TAP button on the right
  const isPhoneLandscape = useMediaQuery('(max-height: 500px) and (orientation: landscape)');

  // TAP button should be disabled during ready and countdown states
  // It only becomes enabled once gameState is 'racing'
  const isTapButtonDisabled = gameState === 'ready' || gameState === 'countdown';

  // TAP button should bounce to attract attention when:
  // - The race is active (gameState === 'racing')
  // - No math problem is showing (currentProblem is null)
  // This helps young children understand they should be pressing the button
  const shouldTapButtonBounce = gameState === 'racing' && !currentProblem;

  // Show overlay before race starts (when "Tap to Start" is displayed in the game)
  const showPreRaceOverlay = gameState === 'ready';

  // Memoize game config to prevent recreation on re-renders
  const gameConfig = useMemo(
    () => ({
      scene: [RaceScene],
    }),
    []
  );

  // Phone landscape config - uses RESIZE mode to fill available space
  const gameConfigPhoneLandscape = useMemo(
    () => ({
      scene: [RaceScene],
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
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

  // Phone landscape layout: full-screen canvas with overlaid UI
  if (isPhoneLandscape) {
    return (
      <Box
        sx={{
          height: '100dvh',
          maxHeight: '100dvh',
          display: 'flex',
          position: 'relative',
          bgcolor: '#4CAF50', // Match canvas grass green background
          overflow: 'hidden',
        }}
      >
        {/* Full-screen game canvas */}
        <Box
          sx={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        >
          <GameContainer config={gameConfigPhoneLandscape} onGameReady={handleGameReady} />
        </Box>

        {/* Overlay: Title in top-left */}
        <Typography
          variant="h6"
          color="primary"
          sx={{
            position: 'absolute',
            top: 0,
            left: 12,
            fontSize: '1.5rem',
            fontWeight: 700,
            zIndex: 10,
            textShadow: '2px 2px 4px rgba(0,0,0,0.7), 0 0 8px rgba(0,0,0,0.5)',
          }}
        >
          Rosie Races
        </Typography>

        {/* Overlay: Timer in top-center */}
        <Box
          sx={{
            position: 'absolute',
            top: 15,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
          }}
        >
          <Timer isRunning={isRacing} compact />
        </Box>

        {/* Overlay: Volume control in bottom-right */}
        <VolumeControl bottomRight />

        {/* Overlay: TAP button on the right */}
        <Box
          sx={{
            position: 'absolute',
            right: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 10,
          }}
        >
          <TapButton onTap={handleTap} disabled={isTapButtonDisabled} small shouldBounce={shouldTapButtonBounce} />
        </Box>

        {/* Pre-race overlay */}
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
            <Box
              component="button"
              onClick={handleTap}
              sx={{
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                border: 'none',
                borderRadius: 3,
                px: 3,
                py: 1.5,
                fontSize: '1.2rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
                animation: 'pulse 1s ease-in-out infinite',
                '@keyframes pulse': {
                  '0%, 100%': { transform: 'scale(1)' },
                  '50%': { transform: 'scale(1.05)' },
                },
              }}
            >
              Tap to Start!
            </Box>
          </Box>
        )}

        {/* Math problem modal */}
        {currentProblem && (
          <MathModal problem={currentProblem} onAnswer={submitMathAnswer} compact />
        )}

        {/* Race results screen */}
        {raceResults && (
          <RaceResultsScreen results={raceResults} onRestart={handleRestart} compact />
        )}
      </Box>
    );
  }

  // Default layout for tablets and desktop (vertical stack)
  return (
    <Box
      sx={{
        height: '100dvh',
        maxHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
        overflow: 'hidden', // Prevent scrolling
      }}
    >
      {/* Volume control - always visible in top-right corner */}
      <VolumeControl />

      {/* Header area - title */}
      <Box
        component="header"
        sx={{
          py: { xs: 0.5, sm: 2 },
          px: { xs: 2, sm: 3 },
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <Typography
          variant="h4"
          color="primary"
          sx={{
            fontSize: { xs: '1.2rem', sm: '2rem', md: '2.25rem' },
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
          py: { xs: 0.5, sm: 2 },
          minHeight: 0, // Allows flex child to shrink
          overflow: 'hidden',
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
          py: { xs: 1, sm: 3 },
          px: { xs: 2, sm: 3 },
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <TapButton onTap={handleTap} disabled={isTapButtonDisabled} shouldBounce={shouldTapButtonBounce} />
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
