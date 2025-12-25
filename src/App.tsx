import { useMemo, useCallback } from 'react';
import Box from '@mui/material/Box';
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

function RotationPrompt() {
  return (
    <Box
      className="app-viewport"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#4CAF50',
      }}
    >
      <Typography
        variant="h5"
        sx={{
          color: '#fff',
          textAlign: 'center',
          px: 3,
          textShadow: '0 2px 6px rgba(0,0,0,0.35)',
        }}
      >
        Please rotate your device to landscape mode to play Rosie Races.
      </Typography>
    </Box>
  );
}

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

  const phoneQueryMatch = useMediaQuery('(max-width: 850px)');
  const orientationQueryMatch = useMediaQuery('(orientation: landscape)', {
    defaultMatches: true,
    noSsr: true,
  });

  const fallbackLandscape =
    typeof window !== 'undefined' ? window.innerWidth >= window.innerHeight : true;
  const isLandscape = orientationQueryMatch || fallbackLandscape;

  const fallbackPhone = typeof window !== 'undefined' ? window.innerWidth <= 850 : false;
  const isPhone = phoneQueryMatch || fallbackPhone;
  const isPhoneLandscape = isPhone && isLandscape;

  const srOnlyStyles = {
    position: 'absolute' as const,
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: 'hidden',
    clip: 'rect(0 0 0 0)',
    whiteSpace: 'nowrap' as const,
    border: 0,
  };

  const isTapButtonDisabled = gameState === 'ready' || gameState === 'countdown';
  const shouldTapButtonBounce = gameState === 'racing' && !currentProblem;
  const showPreRaceOverlay = gameState === 'ready';
  const canTapAnywhere = gameState === 'racing' && !currentProblem && !raceResults;

  const phoneGameConfig = useMemo(
    () => ({
      scene: [RaceScene],
      backgroundColor: '#4CAF50',
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false,
        },
      },
    }),
    []
  );

  const fitGameConfig = useMemo(
    () => ({
      scene: [RaceScene],
      backgroundColor: '#4CAF50',
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1280,
        height: 720,
      },
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false,
        },
      },
    }),
    []
  );

  const handleGameReady = useCallback(
    (game: Phaser.Game) => {
      setGame(game);
    },
    [setGame]
  );

  const handleTap = useCallback(() => {
    emitTap();
  }, [emitTap]);

  const handleGlobalTap = useCallback(
    (event: React.PointerEvent) => {
      if (!canTapAnywhere) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest('[data-ignore-global-tap="true"]')) {
        return;
      }
      handleTap();
    },
    [canTapAnywhere, handleTap]
  );

  const handleRestart = useCallback(() => {
    emitRestart();
  }, [emitRestart]);

  if (!isLandscape) {
    return <RotationPrompt />;
  }

  if (isPhoneLandscape) {
    return (
      <Box
        className="app-viewport"
        sx={{
          display: 'flex',
          position: 'relative',
          bgcolor: '#4CAF50',
        }}
        onPointerDown={handleGlobalTap}
      >
        <Box component="header" sx={srOnlyStyles}>
          <Typography variant="h6">Rosie Races header landmark</Typography>
        </Box>

        <Box component="footer" sx={srOnlyStyles}>
          <Typography variant="body2">Footer</Typography>
        </Box>

        <Box component="main" sx={{ position: 'absolute', inset: 0 }}>
          <Box
            sx={{
              width: '100%',
              height: '100%',
              position: 'absolute',
              inset: 0,
            }}
          >
            <GameContainer config={phoneGameConfig} onGameReady={handleGameReady} />
          </Box>

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

        <VolumeControl bottomRight />

          <Box
            sx={{
              position: 'absolute',
              right: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
            }}
          >
            <TapButton
              onTap={handleTap}
              disabled={isTapButtonDisabled}
              small
              shouldBounce={shouldTapButtonBounce}
            />
          </Box>

        {showPreRaceOverlay && (
          <Box
            sx={{
              position: 'fixed',
              inset: 0,
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

          {currentProblem && <MathModal problem={currentProblem} onAnswer={submitMathAnswer} compact />}
          {raceResults && <RaceResultsScreen results={raceResults} onRestart={handleRestart} compact />}
        </Box>
      </Box>
    );
  }

  return (
    <Box
      className="app-viewport"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#4CAF50',
      }}
      onPointerDown={handleGlobalTap}
    >
      <VolumeControl bottomRight />

      <Box component="header" sx={srOnlyStyles}>
        <Typography variant="h6">Rosie Races header landmark</Typography>
      </Box>

      <Box
        component="main"
        sx={{
          flex: 1,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          px: { xs: 1, sm: 2 },
          pb: { xs: 2, sm: 3 },
        }}
      >
        <Box
          sx={{
            width: 'min(100%, 1280px)',
            aspectRatio: '16 / 9',
            position: 'relative',
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: 3,
            bgcolor: '#4CAF50',
          }}
        >
          <GameContainer config={fitGameConfig} onGameReady={handleGameReady} />

          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
            }}
          >
            <Typography
              variant="h4"
              color="primary"
              sx={{
                position: 'absolute',
                top: 12,
                left: 16,
                fontWeight: 700,
                textShadow: '2px 2px 4px rgba(0,0,0,0.7), 0 0 8px rgba(0,0,0,0.5)',
              }}
            >
              Rosie Races
            </Typography>

            <Box
              sx={{
                position: 'absolute',
                top: 16,
                left: '50%',
                transform: 'translateX(-50%)',
              }}
            >
              <Timer isRunning={isRacing} />
            </Box>

            <Box
              sx={{
                position: 'absolute',
                right: 24,
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'auto',
              }}
            >
              <TapButton
                onTap={handleTap}
                disabled={isTapButtonDisabled}
                shouldBounce={shouldTapButtonBounce}
              />
            </Box>
          </Box>
        </Box>
      </Box>

      {showPreRaceOverlay && (
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
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
              borderRadius: 4,
              px: { xs: 4, sm: 6 },
              py: { xs: 2, sm: 3 },
              fontSize: { xs: '1.5rem', sm: '2rem' },
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
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

      <Box component="footer" sx={srOnlyStyles}>
        <Typography variant="body2">Footer</Typography>
      </Box>

      {currentProblem && <MathModal problem={currentProblem} onAnswer={submitMathAnswer} />}
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
