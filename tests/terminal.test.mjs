import test from "node:test";
import assert from "node:assert/strict";
import * as terminalModule from "../src/js/terminal.mjs";

const { buildTerminalFrames, initTerminal, terminalCharacterDelay } = terminalModule;

class FakeTerminalNode {
  constructor(textContent = "") {
    this.attributes = new Set();
    this.children = [];
    this.dataset = {};
    this._innerHTML = "";
    this.textContent = textContent;
  }

  get innerHTML() {
    return this._innerHTML;
  }

  set innerHTML(value) {
    this._innerHTML = value;
    this.textContent = value
      .replace(/<[^>]+>/g, "")
      .replaceAll("&quot;", '"')
      .replaceAll("&#39;", "'")
      .replaceAll("&lt;", "<")
      .replaceAll("&gt;", ">")
      .replaceAll("&amp;", "&");
  }

  append(child) {
    child.parentElement = this;
    this.children.push(child);
  }

  toggleAttribute(name, force) {
    if (force) this.attributes.add(name);
    else this.attributes.delete(name);
  }
}

function terminalFixture({ reducedMotion = false, lines = ["ab", "c"] } = {}) {
  const output = new FakeTerminalNode();
  const sourceCodes = lines.map((line) => new FakeTerminalNode(line));
  const terminal = new FakeTerminalNode();
  terminal.querySelector = (selector) => (selector === "[data-terminal-output]" ? output : null);
  terminal.querySelectorAll = (selector) => (selector === "[data-terminal-line] code" ? sourceCodes : []);

  const document = {
    querySelector: (selector) => (selector === "[data-terminal]" ? terminal : null),
    createElement: () => new FakeTerminalNode(),
  };

  let observer;
  class FakeIntersectionObserver {
    constructor(callback, options) {
      this.callback = callback;
      this.options = options;
      this.disconnected = false;
      observer = this;
    }

    observe(node) {
      this.observed = node;
    }

    disconnect() {
      this.disconnected = true;
    }
  }

  let nextTimer = 0;
  const timers = new Map();
  const window = {
    IntersectionObserver: FakeIntersectionObserver,
    matchMedia: () => ({ matches: reducedMotion }),
    setTimeout(callback) {
      nextTimer += 1;
      timers.set(nextTimer, callback);
      return nextTimer;
    },
    clearTimeout(timer) {
      timers.delete(timer);
    },
  };

  const flushTimers = () => {
    while (timers.size) {
      const [timer, callback] = timers.entries().next().value;
      timers.delete(timer);
      callback();
    }
  };

  return { document, flushTimers, getObserver: () => observer, output, terminal, timers, window };
}

test("uses readable character cadence with punctuation pauses", () => {
  assert.equal(terminalCharacterDelay("a", false), 22);
  assert.equal(terminalCharacterDelay(",", false), 90);
  assert.equal(terminalCharacterDelay(":", false), 90);
  assert.equal(terminalCharacterDelay("}", false), 90);
  assert.equal(terminalCharacterDelay("\n", false), 160);
  assert.equal(terminalCharacterDelay("a", true), 0);
});

test("builds terminal frames without losing earlier line content", () => {
  assert.deepEqual(buildTerminalFrames(["ab", "c"]), [
    { lineIndex: 0, value: "a", delay: 22 },
    { lineIndex: 0, value: "ab", delay: 160 },
    { lineIndex: 1, value: "c", delay: 22 },
  ]);
});

test("highlights profile syntax while escaping source text", () => {
  const highlighted = terminalModule.highlightSyntaxLine?.('const qualityProfile = { # use <quality>');

  assert.equal(
    highlighted,
    '<span class="token-keyword">const</span> qualityProfile = { <span class="token-comment"># use &lt;quality&gt;</span>',
  );
  assert.equal(
    terminalModule.highlightSyntaxLine?.('  name: "Hendra Rizal Gunawan",'),
    '  name: <span class="token-string">&quot;Hendra Rizal Gunawan&quot;</span>,',
  );
});

test("starts typing once when the terminal intersects and cleans up its observer", () => {
  const fixture = terminalFixture();
  const cleanup = initTerminal({ document: fixture.document, window: fixture.window });
  const observer = fixture.getObserver();

  assert.equal(fixture.terminal.dataset.state, "idle");
  assert.equal(observer.options.threshold, 0.3);
  assert.equal(observer.observed, fixture.terminal);

  observer.callback([{ isIntersecting: true }]);
  assert.equal(fixture.terminal.dataset.state, "typing");
  assert.equal(fixture.output.children[0].children[0].textContent, "a");
  fixture.flushTimers();
  assert.equal(fixture.terminal.dataset.state, "complete");
  assert.deepEqual(
    fixture.output.children.map((item) => item.children[0].textContent),
    ["ab", "c"],
  );

  observer.callback([{ isIntersecting: true }]);
  assert.equal(fixture.timers.size, 0);
  cleanup();
  assert.equal(observer.disconnected, true);
});

test("renders the complete terminal immediately for reduced motion", () => {
  const fixture = terminalFixture({ reducedMotion: true });
  const cleanup = initTerminal({ document: fixture.document, window: fixture.window });

  assert.equal(fixture.terminal.dataset.state, "complete");
  assert.deepEqual(
    fixture.output.children.map((item) => item.children[0].textContent),
    ["ab", "c"],
  );
  assert.equal(fixture.getObserver(), undefined);
  cleanup();
});

test("renders highlighted profile markup into the visual typing lifecycle", () => {
  const fixture = terminalFixture({ lines: ["const qualityProfile = {", 'name: "Hendra"'] });
  initTerminal({ document: fixture.document, window: fixture.window });

  fixture.getObserver().callback([{ isIntersecting: true }]);
  fixture.flushTimers();

  assert.equal(
    fixture.output.children[0].children[0].innerHTML,
    '<span class="token-keyword">const</span> qualityProfile = {',
  );
  assert.equal(
    fixture.output.children[1].children[0].innerHTML,
    'name: <span class="token-string">&quot;Hendra&quot;</span>',
  );
});
