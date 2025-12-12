# Rosie Races - Project Overview

## Purpose
Rosie Races is an educational racing game for young children, built as a Progressive Web App (PWA). Players tap to move Rosie forward, reach checkpoints, and solve math problems to win.

## Tech Stack
- **Language**: TypeScript (strict mode)
- **Frontend**: React 19 with functional components and hooks
- **Game Engine**: Phaser 3 (scene-based architecture)
- **UI Library**: Material-UI v7 (MUI)
- **Build Tool**: Vite
- **Testing**: Jest with React Testing Library
- **PWA**: vite-plugin-pwa

## Architecture

```
React (UI Layer) ←→ GameContext (Event Bridge) ←→ Phaser (Game Engine)
     ↓                      ↓                           ↓
 TapButton           emitTap()/events              RaceScene
```

### Key Directories
- `src/components/` - React components with colocated tests
- `src/game/scenes/` - Phaser scenes (RaceScene is main gameplay)
- `src/context/` - GameContext bridges React and Phaser via events
- `src/hooks/` - Custom hooks (useGame)
- `src/test/` - Jest setup, factories, mocks
- `.claude/plans/` - Implementation plan artifacts

### Event System (src/game/events.ts)
- `TAP`: React → Phaser (button press)
- `RACE_FINISHED`: Phaser → React (reached finish)
- `RESTART_RACE`: React → Phaser (reset game)

## Design/Theming
- Primary color: Hot pink (#FF69B4)
- Font: Fredoka/Bubblegum Sans (playful, rounded)
- Touch targets: minimum 48x48px
- Landscape orientation optimized for gameplay
