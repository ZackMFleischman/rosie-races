import { useState, useCallback, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { type MathProblem } from '../game/systems/MathGenerator';

// Time thresholds (in ms) for response feedback
const FAST_ANSWER_THRESHOLD = 3000;
const WRONG_ANSWER_DELAY = 2000;

export interface MathModalProps {
  /** The math problem to display */
  problem: MathProblem;
  /** Callback when an answer is submitted */
  onAnswer: (correct: boolean, timeTaken: number) => void;
}

type FeedbackState = 'none' | 'correct-fast' | 'correct-slow' | 'wrong';

interface MathModalState {
  problemId: string;
  feedback: FeedbackState;
  selectedAnswer: number | null;
}

// Create a stable ID for the problem
function getProblemId(problem: MathProblem): string {
  return `${problem.question}-${problem.answer}`;
}

/**
 * MathModal - Displays a math problem with multiple choice answers.
 * Shows visual feedback for correct/wrong answers.
 * Timer stays visible above this modal.
 */
function MathModal({ problem, onAnswer }: MathModalProps) {
  const problemId = getProblemId(problem);
  const [state, setState] = useState<MathModalState>(() => ({
    problemId,
    feedback: 'none',
    selectedAnswer: null,
  }));
  const startTimeRef = useRef<number>(0);

  // Reset state when problem changes (derived state during render pattern)
  // Note: We don't call performance.now() here - that happens in the effect below
  if (state.problemId !== problemId) {
    setState({
      problemId,
      feedback: 'none',
      selectedAnswer: null,
    });
  }

  // Set start time in an effect (impure functions are allowed in effects)
  useEffect(() => {
    startTimeRef.current = performance.now();
  }, [problemId]);

  const { feedback, selectedAnswer } = state;

  const handleAnswerClick = useCallback(
    (choice: number) => {
      if (feedback !== 'none') return; // Already answered

      const timeTaken = performance.now() - startTimeRef.current;
      const isCorrect = choice === problem.answer;

      if (isCorrect) {
        const feedbackType = timeTaken < FAST_ANSWER_THRESHOLD ? 'correct-fast' : 'correct-slow';
        setState((prev) => ({ ...prev, feedback: feedbackType, selectedAnswer: choice }));

        // Brief delay before closing
        setTimeout(() => {
          onAnswer(true, timeTaken);
        }, 500);
      } else {
        setState((prev) => ({ ...prev, feedback: 'wrong', selectedAnswer: choice }));

        // Longer delay for wrong answers (stumble effect)
        setTimeout(() => {
          onAnswer(false, timeTaken);
        }, WRONG_ANSWER_DELAY);
      }
    },
    [feedback, problem.answer, onAnswer]
  );

  const getFeedbackText = (): { text: string; emoji: string } => {
    switch (feedback) {
      case 'correct-fast':
        return { text: 'AWESOME!', emoji: '🌟' };
      case 'correct-slow':
        return { text: 'Good job!', emoji: '✓' };
      case 'wrong':
        return { text: 'Oops! Try to beat it next time!', emoji: '😅' };
      default:
        return { text: '', emoji: '' };
    }
  };

  const getButtonColor = (choice: number) => {
    if (selectedAnswer === null) return 'primary';
    if (choice === problem.answer) return 'success';
    if (choice === selectedAnswer) return 'error';
    return 'primary';
  };

  const feedbackInfo = getFeedbackText();

  return (
    <Box
      data-testid="math-modal"
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center', // Center the modal so it doesn't cover the timer
        backgroundColor: 'rgba(0, 0, 0, 0.25)', // Semi-transparent to see racers behind
        zIndex: 999, // Below timer (1000)
      }}
    >
      {/* Math problem card */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: { xs: 3, sm: 4 },
          p: { xs: 4, sm: 5 },
          borderRadius: 4,
          backgroundColor: 'rgba(255, 255, 255, 0.75)', // Slightly more transparent but high contrast
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
          maxWidth: { xs: '95%', sm: '550px' }, // Wider modal
          width: '100%',
        }}
      >
        {/* Question mark emoji */}
        <Typography
          component="span"
          sx={{
            fontSize: { xs: '3rem', sm: '4rem' }, // Bigger emoji
            lineHeight: 1,
          }}
        >
          🤔
        </Typography>

        {/* Math question */}
        <Typography
          variant="h2"
          data-testid="math-question"
          sx={{
            fontWeight: 800,
            fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' }, // Bigger question
            color: 'text.primary',
            textAlign: 'center',
            fontFamily: '"Courier New", Courier, monospace',
          }}
        >
          {problem.question}
        </Typography>

        {/* Answer buttons - 2x2 grid at TOP of content */}
        <Grid container spacing={3} sx={{ maxWidth: { xs: '350px', sm: '480px' } }}>
          {problem.choices.map((choice, index) => (
            <Grid size={{ xs: 6 }} key={index}>
              <Button
                variant="contained"
                color={getButtonColor(choice)}
                onClick={() => handleAnswerClick(choice)}
                disabled={feedback !== 'none'}
                data-testid={`answer-button-${index}`}
                data-choice={choice}
                sx={{
                  width: '100%',
                  py: { xs: 2.5, sm: 3.5 }, // Taller buttons
                  fontSize: { xs: '2rem', sm: '2.5rem' }, // Bigger text
                  fontWeight: 700,
                  borderRadius: 3,
                  minHeight: { xs: '90px', sm: '110px' }, // Much larger touch targets
                  boxShadow: 4,
                  '&:hover': {
                    boxShadow: 6,
                    transform: feedback === 'none' ? 'scale(1.05)' : 'none',
                  },
                  '&:active': {
                    transform: 'scale(0.95)',
                  },
                  transition: 'all 0.15s ease-in-out',
                  // Show visual feedback
                  ...(selectedAnswer === choice &&
                    feedback === 'correct-fast' && {
                      animation: 'pulse 0.3s ease-in-out',
                    }),
                  ...(selectedAnswer === choice &&
                    feedback === 'wrong' && {
                      animation: 'shake 0.3s ease-in-out',
                    }),
                  '@keyframes pulse': {
                    '0%, 100%': { transform: 'scale(1)' },
                    '50%': { transform: 'scale(1.1)' },
                  },
                  '@keyframes shake': {
                    '0%, 100%': { transform: 'translateX(0)' },
                    '25%': { transform: 'translateX(-5px)' },
                    '75%': { transform: 'translateX(5px)' },
                  },
                }}
              >
                {choice}
              </Button>
            </Grid>
          ))}
        </Grid>

        {/* Feedback text */}
        {feedback !== 'none' && (
          <Box
            data-testid="feedback-text"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mt: 1,
            }}
          >
            <Typography
              component="span"
              sx={{
                fontSize: { xs: '1.5rem', sm: '2rem' },
              }}
            >
              {feedbackInfo.emoji}
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color:
                  feedback === 'wrong'
                    ? 'error.main'
                    : feedback === 'correct-fast'
                      ? 'warning.main'
                      : 'success.main',
                textAlign: 'center',
              }}
            >
              {feedbackInfo.text}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default MathModal;
