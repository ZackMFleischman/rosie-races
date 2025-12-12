import { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { formatTime } from '../utils/formatTime';

export interface TimerProps {
  /** Whether the timer is running */
  isRunning: boolean;
  /** Callback when timer starts (optional) */
  onStart?: () => void;
  /** When true, renders a more compact timer for phone landscape header */
  compact?: boolean;
}

/**
 * Timer component - Always visible race timer at top of screen.
 * Timer runs independently of game state and never pauses.
 * Uses requestAnimationFrame for smooth, high-precision updates.
 */
function Timer({ isRunning, onStart, compact = false }: TimerProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const onStartCalledRef = useRef(false);

  useEffect(() => {
    if (isRunning) {
      if (startTimeRef.current === null) {
        startTimeRef.current = performance.now();
        if (!onStartCalledRef.current) {
          onStartCalledRef.current = true;
          onStart?.();
        }
      }

      const updateTimer = () => {
        if (startTimeRef.current !== null) {
          setElapsedTime(performance.now() - startTimeRef.current);
        }
        animationFrameRef.current = requestAnimationFrame(updateTimer);
      };
      animationFrameRef.current = requestAnimationFrame(updateTimer);
    } else {
      // When not running, cancel any animation frame
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      // Reset refs (don't call setState synchronously here)
      startTimeRef.current = null;
      onStartCalledRef.current = false;
    }

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRunning, onStart]);

  // Derive display time - show 0 when not running (avoids setState in effect)
  const displayTime = formatTime(isRunning ? elapsedTime : 0);

  return (
    <Box
      data-testid="timer"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: compact ? 0 : { xs: '4px', sm: '8px' },
        flexShrink: 0,
        // Fixed width container to prevent layout shift
        minWidth: compact ? '80px' : { xs: '100px', sm: '140px', md: '160px' },
      }}
    >
      <Typography
        data-testid="timer-display"
        variant="h3"
        sx={{
          // Use monospace font for stable digit widths (no jiggling)
          fontFamily: '"Courier New", Courier, monospace',
          fontWeight: 700,
          fontSize: compact ? '1.1rem' : { xs: '1.1rem', sm: '1.75rem', md: '2rem' },
          color: 'text.primary',
          // Text shadow for readability against any background
          textShadow: `
            2px 2px 0 #fff,
            -2px -2px 0 #fff,
            2px -2px 0 #fff,
            -2px 2px 0 #fff,
            0 2px 0 #fff,
            0 -2px 0 #fff,
            2px 0 0 #fff,
            -2px 0 0 #fff
          `,
          // Add slight glow effect
          filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))',
          // Ensure consistent character width
          letterSpacing: '0.02em',
        }}
      >
        {displayTime}
      </Typography>
    </Box>
  );
}

export default Timer;
