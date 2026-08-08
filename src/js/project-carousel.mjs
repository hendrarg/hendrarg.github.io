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

export function swipeStep(start, end, threshold = 48) {
  const distanceX = end.x - start.x;
  const distanceY = end.y - start.y;
  if (Math.abs(distanceX) < threshold || Math.abs(distanceX) <= Math.abs(distanceY)) return 0;
  return distanceX < 0 ? 1 : -1;
}

export function createCarouselController(length, initialIndex = 0) {
  let current = wrapIndex(initialIndex, length);
  const move = (step) => {
    current = wrapIndex(current + step, length);
    return current;
  };

  return {
    get index() {
      return current;
    },
    move,
    select(index) {
      current = wrapIndex(index, length);
      return current;
    },
    handleKey(key) {
      if (key !== "ArrowLeft" && key !== "ArrowRight") return false;
      move(key === "ArrowRight" ? 1 : -1);
      return true;
    },
    handleSwipe(start, end, threshold = 48) {
      const step = swipeStep(start, end, threshold);
      if (!step) return false;
      move(step);
      return true;
    },
  };
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

  const controller = createCarouselController(slides.length);
  let touchStart = null;
  const dotHandlers = [];
  const dots = slides.map((slide, index) => {
    const dot = document.createElement("button");
    const title = slide.dataset.title || `Project ${index + 1}`;
    dot.type = "button";
    dot.setAttribute("aria-label", `Show ${title}`);
    const handler = () => {
      controller.select(index);
      render();
    };
    dot.addEventListener("click", handler);
    dotHandlers.push(() => dot.removeEventListener("click", handler));
    dotsRoot.append(dot);
    return dot;
  });

  const render = () => {
    const current = controller.index;
    root.dataset.activeIndex = String(current);
    slides.forEach((slide, index) => {
      const active = index === current;
      slide.dataset.slideState = slideRole(index, current, slides.length);
      slide.setAttribute("aria-hidden", String(!active));
      slide.querySelectorAll("a").forEach((link) => {
        link.tabIndex = active ? 0 : -1;
      });
      dots[index].setAttribute("aria-pressed", String(active));
    });

    const slide = slides[current];
    caption.tech.textContent = slide.dataset.tech || "";
    caption.title.textContent = slide.dataset.title || "";
    caption.description.textContent = slide.dataset.description || "";
    caption.link.href = slide.dataset.href || "#";
    caption.link.textContent = slide.dataset.cta || "View project";
  };

  const move = (step) => {
    controller.move(step);
    render();
  };
  const onPrevious = () => move(-1);
  const onNext = () => move(1);
  const onKeyDown = (event) => {
    if (event.target !== root || !controller.handleKey(event.key)) return;
    event.preventDefault();
    render();
  };
  const onTouchStart = (event) => {
    const touch = event.changedTouches[0];
    touchStart = touch ? { x: touch.clientX, y: touch.clientY } : null;
  };
  const onTouchEnd = (event) => {
    if (!touchStart) return;
    const touch = event.changedTouches[0];
    const end = touch ? { x: touch.clientX, y: touch.clientY } : touchStart;
    const shouldRender = controller.handleSwipe(touchStart, end);
    touchStart = null;
    if (shouldRender) render();
  };
  const onTouchCancel = () => {
    touchStart = null;
  };

  previous.addEventListener("click", onPrevious);
  next.addEventListener("click", onNext);
  root.addEventListener("keydown", onKeyDown);
  root.addEventListener("touchstart", onTouchStart, { passive: true });
  root.addEventListener("touchend", onTouchEnd, { passive: true });
  root.addEventListener("touchcancel", onTouchCancel, { passive: true });
  root.tabIndex = 0;
  root.dataset.enhanced = "true";
  render();

  return () => {
    previous.removeEventListener("click", onPrevious);
    next.removeEventListener("click", onNext);
    root.removeEventListener("keydown", onKeyDown);
    root.removeEventListener("touchstart", onTouchStart);
    root.removeEventListener("touchend", onTouchEnd);
    root.removeEventListener("touchcancel", onTouchCancel);
    dotHandlers.forEach((remove) => remove());
    dots.forEach((dot) => dot.remove());
    delete root.dataset.enhanced;
    delete root.dataset.activeIndex;
    root.removeAttribute("tabindex");
    slides.forEach((slide) => {
      delete slide.dataset.slideState;
      slide.removeAttribute("aria-hidden");
      slide.querySelectorAll("a").forEach((link) => link.removeAttribute("tabindex"));
    });
  };
}
