# 狮被之下：舞狮 H5 新闻

这是一个纯静态移动端 H5 新闻项目，主题为“舞狮与大学生非遗传承”。页面按 `方案.docx` 重构为 13 屏滚动叙事，并包含两个互动游戏：

- 击鼓唤醒舞狮
- 醒狮点睛

## 运行预览

当前项目无需构建，可直接用静态服务器运行：

```powershell
python -m http.server 5173
```

然后访问：

```text
http://127.0.0.1:5173/index.html
```

## 项目结构

```text
index.html
src/
  content.js
  main.js
games/
  drumWake.js
  eyeDotting.js
styles/
  base.css
  layout.css
  scenes.css
  games.css
assets/
  svg/
  audio/
  generated-prompts/
```

## 修改文案

13 屏文案集中在 `src/content.js` 的 `scenes` 数组中。每屏包含 `type`、`title`、`body`、`visual` 等字段。

## 替换素材

SVG 素材在 `assets/svg/`，用途说明见 `assets/README.md`。如需加入鼓声，把音频放到 `assets/audio/drum.mp3`，再在 `games/drumWake.js` 中接入。移动端浏览器需要用户点击后才能播放音频。

## 移动端检查

- 375x667、390x844、430x932 三种手机宽高下检查文字是否溢出。
- 检查微信内置浏览器下 `100svh` 页面高度是否稳定。
- 检查是否出现横向滚动。
- 检查两个游戏的触摸按钮是否足够大。
- 检查资源体积，后续加入音频或大图时优先压缩。

## 部署

该项目是纯静态文件，可直接上传到 GitHub Pages、Vercel、Netlify 或学校服务器。若需要 `dist/`，可复制 `index.html`、`src/`、`games/`、`styles/`、`assets/`、`info/` 到发布目录。
