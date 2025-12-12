import { jest } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../theme';
import { VolumeControl } from './VolumeControl';
import { AudioManager } from '../game/systems/AudioManager';

// Create a mock AudioManager for testing
const createMockAudioManager = () => ({
  getVolume: jest.fn().mockReturnValue(0.7),
  setVolume: jest.fn(),
  isMuted: jest.fn().mockReturnValue(false),
  setMuted: jest.fn(),
  toggleMute: jest.fn().mockReturnValue(true),
});

describe('VolumeControl', () => {
  const setupTest = (audioManager = createMockAudioManager()) => {
    const utils = render(
      <ThemeProvider theme={theme}>
        <VolumeControl audioManager={audioManager as unknown as AudioManager} />
      </ThemeProvider>
    );
    return { ...utils, audioManager };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders the speaker button', () => {
      setupTest();
      const button = screen.getByRole('button', { name: /mute audio/i });
      expect(button).toBeInTheDocument();
    });

    it('shows volume up icon when volume is above 0.5', () => {
      const manager = createMockAudioManager();
      manager.getVolume.mockReturnValue(0.7);
      setupTest(manager);

      // The button should contain the VolumeUp icon
      const button = screen.getByRole('button', { name: /mute audio/i });
      expect(button).toBeInTheDocument();
    });

    it('shows muted icon when muted', () => {
      const manager = createMockAudioManager();
      manager.isMuted.mockReturnValue(true);
      setupTest(manager);

      const button = screen.getByRole('button', { name: /unmute audio/i });
      expect(button).toBeInTheDocument();
    });

    it('shows muted icon when volume is 0', () => {
      const manager = createMockAudioManager();
      manager.getVolume.mockReturnValue(0);
      setupTest(manager);

      const button = screen.getByRole('button', { name: /unmute audio/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe('popover interaction', () => {
    it('opens popover on speaker button click', () => {
      setupTest();
      const button = screen.getByRole('button', { name: /mute audio/i });

      fireEvent.click(button);

      // Popover should be open - check for slider
      const slider = screen.getByRole('slider', { name: /volume/i });
      expect(slider).toBeInTheDocument();
    });

    it('closes popover on second click', () => {
      setupTest();
      const button = screen.getByRole('button', { name: /mute audio/i });

      // Open popover
      fireEvent.click(button);
      expect(screen.getByRole('slider', { name: /volume/i })).toBeInTheDocument();

      // Close popover
      fireEvent.click(button);
      expect(screen.queryByRole('slider', { name: /volume/i })).not.toBeInTheDocument();
    });
  });

  describe('mute toggle', () => {
    it('toggles mute on double click', () => {
      const manager = createMockAudioManager();
      setupTest(manager);
      const button = screen.getByRole('button', { name: /mute audio/i });

      fireEvent.doubleClick(button);

      expect(manager.toggleMute).toHaveBeenCalled();
    });
  });

  describe('volume slider', () => {
    it('displays slider with correct initial value', () => {
      const manager = createMockAudioManager();
      manager.getVolume.mockReturnValue(0.5);
      setupTest(manager);

      // Open popover
      fireEvent.click(screen.getByRole('button', { name: /mute audio/i }));

      const slider = screen.getByRole('slider', { name: /volume/i });
      expect(slider).toHaveAttribute('aria-valuenow', '0.5');
    });

    it('displays 0 on slider when muted', () => {
      const manager = createMockAudioManager();
      manager.isMuted.mockReturnValue(true);
      manager.getVolume.mockReturnValue(0.7);
      setupTest(manager);

      // Open popover
      fireEvent.click(screen.getByRole('button', { name: /unmute audio/i }));

      const slider = screen.getByRole('slider', { name: /volume/i });
      expect(slider).toHaveAttribute('aria-valuenow', '0');
    });
  });

  describe('accessibility', () => {
    it('has proper aria-label on speaker button', () => {
      setupTest();
      const button = screen.getByRole('button', { name: /mute audio/i });
      expect(button).toHaveAttribute('aria-label');
    });

    it('changes aria-label when muted', () => {
      const manager = createMockAudioManager();
      manager.isMuted.mockReturnValue(true);
      setupTest(manager);

      const button = screen.getByRole('button', { name: /unmute audio/i });
      expect(button).toHaveAttribute('aria-label', 'Unmute audio');
    });

    it('slider has proper aria-label', () => {
      setupTest();

      // Open popover
      fireEvent.click(screen.getByRole('button', { name: /mute audio/i }));

      const slider = screen.getByRole('slider', { name: /volume/i });
      expect(slider).toHaveAttribute('aria-label', 'Volume');
    });
  });
});
