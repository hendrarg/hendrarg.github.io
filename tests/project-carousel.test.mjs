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
