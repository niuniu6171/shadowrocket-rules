# 自用 Shadowrocket / Clash 分流配置

国内直连、国外代理、不拦广告，所有代理流量共用默认节点选择。

| 文件 | 用途 |
| --- | --- |
| [SSR_Rule.conf](./SSR_Rule.conf) | Shadowrocket（小火箭）配置；沿用历史文件名，不是 ShadowsocksR 客户端配置 |
| [Clash_Global_Extension.js](./Clash_Global_Extension.js) | Clash Verge Rev 全局扩展脚本，使用 Mihomo 内核 |
| [sources.json](./sources.json) | 第三方域名集版本、地址、SHA-256 和核对记录 |
| [exchange_domains.json](./exchange_domains.json) | Bybit / Binance 直连域名清单、来源及证据范围 |

不包含节点账号、密码、订阅地址、CA 证书或 HTTPS 解密配置。节点继续使用自己的订阅。

## 导入使用

### Shadowrocket

在“配置”页从 URL 下载并选中新配置：

[下载 SSR_Rule.conf](https://raw.githubusercontent.com/niuniu6171/shadowrocket-rules/main/SSR_Rule.conf)

首页“全局路由”选择“配置”，选择一个可用节点。所有 `PROXY` 流量使用首页当前选择。确认两个远程域名集下载成功；首次下载失败时可临时切换“代理”模式，成功后恢复“配置”。

无需安装 CA 证书。已经启用的第三方模块可能继续改变分流、拦截或解密行为，使用时需检查模块设置。

### Clash Verge Rev

备份现有全局扩展脚本，将下面文件全文粘贴到“订阅 → 全局扩展脚本”，保存并重新应用订阅：

[查看 Clash_Global_Extension.js 原文](https://raw.githubusercontent.com/niuniu6171/shadowrocket-rules/main/Clash_Global_Extension.js)

使用“规则”模式，在订阅原有的“节点选择”组中选择节点。脚本优先复用“节点选择”“🔰 手动选择”“PROXY”“Proxy”，其次复用订阅 MATCH 指定的手动组或唯一手动组；没有合适的组时才创建“自用默认代理”。支持内嵌节点和 `proxy-providers`。

脚本替换分流规则和 DNS，关闭配置中的 IPv6；保留节点、节点提供器、原策略组和原规则提供器。本脚本规则、国外 DNS 和规则下载统一使用选中的代理组，不重复创建选择入口，也不删除其他组的代理链引用。复用组保留原有成员和行为，包括可能存在的 DIRECT 选项；要使用代理需选择实际节点。仅新建的默认组设置为空时拒绝连接。

新建默认组使用 `自用默认代理`；预留规则提供器名 `personal-global`、`personal-cn`，请勿用于其他用途。客户端设置或后执行的订阅扩展可能覆盖脚本，以实际运行配置为准。

## 分流行为

优先顺序：局域网 → 自定义例外 → Steam/连通性检测例外 → 规则下载站 → 国外域名集 → 国内域名集 → 中国 IP → 其他代理。

- 局域网访问及局域网 SSH 直连。
- Steam 商店、社区及列出的网页资源走代理；`steamcontent.com` 下载域名和 Steam 连通性检测直连，其他下载地址按通用规则处理。
- Windows 连通性检测直连；BrowserLeaks 网站走代理。
- Bybit / Binance 的主站、API、行情、资源及社区收录的 App 域名优先直连，详见下节。
- 不按整个 Steam 或 SSH 进程强制直连。
- 不引用广告拦截规则，不改写网页，不开启 MITM。

“国内/国外”沿用上游服务分类和 GeoIP 判断，不等于公司注册地。例如国内集合包含 `.ms` 等微软常用链接所在后缀。两端域名集对齐，但客户端匹配方式、GeoIP 数据库和流量接管范围可能不同。

## Bybit / Binance 直连例外

2026-09-17 查询官方 API 文档、下载页及 v2fly/domain-list-community，加入 **60 条域名后缀和 4 条精确主机规则**。本地静态保存，不新增会自动变化的远程规则订阅。

| 服务 | 覆盖示例 |
| --- | --- |
| Bybit 主站 / API / 行情 | `bybit.com`、`bytick.com`，包含 `www`、`api`、`api2`、`stream` 等任意子域名 |
| Bybit App / 资源 / 备用入口 | `bycsi.com`、`byapps.net`、`byapis.com`、`bycbe.com`、`bybitglobal.com` 等社区收录域名 |
| Bybit 地区站 | 官方文档列出的 `.eu`、`.nl`、`.tr`、`.kz`、`.ae`、`.id` 和 `bybitgeorgia.ge` |
| Binance 主站 / API / 行情 | `binance.com`、`binance.vision`，覆盖登录、REST、WebSocket 及公共行情子域名 |
| Binance App / 资源 / 备用入口 | `binanceapi.com`、`bnbstatic.com`、`nftstatic.com`、`bsappapi.com`、`bscdnweb.com`、社区收录的备用域名等 |

完整后缀、精确主机、来源 URL 及来源哈希见 `exchange_domains.json`。其中 `official_documented_suffixes` 标记得到官方资料支持的子集；其他域名仅有社区分类依据，未逐个确认当前归属或 App 版本使用情况。社区主来源固定提交 `6fe5416797ec88d29a3a1c69ce1431d73b955e88`。

`DOMAIN-SUFFIX,bybit.com,DIRECT` 会匹配根域名和任意层级子域名，不需要重复列举 `www.bybit.com`，也不会匹配 `fakebybit.com` 或 `bybit.com.example.org`。共享客服及 App 归因服务仅匹配清单中的专用主机，不将整个 `ada.support`、`appsflyersdk.com`、`cloudfront.net`、`amazonaws.com` 等公共服务直连，也不使用 `DOMAIN-KEYWORD,byb` 等宽泛关键词。Binance.US、慈善与链生态域名不在本次范围。

这些例外排在通用代理域名集之前；Clash 同时给它们设置直连 DoH，避免 DNS 仍依赖默认代理节点。小火箭由已有 `direct-dns-server` 处理直连域名。

注意：这是直连路由选择，不保证所有接口直连可达。[Bybit 官方 API 文档](https://bybit-exchange.github.io/docs/v5/guide)明确提示美国和中国大陆 IP 的 API 请求可能被拒绝并返回 403。官网能打开不能证明登录、行情、交易接口都可用。本次未登录账号、未抓取 App 流量，也未进行交易请求；手机实际版本仍可能有清单外的验证、推送或共享第三方域名。

官方交叉核对：[Bybit WebSocket](https://bybit-exchange.github.io/docs/v5/ws/connect)、[Bybit 资源域名示例](https://bybit-exchange.github.io/docs/v5/asset/convert/convert-coin-list)、[Binance REST](https://developers.binance.com/en/docs/products/spot/rest-api)、[Binance WebSocket](https://www.binance.com/en/academy/articles/how-to-use-binance-websocket-stream)。社区原始清单：[Bybit](https://github.com/v2fly/domain-list-community/blob/6fe5416797ec88d29a3a1c69ce1431d73b955e88/data/bybit)、[Binance](https://github.com/v2fly/domain-list-community/blob/6fe5416797ec88d29a3a1c69ce1431d73b955e88/data/binance)。

## DNS 与 TUN

Clash 使用国内/国外分开解析：国内域名集、直连目的地和节点域名使用阿里/腾讯 DoH，其他默认使用通过选中的默认代理组访问的 Cloudflare/Google DoH。单独解析节点，避免 DNS 循环依赖；默认节点不可用时国外 DNS 也可能不可用。

保留 Fake-IP 和 Windows 联网检测、QQ/微信登录、NTP、小米服务的兼容项。保留客户端 TUN 开关，仅补充严格路由和 TCP/UDP 53 接管参数，不主动开启 TUN。DNS 监听 `127.0.0.1:1053`。

小火箭沿用 lazy.conf 的国内 DoH 思路，单独声明节点及直连 DNS，去掉普通 DNS 和公网查询的系统 DNS 回退；不保证国外域名不向国内 DNS 查询。保留私网旁路、节点不支持 UDP 时拒绝、Google DNS 53 端口接管和 ICMP 应答。

两端局域网 `.lan` / `.local` 使用系统 DNS。DoH 加密到解析服务的传输，解析服务仍可看到查询域名。关闭配置中的 IPv6 不等于关闭操作系统 IPv6；仅开启系统代理时，未遵守代理的软件仍可能直连。本配置不承诺整台设备完全无 DNS/WebRTC 泄漏。

## 规则来源与更新

域名集来源：[blackmatrix7/ios_rule_script](https://github.com/blackmatrix7/ios_rule_script)，固定到提交 `4435ba4141d82aab94e541e29023fc6a1f627723`。

使用 Shadowrocket `*_Domain.list` 和 Clash `*_Domain.yaml`。上游已拆分域名和其他类型规则，单独引用普通规则文件会遗漏域名。

有效国外域名集 34,892 项、国内域名集 3,691 项。小火箭上游将 `.cn`、`.ms` 放在另一个文件，因此本地补齐这两项。核对详情和文件 SHA-256 见 `sources.json`；哈希用于一致性校验，不是独立的安全背书。

远程域名集固定版本，自动刷新不会跟随上游分支变化。更新时需同时修改两份配置中的提交号，检查域名差异并更新 `sources.json`。固定版本会逐渐过时，可每月或遇到分流问题时检查。

本仓库的 `main` 下载链接会随本仓库提交更新。旧 `Mini-AntiLeak.conf`、`Group-AntiLeak.conf` 已移除，使用者需改为上述 `SSR_Rule.conf` 链接；旧版本仍可在 Git 历史中查看。

## 自定义与回退

Shadowrocket 在标记位置添加个人规则；Clash 在 `PERSONAL_EXTRA_RULES` 中添加，两端同步修改。例如 `DOMAIN-SUFFIX,example.com,DIRECT`；代理策略两端均可填 `PROXY`，Clash 的个人例外会将它替换为实际复用的组名。

回退时，小火箭重新选择原配置；Clash 恢复备份脚本并重新应用订阅。新规则缓存不覆盖原订阅文件。

## 验证

需要 Python 3 和 Node.js，运行离线测试：

```sh
python -m unittest discover -s tests -p test_proxy_config.py -v
```

2026-09-17：12 项离线测试通过（包含代理组复用、引用保持、重复应用、交易所规则优先级和 DNS 一致性）。Mihomo v1.19.29 在隔离目录中使用虚构 SOCKS 节点完成配置 `-t` 检查。百度、哔哩哔哩样例匹配直连；Google、GitHub、ChatGPT 样例匹配代理。

上述为配置与规则检查，不是实际联网、DNS 出口、Steam 下载或 iOS 实测。导入后应检查连接记录；Shadowrocket 仍需手机验证。

## 参考

- [lazy.conf](https://github.com/Johnshall/Shadowrocket-ADBlock-Rules-Forever/blob/release/lazy.conf) 及既有个人 Clash 脚本的兼容设置。
- [Clash Verge Rev 扩展脚本](https://www.clashverge.dev/guide/script.html)。
- [Mihomo DNS](https://wiki.metacubex.one/config/dns/) 与[规则集合](https://wiki.metacubex.one/config/rule-providers/)。
