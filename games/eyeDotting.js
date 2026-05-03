export function initEyeDottingGame(container, onComplete) {
  const steps = [
    { key: "left-eye", label: "左眼", text: "一点左眼：眼观六路" },
    { key: "right-eye", label: "右眼", text: "二点右眼：耳听八方" },
    { key: "forehead", label: "天庭", text: "三点天庭：鸿运当头" },
    { key: "mouth", label: "狮口", text: "四点狮口：纳福迎祥" },
  ];
  let index = 0;

  container.innerHTML = `
    <section class="eye-game" aria-label="醒狮点睛小游戏">
      <div class="eye-stage">
        <img src="./assets/lion-head-cutout.png" alt="待点睛的醒狮狮头" />
        ${steps.map((step) => `<button class="dot-hotspot dot-hotspot--${step.key}" type="button" data-key="${step.key}" aria-label="点亮${step.label}"></button>`).join("")}
      </div>
      <p class="game-message">请按顺序点亮：左眼、右眼、天庭、狮口。</p>
      <ol class="dot-list">${steps.map((step) => `<li>${step.text}</li>`).join("")}</ol>
    </section>
  `;

  const stage = container.querySelector(".eye-stage");
  const message = container.querySelector(".game-message");
  const items = [...container.querySelectorAll(".dot-list li")];

  container.querySelectorAll(".dot-hotspot").forEach((button) => {
    button.addEventListener("click", () => {
      const expected = steps[index];
      if (!expected || button.dataset.key !== expected.key) {
        stage.classList.remove("is-wrong");
        void stage.offsetWidth;
        stage.classList.add("is-wrong");
        message.textContent = `先点${expected?.label ?? "狮头"}。`;
        return;
      }

      button.classList.add("is-lit");
      items[index].classList.add("is-lit");
      message.textContent = expected.text;
      index += 1;

      if (index === steps.length) {
        stage.classList.add("is-awake");
        message.textContent = "给沉睡新狮注入灵气、开光成瑞兽，从此不再是普通道具，有灵性、能镇宅、辟邪、招财。";
        onComplete?.();
      }
    });
  });
}
