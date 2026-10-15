# 中国大陆访客定位与分省统计

## 为什么原数据会显示为新加坡

Cloudflare Worker 只能直接看到抵达 Cloudflare 的连接。中国大陆访客如果通过代理、网络加速或其他境外出口访问 `workers.dev`，Worker 得到的是出口 IP，因此国家可能显示为新加坡，并且无法从该出口 IP 反推出真实省份。

Cloudflare 的 `request.cf` 会在可用时提供国家、地区、城市和经纬度，但这些字段描述的是 Cloudflare 实际识别到的连接。参考：[Request.cf 官方文档](https://developers.cloudflare.com/workers/runtime-apis/request/)。

## 当前实现

主页对具有中国大陆浏览器信号的访问执行一次短超时的浏览器端 IPIP 查询：

- 触发信号：浏览器时区为 `Asia/Shanghai`，或语言为 `zh-CN`。
- 查询地址：`SITE_DATA.analytics.mainlandProbeUrl`。
- 超时：1.8 秒；失败后自动退回 Cloudflare 数据，不影响主页和计数器。
- 缓存：当前浏览器会话缓存 6 小时，避免重复查询。
- 验证：Worker 仅接受国家为中国且省份属于预设大陆省级行政区的结果。
- 存储：解析后的 IP/省份用于大陆统计；Cloudflare 看到的出口 IP、国家、地区和城市同时保存在 `edge_*` 字段中。

管理员后台会分别显示：

- 已解析的中国大陆访问量、访客量和省份数量。
- 中国大陆省份列表及地图点位。
- 定位来源，例如 `Direct Cloudflare location`、`Mainland browser lookup`。
- 只有大陆浏览器信号、但仍显示境外出口的记录，标记为 `Likely mainland via proxy`。

IPIP 的数组结构和省级字段见其 [API 说明](https://www.ipip.net/api.html)。该免费查询服务不提供正式质量保证，因此本实现只将它作为尽力而为的补充；IPIP 对免费服务的说明见 [myip 页面](https://www.ipip.net/myip.html)。

## 数据库升级

先执行迁移，再部署新版 Worker：

```powershell
cd C:\Users\Kun\Documents\Codex\2026-07-03\wo\work\homepage_counter_repo\analytics-worker
npm run d1:migrate:remote
npm run deploy
```

迁移不会删除旧记录。旧记录中时区为 `Asia/Shanghai`、但 Cloudflare 国家不是 `CN` 的访问只会被标记为疑似代理出口，不会被凭空分配到某个省份。

## 更稳定的长期方案

`workers.dev` 适合开发和测试；Cloudflare 建议生产服务使用 Route 或 Custom Domain。参考：[workers.dev](https://developers.cloudflare.com/workers/configuration/routing/workers-dev/) 和 [Worker 路由方式](https://developers.cloudflare.com/workers/configuration/routing/)。

要使用自定义域名：

1. 准备一个自己拥有的域名，并把该域名添加到当前 Cloudflare 账号。
2. 为 Worker 配置类似 `analytics.example.com` 的 Custom Domain。
3. 将 `assets/js/data.js` 中的 `analytics.workerUrl` 改为该地址。
4. 重新构建并推送 GitHub Pages。

当前 Cloudflare 账号尚未添加可用 Zone，因此这一步需要先由域名所有者完成域名接入。仅使用普通 Cloudflare 全球网络不能保证中国大陆网络质量；Cloudflare China Network 是 Enterprise 附加服务，并涉及 ICP 要求。参考：[China Network 入门](https://developers.cloudflare.com/china-network/get-started/) 和 [ICP 说明](https://developers.cloudflare.com/china-network/concepts/icp/)。

## 准确性与隐私边界

- IP 定位是近似位置，不是 GPS，也不能作为访客真实物理位置的证明。
- 代理、VPN、企业网关和运营商 NAT 都会影响定位。
- 浏览器提交的数据理论上可被修改，因此后台明确保留 `location_source` 和 Cloudflare 出口信息用于核对。
- 主页中英文隐私说明已告知访客：大陆浏览器信号出现时可能使用浏览器端查询提高省级准确性。
