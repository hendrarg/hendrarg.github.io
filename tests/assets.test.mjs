import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("deploys the latest resume as a PDF", async () => {
  const file = await readFile(path.join(root, "resource", "CV_Hendra_Rizal_Gunawan.pdf"));
  assert.equal(file.subarray(0, 4).toString("ascii"), "%PDF");
});

test("deploys the approved track as WebM audio", async () => {
  const file = await readFile(path.join(root, "resource", "urangsunda.webm"));
  assert.deepEqual([...file.subarray(0, 4)], [0x1a, 0x45, 0xdf, 0xa3]);
});
