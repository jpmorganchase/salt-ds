import { createRequire } from "node:module";

interface SaltMcpPackageManifest {
  name: "@salt-ds/mcp";
  version: string;
}

let cached: SaltMcpPackageManifest | null = null;

export function getSaltMcpPackageManifest(): SaltMcpPackageManifest {
  if (cached) return cached;
  const require = createRequire(import.meta.url);
  const value = require("@salt-ds/mcp/package.json") as Partial<SaltMcpPackageManifest>;
  if (value.name !== "@salt-ds/mcp" || typeof value.version !== "string") {
    throw new Error("@salt-ds/mcp package metadata is invalid.");
  }
  cached = { name: value.name, version: value.version };
  return cached;
}
