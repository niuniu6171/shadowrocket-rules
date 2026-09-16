🚀 Shadowrocket Rules

Shadowrocket（小火箭）分流规则，模块化的规则集合，支持 直连（DIRECT）/代理（PROXY）/屏蔽（REJECT） 三大类规则，适用于日常科学分流与广告过滤场景。

🎯 目标：保持规则简洁、可控、易组合，同时保证数据的持续更新与实用性

分组规则：Group-AntiLeak.conf
         内有多组分流规则 按应用场景分组

极简规则：Mini-AntiLeak.conf
         极简方式防DNS泄露


## Clash Verge 全局扩展脚本

[Clash_Global_Extension.js](./Clash_Global_Extension.js) 是 2026-09-16 从本机 Clash Verge 导出的全局扩展脚本备份，不是 Shadowrocket 配置文件。

- 国内域名、国内 IP 和局域网直连，其余流量按原有订阅及代理规则处理。
- 保留 Steam 商店／社区代理、Steam 客户端进程和 Windows OpenSSH 直连规则。
- 配置国内外 DoH、fake-ip DNS、TUN 自动路由，并引用 Loyalsoldier 代理域名规则集。
- 订阅中需要存在“节点选择”或“🔰 手动选择”策略组；脚本不包含节点账号、密码或订阅地址。
- DNS 中的 `ipv6` 为 `false`；脚本不会主动关闭顶层 IPv6，也不会替代完整的节点／订阅配置。

恢复方法：在 Clash Verge 的“订阅 → 全局扩展脚本”中备份原内容，再粘贴此文件内容并保存、重新应用配置。脚本会覆写 DNS 设置并补充 TUN 参数，使用前应核对策略组名称。
