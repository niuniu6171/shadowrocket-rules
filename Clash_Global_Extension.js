// Clash Verge Rev + Mihomo: 国内直连、国外代理、不拦广告。
// 替换 rules / DNS；保留订阅节点、节点提供器和原策略组。
// 规则固定到提交版本，更新方法见 README.md。
const PERSONAL_RULE_REV = "4435ba4141d82aab94e541e29023fc6a1f627723";
const PERSONAL_FALLBACK_PROXY = "自用默认代理";

// 自定义例外放在这里，优先于远程域名集。策略用 DIRECT 或 PROXY。
// PROXY 会替换为实际复用的代理组名称。
const PERSONAL_EXTRA_RULES = [
    // "DOMAIN-SUFFIX,example.com,DIRECT",
];

// 借鉴本机原脚本：商店/社区网页代理，下载与连通性检测直连。
// 用域名区分，避免将整个 Steam 进程的国外请求都强制直连。
const PERSONAL_STEAM_WEB = [
    "store.steampowered.com", "checkout.steampowered.com",
    "steamstore-a.akamaihd.net", "steamcommunity-a.akamaihd.net",
    "steamuserimages-a.akamaihd.net", "steamusercontent-a.akamaihd.net",
    "store.akamai.steamstatic.com", "store.fastly.steamstatic.com",
    "shared.akamai.steamstatic.com", "shared.fastly.steamstatic.com",
    "community.steamstatic.com", "community.akamai.steamstatic.com",
    "community.cloudflare.steamstatic.com", "community.fastly.steamstatic.com",
    "cdn.akamai.steamstatic.com", "cdn.fastly.steamstatic.com",
    "images.steamusercontent.com", "clan.steamstatic.com",
    "clan.akamai.steamstatic.com", "clan.cloudflare.steamstatic.com",
    "clan.fastly.steamstatic.com", "avatars.steamstatic.com",
    "avatars.akamai.steamstatic.com", "avatars.cloudflare.steamstatic.com",
    "avatars.fastly.steamstatic.com"
];

function main(config) {
    if (!config || typeof config !== "object") {
        throw new Error("没有收到有效的订阅配置");
    }
    const nodes = (config.proxies || []).filter(function (p) {
        return p && p.name && !/^(direct|reject|dns|pass)$/i.test(p.type || "");
    });
    const providers = Object.keys(config["proxy-providers"] || {});
    if (!nodes.length && !providers.length) {
        throw new Error("订阅没有可用节点或节点提供器，请先导入节点订阅");
    }
    const groups = config["proxy-groups"] || [];
    const selectors = groups.filter(function (g) { return g && g.type === "select"; });
    let group = null;
    ["节点选择", "🔰 手动选择", "PROXY", "Proxy"].some(function (name) {
        group = selectors.find(function (g) { return g.name === name; });
        return !!group;
    });
    // 自定义名称优先使用订阅 MATCH 的手动组，避免误选流媒体专用组。
    if (!group) {
        const match = (config.rules || []).find(function (rule) {
            return typeof rule === "string" && /^MATCH,/.test(rule);
        });
        const target = match ? match.split(",")[1].trim() : "";
        group = selectors.find(function (g) { return g.name === target; });
    }
    if (!group && selectors.length === 1) group = selectors[0];
    if (!group) group = selectors.find(function (g) { return g.name === PERSONAL_FALLBACK_PROXY; });
    if (!group) {
        if (groups.some(function (g) { return g.name === PERSONAL_FALLBACK_PROXY; }) ||
            (config.proxies || []).some(function (p) { return p.name === PERSONAL_FALLBACK_PROXY; })) {
            throw new Error("自用默认代理名称已被占用，请修改 PERSONAL_FALLBACK_PROXY");
        }
        group = {
            name: PERSONAL_FALLBACK_PROXY,
            type: "select",
            proxies: nodes.map(function (p) { return p.name; }),
            "exclude-type": "direct|reject|dns|pass",
            "empty-fallback": "REJECT"
        };
        if (providers.length) group.use = providers;
        config["proxy-groups"] = [group].concat(groups);
    }
    const PERSONAL_PROXY = group.name;

    const base = "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/" + PERSONAL_RULE_REV + "/rule/Clash/";
    const ruleProviders = config["rule-providers"] || {};
    ["Global", "China"].forEach(function (category) {
        const key = category === "Global" ? "personal-global" : "personal-cn";
        ruleProviders[key] = {
            type: "http",
            behavior: "domain",
            format: "yaml",
            url: base + category + "/" + category + "_Domain.yaml",
            path: "./ruleset/personal/" + PERSONAL_RULE_REV + "/" + category + ".yaml",
            proxy: PERSONAL_PROXY,
            interval: 604800
        };
    });
    config["rule-providers"] = ruleProviders;
    config.rules = [
        "DOMAIN,localhost,DIRECT",
        "DOMAIN-SUFFIX,local,DIRECT",
        "DOMAIN-SUFFIX,lan,DIRECT",
        "IP-CIDR,127.0.0.0/8,DIRECT,no-resolve",
        "IP-CIDR,10.0.0.0/8,DIRECT,no-resolve",
        "IP-CIDR,172.16.0.0/12,DIRECT,no-resolve",
        "IP-CIDR,192.168.0.0/16,DIRECT,no-resolve",
        "IP-CIDR,169.254.0.0/16,DIRECT,no-resolve",
        "IP-CIDR6,::1/128,DIRECT,no-resolve",
        "IP-CIDR6,fc00::/7,DIRECT,no-resolve",
        "IP-CIDR6,fe80::/10,DIRECT,no-resolve"
    ].concat(PERSONAL_EXTRA_RULES.map(function (rule) {
        return rule.replace(/,PROXY(?=,no-resolve$|$)/, "," + PERSONAL_PROXY);
    }),
        PERSONAL_STEAM_WEB.map(function (domain) { return "DOMAIN," + domain + "," + PERSONAL_PROXY; }), [
        "DOMAIN-SUFFIX,steamcommunity.com," + PERSONAL_PROXY,
        "DOMAIN-SUFFIX,browserleaks.com," + PERSONAL_PROXY,
        "DOMAIN-SUFFIX,steamcontent.com,DIRECT",
        "DOMAIN-SUFFIX,steamserver.net,DIRECT",
        "DOMAIN-SUFFIX,steamconnecttest.com,DIRECT",
        "DOMAIN-SUFFIX,msftconnecttest.com,DIRECT",
        "DOMAIN-SUFFIX,msftncsi.com,DIRECT",
        // 规则下载站先走代理，避免首次下载依赖尚未加载的规则集。
        "DOMAIN,raw.githubusercontent.com," + PERSONAL_PROXY,
        "RULE-SET,personal-global," + PERSONAL_PROXY,
        "DOMAIN-SUFFIX,cn,DIRECT",
        "DOMAIN-SUFFIX,ms,DIRECT",
        "RULE-SET,personal-cn,DIRECT",
        "GEOIP,CN,DIRECT",
        "MATCH," + PERSONAL_PROXY
    ]);

    const domesticDNS = ["https://dns.alidns.com/dns-query#DIRECT", "https://doh.pub/dns-query#DIRECT"];
    // 借鉴本机国内/国外分开解析，并显式指定国外 DoH 走默认代理。
    // 节点域名独立解析，避免“先连节点才能解析节点”的循环依赖。
    config.dns = {
        enable: true,
        listen: "127.0.0.1:1053",
        ipv6: false,
        "enhanced-mode": "fake-ip",
        "fake-ip-range": "198.18.0.1/16",
        "fake-ip-filter-mode": "blacklist",
        "fake-ip-filter": [
            "+.lan", "+.local", "+.arpa", "localhost",
            "+.msftconnecttest.com", "+.msftncsi.com",
            "localhost.ptlogin2.qq.com", "localhost.sec.qq.com",
            "localhost.work.weixin.qq.com", "time.*.com", "time.*.gov",
            "ntp.*.com", "+.pool.ntp.org", "+.market.xiaomi.com"
        ],
        "use-hosts": true,
        "use-system-hosts": false,
        "default-nameserver": ["https://223.5.5.5/dns-query"],
        nameserver: ["https://1.1.1.1/dns-query#" + PERSONAL_PROXY, "https://8.8.8.8/dns-query#" + PERSONAL_PROXY],
        "respect-rules": true,
        "proxy-server-nameserver": domesticDNS,
        "direct-nameserver": domesticDNS,
        "direct-nameserver-follow-policy": false,
        "nameserver-policy": {"rule-set:personal-cn": domesticDNS, "+.lan": "system", "+.local": "system", "+.arpa": "system"},
        "prefer-h3": false,
        "cache-algorithm": "arc"
    };
    // 保留客户端 TUN 开关；只有用户开启 TUN 时这些参数才生效。
    config.tun = Object.assign({}, config.tun || {}, {
        "auto-route": true,
        "auto-detect-interface": true,
        "strict-route": true,
        "dns-hijack": ["any:53", "tcp://any:53"]
    });
    config.mode = "rule";
    config.ipv6 = false;
    config.profile = Object.assign({}, config.profile || {}, {"store-selected": true});
    return config;
}
