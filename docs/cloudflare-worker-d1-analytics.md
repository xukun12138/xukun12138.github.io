# Cloudflare Worker + D1 私有访客统计部署方案

## 目标

这个方案把公开主页和私有访客后台分开：

- GitHub Pages 继续托管学术主页。
- Cloudflare Worker 负责记录访问。
- Cloudflare D1 保存访问记录。
- `/admin` 管理员后台只允许你用密码登录查看。

公开主页只展示聚合计数 `PV` 和 `UV`，不会公开访客 IP。访客 IP、城市、国家、运营商、访问页面、访问时间、User-Agent 等只在 Worker 的管理员后台中显示。

## 已加入项目的文件

- `analytics-worker/src/worker.js`：Worker API 和管理员后台。
- `analytics-worker/migrations/0001_create_visits.sql`：D1 数据表结构。
- `analytics-worker/wrangler.toml`：Cloudflare Worker 配置。
- `analytics-worker/package.json`：Wrangler 命令。
- `analytics-worker/.dev.vars.example`：本地开发密钥模板。
- `assets/js/data.js`：新增 `analytics.workerUrl` 配置。
- `assets/js/app.js`：新增私有统计接口调用逻辑。

## 你需要做的额外操作

### 1. 准备 Cloudflare 账号

注册或登录 Cloudflare：

```text
https://dash.cloudflare.com/
```

### 2. 进入 Worker 项目目录

如果项目在桌面：

```powershell
cd C:\Users\Kun\Desktop\xukun12138.github.io\analytics-worker
```

如果使用我当前工作目录：

```powershell
cd C:\Users\Kun\Documents\Codex\2026-07-03\wo\work\homepage_counter_repo\analytics-worker
```

### 3. 安装 Wrangler

```powershell
npm install
```

### 4. 登录 Cloudflare

```powershell
npx wrangler login
```

浏览器会弹出 Cloudflare 授权页面，按提示登录并授权。

### 5. 创建 D1 数据库

```powershell
npx wrangler d1 create xukun-homepage-analytics
```

命令会返回一段类似下面的配置：

```toml
[[d1_databases]]
binding = "DB"
database_name = "xukun-homepage-analytics"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

把里面的 `database_id` 复制到：

```text
analytics-worker/wrangler.toml
```

替换这一行：

```toml
database_id = "REPLACE_WITH_D1_DATABASE_ID"
```

### 6. 设置管理员密码和会话密钥

执行：

```powershell
npx wrangler secret put ADMIN_PASSWORD
```

然后输入你自己的后台登录密码。

再执行：

```powershell
npx wrangler secret put SESSION_SECRET
```

这里输入一串长随机字符。可以用下面命令生成：

```powershell
node -e "console.log(crypto.randomUUID() + crypto.randomUUID())"
```

### 7. 初始化远程 D1 数据表

```powershell
npm run d1:migrate:remote
```

如果命令询问是否确认，输入：

```text
y
```

### 8. 部署 Worker

```powershell
npm run deploy
```

部署成功后会得到一个 Worker 地址，例如：

```text
https://xukun-homepage-analytics.YOUR_SUBDOMAIN.workers.dev
```

### 9. 回填 Worker 地址到主页

打开：

```text
assets/js/data.js
```

找到：

```js
analytics: {
  workerUrl: ""
},
```

改成：

```js
analytics: {
  workerUrl: "https://xukun-homepage-analytics.YOUR_SUBDOMAIN.workers.dev"
},
```

### 10. 本地构建检查

回到项目根目录：

```powershell
cd ..
npm run build
```

### 11. 推送 GitHub Pages

```powershell
git add .
git commit -m "Enable private visitor analytics"
git push origin main
```

GitHub Actions 成功后，主页会开始把访问记录写入你的 D1 数据库。

## 后台查看

打开：

```text
https://xukun-homepage-analytics.YOUR_SUBDOMAIN.workers.dev/admin
```

用 `ADMIN_PASSWORD` 登录。

后台会显示：

- PV
- UV
- 独立 IP 数
- 24 小时 PV/UV
- 最近访问记录
- 访客 IP
- 大致城市、地区、国家
- 经纬度
- 运营商 / ASN
- 访问页面
- 来源页面
- User-Agent

## 注意事项

IP 地址属于个人数据。公开学术主页记录访客 IP 时，建议在主页或隐私说明中明确告知“网站会记录访问日志用于站点维护和安全分析”。

IP 定位不是 GPS 精确定位。Cloudflare 能提供的是基于 IP 的近似地理位置，通常到国家、省/州、城市和运营商级别，不能保证真实物理地址。

如果你之后绑定自己的域名，可以把 Worker 也绑定到类似下面的地址：

```text
https://analytics.xukun12138.com
```

这样会比 `workers.dev` 地址更正式。
