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

test("marks each craft card with its staggered shine delay", () => {
  const craftCards = [...html.matchAll(/<article\b[^>]*data-craft-card[^>]*>/g)].map(([card]) => card);
  assert.equal(craftCards.length, 8);
  assert.deepEqual(
    craftCards.map((card) => card.match(/data-shine-delay=["']([^"']+)["']/)?.[1]),
    ["0s", "1.2s", "2.4s", "3.6s", "4.8s", "6s", "7.2s", "8.4s"],
  );
});

test("restores the quality profile terminal wording with semantic syntax tokens", () => {
  const terminalBar = html.match(/<[^>]+class=["'][^"']*terminal__bar[^"']*["'][^>]*>([\s\S]*?)<\/div>/)?.[1] ?? "";
  const terminalSource = html.match(/<ol\b[^>]*class=["'][^"']*terminal__code[^"']*["'][^>]*>([\s\S]*?)<\/ol>/)?.[1] ?? "";

  assert.match(terminalBar, /quality-profile\.ts/);
  assert.doesNotMatch(terminalSource, /aria-hidden=["']true["']/);
  for (const tokenClass of ["token-keyword", "token-string"]) {
    assert.match(terminalSource, new RegExp(`class=["'][^"']*${tokenClass}[^"']*["']`));
  }
});

test("declares real audio without autoplay", () => {
  assert.match(html, /<audio[^>]+preload=["']metadata["']/);
  assert.match(html, /resource\/urangsunda\.webm/);
  assert.doesNotMatch(html, /<audio[^>]+autoplay/i);
});

test("renders eight projects inside an accessible carousel", () => {
  assert.equal((html.match(/data-project-slide/g) ?? []).length, 8);
  assert.match(html, /data-project-carousel/);
  assert.match(html, /data-project-previous[^>]+aria-label=["']Previous project["']/);
  assert.match(html, /data-project-next[^>]+aria-label=["']Next project["']/);
  assert.match(html, /data-project-dots/);
  assert.match(html, /data-project-caption[^>]+aria-live=["']polite["']/);
  assert.doesNotMatch(html, /data-project-carousel[^>]+tabindex=/);
  assert.match(html, /data-project-dots[^>]+role=["']group["']/);
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

test("defines the About checkpoint timeline with accessible decoration", () => {
  assert.match(html, /data-about-checkpoints/);

  const checkpoints = [...html.matchAll(/<[^>]+\bdata-about-checkpoint(?:\s|=|>)[^>]*>/g)];
  assert.equal(checkpoints.length, 3);
  for (const label of ["Build with intent", "Automate the critical path", "Ship with confidence"]) {
    assert.ok(html.includes(label), `missing ${label}`);
  }
  assert.match(html, /data-about-checkpoint-connector[^>]+aria-hidden=["']true["']/);
});
