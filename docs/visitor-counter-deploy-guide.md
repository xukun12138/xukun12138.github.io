# 访客计数器与部署维护说明

## 本次更新内容

主页底部新增了访客计数器，显示：

- `PV`：页面访问量
- `UV`：独立访客量
- 点击计数器后弹出“当前访问者 IP 位置”面板

当前实现适合 GitHub Pages 这种纯静态网站：

- 访客总量统计由 Busuanzi 第三方脚本提供。
- 当前访问者 IP 归属地由 `https://ipapi.co/json/` 实时查询。
- 网站本身不保存访客 IP，也不保存历史访问记录。

如果以后需要查看“所有访客的历史 IP、地图、访问来源、国家统计”等后台数据，需要接入带后台的统计服务，例如 Umami、GoatCounter、Statcounter、ClustrMaps，或自建后端。

## 修改到的文件

- `index.html`：增加页脚访客计数器、IP 位置弹窗、第三方统计脚本。
- `assets/css/styles.css`：增加计数器和弹窗样式，包含手机端适配。
- `assets/js/app.js`：增加弹窗打开/关闭逻辑，以及 IP 位置查询逻辑。

## 本地预览

进入项目目录：

```powershell
cd C:\Users\Kun\Desktop\xukun12138.github.io
```

如果你是在我当前生成的工作目录中预览，则路径是：

```powershell
cd C:\Users\Kun\Documents\Codex\2026-07-03\wo\work\homepage_counter_repo
```

启动本地预览：

```powershell
npm run dev
```

浏览器打开终端中显示的本地地址，一般是：

```text
http://127.0.0.1:4173/
```

构建检查：

```powershell
npm run build
```

预览构建后的结果：

```powershell
npm run preview
```

## 部署到 GitHub Pages

确认仓库远程地址：

```powershell
git remote -v
```

应该能看到：

```text
https://github.com/xukun12138/xukun12138.github.io.git
```

提交修改：

```powershell
git status
git add index.html assets/css/styles.css assets/js/app.js docs/visitor-counter-deploy-guide.md
git commit -m "Add visitor counter and IP location panel"
git push origin main
```

推送成功后，GitHub Actions 会自动构建和部署，不需要手动上传 `dist` 文件夹。

## 部署后检查

1. 打开 GitHub 仓库：`https://github.com/xukun12138/xukun12138.github.io`
2. 点击 `Actions`
3. 等待最新一次 `Build and deploy academic homepage` 变成绿色对勾
4. 打开主页：`https://xukun12138.github.io/`
5. 滚动到底部，确认能看到访客计数器
6. 点击计数器，确认能弹出当前访问者 IP 位置面板

## 常见问题

如果 PV/UV 显示为 `--`，通常是第三方计数器脚本还没加载完成，或浏览器广告拦截插件拦截了第三方脚本。

如果 IP 位置显示失败，通常是网络、隐私插件、接口限流或第三方服务临时不可用导致。页面会保留弹窗，但显示失败提示，不影响主页主体内容。

如果你希望以后替换成“可查看历史访客地区”的方案，建议优先使用带后台的统计服务，而不是在 GitHub Pages 静态页里直接保存 IP。
