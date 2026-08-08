# Technical Craft Shine & Python Terminal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add staggered looping border shine to every Technical craft card and restyle the typing terminal as a Python quicksort example with reference-like syntax colors.

**Architecture:** Keep the feature static-first and CSS-driven. Craft cards receive stable data markers and CSS custom properties for stagger timing; a conic-gradient pseudo-element supplies the shine without JavaScript. The terminal keeps its current semantic source/output split and typing engine, while HTML token spans and CSS classes provide Python highlighting.

**Tech Stack:** Static HTML, Tailwind CLI build, vanilla ES modules, CSS keyframes, Node test runner.

## Global Constraints

- Do not add a framework, runtime dependency, canvas, or animation library.
- Keep the existing static HTML fallback, terminal intersection trigger, and character-by-character typing behavior.
- Disable the craft sweep under `prefers-reduced-motion: reduce`.
- Preserve the semantic terminal source and `aria-hidden` visual typing output split.

---

### Task 1: Add failing content and style contracts

**Files:**
- Modify: `tests/content.test.mjs`
- Modify: `tests/responsive.test.mjs`

**Interfaces:**
- Produces assertions for craft markers, per-card delay values, Python terminal filename, and Python token classes.

- [ ] **Step 1: Write the failing tests**

Add assertions that the HTML contains eight `[data-craft-card]` markers with
`data-shine-delay="0s"` through `data-shine-delay="7.2s"` in 1.2-second
increments, a terminal bar label of `quicksort.py`, and token classes for
`token-python-keyword`, `token-python-function`, `token-python-builtin`,
`token-python-string`, `token-python-number`, and `token-python-comment`.

Add CSS assertions for `.craft-card::before`, `conic-gradient`,
`animation-delay: var(--shine-delay)`, and a reduced-motion selector that
sets the craft animation to `none`.

- [ ] **Step 2: Run the focused tests to verify they fail**

Run: `rtk node --test tests/content.test.mjs tests/responsive.test.mjs`

Expected: FAIL because the current craft cards have no shine markers/styles and
the terminal still contains the JavaScript profile sample.

- [ ] **Step 3: Commit the red tests**

```powershell
rtk git add tests/content.test.mjs tests/responsive.test.mjs
rtk git commit -m "test: specify craft shine and python terminal contracts"
```

### Task 2: Implement staggered Technical craft shine

**Files:**
- Modify: `index.html` (Technical craft card articles)
- Modify: `src/input.css` (craft card styles)

**Interfaces:**
- Consumes: Task 1 HTML/CSS assertions.
- Produces: Eight `.craft-card` elements with `data-craft-card` and
  `style="--shine-delay: ..."` values consumed by CSS.

- [ ] **Step 1: Add stable card markers and delays**

Change each craft article to use `class="craft-card glass-panel"`, add
`data-craft-card`, and add inline custom-property values:

```html
<article class="craft-card glass-panel" data-craft-card style="--shine-delay: 0s">
```

Use `1.2s`, `2.4s`, `3.6s`, `4.8s`, `6s`, `7.2s`, and `8.4s` for the remaining
cards. Keep all existing headings and descriptions.

- [ ] **Step 2: Add the minimal shine CSS**

Add the following structure to `src/input.css`:

```css
.craft-card {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  border-color: rgba(216, 211, 236, 0.1);
}

.craft-card::before {
  position: absolute;
  inset: -1px;
  z-index: -1;
  border-radius: inherit;
  background: conic-gradient(from 0deg, transparent 0 68%, rgba(196, 181, 253, 0.05) 76%, rgba(255, 255, 255, 0.9) 82%, rgba(56, 189, 248, 0.35) 86%, transparent 94%);
  content: "";
  opacity: 0.82;
  transform: rotate(0deg);
  animation: craft-shine 6.8s linear infinite;
  animation-delay: var(--shine-delay);
  pointer-events: none;
}

@keyframes craft-shine {
  to { transform: rotate(360deg); }
}

@media (prefers-reduced-motion: reduce) {
  .craft-card::before { animation: none; opacity: 0; }
}
```

Ensure the pseudo-element stays behind the card content and does not create
horizontal overflow.

- [ ] **Step 3: Run focused tests to verify they pass**

Run: `rtk node --test tests/content.test.mjs tests/responsive.test.mjs`

Expected: PASS.

- [ ] **Step 4: Commit the craft animation**

```powershell
rtk git add index.html src/input.css
rtk git commit -m "feat: add staggered craft card shine"
```

### Task 3: Replace terminal sample with Python syntax highlighting

**Files:**
- Modify: `index.html` (terminal source lines and bar title)
- Modify: `src/input.css` (Python token colors)

**Interfaces:**
- Consumes: Existing `initTerminal` line extraction and typing output.
- Produces: Thirteen semantic lines of `quicksort.py` source with Python token
  spans while preserving plain-text content for generated typing output.

- [ ] **Step 1: Replace the semantic terminal source**

Keep exactly 13 `data-terminal-line` elements and use this content shape:

```html
<li data-terminal-line><code><span class="token-python-keyword">def</span> <span class="token-python-function">quicksort</span>(<span class="token-python-parameter">items</span>):</code></li>
<li data-terminal-line><code>    <span class="token-python-keyword">if</span> <span class="token-python-builtin">len</span>(items) &lt;= <span class="token-python-number">1</span>:</code></li>
<li data-terminal-line><code>        <span class="token-python-keyword">return</span> items</code></li>
<li data-terminal-line><code>    pivot = items[<span class="token-python-builtin">len</span>(items) // <span class="token-python-number">2</span>]</code></li>
<li data-terminal-line><code>    left = [x <span class="token-python-keyword">for</span> x <span class="token-python-keyword">in</span> items <span class="token-python-keyword">if</span> x &lt; pivot]</code></li>
<li data-terminal-line><code>    mid = [x <span class="token-python-keyword">for</span> x <span class="token-python-keyword">in</span> items <span class="token-python-keyword">if</span> x == pivot]</code></li>
<li data-terminal-line><code>    right = [x <span class="token-python-keyword">for</span> x <span class="token-python-keyword">in</span> items <span class="token-python-keyword">if</span> x &gt; pivot]</code></li>
<li data-terminal-line><code>    <span class="token-python-keyword">return</span> <span class="token-python-function">quicksort</span>(left) + mid + <span class="token-python-function">quicksort</span>(right)</code></li>
<li data-terminal-line><code></code></li>
<li data-terminal-line><code><span class="token-python-comment"># sort a small sample</span></code></li>
<li data-terminal-line><code>numbers = [<span class="token-python-number">8</span>, <span class="token-python-number">3</span>, <span class="token-python-number">1</span>, <span class="token-python-number">7</span>, <span class="token-python-number">0</span>, <span class="token-python-number">10</span>, <span class="token-python-number">2</span>]</code></li>
<li data-terminal-line><code><span class="token-python-string">"Ready to sort"</span></code></li>
<li data-terminal-line><code><span class="token-python-function">quicksort</span>(numbers)</code></li>
```

Set the terminal bar title to `quicksort.py`. Do not change the output element
or its `aria-hidden="true"` attribute.

- [ ] **Step 2: Add Python token colors**

Add `.token-python-keyword`, `.token-python-function`,
`.token-python-builtin`, `.token-python-parameter`, `.token-python-string`,
`.token-python-number`, and `.token-python-comment` styles using the existing
purple/cyan palette plus muted comment gray. Keep the current `.token-keyword`
and `.token-string` classes for compatibility with any existing content.

- [ ] **Step 3: Run terminal and content tests**

Run: `rtk node --test tests/content.test.mjs tests/terminal.test.mjs`

Expected: PASS, with the existing frame and lifecycle behavior unchanged.

- [ ] **Step 4: Commit the Python terminal**

```powershell
rtk git add index.html src/input.css
rtk git commit -m "feat: restyle terminal with python syntax"
```

### Task 4: Build and verify the combined interaction

**Files:**
- Modify: `dist/output.css` (generated Tailwind output)

**Interfaces:**
- Consumes: Tasks 2 and 3.
- Produces: Verified static portfolio build with responsive and reduced-motion fallbacks.

- [ ] **Step 1: Run the full test and build command**

Run: `rtk npm run check`

Expected: all tests pass and Tailwind reports `Done`.

- [ ] **Step 2: Check formatting and generated diff**

Run: `rtk git diff --check`

Expected: no output and exit code 0.

- [ ] **Step 3: Inspect the local preview**

Reload `http://127.0.0.1:57001/` and verify:

- Craft card sweeps are visible and start at different times.
- Python tokens are visibly distinct in `quicksort.py`.
- The terminal still starts typing on intersection.
- At 320px, craft cards do not cause horizontal overflow.
- Reduced motion disables the sweep and completes terminal rendering.

- [ ] **Step 4: Commit generated CSS and verification updates**

```powershell
rtk git add dist/output.css
rtk git commit -m "build: regenerate portfolio styles"
```
