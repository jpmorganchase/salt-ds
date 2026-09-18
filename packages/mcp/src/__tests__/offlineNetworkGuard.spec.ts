import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  createOfflineNetworkProbeSource,
  runOfflineNetworkGuardSelfTest,
  runOfflineScannerWorkerContainmentSelfTest,
  SUPPORTED_THIRD_PARTY_HTTP_CLIENT_PACKAGES,
} from "../../../../scripts/consumer-smoke/offline-network-probe.mjs";
import { BLOCKED_NETWORK_MODULES } from "../../../../scripts/consumer-smoke/offline-network-surfaces.mjs";
import { REPO_ROOT } from "./registryTestUtils.js";

const REQUIRED_NATIVE_NETWORK_MODULES = [
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
];

describe("loader-enforced offline consumer boundary", () => {
  it("blocks the complete native network surface through ESM, CommonJS, and globals", () => {
    expect(BLOCKED_NETWORK_MODULES).toEqual(
      expect.arrayContaining(REQUIRED_NATIVE_NETWORK_MODULES),
    );
    const probe = createOfflineNetworkProbeSource();
    expect(probe).toContain('["esm", () => import(specifier)]');
    expect(probe).toContain('["cjs", () => require(specifier)]');
    expect(probe).toContain("process.getBuiltinModule(specifier)");
    expect(probe).toContain('["fetch", () => fetch(');
    expect(probe).toContain('["websocket", () => new WebSocket(');
    expect(probe).toContain('["eventsource", () => new EventSource(');
    expect(() => runOfflineNetworkGuardSelfTest()).not.toThrow();
    expect(() => runOfflineScannerWorkerContainmentSelfTest()).not.toThrow();
  });

  it("declares that the shipped runtime supports no third-party HTTP client", () => {
    expect(SUPPORTED_THIRD_PARTY_HTTP_CLIENT_PACKAGES).toEqual([]);
    const manifest = JSON.parse(
      fs.readFileSync(
        path.join(REPO_ROOT, "packages/mcp/package.json"),
        "utf8",
      ),
    ) as { dependencies?: Record<string, string> };
    const commonClients = ["axios", "got", "node-fetch", "undici"];
    expect(
      commonClients.filter(
        (name) => manifest.dependencies?.[name] !== undefined,
      ),
    ).toEqual([]);
  });
});
