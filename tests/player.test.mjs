import test from "node:test";
import assert from "node:assert/strict";
import { calculateLayerOffset, calculateTilt } from "../src/js/player-tilt.mjs";
import { formatTime, playerState } from "../src/js/player-audio.mjs";

test("maps the pointer to bounded tilt and ratios", () => {
  const rect = { left: 100, top: 50, width: 200, height: 100 };
  assert.deepEqual(calculateTilt(rect, 200, 100), {
    rotateX: 0,
    rotateY: 0,
    xRatio: 0.5,
    yRatio: 0.5,
  });
  assert.deepEqual(calculateTilt(rect, 300, 50), {
    rotateX: 20,
    rotateY: 20,
    xRatio: 1,
    yRatio: 0,
  });
});

test("caps player tilt at eighteen degrees", () => {
  const rect = { left: 100, top: 50, width: 200, height: 100 };
  assert.deepEqual(calculateTilt(rect, 300, 50, 18), {
    rotateX: 18,
    rotateY: 18,
    xRatio: 1,
    yRatio: 0,
  });
});

test("maps normalized pointer position to a bounded layer offset", () => {
  assert.deepEqual(calculateLayerOffset({ xRatio: 0.5, yRatio: 0.5 }), { x: 0, y: 0 });
  assert.deepEqual(calculateLayerOffset({ xRatio: 1, yRatio: 0 }, 12), { x: 12, y: -12 });
  assert.deepEqual(calculateLayerOffset({ xRatio: 0, yRatio: 1 }, 12), { x: -12, y: 12 });
});

test("formats finite audio time and protects invalid metadata", () => {
  assert.equal(formatTime(0), "0:00");
  assert.equal(formatTime(65), "1:05");
  assert.equal(formatTime(Number.NaN), "0:00");
});

test("derives an explicit player state", () => {
  assert.equal(playerState({ paused: false, ended: false, error: false }), "playing");
  assert.equal(playerState({ paused: true, ended: true, error: false }), "ended");
  assert.equal(playerState({ paused: true, ended: false, error: true }), "error");
});
