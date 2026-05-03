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
  };
  const image = map[type];
  return `<figure class="scene-visual scene-visual--${type}"><img src="${image.src}" alt="${image.alt}" loading="lazy" /></figure>`;
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
