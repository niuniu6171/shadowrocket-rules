// Clash Verge Rev + Mihomo: 国内直连、国外代理、不拦广告。
// 替换 rules / DNS；保留订阅节点、节点提供器及其他策略组；重建普通代理和 Crypto 手动组。
// 规则固定到提交版本，更新方法见 README.md。
const PERSONAL_RULE_REV = "4435ba4141d82aab94e541e29023fc6a1f627723";
const PERSONAL_PROXY = "普通代理";
const PERSONAL_CRYPTO_PROXY = "Crypto";

// 自定义例外放在这里，优先于远程域名集。策略用 DIRECT、PROXY（普通代理）或 Crypto。
// PROXY 会替换为普通代理组名称。
const PERSONAL_EXTRA_RULES = [
    // "DOMAIN-SUFFIX,example.com,DIRECT",
];

// Crypto 与 SSR_Rule.conf 使用同一上游快照；不合并旧交易所补充。
// Source: https://github.com/v2fly/domain-list-community/blob/c1c2cf0d252871e8739747714df06e8d2671f72f/data/category-cryptocurrency
// 235 rules from 26 source files.
// Source SHA256 data/asproex: 660602913148afe8434ba7cf140661815f22cd6823d59d6de557f7e9cb4b01f9
// Source SHA256 data/bestchange: 11adb55f83f2002399c363cc7d3300235035e11e2b0b81fc5d7a6671389652f8
// Source SHA256 data/binance: 9e0134ff1d724bbbbc44730cd723b3c6952873aaa65fc2bec6ae8b25b1d70f68
// Source SHA256 data/bitflyer: 9699f1b82b0d1dbeebda231ff0bf2b2465176d782565385d58175d5cff623556
// Source SHA256 data/bitsquare: 5c2d6f852e88a531fddbb249e97f753fab8f3af0dff4a3eafe0d63fb4de1b8c3
// Source SHA256 data/bybit: 8827c8c475f05cfbcb6e486752e88d000d5531a91a7b8b0cf5bbafb89a23b8e6
// Source SHA256 data/category-cryptocurrency: 0848f09d9b8f2d3c3dfc3603c842670627696bff87f1d519733282d0f5611129
// Source SHA256 data/coinone: 329622262f4916f658108ce06b31db18743a0dfb5f732729111480f811bea0a8
// Source SHA256 data/deribit: a5b51924426cbddcef9ff528744485c5db807dfe2b7826785076a91c28605a33
// Source SHA256 data/ethereum: e0f992aa0ef0c62460e31bc40dc4283dee3ae8bb49e1ad75da30c3ceeefa9b49
// Source SHA256 data/gateio: 6c4f15862d003b8baa0fa95ca2ccfff892842e50e1d386881673fc3b7a2d32ac
// Source SHA256 data/huobi: 20341bab3b685d6703b633bfb617c6a19324e4a7022290ac03fda7c5706d207a
// Source SHA256 data/kraken: b3b555a42d744b4a3c70ece5b4fd29e9fa05ab4e43fe3b02ee67d464d3433158
// Source SHA256 data/kucoin: 2f90bce8fc42d5a158c9bd8f0fd3c8735138d18b4b4943efca24d5c71f7884d7
// Source SHA256 data/lighter: bf4247e8e18bf1882d358806a85d4b4f5f39f777886cf7bcad72fb355c0cc8d8
// Source SHA256 data/localbitcoins: 3507c72f09232335d43c9d86be767f1f9f9ce57e8f4ac3f0ef5d6ccfdd6b4f56
// Source SHA256 data/nexo: db20fc567d8a345d97bcb4716bd6486593a6cf134836ab46bb9620ed05efeb52
// Source SHA256 data/okx: b2c5efae97b921b7a2b5bd497292de9d306f4dce8a8f4cc2689a3ccca10196f3
// Source SHA256 data/onekey: a5dab19eb347c680dc7d50778e0cd83581698a1c441edd41b698fcd8ba6b421c
// Source SHA256 data/redotpay: 0600c25e0529bc980f7b4086da124f585ba1e6c50439e2a7694575b28722ef16
// Source SHA256 data/safepal: d98ef1b9bf52bba51677d3f7450dfeb6ab61299b275db9c6a15ee8e64bf84888
// Source SHA256 data/straitsx: ad9e219f63ecd83a05b55aa4dcabbe20f44686c06eb50c0f6d984c8eb7c01f70
// Source SHA256 data/trustwallet: 0c5cc521b201c31c985a0e563493c35fc972e91dca95a08b5b5df089a0ccb4ef
// Source SHA256 data/wisekey: 0c0364a7c7e14ae30cf75de729ea66f48c6a71f468503b39d16ab3a41c73cc95
// Source SHA256 data/wynd: 0fb57ac9a87e6f47331b4237a580f2250b57a13a33dc8ab2cc3165a29e29f782
// Source SHA256 data/zb: 2ecadbeeadde299de1987c6e2c1fcef98e21ea1f824655dcc9da865edb2aaf33
const PERSONAL_CRYPTO_RULES = [
    "DOMAIN,bybit-exchange.github.io",
    "DOMAIN,bybit.ada.support",
    "DOMAIN,d3r7nsslvs6aaf.cloudfront.net",
    "DOMAIN,deribit.cdn.prismic.io",
    "DOMAIN,onekey.zendesk.com",
    "DOMAIN,straitsx-826709081262441084-b790f87a2ae6fd417434295.freshchat.com",
    "DOMAIN,zftksc.cdn-settings.appsflyersdk.com",
    "DOMAIN,zftksc.launches.appsflyersdk.com",
    "DOMAIN-SUFFIX,1inch.io",
    "DOMAIN-SUFFIX,aave.com",
    "DOMAIN-SUFFIX,asproex.com",
    "DOMAIN-SUFFIX,asproexapi.com",
    "DOMAIN-SUFFIX,base.org",
    "DOMAIN-SUFFIX,bestchange.com",
    "DOMAIN-SUFFIX,bestchange.net",
    "DOMAIN-SUFFIX,bestchange.ru",
    "DOMAIN-SUFFIX,binance.cc",
    "DOMAIN-SUFFIX,binance.charity",
    "DOMAIN-SUFFIX,binance.cloud",
    "DOMAIN-SUFFIX,binance.co",
    "DOMAIN-SUFFIX,binance.com",
    "DOMAIN-SUFFIX,binance.info",
    "DOMAIN-SUFFIX,binance.me",
    "DOMAIN-SUFFIX,binance.net",
    "DOMAIN-SUFFIX,binance.org",
    "DOMAIN-SUFFIX,binance.us",
    "DOMAIN-SUFFIX,binance.vision",
    "DOMAIN-SUFFIX,binanceapi.com",
    "DOMAIN-SUFFIX,binancecnt.com",
    "DOMAIN-SUFFIX,binanceru.net",
    "DOMAIN-SUFFIX,binancezh.be",
    "DOMAIN-SUFFIX,binancezh.biz",
    "DOMAIN-SUFFIX,binancezh.cc",
    "DOMAIN-SUFFIX,binancezh.co",
    "DOMAIN-SUFFIX,binancezh.com",
    "DOMAIN-SUFFIX,binancezh.info",
    "DOMAIN-SUFFIX,binancezh.ink",
    "DOMAIN-SUFFIX,binancezh.kim",
    "DOMAIN-SUFFIX,binancezh.link",
    "DOMAIN-SUFFIX,binancezh.live",
    "DOMAIN-SUFFIX,binancezh.mobi",
    "DOMAIN-SUFFIX,binancezh.net",
    "DOMAIN-SUFFIX,binancezh.pro",
    "DOMAIN-SUFFIX,binancezh.sh",
    "DOMAIN-SUFFIX,binancezh.top",
    "DOMAIN-SUFFIX,bingx.com",
    "DOMAIN-SUFFIX,bisq.io",
    "DOMAIN-SUFFIX,bisq.network",
    "DOMAIN-SUFFIX,bitbank.cc",
    "DOMAIN-SUFFIX,bitcoin.org",
    "DOMAIN-SUFFIX,bitcoincore.org",
    "DOMAIN-SUFFIX,bitfinex.com",
    "DOMAIN-SUFFIX,bitflyer.com",
    "DOMAIN-SUFFIX,bitflyer.jp",
    "DOMAIN-SUFFIX,bitget.com",
    "DOMAIN-SUFFIX,bitlayer.org",
    "DOMAIN-SUFFIX,bitmex.com",
    "DOMAIN-SUFFIX,bitquick.co",
    "DOMAIN-SUFFIX,bitsquare.io",
    "DOMAIN-SUFFIX,bitstamp.net",
    "DOMAIN-SUFFIX,bittrex.com",
    "DOMAIN-SUFFIX,blast.io",
    "DOMAIN-SUFFIX,blockchain.com",
    "DOMAIN-SUFFIX,blockfrost.io",
    "DOMAIN-SUFFIX,bmwweb.solutions",
    "DOMAIN-SUFFIX,bnappweb.black",
    "DOMAIN-SUFFIX,bnbchain.org",
    "DOMAIN-SUFFIX,bnbstatic.com",
    "DOMAIN-SUFFIX,bntrace.com",
    "DOMAIN-SUFFIX,bsappapi.cc",
    "DOMAIN-SUFFIX,bsappapi.com",
    "DOMAIN-SUFFIX,bscdnweb.com",
    "DOMAIN-SUFFIX,btcbox.co.jp",
    "DOMAIN-SUFFIX,byabcde.com",
    "DOMAIN-SUFFIX,byapis.com",
    "DOMAIN-SUFFIX,byapps.net",
    "DOMAIN-SUFFIX,bybdc6.com",
    "DOMAIN-SUFFIX,bybit-global.com",
    "DOMAIN-SUFFIX,bybit.biz",
    "DOMAIN-SUFFIX,bybit.cloud",
    "DOMAIN-SUFFIX,bybit.com",
    "DOMAIN-SUFFIX,bybitglobal.com",
    "DOMAIN-SUFFIX,bycbe.com",
    "DOMAIN-SUFFIX,bycsi.com",
    "DOMAIN-SUFFIX,byd3c3.com",
    "DOMAIN-SUFFIX,bymj.io",
    "DOMAIN-SUFFIX,bytick.com",
    "DOMAIN-SUFFIX,cex.io",
    "DOMAIN-SUFFIX,chainid.network",
    "DOMAIN-SUFFIX,clearpool.finance",
    "DOMAIN-SUFFIX,coinalyze.net",
    "DOMAIN-SUFFIX,coinbase.com",
    "DOMAIN-SUFFIX,coindesk.com",
    "DOMAIN-SUFFIX,coingate.com",
    "DOMAIN-SUFFIX,coingecko.com",
    "DOMAIN-SUFFIX,coinglass.com",
    "DOMAIN-SUFFIX,coinmap.org",
    "DOMAIN-SUFFIX,coinmarketcap.com",
    "DOMAIN-SUFFIX,coinone.co.kr",
    "DOMAIN-SUFFIX,coinonecore.com",
    "DOMAIN-SUFFIX,coinonecorp.com",
    "DOMAIN-SUFFIX,coredao.org",
    "DOMAIN-SUFFIX,crypto.com",
    "DOMAIN-SUFFIX,cryptocompare.com",
    "DOMAIN-SUFFIX,cryptomus.com",
    "DOMAIN-SUFFIX,curve.fi",
    "DOMAIN-SUFFIX,cyberx.com",
    "DOMAIN-SUFFIX,debank.com",
    "DOMAIN-SUFFIX,delets.online",
    "DOMAIN-SUFFIX,deribit.com",
    "DOMAIN-SUFFIX,devcon.org",
    "DOMAIN-SUFFIX,dogecoin.com",
    "DOMAIN-SUFFIX,drpc.org",
    "DOMAIN-SUFFIX,dydx.exchange",
    "DOMAIN-SUFFIX,ethereum.foundation",
    "DOMAIN-SUFFIX,ethereum.org",
    "DOMAIN-SUFFIX,etherscan.io",
    "DOMAIN-SUFFIX,fantom.foundation",
    "DOMAIN-SUFFIX,fantom.network",
    "DOMAIN-SUFFIX,fiat24.com",
    "DOMAIN-SUFFIX,flare.network",
    "DOMAIN-SUFFIX,fundingrates.xyz",
    "DOMAIN-SUFFIX,gate.com",
    "DOMAIN-SUFFIX,gate.io",
    "DOMAIN-SUFFIX,gate.tv",
    "DOMAIN-SUFFIX,gateapi.io",
    "DOMAIN-SUFFIX,gatedata.org",
    "DOMAIN-SUFFIX,gateimg.com",
    "DOMAIN-SUFFIX,gateio.live",
    "DOMAIN-SUFFIX,gateio.services",
    "DOMAIN-SUFFIX,gemini.com",
    "DOMAIN-SUFFIX,gmgn.ai",
    "DOMAIN-SUFFIX,guardarian.com",
    "DOMAIN-SUFFIX,hashflow.com",
    "DOMAIN-SUFFIX,hbabit.com",
    "DOMAIN-SUFFIX,hbfile.net",
    "DOMAIN-SUFFIX,htx.com",
    "DOMAIN-SUFFIX,huobi.com",
    "DOMAIN-SUFFIX,huobi.me",
    "DOMAIN-SUFFIX,huobi.pro",
    "DOMAIN-SUFFIX,huobi.sc",
    "DOMAIN-SUFFIX,huobiasia.vip",
    "DOMAIN-SUFFIX,huobigroup.com",
    "DOMAIN-SUFFIX,huobitoken.com",
    "DOMAIN-SUFFIX,hyperliquid.xyz",
    "DOMAIN-SUFFIX,infura.io",
    "DOMAIN-SUFFIX,invity.io",
    "DOMAIN-SUFFIX,isafepal.com",
    "DOMAIN-SUFFIX,kraken.com",
    "DOMAIN-SUFFIX,kraken.onl",
    "DOMAIN-SUFFIX,kucoin.com",
    "DOMAIN-SUFFIX,kucoin.plus",
    "DOMAIN-SUFFIX,lighter.exchange",
    "DOMAIN-SUFFIX,lighter.xyz",
    "DOMAIN-SUFFIX,litecoin.org",
    "DOMAIN-SUFFIX,localbitcoins.com",
    "DOMAIN-SUFFIX,localbitcoinschain.com",
    "DOMAIN-SUFFIX,maple.finance",
    "DOMAIN-SUFFIX,megaeth.com",
    "DOMAIN-SUFFIX,merkl.xyz",
    "DOMAIN-SUFFIX,metalpha.finance",
    "DOMAIN-SUFFIX,metamask.io",
    "DOMAIN-SUFFIX,mexc.co",
    "DOMAIN-SUFFIX,mexc.com",
    "DOMAIN-SUFFIX,mexcsensors.com",
    "DOMAIN-SUFFIX,mytokenapi.com",
    "DOMAIN-SUFFIX,nexo.com",
    "DOMAIN-SUFFIX,nexo.io",
    "DOMAIN-SUFFIX,nftstatic.com",
    "DOMAIN-SUFFIX,nodereal.io",
    "DOMAIN-SUFFIX,oasis.io",
    "DOMAIN-SUFFIX,okex.com",
    "DOMAIN-SUFFIX,oklink.com",
    "DOMAIN-SUFFIX,okx-dns.com",
    "DOMAIN-SUFFIX,okx-dns1.com",
    "DOMAIN-SUFFIX,okx-dns2.com",
    "DOMAIN-SUFFIX,okx.ac",
    "DOMAIN-SUFFIX,okx.cab",
    "DOMAIN-SUFFIX,okx.com",
    "DOMAIN-SUFFIX,okx.com.cdn.cloudflare.net",
    "DOMAIN-SUFFIX,onekey-asset.com",
    "DOMAIN-SUFFIX,onekey.so",
    "DOMAIN-SUFFIX,onekeycn.com",
    "DOMAIN-SUFFIX,onemoment.cc",
    "DOMAIN-SUFFIX,onfinality.io",
    "DOMAIN-SUFFIX,opensea.io",
    "DOMAIN-SUFFIX,osl.com",
    "DOMAIN-SUFFIX,paxful.com",
    "DOMAIN-SUFFIX,payget.pro",
    "DOMAIN-SUFFIX,platov.co",
    "DOMAIN-SUFFIX,pod-15-sunco-ws.zendesk.com",
    "DOMAIN-SUFFIX,polymarket.com",
    "DOMAIN-SUFFIX,ramon.cash",
    "DOMAIN-SUFFIX,ramon.money",
    "DOMAIN-SUFFIX,redotpay.com",
    "DOMAIN-SUFFIX,redotpay.zendesk.com",
    "DOMAIN-SUFFIX,ripple.com",
    "DOMAIN-SUFFIX,rp-static-apne1.s3.ap-northeast-1.amazonaws.com",
    "DOMAIN-SUFFIX,rsk.co",
    "DOMAIN-SUFFIX,saasexch.cc",
    "DOMAIN-SUFFIX,saasexch.co",
    "DOMAIN-SUFFIX,saasexch.com",
    "DOMAIN-SUFFIX,saasexch.info",
    "DOMAIN-SUFFIX,saasexch.io",
    "DOMAIN-SUFFIX,safepal.com",
    "DOMAIN-SUFFIX,satoshilabs.com",
    "DOMAIN-SUFFIX,solidifi.app",
    "DOMAIN-SUFFIX,stealthex.io",
    "DOMAIN-SUFFIX,straitsx.com",
    "DOMAIN-SUFFIX,taiko.xyz",
    "DOMAIN-SUFFIX,theblock.co",
    "DOMAIN-SUFFIX,thirdweb.com",
    "DOMAIN-SUFFIX,trezor.io",
    "DOMAIN-SUFFIX,truefi.io",
    "DOMAIN-SUFFIX,trustwallet.com",
    "DOMAIN-SUFFIX,unisat.io",
    "DOMAIN-SUFFIX,uniswap.org",
    "DOMAIN-SUFFIX,walletconnect.com",
    "DOMAIN-SUFFIX,walletconnect.org",
    "DOMAIN-SUFFIX,web3modal.org",
    "DOMAIN-SUFFIX,wintermute.com",
    "DOMAIN-SUFFIX,wisecoin.com",
    "DOMAIN-SUFFIX,wiseid.com",
    "DOMAIN-SUFFIX,wisekey.com",
    "DOMAIN-SUFFIX,wisekey.com.hk",
    "DOMAIN-SUFFIX,wynd.network",
    "DOMAIN-SUFFIX,wyndlabs.ai",
    "DOMAIN-SUFFIX,xhpjc6-cdn-settings.appsflyersdk.com",
    "DOMAIN-SUFFIX,xlayer.tech",
    "DOMAIN-SUFFIX,zapper.fi",
    "DOMAIN-SUFFIX,zb.app",
    "DOMAIN-SUFFIX,zb.com",
    "DOMAIN-SUFFIX,zb.io",
    "DOMAIN-SUFFIX,zb.live",
    "DOMAIN-SUFFIX,zklighter.elliot.ai"
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
    if (!config || typeof config !== "object" || Array.isArray(config)) {
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
    // 两个名称由本脚本管理；重新应用时刷新成员，不积累重复组。
    // 从当前运行配置取节点，无法读取其他未启用的订阅卡片。
    const managedNames = [PERSONAL_PROXY, PERSONAL_CRYPTO_PROXY];
    managedNames.forEach(function (name) {
        if ((config.proxies || []).some(function (p) { return p.name === name; }) ||
            providers.indexOf(name) !== -1) {
            throw new Error("节点或代理集合占用了分组名称：" + name + "，请先重命名");
        }
    });
    const managedGroups = managedNames.map(function (name) {
        const group = {
            name: name,
            type: "select",
            proxies: nodes.map(function (p) { return p.name; }),
            "exclude-type": "direct|reject|dns|pass",
            "empty-fallback": "REJECT"
        };
        if (providers.length) group.use = providers.slice();
        return group;
    });
    config["proxy-groups"] = managedGroups.concat(groups.filter(function (group) {
        return managedNames.indexOf(group.name) === -1;
    }));

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
        PERSONAL_CRYPTO_RULES.map(function (rule) { return rule + "," + PERSONAL_CRYPTO_PROXY; }),
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
    // 普通国外 DoH 走普通代理；Crypto 域名使用自己的节点组。
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
    const cryptoDNS = ["https://1.1.1.1/dns-query#" + PERSONAL_CRYPTO_PROXY,
                       "https://8.8.8.8/dns-query#" + PERSONAL_CRYPTO_PROXY];
    // 域名策略保留 DOMAIN 与 DOMAIN-SUFFIX 的边界；不让旧直连 DNS 残留。
    PERSONAL_CRYPTO_RULES.forEach(function (rule) {
        const parts = rule.split(",");
        const key = (parts[0] === "DOMAIN-SUFFIX" ? "+." : "") + parts[1];
        config.dns["nameserver-policy"][key] = cryptoDNS;
    });
    // IPv6、TUN 开关和严格路由由客户端设置管理，脚本不覆盖。
    // 只有用户开启 TUN 时以下参数才生效。
    config.tun = Object.assign({}, config.tun || {}, {
        "auto-route": true,
        "auto-detect-interface": true,
        "dns-hijack": ["any:53", "tcp://any:53"]
    });
    config.mode = "rule";
    config.profile = Object.assign({}, config.profile || {}, {"store-selected": true});
    return config;
}

// Crypto data license (v2fly/domain-list-community):
// MIT License
//
// Copyright (c) 2018-2019 V2Ray
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
