export const navObserverThresholds = [0, 0.05, 0.2, 0.5, 0.75];

export function selectActiveSection(entries) {
  const active = entries
    .filter((entry) => entry.isIntersecting)
    .sort((left, right) => right.intersectionRatio - left.intersectionRatio);

  return active[0]?.target?.id ?? null;
}

export function initNavigation({ document, window }) {
  const cleanups = [];
  const header = document.querySelector("[data-header]");
  const toggle = document.querySelector("[data-menu-toggle]");
  const menu = document.querySelector("[data-menu]");
  const links = [...document.querySelectorAll("[data-nav-link]")];
  const sections = [...document.querySelectorAll("[data-nav-section]")];
  const reveals = [...document.querySelectorAll("[data-reveal]")];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const closeMenu = () => {
    toggle?.setAttribute("aria-expanded", "false");
    menu?.removeAttribute("data-open");
  };

  const toggleMenu = () => {
    if (!toggle || !menu) return;
    const opening = toggle.getAttribute("aria-expanded") !== "true";
    toggle.setAttribute("aria-expanded", String(opening));
    menu.toggleAttribute("data-open", opening);
  };

  const onEscape = (event) => {
    if (event.key === "Escape") {
      closeMenu();
      toggle?.focus();
    }
  };

  const onScroll = () => header?.toggleAttribute("data-stuck", window.scrollY > 24);

  const onOutsideClick = (event) => {
    // Close the mobile dropdown when tapping anywhere outside it.
    if (toggle?.getAttribute("aria-expanded") !== "true") return;
    if (menu?.contains(event.target)) return;
    if (toggle?.contains(event.target)) return;
    closeMenu();
  };

  toggle?.addEventListener("click", toggleMenu);
  document.addEventListener("keydown", onEscape);
  document.addEventListener("click", onOutsideClick);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (toggle) cleanups.push(() => toggle.removeEventListener("click", toggleMenu));
  cleanups.push(() => document.removeEventListener("keydown", onEscape));
  cleanups.push(() => document.removeEventListener("click", onOutsideClick));
  cleanups.push(() => window.removeEventListener("scroll", onScroll));

  for (const link of links) {
    link.addEventListener("click", closeMenu);
    cleanups.push(() => link.removeEventListener("click", closeMenu));
  }

  if (typeof window.IntersectionObserver === "function" && sections.length) {
    const currentEntries = new Map(
      sections.map((section) => [
        section.id,
        { target: section, isIntersecting: false, intersectionRatio: 0 },
      ]),
    );
    const navObserver = new window.IntersectionObserver(
      (entries) => {
        for (const entry of entries) currentEntries.set(entry.target.id, entry);
        const activeId = selectActiveSection([...currentEntries.values()]);
        if (!activeId) return;
        for (const link of links) {
          if (link.getAttribute("href") === `#${activeId}`) link.setAttribute("aria-current", "page");
          else link.removeAttribute("aria-current");
        }
      },
      { rootMargin: "-22% 0px -58%", threshold: navObserverThresholds },
    );
    sections.forEach((section) => navObserver.observe(section));
    cleanups.push(() => navObserver.disconnect());
  }

  const revealImmediately = () => reveals.forEach((element) => element.setAttribute("data-revealed", "true"));
  if (reducedMotion.matches || typeof window.IntersectionObserver !== "function") {
    revealImmediately();
  } else {
    const revealObserver = new window.IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-revealed", "true");
          revealObserver.unobserve(entry.target);
        }
      },
      { threshold: 0.16, rootMargin: "0px 0px -8%" },
    );
    reveals.forEach((element) => revealObserver.observe(element));
    cleanups.push(() => revealObserver.disconnect());
  }

  return () => cleanups.splice(0).forEach((cleanup) => cleanup());
}
