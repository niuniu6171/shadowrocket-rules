"""Offline checks; never read subscriptions or perform router operations."""
import json
from pathlib import Path
import shutil
import subprocess
import unittest


ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "Clash_Global_Extension.js"
SHADOWROCKET = ROOT / "SSR_Rule.conf"
NODE_RUNNER = r"""
const fs = require('fs');
const vm = require('vm');
const input = JSON.parse(fs.readFileSync(0, 'utf8'));
const context = vm.createContext({});
vm.runInContext(fs.readFileSync(input.script, 'utf8'), context);
let result = context.main(input.config);
if (input.twice) result = context.main(result);
process.stdout.write(JSON.stringify(result));
"""


def transform(config, twice=False):
    result = subprocess.run(
        [shutil.which("node") or "node", "-e", NODE_RUNNER],
        input=json.dumps({"script": str(SCRIPT), "config": config, "twice": twice}),
        text=True, encoding="utf-8", capture_output=True, timeout=15,
    )
    if result.returncode:
        raise ValueError(result.stderr)
    return json.loads(result.stdout)


def fixture():
    return {
        "proxies": [{"name": "test-node", "type": "socks5", "server": "127.0.0.1", "port": 9}],
        "proxy-groups": [{"name": "original", "type": "select", "proxies": ["test-node"]}],
        "rules": ["DOMAIN-SUFFIX,ads.example,REJECT", "MATCH,original"],
        "tun": {"enable": False, "stack": "mixed"},
    }


def shadowrocket_rules():
    text = SHADOWROCKET.read_text(encoding="utf-8")
    return [line.strip() for line in text.split("[Rule]\n")[1].split("[Host]")[0].splitlines()
            if line.strip() and not line.startswith("#")]


class ShadowrocketTests(unittest.TestCase):
    def test_independent_selectors_without_subscription_or_node_binding(self):
        text = SHADOWROCKET.read_text(encoding="utf-8")
        groups = [line.strip() for line in text.split("[Proxy Group]\n")[1].split("[Rule]")[0].splitlines()
                  if line.strip() and not line.startswith("#")]
        self.assertEqual(groups, ["普通代理 = select,policy-regex-filter=.*",
                                  "Crypto = select,policy-regex-filter=.*"])
        rules = shadowrocket_rules()
        self.assertEqual(rules[-1], "FINAL,普通代理")
        self.assertTrue(all(line.rsplit(",", 1)[-1] in ("Crypto", "普通代理", "DIRECT", "no-resolve")
                            for line in rules))
        self.assertNotIn("[MITM]", text)
        self.assertNotIn("[Script]", text)

    def test_crypto_precedes_general_rules_and_preserves_host_boundaries(self):
        rules = shadowrocket_rules()
        first_remote = next(i for i, rule in enumerate(rules) if rule.startswith("DOMAIN-SET,"))
        crypto = [rule for rule in rules if rule.endswith(",Crypto")]
        self.assertEqual(len(crypto), len(set(crypto)))
        self.assertTrue(crypto)
        self.assertTrue(all(rules.index(rule) < first_remote for rule in crypto))

        def local_policy(host):
            for rule in rules[:first_remote]:
                kind, domain, policy, *_ = rule.split(",")
                if kind == "DOMAIN" and host == domain:
                    return policy
                if kind == "DOMAIN-SUFFIX" and (host == domain or host.endswith("." + domain)):
                    return policy
            return None

        for host in ("api.bybit.com", "stream.bybit.com", "api.binance.com", "www.okx.com",
                     "coinbase.com", "coinmarketcap.com", "coingecko.com", "metamask.io",
                     "oklink.com", "bybit.ada.support", "bybit-exchange.github.io",
                     "zftksc.launches.appsflyersdk.com"):
            with self.subTest(host=host):
                self.assertEqual(local_policy(host), "Crypto")
        for host in ("fakebybit.com", "bybit.com.example.org", "cloudfront.net", "amazonaws.com",
                     "other.ada.support", "other.launches.appsflyersdk.com", "github.io"):
            with self.subTest(host=host):
                self.assertIsNone(local_policy(host))
        self.assertEqual(local_policy("store.steampowered.com"), "普通代理")
        self.assertEqual(local_policy("cdn.steamcontent.com"), "DIRECT")
        self.assertEqual(local_policy("router.lan"), "DIRECT")

    def test_old_personal_exchange_supplements_are_removed(self):
        rules = shadowrocket_rules()
        for domain in ("bybit.nl", "bybit.tr", "bybit.kz", "bybitgeorgia.ge", "bybit.ae",
                       "bybit.eu", "bybit.id", "monitor-frontend-collector.a.bybit-aws.com"):
            self.assertFalse(any(rule.split(",")[1] == domain for rule in rules))
        manifest = json.loads((ROOT / "exchange_domains.json").read_text(encoding="utf-8"))
        for service in manifest["services"].values():
            for kind, field in (("DOMAIN-SUFFIX", "suffixes"), ("DOMAIN", "exact_hosts")):
                for domain in service[field]:
                    self.assertNotIn(kind + "," + domain + ",DIRECT", rules)


@unittest.skipUnless(shutil.which("node"), "Node.js required")
class ProxyConfigTests(unittest.TestCase):
    def test_subscription_preserved_and_ads_removed(self):
        original = fixture()
        result = transform(original)
        self.assertEqual(result["proxies"], original["proxies"])
        self.assertIn(original["proxy-groups"][0], result["proxy-groups"])
        self.assertFalse(any(",REJECT" in rule for rule in result["rules"]))
        self.assertEqual(result["rules"][-1], "MATCH,original")

    def test_reapplication_is_idempotent(self):
        self.assertEqual(transform(fixture()), transform(fixture(), twice=True))

    def test_reuses_existing_selector_without_duplicate_group(self):
        for name in ("节点选择", "🔰 手动选择", "PROXY", "Proxy"):
            with self.subTest(name=name):
                source = fixture()
                source["proxy-groups"] = [{"name": name, "type": "select", "proxies": ["test-node", "DIRECT"]}]
                result = transform(source, twice=True)
                self.assertEqual(result["proxy-groups"], source["proxy-groups"])
                self.assertEqual(result["rules"][-1], "MATCH," + name)
                self.assertTrue(all(url.endswith("#" + name) for url in result["dns"]["nameserver"]))
                for key in ("personal-global", "personal-cn"):
                    self.assertEqual(result["rule-providers"][key]["proxy"], name)

    def test_custom_match_group_and_dependency_are_preserved(self):
        source = fixture()
        source["proxy-groups"].append({"name": "media", "type": "select", "proxies": ["original"]})
        result = transform(source)
        self.assertEqual(result["proxy-groups"], source["proxy-groups"])
        self.assertEqual(result["rules"][-1], "MATCH,original")

    def test_fallback_group_is_created_once(self):
        source = fixture()
        source.pop("proxy-groups")
        result = transform(source, twice=True)
        self.assertEqual(len(result["proxy-groups"]), 1)
        self.assertEqual(result["rules"][-1], "MATCH,自用默认代理")

    def test_provider_only_subscription(self):
        source = {"proxy-providers": {"my-provider": {"type": "file", "path": "./nodes.yaml"}}}
        result = transform(source)
        self.assertEqual(result["proxy-providers"], source["proxy-providers"])
        group = result["proxy-groups"][0]
        self.assertEqual(group["use"], ["my-provider"])
        self.assertEqual(group["empty-fallback"], "REJECT")
        self.assertNotIn("DIRECT", group["proxies"])

    def test_empty_and_conflicting_subscription(self):
        for source in ({}, {"proxies": [{"name": "local", "type": "direct"}]},
                       {"proxies": [{"name": "自用默认代理", "type": "socks5"}]}):
            with self.subTest(source=source), self.assertRaises(ValueError):
                transform(source)

    def test_tun_enable_is_preserved(self):
        for enabled in (False, True):
            source = fixture()
            source["tun"]["enable"] = enabled
            result = transform(source)
            self.assertEqual(result["tun"]["enable"], enabled)
            self.assertEqual(result["tun"]["stack"], "mixed")
        self.assertNotIn("enable", transform({"proxies": fixture()["proxies"]})["tun"])

    def test_dns_bootstrap_and_foreign_route(self):
        dns = transform(fixture())["dns"]
        self.assertTrue(all(url.endswith("#original") for url in dns["nameserver"]))
        self.assertTrue(all(url.endswith("#DIRECT") for url in dns["proxy-server-nameserver"]))
        self.assertTrue(all(url.startswith("https://") for url in dns["default-nameserver"]))
        self.assertEqual(dns["listen"], "127.0.0.1:1053")

    def test_common_rules_stay_aligned_except_intentional_crypto_difference(self):
        sr = SHADOWROCKET.read_text(encoding="utf-8")
        self.assertNotIn("[MITM]", sr)
        self.assertNotIn("[Script]", sr)
        source_rules = [line.strip() for line in sr.split("[Rule]\n")[1].split("[Host]")[0].splitlines()
                        if line.strip() and not line.startswith("#")]
        normalized = []
        for line in source_rules:
            if line.endswith(",Crypto"):
                continue
            if line.startswith("DOMAIN-SET,"):
                name = "personal-global" if "/Global/" in line else "personal-cn"
                line = "RULE-SET," + name + "," + line.rsplit(",", 1)[1]
            if line.startswith("IP-CIDR,") and ":" in line.split(",")[1]:
                line = line.replace("IP-CIDR,", "IP-CIDR6,", 1)
            normalized.append(line.replace(",普通代理", ",original").replace("FINAL,", "MATCH,"))
        # Clash intentionally retains its existing exchange DIRECT exceptions.
        manifest = json.loads((ROOT / "exchange_domains.json").read_text(encoding="utf-8"))
        exchange_rules = {kind + "," + domain + ",DIRECT"
                          for service in manifest["services"].values()
                          for kind, field in (("DOMAIN-SUFFIX", "suffixes"), ("DOMAIN", "exact_hosts"))
                          for domain in service[field]}
        common_clash_rules = [rule for rule in transform(fixture())["rules"] if rule not in exchange_rules]
        self.assertEqual(normalized, common_clash_rules)

    def test_exchange_domains_override_proxy_without_broad_matching(self):
        result = transform(fixture())
        early_rules = result["rules"][:result["rules"].index("RULE-SET,personal-global,original")]

        def match(host):
            for rule in early_rules:
                parts = rule.split(",")
                if parts[0] == "DOMAIN" and host == parts[1]:
                    return parts[2]
                if parts[0] == "DOMAIN-SUFFIX" and (host == parts[1] or host.endswith("." + parts[1])):
                    return parts[2]
            return None

        for host in ("bybit.com", "api.bybit.com", "stream.bybit.com", "api.bytick.com",
                     "s1.bycsi.com", "api3.byapps.net", "api.bybit.eu", "binance.com",
                     "accounts.binance.com", "api1.binance.com", "fstream.binance.com",
                     "data-api.binance.vision", "public.bnbstatic.com", "public.nftstatic.com",
                     "zftksc.launches.appsflyersdk.com", "bybit.ada.support"):
            with self.subTest(host=host):
                self.assertEqual(match(host), "DIRECT")
        for host in ("evilbybit.com", "binance.com.attacker.example", "cloudfront.net",
                     "other.launches.appsflyersdk.com", "other.ada.support", "google.com"):
            with self.subTest(host=host):
                self.assertIsNone(match(host))

    def test_exchange_manifest_matches_rules_and_direct_dns(self):
        manifest = json.loads((ROOT / "exchange_domains.json").read_text(encoding="utf-8"))
        result = transform(fixture())
        dns = result["dns"]["nameserver-policy"]
        for service in manifest["services"].values():
            for kind, field, prefix in (("DOMAIN-SUFFIX", "suffixes", "+."), ("DOMAIN", "exact_hosts", "")):
                for domain in service[field]:
                    with self.subTest(domain=domain):
                        self.assertIn(kind + "," + domain + ",DIRECT", result["rules"])
                        self.assertTrue(all(url.endswith("#DIRECT") for url in dns[prefix + domain]))


if __name__ == "__main__":
    unittest.main()
