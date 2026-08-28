import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  createOfflineNetworkProbeSource,
  runOfflineNetworkGuardSelfTest,
  SUPPORTED_THIRD_PARTY_HTTP_CLIENT_PACKAGES,
} from "../../../../scripts/consumer-smoke/offline-network-probe.mjs";
import { BLOCKED_NETWORK_MODULES } from "../../../../scripts/consumer-smoke/offline-network-surfaces.mjs";

describe("offline MCP boundary", () => {
  it("blocks native networking across ESM, CommonJS, and globals", () => {
    expect(BLOCKED_NETWORK_MODULES).toEqual(
      expect.arrayContaining([
        "http",
        "http2",
        "https",
        "net",
        "tls",
        "dgram",
        "dns",
        "dns/promises",
        "node:http",
        "node:http2",
        "node:https",
        "node:net",
        "node:tls",
        "node:dgram",
        "node:dns",
        "node:dns/promises",
      ]),
    );
    const probe = createOfflineNetworkProbeSource();
    expect(probe).toContain('import(specifier)');
    expect(probe).toContain('require(specifier)');
    expect(probe).toContain("process.getBuiltinModule(specifier)");
    expect(probe).toContain('fetch(');
    expect(() => runOfflineNetworkGuardSelfTest()).not.toThrow();
  });

  it("declares no third-party HTTP client dependency", () => {
    expect(SUPPORTED_THIRD_PARTY_HTTP_CLIENT_PACKAGES).toEqual([]);
    const manifest = JSON.parse(
      fs.readFileSync(path.resolve("packages/mcp/package.json"), "utf8"),
    ) as { dependencies?: Record<string, string> };
    expect(
      ["axios", "got", "node-fetch", "undici"].filter(
        (name) => manifest.dependencies?.[name] !== undefined,
      ),
    ).toEqual([]);
  });
});
