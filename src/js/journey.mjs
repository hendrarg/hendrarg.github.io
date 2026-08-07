const clamp = (value) => Math.min(1, Math.max(0, value));

export function calculateJourneyProgress(rect, viewportHeight) {
  const distance = Math.max(1, rect.height - viewportHeight * 0.3);
  return clamp((viewportHeight * 0.65 - rect.top) / distance);
}

export function isMilestoneActive(rect, viewportHeight) {
  return rect.top <= viewportHeight * 0.65;
}

export function initJourney({ document, window }) {
  const journey = document.querySelector("[data-journey]");
  if (!journey) return () => {};

  const milestones = [...journey.querySelectorAll("[data-milestone]")];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let frame = 0;

  const revealAll = () => {
    journey.style.setProperty("--journey-progress", "1");
    milestones.forEach((milestone) => milestone.setAttribute("data-active", "true"));
  };

  const update = () => {
    frame = 0;
    if (reducedMotion.matches) {
      revealAll();
      return;
    }
    const viewportHeight = window.innerHeight;
    journey.style.setProperty(
      "--journey-progress",
      String(calculateJourneyProgress(journey.getBoundingClientRect(), viewportHeight)),
    );
    for (const milestone of milestones) {
      if (isMilestoneActive(milestone.getBoundingClientRect(), viewportHeight)) {
        milestone.setAttribute("data-active", "true");
      }
    }
  };

  const schedule = () => {
    if (!frame) frame = window.requestAnimationFrame(update);
  };

  const onMotionChange = () => {
    if (reducedMotion.matches) revealAll();
    else schedule();
  };

  if (typeof window.requestAnimationFrame !== "function") {
    revealAll();
    return () => {};
  }

  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
  reducedMotion.addEventListener?.("change", onMotionChange);
  schedule();

  return () => {
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", schedule);
    reducedMotion.removeEventListener?.("change", onMotionChange);
    if (frame) window.cancelAnimationFrame(frame);
  };
}
