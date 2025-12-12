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
        justifyContent: 'flex-start',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        zIndex: 999, // Below timer (1000)
        pt: { xs: 8, sm: 10 }, // Account for timer at top
      }}
    >
      {/* Math problem card */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: { xs: 2, sm: 3 },
          p: { xs: 3, sm: 4 },
          borderRadius: 3,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          maxWidth: { xs: '95%', sm: '450px' },
          width: '100%',
        }}
      >
        {/* Question mark emoji */}
        <Typography
          component="span"
          sx={{
            fontSize: { xs: '2.5rem', sm: '3rem' },
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
            fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3rem' },
            color: 'text.primary',
            textAlign: 'center',
            fontFamily: '"Courier New", Courier, monospace',
          }}
        >
          {problem.question}
        </Typography>

        {/* Answer buttons - 2x2 grid at TOP of content */}
        <Grid container spacing={2} sx={{ maxWidth: { xs: '300px', sm: '400px' } }}>
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
                  py: { xs: 2, sm: 2.5 },
                  fontSize: { xs: '1.5rem', sm: '2rem' },
                  fontWeight: 700,
                  borderRadius: 2,
                  minHeight: { xs: '70px', sm: '80px' },
                  boxShadow: 3,
                  '&:hover': {
                    boxShadow: 5,
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
