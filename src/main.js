import { scenes } from "./content.js";
import { initDrumWakeGame } from "../games/drumWake.js";
import { initEyeDottingGame } from "../games/eyeDotting.js";

const app = document.querySelector("#app");
const progress = document.querySelector("#readProgress");
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
    });
  });
  observeScenes();
}

function renderScene(scene, index) {
  const visual = renderVisual(scene.visual);
  const game = scene.type === "game" ? `<div class="game-mount" data-game-mount="${scene.game}"></div>` : "";
  const count = String(index + 1).padStart(2, "0");
  return `
    <section class="scene scene--${scene.type}" id="${scene.id}">
      <div class="scene__inner">
        <div class="scene__meta">
          <span>${count}</span>
          <span>${scene.eyebrow}</span>
        </div>
        ${visual}
        <article class="scene__text">
          <p class="eyebrow">${scene.eyebrow}</p>
          <h1>${scene.title}</h1>
          ${scene.subtitle ? `<p class="subtitle">${scene.subtitle}</p>` : ""}
          <p>${scene.body}</p>
        </article>
        ${game}
      </div>
    </section>
  `;
}

function renderVisual(type) {
  if (!type) return "";
  const map = {
    cover: "lion-head-awake.svg",
    campus: "campus-fair.svg",
    sound: "sound-wave.svg",
    cloth: "lion-cloth.svg",
    training: "drum.svg",
    poster: "training-ground.svg",
    pattern: "pattern.svg",
    team: "team-silhouette.svg",
    silhouette: "team-silhouette.svg",
    night: "training-ground.svg",
    paper: "paper-canvas.svg",
  };
  return `<figure class="scene-visual scene-visual--${type}"><img src="./assets/svg/${map[type]}" alt="" loading="lazy" /></figure>`;
}

function observeScenes() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("is-visible");
    });
  }, { threshold: 0.28 });
  document.querySelectorAll(".scene").forEach((scene) => observer.observe(scene));
}

function updateProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = max <= 0 ? 0 : window.scrollY / max;
  progress.style.transform = `scaleX(${Math.min(1, Math.max(0, ratio))})`;
}

document.querySelector("#restartPage").addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

document.querySelector("#shareHint").addEventListener("click", () => {
  window.alert("可点击浏览器右上角菜单，将这只青春醒狮分享给朋友。");
});

window.addEventListener("scroll", updateProgress, { passive: true });
window.addEventListener("resize", updateProgress);
render();
updateProgress();
