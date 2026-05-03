export function initDrumWakeGame(container, onComplete) {
  const target = 10;
  let count = 0;
  let completed = false;

  container.innerHTML = `
    <section class="drum-game" aria-label="击鼓唤醒舞狮小游戏">
      <div class="wake-stage">
        <img class="wake-lion" src="./assets/lion-head-cutout.png" alt="等待唤醒的醒狮狮头" />
        <div class="wake-glow" aria-hidden="true"></div>
      </div>
      <button class="drum-button" type="button" aria-label="点击鼓面唤醒舞狮">
        <img src="./assets/svg/drum.svg" alt="" />
      </button>
      <div class="game-progress" aria-label="击鼓进度"><span></span></div>
      <p class="game-message">敲响鼓面，让眼睛一点点亮起来。</p>
    </section>
  `;

  const stage = container.querySelector(".drum-game");
  const lion = container.querySelector(".wake-lion");
  const glow = container.querySelector(".wake-glow");
  const progress = container.querySelector(".game-progress span");
  const message = container.querySelector(".game-message");
  const button = container.querySelector(".drum-button");

  button.addEventListener("click", () => {
    if (completed) return;
    count += 1;
    const ratio = count / target;
    progress.style.transform = `scaleX(${ratio})`;
    glow.style.opacity = String(Math.min(1, ratio + 0.12));
    lion.style.filter = `brightness(${0.72 + ratio * 0.55}) saturate(${1 + ratio * 0.55})`;
    stage.classList.remove("is-hit");
    void stage.offsetWidth;
    stage.classList.add("is-hit");

    if (count >= target) {
      completed = true;
      lion.style.filter = "brightness(1.18) saturate(1.24)";
      message.textContent = "锣鼓震气场，唤醒已开光的瑞狮灵魂，正式现世、下凡祈福，仪式到此狮已“成活”。";
      button.textContent = "已唤醒";
      button.setAttribute("disabled", "");
      onComplete?.();
    } else {
      message.textContent = `再敲 ${target - count} 下，狮头就要醒了。`;
    }
  });
}
