import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const css = await readFile(new URL("../src/input.css", import.meta.url), "utf8");

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

test("uses a scrollable project fallback and a layered enhanced stage", () => {
  assert.match(css, /\.work-section\s*\{[^}]*overflow:\s*clip/s);
  assert.match(css, /\.project-carousel__stage\s*\{[^}]*overflow-x:\s*auto/s);
  assert.match(css, /\.project-carousel\[data-enhanced="true"\][^{]*\.project-carousel__stage\s*\{[^}]*overflow:\s*visible/s);
  assert.match(css, /\[data-slide-state="active"\]/);
  assert.match(css, /\[data-slide-state="previous"\]/);
  assert.match(css, /\[data-slide-state="next"\]/);
  assert.match(css, /\[data-slide-state="back"\]/);
  assert.match(css, /\.project-carousel:focus-visible\s*\{[^}]*outline:/s);
  assert.match(css, /\.project-carousel__dots button\s*\{[^}]*width:\s*44px[^}]*height:\s*44px/s);
});
