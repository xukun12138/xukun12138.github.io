# 访客计数器与部署维护说明

## 本次更新内容

主页底部新增了访客计数器，显示：

- `PV`：页面访问量
- `UV`：独立访客量
- 点击计数器后弹出“当前访问者 IP 位置”面板

当前实现分为两个层级：

- 未配置 Cloudflare Worker 时，主页继续使用公开计数器作为兜底，不保存历史访客 IP。
- 配置 Cloudflare Worker + D1 后，主页会把访问记录写入你的私有 D1 数据库。
- 访客 IP、城市、国家、经纬度、运营商、访问页面和 User-Agent 只在你的 Worker 管理员后台显示。

完整部署说明见：

```text
docs/cloudflare-worker-d1-analytics.md
```

## 修改到的文件

- `index.html`：增加页脚访客计数器、IP 位置弹窗和统计字段。
- `assets/css/styles.css`：增加计数器和弹窗样式，包含手机端适配。
- `assets/js/app.js`：增加弹窗打开/关闭逻辑、IP 位置查询逻辑和私有统计接口调用逻辑。
- `assets/js/data.js`：通过 `analytics.workerUrl` 配置 Cloudflare Worker 地址。
- `analytics-worker/`：Cloudflare Worker + D1 私有访客统计后台。

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
git add .
git commit -m "Update visitor analytics"
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

如果已经配置 `analytics.workerUrl`，PV/UV 会优先读取你自己的 D1 数据库；如果 Worker 地址错误、D1 未初始化或 CORS 未放行当前域名，页面会保留公开计数器兜底。

如果 IP 位置显示失败，通常是 Worker 未部署、Worker 地址未配置、网络问题或 Cloudflare 地理信息暂不可用。页面会保留弹窗，但显示失败提示，不影响主页主体内容。

IP 定位不是 GPS 精确定位。它只能给出基于公网 IP 的近似位置，通常到国家、省/州、城市和运营商级别。
