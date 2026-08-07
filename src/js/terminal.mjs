export function terminalDelay(index, reducedMotion) {
  return reducedMotion ? 0 : 120 + index * 90;
}

export function initTerminal({ document, window }) {
  const terminal = document.querySelector("[data-terminal]");
  if (!terminal) return () => {};

  const lines = [...terminal.querySelectorAll("[data-terminal-line]")];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const activate = () => terminal.setAttribute("data-active", "true");

  lines.forEach((line, index) => {
    line.style.setProperty("--line-delay", `${terminalDelay(index, reducedMotion.matches)}ms`);
  });

  if (reducedMotion.matches || typeof window.IntersectionObserver !== "function") {
    activate();
    return () => {};
  }

  const observer = new window.IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      activate();
      observer.disconnect();
    },
    { threshold: 0.35 },
  );
  observer.observe(terminal);

  return () => observer.disconnect();
}
