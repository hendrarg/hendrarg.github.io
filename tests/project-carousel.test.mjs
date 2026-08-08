import test from "node:test";
import assert from "node:assert/strict";
import {
  createCarouselController,
  initProjectCarousel,
  slideRole,
  swipeStep,
  wrapIndex,
} from "../src/js/project-carousel.mjs";

class FakeNode {
  constructor() {
    this.attributes = new Map();
    this.children = [];
    this.dataset = {};
    this.listeners = new Map();
    this.selectors = new Map();
    this.selectorLists = new Map();
    this.textContent = "";
    this.href = "";
    this._tabIndex = -1;
  }

  set tabIndex(value) {
    this._tabIndex = value;
    this.attributes.set("tabindex", String(value));
  }

  get tabIndex() {
    return this._tabIndex;
  }

  addEventListener(type, handler) {
    const handlers = this.listeners.get(type) ?? new Set();
    handlers.add(handler);
    this.listeners.set(type, handlers);
  }

  removeEventListener(type, handler) {
    this.listeners.get(type)?.delete(handler);
  }

  dispatch(type, event = {}) {
    const payload = { target: this, preventDefault() {}, ...event };
    this.listeners.get(type)?.forEach((handler) => handler(payload));
  }

  append(child) {
    child.parentElement = this;
    this.children.push(child);
  }

  remove() {
    if (!this.parentElement) return;
    this.parentElement.children = this.parentElement.children.filter((child) => child !== this);
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
    if (name === "tabindex") this._tabIndex = -1;
  }
}

function carouselFixture() {
  const root = new FakeNode();
  const stage = new FakeNode();
  const previous = new FakeNode();
  const next = new FakeNode();
  const dots = new FakeNode();
  const captionRoot = new FakeNode();
  const captionTech = new FakeNode();
  const captionTitle = new FakeNode();
  const captionDescription = new FakeNode();
  const captionLink = new FakeNode();
  const slides = ["First", "Second", "Third"].map((title, index) => {
    const slide = new FakeNode();
    const link = new FakeNode();
    slide.dataset = {
      title,
      tech: `Tech ${index + 1}`,
      description: `Description ${index + 1}`,
      href: `https://example.com/${index + 1}`,
      cta: "View project",
    };
    slide.selectorLists.set("a", [link]);
    return slide;
  });

  root.selectors.set("[data-project-stage]", stage);
  root.selectors.set("[data-project-previous]", previous);
  root.selectors.set("[data-project-next]", next);
  root.selectors.set("[data-project-dots]", dots);
  root.selectors.set("[data-project-caption]", captionRoot);
  root.selectors.set("[data-project-caption-tech]", captionTech);
  root.selectors.set("[data-project-caption-title]", captionTitle);
  root.selectors.set("[data-project-caption-description]", captionDescription);
  root.selectors.set("[data-project-caption-link]", captionLink);
  root.selectorLists.set("[data-project-slide]", slides);

  const document = {
    querySelector: (selector) => (selector === "[data-project-carousel]" ? root : null),
    createElement: () => new FakeNode(),
  };

  return { captionLink, captionTitle, document, dots, next, previous, root, slides };
}

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

test("requires a deliberate primarily-horizontal swipe before changing slides", () => {
  assert.equal(swipeStep({ x: 200, y: 100 }, { x: 130, y: 112 }), 1);
  assert.equal(swipeStep({ x: 130, y: 100 }, { x: 200, y: 112 }), -1);
  assert.equal(swipeStep({ x: 200, y: 100 }, { x: 170, y: 104 }), 0);
  assert.equal(swipeStep({ x: 200, y: 100 }, { x: 130, y: 190 }), 0);
});

test("controller handles buttons, selection, keyboard, and gesture intent", () => {
  const controller = createCarouselController(3);
  assert.equal(controller.index, 0);
  controller.move(-1);
  assert.equal(controller.index, 2);
  controller.select(1);
  assert.equal(controller.index, 1);
  assert.equal(controller.handleKey("ArrowRight"), true);
  assert.equal(controller.index, 2);
  assert.equal(controller.handleKey("Enter"), false);
  assert.equal(controller.handleSwipe({ x: 200, y: 50 }, { x: 120, y: 60 }), true);
  assert.equal(controller.index, 0);
  assert.equal(controller.handleSwipe({ x: 200, y: 50 }, { x: 130, y: 160 }), false);
});

test("DOM adapter renders controls and restores the semantic fallback on cleanup", () => {
  const fixture = carouselFixture();
  const cleanup = initProjectCarousel({ document: fixture.document, window: {} });

  assert.equal(fixture.root.dataset.enhanced, "true");
  assert.equal(fixture.root.tabIndex, 0);
  assert.equal(fixture.slides[0].dataset.slideState, "active");
  assert.equal(fixture.slides[0].getAttribute("aria-hidden"), "false");
  assert.equal(fixture.slides[1].querySelectorAll("a")[0].tabIndex, -1);
  assert.equal(fixture.captionTitle.textContent, "First");
  assert.equal(fixture.dots.children[0].getAttribute("aria-pressed"), "true");

  fixture.next.dispatch("click");
  assert.equal(fixture.root.dataset.activeIndex, "1");
  assert.equal(fixture.captionTitle.textContent, "Second");

  fixture.root.dispatch("keydown", { key: "ArrowRight" });
  assert.equal(fixture.root.dataset.activeIndex, "2");

  fixture.dots.children[0].dispatch("click");
  assert.equal(fixture.root.dataset.activeIndex, "0");
  assert.equal(fixture.captionLink.href, "https://example.com/1");

  fixture.root.dispatch("touchstart", { changedTouches: [{ clientX: 200, clientY: 100 }] });
  fixture.root.dispatch("touchend", { changedTouches: [{ clientX: 120, clientY: 110 }] });
  assert.equal(fixture.root.dataset.activeIndex, "1");
  fixture.root.dispatch("touchstart", { changedTouches: [{ clientX: 200, clientY: 100 }] });
  fixture.root.dispatch("touchcancel");
  fixture.root.dispatch("touchend", { changedTouches: [{ clientX: 100, clientY: 105 }] });
  assert.equal(fixture.root.dataset.activeIndex, "1");

  cleanup();
  assert.equal(fixture.root.dataset.enhanced, undefined);
  assert.equal(fixture.root.dataset.activeIndex, undefined);
  assert.equal(fixture.root.getAttribute("tabindex"), null);
  assert.equal(fixture.slides[0].dataset.slideState, undefined);
  assert.equal(fixture.slides[0].getAttribute("aria-hidden"), null);
  assert.equal(fixture.slides[1].querySelectorAll("a")[0].getAttribute("tabindex"), null);
  assert.equal(fixture.dots.children.length, 0);
});
