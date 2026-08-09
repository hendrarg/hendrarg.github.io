const clamp = (value) => Math.min(1, Math.max(0, value));

export function stateFromProgress(progress, count) {
  if (count <= 0) return 0;
  return Math.min(count - 1, Math.max(0, Math.floor(clamp(progress) * count)));
}

export function workProgress({ sectionRect, viewportHeight, triggerTop }) {
  const span = Math.max(1, sectionRect.height - viewportHeight);
  return clamp((triggerTop - sectionRect.top) / span);
}

export function applyProject({ items, images, index, heading, tech, description, link }) {
  const item = items[index];
  if (!item) return;
  tech.textContent = item.dataset.tech || "";
  heading.textContent = item.dataset.title || "";
  description.textContent = item.dataset.description || "";
  link.href = item.dataset.href || "#";
  link.textContent = item.dataset.cta || "View project";
  images.forEach((image, i) => {
    if (i === index) image.setAttribute("data-active", "true");
    else image.removeAttribute("data-active");
  });
}

export function initWorkScrub({ document, window }) {
  const root = document.querySelector("[data-work-scrub]");
  if (!root) return () => {};
  const items = [...(root.querySelectorAll("[data-work-item]") ?? [])];
  const images = [...(root.querySelectorAll("[data-work-image]") ?? [])];
  const heading = root.querySelector("[data-work-heading]");
  const tech = root.querySelector("[data-work-tech]");
  const description = root.querySelector("[data-work-description]");
  const link = root.querySelector("[data-work-link]");
  if (items.length === 0 || items.length !== images.length || !heading || !tech || !description || !link) {
    return () => {};
  }

  const header = document.querySelector("[data-header]");
  const triggerTop = (header?.offsetHeight ?? 0) + 40;
  const hasRAF = typeof window.requestAnimationFrame === "function";
  let frame = 0;
  let active = -1;

  const render = () => {
    frame = 0;
    const progress = workProgress({
      sectionRect: root.getBoundingClientRect(),
      viewportHeight: window.innerHeight,
      triggerTop,
    });
    const next = stateFromProgress(progress, items.length);
    if (next === active) return;
    active = next;
    applyProject({ items, images, index: next, heading, tech, description, link });
  };

  const schedule = () => {
    if (!hasRAF) {
      render();
      return;
    }
    if (!frame) frame = window.requestAnimationFrame(render);
  };

  const restore = () => {
    if (frame) window.cancelAnimationFrame(frame);
    frame = 0;
    delete root.dataset.enhanced;
    root.style.removeProperty("--scrub-count");
    images.forEach((image) => image.removeAttribute("data-active"));
    active = -1;
  };

  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
  root.style.setProperty("--scrub-count", String(items.length));
  root.dataset.enhanced = "true";
  schedule();

  return () => {
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", schedule);
    restore();
  };
}
