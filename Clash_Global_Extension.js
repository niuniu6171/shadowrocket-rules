function main(config) {
  const domesticDNS = [
    "https://doh.pub/dns-query",
    "https://dns.alidns.com/dns-query"
  ];

  const foreignDNS = [
    "https://1.1.1.1/dns-query",
    "https://8.8.8.8/dns-query"
  ];

  config["dns"] = {
    enable: true,
    listen: "0.0.0.0:1053",
    ipv6: false,

    "enhanced-mode": "fake-ip",
    "fake-ip-range": "198.18.0.1/16",
    "fake-ip-filter-mode": "blacklist",

    "fake-ip-filter": [
      "+.lan",
      "+.local",
      "+.arpa",
      "+.msftconnecttest.com",
      "+.msftncsi.com",
      "localhost.ptlogin2.qq.com",
      "localhost.sec.qq.com",
      "localhost.work.weixin.qq.com",
      "time.*.com",
      "time.*.gov",
      "ntp.*.com",
      "pool.ntp.org",
      "+.market.xiaomi.com"
    ],

    "default-nameserver": [
      "119.29.29.29",
      "223.5.5.5"
    ],

    "nameserver-policy": {
      "geosite:cn,private,apple": domesticDNS
    },

    nameserver: foreignDNS,

    // DNS 服务器连接遵循现有分流规则
    "respect-rules": true,

    // 专门解析代理节点域名，避免解析死循环
    "proxy-server-nameserver": domesticDNS,

    // DIRECT 域名使用国内 DNS
    "direct-nameserver": domesticDNS,
    "direct-nameserver-follow-policy": true,

    "prefer-h3": false,
    "use-system-hosts": false,
    "cache-algorithm": "arc"
  };

  // 保留 Clash Verge/UI 生成的 TUN 开关，只补充高级参数
  config["tun"] = {
    ...(config["tun"] || {}),
    "auto-route": true,
    "auto-detect-interface": true,
    "strict-route": true,
    "dns-hijack": [
      "any:53",
      "tcp://any:53"
    ]
  };

  // 仅增强规则层：保留订阅原有策略组、规则及其相对顺序
  const groupNames = new Set(
    (config["proxy-groups"] || [])
      .map(group => group && group.name)
      .filter(Boolean)
  );
  const proxyGroup = ["节点选择", "🔰 手动选择"].find(name => groupNames.has(name));

  if (!proxyGroup) {
    throw new Error("未找到代理策略组：需要“节点选择”或“🔰 手动选择”");
  }

  const providerName = "loyalsoldier-proxy";
  config["rule-providers"] = {
    ...(config["rule-providers"] || {}),
    [providerName]: {
      type: "http",
      behavior: "domain",
      format: "yaml",
      interval: 86400,
      url: "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/proxy.txt",
      path: "./ruleset/loyalsoldier/proxy.yaml"
    }
  };

  const browserLeaksPrefix = "DOMAIN-SUFFIX,browserleaks.com,";
  const providerRulePrefix = `RULE-SET,${providerName},`;
  const windowsConnectivityRules = [
    "DOMAIN-SUFFIX,msftconnecttest.com,DIRECT",
    "DOMAIN-SUFFIX,msftncsi.com,DIRECT"
  ];
  const steamConnectivityRules = [
    "DOMAIN-SUFFIX,steamserver.net,DIRECT",
    "DOMAIN-SUFFIX,steamconnecttest.com,DIRECT"
  ];
  const steamProcessRules = [
    "PROCESS-NAME,steam.exe,DIRECT",
    "PROCESS-NAME,steamwebhelper.exe,DIRECT",
    "PROCESS-NAME,steamservice.exe,DIRECT"
  ];
  // 仅代理 Steam 商店/社区网页资源；不要扩大到整个 steampowered.com
  // 或 steamstatic.com，否则客户端更新和游戏下载也可能进入代理。
  const steamWebDomains = [
    "store.steampowered.com",
    "checkout.steampowered.com",
    "steamstore-a.akamaihd.net",
    "steamcommunity-a.akamaihd.net",
    "steamuserimages-a.akamaihd.net",
    "steamusercontent-a.akamaihd.net",
    "store.akamai.steamstatic.com",
    "store.fastly.steamstatic.com",
    "shared.akamai.steamstatic.com",
    "shared.fastly.steamstatic.com",
    "community.steamstatic.com",
    "community.akamai.steamstatic.com",
    "community.cloudflare.steamstatic.com",
    "community.fastly.steamstatic.com",
    "cdn.akamai.steamstatic.com",
    "cdn.fastly.steamstatic.com",
    "images.steamusercontent.com",
    "clan.steamstatic.com",
    "clan.akamai.steamstatic.com",
    "clan.cloudflare.steamstatic.com",
    "clan.fastly.steamstatic.com",
    "avatars.steamstatic.com",
    "avatars.akamai.steamstatic.com",
    "avatars.cloudflare.steamstatic.com",
    "avatars.fastly.steamstatic.com"
  ];
  const steamWebRulePrefixes = steamWebDomains.map(domain => `DOMAIN,${domain},`);
  const steamCommunityPrefix = "DOMAIN-SUFFIX,steamcommunity.com,";
  const managedRulePrefixes = [
    browserLeaksPrefix,
    providerRulePrefix,
    ...steamWebRulePrefixes,
    steamCommunityPrefix,
    ...windowsConnectivityRules.map(rule => `${rule.split(",").slice(0, 2).join(",")},`),
    ...steamConnectivityRules.map(rule => `${rule.split(",").slice(0, 2).join(",")},`),
    ...steamProcessRules.map(rule => `${rule.split(",").slice(0, 2).join(",")},`)
  ];
  const rules = (Array.isArray(config["rules"]) ? config["rules"] : [])
    .filter(rule =>
      typeof rule !== "string" ||
      !managedRulePrefixes.some(prefix => rule.startsWith(prefix))
    );

  // 确定性修复 BrowserLeaks；规则集则放在 CN/MATCH 兜底规则之前
  rules.unshift(
    `${browserLeaksPrefix}${proxyGroup}`,
    ...steamWebRulePrefixes.map(prefix => `${prefix}${proxyGroup}`),
    `${steamCommunityPrefix}${proxyGroup}`,
    ...steamProcessRules,
    ...windowsConnectivityRules,
    ...steamConnectivityRules
  );
  const fallbackIndex = rules.findIndex(rule => {
    if (typeof rule !== "string") return false;
    return /^(GEOIP|GEOSITE),CN,|^MATCH,/.test(rule.trim());
  });
  rules.splice(
    fallbackIndex === -1 ? rules.length : fallbackIndex,
    0,
    `${providerRulePrefix}${proxyGroup}`
  );
  config["rules"] = rules;

  // Keep Windows OpenSSH outside the proxy/TUN route on every profile.
  const niuniuSshDirectRule = "PROCESS-NAME,ssh.exe,DIRECT";
  const niuniuExistingRules = Array.isArray(config.rules) ? config.rules : [];
  config.rules = [
    niuniuSshDirectRule,
    ...niuniuExistingRules.filter((rule) => rule !== niuniuSshDirectRule),
  ];

  // Domestic and private destinations use the local connection.
  // Keep explicit Steam/browser/process exceptions before these general rules.
  const privateDirectRules = [
    "GEOSITE,private,DIRECT",
    "IP-CIDR6,::1/128,DIRECT,no-resolve",
    "IP-CIDR6,fc00::/7,DIRECT,no-resolve",
    "IP-CIDR6,fe80::/10,DIRECT,no-resolve"
  ];
  const domesticDomainRule = "GEOSITE,cn,DIRECT";
  const domesticIpRule = "GEOIP,CN,DIRECT";
  const generalDirectRules = [...privateDirectRules, domesticDomainRule, domesticIpRule];
  let routedRules = config.rules.filter(rule => !generalDirectRules.includes(rule));
  const broadProxyIndex = routedRules.findIndex(rule =>
    typeof rule === "string" &&
    (rule.startsWith(`RULE-SET,${providerName},`) || rule.startsWith("MATCH,"))
  );
  routedRules.splice(broadProxyIndex < 0 ? routedRules.length : broadProxyIndex,
    0, ...privateDirectRules, domesticDomainRule);
  const finalFallbackIndex = routedRules.findIndex(rule =>
    typeof rule === "string" && rule.startsWith("MATCH,"));
  routedRules.splice(finalFallbackIndex < 0 ? routedRules.length : finalFallbackIndex,
    0, domesticIpRule);
  config.rules = routedRules;

  return config;
}
