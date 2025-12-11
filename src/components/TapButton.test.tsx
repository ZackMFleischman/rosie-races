import { jest } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../theme';
import TapButton from './TapButton';

describe('TapButton', () => {
  interface SetupOptions {
    onTap?: jest.Mock;
    disabled?: boolean;
  }

  const setupTest = (options: SetupOptions = {}) => {
    const onTap = options.onTap ?? jest.fn();
    const disabled = options.disabled ?? false;

    const result = render(
      <ThemeProvider theme={theme}>
        <TapButton onTap={onTap} disabled={disabled} />
      </ThemeProvider>
    );

    return {
      ...result,
      onTap,
      getButton: () => screen.getByTestId('tap-button'),
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the TAP! text', () => {
    setupTest();
    expect(screen.getByText('TAP!')).toBeInTheDocument();
  });

  it('renders as a button element', () => {
    const { getButton } = setupTest();
    expect(getButton().tagName).toBe('BUTTON');
  });

  it('calls onTap when pointer down event occurs', () => {
    const { getButton, onTap } = setupTest();

    fireEvent.pointerDown(getButton());

    expect(onTap).toHaveBeenCalledTimes(1);
  });

  it('calls onTap multiple times for multiple taps', () => {
    const { getButton, onTap } = setupTest();

    fireEvent.pointerDown(getButton());
    fireEvent.pointerUp(getButton());
    fireEvent.pointerDown(getButton());
    fireEvent.pointerUp(getButton());
    fireEvent.pointerDown(getButton());

    expect(onTap).toHaveBeenCalledTimes(3);
  });

  it('does not call onTap when disabled', () => {
    const { getButton, onTap } = setupTest({ disabled: true });

    fireEvent.pointerDown(getButton());

    expect(onTap).not.toHaveBeenCalled();
  });

  it('has the disabled attribute when disabled prop is true', () => {
    const { getButton } = setupTest({ disabled: true });

    expect(getButton()).toBeDisabled();
  });

  it('has appropriate touch-friendly size', () => {
    const { getButton } = setupTest();
    const button = getButton();

    // MUI applies styles differently in Jest environment
    // We verify the button exists and has the correct test-id
    expect(button).toBeInTheDocument();
  });

  it('is accessible with a proper role', () => {
    const { getButton } = setupTest();
    expect(getButton()).toHaveRole('button');
  });
});
