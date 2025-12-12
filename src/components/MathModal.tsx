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
  /** When true, renders a much smaller modal for phone landscape */
  compact?: boolean;
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
function MathModal({ problem, onAnswer, compact = false }: MathModalProps) {
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

  // Compact layout for phone landscape - much smaller modal
  if (compact) {
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
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          zIndex: 999,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 0.75,
            p: 1.5,
            borderRadius: 2,
            backgroundColor: 'rgba(255, 255, 255, 1)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
            maxWidth: '70%',
            width: '280px',
          }}
        >
          {/* Emoji + Question on same row */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography component="span" sx={{ fontSize: '1.2rem' }}>
              🤔
            </Typography>
            <Typography
              data-testid="math-question"
              sx={{
                fontWeight: 800,
                fontSize: '1.1rem',
                color: 'text.primary',
                fontFamily: '"Courier New", Courier, monospace',
              }}
            >
              {problem.question}
            </Typography>
          </Box>

          {/* Answer buttons - 2x2 grid */}
          <Grid container spacing={0.75} sx={{ maxWidth: '220px' }}>
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
                    py: 0.75,
                    fontSize: '1rem',
                    fontWeight: 700,
                    borderRadius: 1.5,
                    minHeight: '40px',
                    boxShadow: 2,
                    '&:active': { transform: 'scale(0.95)' },
                  }}
                >
                  {choice}
                </Button>
              </Grid>
            ))}
          </Grid>

          {/* Feedback text */}
          <Box
            data-testid="feedback-text"
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.5,
              minHeight: '1rem',
              visibility: feedback !== 'none' ? 'visible' : 'hidden',
            }}
          >
            <Typography component="span" sx={{ fontSize: '0.7rem' }}>
              {feedbackInfo.emoji}
            </Typography>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: '0.65rem',
                color:
                  feedback === 'wrong'
                    ? 'error.main'
                    : feedback === 'correct-fast'
                      ? 'warning.main'
                      : 'success.main',
              }}
            >
              {feedbackInfo.text}
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  }

  // Default layout for tablets and desktop
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
        justifyContent: 'center', // Center vertically to use available space
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
          gap: { xs: 2, sm: 4 },
          p: { xs: 3, sm: 5 },
          borderRadius: 4,
          backgroundColor: 'rgba(255, 255, 255, 1)',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
          maxWidth: { xs: '90%', sm: '550px' },
          width: '100%',
        }}
      >
        {/* Question mark emoji */}
        <Typography
          component="span"
          sx={{
            fontSize: { xs: '2.5rem', sm: '4rem' },
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
            fontSize: { xs: '2rem', sm: '3.5rem', md: '4rem' },
            color: 'text.primary',
            textAlign: 'center',
            fontFamily: '"Courier New", Courier, monospace',
            whiteSpace: 'nowrap',
          }}
        >
          {problem.question}
        </Typography>

        {/* Answer buttons - 2x2 grid */}
        <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ maxWidth: { xs: '320px', sm: '480px' } }}>
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
                  py: { xs: 2, sm: 3.5 },
                  fontSize: { xs: '1.5rem', sm: '2.5rem' },
                  fontWeight: 700,
                  borderRadius: { xs: 2, sm: 3 },
                  minHeight: { xs: '70px', sm: '110px' },
                  boxShadow: 4,
                  '&:hover': {
                    boxShadow: 6,
                    transform: feedback === 'none' ? 'scale(1.05)' : 'none',
                  },
                  '&:active': {
                    transform: 'scale(0.95)',
                  },
                  transition: 'all 0.15s ease-in-out',
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

        {/* Feedback text - always rendered to reserve space, visibility controlled */}
        <Box
          data-testid="feedback-text"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            minHeight: { xs: '2rem', sm: '3rem' },
            visibility: feedback !== 'none' ? 'visible' : 'hidden',
          }}
        >
          <Typography
            component="span"
            sx={{
              fontSize: { xs: '1.2rem', sm: '2rem' },
            }}
          >
            {feedbackInfo.emoji}
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1rem', sm: '1.5rem' },
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
      </Box>
    </Box>
  );
}

export default MathModal;
