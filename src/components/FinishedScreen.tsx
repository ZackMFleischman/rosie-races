import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { formatTime } from '../utils/formatTime';

export interface FinishedScreenProps {
  /** Final race time in milliseconds */
  finishTime: number;
  /** Callback when Race Again button is clicked */
  onRestart: () => void;
}

/**
 * FinishedScreen - Overlay shown when the race is completed.
 * Displays the final time and a Race Again button.
 * Timer remains visible above this overlay.
 */
function FinishedScreen({ finishTime, onRestart }: FinishedScreenProps) {
  const displayTime = formatTime(finishTime);

  return (
    <Box
      data-testid="finished-screen"
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
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        zIndex: 1100, // Above timer (1000) and everything else
      }}
    >
      {/* Celebration content */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: { xs: 2, sm: 3 },
          p: { xs: 3, sm: 4 },
          borderRadius: 3,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          maxWidth: { xs: '90%', sm: '400px' },
        }}
      >
        {/* Confetti emoji */}
        <Typography
          component="span"
          sx={{
            fontSize: { xs: '3rem', sm: '4rem' },
            lineHeight: 1,
          }}
        >
          🎉
        </Typography>

        {/* FINISHED text */}
        <Typography
          variant="h2"
          data-testid="finished-title"
          sx={{
            fontWeight: 800,
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
            color: 'primary.main',
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          Finished!
        </Typography>

        {/* Final time */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography
            variant="body1"
            sx={{
              fontSize: { xs: '1rem', sm: '1.2rem' },
              color: 'text.secondary',
              mb: 0.5,
            }}
          >
            Your Time
          </Typography>
          <Typography
            variant="h3"
            data-testid="finish-time"
            sx={{
              fontFamily: '"Courier New", Courier, monospace',
              fontWeight: 700,
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              color: 'text.primary',
            }}
          >
            {displayTime}
          </Typography>
        </Box>

        {/* Race Again button */}
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={onRestart}
          data-testid="race-again-button"
          sx={{
            mt: 1,
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

export default FinishedScreen;
