# Portfolio Interaction Revisions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the hero player separate into clear 3D layers on hover, animate the About terminal character by character, and replace the Selected Work grid with an accessible 3D carousel.

**Architecture:** Keep audio behavior isolated from pointer presentation, turn terminal typing and carousel navigation into pure functions with small DOM adapters, and preserve semantic HTML as the no-JavaScript source of truth. CSS owns the visual depth and fallback layouts; JavaScript only supplies interaction state and normalized values.

**Tech Stack:** Semantic HTML5, Tailwind CSS 3.2 build pipeline, custom CSS, vanilla ES modules, Node.js built-in test runner, in-app browser verification.

## Global Constraints

- Keep all approved English copy, eight project records, current CV link, and `resource/urangsunda.webm` audio source.
- Use no new runtime or development dependencies.
- Player layers separate only on hover for fine-pointer devices and remain flat for coarse pointers or reduced motion.
- Terminal source code remains semantic and complete without JavaScript; the animated visual layer is hidden from assistive technology.
- Carousel supports buttons, dots, keyboard arrows, swipe, wrap-around, reduced motion, and a horizontal no-JavaScript fallback.
- All production changes follow red-green-refactor: add one failing behavioral test, run it, implement the smallest change, and run it again.
- Run every shell command through `rtk`.

---

## File Structure

- Modify `index.html`: add terminal visual output and convert the project grid into semantic carousel markup.
- Modify `src/input.css`: add hover-controlled player depth, terminal typing presentation, carousel depth states, fallbacks, responsive rules, and reduced-motion rules.
- Modify `src/js/player-tilt.mjs`: expose bounded layer offsets and explicit hover/rest state.
- Modify `src/js/terminal.mjs`: replace line-fade delays with character frames, one-time activation, and timer cleanup.
- Create `src/js/project-carousel.mjs`: own carousel index math, swipe intent, DOM rendering, controls, and cleanup.
- Modify `src/js/main.mjs`: initialize the carousel instead of per-project tilt.
- Delete `src/js/project-tilt.mjs`: individual card tilt conflicts with carousel transforms.
- Modify `tests/player.test.mjs`: protect 18-degree tilt and pointer-relative layer offsets.
- Modify `tests/terminal.test.mjs`: protect character cadence and generated typing frames.
- Create `tests/project-carousel.test.mjs`: protect wrapping, relative slide roles, and swipe thresholds.
- Modify `tests/content.test.mjs`: protect semantic carousel and terminal fallback markup.
- Modify `tests/responsive.test.mjs`: protect the carousel stage/fallback and player layer variables.
- Delete `tests/project-tilt.test.mjs`: behavior is superseded by carousel tests.
- Rebuild `dist/output.css`: publish the CSS source changes.

---

### Task 1: Hover-Separated Player Layers

**Files:**
- Modify: `src/js/player-tilt.mjs`
- Modify: `src/input.css`
- Test: `tests/player.test.mjs`
- Test: `tests/responsive.test.mjs`

**Interfaces:**
- Consumes: player root `[data-player]`, card `[data-player-card]`, existing CSS pointer variables, and `window.matchMedia`.
- Produces: `calculateLayerOffset(tilt, maxOffset = 12) -> { x: number, y: number }`, `data-hovered="true|false"`, `--layer-x`, and `--layer-y`.

- [ ] **Step 1: Write failing tests for bounded tilt and independent parallax**

Update `tests/player.test.mjs` to import `calculateLayerOffset` and assert hand-derived values:

```js
import { calculateLayerOffset, calculateTilt } from "../src/js/player-tilt.mjs";

test("caps player tilt at eighteen degrees", () => {
  const rect = { left: 100, top: 50, width: 200, height: 100 };
  assert.deepEqual(calculateTilt(rect, 300, 50, 18), {
    rotateX: 18,
    rotateY: 18,
    xRatio: 1,
    yRatio: 0,
  });
});

test("maps normalized pointer position to a bounded layer offset", () => {
  assert.deepEqual(calculateLayerOffset({ xRatio: 0.5, yRatio: 0.5 }), { x: 0, y: 0 });
  assert.deepEqual(calculateLayerOffset({ xRatio: 1, yRatio: 0 }, 12), { x: 12, y: -12 });
  assert.deepEqual(calculateLayerOffset({ xRatio: 0, yRatio: 1 }, 12), { x: -12, y: 12 });
});
```

Add this behavior guard to `tests/responsive.test.mjs`:

```js
test("keeps player depth dormant until hover state is active", () => {
  assert.match(css, /--profile-depth:\s*0px/);
  assert.match(css, /\[data-hovered="true"\][^{]*\{[^}]*--profile-depth:\s*35px/s);
  assert.match(css, /--waveform-depth:\s*100px/);
});
```

- [ ] **Step 2: Run the focused tests and verify RED**

Run:

```powershell
rtk node --test tests/player.test.mjs tests/responsive.test.mjs
```

Expected: FAIL because `calculateLayerOffset` and hover-gated depth variables do not exist, and the current default tilt remains 20 degrees.

- [ ] **Step 3: Implement pointer hover state and layer offsets**

In `src/js/player-tilt.mjs`, keep `calculateTilt` and add:

```js
export function calculateLayerOffset(tilt, maxOffset = 12) {
  return {
    x: cleanNumber((tilt.xRatio - 0.5) * maxOffset * 2),
    y: cleanNumber((tilt.yRatio - 0.5) * maxOffset * 2),
  };
}
```

Within each fine-pointer player root:

```js
const reset = () => {
  root.dataset.hovered = "false";
  root.style.setProperty("--rotate-x", "0deg");
  root.style.setProperty("--rotate-y", "0deg");
  root.style.setProperty("--pointer-x", "50%");
  root.style.setProperty("--pointer-y", "50%");
  root.style.setProperty("--layer-x", "0px");
  root.style.setProperty("--layer-y", "0px");
};

const onPointerEnter = () => {
  root.dataset.hovered = "true";
};
```

Change the render call to `calculateTilt(..., 18)`, derive `const offset = calculateLayerOffset(tilt)`, and set `--layer-x` / `--layer-y`. Register `pointerenter`, use `reset` for `pointerleave`, and remove all three listeners during cleanup.

In `src/input.css`, define zero-depth defaults on `.quality-player`:

```css
.quality-player {
  --profile-depth: 0px;
  --track-depth: 0px;
  --timeline-depth: 0px;
  --controls-depth: 0px;
  --waveform-depth: 0px;
  --layer-x: 0px;
  --layer-y: 0px;
}

.quality-player[data-hovered="true"] {
  --profile-depth: 35px;
  --track-depth: 50px;
  --timeline-depth: 65px;
  --controls-depth: 75px;
  --waveform-depth: 100px;
}
```

Replace fixed `translateZ(...)` transforms with transforms that combine each named depth variable, a small per-layer multiplier of `--layer-x` / `--layer-y`, and the existing scale. Add transitions for transform and shadow. Under coarse-pointer and reduced-motion media queries, force every depth and offset variable to zero.

- [ ] **Step 4: Run focused and full tests and verify GREEN**

Run:

```powershell
rtk node --test tests/player.test.mjs tests/responsive.test.mjs
rtk npm test
```

Expected: focused tests PASS and the full suite has no regression.

- [ ] **Step 5: Commit the player change**

```powershell
rtk git add src/js/player-tilt.mjs src/input.css tests/player.test.mjs tests/responsive.test.mjs
rtk git commit -m "fix: separate player layers on hover"
```

---

### Task 2: Character-Typed Terminal

**Files:**
- Modify: `index.html`
- Modify: `src/js/terminal.mjs`
- Modify: `src/input.css`
- Test: `tests/terminal.test.mjs`
- Test: `tests/content.test.mjs`

**Interfaces:**
- Consumes: semantic `[data-terminal-line] code` text, `[data-terminal-output]`, reduced-motion media query, `IntersectionObserver`, and window timers.
- Produces: `terminalCharacterDelay(character, reducedMotion) -> number`, `buildTerminalFrames(lines) -> Array<{ lineIndex, value, delay }>`, and terminal states `idle|typing|complete`.

- [ ] **Step 1: Replace line-delay tests with failing character-frame tests**

Replace `tests/terminal.test.mjs` with:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { buildTerminalFrames, terminalCharacterDelay } from "../src/js/terminal.mjs";

test("uses readable character cadence with punctuation pauses", () => {
  assert.equal(terminalCharacterDelay("a", false), 22);
  assert.equal(terminalCharacterDelay(",", false), 90);
  assert.equal(terminalCharacterDelay("}", false), 90);
  assert.equal(terminalCharacterDelay("\n", false), 160);
  assert.equal(terminalCharacterDelay("a", true), 0);
});

test("builds terminal frames without losing earlier line content", () => {
  assert.deepEqual(buildTerminalFrames(["ab", "c"]), [
    { lineIndex: 0, value: "a", delay: 22 },
    { lineIndex: 0, value: "ab", delay: 160 },
    { lineIndex: 1, value: "c", delay: 22 },
  ]);
});
```

Add to `tests/content.test.mjs`:

```js
test("keeps semantic terminal source separate from its visual typing output", () => {
  assert.equal((html.match(/data-terminal-line/g) ?? []).length, 13);
  assert.match(html, /data-terminal-output[^>]+aria-hidden=["']true["']/);
});
```

- [ ] **Step 2: Run focused tests and verify RED**

```powershell
rtk node --test tests/terminal.test.mjs tests/content.test.mjs
```

Expected: FAIL because character helpers and `[data-terminal-output]` are absent.

- [ ] **Step 3: Implement pure frame generation and one-time DOM playback**

Use these pure functions in `src/js/terminal.mjs`:

```js
export function terminalCharacterDelay(character, reducedMotion = false) {
  if (reducedMotion) return 0;
  if (character === "\n") return 160;
  if (/[,;\]})]/.test(character)) return 90;
  return 22;
}

export function buildTerminalFrames(lines, reducedMotion = false) {
  const frames = [];
  lines.forEach((line, lineIndex) => {
    for (let length = 1; length <= line.length; length += 1) {
      const character = line[length - 1];
      const isLineEnd = length === line.length && lineIndex < lines.length - 1;
      frames.push({
        lineIndex,
        value: line.slice(0, length),
        delay: isLineEnd ? terminalCharacterDelay("\n", reducedMotion) : terminalCharacterDelay(character, reducedMotion),
      });
    }
  });
  return frames;
}
```

In `index.html`, place this after `.terminal__code`:

```html
<ol class="terminal__typing" data-terminal-output aria-hidden="true"></ol>
```

Replace `initTerminal` with a DOM adapter equivalent to:

```js
export function initTerminal({ document, window }) {
  const terminal = document.querySelector("[data-terminal]");
  const output = terminal?.querySelector("[data-terminal-output]");
  const sourceCodes = [...(terminal?.querySelectorAll("[data-terminal-line] code") ?? [])];
  if (!terminal || !output || sourceCodes.length === 0) return () => {};

  const lines = sourceCodes.map((code) => code.textContent ?? "");
  const visualCodes = lines.map(() => {
    const item = document.createElement("li");
    const code = document.createElement("code");
    item.append(code);
    output.append(item);
    return code;
  });
  terminal.dataset.typingReady = "true";

  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  let observer;
  let timer = 0;
  let started = false;

  const finishImmediately = () => {
    visualCodes.forEach((code, index) => { code.textContent = lines[index]; });
    terminal.dataset.state = "complete";
  };

  const start = () => {
    if (started) return;
    started = true;
    observer?.disconnect();
    terminal.dataset.state = "typing";
    const frames = buildTerminalFrames(lines);
    let index = 0;
    const advance = () => {
      const frame = frames[index];
      visualCodes.forEach((code, lineIndex) => {
        code.parentElement?.toggleAttribute("data-active", lineIndex === frame.lineIndex);
      });
      visualCodes[frame.lineIndex].textContent = frame.value;
      index += 1;
      if (index >= frames.length) {
        terminal.dataset.state = "complete";
        return;
      }
      timer = window.setTimeout(advance, frame.delay);
    };
    advance();
  };

  if (media.matches || typeof window.IntersectionObserver !== "function") {
    finishImmediately();
  } else {
    terminal.dataset.state = "idle";
    observer = new window.IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) start();
    }, { threshold: 0.3 });
    observer.observe(terminal);
  }

  return () => {
    observer?.disconnect();
    if (timer) window.clearTimeout(timer);
  };
}
```

In `src/input.css`, remove the old `terminal-line-in` rules. Keep `.terminal__code` visible unless JavaScript has successfully prepared the typing layer. Visually hide—but do not `display:none`—the semantic list when `data-typing-ready="true"`, and show `.terminal__typing`. Add a cursor pseudo-element to the active/final code line and retain the existing cursor blink animation. Reduced motion removes the blink and shows the final content immediately.

- [ ] **Step 4: Run focused and full tests and verify GREEN**

```powershell
rtk node --test tests/terminal.test.mjs tests/content.test.mjs
rtk npm test
```

Expected: all terminal/content tests PASS and no existing tests regress.

- [ ] **Step 5: Commit the terminal change**

```powershell
rtk git add index.html src/js/terminal.mjs src/input.css tests/terminal.test.mjs tests/content.test.mjs
rtk git commit -m "fix: type terminal content character by character"
```

---

### Task 3: Carousel State and Navigation Engine

**Files:**
- Create: `src/js/project-carousel.mjs`
- Create: `tests/project-carousel.test.mjs`

**Interfaces:**
- Consumes: integer slide index, slide count, touch start/end X coordinates.
- Produces: `wrapIndex(index, length) -> number`, `slideRole(index, current, length) -> active|previous|next|back`, `swipeStep(startX, endX, threshold = 48) -> -1|0|1`, and `initProjectCarousel({ document, window }) -> cleanup`.

- [ ] **Step 1: Write failing pure navigation tests**

Create `tests/project-carousel.test.mjs`:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { slideRole, swipeStep, wrapIndex } from "../src/js/project-carousel.mjs";

test("wraps carousel indices in both directions", () => {
  assert.equal(wrapIndex(8, 8), 0);
  assert.equal(wrapIndex(-1, 8), 7);
  assert.equal(wrapIndex(3, 8), 3);
});

test("assigns active and neighboring depth roles across the wrap boundary", () => {
  assert.equal(slideRole(0, 0, 8), "active");
  assert.equal(slideRole(1, 0, 8), "next");
  assert.equal(slideRole(7, 0, 8), "previous");
  assert.equal(slideRole(4, 0, 8), "back");
});

test("requires a deliberate horizontal swipe before changing slides", () => {
  assert.equal(swipeStep(200, 130), 1);
  assert.equal(swipeStep(130, 200), -1);
  assert.equal(swipeStep(200, 170), 0);
});
```

- [ ] **Step 2: Run the new test and verify RED**

```powershell
rtk node --test tests/project-carousel.test.mjs
```

Expected: FAIL because `src/js/project-carousel.mjs` does not exist.

- [ ] **Step 3: Implement the pure helpers and resilient initializer**

Create `src/js/project-carousel.mjs` starting with:

```js
export function wrapIndex(index, length) {
  if (length <= 0) return 0;
  return ((index % length) + length) % length;
}

export function slideRole(index, current, length) {
  const difference = wrapIndex(index - current, length);
  if (difference === 0) return "active";
  if (difference === 1) return "next";
  if (difference === length - 1) return "previous";
  return "back";
}

export function swipeStep(startX, endX, threshold = 48) {
  const distance = endX - startX;
  if (Math.abs(distance) < threshold) return 0;
  return distance < 0 ? 1 : -1;
}
```

Add this resilient DOM adapter after the pure helpers:

```js
export function initProjectCarousel({ document, window }) {
  const root = document.querySelector("[data-project-carousel]");
  const stage = root?.querySelector("[data-project-stage]");
  const slides = [...(root?.querySelectorAll("[data-project-slide]") ?? [])];
  const previous = root?.querySelector("[data-project-previous]");
  const next = root?.querySelector("[data-project-next]");
  const dotsRoot = root?.querySelector("[data-project-dots]");
  const caption = {
    root: root?.querySelector("[data-project-caption]"),
    tech: root?.querySelector("[data-project-caption-tech]"),
    title: root?.querySelector("[data-project-caption-title]"),
    description: root?.querySelector("[data-project-caption-description]"),
    link: root?.querySelector("[data-project-caption-link]"),
  };
  if (!root || !stage || slides.length === 0 || !previous || !next || !dotsRoot || Object.values(caption).some((node) => !node)) {
    return () => {};
  }

  let current = 0;
  let touchStartX = null;
  const dotHandlers = [];
  const dots = slides.map((slide, index) => {
    const dot = document.createElement("button");
    const title = slide.dataset.title || `Project ${index + 1}`;
    dot.type = "button";
    dot.setAttribute("role", "tab");
    dot.setAttribute("aria-label", `Show ${title}`);
    const handler = () => { current = index; render(); };
    dot.addEventListener("click", handler);
    dotHandlers.push(() => dot.removeEventListener("click", handler));
    dotsRoot.append(dot);
    return dot;
  });

  const render = () => {
    root.dataset.activeIndex = String(current);
    slides.forEach((slide, index) => {
      const active = index === current;
      slide.dataset.slideState = slideRole(index, current, slides.length);
      slide.setAttribute("aria-hidden", String(!active));
      slide.querySelectorAll("a").forEach((link) => { link.tabIndex = active ? 0 : -1; });
      dots[index].setAttribute("aria-selected", String(active));
    });
    const slide = slides[current];
    caption.tech.textContent = slide.dataset.tech || "";
    caption.title.textContent = slide.dataset.title || "";
    caption.description.textContent = slide.dataset.description || "";
    caption.link.href = slide.dataset.href || "#";
    caption.link.textContent = slide.dataset.cta || "View project";
  };
  const move = (step) => { current = wrapIndex(current + step, slides.length); render(); };
  const onPrevious = () => move(-1);
  const onNext = () => move(1);
  const onKeyDown = (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    move(event.key === "ArrowRight" ? 1 : -1);
  };
  const onTouchStart = (event) => { touchStartX = event.changedTouches[0]?.clientX ?? null; };
  const onTouchEnd = (event) => {
    if (touchStartX === null) return;
    const step = swipeStep(touchStartX, event.changedTouches[0]?.clientX ?? touchStartX);
    touchStartX = null;
    if (step) move(step);
  };

  previous.addEventListener("click", onPrevious);
  next.addEventListener("click", onNext);
  root.addEventListener("keydown", onKeyDown);
  root.addEventListener("touchstart", onTouchStart, { passive: true });
  root.addEventListener("touchend", onTouchEnd, { passive: true });
  root.dataset.enhanced = "true";
  render();

  return () => {
    previous.removeEventListener("click", onPrevious);
    next.removeEventListener("click", onNext);
    root.removeEventListener("keydown", onKeyDown);
    root.removeEventListener("touchstart", onTouchStart);
    root.removeEventListener("touchend", onTouchEnd);
    dotHandlers.forEach((remove) => remove());
    delete root.dataset.enhanced;
  };
}
```

- [ ] **Step 4: Run the focused test and verify GREEN**

```powershell
rtk node --test tests/project-carousel.test.mjs
```

Expected: 3 tests PASS.

- [ ] **Step 5: Commit the carousel engine**

```powershell
rtk git add src/js/project-carousel.mjs tests/project-carousel.test.mjs
rtk git commit -m "feat: add project carousel navigation engine"
```

---

### Task 4: Carousel Markup, 3D Presentation, and Integration

**Files:**
- Modify: `index.html`
- Modify: `src/input.css`
- Modify: `src/js/main.mjs`
- Delete: `src/js/project-tilt.mjs`
- Delete: `tests/project-tilt.test.mjs`
- Modify: `tests/content.test.mjs`
- Modify: `tests/responsive.test.mjs`

**Interfaces:**
- Consumes: `initProjectCarousel({ document, window })` from Task 3 and the eight existing project records.
- Produces: `[data-project-carousel]`, `[data-project-stage]`, eight `[data-project-slide]` elements, labeled navigation, dots, and an active caption.

- [ ] **Step 1: Write failing semantic and responsive carousel tests**

Replace the old project-grid test in `tests/content.test.mjs` with:

```js
test("renders eight projects inside an accessible carousel", () => {
  assert.equal((html.match(/data-project-slide/g) ?? []).length, 8);
  assert.match(html, /data-project-carousel/);
  assert.match(html, /data-project-previous[^>]+aria-label=["']Previous project["']/);
  assert.match(html, /data-project-next[^>]+aria-label=["']Next project["']/);
  assert.match(html, /data-project-dots/);
  assert.match(html, /data-project-caption[^>]+aria-live=["']polite["']/);
});
```

Add to `tests/responsive.test.mjs`:

```js
test("uses a scrollable project fallback and a layered enhanced stage", () => {
  assert.match(css, /\.project-carousel__stage\s*\{[^}]*overflow-x:\s*auto/s);
  assert.match(css, /\.project-carousel\[data-enhanced="true"\][^{]*\.project-carousel__stage\s*\{[^}]*overflow:\s*visible/s);
  assert.match(css, /\[data-slide-state="active"\]/);
  assert.match(css, /\[data-slide-state="previous"\]/);
  assert.match(css, /\[data-slide-state="next"\]/);
  assert.match(css, /\[data-slide-state="back"\]/);
});
```

- [ ] **Step 2: Run focused tests and verify RED**

```powershell
rtk node --test tests/content.test.mjs tests/responsive.test.mjs
```

Expected: FAIL because the section still uses `.project-grid` and has no carousel controls or state selectors.

- [ ] **Step 3: Convert the eight project records to semantic carousel markup**

In `index.html`, replace `.project-grid` with this structure, repeating the existing eight project records as eight articles:

```html
<div class="project-carousel" data-project-carousel tabindex="0" aria-label="Selected work carousel">
  <div class="project-carousel__stage" data-project-stage>
    <article
      class="project-slide glass-panel"
      data-project-slide
      data-title="Cypress With BDD"
      data-tech="Cypress · Cucumber"
      data-description="Browser automation using behavior-driven scenarios."
      data-href="https://github.com/hendrarg/Cypress-BDD"
      data-cta="View repository"
    >
      <img src="img/cypress.png" alt="Cypress BDD project preview" />
      <div><p>Cypress · Cucumber</p><h3>Cypress With BDD</h3><span>Browser automation using behavior-driven scenarios.</span><a href="https://github.com/hendrarg/Cypress-BDD" target="_blank" rel="noopener noreferrer">View repository</a></div>
    </article>
  </div>
  <div class="project-carousel__controls">
    <button type="button" data-project-previous aria-label="Previous project">←</button>
    <div data-project-dots role="tablist" aria-label="Choose project"></div>
    <button type="button" data-project-next aria-label="Next project">→</button>
  </div>
  <div class="project-carousel__caption" data-project-caption aria-live="polite">
    <p data-project-caption-tech>Cypress · Cucumber</p>
    <h3 data-project-caption-title>Cypress With BDD</h3>
    <span data-project-caption-description>Browser automation using behavior-driven scenarios.</span>
    <a data-project-caption-link href="https://github.com/hendrarg/Cypress-BDD" target="_blank" rel="noopener noreferrer">View repository</a>
  </div>
</div>
```

Use this exact record map for all eight slides:

| Title | Technologies | Description | Image / alt | URL / CTA |
| --- | --- | --- | --- | --- |
| Cypress With BDD | Cypress · Cucumber | Browser automation using behavior-driven scenarios. | `img/cypress.png` / Cypress BDD project preview | `https://github.com/hendrarg/Cypress-BDD` / View repository |
| Loopstudios Website | Tailwind CSS · Frontend | Responsive interface slicing practice with Tailwind CSS. | `img/loopstudios.png` / Loopstudios landing page preview | `https://github.com/hendrarg/loopstudios` / View repository |
| UI & API Test Cases | Test Design · Documentation | Structured scenarios and coverage documentation. | `img/Test Case.png` / UI and API test case spreadsheet preview | `https://docs.google.com/spreadsheets/d/1pVBdMFEdSd1t4S8kwO3iXD7S7IStWpfriXgP-JyaIbw/edit?gid=139859808#gid=139859808` / View spreadsheet |
| REST-Assured API Automation | Java · Rest-Assured | Reusable API checks for service-level confidence. | `img/automatonAPI.png` / REST-Assured API automation project preview | `https://github.com/hendrarg/AutomationAPI` / View repository |
| Robot Framework API Challenge | Python · Robot Framework | API quality exercise backed by a FastAPI service. | `img/Fast API.png` / Robot Framework API challenge preview | `https://github.com/hendrarg/ADL-QA_CHALANGE` / View repository |
| Java Puzzle Automation | Java · Browser Automation | Automated problem-solving for the 1-to-50 web puzzle. | `img/puzzle.png` / Java puzzle automation preview | `https://github.com/hendrarg/puzzle-1to50` / View repository |
| Appium Mobile Automation | Appium · Java · TestNG | Android UI automation and reusable mobile checks. | `img/appium.png` / Appium mobile automation project preview | `https://github.com/hendrarg/AppiumTest` / View repository |
| Katalon Sauce Demo | Katalon Studio · Web | End-to-end commerce flow automation in Katalon. | `img/katalon.png` / Katalon Sauce Demo project preview | `https://github.com/hendrarg/Sauce-Demo-Test-in-Katalon` / View repository |

Every external action keeps `target="_blank"` and `rel="noopener noreferrer"`.

- [ ] **Step 4: Add fallback and enhanced 3D carousel styles**

In `src/input.css`:

- Make `.project-carousel__stage` a horizontal scroll-snap list by default so no-JavaScript users can reach all eight links.
- Under `.project-carousel[data-enhanced="true"]`, make the stage positioned, centered, fixed-height, `overflow: visible`, and `transform-style: preserve-3d`. This attribute is set only after all required carousel nodes are found, so malformed markup retains the horizontal fallback.
- Position enhanced slides absolutely and apply state transforms: active at full size/front, previous and next smaller and offset to each side, and back slides smaller/lower/behind.
- Give only the active slide full opacity and pointer events; side/back slides are decorative previews.
- Style caption, arrows, and dot indicators with the existing purple/cyan tokens and at least 44px control hit targets.
- At mobile widths, reduce the stage height and side offset without creating page-level overflow.
- In reduced motion, remove spatial transitions and use a short opacity transition only.

The core state rules must be explicit:

```css
.project-slide[data-slide-state="active"] { z-index: 30; opacity: 1; transform: translate3d(-50%, -50%, 40px) scale(1); }
.project-slide[data-slide-state="previous"] { z-index: 20; opacity: 0.72; transform: translate3d(-88%, -46%, -40px) rotateY(4deg) scale(0.78); }
.project-slide[data-slide-state="next"] { z-index: 20; opacity: 0.72; transform: translate3d(-12%, -46%, -40px) rotateY(-4deg) scale(0.78); }
.project-slide[data-slide-state="back"] { z-index: 4; opacity: 0.18; transform: translate3d(-50%, -38%, -180px) scale(0.58); }
```

- [ ] **Step 5: Integrate the carousel and remove conflicting tilt code**

In `src/js/main.mjs`, replace:

```js
import { initProjectTilt } from "./project-tilt.mjs";
```

with:

```js
import { initProjectCarousel } from "./project-carousel.mjs";
```

Replace the initializer call with:

```js
initProjectCarousel({ document, window });
```

Delete `src/js/project-tilt.mjs` and `tests/project-tilt.test.mjs` because per-card tilt would overwrite carousel transforms.

- [ ] **Step 6: Run focused and full tests and verify GREEN**

```powershell
rtk node --test tests/project-carousel.test.mjs tests/content.test.mjs tests/responsive.test.mjs
rtk npm test
```

Expected: carousel/content/responsive tests PASS and the full suite has no failures.

- [ ] **Step 7: Build CSS and commit the integrated carousel**

```powershell
rtk npm run build:css
rtk git add index.html src/input.css src/js/main.mjs src/js/project-carousel.mjs tests/content.test.mjs tests/responsive.test.mjs dist/output.css
rtk git add -u src/js/project-tilt.mjs tests/project-tilt.test.mjs
rtk git commit -m "feat: restore compact 3d project carousel"
```

---

### Task 5: Browser Regression Verification and Release Check

**Files:**
- Modify only if verification exposes a reproducible bug: the smallest relevant source and regression test file.

**Interfaces:**
- Consumes: built static portfolio served from the feature worktree.
- Produces: evidence that the three approved revisions work across interaction modes and viewports.

- [ ] **Step 1: Run the complete automated release check**

```powershell
rtk npm run check
rtk git diff --check
rtk git status --short
```

Expected: all Node tests PASS, Tailwind build exits 0, `git diff --check` is empty, and status contains only intentional built changes if the build altered them.

- [ ] **Step 2: Verify player hover behavior in the local browser**

At a desktop viewport:

1. Reload the local page after the CSS build.
2. Record computed transforms for profile, waveform, track, timeline, and controls before hover.
3. Move the pointer across the outer player container.
4. Confirm `data-hovered="true"`, card rotation is bounded by 18 degrees, and all five layers have distinct matrix3d depth/offset values.
5. Move the pointer outside and confirm state and transforms return to rest without flicker.
6. Play, pause, seek, and restart the real audio to confirm presentation changes did not alter playback.

- [ ] **Step 3: Verify terminal typing and fallback behavior**

1. Reload and scroll until the terminal reaches its trigger point.
2. Observe an early frame and confirm the first visual line contains only a partial string.
3. Observe a later frame and confirm character count increased while prior lines remained complete.
4. Wait for `data-state="complete"` and confirm all 13 lines match their semantic source text.
5. Scroll away and back; confirm typing does not restart.
6. Emulate reduced motion and confirm all lines appear immediately with no blinking/movement.
7. Disable JavaScript and confirm the semantic source list remains visible.

- [ ] **Step 4: Verify carousel interaction and responsive behavior**

At desktop width:

1. Confirm one active, one previous, one next, and five back slides.
2. Use next, previous, and dot controls; confirm caption/link updates and index wraps at both ends.
3. Focus the carousel and use left/right arrows.
4. Confirm inactive slide links are not tabbable.

At 320px mobile width:

1. Confirm there is no page-level horizontal overflow.
2. Swipe more than 48px in each direction and confirm one-step navigation.
3. Confirm arrow controls are at least 44px and the active card/caption remain readable.

With reduced motion and with JavaScript disabled, confirm the opacity-only enhanced state and horizontal scroll fallback respectively.

- [ ] **Step 5: Fix only evidence-backed regressions with a new RED/GREEN cycle**

If a browser check fails, first add the narrowest automated reproduction to the relevant test file, run it to confirm RED, make the smallest source change, and rerun focused plus full tests. Do not bundle unrelated visual cleanup.

- [ ] **Step 6: Commit final verification fixes if any**

If files changed:

```powershell
rtk git add index.html src/input.css src/js tests dist/output.css
rtk git commit -m "test: verify revised portfolio interactions"
```

If no files changed, do not create an empty commit.
