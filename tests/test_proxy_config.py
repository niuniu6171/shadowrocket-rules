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
    def test_app_managed_ipv6_and_strict_route_are_preserved(self):
        for ipv6 in (False, True):
            for strict_route in (False, True):
                with self.subTest(ipv6=ipv6, strict_route=strict_route):
                    source = fixture()
                    source["ipv6"] = ipv6
                    source["tun"]["strict-route"] = strict_route
                    result = transform(source, twice=True)
                    self.assertEqual(result["ipv6"], ipv6)
                    self.assertEqual(result["tun"]["strict-route"], strict_route)
        for has_tun in (False, True):
            with self.subTest(has_tun=has_tun):
                source = fixture()
                if not has_tun:
                    source.pop("tun")
                result = transform(source, twice=True)
                self.assertNotIn("ipv6", result)
                self.assertNotIn("strict-route", result["tun"])
                self.assertFalse(result["dns"]["ipv6"])

    def test_original_nodes_providers_and_other_groups_are_preserved(self):
        source = fixture()
        source["proxy-groups"].append({"name": "media", "type": "select", "proxies": ["original"]})
        source["proxies"][0]["dialer-proxy"] = "relay"
        source["proxies"].append({"name": "relay", "type": "socks5", "server": "127.0.0.1", "port": 10})
        source["rule-providers"] = {"old": {"type": "file", "behavior": "domain", "path": "old.yaml"}}
        result = transform(source)
        self.assertEqual(result["proxies"], source["proxies"])
        self.assertEqual(result["proxy-groups"][2:], source["proxy-groups"])
        self.assertEqual(result["rule-providers"]["old"], source["rule-providers"]["old"])
        self.assertFalse(any(",REJECT" in rule for rule in result["rules"]))
        self.assertEqual(result["rules"][-1], "MATCH,普通代理")

    def test_independent_groups_contain_nodes_not_other_selectors(self):
        source = fixture()
        source["proxies"].extend([
            {"name": "provider-B-japan", "type": "socks5", "server": "127.0.0.1", "port": 10},
            {"name": "local-direct", "type": "direct"},
            {"name": "block", "type": "reject"},
        ])
        result = transform(source)
        groups = result["proxy-groups"][:2]
        self.assertEqual([g["name"] for g in groups], ["普通代理", "Crypto"])
        for group in groups:
            self.assertEqual(group["type"], "select")
            self.assertEqual(group["proxies"], ["test-node", "provider-B-japan"])
            self.assertEqual(group["empty-fallback"], "REJECT")
        self.assertTrue(result["profile"]["store-selected"])

    def test_reapplication_refreshes_managed_groups_without_duplicates(self):
        source = fixture()
        self.assertEqual(transform(source), transform(source, twice=True))
        result = transform(source)
        result["proxies"] = [{"name": "new-subscription-node", "type": "socks5", "server": "127.0.0.1", "port": 11}]
        result["proxy-groups"] = result["proxy-groups"][:2]
        refreshed = transform(result, twice=True)
        self.assertEqual(len(refreshed["proxy-groups"]), 2)
        for group in refreshed["proxy-groups"]:
            self.assertEqual(group["proxies"], ["new-subscription-node"])

    def test_managed_names_replace_old_group_behavior_keep_references(self):
        source = fixture()
        source["proxy-groups"] = [
            {"name": "Crypto", "type": "url-test", "proxies": ["DIRECT"]},
            {"name": "普通代理", "type": "select", "proxies": ["Crypto", "DIRECT"]},
            {"name": "media", "type": "select", "proxies": ["普通代理", "Crypto"]},
        ]
        result = transform(source, twice=True)
        self.assertEqual(result["proxy-groups"][-1], source["proxy-groups"][-1])
        for group in result["proxy-groups"][:2]:
            self.assertEqual(group["type"], "select")
            self.assertEqual(group["proxies"], ["test-node"])

    def test_multiple_providers_and_mixed_subscription(self):
        providers = {
            "provider-A": {"type": "file", "path": "./a.yaml"},
            "provider-B": {"type": "file", "path": "./b.yaml"},
        }
        for nodes in ([], fixture()["proxies"]):
            source = {"proxies": nodes, "proxy-providers": providers}
            result = transform(source, twice=True)
            self.assertEqual(result["proxy-providers"], providers)
            for group in result["proxy-groups"]:
                self.assertEqual(group["use"], list(providers))
                self.assertEqual(group["proxies"], [node["name"] for node in nodes])
                self.assertEqual(group["empty-fallback"], "REJECT")

    def test_invalid_empty_and_conflicting_inputs_fail(self):
        invalid = [None, [], {}, {"proxies": [{"name": "local", "type": "direct"}]}]
        for name in ("普通代理", "Crypto"):
            invalid.append({"proxies": [{"name": name, "type": "socks5"}]})
            invalid.append({"proxy-providers": {name: {"type": "file", "path": "nodes.yaml"}}})
        for source in invalid:
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

    def test_cross_client_entire_rule_order_and_crypto_list_match(self):
        normalized = []
        for rule in shadowrocket_rules():
            if rule.startswith("DOMAIN-SET,"):
                name = "personal-global" if "/Global/" in rule else "personal-cn"
                rule = "RULE-SET," + name + "," + rule.rsplit(",", 1)[1]
            if rule.startswith("IP-CIDR,") and ":" in rule.split(",")[1]:
                rule = rule.replace("IP-CIDR,", "IP-CIDR6,", 1)
            normalized.append(rule.replace("FINAL,", "MATCH,"))
        self.assertEqual(normalized, transform(fixture())["rules"])

    def test_crypto_dns_tracks_crypto_group_and_preserves_exact_hosts(self):
        source = fixture()
        source["dns"] = {"nameserver-policy": {"+.bybit.com": ["https://doh.pub/dns-query#DIRECT"]}}
        result = transform(source)
        dns = result["dns"]
        self.assertTrue(all(url.endswith("#普通代理") for url in dns["nameserver"]))
        self.assertTrue(all(url.endswith("#DIRECT") for url in dns["proxy-server-nameserver"]))
        self.assertTrue(all(url.endswith("#DIRECT") for url in dns["direct-nameserver"]))
        self.assertEqual(dns["listen"], "127.0.0.1:1053")
        policy = dns["nameserver-policy"]
        for rule in result["rules"]:
            if rule.endswith(",Crypto"):
                kind, domain, _ = rule.split(",")
                key = ("+." if kind == "DOMAIN-SUFFIX" else "") + domain
                self.assertTrue(all(url.endswith("#Crypto") for url in policy[key]))
        for public in ("+.ada.support", "+.appsflyersdk.com", "+.cloudfront.net", "+.github.io"):
            self.assertNotIn(public, policy)
        for provider in result["rule-providers"].values():
            self.assertEqual(provider["proxy"], "普通代理")

    def test_old_exchange_direct_rules_and_dns_are_removed(self):
        manifest = json.loads((ROOT / "exchange_domains.json").read_text(encoding="utf-8"))
        result = transform(fixture())
        policy = result["dns"]["nameserver-policy"]
        for service in manifest["services"].values():
            for kind, field, prefix in (("DOMAIN-SUFFIX", "suffixes", "+."), ("DOMAIN", "exact_hosts", "")):
                for domain in service[field]:
                    self.assertNotIn(kind + "," + domain + ",DIRECT", result["rules"])
                    self.assertFalse(any(url.endswith("#DIRECT") for url in policy.get(prefix + domain, [])))
        for old_supplement in ("bybit.eu", "bybit.nl", "monitor-frontend-collector.a.bybit-aws.com"):
            self.assertFalse(any(rule.split(",")[1] == old_supplement for rule in result["rules"]))


if __name__ == "__main__":
    unittest.main()
