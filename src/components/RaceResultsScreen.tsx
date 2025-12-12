import { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { formatTime } from './Timer';
import type { RacerResult } from '../game/events';

export interface RaceResultsScreenProps {
  /** Array of race results sorted by position */
  results: RacerResult[];
  /** Callback when Race Again button is clicked */
  onRestart: () => void;
}

/**
 * Get the medal emoji for a position
 */
function getMedal(position: number): string {
  switch (position) {
    case 1:
      return '🥇';
    case 2:
      return '🥈';
    case 3:
      return '🥉';
    default:
      return '🎗️';
  }
}

/**
 * Get ordinal suffix for a number (1st, 2nd, 3rd, etc.)
 */
function getOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/**
 * Get celebration message based on Rosie's position
 */
function getCelebrationMessage(position: number): string {
  switch (position) {
    case 1:
      return 'WINNER!';
    case 2:
      return 'Great job!';
    case 3:
      return 'Good effort!';
    default:
      return 'Keep trying!';
  }
}

/**
 * RaceResultsScreen - Mario Kart-style race results overlay.
 * Shows all racers in finish order with times and medals.
 */
function RaceResultsScreen({ results, onRestart }: RaceResultsScreenProps) {
  // Find Rosie's result
  const rosieResult = results.find((r) => r.isRosie);
  const rosiePosition = rosieResult?.position ?? 0;

  // Track visible results with ref to avoid lint warning about setState in effect
  const [visibleCount, setVisibleCount] = useState<number>(0);
  const resultsRef = useRef(results);

  // Animate results appearing one by one
  useEffect(() => {
    // Reset when results change
    if (resultsRef.current !== results) {
      resultsRef.current = results;
      // Use timeout to avoid synchronous setState in effect
      const resetTimer = setTimeout(() => setVisibleCount(1), 300);
      return () => clearTimeout(resetTimer);
    }

    // Continue animation
    if (visibleCount > 0 && visibleCount < results.length) {
      const timer = setTimeout(() => {
        setVisibleCount((prev) => prev + 1);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [visibleCount, results]);

  return (
    <Box
      data-testid="race-results-screen"
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        zIndex: 1100,
      }}
    >
      {/* Results content */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: { xs: 1.5, sm: 2 },
          p: { xs: 2, sm: 3 },
          borderRadius: 3,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          maxWidth: { xs: '95%', sm: '450px' },
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* Header with medal and message */}
        <Box sx={{ textAlign: 'center', mb: 1 }}>
          <Typography
            component="span"
            sx={{
              fontSize: { xs: '2.5rem', sm: '3rem' },
              lineHeight: 1,
            }}
          >
            {getMedal(rosiePosition)}
          </Typography>
          <Typography
            variant="h3"
            data-testid="celebration-message"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '1.5rem', sm: '2rem' },
              color: rosiePosition === 1 ? 'gold' : 'primary.main',
              textAlign: 'center',
            }}
          >
            {getCelebrationMessage(rosiePosition)}
          </Typography>
        </Box>

        {/* Results title */}
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            fontSize: { xs: '1.2rem', sm: '1.4rem' },
            color: 'text.secondary',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}
        >
          Race Results
        </Typography>

        {/* Results list */}
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          {results.map((result, index) => {
            const isVisible = index < visibleCount;
            return (
              <Box
                key={`${result.name}-${result.position}`}
                data-testid={`result-row-${result.position}`}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  p: 1.5,
                  borderRadius: 2,
                  backgroundColor: result.isRosie
                    ? 'rgba(255, 105, 180, 0.2)'
                    : 'rgba(0, 0, 0, 0.05)',
                  border: result.isRosie ? '2px solid #ff69b4' : '1px solid transparent',
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateX(0)' : 'translateX(-20px)',
                  transition: 'all 0.3s ease-out',
                }}
              >
                {/* Position */}
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: { xs: '1rem', sm: '1.1rem' },
                    minWidth: '36px',
                    color: result.position <= 3 ? 'primary.main' : 'text.secondary',
                  }}
                >
                  {getOrdinal(result.position)}
                </Typography>

                {/* Avatar circle */}
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: `#${result.color.toString(16).padStart(6, '0')}`,
                    flexShrink: 0,
                  }}
                />

                {/* Name */}
                <Typography
                  sx={{
                    fontWeight: result.isRosie ? 700 : 500,
                    fontSize: { xs: '1rem', sm: '1.1rem' },
                    flex: 1,
                    color: result.isRosie ? 'primary.main' : 'text.primary',
                  }}
                >
                  {result.name}
                  {result.isRosie && ' ⭐'}
                </Typography>

                {/* Time */}
                <Typography
                  sx={{
                    fontFamily: '"Courier New", Courier, monospace',
                    fontWeight: 600,
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                    color: 'text.secondary',
                  }}
                >
                  {formatTime(result.finishTime)}
                </Typography>

                {/* Medal for top 3 */}
                {result.position <= 3 && (
                  <Typography sx={{ fontSize: '1.2rem' }}>{getMedal(result.position)}</Typography>
                )}
              </Box>
            );
          })}
        </Box>

        {/* Race Again button */}
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={onRestart}
          data-testid="race-again-button"
          sx={{
            mt: 2,
            px: { xs: 4, sm: 6 },
            py: { xs: 1.5, sm: 2 },
            fontSize: { xs: '1.1rem', sm: '1.3rem' },
            fontWeight: 700,
            borderRadius: 3,
            textTransform: 'none',
            boxShadow: 3,
            '&:hover': {
              boxShadow: 5,
              transform: 'scale(1.02)',
            },
            '&:active': {
              transform: 'scale(0.98)',
            },
            transition: 'all 0.15s ease-in-out',
            minWidth: { xs: '150px', sm: '180px' },
            minHeight: { xs: '48px', sm: '56px' },
          }}
        >
          Race Again
        </Button>
      </Box>
    </Box>
  );
}

export default RaceResultsScreen;
