# Kun Xu Academic Homepage

这是一个为 `xukun12138.github.io` 重构的个人学术主页项目。它从旧版 Jekyll 主页中整理了个人信息、研究方向、论文、新闻、荣誉、服务和素材，并改造成一个现代静态站点。

## 功能

- 首屏视觉化个人介绍，使用旧主页中的真实照片素材。
- 英文 / 中文界面切换。
- 深色 / 浅色主题切换。
- 论文年份筛选、关键词搜索、BibTeX 一键复制。
- 研究方向、研究项目、新闻时间线、CV 时间线、荣誉和学术服务。
- `npm run dev` 本地预览。
- `npm run build` 自动生成 `dist/`。
- GitHub Actions 自动部署到 GitHub Pages。
- 无前端依赖，部署更稳；不需要 `npm install`。

## 项目结构

```text
xukun12138.github.io-redesign/
  index.html
  404.html
  robots.txt
  package.json
  assets/
    css/styles.css
    js/data.js
    js/app.js
    images/
    pdf/
  scripts/
    build.mjs
    dev-server.mjs
  .github/
    workflows/deploy.yml
```

## 本地预览

需要 Node.js 20 或更高版本。

```bash
npm run dev
```

默认地址：

```text
http://127.0.0.1:5173/
```

这个命令直接预览源码目录，适合边改边看。

## 本地构建

```bash
npm run build
```

构建后会生成：

```text
dist/
```

构建内容包括：

- 页面文件。
- 图片和 PDF 资源。
- `.nojekyll`。
- `sitemap.xml`。
- `search-index.json`。

构建后预览：

```bash
npm run preview
```

默认地址：

```text
http://127.0.0.1:4173/
```

## 部署到 GitHub Pages

### 1. 替换仓库内容

将本项目中的文件复制到你的 GitHub Pages 仓库根目录：

```text
xukun12138.github.io
```

建议先备份旧仓库，或新建一个分支保存旧版。

### 2. 提交到 main 分支

```bash
git add .
git commit -m "Redesign academic homepage"
git push origin main
```

### 3. 设置 Pages 发布源

进入 GitHub 仓库页面：

```text
Settings -> Pages
```

在 `Build and deployment` 中，将 `Source` 设置为：

```text
GitHub Actions
```

如果之前是 `Deploy from a branch`，需要改成 `GitHub Actions`。

### 4. 等待自动部署

push 到 `main` 后，GitHub 会自动运行：

```text
.github/workflows/deploy.yml
```

成功后访问：

```text
https://xukun12138.github.io/
```

## 如何更新内容

主要内容都在：

```text
assets/js/data.js
```

常见更新位置：

- `profile`：姓名、单位、邮箱、链接。
- `researchThemes`：研究方向。
- `news`：近期动态。
- `publications`：论文。
- `projects`：项目展示。
- `education`：教育经历。
- `honors`：荣誉。
- `services`：学术服务。

如果添加图片，放到：

```text
assets/images/
```

如果添加 PDF，放到：

```text
assets/pdf/
```

然后在 `data.js` 中引用相对路径，例如：

```js
"assets/pdf/cv.pdf"
```

## 后续建议

- 如果已有正式 CV PDF，可以放到 `assets/pdf/cv.pdf`，并在 `Contact` 或 `CV` 区域添加下载按钮。
- 如果论文数量继续增加，可以把 `publications` 拆成单独的 JSON 文件，构建脚本再读取。
- 如果购买了自定义域名，可以在项目根目录增加 `CNAME` 文件。
- 如果需要访问统计，可加入 Plausible、GoatCounter 或 Google Analytics。

## 常见问题

### GitHub Pages 部署后空白

检查 Actions 是否成功运行；如果失败，打开失败日志，通常能看到具体行号。

### 访问后还是旧页面

浏览器缓存或 GitHub Pages 尚未完成部署。可以等待 1 到 3 分钟后强制刷新。

### Actions 成功但 Pages 没更新

确认 `Settings -> Pages -> Source` 是 `GitHub Actions`。

### 本地运行提示 node 不存在

安装 Node.js 20 或更高版本，然后重新打开终端。

### BibTeX 复制失败

剪贴板 API 在部分浏览器或非安全来源下会受限制。使用 `localhost` 或 `127.0.0.1` 预览通常可以正常复制。
