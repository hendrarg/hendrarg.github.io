export function wrapIndex(index, length) {
  if (length <= 0) return 0;
  return ((index % length) + length) % length;
}

export function slideRole(index, current, length) {
  const difference = wrapIndex(index - current, length);
  if (difference === 0) return "active";
  if (difference === 1) return "next";
  if (difference === length - 1) return "previous";
  return "back";
}

export function swipeStep(startX, endX, threshold = 48) {
  const distance = endX - startX;
  if (Math.abs(distance) < threshold) return 0;
  return distance < 0 ? 1 : -1;
}

export function initProjectCarousel({ document, window }) {
  const root = document.querySelector("[data-project-carousel]");
  const stage = root?.querySelector("[data-project-stage]");
  const slides = [...(root?.querySelectorAll("[data-project-slide]") ?? [])];
  const previous = root?.querySelector("[data-project-previous]");
  const next = root?.querySelector("[data-project-next]");
  const dotsRoot = root?.querySelector("[data-project-dots]");
  const caption = {
    root: root?.querySelector("[data-project-caption]"),
    tech: root?.querySelector("[data-project-caption-tech]"),
    title: root?.querySelector("[data-project-caption-title]"),
    description: root?.querySelector("[data-project-caption-description]"),
    link: root?.querySelector("[data-project-caption-link]"),
  };
  if (!root || !stage || slides.length === 0 || !previous || !next || !dotsRoot || Object.values(caption).some((node) => !node)) {
    return () => {};
  }

  let current = 0;
  let touchStartX = null;
  const dotHandlers = [];
  const dots = slides.map((slide, index) => {
    const dot = document.createElement("button");
    const title = slide.dataset.title || `Project ${index + 1}`;
    dot.type = "button";
    dot.setAttribute("role", "tab");
    dot.setAttribute("aria-label", `Show ${title}`);
    const handler = () => {
      current = index;
      render();
    };
    dot.addEventListener("click", handler);
    dotHandlers.push(() => dot.removeEventListener("click", handler));
    dotsRoot.append(dot);
    return dot;
  });

  const render = () => {
    root.dataset.activeIndex = String(current);
    slides.forEach((slide, index) => {
      const active = index === current;
      slide.dataset.slideState = slideRole(index, current, slides.length);
      slide.setAttribute("aria-hidden", String(!active));
      slide.querySelectorAll("a").forEach((link) => {
        link.tabIndex = active ? 0 : -1;
      });
      dots[index].setAttribute("aria-selected", String(active));
    });

    const slide = slides[current];
    caption.tech.textContent = slide.dataset.tech || "";
    caption.title.textContent = slide.dataset.title || "";
    caption.description.textContent = slide.dataset.description || "";
    caption.link.href = slide.dataset.href || "#";
    caption.link.textContent = slide.dataset.cta || "View project";
  };

  const move = (step) => {
    current = wrapIndex(current + step, slides.length);
    render();
  };
  const onPrevious = () => move(-1);
  const onNext = () => move(1);
  const onKeyDown = (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    move(event.key === "ArrowRight" ? 1 : -1);
  };
  const onTouchStart = (event) => {
    touchStartX = event.changedTouches[0]?.clientX ?? null;
  };
  const onTouchEnd = (event) => {
    if (touchStartX === null) return;
    const step = swipeStep(touchStartX, event.changedTouches[0]?.clientX ?? touchStartX);
    touchStartX = null;
    if (step) move(step);
  };

  previous.addEventListener("click", onPrevious);
  next.addEventListener("click", onNext);
  root.addEventListener("keydown", onKeyDown);
  root.addEventListener("touchstart", onTouchStart, { passive: true });
  root.addEventListener("touchend", onTouchEnd, { passive: true });
  root.dataset.enhanced = "true";
  render();

  return () => {
    previous.removeEventListener("click", onPrevious);
    next.removeEventListener("click", onNext);
    root.removeEventListener("keydown", onKeyDown);
    root.removeEventListener("touchstart", onTouchStart);
    root.removeEventListener("touchend", onTouchEnd);
    dotHandlers.forEach((remove) => remove());
    dots.forEach((dot) => dot.remove());
    delete root.dataset.enhanced;
  };
}
