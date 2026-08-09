import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const css = await readFile(new URL("../src/input.css", import.meta.url), "utf8");

test("allows the body to shrink below 320px without page-level horizontal overflow", () => {
  const bodyRule = css.match(/body\s*\{[^}]+\}/s)?.[0] ?? "";

  assert.doesNotMatch(bodyRule, /min-width\s*:/);
  assert.match(bodyRule, /overflow-x:\s*hidden/);
});

test("compensates player control size for the 3D layer scale", () => {
  const controlsRule = css.match(/\.quality-player__controls button\s*\{[^}]+\}/s)?.[0] ?? "";
  assert.match(controlsRule, /width:\s*46px/);
  assert.match(controlsRule, /height:\s*46px/);
});

test("keeps player depth dormant until hover state is active", () => {
  assert.match(css, /--profile-depth:\s*0px/);
  assert.match(css, /\[data-hovered="true"\][^{]*\{[^}]*--profile-depth:\s*35px/s);
  assert.match(css, /--waveform-depth:\s*100px/);
});

test("uses a readable static list and a sticky scroll-scrubbed panel when enhanced", () => {
  assert.match(css, /\.work-scrub\[data-enhanced="true"\]\s+\.work-scrub__panel\s*\{[^}]*position:\s*sticky/s);
  assert.match(css, /\.work-scrub\[data-enhanced="true"\]\s+\.work-scrub__panel\s*\{[^}]*top:\s*7rem/s);
  assert.match(css, /\.work-scrub\[data-enhanced="true"\]\s+\.work-scrub__list\s*\{[^}]*display:\s*none/s);
  assert.match(css, /\.work-scrub__media\s*\{[^}]*overflow:\s*hidden/s);
  assert.match(css, /\.work-scrub__media img\[data-active="true"\]\s*\{[^}]*opacity:\s*1/s);
  assert.match(css, /\.work-scrub__spacer\s*\{[^}]*height:\s*calc\(var\(--scrub-count,\s*8\)\s*\*\s*40vh\)/s);
  assert.match(css, /\.work-item__copy a\s*\{[^}]*min-height:\s*44px/s);
  assert.match(css, /@media\s*\(max-width:\s*639px\)\s*\{[\s\S]*?\.work-scrub__media\s*\{[^}]*order:\s*-1/s);
  assert.doesNotMatch(css, /\.project-carousel/);
  assert.doesNotMatch(css, /\.work-section\s*\{[^}]*overflow:\s*clip/);
});

test("adds a staggered conic-gradient shine and disables it for reduced motion", () => {
  const craftShine = css.match(/\.craft-card::before\s*\{[^}]+\}/s)?.[0] ?? "";
  assert.match(craftShine, /conic-gradient/);
  assert.match(craftShine, /animation-delay:\s*var\(--shine-delay\)/);
  assert.match(
    css,
    /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[^}]*\.craft-card::before\s*\{[^}]*animation:\s*none/s,
  );
});

test("keeps About checkpoint entrances staggered on one shared loop and honors reduced motion", () => {
  assert.match(css, /\.about-checkpoints::before/);
  const checkpointRule = css.match(/\.about-checkpoints\s+\[data-about-checkpoint\]\s*\{[^}]+\}/s)?.[0] ?? "";
  assert.match(checkpointRule, /animation:\s*checkpoint-loop-first\s+8s\b[^;]*\binfinite/);
  assert.doesNotMatch(checkpointRule, /animation-delay\s*:/);

  assert.match(
    css,
    /\.about-checkpoints\s+\[data-about-checkpoint\]:nth-child\(2\)\s*\{[^}]*animation-name:\s*checkpoint-loop-second/s,
  );
  assert.match(
    css,
    /\.about-checkpoints\s+\[data-about-checkpoint\]:nth-child\(3\)\s*\{[^}]*animation-name:\s*checkpoint-loop-third/s,
  );

  const schedules = [
    ["checkpoint-loop-first", "8%", "18%"],
    ["checkpoint-loop-second", "17.375%", "27.375%"],
    ["checkpoint-loop-third", "26.75%", "36.75%"],
  ];

  for (const [name, hiddenUntil, visibleFrom] of schedules) {
    const keyframes = css.match(new RegExp(`@keyframes\\s+${name}\\s*\\{([\\s\\S]*?)\\n\\}`))?.[1] ?? "";
    assert.match(keyframes, new RegExp(`0%,\\s*${hiddenUntil.replace(".", "\\.")}\\s*\\{\\s*opacity:\\s*0`));
    assert.match(keyframes, new RegExp(`${visibleFrom.replace(".", "\\.")},\\s*70%\\s*\\{\\s*opacity:\\s*1`));
    assert.match(keyframes, /82%,\s*100%\s*\{\s*opacity:\s*0/);
  }

  const reducedMotion = css.match(/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{([\s\S]*?)\n\}/)?.[1] ?? "";
  assert.match(
    reducedMotion,
    /\.about-checkpoints\s+\[data-about-checkpoint\]\s*\{[^}]*animation:\s*none\s*!important[^}]*opacity:\s*1[^}]*transform:\s*none/s,
  );
});
