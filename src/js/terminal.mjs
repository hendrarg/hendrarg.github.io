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

export function initTerminal({ document, window }) {
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
      code.textContent = lines[index];
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

    const advance = () => {
      const frame = frames[index];
      visualCodes.forEach((code, lineIndex) => {
        code.parentElement?.toggleAttribute("data-active", lineIndex === frame.lineIndex);
      });
      visualCodes[frame.lineIndex].textContent = frame.value;
      index += 1;
      if (index >= frames.length) {
        terminal.dataset.state = "complete";
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
