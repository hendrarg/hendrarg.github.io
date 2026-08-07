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
