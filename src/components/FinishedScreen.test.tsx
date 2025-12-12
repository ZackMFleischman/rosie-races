import { jest } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../theme';
import FinishedScreen from './FinishedScreen';

describe('FinishedScreen', () => {
  interface SetupOptions {
    finishTime?: number;
    onRestart?: jest.Mock;
  }

  const setupTest = (options: SetupOptions = {}) => {
    const finishTime = options.finishTime ?? 65430; // 1:05.43
    const onRestart = options.onRestart ?? jest.fn();

    const result = render(
      <ThemeProvider theme={theme}>
        <FinishedScreen finishTime={finishTime} onRestart={onRestart} />
      </ThemeProvider>
    );

    return {
      ...result,
      onRestart,
      getScreen: () => screen.getByTestId('finished-screen'),
      getTitle: () => screen.getByTestId('finished-title'),
      getTime: () => screen.getByTestId('finish-time'),
      getRestartButton: () => screen.getByTestId('race-again-button'),
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the finished screen overlay', () => {
    const { getScreen } = setupTest();
    expect(getScreen()).toBeInTheDocument();
  });

  it('displays "Finished!" title', () => {
    const { getTitle } = setupTest();
    expect(getTitle()).toHaveTextContent('Finished!');
  });

  it('displays the formatted finish time', () => {
    const { getTime } = setupTest({ finishTime: 65430 }); // 1:05.43
    expect(getTime()).toHaveTextContent('01:05.43');
  });

  it('displays zero time correctly', () => {
    const { getTime } = setupTest({ finishTime: 0 });
    expect(getTime()).toHaveTextContent('00:00.00');
  });

  it('displays time over 10 minutes correctly', () => {
    const { getTime } = setupTest({ finishTime: 612340 }); // 10:12.34
    expect(getTime()).toHaveTextContent('10:12.34');
  });

  it('renders the Race Again button', () => {
    const { getRestartButton } = setupTest();
    expect(getRestartButton()).toBeInTheDocument();
    expect(getRestartButton()).toHaveTextContent('Race Again');
  });

  it('calls onRestart when Race Again button is clicked', () => {
    const { getRestartButton, onRestart } = setupTest();

    fireEvent.click(getRestartButton());

    expect(onRestart).toHaveBeenCalledTimes(1);
  });

  it('has the Race Again button with proper role', () => {
    const { getRestartButton } = setupTest();
    expect(getRestartButton()).toHaveRole('button');
  });

  it('displays confetti emoji', () => {
    setupTest();
    expect(screen.getByText('🎉')).toBeInTheDocument();
  });

  it('displays "Your Time" label', () => {
    setupTest();
    expect(screen.getByText('Your Time')).toBeInTheDocument();
  });
});
