/**
 * Math Problem Generator for Rosie Races checkpoints
 * Generates configurable math problems with multiple choice answers
 */

export type Operation = 'add' | 'subtract' | 'multiply';

export interface MathConfig {
  operations: Operation[];
  maxNumber: number;
  numTerms: number;
}

export interface MathProblem {
  question: string;
  answer: number;
  choices: number[];
}

// Default configuration for easy difficulty
export const DEFAULT_MATH_CONFIG: MathConfig = {
  operations: ['add'],
  maxNumber: 10,
  numTerms: 2,
};

/**
 * Generates a random integer between min and max (inclusive)
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Shuffles an array in place using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Gets the operator symbol for display
 */
function getOperatorSymbol(operation: Operation): string {
  switch (operation) {
    case 'add':
      return '+';
    case 'subtract':
      return '-';
    case 'multiply':
      return '×';
  }
}

/**
 * Performs the mathematical operation
 */
function performOperation(a: number, b: number, operation: Operation): number {
  switch (operation) {
    case 'add':
      return a + b;
    case 'subtract':
      return a - b;
    case 'multiply':
      return a * b;
  }
}

/**
 * Generates operands suitable for the given operation
 */
function generateOperands(operation: Operation, maxNumber: number, numTerms: number): number[] {
  const operands: number[] = [];

  if (operation === 'subtract') {
    // For subtraction, ensure result is positive (a >= b for 2 terms)
    // Generate largest number first, then smaller ones
    const firstNum = randomInt(Math.ceil(maxNumber / 2), maxNumber);
    operands.push(firstNum);

    let remaining = firstNum;
    for (let i = 1; i < numTerms; i++) {
      const maxSubtract = Math.floor(remaining / (numTerms - i));
      const num = randomInt(0, Math.min(maxSubtract, maxNumber));
      operands.push(num);
      remaining -= num;
    }
  } else if (operation === 'multiply') {
    // For multiplication, use smaller numbers to keep products manageable
    const multiplyMax = Math.min(maxNumber, 10);
    for (let i = 0; i < numTerms; i++) {
      operands.push(randomInt(1, multiplyMax));
    }
  } else {
    // Addition: any numbers within range
    for (let i = 0; i < numTerms; i++) {
      operands.push(randomInt(1, maxNumber));
    }
  }

  return operands;
}

/**
 * Calculates the answer from operands and operation
 */
function calculateAnswer(operands: number[], operation: Operation): number {
  return operands.reduce((acc, num, index) => {
    if (index === 0) return num;
    return performOperation(acc, num, operation);
  });
}

/**
 * Builds the question string from operands and operation
 */
function buildQuestion(operands: number[], operation: Operation): string {
  const symbol = getOperatorSymbol(operation);
  return operands.join(` ${symbol} `) + ' = ?';
}

/**
 * Generates 3 wrong answers that are unique and positive
 */
function generateWrongAnswers(correctAnswer: number): number[] {
  const wrongAnswers: Set<number> = new Set();

  // Generate wrong answers by adding/subtracting small random amounts
  const attempts = 0;
  const maxAttempts = 100;

  while (wrongAnswers.size < 3 && attempts < maxAttempts) {
    // Generate offsets that are close to the correct answer
    const offset = randomInt(1, 5) * (Math.random() > 0.5 ? 1 : -1);
    const wrongAnswer = correctAnswer + offset;

    // Ensure positive, unique, and not equal to correct answer
    if (wrongAnswer > 0 && wrongAnswer !== correctAnswer && !wrongAnswers.has(wrongAnswer)) {
      wrongAnswers.add(wrongAnswer);
    }
  }

  // Fallback: if we couldn't generate enough unique wrong answers, use sequential values
  let fallbackOffset = 1;
  while (wrongAnswers.size < 3) {
    const fallbackAnswer = correctAnswer + fallbackOffset;
    if (
      fallbackAnswer > 0 &&
      fallbackAnswer !== correctAnswer &&
      !wrongAnswers.has(fallbackAnswer)
    ) {
      wrongAnswers.add(fallbackAnswer);
    }
    fallbackOffset = fallbackOffset > 0 ? -fallbackOffset : -fallbackOffset + 1;
  }

  return Array.from(wrongAnswers);
}

/**
 * Generates a math problem based on the provided configuration
 */
export function generateProblem(config: MathConfig = DEFAULT_MATH_CONFIG): MathProblem {
  // Pick a random operation from the available ones
  const operation = config.operations[randomInt(0, config.operations.length - 1)];

  // Generate operands suitable for the operation
  const operands = generateOperands(operation, config.maxNumber, config.numTerms);

  // Calculate the correct answer
  const answer = calculateAnswer(operands, operation);

  // Build the question string
  const question = buildQuestion(operands, operation);

  // Generate wrong answers and combine with correct answer
  const wrongAnswers = generateWrongAnswers(answer);
  const choices = shuffleArray([answer, ...wrongAnswers]);

  return {
    question,
    answer,
    choices,
  };
}
