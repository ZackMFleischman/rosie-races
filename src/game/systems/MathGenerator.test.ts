import { generateProblem, DEFAULT_MATH_CONFIG, type MathConfig } from './MathGenerator';

describe('MathGenerator', () => {
  describe('generateProblem', () => {
    const setupTest = (config?: Partial<MathConfig>) => {
      const fullConfig: MathConfig = {
        ...DEFAULT_MATH_CONFIG,
        ...config,
      };
      return { config: fullConfig };
    };

    it('returns a problem with question, answer, and 4 choices', () => {
      const problem = generateProblem();

      expect(problem).toHaveProperty('question');
      expect(problem).toHaveProperty('answer');
      expect(problem).toHaveProperty('choices');
      expect(problem.choices).toHaveLength(4);
    });

    it('includes the correct answer in choices', () => {
      const problem = generateProblem();

      expect(problem.choices).toContain(problem.answer);
    });

    it('generates unique choices', () => {
      const problem = generateProblem();
      const uniqueChoices = new Set(problem.choices);

      expect(uniqueChoices.size).toBe(4);
    });

    it('generates positive choices only', () => {
      // Run multiple times to ensure consistency
      for (let i = 0; i < 20; i++) {
        const problem = generateProblem();
        problem.choices.forEach((choice) => {
          expect(choice).toBeGreaterThan(0);
        });
      }
    });

    describe('addition problems', () => {
      it('generates valid addition question format', () => {
        const { config } = setupTest({ operations: ['add'], numTerms: 2 });
        const problem = generateProblem(config);

        expect(problem.question).toMatch(/^\d+ \+ \d+ = \?$/);
      });

      it('calculates correct sum for 2 terms', () => {
        const { config } = setupTest({ operations: ['add'], numTerms: 2, maxNumber: 5 });

        // Run multiple times
        for (let i = 0; i < 10; i++) {
          const problem = generateProblem(config);
          const [a, b] = problem.question.replace(' = ?', '').split(' + ').map(Number);

          expect(problem.answer).toBe(a + b);
        }
      });

      it('calculates correct sum for 3 terms', () => {
        const { config } = setupTest({ operations: ['add'], numTerms: 3, maxNumber: 5 });
        const problem = generateProblem(config);

        expect(problem.question).toMatch(/^\d+ \+ \d+ \+ \d+ = \?$/);

        const numbers = problem.question.replace(' = ?', '').split(' + ').map(Number);

        expect(problem.answer).toBe(numbers.reduce((a, b) => a + b, 0));
      });
    });

    describe('subtraction problems', () => {
      it('generates valid subtraction question format', () => {
        const { config } = setupTest({ operations: ['subtract'], numTerms: 2 });
        const problem = generateProblem(config);

        expect(problem.question).toMatch(/^\d+ - \d+ = \?$/);
      });

      it('ensures result is non-negative', () => {
        const { config } = setupTest({ operations: ['subtract'], numTerms: 2, maxNumber: 10 });

        // Run multiple times
        for (let i = 0; i < 20; i++) {
          const problem = generateProblem(config);
          expect(problem.answer).toBeGreaterThanOrEqual(0);
        }
      });

      it('calculates correct difference', () => {
        const { config } = setupTest({ operations: ['subtract'], numTerms: 2, maxNumber: 10 });

        for (let i = 0; i < 10; i++) {
          const problem = generateProblem(config);
          const [a, b] = problem.question.replace(' = ?', '').split(' - ').map(Number);

          expect(problem.answer).toBe(a - b);
        }
      });
    });

    describe('multiplication problems', () => {
      it('generates valid multiplication question format', () => {
        const { config } = setupTest({ operations: ['multiply'], numTerms: 2 });
        const problem = generateProblem(config);

        expect(problem.question).toMatch(/^\d+ × \d+ = \?$/);
      });

      it('calculates correct product', () => {
        const { config } = setupTest({ operations: ['multiply'], numTerms: 2, maxNumber: 10 });

        for (let i = 0; i < 10; i++) {
          const problem = generateProblem(config);
          const [a, b] = problem.question.replace(' = ?', '').split(' × ').map(Number);

          expect(problem.answer).toBe(a * b);
        }
      });

      it('uses smaller numbers for multiplication (max 10)', () => {
        const { config } = setupTest({ operations: ['multiply'], numTerms: 2, maxNumber: 20 });

        for (let i = 0; i < 10; i++) {
          const problem = generateProblem(config);
          const numbers = problem.question.replace(' = ?', '').split(' × ').map(Number);

          numbers.forEach((num) => {
            expect(num).toBeLessThanOrEqual(10);
          });
        }
      });
    });

    describe('division problems', () => {
      it('generates valid division question format', () => {
        const { config } = setupTest({ operations: ['divide'], numTerms: 2 });
        const problem = generateProblem(config);

        expect(problem.question).toMatch(/^\d+ ÷ \d+ = \?$/);
      });

      it('calculates correct quotient with whole-number results', () => {
        const { config } = setupTest({ operations: ['divide'], numTerms: 2, maxNumber: 20 });

        for (let i = 0; i < 10; i++) {
          const problem = generateProblem(config);
          const [a, b] = problem.question.replace(' = ?', '').split(' ÷ ').map(Number);

          expect(a % b).toBe(0);
          expect(problem.answer).toBe(a / b);
        }
      });
    });

    describe('square problems', () => {
      it('generates valid square question format', () => {
        const { config } = setupTest({ operations: ['square'], numTerms: 1 });
        const problem = generateProblem(config);

        expect(problem.question).toMatch(/^\d+² = \?$/);
      });

      it('calculates correct square', () => {
        const { config } = setupTest({ operations: ['square'], numTerms: 1, maxNumber: 12 });

        for (let i = 0; i < 10; i++) {
          const problem = generateProblem(config);
          const base = Number(problem.question.replace('² = ?', ''));

          expect(problem.answer).toBe(base * base);
        }
      });
    });

    describe('mixed operations', () => {
      it('randomly selects from available operations', () => {
        const { config } = setupTest({
          operations: ['add', 'subtract', 'multiply', 'divide', 'square'],
          numTerms: 2,
        });

        const operators = new Set<string>();

        // Generate many problems to collect different operators
        for (let i = 0; i < 50; i++) {
          const problem = generateProblem(config);
          if (problem.question.includes('+')) operators.add('+');
          if (problem.question.includes('-')) operators.add('-');
          if (problem.question.includes('×')) operators.add('×');
          if (problem.question.includes('÷')) operators.add('÷');
          if (problem.question.includes('²')) operators.add('²');
        }

        // Should have generated at least 2 different operators
        expect(operators.size).toBeGreaterThanOrEqual(2);
      });
    });

    describe('maxNumber configuration', () => {
      it('respects maxNumber for operands', () => {
        const { config } = setupTest({ operations: ['add'], numTerms: 2, maxNumber: 5 });

        for (let i = 0; i < 20; i++) {
          const problem = generateProblem(config);
          const numbers = problem.question.replace(' = ?', '').split(' + ').map(Number);

          numbers.forEach((num) => {
            expect(num).toBeLessThanOrEqual(5);
          });
        }
      });
    });

    describe('default configuration', () => {
      it('uses default config when none provided', () => {
        const problem = generateProblem();

        // Default is addition with 2 terms
        expect(problem.question).toMatch(/^\d+ \+ \d+ = \?$/);
      });

      it('default maxNumber is 10', () => {
        for (let i = 0; i < 20; i++) {
          const problem = generateProblem();
          const numbers = problem.question.replace(' = ?', '').split(' + ').map(Number);

          numbers.forEach((num) => {
            expect(num).toBeLessThanOrEqual(10);
          });
        }
      });
    });
  });
});
