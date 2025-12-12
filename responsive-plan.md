# Rosie Races codebase – analysis and refactoring plan for landscape‑only PWA

## 1 Current state and problems

### 1.1 PWA HTML shell

* **Viewport meta** – `index.html` still uses a basic viewport tag
  (`<meta name="viewport" content="width=device-width, initial-scale=1.0" />`) and does not include **`viewport‑fit=cover`** or disable user scaling【514369045329059†L349-L356】.  Without these attributes the game will not utilise the full screen on iOS and may shrink when the address bar appears.
* **PWA meta** – iOS PWA tags are present (`apple‑mobile‑web‑app‑capable`, `status‑bar‑style`, touch icon)【514369045329059†L343-L367】, but there is no script to correct the viewport height based on the dynamic toolbar height on mobile.
* **Safe area insets** – there are no CSS `env(safe‑area‑inset-*)` paddings around the app; controls may overlap the notch or home indicator on iPhones.

### 1.2 Web App Manifest

* The current `manifest.json` sets `"orientation": "landscape"`【964257474426697†L1-L7】.  Since the app is meant to **always be used in landscape**, this orientation lock is appropriate; however, we should ensure the app notifies the user to rotate their device when opened in portrait.
* The manifest uses `start_url: "/rosie-races/"` and `display: "standalone"`【964257474426697†L4-L7】, which are correct for a PWA hosted on GitHub Pages.  The colours could still be aligned to the game palette.

### 1.3 App container and layout

* The main React component (`App.tsx`) decides whether to switch to a “phone landscape” layout using a media query `(max-height: 500px) and (orientation: landscape)`【830754640414115†L31-L35】.  This threshold‑based approach is brittle and ties the layout to specific pixel heights.  It does not account for different phone widths or DPI, and there is no branch for tablets in landscape.
* When in the phone‑landscape branch, the component uses `height: 100dvh` on a `Box` and configures Phaser with `RESIZE` mode【830754640414115†L59-L67】.  This ensures the canvas fills the screen, but it depends on the relatively new `dvh` unit and does not provide a fallback via JavaScript.
* In other cases the component falls back to a Material UI `Container` with a fixed size (not shown), which leaves large margins on tablet and desktop, reducing immersion.
* The `GameContainer` component has a default Phaser configuration with design resolution 1024×768 and uses `Phaser.Scale.FIT`【731927332643857†L4-L13】.  This results in letterboxing on wide screens and may shrink the game on tall monitors.  Only the phone‑landscape branch overrides the scale mode to `RESIZE`【830754640414115†L59-L67】.

### 1.4 Game scene

* `RaceScene` computes track and checkpoint positions based on `this.scale.width` and `this.scale.height`【875915224072963†L0-L8】.  However, the scene does not subscribe to Phaser scale resize events, so if the canvas size changes (e.g., due to safe‑area adjustments or browser chrome changes) the positions are not recalculated.  The game must be reloaded to recalc.
* The track configuration leaves space on the right for the TAP button overlay【43645607031921†L37-L40】.  This is appropriate for landscape mode, but the amount of space should adapt based on the actual overlay width on different devices.

### 1.5 Other observations

* The overlay (timer, TAP button, results) is positioned relative to the full screen rather than the visible game area.  When letterboxing occurs, elements may float outside the canvas area.
* There is no logic to prevent overscroll or pinch‑zoom gestures on mobile, which can disrupt gameplay.

## 2 Refactoring goals

Since the app is intentionally **landscape‑only**, the goals are streamlined compared to the previous report:

1. **Keep the landscape orientation lock** in the manifest, and display a friendly prompt asking the user to rotate their device if opened in portrait.
2. **Fill the entire safe‑area** in landscape on iPhone, iPad and desktop, adjusting for notches and home indicators.
3. **Compute the real viewport height** using `visualViewport` and store it in a CSS variable for robust full‑screen height on mobile.
4. **Distinguish phones from tablets/desktop** based on viewport width (not height) to choose an appropriate Phaser scale mode:
   * Use **RESIZE/ENVELOP** for small devices in landscape (phones) so the game fills the screen and cropping is acceptable.
   * Use **FIT** for tablets and desktops to preserve the aspect ratio with letterboxing if necessary.
5. **Subscribe to Phaser resize events** and recompute track positions when the game container size changes.
6. **Align React overlays** relative to the visible game canvas, and use safe‑area paddings for control placement.
7. **Prevent unwanted browser gestures** during gameplay.

## 3 Refactoring plan

### 3.1 Update PWA shell and manifest

1. **Modify `index.html`**:
   * Update the viewport meta tag to include `viewport‑fit=cover` and disable user scaling:
     ```html
     <meta name="viewport"
           content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover" />
     ```
   * Insert a small script before the React bundle to compute a `--vh` CSS variable based on `visualViewport.height`.  For example:
     ```js
     function setVH() {
       const h = (window.visualViewport?.height || window.innerHeight) * 0.01;
       document.documentElement.style.setProperty('--vh', `${h}px`);
     }
     setVH();
     window.addEventListener('resize', setVH);
     window.visualViewport?.addEventListener('resize', setVH);
     window.visualViewport?.addEventListener('scroll', setVH);
     ```
     Use this variable in CSS: `height: calc(var(--vh) * 100)`.
   * Apply `touch-action: none` and `overscroll-behavior: none` to the top‑level wrapper to disable pinch‑zoom and pull‑to‑refresh.
   * Add safe‑area padding via CSS:
     ```css
     .app-viewport {
       width: 100vw;
       height: calc(var(--vh) * 100);
       padding-top: env(safe-area-inset-top);
       padding-right: env(safe-area-inset-right);
       padding-bottom: env(safe-area-inset-bottom);
       padding-left: env(safe-area-inset-left);
       overflow: hidden;
       position: relative;
     }
     ```

2. **Manifest**:
   * Keep `"orientation": "landscape"` since the app should run only in landscape.
   * Optionally change `display` to `fullscreen` for a cleaner experience.
   * Update `background_color` and `theme_color` to match the green and pink colours used in the game.

3. **Rotation prompt**:
   * Create a simple React component that checks `window.matchMedia('(orientation: landscape)').matches`.  If false, display a full‑screen message such as “Please rotate your device to landscape mode to play Rosie Races.”

### 3.2 Layout and device detection

1. **Replace height‑threshold media query** with a width‑based check.  For example:
   ```ts
   const isPhone = useMediaQuery('(max-width: 850px)');
   const isLandscape = useMediaQuery('(orientation: landscape)');
   const isPhoneLandscape = isPhone && isLandscape;
   ```
   The app will never render a portrait version, but it can decide between phone and tablet/desktop layouts in landscape.

2. **AppViewport component**:
   * Wrap the entire game in a top‑level `<div className="app-viewport">` that applies the safe‑area paddings and uses the computed `--vh` for height.

3. **Phaser configuration**:
   * Define a base configuration: `{ scene: [RaceScene], backgroundColor: '#4CAF50' }`.
   * Create two scale configurations:
     ```ts
     const resizeConfig = {
       scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH }
     };
     const fitConfig = {
       scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width: 1280, height: 720 }
     };
     ```
   * Select `resizeConfig` when `isPhoneLandscape` is true; otherwise use `fitConfig` for tablets and desktops.

4. **Refactor `App.tsx`**:
   * Remove branches for portrait layouts.  Only two branches remain: phone‑landscape and tablet/desktop.
   * For phone‑landscape, fill the entire wrapper with the game canvas and overlay the TAP button on the right.  For tablet/desktop, center the game with letterboxing and overlay the controls relative to the visible canvas.

5. **Overlay alignment**:
   * Use `position: absolute; inset: 0; pointer-events: none` on the overlay container.
   * Measure the canvas’s `getBoundingClientRect()` after each resize to determine the visible game area and position the timer, volume control and TAP button relative to it.
   * Use safe‑area paddings to offset controls so they don’t overlap the notch or home indicator.

### 3.3 Scene resizing

1. **Listen for Phaser scale resize events** in `RaceScene`:
   ```ts
   this.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
     const { width, height } = gameSize;
     // recompute laneHeight, startLineX, finishLineX, etc.
     this.laneHeight = height / TRACK_CONFIG.LANE_COUNT;
     this.startLineX = width * TRACK_CONFIG.START_LINE_RATIO;
     this.finishLineX = width * TRACK_CONFIG.FINISH_LINE_RATIO;
     // reposition sprites, checkpoint arches, etc.
   });
   ```
2. **Adapt overlay spacing** – The `FINISH_LINE_RATIO` and reserved space for the TAP button may need tuning for very small or very large screens.  Expose this ratio as a constant and adjust based on `isPhoneLandscape`.
3. **Physics bounds** – update `this.physics.world.setBounds(0, 0, width, height)` on resize to ensure collision boundaries stay correct.

### 3.4 Testing and iteration

1. Test on iPhone and iPad in landscape (including rotated orientation detection) and on desktop browsers with wide monitors.
2. Verify that safe‑area paddings work correctly on devices with notches and that the TAP button is always reachable.
3. Ensure the rotation prompt appears only when the device is in portrait.
4. Confirm that disabling pinch‑zoom and overscroll does not interfere with other UI elements.

## 4 Summary

This landscape‑only refactoring plan focuses on refining Rosie Races for consistent full‑screen play in landscape orientation.  The existing codebase locks the PWA to landscape【964257474426697†L1-L7】 but relies on brittle height‑based media queries and lacks safe‑area support and resize handling.  By updating the viewport meta tag, computing a real viewport height variable, adding safe‑area paddings, selecting Phaser scale modes based on device width, subscribing to resize events in the scene and aligning overlays relative to the visible canvas, the game will provide a polished experience on phones, tablets and desktops while remaining landscape‑exclusive.