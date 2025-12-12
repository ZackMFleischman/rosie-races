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
  /** When true, renders a compact 2-column layout for phone landscape */
  compact?: boolean;
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
function RaceResultsScreen({ results, onRestart, compact = false }: RaceResultsScreenProps) {
  // Find Rosie's result
  const rosieResult = results.find((r) => r.isRosie);
  const rosiePosition = rosieResult?.position ?? 0;

  // Count finished racers - used directly for visibility (no state needed)
  const finishedCount = results.filter((r) => r.finishTime !== null).length;

  // Compact result row component for phone landscape
  const CompactResultRow = ({ result }: { result: RacerResult }) => {
    const isFinished = result.finishTime !== null;
    return (
      <Box
        data-testid={`result-row-${result.position ?? 'racing'}`}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
          p: 0.75,
          borderRadius: 1,
          backgroundColor: result.isRosie ? 'rgba(255, 105, 180, 0.2)' : 'rgba(0, 0, 0, 0.05)',
          border: result.isRosie ? '1px solid #ff69b4' : '1px solid transparent',
        }}
      >
        <Typography
          sx={{ fontWeight: 700, fontSize: '0.8rem', minWidth: '24px', color: 'text.secondary' }}
        >
          {result.position !== null ? getOrdinal(result.position) : '...'}
        </Typography>
        {result.avatar ? (
          <Box
            component="img"
            src={result.avatar}
            alt={result.name}
            sx={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              objectFit: 'cover',
              flexShrink: 0,
            }}
          />
        ) : (
          <Box
            sx={{
              width: 18,
              height: 18,
              borderRadius: '50%',
              backgroundColor: `#${result.color.toString(16).padStart(6, '0')}`,
              flexShrink: 0,
            }}
          />
        )}
        <Typography
          sx={{
            fontWeight: result.isRosie ? 700 : 500,
            fontSize: '0.75rem',
            flex: 1,
            color: result.isRosie ? 'primary.main' : 'text.primary',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {result.name}
        </Typography>
        <Typography
          sx={{
            fontFamily: 'monospace',
            fontSize: '0.7rem',
            color: 'text.secondary',
          }}
        >
          {isFinished ? formatTime(result.finishTime!) : '...'}
        </Typography>
        {isFinished && result.position !== null && result.position <= 3 && (
          <Typography sx={{ fontSize: '0.75rem' }}>{getMedal(result.position)}</Typography>
        )}
      </Box>
    );
  };

  // Compact 2-column layout for phone landscape
  if (compact) {
    const leftColumn = results.slice(0, 3);
    const rightColumn = results.slice(3, 6);

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
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          zIndex: 1100,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1,
            p: 1.5,
            borderRadius: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
            maxWidth: '90%',
            width: '440px',
          }}
        >
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography sx={{ fontSize: '1.2rem' }}>{getMedal(rosiePosition)}</Typography>
            <Typography
              data-testid="celebration-message"
              sx={{
                fontWeight: 800,
                fontSize: '1.5rem',
                color: rosiePosition === 1 ? '#d97706' : 'primary.main', // Amber instead of gold for contrast
                textShadow: rosiePosition === 1 ? '0 1px 0 rgba(0,0,0,0.2)' : 'none',
              }}
            >
              {getCelebrationMessage(rosiePosition)}
            </Typography>
          </Box>

          {/* 2-column results grid */}
          <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
            {/* Left column (1-3) */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.25 }}>
              {leftColumn.map((result) => (
                <CompactResultRow key={result.name} result={result} />
              ))}
            </Box>
            {/* Right column (4-6) */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.25 }}>
              {rightColumn.map((result) => (
                <CompactResultRow key={result.name} result={result} />
              ))}
            </Box>
          </Box>

          {/* Race Again button */}
          <Button
            variant="contained"
            color="primary"
            size="medium"
            onClick={onRestart}
            data-testid="race-again-button"
            sx={{
              mt: 1,
              px: 3,
              py: 1,
              fontSize: '0.9rem',
              fontWeight: 700,
              borderRadius: 2,
              textTransform: 'none',
              minHeight: '36px',
            }}
          >
            Race Again
          </Button>
        </Box>
      </Box>
    );
  }

  // Default layout for tablets and desktop
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
          gap: { xs: 1, sm: 2 },
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
              fontSize: { xs: '2rem', sm: '3rem' },
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
            fontSize: { xs: '1rem', sm: '1.4rem' },
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
            const isVisible = isFinished ? index < finishedCount : true;
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

                {/* Avatar */}
                {result.avatar ? (
                  <Box
                    component="img"
                    src={result.avatar}
                    alt={result.name}
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      backgroundColor: `#${result.color.toString(16).padStart(6, '0')}`,
                      flexShrink: 0,
                    }}
                  />
                )}

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
                    color: 'text.secondary',
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
            px: 6,
            py: 2,
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
            minWidth: '180px',
            minHeight: '56px',
          }}
        >
          Race Again
        </Button>
      </Box>
    </Box>
  );
}

export default RaceResultsScreen;
