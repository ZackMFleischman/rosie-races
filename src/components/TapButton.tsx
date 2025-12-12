import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useCallback, useState } from 'react';

interface TapButtonProps {
  onTap: () => void;
  disabled?: boolean;
  /** When true, renders a 50% smaller button for phone landscape layout */
  small?: boolean;
}

/**
 * Large circular TAP button for the racing game.
 * Designed to be touch-friendly for young children (100px+ on mobile, 120px+ on larger screens).
 * Uses onPointerDown for instant response.
 */
function TapButton({ onTap, disabled = false, small = false }: TapButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  // Size configurations
  const buttonSize = small ? 80 : { xs: 80, sm: 100, md: 100 };
  const minSize = small ? 80 : { xs: 80, sm: 100 };
  const fontSize = small ? '1.2rem' : { xs: '1.5rem', sm: '1.85rem', md: '2.2rem' };

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
        // Size - responsive for different screen sizes
        // Uses small prop for phone landscape layout (50% smaller)
        width: buttonSize,
        height: buttonSize,
        minWidth: minSize,
        minHeight: minSize,

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
          fontSize: fontSize,
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
