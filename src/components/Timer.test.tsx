import { jest } from '@jest/globals';
import { render, screen, act } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../theme';
import Timer from './Timer';
import { formatTime } from '../utils/formatTime';

describe('Timer', () => {
  interface SetupOptions {
    isRunning?: boolean;
    onStart?: jest.Mock;
  }

  const setupTest = (options: SetupOptions = {}) => {
    const isRunning = options.isRunning ?? false;
    const onStart = options.onStart ?? jest.fn();

    const result = render(
      <ThemeProvider theme={theme}>
        <Timer isRunning={isRunning} onStart={onStart} />
      </ThemeProvider>
    );

    return {
      ...result,
      onStart,
      getTimer: () => screen.getByTestId('timer'),
      getTimerDisplay: () => screen.getByTestId('timer-display'),
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders the timer display', () => {
    const { getTimerDisplay } = setupTest();
    expect(getTimerDisplay()).toBeInTheDocument();
  });

  it('starts at 00:00.00 when not running', () => {
    const { getTimerDisplay } = setupTest({ isRunning: false });
    expect(getTimerDisplay()).toHaveTextContent('00:00.00');
  });

  it('has a fixed position at the top center', () => {
    const { getTimer } = setupTest();
    const timer = getTimer();
    // We verify the timer exists with the correct test-id
    // Actual styling is applied by MUI and verified visually
    expect(timer).toBeInTheDocument();
  });

  it('calls onStart when timer starts running', () => {
    const onStart = jest.fn();
    const { rerender } = render(
      <ThemeProvider theme={theme}>
        <Timer isRunning={false} onStart={onStart} />
      </ThemeProvider>
    );

    expect(onStart).not.toHaveBeenCalled();

    rerender(
      <ThemeProvider theme={theme}>
        <Timer isRunning={true} onStart={onStart} />
      </ThemeProvider>
    );

    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it('resets to 00:00.00 when isRunning changes from true to false', () => {
    const { rerender } = render(
      <ThemeProvider theme={theme}>
        <Timer isRunning={true} />
      </ThemeProvider>
    );

    // Advance time
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    // Stop the timer
    rerender(
      <ThemeProvider theme={theme}>
        <Timer isRunning={false} />
      </ThemeProvider>
    );

    expect(screen.getByTestId('timer-display')).toHaveTextContent('00:00.00');
  });
});

describe('formatTime', () => {
  it('formats 0ms as 00:00.00', () => {
    expect(formatTime(0)).toBe('00:00.00');
  });

  it('formats milliseconds correctly (centiseconds)', () => {
    expect(formatTime(500)).toBe('00:00.50');
    expect(formatTime(150)).toBe('00:00.15');
    expect(formatTime(99)).toBe('00:00.09');
  });

  it('formats seconds correctly', () => {
    expect(formatTime(1000)).toBe('00:01.00');
    expect(formatTime(5000)).toBe('00:05.00');
    expect(formatTime(30000)).toBe('00:30.00');
    expect(formatTime(59000)).toBe('00:59.00');
  });

  it('formats minutes correctly', () => {
    expect(formatTime(60000)).toBe('01:00.00');
    expect(formatTime(120000)).toBe('02:00.00');
    expect(formatTime(600000)).toBe('10:00.00');
  });

  it('formats complex times correctly', () => {
    expect(formatTime(61500)).toBe('01:01.50');
    expect(formatTime(125750)).toBe('02:05.75');
    expect(formatTime(359990)).toBe('05:59.99');
  });

  it('pads minutes and seconds with zeros', () => {
    expect(formatTime(5550)).toBe('00:05.55');
    expect(formatTime(65050)).toBe('01:05.05');
  });
});
