import { jest } from '@jest/globals';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../theme';
import MathModal, { type MathModalProps } from './MathModal';
import { type MathProblem } from '../game/systems/MathGenerator';

describe('MathModal', () => {
  const setupTest = (overrides?: Partial<MathModalProps>) => {
    const defaultProblem: MathProblem = {
      question: '5 + 3 = ?',
      answer: 8,
      choices: [8, 6, 9, 7],
    };

    const onAnswer = jest.fn();

    const props: MathModalProps = {
      problem: defaultProblem,
      onAnswer,
      ...overrides,
    };

    const renderResult = render(
      <ThemeProvider theme={theme}>
        <MathModal {...props} />
      </ThemeProvider>
    );

    return {
      ...renderResult,
      props,
      onAnswer,
      problem: props.problem,
    };
  };

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('rendering', () => {
    it('displays the math question', () => {
      setupTest();
      expect(screen.getByTestId('math-question')).toHaveTextContent('5 + 3 = ?');
    });

    it('renders 4 answer buttons', () => {
      setupTest();
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(4);
    });

    it('displays all answer choices on buttons', () => {
      const { problem } = setupTest();
      problem.choices.forEach((choice: number) => {
        expect(screen.getByText(choice.toString())).toBeInTheDocument();
      });
    });

    it('has correct accessibility structure', () => {
      setupTest();
      expect(screen.getByTestId('math-modal')).toBeInTheDocument();
      expect(screen.getByTestId('math-question')).toBeInTheDocument();
    });
  });

  describe('answer submission', () => {
    it('calls onAnswer with correct=true when correct answer clicked', () => {
      const { onAnswer } = setupTest();

      fireEvent.click(screen.getByText('8'));

      // Wait for the feedback delay
      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(onAnswer).toHaveBeenCalledWith(true, expect.any(Number));
    });

    it('calls onAnswer with correct=false when wrong answer clicked', () => {
      const { onAnswer } = setupTest();

      fireEvent.click(screen.getByText('6'));

      // Wait for the wrong answer delay (2000ms)
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      expect(onAnswer).toHaveBeenCalledWith(false, expect.any(Number));
    });

    it('disables buttons after an answer is selected', () => {
      setupTest();

      fireEvent.click(screen.getByText('8'));

      // All buttons should be disabled
      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toBeDisabled();
      });
    });

    it('prevents multiple answers', () => {
      const { onAnswer } = setupTest();

      fireEvent.click(screen.getByText('8'));
      fireEvent.click(screen.getByText('6')); // Try to click again

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      // Should only be called once
      expect(onAnswer).toHaveBeenCalledTimes(1);
    });
  });

  describe('visual feedback', () => {
    it('shows "AWESOME!" feedback for fast correct answer', () => {
      setupTest();

      fireEvent.click(screen.getByText('8'));

      expect(screen.getByTestId('feedback-text')).toHaveTextContent('AWESOME!');
    });

    it('shows "Good job!" feedback for slow correct answer', () => {
      setupTest();

      // Advance time to make it a slow answer (>3000ms)
      act(() => {
        jest.advanceTimersByTime(3500);
      });

      fireEvent.click(screen.getByText('8'));

      expect(screen.getByTestId('feedback-text')).toHaveTextContent('Good job!');
    });

    it('shows "Oops!" feedback for wrong answer', () => {
      setupTest();

      fireEvent.click(screen.getByText('6'));

      expect(screen.getByTestId('feedback-text')).toHaveTextContent('Oops!');
    });

    it('shows correct button in success color after correct answer', () => {
      setupTest();

      fireEvent.click(screen.getByText('8'));

      const correctButton = screen.getByText('8').closest('button');
      expect(correctButton).toHaveClass('MuiButton-containedSuccess');
    });

    it('shows selected wrong button in error color', () => {
      setupTest();

      fireEvent.click(screen.getByText('6'));

      const wrongButton = screen.getByText('6').closest('button');
      expect(wrongButton).toHaveClass('MuiButton-containedError');
    });

    it('shows correct answer in success color even when wrong answer selected', () => {
      setupTest();

      fireEvent.click(screen.getByText('6'));

      // The correct answer (8) should be highlighted
      const correctButton = screen.getByText('8').closest('button');
      expect(correctButton).toHaveClass('MuiButton-containedSuccess');
    });
  });

  describe('timing', () => {
    it('delays correct answer callback by 500ms', () => {
      const { onAnswer } = setupTest();

      fireEvent.click(screen.getByText('8'));

      // Not called immediately
      expect(onAnswer).not.toHaveBeenCalled();

      // Called after 500ms
      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(onAnswer).toHaveBeenCalled();
    });

    it('delays wrong answer callback by 2000ms', () => {
      const { onAnswer } = setupTest();

      fireEvent.click(screen.getByText('6'));

      // Not called at 500ms
      act(() => {
        jest.advanceTimersByTime(500);
      });
      expect(onAnswer).not.toHaveBeenCalled();

      // Not called at 1500ms
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      expect(onAnswer).not.toHaveBeenCalled();

      // Called at 2000ms
      act(() => {
        jest.advanceTimersByTime(500);
      });
      expect(onAnswer).toHaveBeenCalled();
    });

    it('includes time taken in callback', () => {
      const { onAnswer } = setupTest();

      // Advance time before clicking
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      fireEvent.click(screen.getByText('8'));

      act(() => {
        jest.advanceTimersByTime(500);
      });

      // Should include approximately 1000ms of elapsed time
      expect(onAnswer).toHaveBeenCalledWith(true, expect.any(Number));
      const timeTaken = onAnswer.mock.calls[0][1];
      expect(timeTaken).toBeGreaterThanOrEqual(1000);
    });
  });

  describe('problem changes', () => {
    it('resets state when problem changes', () => {
      const { rerender, onAnswer } = setupTest();

      // Answer first problem
      fireEvent.click(screen.getByText('8'));

      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(onAnswer).toHaveBeenCalledTimes(1);

      // Change problem
      const newProblem: MathProblem = {
        question: '2 + 2 = ?',
        answer: 4,
        choices: [4, 3, 5, 6],
      };

      rerender(
        <ThemeProvider theme={theme}>
          <MathModal problem={newProblem} onAnswer={onAnswer} />
        </ThemeProvider>
      );

      // Should show new question
      expect(screen.getByTestId('math-question')).toHaveTextContent('2 + 2 = ?');

      // Buttons should be enabled again
      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).not.toBeDisabled();
      });

      // Feedback should be hidden
      expect(screen.queryByTestId('feedback-text')).not.toBeInTheDocument();
    });
  });
});
