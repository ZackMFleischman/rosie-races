import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useCallback, useState } from 'react';

interface TapButtonProps {
  onTap: () => void;
  disabled?: boolean;
}

/**
 * Large circular TAP button for the racing game.
 * Designed to be touch-friendly for young children (100px+ on mobile, 120px+ on larger screens).
 * Uses onPointerDown for instant response.
 */
function TapButton({ onTap, disabled = false }: TapButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault(); // Prevent touch scrolling
      if (disabled) return;

      setIsPressed(true);
      onTap();
    },
    [onTap, disabled]
  );

  const handlePointerUp = useCallback(() => {
    setIsPressed(false);
  }, []);

  const handlePointerLeave = useCallback(() => {
    setIsPressed(false);
  }, []);

  return (
    <Box
      component="button"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onPointerCancel={handlePointerLeave}
      disabled={disabled}
      data-testid="tap-button"
      sx={{
        // Size - large and touch-friendly
        width: { xs: 100, sm: 120 },
        height: { xs: 100, sm: 120 },
        minWidth: 100,
        minHeight: 100,

        // Shape
        borderRadius: '50%',
        border: 'none',

        // Colors
        bgcolor: disabled ? 'grey.400' : 'primary.main',
        color: 'primary.contrastText',

        // Layout
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',

        // Visual effects
        boxShadow: isPressed ? 2 : 4,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transform: isPressed ? 'scale(0.95)' : 'scale(1)',
        transition: 'all 0.1s ease-in-out',

        // Hover state (for desktop)
        '&:hover:not(:disabled)': {
          bgcolor: 'primary.dark',
        },

        // Focus state for accessibility
        '&:focus': {
          outline: '3px solid',
          outlineColor: 'primary.light',
          outlineOffset: 2,
        },

        // Prevent text selection
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation',
      }}
    >
      <Typography
        variant="h4"
        component="span"
        sx={{
          fontWeight: 700,
          fontSize: { xs: '1.5rem', sm: '1.75rem' },
          color: 'inherit',
          pointerEvents: 'none', // Ensure clicks pass through to button
        }}
      >
        TAP!
      </Typography>
    </Box>
  );
}

export default TapButton;
