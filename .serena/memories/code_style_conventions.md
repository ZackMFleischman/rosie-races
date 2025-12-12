# Code Style & Conventions

## TypeScript
- Strict mode enabled
- Path alias: `@/` maps to `src/`
- Constants use UPPER_SNAKE_CASE
- Interfaces for all props and context types
- Target: ES2022
- Module: ESNext

## React
- Functional components with hooks
- Context API for state (no external state library)
- Semantic HTML: `<header>`, `<main>`, `<footer>`
- Tests colocated with components (`.test.tsx`)

## Phaser
- Scene-based architecture extending `Phaser.Scene`
- Graphics drawn programmatically (no sprite sheets)
- Velocity-based physics with friction decay
- Event emission for React communication

## Prettier Configuration
- Single quotes
- Semicolons
- Tab width: 2
- Trailing commas: es5
- Print width: 100

## ESLint
- Uses typescript-eslint
- React hooks plugin enabled
- React Refresh for Vite
- Prettier integration (eslint-config-prettier)

## Testing
- Jest with jsdom environment
- Phaser is fully mocked (avoids WebGL/canvas in tests)
- React Testing Library for component tests
- Test factories in `src/test/factories/`
- Test files: `*.test.{ts,tsx}`
