import { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { formatTime } from '../utils/formatTime';
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
 * Supports partial results (some racers still racing).
 */
function RaceResultsScreen({ results, onRestart }: RaceResultsScreenProps) {
  // Find Rosie's result
  const rosieResult = results.find((r) => r.isRosie);
  const rosiePosition = rosieResult?.position ?? 0;

  // Count finished racers
  const finishedCount = results.filter((r) => r.finishTime !== null).length;

  // Track visible results - show all finished racers immediately
  const [visibleCount, setVisibleCount] = useState<number>(finishedCount);
  const lastFinishedCountRef = useRef(finishedCount);

  // Update visible count when more racers finish
  useEffect(() => {
    if (finishedCount > lastFinishedCountRef.current) {
      // New racer finished - animate them in
      setVisibleCount(finishedCount);
      lastFinishedCountRef.current = finishedCount;
    }
  }, [finishedCount]);

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
            const isFinished = result.finishTime !== null;
            const isVisible = isFinished ? index < visibleCount : true; // Show still-racing racers
            return (
              <Box
                key={`${result.name}-${result.position ?? 'racing'}`}
                data-testid={`result-row-${result.position ?? 'racing'}`}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  p: 1.5,
                  borderRadius: 2,
                  backgroundColor: result.isRosie
                    ? 'rgba(255, 105, 180, 0.2)'
                    : !isFinished
                      ? 'rgba(0, 0, 0, 0.02)'
                      : 'rgba(0, 0, 0, 0.05)',
                  border: result.isRosie ? '2px solid #ff69b4' : '1px solid transparent',
                  opacity: isVisible ? (isFinished ? 1 : 0.6) : 0,
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
                    color:
                      result.position !== null && result.position <= 3
                        ? 'primary.main'
                        : 'text.secondary',
                  }}
                >
                  {result.position !== null ? getOrdinal(result.position) : '...'}
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

                {/* Time or Racing indicator */}
                <Typography
                  sx={{
                    fontFamily: '"Courier New", Courier, monospace',
                    fontWeight: 600,
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                    color: isFinished ? 'text.secondary' : 'warning.main',
                    fontStyle: isFinished ? 'normal' : 'italic',
                  }}
                >
                  {isFinished ? formatTime(result.finishTime!) : 'Racing...'}
                </Typography>

                {/* Medal for top 3 (only if finished) */}
                {isFinished && result.position !== null && result.position <= 3 && (
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
