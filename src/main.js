import { scenes } from "./content.js";
import { initDrumWakeGame } from "../games/drumWake.js";
import { initEyeDottingGame } from "../games/eyeDotting.js";

const app = document.querySelector("#app");
const progress = document.querySelector("#readProgress");
const typeSound = new Audio("./info/voice1.mp3");
typeSound.loop = true;
let pageTween = 0;
const drawingFrames = Array.from({ length: 7 }, (_, index) => `./info/drawing/frame (${index + 1}).png`);
drawingFrames.forEach((src) => {
  const image = new Image();
  image.src = src;
});
const gameInitializers = {
  drum: initDrumWakeGame,
  eye: initEyeDottingGame,
};

function render() {
  app.innerHTML = scenes.map((scene, index) => renderScene(scene, index)).join("");
  scenes.forEach((scene) => {
    if (scene.type !== "game") return;
    const mount = document.querySelector(`[data-game-mount="${scene.game}"]`);
    gameInitializers[scene.game]?.(mount, () => {
      mount.closest(".scene").classList.add("is-complete");
      if (mount.contains(document.activeElement)) document.activeElement.blur();
    });
  });
  initEnvelopeScenes();
  initQaScenes();
  initDesktopKeys();
  observeScenes();
}

function renderScene(scene, index) {
  const visual = renderVisual(scene.visual);
  const game = scene.type === "game" ? `<div class="game-mount" data-game-mount="${scene.game}"></div>` : "";
  const qa = scene.type === "qa" ? renderQa(scene) : "";
  const envelope = scene.type === "envelope" ? renderEnvelope(scene) : "";
  const count = String(index + 1).padStart(2, "0");
  const subtitle = scene.subtitle ? `<p class="subtitle">${escapeHtml(scene.subtitle)}</p>` : "";
  const body = scene.body ? `<p>${escapeHtml(scene.body)}</p>` : "";
  return `
    <section class="scene scene--${scene.type}" id="${scene.id}">
      <div class="scene__inner">
        <div class="scene__meta">
          <span>${count}</span>
          <span>${escapeHtml(scene.eyebrow)}</span>
        </div>
        ${visual}
        <article class="scene__text">
          <p class="eyebrow">${escapeHtml(scene.eyebrow)}</p>
          <h1>${escapeHtml(scene.title)}</h1>
          ${subtitle}
          ${body}
        </article>
        ${qa}
        ${envelope}
        ${game}
      </div>
    </section>
  `;
}

function renderQa(scene) {
  const unlock = scene.unlock ? `
    <section class="unlock-slider" data-unlock>
      <span class="unlock-track">滑动进入朱朱的故事</span>
      <button class="unlock-thumb" type="button" aria-label="向右滑动进入下一页">›</button>
    </section>
  ` : "";
  return `
    <article class="qa-card">
      <h2 class="typewriter-question" data-typewriter="${escapeHtml(scene.question)}"></h2>
    </article>
    ${unlock}
  `;
}

function renderEnvelope(scene) {
  return `
    <section class="letter-stage" data-envelope>
      <button class="envelope-button" type="button" aria-label="打开采访照片信封">
        <span class="envelope-lid"></span>
        <span class="envelope-body"></span>
        <span class="envelope-thumbs">
          ${scene.photos.map((src, photoIndex) => `<img src="${src}" alt="采访照片 ${photoIndex + 1}" loading="lazy" />`).join("")}
        </span>
      </button>
      <div class="photo-popups" aria-live="polite">
        ${scene.photos.map((src, photoIndex) => `<img src="${src}" alt="弹出的采访照片 ${photoIndex + 1}" data-photo="${photoIndex}" />`).join("")}
      </div>
      <p class="letter-hint">轻点信封，照片会依次弹出。</p>
    </section>
  `;
}

function initEnvelopeScenes() {
  document.querySelectorAll("[data-envelope]").forEach((stage) => {
    const button = stage.querySelector(".envelope-button");
    const photos = [...stage.querySelectorAll(".photo-popups img")];
    const hint = stage.querySelector(".letter-hint");
    let index = 0;
    button.addEventListener("click", () => {
      if (index >= photos.length) return;
      const photo = photos[index];
      photo.classList.add("is-visible", "is-featured");
      window.setTimeout(() => photo.classList.remove("is-featured"), 1000);
      index += 1;
      stage.classList.add("is-open");
      hint.textContent = index === photos.length ? "三张照片都已展开，继续向上滑动。" : "继续轻点，展开下一张照片。";
    });
  });
}

function initQaScenes() {
  document.querySelectorAll(".typewriter-question").forEach((target) => {
    target.textContent = "";
    target.dataset.typed = "false";
  });

  document.querySelectorAll("[data-unlock]").forEach((slider) => {
    const thumb = slider.querySelector(".unlock-thumb");
    let startX = 0;
    let currentX = 0;
    let dragging = false;

    const maxTravel = () => slider.clientWidth - thumb.clientWidth - 8;
    const setPosition = (x) => {
      currentX = Math.max(0, Math.min(x, maxTravel()));
      thumb.style.transform = `translateX(${currentX}px)`;
      slider.style.setProperty("--unlock-progress", `${currentX / maxTravel()}`);
    };
    const finish = () => {
      if (!dragging) return;
      dragging = false;
      if (currentX > maxTravel() * 0.78) {
        setPosition(maxTravel());
        slider.closest(".scene")?.classList.add("qa-unlocked");
        goToNextScene();
      } else {
        setPosition(0);
      }
    };

    thumb.addEventListener("pointerdown", (event) => {
      dragging = true;
      startX = event.clientX - currentX;
      thumb.setPointerCapture(event.pointerId);
    });
    thumb.addEventListener("pointermove", (event) => {
      if (!dragging) return;
      setPosition(event.clientX - startX);
    });
    thumb.addEventListener("pointerup", finish);
    thumb.addEventListener("pointercancel", finish);
  });
}

function initDesktopKeys() {
  window.addEventListener("keydown", (event) => {
    if (event.code !== "Space" || isTouchDevice()) return;
    if (shouldLockQaForward(1)) return;
    const active = document.activeElement;
    const currentScene = getCurrentScene();
    if (active && ["BUTTON", "A", "INPUT", "TEXTAREA"].includes(active.tagName)) {
      if (currentScene?.classList.contains("is-complete") && currentScene.contains(active)) {
        active.blur();
      } else {
        return;
      }
    }
    event.preventDefault();
    goToNextScene();
  });
}

function isTouchDevice() {
  return window.matchMedia("(pointer: coarse)").matches;
}

function goToNextScene() {
  const scenesList = [...document.querySelectorAll(".scene")];
  const currentIndex = Math.round(app.scrollTop / app.clientHeight);
  scrollToScene(Math.min(scenesList.length - 1, currentIndex + 1));
}

function scrollToScene(index) {
  const scenesList = [...document.querySelectorAll(".scene")];
  const target = scenesList[index];
  if (!target) return;

  const start = app.scrollTop;
  const end = target.offsetTop;
  const distance = end - start;
  const duration = 1180;
  const token = ++pageTween;
  const startTime = performance.now();
  const ease = (value) => value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2;

  const step = (now) => {
    if (token !== pageTween) return;
    const progressValue = Math.min(1, (now - startTime) / duration);
    app.scrollTop = start + distance * ease(progressValue);
    if (progressValue < 1) window.requestAnimationFrame(step);
  };

  window.requestAnimationFrame(step);
}

function getCurrentScene() {
  const scenesList = [...document.querySelectorAll(".scene")];
  return scenesList[Math.round(app.scrollTop / app.clientHeight)] || scenesList[0];
}

function shouldLockQaForward(delta) {
  const scene = getCurrentScene();
  return delta > 0
    && scene?.classList.contains("scene--qa")
    && scene.querySelector("[data-unlock]")
    && !scene.classList.contains("qa-unlocked");
}

function renderVisual(type) {
  if (!type) return "";
  const map = {
    cover: { src: "./assets/lion-head-cutout.png", alt: "醒狮狮头" },
    campus: { src: "./info/mmexport1777114532410.jpg", alt: "龙狮团合影" },
    sound: { src: "./info/mmexport1777114539509.jpg", alt: "校园招新现场的醒狮互动" },
    cloth: { src: "./info/mmexport1777114553838.jpg", alt: "舞台上的醒狮表演" },
    training: { src: "./info/mmexport1777114559086.jpg", alt: "夜晚训练场上的龙狮团队员" },
    poster: { src: "./info/mmexport1777114565569.jpg", alt: "校内演出中的醒狮舞台" },
    pattern: { src: "./info/mmexport1777114577771.jpg", alt: "龙狮团奖杯与传统纹样" },
    team: { src: "./info/mmexport1777114566779.jpg", alt: "龙狮团演出后的集体合影" },
    silhouette: { src: "./info/mmexport1777114567974.jpg", alt: "训练后队员围在一起" },
    night: { src: "./info/mmexport1777114570529.jpg", alt: "夜间训练中的队友陪伴" },
    paper: { src: "./info/mmexport1777114581516.jpg", alt: "成员与醒狮道具合影" },
    drawing: { src: drawingFrames[0], alt: "画纸上逐渐绘出的醒狮", drawing: true },
  };
  const image = map[type];
  const drawingAttrs = image.drawing ? ` data-drawing-frame="0" data-drawing-played="false"` : "";
  return `<figure class="scene-visual scene-visual--${type}"><img src="${image.src}" alt="${image.alt}" loading="lazy"${drawingAttrs} /></figure>`;
}

function observeScenes() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        startTypewriter(entry.target.querySelector(".typewriter-question"));
        startDrawingAnimation(entry.target.querySelector("[data-drawing-frame]"));
      } else {
        entry.target.classList.remove("is-visible");
      }
    });
  }, { root: app, threshold: 0.46 });
  document.querySelectorAll(".scene").forEach((scene) => observer.observe(scene));
}

function startTypewriter(target) {
  if (!target || target.dataset.typed === "true") return;
  const text = target.dataset.typewriter || "";
  target.dataset.typed = "true";
  target.textContent = "";
  let index = 0;
  playTypeSound();

  const write = () => {
    target.textContent += text.charAt(index);
    index += 1;
    if (index < text.length) {
      window.setTimeout(write, 64);
    } else {
      stopTypeSound();
    }
  };

  write();
}

function playTypeSound() {
  typeSound.pause();
  typeSound.currentTime = 0;
  typeSound.play().catch(() => {});
}

function stopTypeSound() {
  typeSound.pause();
  typeSound.currentTime = 0;
}

function startDrawingAnimation(image) {
  if (!image || image.dataset.drawingPlayed === "true") return;
  image.dataset.drawingPlayed = "true";
  const scene = image.closest(".scene");

  const waitForSettledPage = () => {
    if (getCurrentScene() !== scene || Math.abs(app.scrollTop - scene.offsetTop) > 4) {
      window.requestAnimationFrame(waitForSettledPage);
      return;
    }
    playDrawingFrames(image);
  };

  waitForSettledPage();
}

function playDrawingFrames(image) {
  let index = 0;
  const advance = () => {
    image.src = drawingFrames[index];
    image.dataset.drawingFrame = String(index);
    index += 1;
    if (index < drawingFrames.length) window.setTimeout(advance, 420);
  };
  advance();
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;",
  }[char]));
}

function updateProgress() {
  const max = app.scrollHeight - app.clientHeight;
  const ratio = max <= 0 ? 0 : app.scrollTop / max;
  progress.style.transform = `scaleX(${Math.min(1, Math.max(0, ratio))})`;
}

app.addEventListener("scroll", updateProgress, { passive: true });
app.addEventListener("wheel", (event) => {
  if (!isTouchDevice()) {
    event.preventDefault();
    return;
  }
  if (shouldLockQaForward(event.deltaY)) event.preventDefault();
}, { passive: false });

let touchStartY = 0;
app.addEventListener("touchstart", (event) => {
  touchStartY = event.touches[0]?.clientY ?? 0;
}, { passive: true });
app.addEventListener("touchmove", (event) => {
  const currentY = event.touches[0]?.clientY ?? touchStartY;
  if (shouldLockQaForward(touchStartY - currentY)) event.preventDefault();
}, { passive: false });
window.addEventListener("resize", updateProgress);
render();
updateProgress();
