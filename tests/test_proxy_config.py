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

    def test_cross_client_rule_order_and_exceptions(self):
        sr = SHADOWROCKET.read_text(encoding="utf-8")
        self.assertNotIn("[MITM]", sr)
        self.assertNotIn("[Script]", sr)
        source_rules = [line.strip() for line in sr.split("[Rule]\n")[1].split("[Host]")[0].splitlines()
                        if line.strip() and not line.startswith("#")]
        normalized = []
        for line in source_rules:
            if line.startswith("DOMAIN-SET,"):
                name = "personal-global" if "/Global/" in line else "personal-cn"
                line = "RULE-SET," + name + "," + line.rsplit(",", 1)[1]
            if line.startswith("IP-CIDR,") and ":" in line.split(",")[1]:
                line = line.replace("IP-CIDR,", "IP-CIDR6,", 1)
            normalized.append(line.replace(",PROXY", ",original").replace("FINAL,", "MATCH,"))
        self.assertEqual(normalized, transform(fixture())["rules"])


if __name__ == "__main__":
    unittest.main()
