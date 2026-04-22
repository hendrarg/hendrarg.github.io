// hamburger
const hamburger = document.querySelector("#hamburger");
const navMenu = document.querySelector("#nav-menu");

hamburger.addEventListener("click", function () {
  hamburger.classList.toggle("hamburger-active");
  navMenu.classList.toggle("hidden");
});

// navbar fixed
window.onscroll = function () {
  const header = document.querySelector("header");
  const fixedNav = header.offsetTop;
  const toTop = document.querySelector("#to-top");
  if (window.pageYOffset > fixedNav) {
    header.classList.add("navbar-fixed");
    toTop.classList.remove("hidden");
    toTop.classList.add("flex");
  } else {
    header.classList.remove("navbar-fixed");
    toTop.classList.remove("flex");
    toTop.classList.add("hidden");
  }
};

// klik diluar hamburger
window.addEventListener("click", function (e) {
  if (e.target != hamburger && e.target != navMenu) {
    hamburger.classList.remove("hamburger-active");
    navMenu.classList.add("hidden");
  }
});

// dark mode toggle
const darkToggle = document.querySelector("#dark-toggle");
const html = document.querySelector("html");
darkToggle.addEventListener("click", function () {
  if (darkToggle.checked) {
    html.classList.add("dark");
    localStorage.theme = "dark";
  } else {
    html.classList.remove("dark");
    localStorage.theme = "light";
  }
});

// pindahkan posisi toggle sesuai mode
if (localStorage.theme === "dark" || (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
  darkToggle.checked = true;
} else {
  darkToggle.checked = false;
}

// nav-active

// Portfolio carousel — 1 tengah, 2 samping & tenggelam, 1 di belakang
(function initPortfolioCarousel() {
  const root = document.getElementById("portfolio-carousel-root");
  if (!root) return;

  const track = document.getElementById("portfolio-carousel-track");
  const prevBtn = document.getElementById("portfolio-prev");
  const nextBtn = document.getElementById("portfolio-next");
  const dotsCont = document.getElementById("portfolio-dots");
  const cTitle = document.getElementById("portfolio-c-title");
  const cDesc = document.getElementById("portfolio-c-desc");
  const cLink = document.getElementById("portfolio-c-link");
  const slides = Array.from(root.querySelectorAll(".portfolio-slide"));
  if (!track || slides.length === 0) return;

  const n = slides.length;
  let current = 0;
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function getMetrics() {
    const w = track.getBoundingClientRect().width;
    if (w < 400) {
      return { x: 0.24, s: 0.7, sunk: 0.04, bScale: 0.5, bDrop: 0.12, rot: 0 };
    }
    if (w < 640) {
      return { x: 0.28, s: 0.75, sunk: 0.045, bScale: 0.56, bDrop: 0.12, rot: 0 };
    }
    if (w < 1024) {
      return { x: 0.31, s: 0.8, sunk: 0.05, bScale: 0.62, bDrop: 0.11, rot: 2 };
    }
    return { x: 0.33, s: 0.83, sunk: 0.05, bScale: 0.64, bDrop: 0.1, rot: 3 };
  }

  function updateCaption() {
    const el = slides[current];
    if (cTitle) cTitle.textContent = el.getAttribute("data-title") || "";
    if (cDesc) cDesc.textContent = el.getAttribute("data-desc") || "";
    if (cLink) {
      cLink.href = el.getAttribute("data-href") || "#";
      cLink.textContent = el.getAttribute("data-cta") || "Buka proyek";
    }
  }

  function updateDots() {
    if (!dotsCont) return;
    dotsCont.querySelectorAll("button").forEach((b, i) => {
      const on = i === current;
      b.setAttribute("aria-selected", on ? "true" : "false");
      b.className = on
        ? "h-2.5 w-2.5 rounded-full border-2 border-primary bg-primary sm:h-3 sm:w-3"
        : "h-2.5 w-2.5 rounded-full border-2 border-primary/30 bg-transparent hover:border-primary/50 sm:h-3 sm:w-3";
    });
  }

  function render() {
    const w = track.getBoundingClientRect().width;
    const m = getMetrics();
    const offsetX = w * m.x;
    const sunkY = w * m.sunk;
    const backY = w * m.bDrop;
    const rotY = m.rot;
    const blurBack = w > 640 && !prefersReduced;

    for (let i = 0; i < n; i++) {
      const diff = (i - current + n) % n;
      const slide = slides[i];
      if (diff === 0) {
        slide.style.zIndex = "30";
        slide.style.pointerEvents = "auto";
        slide.setAttribute("aria-hidden", "false");
        slide.style.transform = "translate3d(-50%, -50%, 0) scale(1) translate3d(0,0,32px)";
        slide.style.opacity = "1";
        slide.style.filter = "brightness(1.02)";
      } else if (diff === 1) {
        slide.style.zIndex = "20";
        slide.style.pointerEvents = "none";
        slide.setAttribute("aria-hidden", "true");
        slide.style.transform = `translate3d(calc(-50% + ${offsetX}px), calc(-50% + ${sunkY}px), 0) scale(${m.s}) translate3d(0,0,-50px) rotateY(${-rotY}deg)`;
        slide.style.opacity = "0.88";
        slide.style.filter = "brightness(0.92)";
      } else if (diff === 3) {
        slide.style.zIndex = "20";
        slide.style.pointerEvents = "none";
        slide.setAttribute("aria-hidden", "true");
        slide.style.transform = `translate3d(calc(-50% - ${offsetX}px), calc(-50% + ${sunkY}px), 0) scale(${m.s}) translate3d(0,0,-50px) rotateY(${rotY}deg)`;
        slide.style.opacity = "0.88";
        slide.style.filter = "brightness(0.92)";
      } else {
        slide.style.zIndex = "4";
        slide.style.pointerEvents = "none";
        slide.setAttribute("aria-hidden", "true");
        slide.style.transform = `translate3d(-50%, calc(-50% + ${backY}px), 0) scale(${m.bScale}) translate3d(0,0,-180px) rotateX(1deg)`;
        slide.style.opacity = prefersReduced ? "0.2" : "0.4";
        slide.style.filter = blurBack ? "brightness(0.72) blur(0.6px)" : "brightness(0.78)";
      }
    }
    if (prefersReduced) {
      slides.forEach((s) => {
        s.style.transition = "opacity 0.2s";
      });
    }
    updateCaption();
    updateDots();
  }

  for (let i = 0; i < n; i++) {
    if (!dotsCont) break;
    const b = document.createElement("button");
    b.type = "button";
    b.setAttribute("role", "tab");
    b.setAttribute("aria-label", "Buka: " + (slides[i].getAttribute("data-title") || "proyek " + (i + 1)));
    b.addEventListener("click", () => {
      current = i;
      render();
    });
    dotsCont.appendChild(b);
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      current = (current - 1 + n) % n;
      render();
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      current = (current + 1) % n;
      render();
    });
  }

  let touchX = 0;
  root.addEventListener(
    "touchstart",
    (e) => {
      touchX = e.changedTouches[0].clientX;
    },
    { passive: true }
  );
  root.addEventListener(
    "touchend",
    (e) => {
      const dx = e.changedTouches[0].clientX - touchX;
      if (dx < -48) {
        current = (current + 1) % n;
        render();
      } else if (dx > 48) {
        current = (current - 1 + n) % n;
        render();
      }
    },
    { passive: true }
  );

  root.tabIndex = 0;
  root.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      current = (current - 1 + n) % n;
      render();
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      current = (current + 1) % n;
      render();
    }
  });

  let resizeT;
  window.addEventListener(
    "resize",
    () => {
      clearTimeout(resizeT);
      resizeT = setTimeout(render, 100);
    },
    { passive: true }
  );

  render();
})();
