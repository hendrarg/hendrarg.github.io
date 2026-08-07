import test from "node:test";
import assert from "node:assert/strict";
import { navObserverThresholds, selectActiveSection } from "../src/js/navigation.mjs";

test("observes entry into sections taller than the viewport band", () => {
  assert.equal(navObserverThresholds[0], 0);
});

test("chooses the most visible intersecting section", () => {
  assert.equal(
    selectActiveSection([
      { target: { id: "impact" }, isIntersecting: true, intersectionRatio: 0.25 },
      { target: { id: "journey" }, isIntersecting: true, intersectionRatio: 0.7 },
    ]),
    "journey",
  );
});

test("returns null when no section intersects", () => {
  assert.equal(
    selectActiveSection([{ target: { id: "impact" }, isIntersecting: false, intersectionRatio: 0 }]),
    null,
  );
});
