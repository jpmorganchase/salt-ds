import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { compileSaltProjectPolicyIrV2 } from "../../core/policy/projectPolicyIr.js";
import {
  type AuthorizedProjectPolicySnapshot,
  loadAuthorizedProjectPolicySnapshot,
  MAX_PROJECT_CONTEXT_HANDLE_CHARS,
  ProjectPolicySnapshotCache,
  projectPolicyClaimRecord,
  serializeProjectPolicyClaimResource,
} from "../projectPolicySnapshot.js";

const inspectPackageJsonFileMock = vi.hoisted(() => vi.fn());

vi.mock("../projectContext/saltInstallation.js", async (importOriginal) => ({
  ...(await importOriginal()),
  inspectPackageJsonFile: inspectPackageJsonFileMock,
}));

function cachedSnapshot(
  rootDir: string,
  digestCharacter: string,
  canonical = "{}",
): AuthorizedProjectPolicySnapshot {
  const digest = `sha256:${digestCharacter.repeat(64)}`;
  return {
    authorization: {
      status: "authorized",
      mode: "restricted",
      rootDir,
      authorityRoot: rootDir,
    },
    inspection: {} as AuthorizedProjectPolicySnapshot["inspection"],
    ir: {
      contract: "salt_project_policy_ir_v2",
    } as AuthorizedProjectPolicySnapshot["ir"],
    canonical_json: canonical,
    digest,
    context_digest: digest,
    chunks: [],
    salt_version: null,
    package_versions: {},
  };
}

describe("project-policy snapshots", () => {
  it("issues fixed-size opaque handles and binds them to exact retained snapshots", () => {
    const cache = new ProjectPolicySnapshotCache();
    const longRoot = `D:/${"根".repeat(4_096)}`;
    const first = cachedSnapshot(longRoot, "a", '{"revision":1}');
    const firstHandle = cache.remember(first);

    expect(firstHandle).toHaveLength(MAX_PROJECT_CONTEXT_HANDLE_CHARS);
    expect(firstHandle).toMatch(/^salt-project-context-v1\.[A-Za-z0-9_-]{32}$/u);
    expect(firstHandle).not.toContain("根");
    expect(cache.getByHandle(firstHandle)).toStrictEqual(first);
    expect(cache.remember(first)).toBe(firstHandle);

    const replacement = cachedSnapshot(longRoot, "a", '{"revision":2}');
    const replacementHandle = cache.remember(replacement);
    expect(replacementHandle).not.toBe(firstHandle);
    expect(cache.getByHandle(firstHandle)).toBeNull();
    expect(cache.getByHandle(replacementHandle)).toStrictEqual(replacement);
  });

  it("rejects malformed handles and returns null for well-shaped forged handles", () => {
    const cache = new ProjectPolicySnapshotCache();
    expect(() => cache.getByHandle("not-a-context-handle")).toThrow(
      /invalid project context handle/iu,
    );
    expect(() =>
      cache.getByHandle("salt-project-context-v1.e30"),
    ).toThrow(/invalid project context handle/iu);
    expect(
      cache.getByHandle(`salt-project-context-v1.${"a".repeat(32)}`),
    ).toBeNull();
  });

  it("invalidates an evicted handle", () => {
    const cache = new ProjectPolicySnapshotCache({
      maxEntries: 1,
      maxUtf8Bytes: 64 * 1024,
      maxEntryUtf8Bytes: 32 * 1024,
    });
    const firstHandle = cache.remember(cachedSnapshot("D:/first", "a"));
    const second = cachedSnapshot("D:/second", "b");
    const secondHandle = cache.remember(second);

    expect(cache.getByHandle(firstHandle)).toBeNull();
    expect(cache.getByHandle(secondHandle)).toStrictEqual(second);
  });

  it("does not reinspect live policy state after an authorized digest cache miss", async () => {
    const rootDir = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-policy-cache-miss-"),
    );
    try {
      inspectPackageJsonFileMock.mockRejectedValue(
        new Error("live project inspection must not run"),
      );
      const cache = new ProjectPolicySnapshotCache();
      const result = await loadAuthorizedProjectPolicySnapshot(
        {
          mode: "restricted",
          allowedRoots: [rootDir],
          defaultRoot: rootDir,
        },
        rootDir,
        cache,
        { kind: "context_digest", digest: `sha256:${"f".repeat(64)}` },
      );

      expect(result.authorization).toMatchObject({
        status: "authorized",
        rootDir,
      });
      expect("ir" in result).toBe(false);
      expect(inspectPackageJsonFileMock).not.toHaveBeenCalled();

      const resultWithoutCache = await loadAuthorizedProjectPolicySnapshot(
        {
          mode: "restricted",
          allowedRoots: [rootDir],
          defaultRoot: rootDir,
        },
        rootDir,
        undefined,
        { kind: "context_digest", digest: `sha256:${"e".repeat(64)}` },
      );
      expect(resultWithoutCache.authorization.status).toBe("authorized");
      expect("ir" in resultWithoutCache).toBe(false);
      expect(inspectPackageJsonFileMock).not.toHaveBeenCalled();
    } finally {
      inspectPackageJsonFileMock.mockReset();
      await fs.rm(rootDir, { recursive: true, force: true });
    }
  });

  it("retains recently used digests and evicts the least-recently-used entry", () => {
    const cache = new ProjectPolicySnapshotCache({
      maxEntries: 2,
      maxUtf8Bytes: 64 * 1024,
      maxEntryUtf8Bytes: 32 * 1024,
    });
    const first = cachedSnapshot("D:/repo", "a");
    const second = cachedSnapshot("D:/repo", "b");
    const third = cachedSnapshot("D:/repo", "c");

    cache.remember(first);
    cache.remember(second);
    expect(cache.getByPolicyDigest("D:/repo", first.digest!)).toStrictEqual(first);
    cache.remember(third);

    expect(cache.getByPolicyDigest("D:/repo", second.digest!)).toBeNull();
    expect(cache.getByPolicyDigest("D:/repo", first.digest!)).toStrictEqual(first);
    expect(cache.getByPolicyDigest("D:/repo", third.digest!)).toStrictEqual(third);
  });

  it("binds identical digests to their canonical authorized roots", async () => {
    const cache = new ProjectPolicySnapshotCache();
    const first = cachedSnapshot("D:/first", "a", '{"root":"first"}');
    const second = cachedSnapshot("D:/second", "a", '{"root":"second"}');
    cache.remember(first);
    cache.remember(second);

    expect(cache.getByPolicyDigest("D:/first", first.digest!)?.canonical_json).toBe(
      '{"root":"first"}',
    );
    expect(cache.getByPolicyDigest("D:/second", second.digest!)?.canonical_json).toBe(
      '{"root":"second"}',
    );

    const denied = await loadAuthorizedProjectPolicySnapshot(
      {
        mode: "restricted",
        allowedRoots: [],
        defaultRoot: null,
      },
      "D:/first",
      cache,
      { kind: "policy_digest", digest: first.digest! },
    );
    expect(denied.authorization).toEqual({
      status: "denied",
      reason: "no_allowed_roots",
    });
  });

  it("retains immutable copies rather than caller-owned snapshot objects", () => {
    const cache = new ProjectPolicySnapshotCache();
    const input = cachedSnapshot("D:/repo", "a", '{"stable":true}');
    cache.remember(input);

    input.canonical_json = '{"mutated":true}';
    input.ir!.contract = "mutated" as "salt_project_policy_ir_v2";
    const retained = cache.getByPolicyDigest("D:/repo", input.digest!)!;

    expect(retained.canonical_json).toBe('{"stable":true}');
    expect(retained.ir!.contract).toBe("salt_project_policy_ir_v2");
    expect(Object.isFrozen(retained)).toBe(true);
    expect(Object.isFrozen(retained.ir)).toBe(true);
    expect(() => {
      retained.canonical_json = '{"retrieved":"mutation"}';
    }).toThrow();
    expect(cache.getByPolicyDigest("D:/repo", input.digest!)?.canonical_json).toBe(
      '{"stable":true}',
    );
  });

  it("fails before issuing a snapshot that exceeds the per-entry cache bound", () => {
    const cache = new ProjectPolicySnapshotCache({
      maxEntries: 2,
      maxUtf8Bytes: 2_048,
      maxEntryUtf8Bytes: 1_024,
    });
    const retained = cachedSnapshot("D:/repo", "b");
    cache.remember(retained);
    expect(() =>
      cache.remember(cachedSnapshot("D:/repo", "a", "x".repeat(2_000))),
    ).toThrow(/durable resource-cache entry limit/iu);
    expect(cache.getByPolicyDigest("D:/repo", retained.digest!)).toStrictEqual(retained);
  });

  it("keeps context and policy digest lookup semantics distinct", () => {
    const cache = new ProjectPolicySnapshotCache();
    const first = cachedSnapshot("D:/repo", "a");
    const second = cachedSnapshot("D:/repo", "a");
    first.context_digest = `sha256:${"b".repeat(64)}`;
    second.context_digest = `sha256:${"c".repeat(64)}`;
    cache.remember(first);
    cache.remember(second);

    expect(cache.getByContextDigest("D:/repo", first.digest!)).toBeNull();
    expect(cache.getByContextDigest("D:/repo", first.context_digest)).toStrictEqual(first);
    expect(cache.getByContextDigest("D:/repo", second.context_digest)).toStrictEqual(second);
    expect(cache.getByPolicyDigest("D:/repo", first.digest!)).toStrictEqual(first);
  });

  it("rejects contradictory limits before they can evict retained entries", () => {
    expect(
      () =>
        new ProjectPolicySnapshotCache({
          maxEntries: 2,
          maxUtf8Bytes: 1_024,
          maxEntryUtf8Bytes: 2_048,
        }),
    ).toThrow(/per-entry byte limit cannot exceed the total byte limit/iu);
  });

  it("keeps claim resources bounded even when applicability prose is large", () => {
    const claimRoot = path.resolve("claim-fixture-root");
    const ir = compileSaltProjectPolicyIrV2({
      policyMode: "team",
      declared: true,
      layers: [
        {
          id: "team",
          scope: "team",
          source: {
            type: "file",
            declared_path: ".salt/team.json",
            resolved_path: path.join(claimRoot, ".salt", "team.json"),
          },
          conventions: {
            contract: "project_conventions_v1",
            version: "1.0.0",
            approved_wrappers: [
              {
                name: "ActionButton",
                wraps: "Button",
                reason: `${"漢".repeat(1_000)}${'\\"\u0001'.repeat(500)}`,
                docs: Array.from(
                  { length: 100 },
                  (_, index) => `doc-${index}-${"漢".repeat(100)}`,
                ),
                use_when: Array.from(
                  { length: 100 },
                  (_, index) => `use-${index}-${'\\"\u0001'.repeat(100)}`,
                ),
                avoid_when: Array.from(
                  { length: 100 },
                  (_, index) => `avoid-${index}-${"漢".repeat(100)}`,
                ),
              },
            ],
          },
        },
      ],
    });
    const claim = projectPolicyClaimRecord(ir.occurrences[0]!, claimRoot);

    const serializedResource = serializeProjectPolicyClaimResource(
      ir.occurrences[0]!,
      claimRoot,
      `sha256:${"a".repeat(64)}`,
    );
    expect(Buffer.byteLength(serializedResource, "utf8")).toBeLessThanOrEqual(
      64 * 1024,
    );
    expect(claim).toMatchObject({
      declaration: {
        name: "ActionButton",
        reason_truncated: true,
      },
      selector: {
        fact: "canonical_name",
        value: "Button",
        comparison: "exact",
      },
      applicability: {
        opaque_condition_counts: { use_when: 100, avoid_when: 100 },
      },
      source: {
        layer_id: "team",
        json_pointer: "/approved_wrappers/0",
      },
    });
    expect(claim.coverage).toEqual({
      authored_reason: {
        available: 1,
        returned: 1,
        omitted: 0,
        truncated: true,
      },
      documentation: {
        available: 100,
        returned: 16,
        omitted: 84,
        truncated: true,
        truncated_entries: 0,
      },
      opaque_condition_text: expect.objectContaining({
        available: 200,
        truncated: true,
      }),
    });
    const opaqueCoverage = claim.coverage as {
      opaque_condition_text: { available: number; returned: number; omitted: number };
    };
    expect(
      opaqueCoverage.opaque_condition_text.returned +
        opaqueCoverage.opaque_condition_text.omitted,
    ).toBe(opaqueCoverage.opaque_condition_text.available);
    const serializedClaim = JSON.stringify(claim);
    expect(serializedClaim).not.toContain("u".repeat(1_024));
    expect(serializedClaim).toContain('"text":');
    expect(serializedClaim).toContain('"text_truncated":true');
    expect(serializedClaim).toContain('"reason":');
  });

  it("projects selectors and applicability evidence for every policy category", () => {
    const claimRoot = path.resolve("claim-fixture-root");
    const ir = compileSaltProjectPolicyIrV2({
      policyMode: "team",
      declared: true,
      layers: [
        {
          id: "team",
          scope: "team",
          source: {
            type: "file",
            declared_path: ".salt/team.json",
            resolved_path: path.join(claimRoot, ".salt", "team.json"),
          },
          conventions: {
            contract: "project_conventions_v1",
            version: "1.0.0",
            supported_salt_range: "^2.0.0",
            preferred_components: [
              {
                salt_name: "Button",
                prefer: "ActionButton",
                reason: "Preferred.",
              },
            ],
            approved_wrappers: [
              {
                name: "ActionButton",
                wraps: "Button",
                reason: "Wrapper.",
                import: { from: "./ActionButton", name: "ActionButton" },
              },
            ],
            token_aliases: [
              {
                salt_name: "--salt-color-blue-500",
                prefer: "--app-accent",
                reason: "Alias.",
              },
            ],
            theme_defaults: { reason: "Theme." },
            token_family_policies: [
              {
                family: "color",
                mode: "allow-local-aliases",
                reason: "Family.",
              },
            ],
            pattern_preferences: [
              {
                intent: "upload files",
                prefer: "UploadFlow",
                canonical_salt_start: "FileDropZone",
                reason: "Pattern.",
              },
            ],
            banned_choices: [
              {
                name: "LegacyButton",
                replacement: "Button",
                reason: "Banned.",
              },
            ],
          },
        },
      ],
    });
    const approvedWrapper = ir.occurrences.find(
      (occurrence) => occurrence.category === "approved_wrapper",
    )!;
    approvedWrapper.import_checks = [
      {
        slot: "wrapper_import",
        slot_index: 0,
        from: "./ActionButton",
        name: "ActionButton",
        status: "resolved",
        resolved_path: "D:/repo/ActionButton.tsx",
        reason: null,
      },
    ];
    const selectors = Object.fromEntries(
      ir.occurrences.map((occurrence) => [
        occurrence.category,
        projectPolicyClaimRecord(occurrence, claimRoot).selector,
      ]),
    );

    expect(selectors).toMatchObject({
      preferred_component: {
        fact: "canonical_name",
        value: "Button",
      },
      approved_wrapper: { fact: "canonical_name", value: "Button" },
      token_alias: {
        fact: "source_token",
        value: "--salt-color-blue-500",
      },
      theme_defaults: null,
      token_family_policy: { fact: "token_family", value: "color" },
      pattern_preference: {
        fact: "canonical_name",
        value: "FileDropZone",
      },
      banned_choice: {
        fact: "canonical_name",
        value: "LegacyButton",
      },
    });
    expect(projectPolicyClaimRecord(approvedWrapper, claimRoot)).toMatchObject({
      applicability: {
        salt_version_ranges: ["^2.0.0"],
        import_validation: {
          status: "resolved",
          from: "./ActionButton",
          name: "ActionButton",
        },
      },
      source: {
        repo_relative_source: ".salt/team.json",
        json_pointer: "/approved_wrappers/0",
      },
    });
    expect(
      JSON.stringify(projectPolicyClaimRecord(approvedWrapper, claimRoot)),
    ).toContain('"reason":"Wrapper."');
    expect(
      JSON.stringify(projectPolicyClaimRecord(approvedWrapper, claimRoot)),
    ).not.toMatch(/resolved_path/iu);
    expect(
      JSON.stringify(projectPolicyClaimRecord(approvedWrapper, claimRoot)),
    ).not.toContain(claimRoot);
  });
});
