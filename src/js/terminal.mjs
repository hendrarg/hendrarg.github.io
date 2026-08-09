export function terminalCharacterDelay(character, reducedMotion = false) {
  if (reducedMotion) return 0;
  if (character === "\n") return 160;
  if (",:;]})".includes(character)) return 90;
  return 22;
}

export function buildTerminalFrames(lines, reducedMotion = false) {
  const frames = [];
  lines.forEach((line, lineIndex) => {
    for (let length = 1; length <= line.length; length += 1) {
      const character = line[length - 1];
      const isLineEnd = length === line.length && lineIndex < lines.length - 1;
      frames.push({
        lineIndex,
        value: line.slice(0, length),
        delay: isLineEnd ? terminalCharacterDelay("\n", reducedMotion) : terminalCharacterDelay(character, reducedMotion),
      });
    }
  });
  return frames;
}

// How long the completed profile stays on screen before the next typing pass.
const LOOP_HOLD_DELAY = 1800;

const syntaxKeywords = new Set([
  "as", "async", "await", "break", "case", "catch", "class", "const",
  "continue", "def", "else", "export", "finally", "for", "from",
  "function", "if", "import", "in", "let", "new", "return", "throw",
  "try", "var", "while",
]);

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function syntaxToken(className, value) {
  return `<span class="token-${className}">${escapeHtml(value)}</span>`;
}

export function highlightSyntaxLine(line) {
  let highlighted = "";
  let index = 0;

  while (index < line.length) {
    const character = line[index];

    if (character === "#" || (character === "/" && line[index + 1] === "/")) {
      highlighted += syntaxToken("comment", line.slice(index));
      break;
    }

    if (character === '"' || character === "'") {
      let end = index + 1;
      while (end < line.length) {
        if (line[end] === character && line[end - 1] !== "\\") {
          end += 1;
          break;
        }
        end += 1;
      }
      highlighted += syntaxToken("string", line.slice(index, end));
      index = end;
      continue;
    }

    const remainder = line.slice(index);
    const number = remainder.match(/^\d+(?:\.\d+)?/);
    if (number) {
      highlighted += syntaxToken("number", number[0]);
      index += number[0].length;
      continue;
    }

    const identifier = remainder.match(/^[A-Za-z_][A-Za-z0-9_]*/);
    if (identifier) {
      const value = identifier[0];
      const following = line.slice(index + value.length).trimStart();
      let className;
      if (syntaxKeywords.has(value)) className = "keyword";
      else if (following.startsWith("(")) className = "function";
      highlighted += className ? syntaxToken(className, value) : escapeHtml(value);
      index += value.length;
      continue;
    }

    highlighted += escapeHtml(character);
    index += 1;
  }

  return highlighted;
}

export function initTerminal({ document, window, loop = true }) {
  const terminal = document.querySelector("[data-terminal]");
  const output = terminal?.querySelector("[data-terminal-output]");
  const sourceCodes = [...(terminal?.querySelectorAll("[data-terminal-line] code") ?? [])];
  if (!terminal || !output || sourceCodes.length === 0) return () => {};

  const lines = sourceCodes.map((code) => code.textContent ?? "");
  const visualCodes = lines.map(() => {
    const item = document.createElement("li");
    const code = document.createElement("code");
    item.append(code);
    output.append(item);
    return code;
  });
  terminal.dataset.typingReady = "true";

  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  let observer;
  let timer = 0;
  let started = false;

  const finishImmediately = () => {
    visualCodes.forEach((code, index) => {
      code.innerHTML = highlightSyntaxLine(lines[index]);
    });
    terminal.dataset.state = "complete";
  };

  const start = () => {
    if (started) return;
    started = true;
    observer?.disconnect();
    terminal.dataset.state = "typing";
    const frames = buildTerminalFrames(lines);
    let index = 0;

    const restart = () => {
      visualCodes.forEach((code) => {
        code.innerHTML = "";
        code.parentElement?.removeAttribute("data-active");
      });
      index = 0;
      terminal.dataset.state = "typing";
      advance();
    };

    const advance = () => {
      const frame = frames[index];
      visualCodes.forEach((code, lineIndex) => {
        code.parentElement?.toggleAttribute("data-active", lineIndex === frame.lineIndex);
      });
      visualCodes[frame.lineIndex].innerHTML = highlightSyntaxLine(frame.value);
      index += 1;
      if (index >= frames.length) {
        terminal.dataset.state = "complete";
        if (loop) timer = window.setTimeout(restart, LOOP_HOLD_DELAY);
        return;
      }
      timer = window.setTimeout(advance, frame.delay);
    };

    advance();
  };

  if (media.matches || typeof window.IntersectionObserver !== "function") {
    finishImmediately();
  } else {
    terminal.dataset.state = "idle";
    observer = new window.IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) start();
      },
      { threshold: 0.3 },
    );
    observer.observe(terminal);
  }

  return () => {
    observer?.disconnect();
    if (timer) window.clearTimeout(timer);
  };
}
