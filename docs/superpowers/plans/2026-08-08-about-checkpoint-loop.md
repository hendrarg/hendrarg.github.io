# About Checkpoint Loop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the long About copy beside the terminal with a compact three-step checkpoint timeline that repeatedly appears, holds, fades out, and loops.

**Architecture:** Keep the content semantic in `index.html` as an ordered list. Use CSS custom properties and a single infinite keyframe sequence to stagger each checkpoint, while the existing reveal/observer behavior controls section visibility. No new JavaScript or dependency is needed because reduced motion can be handled entirely by CSS.

**Tech Stack:** Static HTML, CSS keyframes, Tailwind CLI build, Node test runner.

## Global Constraints

- Checkpoints remain semantic list content and readable when JavaScript is disabled.
- Decorative connector and node glow use `aria-hidden="true"`.
- No content depends on animation to be discovered.
- Under `prefers-reduced-motion: reduce`, all checkpoints remain visible without cycling.
- The terminal keeps its existing semantic source and separate `aria-hidden` typing output.

---

### Task 1: Add failing About checkpoint contracts

**Files:**
- Modify: `tests/content.test.mjs`
- Modify: `tests/responsive.test.mjs`

**Interfaces:**
- Produces assertions for the three checkpoint labels, semantic list, connector marker, stagger variables, infinite loop, and reduced-motion fallback.

- [ ] **Step 1: Write the failing tests**

Assert that `index.html` contains `[data-about-checkpoints]`, exactly three
`[data-about-checkpoint]` items, and the labels `Build with intent`,
`Automate the critical path`, and `Ship with confidence`. Assert the decorative
connector has `aria-hidden="true"`.

Assert that `src/input.css` contains `.about-checkpoints::before`,
`animation: checkpoint-loop`, `animation-iteration-count: infinite`, three
`--checkpoint-delay` values, and a reduced-motion rule setting the animation to
`none`.

- [ ] **Step 2: Run focused tests to verify the expected failures**

Run: `rtk node --test tests/content.test.mjs tests/responsive.test.mjs`

Expected: FAIL because the current About section has long paragraphs and no
checkpoint timeline or loop CSS.

- [ ] **Step 3: Commit the red tests**

```powershell
rtk git add tests/content.test.mjs tests/responsive.test.mjs
rtk git commit -m "test: specify about checkpoint loop"
```

### Task 2: Implement semantic checkpoint timeline and loop

**Files:**
- Modify: `index.html` (About copy column)
- Modify: `src/input.css` (checkpoint layout and animation)

**Interfaces:**
- Consumes: Task 1 content/style contracts.
- Produces: Three semantic checkpoint items with CSS-driven staggered loop and
  reduced-motion fallback.

- [ ] **Step 1: Replace the About paragraphs with checkpoint markup**

Use this structure inside the existing About copy column:

```html
<div class="about-checkpoints" data-about-checkpoints>
  <span class="about-checkpoints__line" aria-hidden="true"></span>
  <ol>
    <li data-about-checkpoint style="--checkpoint-delay: 0s">
      <span class="about-checkpoint__node" aria-hidden="true"></span>
      <div><strong>Build with intent</strong><p>Connect product needs to a clear quality strategy.</p></div>
    </li>
    <li data-about-checkpoint style="--checkpoint-delay: 0.75s">
      <span class="about-checkpoint__node" aria-hidden="true"></span>
      <div><strong>Automate the critical path</strong><p>Cover Playwright, API, performance, and mobile flows.</p></div>
    </li>
    <li data-about-checkpoint style="--checkpoint-delay: 1.5s">
      <span class="about-checkpoint__node" aria-hidden="true"></span>
      <div><strong>Ship with confidence</strong><p>Turn test evidence into clear release decisions.</p></div>
    </li>
  </ol>
</div>
```

- [ ] **Step 2: Add the compact timeline layout**

Style the checkpoint wrapper as a relative vertical stack with a thin
connector line, 44px minimum node area, readable text, and no overflow. The
line is decorative; checkpoint content remains in the ordered list.

- [ ] **Step 3: Add the looping animation**

Use a single keyframe with an 8-second cycle. Each checkpoint transitions from
transparent/translated to visible, holds with the other checkpoints, then
fades out during the final portion before the cycle restarts:

```css
.about-checkpoint { animation: checkpoint-loop 8s ease-in-out infinite; animation-delay: var(--checkpoint-delay); }
@keyframes checkpoint-loop {
  0%, 8% { opacity: 0; transform: translateY(0.75rem); }
  18%, 70% { opacity: 1; transform: translateY(0); }
  82%, 100% { opacity: 0; transform: translateY(-0.35rem); }
}
```

Under reduced motion, set animation to `none`, opacity to `1`, and transform to
`none` for every checkpoint. Preserve the existing `data-reveal` section
entrance behavior.

- [ ] **Step 4: Run focused tests to verify the implementation**

Run: `rtk node --test tests/content.test.mjs tests/responsive.test.mjs`

Expected: PASS.

- [ ] **Step 5: Commit the checkpoint implementation**

```powershell
rtk git add index.html src/input.css
rtk git commit -m "feat: add looping about checkpoints"
```

### Task 3: Build and verify the combined About section

**Files:**
- Modify: `dist/output.css` (generated Tailwind output)

**Interfaces:**
- Consumes: Task 2.
- Produces: Verified desktop/mobile About layout and reduced-motion fallback.

- [ ] **Step 1: Run full tests and build**

Run: `rtk npm run check`

Expected: all tests pass and Tailwind reports `Done`.

- [ ] **Step 2: Check formatting**

Run: `rtk git diff --check`

Expected: no output and exit code 0.

- [ ] **Step 3: Inspect the local preview**

Reload `http://127.0.0.1:57001/`, scroll to About, and verify the three
checkpoints enter in order, all remain visible briefly, fade out, and restart.
At 320px confirm the timeline stays beside/above the terminal without
horizontal overflow. Confirm reduced motion leaves all three visible.

- [ ] **Step 4: Commit generated CSS**

```powershell
rtk git add dist/output.css
rtk git commit -m "build: regenerate about checkpoint styles"
```
