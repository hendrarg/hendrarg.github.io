import test from "node:test";
import assert from "node:assert/strict";
import { applyProject, initWorkScrub, stateFromProgress, workProgress } from "../src/js/work-scrub.mjs";

class FakeNode {
  constructor() {
    this.attributes = new Map();
    this.dataset = {};
    this.listeners = new Map();
    this.selectors = new Map();
    this.selectorLists = new Map();
    this.style = {
      _props: new Map(),
      setProperty(name, value) {
        this._props.set(name, String(value));
      },
      removeProperty(name) {
        this._props.delete(name);
      },
    };
    this.rect = { top: 0, height: 0 };
    this.textContent = "";
    this.href = "";
    this.offsetHeight = 0;
  }

  addEventListener(type, handler) {
    const handlers = this.listeners.get(type) ?? new Set();
    handlers.add(handler);
    this.listeners.set(type, handlers);
  }

  removeEventListener(type, handler) {
    this.listeners.get(type)?.delete(handler);
  }

  querySelector(selector) {
    return this.selectors.get(selector) ?? null;
  }

  querySelectorAll(selector) {
    return this.selectorLists.get(selector) ?? [];
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }

  getAttribute(name) {
    return this.attributes.get(name) ?? null;
  }

  removeAttribute(name) {
    this.attributes.delete(name);
  }

  getBoundingClientRect() {
    return this.rect;
  }
}

function workScrubFixture({ innerHeight = 900 } = {}) {
  const root = new FakeNode();
  root.rect = { top: 120, height: 3000 };

  const items = ["First", "Second", "Third"].map((title, index) => {
    const item = new FakeNode();
    item.dataset = {
      title,
      tech: `Tech ${index + 1}`,
      description: `Description ${index + 1}`,
      href: `https://example.com/${index + 1}`,
      cta: "View project",
    };
    return item;
  });
  const images = [0, 1, 2].map(() => new FakeNode());
  const heading = new FakeNode();
  const tech = new FakeNode();
  const description = new FakeNode();
  const link = new FakeNode();
  const header = new FakeNode();
  header.offsetHeight = 80;

  root.selectors.set("[data-work-heading]", heading);
  root.selectors.set("[data-work-tech]", tech);
  root.selectors.set("[data-work-description]", description);
  root.selectors.set("[data-work-link]", link);
  root.selectorLists.set("[data-work-item]", items);
  root.selectorLists.set("[data-work-image]", images);

  const document = {
    querySelector: (selector) => {
      if (selector === "[data-work-scrub]") return root;
      if (selector === "[data-header]") return header;
      return null;
    },
  };

  const windowListeners = new Map();
  const window = {
    innerHeight,
    addEventListener(type, handler) {
      windowListeners.set(type, handler);
    },
    removeEventListener(type) {
      windowListeners.delete(type);
    },
    requestAnimationFrame: (callback) => {
      callback();
      return 0;
    },
    cancelAnimationFrame: () => {},
  };

  return {
    description,
    document,
    header,
    heading,
    images,
    items,
    link,
    root,
    tech,
    window,
    windowListeners,
  };
}

test("maps a clamped scroll progress onto a bounded state index", () => {
  assert.equal(stateFromProgress(0, 8), 0);
  assert.equal(stateFromProgress(0.5, 8), 4);
  assert.equal(stateFromProgress(0.99, 8), 7);
  assert.equal(stateFromProgress(1, 8), 7);
  assert.equal(stateFromProgress(-1, 8), 0);
  assert.equal(stateFromProgress(2, 8), 7);
  assert.equal(stateFromProgress(0.99, 4), 3);
  assert.equal(stateFromProgress(0.5, 0), 0);
});

test("measures how far the section has travelled past the sticky trigger", () => {
  const rect = { top: 120, height: 3000 };
  assert.equal(workProgress({ sectionRect: rect, viewportHeight: 900, triggerTop: 120 }), 0);
  assert.equal(workProgress({ sectionRect: rect, viewportHeight: 900, triggerTop: 220 }), 100 / 2100);
  rect.top = 120 - 2100;
  assert.equal(workProgress({ sectionRect: rect, viewportHeight: 900, triggerTop: 120 }), 1);
  rect.height = 100;
  assert.equal(workProgress({ sectionRect: rect, viewportHeight: 900, triggerTop: 120 }), 1);
});

test("writes one project's data into the panel and crossfades its image", () => {
  const fixture = workScrubFixture();
  const { images, items } = fixture;
  applyProject({
    items,
    images,
    index: 1,
    heading: fixture.heading,
    tech: fixture.tech,
    description: fixture.description,
    link: fixture.link,
  });

  assert.equal(fixture.tech.textContent, "Tech 2");
  assert.equal(fixture.heading.textContent, "Second");
  assert.equal(fixture.description.textContent, "Description 2");
  assert.equal(fixture.link.href, "https://example.com/2");
  assert.equal(fixture.link.textContent, "View project");
  assert.equal(images[1].getAttribute("data-active"), "true");
  assert.equal(images[0].getAttribute("data-active"), null);
  assert.equal(images[2].getAttribute("data-active"), null);
});

test("ignores out-of-range project indices", () => {
  const fixture = workScrubFixture();
  applyProject({
    items: fixture.items,
    images: fixture.images,
    index: 99,
    heading: fixture.heading,
    tech: fixture.tech,
    description: fixture.description,
    link: fixture.link,
  });
  assert.equal(fixture.heading.textContent, "");
});

test("DOM adapter enhances, scrubs states on scroll, and restores the list on cleanup", () => {
  const fixture = workScrubFixture();
  const cleanup = initWorkScrub({ document: fixture.document, window: fixture.window });

  assert.equal(fixture.root.dataset.enhanced, "true");
  assert.equal(fixture.root.style._props.get("--scrub-count"), "3");
  assert.ok(fixture.windowListeners.has("scroll"));
  assert.ok(fixture.windowListeners.has("resize"));
  assert.equal(fixture.heading.textContent, "First");
  assert.equal(fixture.images[0].getAttribute("data-active"), "true");

  // Scroll so the section is ~53% through its scrub range → middle project.
  fixture.root.rect.top = 120 - 2100 * 0.53;
  fixture.windowListeners.get("scroll")();
  assert.equal(fixture.heading.textContent, "Second");
  assert.equal(fixture.link.href, "https://example.com/2");
  assert.equal(fixture.images[1].getAttribute("data-active"), "true");
  assert.equal(fixture.images[0].getAttribute("data-active"), null);

  // Scroll to the very end → last project.
  fixture.root.rect.top = 120 - 2100;
  fixture.windowListeners.get("scroll")();
  assert.equal(fixture.heading.textContent, "Third");
  assert.equal(fixture.images[2].getAttribute("data-active"), "true");

  cleanup();
  assert.equal(fixture.root.dataset.enhanced, undefined);
  assert.equal(fixture.root.style._props.has("--scrub-count"), false);
  assert.equal(fixture.images[2].getAttribute("data-active"), null);
  assert.equal(fixture.windowListeners.has("scroll"), false);
});

test("enhances the panel regardless of reduced-motion preference", () => {
  // The fake window has no matchMedia at all — the enhancement must not depend
  // on the reduced-motion media query. Instant transitions are handled in CSS.
  const fixture = workScrubFixture();
  const cleanup = initWorkScrub({ document: fixture.document, window: fixture.window });

  assert.equal(fixture.root.dataset.enhanced, "true");
  assert.ok(fixture.windowListeners.has("scroll"));
  assert.ok(fixture.windowListeners.has("resize"));
  assert.equal(fixture.heading.textContent, "First");
  assert.equal(fixture.images[0].getAttribute("data-active"), "true");
  cleanup();
  assert.equal(fixture.root.dataset.enhanced, undefined);
});

test("scrubs states even under reduced motion", () => {
  // Reduced motion only neutralizes the crossfade (CSS); state swapping still runs.
  const fixture = workScrubFixture();
  const cleanup = initWorkScrub({ document: fixture.document, window: fixture.window });

  fixture.root.rect.top = 120 - 2100 * 0.53;
  fixture.windowListeners.get("scroll")();
  assert.equal(fixture.heading.textContent, "Second");
  assert.equal(fixture.images[1].getAttribute("data-active"), "true");
  cleanup();
});
