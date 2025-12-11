# 🏁 Rosie Races

A fun racing game for 4-year-old Rosie with math challenges!

## 📖 Overview

**Tech:** TypeScript, React (Vite), Phaser 3, PWA  
**Platform:** iPhone & iPad (installable PWA)  
**Hosting:** GitHub Pages  
**Core Loop:** Tap to run → Checkpoint → Math problem → Win!

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

This starts the development server at [http://localhost:5173](http://localhost:5173).

### Testing

```bash
npm run test
```

### Linting & Formatting

```bash
npm run lint
npm run format
```

### Building

```bash
npm run build
```

## 📋 Implementation Plan

See [plans/implementation-plan.md](./plans/implementation-plan.md) for the detailed phased implementation plan.

## 🛠️ Tech Stack

- **Frontend:** React 19 + TypeScript
- **Game Engine:** Phaser 3
- **Build Tool:** Vite 5
- **Testing:** Jest 29 + React Testing Library
- **Linting:** ESLint 9 + Prettier

## 📁 Project Structure

```
rosie-races/
├── public/              # Static assets
├── src/
│   ├── components/      # React components (*.tsx + *.test.tsx siblings)
│   ├── game/           # Phaser game scenes, entities, systems
│   ├── data/           # Game data and configuration
│   ├── test/           # Test setup and factories
│   └── App.tsx         # Main app component
├── plans/              # Implementation documentation
└── package.json
```

## 📝 License

MIT
