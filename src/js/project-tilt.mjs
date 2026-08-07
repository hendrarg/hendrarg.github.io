import { calculateTilt } from "./player-tilt.mjs";

export function calculateProjectTilt(rect, clientX, clientY) {
  return calculateTilt(rect, clientX, clientY, 5);
}

export function initProjectTilt({ document, window }) {
  const cards = [...document.querySelectorAll("[data-project-card]")];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  if (reducedMotion || coarsePointer) return () => {};

  const cleanups = [];
  for (const card of cards) {
    let frame = 0;
    let latestEvent;

    const render = () => {
      frame = 0;
      if (!latestEvent) return;
      const tilt = calculateProjectTilt(card.getBoundingClientRect(), latestEvent.clientX, latestEvent.clientY);
      card.style.setProperty("--project-rotate-x", `${tilt.rotateX}deg`);
      card.style.setProperty("--project-rotate-y", `${tilt.rotateY}deg`);
      card.style.setProperty("--project-x", `${tilt.xRatio * 100}%`);
      card.style.setProperty("--project-y", `${tilt.yRatio * 100}%`);
    };

    const onPointerMove = (event) => {
      latestEvent = event;
      if (!frame) frame = window.requestAnimationFrame(render);
    };

    const onPointerLeave = () => {
      latestEvent = undefined;
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
      card.style.setProperty("--project-rotate-x", "0deg");
      card.style.setProperty("--project-rotate-y", "0deg");
      card.style.setProperty("--project-x", "50%");
      card.style.setProperty("--project-y", "50%");
    };

    card.addEventListener("pointermove", onPointerMove);
    card.addEventListener("pointerleave", onPointerLeave);
    cleanups.push(() => {
      card.removeEventListener("pointermove", onPointerMove);
      card.removeEventListener("pointerleave", onPointerLeave);
      if (frame) window.cancelAnimationFrame(frame);
    });
  }

  return () => cleanups.splice(0).forEach((cleanup) => cleanup());
}
