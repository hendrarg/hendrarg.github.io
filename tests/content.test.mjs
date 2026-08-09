import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

test("contains the approved page structure", () => {
  for (const id of ["home", "impact", "about", "journey", "craft", "work", "credentials", "contact"]) {
    assert.match(html, new RegExp(`<section[^>]+id=["']${id}["']`));
  }
});

test("cache-busts the generated stylesheet for static hosting", () => {
  assert.match(html, /<link[^>]+href=["']dist\/output\.css\?v=[a-f0-9]+["']/i);
});

test("contains current CV facts", () => {
  for (const fact of [
    "Building reliable software, intelligently.",
    "5+ years",
    "Yapp",
    "June 2026",
    "60%",
    "96%",
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

test("renders eight scroll-scrubbed work projects", () => {
  assert.match(html, /data-work-scrub/);
  assert.match(html, /<ol\b[^>]*class=["'][^"']*\bwork-scrub__list\b[^"']*["'][^>]*\bdata-work-list\b/);
  assert.equal((html.match(/data-work-item/g) ?? []).length, 8);
  assert.equal((html.match(/data-work-image/g) ?? []).length, 8);

  const workItems = [...html.matchAll(/<li\b[^>]*\bdata-work-item\b[^>]*>/g)].map(([tag]) => tag);
  assert.equal(workItems.length, 8);
  for (const tag of workItems) {
    for (const key of ["data-title", "data-tech", "data-description", "data-href", "data-cta"]) {
      assert.match(tag, new RegExp(`${key}=["']`), `missing ${key} on a work item`);
    }
  }

  for (const hook of ["data-work-heading", "data-work-tech", "data-work-description", "data-work-link"]) {
    assert.match(html, new RegExp(hook));
  }
  assert.match(html, /class=["'][^"']*\bwork-scrub__panel\b/);
  assert.doesNotMatch(html, /data-project-/);
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
  const aboutSection = html.match(/<section\b[^>]*\bid=["']about["'][^>]*>([\s\S]*?)<\/section>/)?.[1] ?? "";
  const checkpointWrapper = aboutSection.match(
    /<div\b[^>]*class=["'][^"']*\babout-checkpoints\b[^"']*["'][^>]*data-about-checkpoints[^>]*>([\s\S]*?<ol\b[^>]*>[\s\S]*?<\/ol>[\s\S]*?)<\/div>/,
  );
  assert.ok(checkpointWrapper, "missing the About checkpoint wrapper");
  assert.match(checkpointWrapper[1], /<span\b[^>]*class=["'][^"']*\babout-checkpoints__line\b[^"']*["'][^>]*aria-hidden=["']true["']/);

  const allCheckpoints = [...checkpointWrapper[1].matchAll(/<li\b[^>]*\bdata-about-checkpoint(?:\s|=|>)[^>]*>/g)];
  assert.equal(allCheckpoints.length, 3);

  const checkpointList = checkpointWrapper[1].match(/<(ol|ul)\b[^>]*>([\s\S]*?)<\/\1>/);
  assert.ok(checkpointList, "missing a semantic checkpoint list");

  const checkpoints = [...checkpointList[2].matchAll(/(<li\b[^>]*\bdata-about-checkpoint(?:\s|=|>)[^>]*>)([\s\S]*?)<\/li>/g)];
  assert.equal(checkpoints.length, 3);
  const labels = ["Build with intent", "Automate the critical path", "Ship with confidence"];
  const copy = [
    "Connect product needs to a clear quality strategy.",
    "Cover Playwright, API, performance, and mobile flows.",
    "Turn test evidence into clear release decisions.",
  ];
  for (const [index, [, opening, content]] of checkpoints.entries()) {
    assert.match(content, /<span\b[^>]*class=["'][^"']*\babout-checkpoint__node\b[^"']*["'][^>]*aria-hidden=["']true["']/);
    assert.match(content, new RegExp(`<strong>\\s*${labels[index]}\\s*<\\/strong>`));
    assert.match(content, new RegExp(`<p>\\s*${copy[index]}\\s*<\\/p>`));
    assert.match(opening, new RegExp(`style=["'][^"']*--checkpoint-delay:\\s*${index === 0 ? "0s" : index === 1 ? "0.75s" : "1.5s"}`));
  }
});
