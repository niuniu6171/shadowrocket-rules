# 自用 Shadowrocket / Clash 分流配置

国内直连、国外代理、不拦广告。两端使用“普通代理”和“Crypto”两个独立手动组，不绑定具体订阅名或节点名。

| 文件 | 用途 |
| --- | --- |
| [SSR_Rule.conf](./SSR_Rule.conf) | Shadowrocket（小火箭）配置；历史文件名，不是 ShadowsocksR 客户端配置 |
| [Clash_Global_Extension.js](./Clash_Global_Extension.js) | Clash Verge Rev 全局扩展脚本，使用 Mihomo 内核 |
| [Clash_Multi_Subscription.example.yaml](./Clash_Multi_Subscription.example.yaml) | 本地多订阅模板，需填写自己的 Clash/Mihomo 订阅链接 |
| [sources.json](./sources.json) | 通用域名集版本、地址、SHA-256 和核对记录 |
| [exchange_domains.json](./exchange_domains.json) | 历史交易所直连清单，仅留作迁移核对，两端都不再使用 |

仓库不包含节点账号、密码、真实订阅地址、CA 证书或 HTTPS 解密配置。节点继续使用自己的订阅。

## Shadowrocket

在“配置”页从 URL 下载并选中新配置：

[下载 SSR_Rule.conf](https://raw.githubusercontent.com/niuniu6171/shadowrocket-rules/main/SSR_Rule.conf)

首页“全局路由”选择“配置”。在**配置文件内的代理分组**分别选择：

- **普通代理**：用于其他代理流量的节点。
- **Crypto**：用于加密货币服务的节点。

两组通过 `policy-regex-filter=.*` 列出已导入节点，使用 `select` 手动选择，不绑定订阅名或节点名，不自动轮换。可以让两组分别使用不同订阅的节点。更换订阅后重新选节点即可；删除、改名或更新节点后请检查两组选择。首页当前节点不能代替两个组内的选择。

确认两个通用远程域名集下载成功。首次下载失败时可临时切换“代理”模式，成功后恢复“配置”。Crypto 名单内嵌，无需额外下载。

无需安装 CA 证书。已启用的第三方模块可能改变分流、拦截或解密行为。

## Clash Verge Rev

备份现有全局扩展脚本，将 [Clash_Global_Extension.js](./Clash_Global_Extension.js) 全文粘贴到“订阅 → 全局扩展脚本”，保存并重新应用当前配置。

使用“规则”模式，在“代理”页分别进入“普通代理”和“Crypto”，各选一个节点。`profile.store-selected` 用于保存选择；所选节点被删除或改名后需重新选择。

脚本为两个组纳入**当前运行配置**中的内嵌节点及所有 `proxy-providers`，不读取其他未启用订阅卡片。两个组均为手动选择，不相互嵌套；可选同一家或不同家的节点。脚本不主动加入 DIRECT，并设置空组回退为 REJECT。

“普通代理”和“Crypto”是脚本管理的组名，已有同名组会重建为手动组。其他原策略组、节点、代理链引用、节点提供器及其他规则提供器继续保留。若内嵌节点或代理集合本身占用这两个名称，脚本会报错，需要先重命名。更换节点或代理集合后重新应用脚本会刷新组成员，重复应用不会累积重复组。

脚本替换分流规则和 DNS，关闭配置中的 IPv6，保留客户端的 TUN 开关。预留规则提供器名 `personal-global`、`personal-cn`。客户端设置或后执行的订阅扩展可能覆盖脚本，以实际运行配置为准。

### 同时使用两家订阅

仅在订阅页添加两张独立卡片，不代表两家的节点已经进入同一份运行配置。使用 `proxy-providers` 同时加载两家订阅：

1. 复制 [Clash_Multi_Subscription.example.yaml](./Clash_Multi_Subscription.example.yaml) 到本地，填入两家的 **Clash/Mihomo 格式订阅链接**。模板中的 `example.invalid` 地址是占位符，不能直接使用。
2. 将填写好的文件作为本地配置导入 Clash Verge Rev 并选中，应用本仓库的全局扩展脚本。
3. 在“代理”页的两个组中分别选择节点。模板自动添加 `A | ` / `B | ` 前缀，便于区分同名节点。

也可以保留当前主订阅，在本地“全局扩展配置”中添加第二家的 `proxy-providers`，再由全局扩展脚本生成两个组。提供器的链接、名称和缓存路径在本地维护；每个提供器的缓存路径要唯一。模板以直连方式下载订阅，需保证订阅地址可直接访问。

以后换服务商，只改本地提供器的订阅链接并更新节点，再在两个组里重新选择。分流脚本无需改变。**真实订阅链接不要写入公开仓库。**

官方参考：[多订阅合并](https://www.clashverge.dev/guide/config.html)、[扩展执行顺序](https://www.clashverge.dev/guide/extend.html)、[代理集合](https://wiki.metacubex.one/config/proxy-providers/)。

## 分流行为

优先顺序：局域网 → 自定义例外 → Crypto → Steam/连通性检测例外 → 规则下载站 → 国外域名集 → 国内域名集 → 中国 IP → 普通代理。

- 局域网访问及局域网 SSH 直连。
- Crypto 分类优先使用独立节点组，包括上游收录的 Bybit / Binance。
- Steam 商店、社区及列出的网页资源走普通代理；`steamcontent.com` 下载域名、Steam 连通性检测和 Windows 连通性检测直连。其他下载地址按通用规则处理。
- BrowserLeaks 走普通代理；不按整个 Steam 或 SSH 进程强制直连。
- 不引用广告拦截规则，不改写网页，不开启 MITM。

两端流量规则顺序与加密货币名单对齐，但 DNS、客户端匹配方式、GeoIP 数据库和流量接管范围可能不同。“国内/国外”沿用上游服务分类与 GeoIP，不等于公司注册地。

## Crypto 名单与更新

唯一来源为 [v2fly/domain-list-community 的 category-cryptocurrency](https://github.com/v2fly/domain-list-community/blob/c1c2cf0d252871e8739747714df06e8d2671f72f/data/category-cryptocurrency)，固定到提交 `c1c2cf0d252871e8739747714df06e8d2671f72f`。展开 26 个来源文件并去重，内嵌 **227 条域名后缀和 8 条精确主机规则**，两份文件均保留来源哈希和 MIT 许可。

涵盖上游收录的交易所、行情网站、钱包及链上服务。所有属性（含 `@cn`）统一归入 Crypto；`full:` 保持精确主机边界，不将共享客服或云服务的整个根域名纳入。社区分类不保证覆盖某个 App 的所有请求，未收录域名继续按通用规则处理。

两端均已删除原 Bybit / Binance 手写补充及直连例外，不读取 `exchange_domains.json`。旧清单中独有的地区站等不再单独保留。

更新时，从固定提交递归展开 `include:`，将普通域名 / `domain:` 转为 `DOMAIN-SUFFIX`、`full:` 转为 `DOMAIN`，去重后同步替换小火箭的 `BEGIN CRYPTO` 区块及 Clash 的 `PERSONAL_CRYPTO_RULES`，刷新来源哈希与数量。遇到带筛选条件的 include、keyword、regexp 或 affiliation 时须先核对语义，不可直接忽略。更新节点订阅不会更新固定的 Crypto 名单。

## DNS 与 TUN

Clash 的 Crypto 域名通过 **Crypto 组**访问 Cloudflare/Google DoH，普通国外 DNS 通过**普通代理组**。Crypto 的精确主机与后缀 DNS 策略分别保持边界；旧交易所专用直连 DNS 已移除。国内域名集、直连目的地和节点域名使用阿里/腾讯 DoH。节点域名独立解析，避免先连节点才能解析节点的循环依赖。组内节点不可用时，对应的国外 DNS 也可能不可用。

保留 Fake-IP 及 Windows 联网检测、QQ/微信登录、NTP、小米服务兼容项。DNS 监听 `127.0.0.1:1053`。保留客户端 TUN 开关，只补充严格路由及 TCP/UDP 53 接管参数，不主动开启 TUN。

小火箭仍沿用原有国内 DoH 设置，单独声明节点及直连 DNS，去掉普通 DNS 和公网查询的系统 DNS 回退；此次未将其 DNS 改为按 Crypto 组转发，不保证国外域名不向国内 DNS 查询。保留私网旁路、节点不支持 UDP 时拒绝、Google DNS 53 接管及 ICMP 应答。

两端 `.lan` / `.local` 使用系统 DNS。DoH 加密到解析服务的传输，解析服务仍可看到查询域名。关闭配置 IPv6 不等于关闭操作系统 IPv6；仅开系统代理时，不遵循代理的软件仍可能直连。本配置不承诺整台设备完全无 DNS/WebRTC 泄漏。

## 通用规则来源

来源：[blackmatrix7/ios_rule_script](https://github.com/blackmatrix7/ios_rule_script)，固定提交 `4435ba4141d82aab94e541e29023fc6a1f627723`。

使用 Shadowrocket `*_Domain.list` 和 Clash `*_Domain.yaml`。有效国外域名集 34,892 项、国内域名集 3,691 项，小火箭本地补齐 `.cn`、`.ms`。哈希及核对记录见 `sources.json`，哈希仅用于一致性校验。

远程域名集刷新不跟随上游分支变化。更新时同步修改两份配置的提交号，检查差异并更新 `sources.json`。本仓库 `main` 下载链接会随主分支提交更新；尚未合并的改动需使用对应分支链接。

## 自定义与回退

小火箭在标记位置添加个人规则，策略可填 `DIRECT`、`普通代理`、`Crypto`。Clash 在 `PERSONAL_EXTRA_RULES` 添加，支持相同策略及 `PROXY`（映射到普通代理）。这些例外优先于 Crypto 和通用规则。

回退时，小火箭重新选择原配置；Clash 恢复备份脚本并重新应用原配置。原订阅内容不会被脚本覆盖。旧的 `Mini-AntiLeak.conf`、`Group-AntiLeak.conf` 已移除，历史版本可在 Git 中查看。

## 验证

需要 Python 3 与 Node.js：

```sh
python -m unittest discover -s tests -p test_proxy_config.py -v
```

2026-09-23：13 项离线测试通过。覆盖两端完整规则顺序、Crypto 名单、独立手动组、双代理集合、订阅更换、重复应用、名称冲突、旧直连规则及 DNS 移除、精确主机边界、原代理链引用及 TUN 开关保留。

Mihomo v1.19.31 在隔离目录中通过两种配置的 `-t` 检查：内嵌双节点、双文件代理集合。另启动隔离内核，通过本地控制接口确认两个组都能列出双节点，并分别保持 A / B 两个不同选择。测试未开启 TUN 或系统代理，仅使用虚构 SOCKS 节点；远程域名集下载后核对 SHA-256。未修改正在运行的 Clash 客户端设置，也未通过真实订阅测试出口。导入后应在连接记录中核对策略组和实际节点。

小火箭版本已由用户反馈分组使用正常；客户端升级、订阅变更后仍需检查实际分流。
