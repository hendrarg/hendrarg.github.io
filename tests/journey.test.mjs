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
