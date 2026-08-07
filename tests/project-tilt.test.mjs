import test from "node:test";
import assert from "node:assert/strict";
import { calculateProjectTilt } from "../src/js/project-tilt.mjs";

test("limits project cards to a restrained five-degree tilt", () => {
  const rect = { left: 0, top: 0, width: 100, height: 100 };
  assert.deepEqual(calculateProjectTilt(rect, 100, 0), {
    rotateX: 5,
    rotateY: 5,
    xRatio: 1,
    yRatio: 0,
  });
});
