import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useCallback, useState, useEffect, useRef } from 'react';

interface TapButtonProps {
  onTap: () => void;
  disabled?: boolean;
  /** When true, renders a 50% smaller button for phone landscape layout */
  small?: boolean;
  /** When true, shows a bounce animation to attract attention */
  shouldBounce?: boolean;
}

// Particle burst effect configuration
const PARTICLE_COUNT = 16;
const PARTICLE_COLORS = [
  '#FFD700',
  '#FFA500',
  '#FF69B4',
  '#87CEEB',
  '#98FB98',
  '#FF6B6B',
  '#4ECDC4',
];

interface Particle {
  id: number;
  angle: number;
  color: string;
  distance: number; // Random distance for varied burst
  size: number; // Random size for variety
  delay: number; // Staggered animation
}

/**
 * Large circular TAP button for the racing game.
 * Designed to be touch-friendly for young children (100px+ on mobile, 120px+ on larger screens).
 * Uses onPointerDown for instant response.
 */
function TapButton({
  onTap,
  disabled = false,
  small = false,
  shouldBounce = false,
}: TapButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const particleIdRef = useRef(0);

  // Size configurations
  const buttonSize = small ? 80 : { xs: 80, sm: 100, md: 100 };
  const minSize = small ? 80 : { xs: 80, sm: 100 };
  const fontSize = small ? '1.2rem' : { xs: '1.5rem', sm: '1.85rem', md: '2.2rem' };

  // Spawn particles on press
  const spawnParticles = useCallback(() => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Random angle with some variation for natural look
      const baseAngle = (360 / PARTICLE_COUNT) * i;
      const angleVariation = (Math.random() - 0.5) * 30; // +/- 15 degrees
      newParticles.push({
        id: particleIdRef.current++,
        angle: baseAngle + angleVariation,
        color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
        distance: 100 + Math.random() * 100, // 100-200px burst distance
        size: 3 + Math.random() * 6, // 3-9px size
        delay: Math.random() * 0.04, // 0-40ms stagger
      });
    }
    setParticles(newParticles);
  }, []);

  // Clear particles after animation completes
  useEffect(() => {
    if (particles.length > 0) {
      const timer = setTimeout(() => {
        setParticles([]);
      }, 400); // Match animation duration
      return () => clearTimeout(timer);
    }
  }, [particles]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault(); // Prevent touch scrolling
      if (disabled) return;

      setIsPressed(true);
      spawnParticles();
      onTap();
    },
    [onTap, disabled, spawnParticles]
  );

  const handlePointerUp = useCallback(() => {
    setIsPressed(false);
  }, []);

  const handlePointerLeave = useCallback(() => {
    setIsPressed(false);
  }, []);

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Particle burst effect - starts from button edge and bursts outward */}
      {particles.map((particle) => (
        <Box
          key={particle.id}
          component="span"
          style={
            {
              // Use inline styles for dynamic values
              '--particle-angle': `${particle.angle}deg`,
              '--particle-start': '-45px', // Start from button edge
              '--particle-end': `-${particle.distance}px`,
              animationDelay: `${particle.delay}s`,
            } as React.CSSProperties
          }
          sx={{
            position: 'absolute',
            width: particle.size,
            height: particle.size,
            borderRadius: '50%',
            bgcolor: particle.color,
            animation: 'particleBurst 0.4s ease-out forwards',
            pointerEvents: 'none',
            zIndex: 10, // In front so they're visible
            opacity: 0,
            '@keyframes particleBurst': {
              '0%': {
                opacity: 1,
                transform:
                  'rotate(var(--particle-angle)) translateY(var(--particle-start)) scale(1)',
              },
              '60%': {
                opacity: 1,
                transform:
                  'rotate(var(--particle-angle)) translateY(calc(var(--particle-end) * 0.7)) scale(0.7)',
              },
              '100%': {
                opacity: 0,
                transform:
                  'rotate(var(--particle-angle)) translateY(var(--particle-end)) scale(0.3)',
              },
            },
          }}
        />
      ))}

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

          // Visual effects - Enhanced press state
          boxShadow: isPressed
            ? '0 2px 4px rgba(0,0,0,0.2), inset 0 2px 4px rgba(0,0,0,0.2)'
            : '0 6px 12px rgba(0,0,0,0.3), 0 3px 6px rgba(0,0,0,0.2)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transform: isPressed ? 'scale(0.88) translateY(2px)' : 'scale(1)',
          transition: 'all 0.08s ease-out',

          // Bounce animation when player should be tapping
          ...(shouldBounce &&
            !disabled &&
            !isPressed && {
              animation: 'bounce 0.6s ease-in-out infinite',
              '@keyframes bounce': {
                '0%, 100%': {
                  transform: 'scale(1) translateY(0)',
                },
                '50%': {
                  transform: 'scale(1.08) translateY(-6px)',
                },
              },
            }),

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
            // Text also responds to press
            transform: isPressed ? 'scale(0.95)' : 'scale(1)',
            transition: 'transform 0.08s ease-out',
          }}
        >
          TAP!
        </Typography>
      </Box>
    </Box>
  );
}

export default TapButton;
