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
