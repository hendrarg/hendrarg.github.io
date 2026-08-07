import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

test("contains the approved page structure", () => {
  for (const id of ["home", "impact", "about", "journey", "craft", "work", "credentials", "contact"]) {
    assert.match(html, new RegExp(`<section[^>]+id=["']${id}["']`));
  }
});

test("contains current CV facts", () => {
  for (const fact of [
    "Building reliable software, intelligently.",
    "5+ years",
    "Yapp",
    "June 2026",
    "60%",
    "90%",
    "October 2025",
    "September 2025",
    "January 2022",
  ]) {
    assert.ok(html.includes(fact), `missing ${fact}`);
  }
});

test("does not ship stale or corrupted copy", () => {
  assert.doesNotMatch(html, /4\+ years|Lion Parcel[^<]{0,80}Present|ðŸ|â€|Â·|Halo everyone/i);
});

test("keeps terminal lines and direct contact actions semantic", () => {
  assert.equal((html.match(/data-terminal-line/g) ?? []).length, 13);
  assert.match(html, /mailto:jendraljohn92@gmail\.com/);
  assert.match(html, /https:\/\/wa\.me\/6281223292457/);
  assert.doesNotMatch(html, /<form\b/i);
});

test("keeps semantic terminal source separate from its visual typing output", () => {
  assert.equal((html.match(/data-terminal-line/g) ?? []).length, 13);
  assert.match(html, /data-terminal-output[^>]+aria-hidden=["']true["']/);
});

test("declares real audio without autoplay", () => {
  assert.match(html, /<audio[^>]+preload=["']metadata["']/);
  assert.match(html, /resource\/urangsunda\.webm/);
  assert.doesNotMatch(html, /<audio[^>]+autoplay/i);
});

test("renders eight scan-friendly project cards", () => {
  assert.equal((html.match(/data-project-card/g) ?? []).length, 8);
  assert.doesNotMatch(html, /portfolio-carousel|portfolio-prev|portfolio-next/);
});

test("protects external tabs and image fallbacks", () => {
  const externalLinks = [...html.matchAll(/<a\b[^>]*href=["']https?:[^>]*>/g)].map(([tag]) => tag);
  assert.ok(externalLinks.length > 0);
  for (const tag of externalLinks) {
    assert.match(tag, /target=["']_blank["']/);
    assert.match(tag, /rel=["']noopener noreferrer["']/);
  }
  for (const [, alt] of html.matchAll(/<img\b[^>]*alt=["']([^"']+)["'][^>]*>/g)) {
    assert.ok(alt.trim());
  }
});
