import { useState, useCallback, useEffect } from 'react';
import { Box, IconButton, Slider, Popover, styled } from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import VolumeDownIcon from '@mui/icons-material/VolumeMute';
import { AudioManager } from '../game/systems/AudioManager';

/** Volume slider container with custom styling */
const VolumeSliderContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: 60,
  height: 180,
}));

/** Styled volume slider for touch-friendly interaction */
const VolumeSlider = styled(Slider)(({ theme }) => ({
  color: theme.palette.primary.main,
  height: 120,
  '& .MuiSlider-track': {
    width: 8,
  },
  '& .MuiSlider-rail': {
    width: 8,
  },
  '& .MuiSlider-thumb': {
    width: 24,
    height: 24,
    '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
      boxShadow: `0 0 0 8px ${theme.palette.primary.main}30`,
    },
  },
}));

/** Speaker icon button with proper sizing */
const SpeakerButton = styled(IconButton)(({ theme }) => ({
  position: 'fixed',
  top: theme.spacing(1),
  right: theme.spacing(1),
  zIndex: 1100,
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[2],
  '&:hover': {
    backgroundColor: theme.palette.background.paper,
  },
}));

export interface VolumeControlProps {
  audioManager?: AudioManager;
  /** Position the button at the bottom-right instead of top-right */
  bottomRight?: boolean;
}

/**
 * VolumeControl component - Speaker icon with volume slider popup
 *
 * Features:
 * - Speaker icon in top-right corner (changes based on volume/mute state)
 * - Tap to show/hide vertical volume slider
 * - Double-tap or long-press to toggle mute
 * - Volume persisted to localStorage via AudioManager
 */
export function VolumeControl({ audioManager, bottomRight = false }: VolumeControlProps) {
  const manager = audioManager ?? AudioManager.getInstance();

  // Local state for UI updates
  const [volume, setVolume] = useState(manager.getVolume());
  const [muted, setMuted] = useState(manager.isMuted());
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  // Keep UI in sync with AudioManager
  useEffect(() => {
    setVolume(manager.getVolume());
    setMuted(manager.isMuted());
  }, [manager]);

  // Handle speaker icon click - show/hide slider
  const handleSpeakerClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl((prev) => (prev ? null : event.currentTarget));
  }, []);

  // Handle double-click to toggle mute
  const handleSpeakerDoubleClick = useCallback(() => {
    const newMuted = manager.toggleMute();
    setMuted(newMuted);
  }, [manager]);

  // Handle volume slider change
  const handleVolumeChange = useCallback(
    (_event: Event, newValue: number | number[]) => {
      const newVolume = Array.isArray(newValue) ? newValue[0] : newValue;
      manager.setVolume(newVolume);
      setVolume(newVolume);

      // Unmute if adjusting volume while muted
      if (muted && newVolume > 0) {
        manager.setMuted(false);
        setMuted(false);
      }
    },
    [manager, muted]
  );

  // Handle popover close
  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  // Determine which speaker icon to show
  const getSpeakerIcon = () => {
    if (muted || volume === 0) {
      return <VolumeOffIcon />;
    }
    if (volume < 0.5) {
      return <VolumeDownIcon />;
    }
    return <VolumeUpIcon />;
  };

  const open = Boolean(anchorEl);
  const id = open ? 'volume-popover' : undefined;

  return (
    <>
      <SpeakerButton
        aria-describedby={id}
        onClick={handleSpeakerClick}
        onDoubleClick={handleSpeakerDoubleClick}
        aria-label={muted || volume === 0 ? 'Unmute audio' : 'Mute audio'}
        size="large"
        sx={bottomRight ? { top: 'auto', bottom: 8 } : undefined}
        data-ignore-global-tap="true"
      >
        {getSpeakerIcon()}
      </SpeakerButton>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: bottomRight ? 'top' : 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: bottomRight ? 'bottom' : 'top',
          horizontal: 'center',
        }}
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              mt: 1,
            },
            'data-ignore-global-tap': 'true',
          },
        }}
      >
        <VolumeSliderContainer data-ignore-global-tap="true">
          <VolumeSlider
            value={muted ? 0 : volume}
            onChange={handleVolumeChange}
            orientation="vertical"
            min={0}
            max={1}
            step={0.01}
            aria-label="Volume"
          />
          <IconButton
            onClick={handleSpeakerDoubleClick}
            aria-label={muted ? 'Unmute' : 'Mute'}
            size="small"
            sx={{ mt: 1 }}
          >
            {getSpeakerIcon()}
          </IconButton>
        </VolumeSliderContainer>
      </Popover>
    </>
  );
}

export default VolumeControl;
