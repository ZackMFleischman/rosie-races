# 🏁 Rosie Races - Implementation Plan

Racing game for 4-year-old Rosie with math challenges!

---

## Overview

**Tech:** TypeScript, React (Vite), Phaser 3, PWA  
**Platform:** iPhone & iPad (installable PWA)  
**Hosting:** GitHub Pages  
**Core Loop:** Tap to run → Checkpoint → Math problem → Win!

---

## Phase 1: Project Foundation & Basic Track

### 1.1 Project Setup

- [x] **Initialize Vite + React + TypeScript**

  > Run `npx create-vite@latest ./ --template react-ts`. Choose current directory. This scaffolds React 18 with TypeScript and Vite's fast HMR.

- [x] **Install Phaser 3**

  > Run `npm install phaser`. Phaser 3.60+ has built-in TypeScript types. No @types package needed.

- [x] **ESLint + Prettier config**

  > Install: `npm install -D eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser prettier eslint-config-prettier`
  > Create `.eslintrc.cjs` extending `plugin:@typescript-eslint/recommended`. Create `.prettierrc` with `{ "singleQuote": true, "semi": true }`. Add scripts: `"lint": "eslint src"`, `"format": "prettier --write src"`.

- [x] **Jest + RTL + factory.ts + jest-mock-extended + faker**

  > Install: `npm install -D jest @types/jest ts-jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom factory.ts jest-mock-extended @faker-js/faker`
  > Create `jest.config.js` with `preset: 'ts-jest'`, `testEnvironment: 'jsdom'`, `setupFilesAfterEnv: ['<rootDir>/src/test/jestSetup.ts']`. Pattern: `**/*.test.{ts,tsx}`.

- [x] **Testing patterns: Jest setup + per-suite setupTest**
  > Create `src/test/jestSetup.ts` for global Jest config (import jest-dom, global mocks). Does NOT export setupTest. Each test suite defines its own `const setupTest = (options?: OptionsType) => {...}` at top of describe block for atomic Arrange. Tests live next to source: `Button.tsx` → `Button.test.tsx`. Create `src/test/factories/` for factory.ts model factories.

### 1.2 PWA Configuration

- [x] **manifest.json for installability**

  > Create `public/manifest.json` with `name`, `short_name: "Rosie Races"`, `start_url: "/"`, `display: "standalone"`, `background_color`, `theme_color`, and `icons` array (192px, 512px). Link in `index.html`: `<link rel="manifest" href="/manifest.json">`.

- [x] **Service worker for offline**

  > Use `vite-plugin-pwa`: `npm install -D vite-plugin-pwa`. Configure in `vite.config.ts` with `VitePWA({ registerType: 'autoUpdate' })`. This auto-generates sw.js with precaching.

- [x] **iOS meta tags for fullscreen**

  > Add to `index.html` head: `<meta name="apple-mobile-web-app-capable" content="yes">`, `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucент">`, `<link rel="apple-touch-icon" href="/icon-192.png">`.

- [x] **App icons**
  > Create placeholder icons (solid color with "RR" text) at `public/icon-192.png` and `public/icon-512.png`. Use any image tool or generate programmatically.

### 1.3 Design System & Responsive

- [x] **MaterialUI setup**

  > Install: `npm install @mui/material @emotion/react @emotion/styled`. Create theme in `src/theme.ts` with kid-friendly colors. Use system props (`sx`) or `styled()` for styling—no CSS modules. Wrap app in `<ThemeProvider>`.

- [x] **Responsive layout with MUI**

  > Use MUI's responsive breakpoints: `xs` (phone), `sm`/`md` (tablet). Use `Box`, `Container`, `Stack` for layout. Set root height with `100dvh`. All sizing via theme spacing.

- [x] **Phaser canvas scales to screen**

  > In Phaser config, set `scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width: 1024, height: 768 }`. This maintains aspect ratio while fitting container. Parent div should be 100% of viewport.

- [x] **UI scales proportionally**

  > Use `rem` units based on root font size. Set root font size with `clamp(14px, 2vw, 20px)` for fluid scaling. All UI components inherit proportional sizing.

- [x] **Test iPhone + iPad sizes**
  > Use browser DevTools device emulation. Test: iPhone SE (375x667), iPhone 14 (390x844), iPad (768x1024), iPad Pro (1024x1366). Verify no overflow, touch targets ≥44px.

### 1.4 Phaser Integration

- [x] **`PhaserGame` React wrapper**

  > Create `src/components/GameContainer.tsx`. Use `useRef` for game container div, `useEffect` to create/destroy Phaser.Game on mount/unmount. Pass game config as prop. Expose game instance via ref or context for React-Phaser communication.

- [x] **Basic `RaceScene` with fixed viewport**

  > Create `src/game/scenes/RaceScene.ts` extending `Phaser.Scene`. In `create()`, set world bounds to match camera. No camera follow—everything renders in fixed view. Background fills entire canvas.

- [x] **Placeholder circle for Rosie**
  > In RaceScene, use `this.add.circle(x, y, 30, 0xff69b4)` (pink circle). Position at left side of track, in lane 1. Store reference for later movement.

### 1.5 Track Layout

- [x] **6 horizontal lanes**

  > Calculate lane height: `canvasHeight / 6`. Draw lanes using `this.add.rectangle()` with alternating colors (light/dark grass green). Each lane stores y-center position for racer placement.

- [x] **Colorful background**

  > Draw sky gradient at top 20% using tinted rectangle or gradient texture. Draw grass base. Add simple decorations: clouds (white circles), trees (triangles), flowers (small colored circles) at random positions.

- [x] **Start + finish line markers**
  > Draw vertical dashed lines using `this.add.graphics()`. Start line at x=50, finish at x=974 (near right edge). Add "START" and "FINISH" text labels above lines.

**✅ Milestone:** Responsive track visible on iPhone & iPad

---

## Phase 2: Player Movement & Tap Mechanic

### 2.1 Tap-to-Run System

- [x] **Big "TAP!" button at bottom center**

  > Create `src/components/TapButton.tsx`. Style: large circular button (min 100px), bright color (pink/purple), "TAP!" text. Position with CSS: `position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%)`. Use `onPointerDown` for instant response.

- [x] **Tap increases speed/momentum**

  > In game state, track `velocity: number`. Each tap adds to velocity (e.g., `velocity += 15`). Cap max velocity (e.g., 300). Communicate taps from React to Phaser via custom event: `game.events.emit('tap')`.

- [x] **Momentum decays over time**

  > In RaceScene `update(time, delta)`, apply friction: `velocity *= 0.98` per frame. This creates natural slowdown. Tune decay rate for good feel—player should need ~3-4 taps/second to maintain speed.

- [x] **Smooth horizontal movement**
  > In `update()`, move Rosie: `rosie.x += velocity * (delta / 1000)`. Use delta-time for frame-rate independence. Clamp x position to track bounds.

### 2.2 Player Avatar

- [x] **Placeholder circle sprite**

  > Replace `this.add.circle` with `this.add.sprite()` loading a circle texture. Create circle texture dynamically: `this.add.graphics().fillCircle()` then `generateTexture()`. This enables future sprite swap.

- [x] **Bobbing/running animation**

  > Apply sine wave to y-position based on velocity: `rosie.y = laneY + Math.sin(time * 0.01) * (velocity / 50)`. Higher velocity = faster bob. Or use scale pulse: `rosie.setScale(1 + Math.sin(time * 0.02) * 0.05)`.

- [x] **Speed sparkles (optional)**
  > Create particle emitter: `this.add.particles()`. Emit small yellow/white circles behind Rosie when velocity > threshold. Adjust emission rate based on speed. Can skip for MVP and add in Phase 9. **(Skipped for MVP)**

### 2.3 Race Timer

- [x] **Always-visible timer at top**

  > Create `src/components/Timer.tsx`. Display MM:SS.ms format. Position: `position: fixed; top: 10px; left: 50%; transform: translateX(-50%)`. Large font (2rem+), high contrast colors. Add `z-index: 1000` to stay above modals.

- [x] **Timer never pauses**

  > Store `raceStartTime` in state. In React `useEffect` with `requestAnimationFrame` loop, calculate elapsed: `Date.now() - raceStartTime`. Update display every frame. Timer logic lives entirely in React, independent of game state.

- [x] **Large kid-friendly font**
  > Use Google Font like "Fredoka One" or "Bubblegum Sans". Import in `index.css`: `@import url('...')`. Apply to timer with large size, text shadow for readability, and playful color.

### 2.4 Finish Detection

- [x] **Detect finish line crossing**

  > In RaceScene `update()`, check `if (rosie.x >= FINISH_LINE_X && !hasFinished)`. Set `hasFinished = true`. Emit event: `this.game.events.emit('raceFinished', { time: elapsedTime })`. React listens and shows finish screen.

- [x] **"Finished!" screen with time**

  > Create `src/components/FinishedScreen.tsx`. Show on `raceFinished` event. Display: large "FINISHED!" text, final time, simple celebration (emoji confetti 🎉). Semi-transparent overlay over game.

- [x] **"Race Again" button**
  > In FinishedScreen, add button that resets game state: `velocity = 0`, `rosie.x = START_X`, `hasFinished = false`, clears timer. Emit `restartRace` event. Style same as TAP button for consistency.

**✅ Milestone:** Tap → Run → Finish → Restart

---

## Phase 3: Math Checkpoints

### 3.1 Checkpoint System

- [ ] **2 checkpoints on track**

  > Define checkpoint x-positions: `[300, 600]` (roughly 1/3 and 2/3 of track). Store in constant array. Checkpoints scale with difficulty later.

- [ ] **Visual markers (flags/arches)**

  > Draw arches using `graphics.lineStyle()` + `arc()` or use simple vertical banners with `rectangle()`. Add alternating colors (red/white). Place "?" symbol on each checkpoint.

- [ ] **Pause Rosie at checkpoint (timer keeps running)**
  > When Rosie reaches checkpoint x: set `isPaused = true`, emit `showMathProblem` event with checkpoint index. In `update()`, skip movement when paused. Timer in React continues independently.

### 3.2 Math Problem Generator

- [ ] **Configurable operations/maxNumber/numTerms**

  > Create `src/game/systems/MathGenerator.ts`. Export interface `MathConfig { operations: Operation[], maxNumber: number, numTerms: number }`. Accept config in generator function.

- [ ] **Generate fresh problem per checkpoint**

  > Function `generateProblem(config): { question: string, answer: number, choices: number[] }`. Pick random operation, random operands. For subtract, ensure `a >= b` (positive result). For multiply, use smaller numbers.

- [ ] **4 multiple choice answers**
  > Generate 3 wrong answers: `answer ± random(1,5)`, ensure unique and positive. Shuffle array of [correctAnswer, ...wrongAnswers]. Return shuffled choices array.

### 3.3 Math Modal UI

- [ ] **Modal over game (timer visible!)**

  > Create `src/components/MathModal.tsx`. Use `position: fixed; top: 60px` (below timer). Semi-transparent background. Timer stays visible at top with higher z-index.

- [ ] **Answer buttons at TOP (away from TAP button)**

  > Place 4 answer buttons in 2x2 grid at TOP of modal content. Large buttons (min 80px). Ensure minimum 200px gap between lowest answer button and TAP button location.

- [ ] **Visual ✓/✗ feedback**
  > On answer click, show result: green ✓ or red ✗ overlay on button. Brief delay (500ms) before closing modal. Use CSS animation for pop effect.

### 3.4 Answer Consequences

- [ ] **Correct fast → big boost + celebration**

  > Track time from modal open. If answered < 3 seconds: add large velocity boost (50), show "AWESOME! 🌟" text, trigger confetti particles.

- [ ] **Correct slow → small boost**

  > If answered 3-10 seconds: add small velocity boost (20), show "Good job! ✓" text. Resume race normally.

- [ ] **Wrong → stumble + delay**
  > On wrong answer: add 2 second pause before resuming, shake Rosie sprite, show "Oops! Try to beat it next time!" No velocity boost. Don't re-ask question—just continue.

**✅ Milestone:** 2 checkpoints with math problems

---

## Phase 4: Sound & Volume Control

### 4.1 Sound Effects (Placeholders)

- [x] **Countdown: 3, 2, 1 beeps + gunshot GO!**

  > Created placeholder audio files in `public/assets/audio/`: `beep.mp3`, `go.mp3`. Generated via script in `scripts/generate-audio-placeholders.js`. Actual sounds can be added later.

- [x] **Race background music loop**

  > Created `race-music.mp3` placeholder. AudioManager plays it on race start with loop=true.

- [x] **Finish celebration sound**

  > Created `finish.mp3` placeholder. Plays on race completion, stops background music with fade out.

- [x] **Post-race screen music**
  > Created `results-music.mp3` placeholder. Crossfade support implemented in AudioManager.

### 4.2 Volume Control UI

- [x] **Speaker icon 🔊 in corner**

  > Created `src/components/VolumeControl.tsx`. Position: `fixed; top: 10px; right: 10px`. Uses MUI VolumeUp/VolumeOff/VolumeMute icons. Icon changes based on volume/mute state.

- [x] **Tap toggles volume slider**

  > On icon tap, shows/hides Popover with vertical slider. Slider uses MUI Slider with touch-friendly styling.

- [x] **Mute/unmute toggle**

  > Double-tap on icon to mute. Store `isMuted` state. When muted, sets Phaser `sound.mute = true`. Visual: icon changes based on state.

- [x] **Persist to localStorage**
  > Volume saved to `rosie-races-volume`, mute state saved to `rosie-races-muted`. Default volume is 70%.

### 4.3 Audio System

- [x] **Phaser audio manager**

  > Created `src/game/systems/AudioManager.ts`. Singleton pattern. Methods: `playMusic(key)`, `playSFX(key)`, `setVolume(0-1)`, `toggleMute()`, `crossfadeMusic()`. Wraps Phaser's `this.sound` API.

- [x] **Preload placeholder sounds**

  > Audio preloaded in RaceScene's `preload()` method via `AudioManager.preloadAudio(scene)`. All 8 audio files loaded.

- [x] **Smooth music transitions**
  > Implemented fade in/out using Phaser tweens with 500ms duration. `crossfadeMusic()` method for smooth transitions between tracks.

**✅ Milestone:** Audio working, volume controllable

---

## Phase 5: AI Competitors (Family)

### 5.1 Family Members

| Name       | Role    |
| ---------- | ------- |
| Mommy      | Mom     |
| Daddy      | Dad     |
| Uncle Zack | Uncle   |
| Gaga       | Grandma |
| Grandpa    | Grandpa |
| Lalo       | Dog 🐕  |

- [ ] **Define family data**
  > Create `src/data/familyMembers.ts`. Export array: `{ id, name, color, minSpeed, maxSpeed }`. Colors: distinct for each (blue, green, orange, purple, red). Speed ranges vary slightly for variety.

### 5.2 Competitor System

- [ ] **5 family members in lanes**

  > In RaceScene `create()`, iterate `familyMembers`, create sprite in each lane (lanes 2-6, Rosie in lane 1). Store in `competitors: Competitor[]` array.

- [ ] **Random speed per racer**

  > On race start, assign: `speed = Phaser.Math.FloatBetween(minSpeed, maxSpeed)`. This varies each race. Optionally adjust based on difficulty.

- [ ] **Rosie's lane highlighted**
  > Draw lane 1 with different color (light pink tint). Or add subtle glow/border around Rosie's lane. Make player's position visually obvious.

### 5.3 Competitor Movement

- [ ] **AI moves at varying speeds**

  > In `update()`, for each competitor: `comp.x += comp.speed * (delta / 1000)`. Simple linear movement, no acceleration.

- [ ] **Speed variations for realism**

  > Add subtle speed fluctuation: `comp.speed += Phaser.Math.FloatBetween(-5, 5)` occasionally (every ~2 seconds). Clamp within min/max bounds.

- [ ] **AI doesn't stop for checkpoints**
  > Competitors ignore checkpoint x-positions. Only Rosie pauses for math. This gives Rosie a disadvantage balanced by boost potential.

### 5.4 Visual Polish

- [ ] **Placeholder avatars**

  > Generate colored circles per racer (matching their defined color). Later replace with actual head images. Use `this.add.circle()` with color from familyMember data.

- [ ] **Lane name labels**

  > Add text labels on left side of each lane: racer name. Use smaller font, positioned at lane start. Update when avatars added.

- [ ] **Lead indicator**
  > Display "1st: [Name]" text at top or show position badges (1st, 2nd...) next to each racer. Update in `update()` by sorting racers by x-position.

**✅ Milestone:** 6 racers moving at different speeds

---

## Phase 6: Race Flow & Finish

### 6.1 Race States

- [ ] **Pre-Race: racers at start**

  > Add `gameState: 'ready' | 'countdown' | 'racing' | 'finished'`. In 'ready', show racers at start line, display "TAP TO START" prompt.

- [ ] **Countdown: 3...2...1...GO! (with sounds)**

  > On first tap, enter 'countdown'. Display large numbers. Play beep each second. After "GO!" (with gunshot sound), enter 'racing' state. Use Phaser time events for delays.

- [ ] **Racing: main gameplay**

  > In 'racing', TAP button works, timer runs, racers move. This is the current Phase 2 implementation.

- [ ] **Finished: celebration**
  > When any racer finishes, record their time. When ALL finish OR Rosie finishes, show results. Track each racer's finish order.

### 6.2 Position Tracking

- [ ] **Real-time position (1st, 2nd...)**

  > Create function `getPositions(): RacerPosition[]`. Sort all racers by x descending. Return array with `{ racer, position }`. Call in `update()`.

- [ ] **Position display during race**

  > Show Rosie's current position: "Position: 3rd" in UI. Update every frame. Use ordinal formatting (1st, 2nd, 3rd, 4th...).

- [ ] **Final position on finish**
  > Store `finishOrder: string[]` array. When racer crosses finish, append to array if not already present. Rosie's final position = her index + 1.

### 6.3 Race Results Screen

- [ ] **Mario Kart-style finish order**

  > Show all 6 racers in order (1st at top). Animate entries appearing one by one (0.5s delay each). Show position number, name, avatar.

- [ ] **Finish times for all**

  > Display time next to each racer. AI times calculated from their speed and distance. Format as MM:SS.

- [ ] **Medal for Rosie (🥇🥈🥉)**

  > If Rosie is 1st: gold medal + "WINNER!" text. 2nd: silver + "Great job!". 3rd: bronze + "Good effort!". 4th+: participation ribbon + "Keep trying!".

- [ ] **"Race Again" button**
  > Same as Phase 2 but now resets all racers, assigns new random speeds, clears finish order.

**✅ Milestone:** Full race with results

---

## Phase 7: Difficulty & Settings

### 7.1 Difficulty Presets

- [ ] **Easy: add only, max 10, 2 terms, 2 checkpoints**

  > Create `src/data/difficulties.ts`. Export `EASY: DifficultyConfig = { operations: ['add'], maxNumber: 10, numTerms: 2, checkpoints: 2, aiSpeedMod: 0.8 }`.

- [ ] **Medium: add/subtract, max 15, 2 terms, 3 checkpoints**

  > Export `MEDIUM: { operations: ['add', 'subtract'], maxNumber: 15, numTerms: 2, checkpoints: 3, aiSpeedMod: 1.0 }`.

- [ ] **Hard: all ops, max 20, 3 terms, 4 checkpoints**
  > Export `HARD: { operations: ['add', 'subtract', 'multiply'], maxNumber: 20, numTerms: 3, checkpoints: 4, aiSpeedMod: 1.2 }`. AI is faster, making it harder to win.

### 7.2 Settings Menu

- [ ] **Difficulty selector**

  > Create `src/components/Settings.tsx`. Three large buttons: Easy 🐢, Medium 🏃, Hard 🚀. Highlight current selection. Change updates global config.

- [ ] **Custom mode: operations, max number, checkpoints**
  > Toggle "Custom" mode. Show checkboxes for operations, number sliders for maxNumber (1-50) and checkpoints (1-5). Only shown when custom enabled.

### 7.3 Persistence

- [ ] **Save to localStorage**

  > On any setting change: `localStorage.setItem('difficulty', JSON.stringify(config))`. Debounce saves (wait 500ms after last change).

- [ ] **Load on start**
  > In app init, read `localStorage.getItem('difficulty')`. Parse JSON, validate structure, merge with defaults. Apply to game config.

**✅ Milestone:** Difficulty settings work

---

## Phase 8: Leaderboards & Records

### 8.1 Time Tracking

- [ ] **Accurate race timer**

  > Use `performance.now()` instead of `Date.now()` for higher precision (submillisecond). Store as float, format to 2 decimal places for display.

- [ ] **Store completion times**
  > On Rosie finish, add entry: `{ time: number, date: ISO string, difficulty: string }`. Store in localStorage array. Cap at 100 entries, remove oldest.

### 8.2 Leaderboard System

- [ ] **Best times list (localStorage)**

  > Sort stored times ascending. Display top 10. Group by difficulty if showing all. Create `src/data/leaderboard.ts` with load/save/add functions.

- [ ] **World record (hardcoded)**

  > Add fake world record for motivation: `{ name: "Super Rosie", time: 25.00 }`. Display at top of leaderboard with trophy icon. Beatable but challenging.

- [ ] **Personal best indicator**
  > Track `personalBest` per difficulty. On new record: show "NEW PERSONAL BEST! 🏆" celebration. Highlight PB row in leaderboard.

### 8.3 Leaderboard UI

- [ ] **Trophy icons for top times**

  > 1st place: 🥇, 2nd: 🥈, 3rd: 🥉. Display next to time. Use larger icons for visual appeal.

- [ ] **"NEW RECORD!" celebration**
  > When beating personal best: full-screen confetti, pulsing "NEW RECORD!" text, celebratory sound. Delay before showing leaderboard.

**✅ Milestone:** Leaderboard persists

---

## Phase 9: Polish & Juice

### 9.1 Visual Polish

- [ ] **Kid-friendly art style**

  > Replace placeholder circles with photos of the peoples heads in question. Ask the user for the images you need e.g. like rosie-sprite.png

- [ ] **Particle effects (confetti, sparkles)**

  > Create reusable particle configs. Confetti: multi-colored rectangles falling. Sparkles: small white/yellow circles. Trigger on wins, correct answers, checkpoints.

- [ ] **Celebration animations**
  > On correct answers: screen shake, character bounce. On passing competitors: brief slowmo + whoosh effect. On winning: extended celebration, character jumping.

### 9.2 Kid-Friendly UX

- [ ] **Extra large tap targets**

  > Audit all buttons: minimum 48x48px touch area. TAP button should be 100px+. Answer buttons 80px+. Add padding if needed.

- [ ] **Clear feedback everywhere**

  > Every tap should have visual+audio feedback. Button press states. Loading spinners where needed. Never leave user wondering if action worked.

**✅ Milestone:** Polished and ready for Rosie!

---

## Hosting & Deployment

### Setup

- [x] **GitHub repository**

  > Update `.gitignore` for node_modules, dist. Enable GitHub Pages in settings.

- [x] **GitHub Pages enabled**

  > Settings → Pages → Source: GitHub Actions. Create `.github/workflows/deploy.yml` workflow file.

- [ ] **Custom domain (optional)**
  > If desired: add CNAME file to public folder, configure DNS A/CNAME records to GitHub IPs.

### CI/CD

- [x] **GitHub Actions workflow**

  > Workflow triggers on push to main. Steps: checkout, setup Node, `npm ci`, `npm run lint`, `npm run test`, `npm run build`.

- [x] **On push: lint → test → build → deploy**

  > Add deploy step using `actions/deploy-pages@v4`. Publishes `dist` folder via GitHub Pages artifact.

- [x] **PWA assets included in build**
  > Verify vite-plugin-pwa generates manifest, service worker, and icons in dist folder. Test offline functionality after deploy.

### Deploy Commands

```bash
npm run build        # Build production
npm run deploy       # Deploy to GitHub Pages (via workflow)
```

---

## File Structure

```
rosie-races/
├── .github/workflows/deploy.yml
├── public/
│   ├── manifest.json
│   └── assets/{avatars,audio,track,ui}/
├── src/
│   ├── components/          # *.tsx + *.test.tsx siblings
│   ├── game/{scenes,entities,systems}/
│   ├── data/
│   ├── test/{jestSetup.ts,factories/}
│   ├── App.tsx
│   └── index.css
├── .eslintrc.cjs
├── .prettierrc
├── jest.config.js
└── vite.config.ts
```

---

## AI Agent Workflow

> [!CAUTION]
> **CRITICAL: Follow ALL steps. Do not skip any.**

For each section within a phase, execute this workflow:

### 1. Identify Next Section

- Find the next unchecked `[ ]` item in the plan
- Set task boundary for that section

### 2. Build

- Write the code for the section
- Follow the "how" guidance in the checkbox description
- Keep code clean and focused

### 3. Test

- Write passing tests (sibling files)
- Use per-suite `setupTest(options?)` pattern at describe block level
- Run `npm run test` - all must pass

### 4. Refactor (Only If Needed)

- Review code for simplicity
- Refactor ONLY if genuinely needed
- Re-run validation after any changes

### 4.5 Validate Using the Browser

- use the playwright-qa-agent to validate any UI functionality and visual design
- Iterate if needed

### 5. Update Documentation

- Update README.md if needed
- Be concise and to the point

### 6. Update Plan

- Mark completed items as `[x]`
- Add new subsections if discovered
- Note any blockers or changes

### 7. Review or Continue

- **REVIEW mode:** Prepare for user review:
- **AUTONOMOUS mode:** Continue to next section

### 8. Commit

- Commit with descriptive message
- Format: `feat(phase-X): description`

### 9. Repeat

- Go to step 1 for next section
- Continue until phase complete
- Then proceed to next phase

---

## Mode Setting

**Current Mode:** `REVIEW`

> Set to `AUTONOMOUS` to skip user review between sections.
