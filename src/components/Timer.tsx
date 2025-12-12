import { useEffect, useRef, useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export interface TimerProps {
  /** Whether the timer is running */
  isRunning: boolean;
  /** Callback when timer starts (optional) */
  onStart?: () => void;
}

/**
 * Formats elapsed time in milliseconds to MM:SS.ms format
 */
export function formatTime(elapsedMs: number): string {
  const totalSeconds = Math.floor(elapsedMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = Math.floor((elapsedMs % 1000) / 10); // Show centiseconds

  const paddedMinutes = minutes.toString().padStart(2, '0');
  const paddedSeconds = seconds.toString().padStart(2, '0');
  const paddedMs = milliseconds.toString().padStart(2, '0');

  return `${paddedMinutes}:${paddedSeconds}.${paddedMs}`;
}

/**
 * Timer component - Always visible race timer at top of screen.
 * Timer runs independently of game state and never pauses.
 * Uses requestAnimationFrame for smooth, high-precision updates.
 */
function Timer({ isRunning, onStart }: TimerProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const hasStartedRef = useRef(false);

  const updateTimer = useCallback(() => {
    if (startTimeRef.current !== null) {
      const now = performance.now();
      setElapsedTime(now - startTimeRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(updateTimer);
  }, []);

  useEffect(() => {
    if (isRunning && !hasStartedRef.current) {
      // Start the timer
      startTimeRef.current = performance.now();
      hasStartedRef.current = true;
      animationFrameRef.current = requestAnimationFrame(updateTimer);
      onStart?.();
    } else if (!isRunning && hasStartedRef.current) {
      // Reset timer when race resets
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      startTimeRef.current = null;
      hasStartedRef.current = false;
      setElapsedTime(0);
    }

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRunning, updateTimer, onStart]);

  const displayTime = formatTime(elapsedTime);

  return (
    <Box
      data-testid="timer"
      sx={{
        position: 'fixed',
        top: { xs: 8, sm: 10 },
        right: { xs: 12, sm: 20 },
        zIndex: 1000, // Stay above modals
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // Fixed width container to prevent layout shift
        minWidth: { xs: '120px', sm: '140px', md: '160px' },
      }}
    >
      <Typography
        data-testid="timer-display"
        variant="h3"
        sx={{
          // Use monospace font for stable digit widths (no jiggling)
          fontFamily: '"Courier New", Courier, monospace',
          fontWeight: 700,
          fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
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
