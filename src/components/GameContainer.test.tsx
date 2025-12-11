import { jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../theme';
import GameContainer from './GameContainer';
import * as Phaser from 'phaser';

interface MockGameConfig {
  width: number;
  height: number;
  scale: {
    mode: string;
    autoCenter: string;
    parent?: HTMLElement;
  };
}

interface MockGameInstance {
  destroy: jest.Mock;
  events: {
    once: jest.Mock;
    emit: jest.Mock;
  };
}

describe('GameContainer', () => {
  const setupTest = (props = {}) => {
    return render(
      <ThemeProvider theme={theme}>
        <GameContainer {...props} />
      </ThemeProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the container element', () => {
    setupTest();
    expect(screen.getByTestId('game-container')).toBeInTheDocument();
  });

  it('creates a Phaser game instance on mount', () => {
    setupTest();
    expect(Phaser.Game).toHaveBeenCalledTimes(1);
  });

  it('passes default config to Phaser', () => {
    setupTest();

    const GameMock = Phaser.Game as jest.Mock;
    const callArgs = GameMock.mock.calls[0][0] as MockGameConfig;
    expect(callArgs.width).toBe(1024);
    expect(callArgs.height).toBe(768);
    expect(callArgs.scale.mode).toBe(Phaser.Scale.FIT);
    expect(callArgs.scale.autoCenter).toBe(Phaser.Scale.CENTER_BOTH);
  });

  it('merges custom config with defaults', () => {
    const customConfig = {
      width: 800,
      height: 600,
    };

    setupTest({ config: customConfig });

    const GameMock = Phaser.Game as jest.Mock;
    const callArgs = GameMock.mock.calls[0][0] as MockGameConfig;
    expect(callArgs.width).toBe(800);
    expect(callArgs.height).toBe(600);
    // Scale config should still be present
    expect(callArgs.scale.mode).toBe(Phaser.Scale.FIT);
  });

  it('destroys game instance on unmount', () => {
    const { unmount } = setupTest();

    const GameMock = Phaser.Game as jest.Mock;
    const mockGameInstance = GameMock.mock.results[0].value as MockGameInstance;

    unmount();

    expect(mockGameInstance.destroy).toHaveBeenCalledWith(true);
  });
});
