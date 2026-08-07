const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const cleanNumber = (value) => {
  const rounded = Number(value.toFixed(4));
  return Object.is(rounded, -0) ? 0 : rounded;
};

export function calculateTilt(rect, clientX, clientY, maxTilt = 20) {
  const xRatio = clamp((clientX - rect.left) / rect.width, 0, 1);
  const yRatio = clamp((clientY - rect.top) / rect.height, 0, 1);

  return {
    rotateX: cleanNumber((0.5 - yRatio) * maxTilt * 2),
    rotateY: cleanNumber((xRatio - 0.5) * maxTilt * 2),
    xRatio: cleanNumber(xRatio),
    yRatio: cleanNumber(yRatio),
  };
}

export function calculateLayerOffset(tilt, maxOffset = 12) {
  return {
    x: cleanNumber((tilt.xRatio - 0.5) * maxOffset * 2),
    y: cleanNumber((tilt.yRatio - 0.5) * maxOffset * 2),
  };
}

export function initPlayerTilt({ document, window }) {
  const roots = [...document.querySelectorAll("[data-player]")];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  if (reducedMotion || coarsePointer) return () => {};

  const cleanups = [];
  for (const root of roots) {
    let frame = 0;
    let latestEvent;

    const render = () => {
      frame = 0;
      if (!latestEvent) return;
      const tilt = calculateTilt(root.getBoundingClientRect(), latestEvent.clientX, latestEvent.clientY, 18);
      const offset = calculateLayerOffset(tilt);
      root.style.setProperty("--rotate-x", `${tilt.rotateX}deg`);
      root.style.setProperty("--rotate-y", `${tilt.rotateY}deg`);
      root.style.setProperty("--pointer-x", `${tilt.xRatio * 100}%`);
      root.style.setProperty("--pointer-y", `${tilt.yRatio * 100}%`);
      root.style.setProperty("--layer-x", `${offset.x}px`);
      root.style.setProperty("--layer-y", `${offset.y}px`);
    };

    const reset = () => {
      root.dataset.hovered = "false";
      root.style.setProperty("--rotate-x", "0deg");
      root.style.setProperty("--rotate-y", "0deg");
      root.style.setProperty("--pointer-x", "50%");
      root.style.setProperty("--pointer-y", "50%");
      root.style.setProperty("--layer-x", "0px");
      root.style.setProperty("--layer-y", "0px");
    };

    const onPointerEnter = () => {
      root.dataset.hovered = "true";
    };

    const onPointerMove = (event) => {
      latestEvent = event;
      if (!frame) frame = window.requestAnimationFrame(render);
    };

    const onPointerLeave = () => {
      latestEvent = undefined;
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
      reset();
    };

    root.addEventListener("pointerenter", onPointerEnter);
    root.addEventListener("pointermove", onPointerMove);
    root.addEventListener("pointerleave", onPointerLeave);
    cleanups.push(() => {
      root.removeEventListener("pointerenter", onPointerEnter);
      root.removeEventListener("pointermove", onPointerMove);
      root.removeEventListener("pointerleave", onPointerLeave);
      if (frame) window.cancelAnimationFrame(frame);
      reset();
    });
  }

  return () => cleanups.splice(0).forEach((cleanup) => cleanup());
}
