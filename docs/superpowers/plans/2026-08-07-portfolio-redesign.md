# Portfolio Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the existing portfolio with the approved English, recruiter-focused, dark cinematic QA portfolio, including a real-audio 3D player, terminal profile, and scroll-driven work journey.

**Architecture:** Keep GitHub Pages as a static deployment. Semantic content lives in `index.html`, Tailwind and focused authored CSS provide layout and effects, and small browser-native ES modules progressively enhance navigation, the terminal, player, journey, and project cards. Pure calculation helpers are exported for Node's built-in test runner so interaction logic can be tested without adding a framework or browser-test dependency.

**Tech Stack:** HTML5, Tailwind CSS 3.2, authored CSS, vanilla JavaScript ES modules, native `<audio>`, Node.js built-in test runner, GitHub Pages

## Global Constraints

- Language: English.
- Primary audience: recruiters and hiring managers; secondary audience: QA leads, SDETs, and software engineers.
- Use only claims, dates, metrics, employers, education, and certifications supported by `D:\CV Hendra\CV_Hendra_Rizal_Gunawan.pdf`.
- Keep a dark-only purple, magenta, coral, and electric-blue presentation with a technical grid, glass panels, and restrained glow.
- Keep static HTML, Tailwind CSS, and vanilla JavaScript modules; do not migrate to Svelte or another component framework.
- Do not add a runtime API, database, contact backend, or unnecessary dependency.
- Real audio must use the user-provided `C:\Users\User\Downloads\urangsunda.weba`, start only after a user gesture, and use `preload="metadata"`.
- All content and direct links must remain readable and usable without JavaScript.
- `prefers-reduced-motion` must disable nonessential motion without disabling user-initiated audio.
- All external links must use `target="_blank"` with `rel="noopener noreferrer"`.
- The page must not overflow horizontally at 320 CSS pixels.

---

## File Structure

- `index.html`: semantic page content, accessible player markup, four work chapters, project grid, contact links, and metadata.
- `tailwind.config.js`: content scan paths, brand colors, fonts, shadows, and animation tokens.
- `src/input.css`: global design system, responsive component CSS, 3D layers, roadmap graphics, reduced-motion rules, and no-JavaScript defaults.
- `src/js/main.mjs`: enhancement entry point and initializer orchestration.
- `src/js/navigation.mjs`: menu behavior, sticky/active navigation, and section reveal observation.
- `src/js/terminal.mjs`: line reveal timing and terminal activation.
- `src/js/player-tilt.mjs`: pointer-to-tilt calculation and stable outer-zone 3D transform.
- `src/js/player-audio.mjs`: native audio playback, progress, time display, waveform state, reset controls, and error status.
- `src/js/journey.mjs`: scroll progress calculation, chapter activation, and center-line updates.
- `src/js/project-tilt.mjs`: restrained pointer tilt for project cards using the shared tilt calculation.
- `tests/assets.test.mjs`: verifies deployable CV and WebM signatures.
- `tests/content.test.mjs`: verifies required sections, current CV facts, semantic terminal lines, links, and absence of stale/mojibake content.
- `tests/navigation.test.mjs`: tests active-section selection.
- `tests/terminal.test.mjs`: tests line reveal timing and reduced-motion behavior.
- `tests/player.test.mjs`: tests tilt math, time formatting, and player-state derivation.
- `tests/journey.test.mjs`: tests roadmap progress clamping and milestone activation thresholds.
- `resource/CV_Hendra_Rizal_Gunawan.pdf`: deployed copy of the latest CV.
- `resource/urangsunda.webm`: deployed WebM audio copied from the approved `.weba` source.
- `dist/output.css`: generated production Tailwind output.
- `dist/script.js`: remove after `index.html` uses the new ES module entry point.

---

### Task 1: Lock the Static Build and Deployable Assets

**Files:**
- Create: `tests/assets.test.mjs`
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `tailwind.config.js`
- Modify: `src/input.css`
- Replace: `resource/CV_Hendra_Rizal_Gunawan.pdf`
- Create: `resource/urangsunda.webm`

**Interfaces:**
- Produces: `npm run build:css`, `npm test`, and `npm run check` commands used by every later task.
- Produces: deployable `/resource/CV_Hendra_Rizal_Gunawan.pdf` and `/resource/urangsunda.webm` assets.

- [ ] **Step 1: Write the failing binary-asset test**

Create `tests/assets.test.mjs`:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("deploys the latest resume as a PDF", async () => {
  const file = await readFile(path.join(root, "resource", "CV_Hendra_Rizal_Gunawan.pdf"));
  assert.equal(file.subarray(0, 4).toString("ascii"), "%PDF");
});

test("deploys the approved track as WebM audio", async () => {
  const file = await readFile(path.join(root, "resource", "urangsunda.webm"));
  assert.deepEqual([...file.subarray(0, 4)], [0x1a, 0x45, 0xdf, 0xa3]);
});
```

- [ ] **Step 2: Run the test and confirm the missing audio failure**

Run: `node --test tests/assets.test.mjs`

Expected: the PDF assertion passes and the audio assertion fails with `ENOENT` for `resource/urangsunda.webm`.

- [ ] **Step 3: Copy the approved binary sources into deployable paths**

Run these PowerShell copy operations from the repository root:

```powershell
Copy-Item -LiteralPath 'D:\CV Hendra\CV_Hendra_Rizal_Gunawan.pdf' -Destination 'resource\CV_Hendra_Rizal_Gunawan.pdf' -Force
Copy-Item -LiteralPath 'C:\Users\User\Downloads\urangsunda.weba' -Destination 'resource\urangsunda.webm' -Force
```

- [ ] **Step 4: Replace obsolete dependencies and define deterministic scripts**

Remove SweetAlert2 because the approved contact section uses direct links. Set `package.json` scripts to:

```json
{
  "scripts": {
    "build:css": "tailwindcss -i ./src/input.css -o ./dist/output.css --minify",
    "dev:css": "tailwindcss -i ./src/input.css -o ./dist/output.css --watch",
    "test": "node --test tests/*.test.mjs",
    "check": "npm test && npm run build:css"
  }
}
```

Run `npm uninstall sweetalert2` so `package-lock.json` matches the manifest.

- [ ] **Step 5: Define the approved design tokens and baseline CSS**

Update `tailwind.config.js` so `content` scans `index.html` and `src/js/**/*.mjs`, dark mode is class-free, and `theme.extend` includes these stable values:

```js
colors: {
  ink: "#100c24",
  panel: "#1b1436",
  violet: "#8b5cf6",
  magenta: "#d946ef",
  coral: "#fb7185",
  electric: "#38bdf8",
  mist: "#d8d3ec"
},
fontFamily: {
  sans: ["Poppins", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
  mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"]
}
```

Replace the obsolete teal/light-mode/carousel CSS in `src/input.css` with Tailwind directives, dark body defaults, the grid background, shared `.glass-panel`, `.section-shell`, `.eyebrow`, focus-visible styles, and an initial `@media (prefers-reduced-motion: reduce)` rule that sets scroll behavior to `auto`.

- [ ] **Step 6: Run asset tests and the production CSS build**

Run: `npm run check`

Expected: all asset tests pass and `dist/output.css` is generated without Tailwind warnings.

- [ ] **Step 7: Commit the static foundation**

```bash
git add package.json package-lock.json tailwind.config.js src/input.css dist/output.css tests/assets.test.mjs resource/CV_Hendra_Rizal_Gunawan.pdf resource/urangsunda.webm
git commit -m "build: prepare static portfolio foundation"
```

---

### Task 2: Replace the Page with Current Semantic Content

**Files:**
- Create: `tests/content.test.mjs`
- Replace: `index.html`

**Interfaces:**
- Produces: section IDs `home`, `impact`, `about`, `journey`, `craft`, `work`, `credentials`, and `contact` for navigation and observers.
- Produces: `[data-terminal-line]`, `[data-player]`, `[data-journey]`, `[data-milestone]`, and `[data-project-card]` hooks consumed by later modules.
- Consumes: the two Task 1 assets under `resource/`.

- [ ] **Step 1: Write the failing semantic-content tests**

Create `tests/content.test.mjs` with literal assertions:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

test("contains the approved page structure", () => {
  for (const id of ["home", "impact", "about", "journey", "craft", "work", "credentials", "contact"]) {
    assert.match(html, new RegExp(`<section[^>]+id=["']${id}["']`));
  }
});

test("contains current CV facts", () => {
  for (const fact of [
    "Building reliable software, intelligently.",
    "5+ years",
    "Yapp",
    "June 2026",
    "60%",
    "90%",
    "October 2025",
    "September 2025",
    "January 2022"
  ]) assert.ok(html.includes(fact), `missing ${fact}`);
});

test("does not ship stale or corrupted copy", () => {
  assert.doesNotMatch(html, /4\+ years|Lion Parcel[^<]{0,80}Present|ðŸ|â€|Â·|Halo everyone/i);
});

test("keeps terminal lines and direct contact actions semantic", () => {
  assert.equal((html.match(/data-terminal-line/g) ?? []).length, 13);
  assert.match(html, /mailto:jendraljohn92@gmail\.com/);
  assert.match(html, /https:\/\/wa\.me\/6281223292457/);
  assert.doesNotMatch(html, /<form\b/i);
});

test("declares real audio without autoplay", () => {
  assert.match(html, /<audio[^>]+preload=["']metadata["']/);
  assert.match(html, /resource\/urangsunda\.webm/);
  assert.doesNotMatch(html, /<audio[^>]+autoplay/i);
});
```

- [ ] **Step 2: Run the content tests and verify the old page fails**

Run: `node --test tests/content.test.mjs`

Expected: failures for missing section IDs, current Yapp content, semantic terminal lines, and real audio markup.

- [ ] **Step 3: Replace the document shell, metadata, navigation, hero, and impact row**

Replace `index.html` with an English semantic document containing:

- Title: `Hendra Rizal Gunawan — QA Engineer`
- Description: `QA Engineer with 5+ years of experience building reliable Playwright automation, performance tests, and AI-assisted QA workflows.`
- Sticky navigation labels: `Impact`, `Journey`, `Craft`, `Work`, `Contact`
- Hero eyebrow: `QA Engineer · Playwright · AI-Assisted Testing`
- Hero statement: `Building reliable software, intelligently.`
- Hero role line: `QA Engineer — Building Reliable Automation with Playwright & AI`
- Primary CTA: `Explore my journey` to `#journey`
- Resume CTA: `Download resume` to `resource/CV_Hendra_Rizal_Gunawan.pdf`
- Impact items: `5+ years in quality engineering`, `60% → 90% regression success`, `4 product domains`, and `AI-assisted automation workflows`

Use a skip link, `<header>`, `<nav aria-label="Primary navigation">`, `<main>`, section headings, and a single `<footer>`.

- [ ] **Step 4: Add the approved player and About terminal markup**

The player root must expose stable hooks and semantic controls:

```html
<div class="quality-player" data-player data-state="paused">
  <div class="quality-player__card" data-player-card>
    <div class="quality-player__profile">Hendra Rizal <span>QA Engineer at Yapp</span></div>
    <div class="quality-player__waveform" data-player-waveform aria-hidden="true"></div>
    <div class="quality-player__track">
      <strong>Release Confidence</strong>
      <span>Playwright — AI-Assisted Regression</span>
    </div>
    <input data-player-progress aria-label="Track progress" type="range" min="0" max="100" value="0" />
    <span data-player-elapsed>0:00</span><span data-player-duration>0:00</span>
    <button type="button" data-player-previous aria-label="Restart track">Previous</button>
    <button type="button" data-player-toggle aria-label="Play Release Confidence">Play</button>
    <button type="button" data-player-next aria-label="Restart track">Next</button>
    <p data-player-status role="status" aria-live="polite"></p>
    <audio data-player-audio preload="metadata">
      <source src="resource/urangsunda.webm" type="audio/webm" />
    </audio>
  </div>
</div>
```

Render exactly 15 waveform bars. In `#about`, place the personal summary beside a `quality-profile.ts` `<ol>` containing exactly 13 `[data-terminal-line]` list items. The visible TypeScript object must encode `role: "QA Engineer"`, `experience: "5+ years"`, `current: "Yapp"`, focus on Playwright/performance/AI-assisted QA, and impact `"Regression success: 60% → 90%"`.

- [ ] **Step 5: Add all four current work chapters**

Each `[data-milestone]` article must include a chapter number, role, employer, dates, concise CV-backed context, tools, and a distinct accessible illustration:

1. `Chapter 01` — QA Engineer, Yapp, June 2026–Present; Playwright E2E/API architecture, performance and exploratory testing, and Hermes-assisted PRD-to-test-case workflow.
2. `Chapter 02` — SDET, Lion Parcel under MSBU, October 2025–May 2026; Robot Framework refactor, AI-assisted migration to Playwright, and regression success improvement from 60% to 90%.
3. `Chapter 03` — QA Automation Engineer, Bank BRI under Talent Tech, May 2024–September 2025; Katalon/Cucumber N2N and API automation plus selector-less desktop coverage through RPA.
4. `Chapter 04` — SQA Engineer, Asset Data Solution Sdn Bhd, January 2022–September 2024; Selenium, Appium, Rest-Assured, K6, and cross-platform QA foundation.

Use `data-illustration="prd"`, `migration`, `regression`, and `framework` respectively. Keep every article visible in the initial HTML; JavaScript may only add activation state.

- [ ] **Step 6: Add Craft, Projects, Credentials, Contact, and footer content**

Create skill groups exactly as approved: Automation, BDD, Performance, API, Languages, Database, DevOps and CI/CD, and AI Workflows. Replace the carousel with eight readable project cards using the existing images and links:

- Cypress With BDD — `img/cypress.png` — `https://github.com/hendrarg/Cypress-BDD`
- Loopstudios Website — `img/loopstudios.png` — `https://github.com/hendrarg/loopstudios`
- UI & API Test Cases — `img/Test Case.png` — the existing Google Sheets URL
- REST-Assured API Automation — `img/automatonAPI.png` — `https://github.com/hendrarg/AutomationAPI`
- Robot Framework API Challenge — `img/Fast API.png` — `https://github.com/hendrarg/ADL-QA_CHALANGE`
- Java Puzzle Automation — `img/puzzle.png` — `https://github.com/hendrarg/puzzle-1to50`
- Appium Mobile Automation — `img/appium.png` — `https://github.com/hendrarg/AppiumTest`
- Katalon Sauce Demo — `img/katalon.png` — `https://github.com/hendrarg/Sauce-Demo-Test-in-Katalon`

Credentials must list S1 Information System, Universitas BSI Bandung (2019); D3 Informatics Management, Universitas BSI Tasikmalaya (2017); and the four CV-listed Udemy certifications for Katalon/Selenium, Appium, Cypress/Cucumber BDD, and Playwright JS/TS.

Contact actions must be Email, LinkedIn, GitHub, WhatsApp, and Download Resume. The compact footer contains Hendra's name, `QA Engineer`, social links, and the current year only once.

- [ ] **Step 7: Run semantic-content tests**

Run: `npm test`

Expected: asset and content tests pass.

- [ ] **Step 8: Commit the semantic redesign**

```bash
git add index.html tests/content.test.mjs
git commit -m "feat: replace portfolio with current semantic content"
```

---

### Task 3: Add Navigation and Progressive Section Reveals

**Files:**
- Create: `tests/navigation.test.mjs`
- Create: `src/js/navigation.mjs`
- Create: `src/js/main.mjs`
- Modify: `index.html`
- Modify: `src/input.css`

**Interfaces:**
- Produces: `selectActiveSection(entries): string | null`.
- Produces: `initNavigation({ document, window }): () => void`, returning a cleanup function.
- Produces: `data-js="true"` on `<html>` after module startup.
- Consumes: navigation links using `[data-nav-link]`, menu controls using `[data-menu-toggle]` and `[data-menu]`, and sections using `[data-nav-section]`.

- [ ] **Step 1: Write the failing active-section unit tests**

Create `tests/navigation.test.mjs`:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { selectActiveSection } from "../src/js/navigation.mjs";

test("chooses the most visible intersecting section", () => {
  assert.equal(selectActiveSection([
    { target: { id: "impact" }, isIntersecting: true, intersectionRatio: 0.25 },
    { target: { id: "journey" }, isIntersecting: true, intersectionRatio: 0.7 }
  ]), "journey");
});

test("returns null when no section intersects", () => {
  assert.equal(selectActiveSection([
    { target: { id: "impact" }, isIntersecting: false, intersectionRatio: 0 }
  ]), null);
});
```

- [ ] **Step 2: Run the unit test and verify the missing-module failure**

Run: `node --test tests/navigation.test.mjs`

Expected: failure with `ERR_MODULE_NOT_FOUND` for `src/js/navigation.mjs`.

- [ ] **Step 3: Implement navigation and reveal enhancement**

Implement `selectActiveSection` as a descending intersection-ratio selection over intersecting entries. Implement `initNavigation` to:

- toggle `aria-expanded` and `[data-open]` on the mobile menu;
- close the menu after a navigation link is activated or Escape is pressed;
- set `aria-current="page"` on the active section link;
- add `[data-stuck]` to the header after 24 pixels of scroll;
- reveal each `[data-reveal]` once via `IntersectionObserver`;
- immediately reveal everything if observers are unavailable or reduced motion is active;
- return a cleanup function that disconnects observers and removes event listeners.

- [ ] **Step 4: Wire the module entry point**

Create `src/js/main.mjs` with:

```js
import { initNavigation } from "./navigation.mjs";

document.documentElement.dataset.js = "true";
initNavigation({ document, window });
```

Replace the old script and AOS tags with one deferred module:

```html
<script type="module" src="src/js/main.mjs"></script>
```

Remove both AOS stylesheet links, the AOS script, and inline `AOS.init()`.

- [ ] **Step 5: Add no-JavaScript-safe reveal and navigation styles**

Keep `[data-reveal]` visible by default. Only hide/translate unrevealed elements under `html[data-js="true"]` and `@media (prefers-reduced-motion: no-preference)`. Style `aria-current="page"`, the sticky glass header, 44-pixel menu controls, and mobile open/closed states without relying on JavaScript-generated Tailwind class names.

- [ ] **Step 6: Run tests and build CSS**

Run: `npm run check`

Expected: navigation unit tests and all earlier tests pass; CSS build succeeds.

- [ ] **Step 7: Commit navigation enhancement**

```bash
git add index.html src/input.css src/js/main.mjs src/js/navigation.mjs tests/navigation.test.mjs dist/output.css
git commit -m "feat: add accessible portfolio navigation"
```

---

### Task 4: Animate the Approved About Terminal

**Files:**
- Create: `tests/terminal.test.mjs`
- Create: `src/js/terminal.mjs`
- Modify: `src/js/main.mjs`
- Modify: `src/input.css`

**Interfaces:**
- Produces: `terminalDelay(index: number, reducedMotion: boolean): number`.
- Produces: `initTerminal({ document, window }): () => void`.
- Consumes: the terminal root `[data-terminal]` and the 13 lines `[data-terminal-line]` from Task 2.

- [ ] **Step 1: Write the failing terminal timing tests**

Create `tests/terminal.test.mjs`:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { terminalDelay } from "../src/js/terminal.mjs";

test("stages terminal lines at a readable cadence", () => {
  assert.equal(terminalDelay(0, false), 120);
  assert.equal(terminalDelay(12, false), 1200);
});

test("reveals terminal lines immediately for reduced motion", () => {
  assert.equal(terminalDelay(0, true), 0);
  assert.equal(terminalDelay(12, true), 0);
});
```

- [ ] **Step 2: Run the terminal test and verify it fails**

Run: `node --test tests/terminal.test.mjs`

Expected: `ERR_MODULE_NOT_FOUND` for `src/js/terminal.mjs`.

- [ ] **Step 3: Implement terminal activation**

Implement `terminalDelay` as `reducedMotion ? 0 : 120 + index * 90`. `initTerminal` must set each line's `--line-delay`, activate the terminal once when it intersects at 35%, immediately activate for reduced motion or missing observers, and return an observer cleanup function.

- [ ] **Step 4: Add terminal visuals and module wiring**

Add editor chrome, line-number counters, semantic syntax colors, active-line glow, and a blinking cursor. Scope hidden/reveal states to `html[data-js="true"]` and motion-allowed media queries so all 13 lines stay visible without JavaScript or under reduced motion.

Import and call `initTerminal({ document, window })` from `src/js/main.mjs`.

- [ ] **Step 5: Run tests and build CSS**

Run: `npm run check`

Expected: terminal timing tests and earlier suites pass; CSS build succeeds.

- [ ] **Step 6: Commit the About terminal**

```bash
git add src/input.css src/js/main.mjs src/js/terminal.mjs tests/terminal.test.mjs dist/output.css
git commit -m "feat: add animated quality profile terminal"
```

---

### Task 5: Implement the Real-Audio Layered 3D Player

**Files:**
- Create: `tests/player.test.mjs`
- Create: `src/js/player-tilt.mjs`
- Create: `src/js/player-audio.mjs`
- Modify: `src/js/main.mjs`
- Modify: `src/input.css`

**Interfaces:**
- Produces: `calculateTilt(rect, clientX, clientY, maxTilt = 20): { rotateX, rotateY, xRatio, yRatio }`.
- Produces: `formatTime(seconds: number): string`.
- Produces: `playerState({ paused, ended, error }): "playing" | "paused" | "ended" | "error"`.
- Produces: `initPlayerTilt({ document, window }): () => void` and `initAudioPlayer({ document }): () => void`.
- Consumes: the `[data-player-*]` hooks from Task 2.

- [ ] **Step 1: Write failing player helper tests**

Create `tests/player.test.mjs`:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { calculateTilt } from "../src/js/player-tilt.mjs";
import { formatTime, playerState } from "../src/js/player-audio.mjs";

test("maps the pointer to bounded tilt and ratios", () => {
  const rect = { left: 100, top: 50, width: 200, height: 100 };
  assert.deepEqual(calculateTilt(rect, 200, 100), { rotateX: 0, rotateY: 0, xRatio: 0.5, yRatio: 0.5 });
  assert.deepEqual(calculateTilt(rect, 300, 50), { rotateX: 20, rotateY: 20, xRatio: 1, yRatio: 0 });
});

test("formats finite audio time and protects invalid metadata", () => {
  assert.equal(formatTime(0), "0:00");
  assert.equal(formatTime(65), "1:05");
  assert.equal(formatTime(Number.NaN), "0:00");
});

test("derives an explicit player state", () => {
  assert.equal(playerState({ paused: false, ended: false, error: false }), "playing");
  assert.equal(playerState({ paused: true, ended: true, error: false }), "ended");
  assert.equal(playerState({ paused: true, ended: false, error: true }), "error");
});
```

- [ ] **Step 2: Run player tests and verify missing-module failures**

Run: `node --test tests/player.test.mjs`

Expected: `ERR_MODULE_NOT_FOUND` for the new player modules.

- [ ] **Step 3: Implement stable outer-zone pointer tilt**

`calculateTilt` must clamp normalized pointer coordinates to 0–1, use `(0.5 - yRatio) * maxTilt * 2` for `rotateX`, and `(xRatio - 0.5) * maxTilt * 2` for `rotateY`, rounding values close to zero to `0`.

`initPlayerTilt` must listen on `[data-player]`, not on the moving card. On pointer movement, write `--rotate-x`, `--rotate-y`, `--pointer-x`, and `--pointer-y`; on leave, reset them. Skip listeners for coarse pointers and reduced motion. Use `requestAnimationFrame` to coalesce updates and return a cleanup function.

- [ ] **Step 4: Implement real audio and synchronized UI state**

`formatTime` returns `m:ss`. `playerState` prioritizes error, then ended, then paused/playing. `initAudioPlayer` must:

- call `audio.play()` only from the play button click handler;
- pause on a second click;
- update `data-state`, button label/text, waveform state, range value, elapsed time, and duration on `loadedmetadata`, `play`, `pause`, `timeupdate`, `ended`, and `error`;
- seek from the range input when duration is finite;
- make previous and next reset `currentTime` to zero, preserving current play/pause state;
- catch rejected play promises and show `Audio playback is unavailable in this browser.` in the live status;
- return a cleanup function that pauses audio and removes all listeners.

- [ ] **Step 5: Build the layered card, glare, and waveform CSS**

Use `transform-style: preserve-3d`, a 1400-pixel perspective, and the stable depth system:

- base at `translateZ(0)`;
- profile at approximately `translateZ(36px)`;
- track at approximately `translateZ(48px)`;
- controls at approximately `translateZ(64px)`;
- waveform panel at approximately `translateZ(80px)`.

Add scale compensation, visible overflow, pointer-driven spotlight/glare variables, a restrained monochrome reflection, and 15 independently delayed waveform bars. `[data-state="playing"]` runs the bars; paused, ended, and error states pause them. At coarse-pointer breakpoints render a stable subtle float. In reduced motion remove tilt, float, shine, and waveform movement while leaving controls functional.

- [ ] **Step 6: Wire both player initializers**

Import and call `initPlayerTilt({ document, window })` and `initAudioPlayer({ document })` from `src/js/main.mjs`.

- [ ] **Step 7: Run tests and build CSS**

Run: `npm run check`

Expected: player helper tests and all earlier suites pass; CSS build succeeds.

- [ ] **Step 8: Commit the quality player**

```bash
git add src/input.css src/js/main.mjs src/js/player-tilt.mjs src/js/player-audio.mjs tests/player.test.mjs dist/output.css
git commit -m "feat: add real-audio 3d quality player"
```

---

### Task 6: Implement the Scroll-Driven Living Work Journey

**Files:**
- Create: `tests/journey.test.mjs`
- Create: `src/js/journey.mjs`
- Modify: `src/js/main.mjs`
- Modify: `src/input.css`

**Interfaces:**
- Produces: `calculateJourneyProgress(rect, viewportHeight): number` clamped to 0–1.
- Produces: `isMilestoneActive(rect, viewportHeight): boolean`.
- Produces: `initJourney({ document, window }): () => void`.
- Consumes: `[data-journey]`, `[data-journey-line]`, and four `[data-milestone]` elements.

- [ ] **Step 1: Write failing roadmap calculation tests**

Create `tests/journey.test.mjs`:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { calculateJourneyProgress, isMilestoneActive } from "../src/js/journey.mjs";

test("clamps roadmap progress before, within, and after the journey", () => {
  assert.equal(calculateJourneyProgress({ top: 800, height: 1600 }, 1000), 0);
  assert.equal(calculateJourneyProgress({ top: 0, height: 1600 }, 1000), 0.5);
  assert.equal(calculateJourneyProgress({ top: -1400, height: 1600 }, 1000), 1);
});

test("activates a milestone after it reaches the viewport trigger", () => {
  assert.equal(isMilestoneActive({ top: 720 }, 1000), false);
  assert.equal(isMilestoneActive({ top: 640 }, 1000), true);
});
```

- [ ] **Step 2: Run journey tests and verify the missing-module failure**

Run: `node --test tests/journey.test.mjs`

Expected: `ERR_MODULE_NOT_FOUND` for `src/js/journey.mjs`.

- [ ] **Step 3: Implement scroll progress and sticky milestone activation**

Use a 65% viewport trigger. `calculateJourneyProgress` must compute and clamp `(viewportHeight * 0.65 - rect.top) / (rect.height - viewportHeight * 0.3)`. `isMilestoneActive` returns `rect.top <= viewportHeight * 0.65`.

`initJourney` must:

- update `--journey-progress` through one scheduled animation frame on scroll/resize;
- add `data-active="true"` permanently to each reached milestone;
- show the complete line and every milestone immediately for reduced motion;
- reveal all content if scripting APIs are unavailable;
- return a cleanup function for scroll, resize, media-query, and animation-frame work.

- [ ] **Step 4: Style the alternating roadmap and its four living illustrations**

On desktop, alternate chapter content across a centered dotted line; on mobile, move the line left and keep all content on one side. Fill the line using `transform: scaleY(var(--journey-progress))` with a top origin. Activated nodes glow and chapters remain visible after activation.

Create four scoped animation systems that only run for active chapters and motion-allowed users:

- `[data-illustration="prd"]`: scanning beam and requirement rows resolving into test cases;
- `[data-illustration="migration"]`: radar sweep connecting Robot Framework, AI, and Playwright nodes;
- `[data-illustration="regression"]`: four execution rows progressing to completed status;
- `[data-illustration="framework"]`: Selenium, Appium, API, and K6 tokens orbiting a pulsing QA core.

- [ ] **Step 5: Wire the journey initializer**

Import and call `initJourney({ document, window })` from `src/js/main.mjs`.

- [ ] **Step 6: Run tests and build CSS**

Run: `npm run check`

Expected: progress and milestone tests pass with all earlier suites; CSS build succeeds.

- [ ] **Step 7: Commit the living journey**

```bash
git add src/input.css src/js/main.mjs src/js/journey.mjs tests/journey.test.mjs dist/output.css
git commit -m "feat: add scroll-driven work journey"
```

---

### Task 7: Add Restrained Project Tilt and Finish Responsive States

**Files:**
- Create: `src/js/project-tilt.mjs`
- Modify: `src/js/main.mjs`
- Modify: `src/input.css`
- Modify: `tests/content.test.mjs`

**Interfaces:**
- Produces: `initProjectTilt({ document, window }): () => void`.
- Consumes: `calculateTilt` from `src/js/player-tilt.mjs` with `maxTilt = 5`.
- Consumes: all `[data-project-card]` elements from Task 2.

- [ ] **Step 1: Tighten content tests for project and link integrity**

Add these assertions to `tests/content.test.mjs`:

```js
test("renders eight scan-friendly project cards", () => {
  assert.equal((html.match(/data-project-card/g) ?? []).length, 8);
  assert.doesNotMatch(html, /portfolio-carousel|portfolio-prev|portfolio-next/);
});

test("protects external tabs and image fallbacks", () => {
  const externalLinks = [...html.matchAll(/<a\b[^>]*href=["']https?:[^>]*>/g)].map(([tag]) => tag);
  assert.ok(externalLinks.length > 0);
  for (const tag of externalLinks) {
    assert.match(tag, /target=["']_blank["']/);
    assert.match(tag, /rel=["']noopener noreferrer["']/);
  }
  for (const [, alt] of html.matchAll(/<img\b[^>]*alt=["']([^"']+)["'][^>]*>/g)) assert.ok(alt.trim());
});
```

- [ ] **Step 2: Run the content test and verify it catches any incomplete card markup**

Run: `node --test tests/content.test.mjs`

Expected: pass only after all eight cards, safe external-link attributes, and image alt text are present.

- [ ] **Step 3: Implement lightweight project-card tilt**

`initProjectTilt` must reuse `calculateTilt` with a 5-degree maximum, update each card through `requestAnimationFrame`, reset on pointer leave, skip coarse pointers and reduced motion, and return a cleanup function. It must attach to each stable card wrapper so the pointer target does not move away during the transform.

- [ ] **Step 4: Complete responsive and failure-state CSS**

Finish the approved layouts at 320, 768, and 1440 pixels:

- stack hero and use a stable centered player on mobile;
- keep all touch controls at least 44 by 44 CSS pixels;
- collapse the roadmap to a left rail on mobile;
- use one, two, then three project columns as space permits;
- keep project names and links visible if an image fails;
- preserve visible focus rings and sufficient contrast;
- prevent long URLs, code lines, and player layers from causing horizontal overflow.

Import and call `initProjectTilt({ document, window })` from `src/js/main.mjs`.

- [ ] **Step 5: Remove the obsolete bundled script**

Delete `dist/script.js`. Confirm `index.html` only loads `src/js/main.mjs` and no longer references AOS, SweetAlert2, the theme toggle, or carousel controls.

- [ ] **Step 6: Run the complete static check**

Run: `npm run check`

Expected: every Node test passes and the minified Tailwind build succeeds.

- [ ] **Step 7: Commit responsive interaction polish**

```bash
git add index.html src/input.css src/js/main.mjs src/js/project-tilt.mjs tests/content.test.mjs dist/output.css
git rm dist/script.js
git commit -m "feat: finish responsive project experience"
```

---

### Task 8: Browser Verification and Release Readiness

**Files:**
- Modify if a verified defect requires it: `index.html`
- Modify if a verified defect requires it: `src/input.css`
- Modify if a verified defect requires it: `src/js/*.mjs`
- Modify if source CSS changes: `dist/output.css`

**Interfaces:**
- Consumes: the complete static site and all test/build scripts.
- Produces: a verified GitHub Pages-ready portfolio with no known spec regressions.

- [ ] **Step 1: Run clean automated verification**

Run:

```bash
npm run check
git diff --check
```

Expected: all tests pass, Tailwind builds successfully, and Git reports no whitespace errors.

- [ ] **Step 2: Start the local static server**

Run: `npx serve . -l 56997`

Expected: the root page returns HTTP 200 at `http://localhost:56997/` and serves the PDF and WebM files from `/resource/`.

- [ ] **Step 3: Verify desktop behavior at 1440 × 900**

Using the in-app browser, confirm:

- no console errors;
- the first viewport communicates Hendra's name, QA role, Playwright/AI focus, and primary CTAs;
- pointer movement produces a computed `matrix3d(...)` on the player card;
- profile, track, controls, and waveform have distinct Z transforms without clipping;
- clicking Play advances `audio.currentTime`, time text, range progress, and waveform state; clicking again pauses;
- previous/next reset the same approved track;
- navigation highlights the visible section;
- the terminal reveals 13 lines;
- the journey line grows and exactly four milestones remain activated after being reached;
- all four QA illustrations visibly use different running animation names.

- [ ] **Step 4: Verify tablet and mobile layouts**

At 768 × 1024 and 320 × 568, confirm no horizontal overflow, readable text, a usable mobile menu, 44-pixel controls, a stable non-pointer player, a left-rail journey, and a one-column project grid at 320 pixels.

- [ ] **Step 5: Verify accessibility fallbacks**

Emulate `prefers-reduced-motion: reduce` and confirm the player no longer tilts/floats, waveform and illustrations stop, all terminal lines show, all journey chapters show, and audio still plays after pressing the button.

Disable JavaScript for a page load and confirm navigation anchors, content, project links, contact links, and resume download remain visible and usable.

Keyboard through the page and confirm the skip link, menu, player controls, CTAs, project links, and contact links have visible focus and sensible order.

- [ ] **Step 6: Verify deployable links and stale-copy safeguards**

Open the local resume and audio URLs, then test every external project/contact link. Remove a broken project link or render it as non-clickable text rather than shipping a dead action. Run:

```bash
npm test
rg -n "4\+ years|Lion Parcel.{0,80}Present|ðŸ|â€|Â·|Lorem|placeholder" index.html src
```

Expected: tests pass and the search returns no stale or corrupted portfolio copy in deployed source files.

- [ ] **Step 7: Rebuild after any verification fix and commit release readiness**

Run `npm run check` after the final edit. If verification required a correction, commit only the verified portfolio files:

```bash
git add index.html src dist/output.css tests package.json package-lock.json tailwind.config.js resource/CV_Hendra_Rizal_Gunawan.pdf resource/urangsunda.webm
git commit -m "test: verify portfolio redesign release"
```

If verification required no correction, do not create an empty commit. Do not add `.superpowers/` or `tmp/`; they are local design and PDF-review scratch directories.
