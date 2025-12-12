# CLAUDE.md

## Repository Overview

Rosie Races is an educational racing game for young children, built as a PWA. Players tap to move Rosie forward, reach checkpoints, and solve math problems to win.

**Tech Stack**: TypeScript, React 19, Phaser 3, Material-UI, Vite, Jest

## Architecture

```
React (UI Layer) ←→ GameContext (Event Bridge) ←→ Phaser (Game Engine)
     ↓                      ↓                           ↓
 TapButton           emitTap()/events              RaceScene
```

### Key Directories

- `.claude/plans/` - Implementation plan artifacts
- `src/components/` - React components with colocated tests
- `src/game/scenes/` - Phaser scenes (RaceScene is main gameplay)
- `src/context/` - GameContext bridges React and Phaser via events
- `src/hooks/` - Custom hooks (useGame)
- `src/test/` - Jest setup, factories, mocks

### Event System (src/game/events.ts)

- `TAP`: React → Phaser (button press)
- `RACE_FINISHED`: Phaser → React (reached finish)
- `RESTART_RACE`: React → Phaser (reset game)

## Development Commands

To run tests: Call the `test-runner` agent, with a fallback to `npm run tests`

```bash
npm run dev      # Start dev server (localhost:5173)
npm run build    # TypeScript check + production build
npm run lint     # ESLint check
npm run format   # Prettier format src/
npm run serena   # Start serena server to use with serena mcp server.
```

## Code Conventions

### TypeScript

- Strict mode enabled
- Path alias: `@/` maps to `src/`
- Constants use UPPER_SNAKE_CASE
- Interfaces for all props and context types

### React

- Functional components with hooks
- Context API for state (no external state library)
- Semantic HTML: `<header>`, `<main>`, `<footer>`
- Tests colocated with components (`.test.tsx`)

### Phaser

- Scene-based architecture extending `Phaser.Scene`
- Graphics drawn programmatically (no sprite sheets)
- Velocity-based physics with friction decay
- Event emission for React communication

### Styling

- Material-UI with custom kid-friendly theme (src/theme.ts)
- Primary color: Hot pink (#FF69B4)
- Font: Fredoka/Bubblegum Sans (playful, rounded)
- Touch targets: minimum 48x48px

## Testing

- Jest with jsdom environment
- Phaser is fully mocked (avoids WebGL/canvas in tests)
- React Testing Library for component tests
- Test factories in `src/test/factories/`

## PWA Configuration

- Landscape orientation optimized for gameplay
- Service worker with auto-update (vite-plugin-pwa)
- Installable on iOS/iPad as standalone app
- Icons: 192x192 and 512x512 in public/
