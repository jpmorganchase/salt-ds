import { describe, expect, it } from "vitest";
import {
  createSaltRegistryFingerprint,
  getSaltRegistryFingerprint,
} from "../registry/fingerprint.js";
import type { RegistryBuildInfo, SaltRegistry } from "../types.js";

const VERIFIED_AT = "2026-07-11T10:00:00.000Z";

const ICON: SaltRegistry["icons"][number] = {
  id: "icon:workflow",
  name: "WorkflowIcon",
  base_name: "Workflow",
  figma_name: "workflow",
  package: {
    name: "@salt-ds/icons",
    status: "stable",
    since: "1.0.0",
  },
  summary: "Workflow icon",
  status: "stable",
  category: "action",
  synonyms: [],
  aliases: [],
  variant: "outline",
  related_docs: {
    overview: "/salt/components/icon",
    examples: null,
    foundation: null,
  },
  source: {
    repo_path: "packages/icons/src/WorkflowIcon.tsx",
    export_name: "WorkflowIcon",
  },
  deprecations: [],
  last_verified_at: VERIFIED_AT,
};

const COUNTRY_SYMBOL: SaltRegistry["country_symbols"][number] = {
  id: "country-symbol:US",
  code: "US",
  name: "United States",
  package: {
    name: "@salt-ds/countries",
    status: "stable",
    since: "1.0.0",
  },
  summary: "United States country symbol",
  status: "stable",
  aliases: [],
  variants: {
    circle: {
      export_name: "USCircle",
      repo_path: "packages/countries/src/USCircle.tsx",
    },
    sharp: {
      export_name: "USSharp",
      repo_path: "packages/countries/src/USSharp.tsx",
    },
  },
  related_docs: {
    overview: "/salt/components/country-symbol",
    usage: null,
    accessibility: null,
    examples: null,
    foundation: null,
  },
  deprecations: [],
  last_verified_at: VERIFIED_AT,
};

function sourceArtifact(
  path: string,
  timestamp: string,
  sha256: string,
): RegistryBuildInfo["source_artifacts"]["docs_root"] {
  return {
    path,
    kind: "directory",
    exists: true,
    sha256,
    last_modified_at: timestamp,
    file_count: 1,
    newest_file_modified_at: timestamp,
  };
}

function buildInfo(
  sourceRoot: string,
  timestamp: string,
  sha256: string,
): RegistryBuildInfo {
  return {
    source_root: sourceRoot,
    source_artifacts: {
      docs_root: sourceArtifact("site/docs", timestamp, sha256),
      search_data: {
        ...sourceArtifact("site/public/search-data.json", timestamp, sha256),
        kind: "file",
      },
      snapshot_root: sourceArtifact(
        "site/snapshots/latest/salt",
        timestamp,
        sha256,
      ),
    },
  };
}

function registry(overrides: Partial<SaltRegistry> = {}): SaltRegistry {
  return {
    generated_at: VERIFIED_AT,
    version: "0.1.0",
    build_info: null,
    packages: [],
    components: [],
    icons: [ICON],
    country_symbols: [COUNTRY_SYMBOL],
    pages: [],
    patterns: [],
    guides: [],
    tokens: [],
    deprecations: [],
    examples: [],
    token_policy_structural_role_rule_pack: null,
    ...overrides,
  };
}

describe("Salt registry semantic fingerprint", () => {
  it("uses a valid build-time semantic hash without touching collections", () => {
    const semanticHash = `sha256:${"b".repeat(64)}`;
    const lazyRegistry = new Proxy(
      { semantic_hash: semanticHash },
      {
        get(target, property, receiver) {
          if (property !== "semantic_hash") {
            throw new Error(`Unexpected registry read: ${String(property)}`);
          }
          return Reflect.get(target, property, receiver);
        },
      },
    ) as unknown as SaltRegistry;

    expect(getSaltRegistryFingerprint(lazyRegistry)).toBe(semanticHash);
  });

  it("changes when icon or country-symbol content changes", () => {
    const baseline = createSaltRegistryFingerprint(registry());

    expect(
      createSaltRegistryFingerprint(
        registry({ icons: [{ ...ICON, summary: "Updated workflow icon" }] }),
      ),
    ).not.toBe(baseline);
    expect(
      createSaltRegistryFingerprint(
        registry({
          country_symbols: [
            { ...COUNTRY_SYMBOL, name: "United States of America" },
          ],
        }),
      ),
    ).not.toBe(baseline);
  });

  it("ignores checkout provenance and build-time verification timestamps", () => {
    const firstTimestamp = "2026-07-11T10:00:00.000Z";
    const secondTimestamp = "2027-01-01T00:00:00.000Z";
    const first = registry({
      generated_at: firstTimestamp,
      build_info: buildInfo("D:/Work/salt-ds", firstTimestamp, "first"),
    });
    const second = registry({
      generated_at: secondTimestamp,
      build_info: buildInfo(
        "/home/runner/work/salt-ds",
        secondTimestamp,
        "second",
      ),
      icons: [{ ...ICON, last_verified_at: secondTimestamp }],
      country_symbols: [
        { ...COUNTRY_SYMBOL, last_verified_at: secondTimestamp },
      ],
    });

    expect(createSaltRegistryFingerprint(second)).toBe(
      createSaltRegistryFingerprint(first),
    );
  });

  it("does not hash the duplicate derived examples collection", () => {
    const first = registry({
      examples: [
        {
          id: "transient-example",
          code: "<Button />",
        } as SaltRegistry["examples"][number],
      ],
    });
    const second = registry({ examples: [] });

    expect(createSaltRegistryFingerprint(first)).toBe(
      createSaltRegistryFingerprint(second),
    );
  });
});
