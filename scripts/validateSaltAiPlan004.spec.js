import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

// The repository Vitest include discovers .spec.js files.

import { sha256 } from "./saltAiEvidenceUtils.mjs";
import {
  assertCommittedEntriesAuthorized,
  assertDerivedExpectation,
  assertDispatchFollowsCheckpoint,
  assertInheritedAuthorityPreserved,
  assertNoHiddenIndexRecords,
  assertRealPathContained,
  enumerateCommittedEntries,
  parseNameStatusZ,
  parsePorcelainV1Z,
  readUniqueMarkdownField,
  resolveCheckpoint,
  validatePlan004Index,
  validateRepositoryLocator,
  validateSchemaLocator,
} from "./validateSaltAiPlan004.mjs";

const base = "d30dc1f7fca047e5180c15d07bb7be4557305eff";

function unit(index) {
  return {
    id: `004/0${index}`,
    status: index === 0 ? "IN_PROGRESS" : "TODO",
    dependency_unit: index === 0 ? null : `004/0${index - 1}`,
    dependency_completion_sha: null,
    checkpoint_sha: index === 0 ? base : null,
    completion_sha: null,
    scope: {
      materialized: index === 0,
      exact_paths: index === 0 ? ["plans/README.md"] : [],
      allow_inherited_dirty: index <= 1,
    },
    verification: [],
    evidence: null,
    successor_eligible: false,
  };
}

function validIndex() {
  return {
    contract: "salt-ai-plan-004-evidence-index/1",
    schema_version: "1.0.0",
    plan_id: "004",
    planned_ancestry: base,
    active_dispatch: { unit: "004/00", checkpoint_sha: base },
    inherited_worktree: {
      base_sha: base,
      branch: "codex/ai-platform",
      reviewed_at: "2026-08-31",
      product_paths: ["product.ts"],
      path_states: [{ path: "product.ts", state: "modified" }],
      staged_product_paths: [],
      staged_patch_sha256: `sha256:${"0".repeat(64)}`,
      unstaged_patch_sha256: `sha256:${"1".repeat(64)}`,
      untracked_files: [],
      protected_path:
        "skills/salt-design-system/references/managed-agents-block.md",
      protected_tail_sha256: `sha256:${"2".repeat(64)}`,
      protected_added_lines: 1,
      protected_removed_lines: 0,
    },
    units: Array.from({ length: 8 }, (_, index) => unit(index)),
    terminal_decision: null,
    plan_003_eligible: false,
  };
}

const validOptions = {
  verifyCommit: () => {},
  verifyEvidence: false,
  allowInheritedDirty: true,
  dirtyEntries: [
    { path: "plans/README.md", code: " M", renameOrCopy: false },
    { path: "product.ts", code: " M", renameOrCopy: false },
  ],
  committedEntries: [],
  authorizedScopePaths: ["plans/README.md"],
  inheritedSnapshot: {
    path_states: [{ path: "product.ts", state: "modified" }],
    staged_patch_sha256: `sha256:${"0".repeat(64)}`,
    unstaged_patch_sha256: `sha256:${"1".repeat(64)}`,
    untracked_files: [],
  },
  readmeText: `- **Active plan/unit:** \`004/00\`\n- **Ancestry checkpoint:** \`${base}\`\n`,
  plan003Text: "- **Status:** DEFERRED\n",
};

describe("validateSaltAiPlan004", () => {
  it("accepts the bootstrap index and inherited dirty allowlist", async () => {
    await expect(
      validatePlan004Index(validIndex(), validOptions),
    ).resolves.toBeTruthy();
  });

  it("rejects unknown fields, statuses, results, and duplicate units", async () => {
    const unknown = validIndex();
    unknown.extra = true;
    await expect(validatePlan004Index(unknown, validOptions)).rejects.toThrow(
      /schema validation/u,
    );

    const status = validIndex();
    status.units[1].status = "RUNNING";
    await expect(validatePlan004Index(status, validOptions)).rejects.toThrow(
      /schema validation/u,
    );

    const result = validIndex();
    result.units[0].evidence = {
      locator: "plans/evidence/004/04.json",
      sha256: `sha256:${"3".repeat(64)}`,
      schema: "test/1",
      result: "MAYBE",
    };
    await expect(validatePlan004Index(result, validOptions)).rejects.toThrow(
      /schema validation/u,
    );

    const duplicate = validIndex();
    duplicate.units[1].id = "004/00";
    await expect(validatePlan004Index(duplicate, validOptions)).rejects.toThrow(
      /missing, duplicated, or reordered/u,
    );
  });

  it("rejects unavailable commits and multiple active units", async () => {
    await expect(
      validatePlan004Index(validIndex(), {
        ...validOptions,
        verifyCommit: () => {
          throw new Error("not an ancestor");
        },
      }),
    ).rejects.toThrow(/not an ancestor/u);

    const movedBoundary = validIndex();
    const replacement = "b".repeat(40);
    movedBoundary.planned_ancestry = replacement;
    movedBoundary.inherited_worktree.base_sha = replacement;
    movedBoundary.active_dispatch.checkpoint_sha = replacement;
    movedBoundary.units[0].checkpoint_sha = replacement;
    await expect(
      validatePlan004Index(movedBoundary, {
        ...validOptions,
        readmeText: `- **Active plan/unit:** \`004/00\`\n- **Ancestry checkpoint:** \`${replacement}\`\n`,
      }),
    ).rejects.toThrow(/immutable adoption boundary/u);

    const multiple = validIndex();
    multiple.units[1].status = "IN_PROGRESS";
    multiple.units[1].scope.materialized = true;
    multiple.units[1].checkpoint_sha = base;
    await expect(validatePlan004Index(multiple, validOptions)).rejects.toThrow(
      /multiple active/u,
    );
  });

  it("rejects unsafe locators, digest drift, and result drift", async () => {
    expect(() => validateRepositoryLocator("../outside.json")).toThrow(
      /unsafe/iu,
    );
    expect(() => validateSchemaLocator("../receipt.schema.json")).toThrow(
      /unsafe/iu,
    );
    const root = await mkdtemp(path.join(tmpdir(), "salt-plan-004-"));
    const receiptDirectory = path.join(root, "plans", "evidence", "004");
    const schemaDirectory = path.join(root, "scripts", "schemas");
    await mkdir(receiptDirectory, { recursive: true });
    await mkdir(schemaDirectory, { recursive: true });
    const bytes = Buffer.from(
      '{"contract":"test/1","required_value":1,"result":"PASS_CANDIDATE"}\n',
    );
    const schemaBytes = Buffer.from(
      `${JSON.stringify({
        $schema: "https://json-schema.org/draft/2020-12/schema",
        type: "object",
        additionalProperties: false,
        required: ["contract", "required_value", "result"],
        properties: {
          contract: { const: "test/1" },
          required_value: { type: "integer" },
          result: { type: "string" },
        },
      })}\n`,
    );
    await writeFile(path.join(receiptDirectory, "04.json"), bytes);
    await writeFile(
      path.join(schemaDirectory, "test-receipt.schema.json"),
      schemaBytes,
    );
    const index = validIndex();
    index.units[0].evidence = {
      locator: "plans/evidence/004/04.json",
      sha256: `sha256:${"4".repeat(64)}`,
      schema: "test/1",
      schema_locator: "scripts/schemas/test-receipt.schema.json",
      schema_sha256: sha256(schemaBytes),
      result: "PASS_CANDIDATE",
    };
    await expect(
      validatePlan004Index(index, {
        ...validOptions,
        root,
        verifyEvidence: true,
      }),
    ).rejects.toThrow(/digest mismatch/u);
    index.units[0].evidence.sha256 = sha256(bytes);
    index.units[0].evidence.result = "DEFER_RETRIEVAL";
    await expect(
      validatePlan004Index(index, {
        ...validOptions,
        root,
        verifyEvidence: true,
      }),
    ).rejects.toThrow(/result mismatch/u);

    const invalidBytes = Buffer.from(
      '{"contract":"test/1","result":"PASS_CANDIDATE"}\n',
    );
    await writeFile(path.join(receiptDirectory, "04.json"), invalidBytes);
    index.units[0].evidence.sha256 = sha256(invalidBytes);
    index.units[0].evidence.result = "PASS_CANDIDATE";
    await expect(
      validatePlan004Index(index, {
        ...validOptions,
        root,
        verifyEvidence: true,
      }),
    ).rejects.toThrow(/receipt schema validation/u);
  });

  it("rejects dirty or committed paths outside the active scope", async () => {
    await expect(
      validatePlan004Index(validIndex(), {
        ...validOptions,
        dirtyEntries: [{ path: "outside.ts", code: " M", renameOrCopy: false }],
      }),
    ).rejects.toThrow(/dirty path outside/iu);
    await expect(
      validatePlan004Index(validIndex(), {
        ...validOptions,
        committedEntries: [
          { path: "outside.ts", code: "M", renameOrCopy: false },
        ],
      }),
    ).rejects.toThrow(/committed path outside/iu);
    await expect(
      validatePlan004Index(validIndex(), {
        ...validOptions,
        committedEntries: [
          { path: "product.ts", code: "M", renameOrCopy: false },
        ],
      }),
    ).rejects.toThrow(/committed path outside/iu);
    await expect(
      validatePlan004Index(validIndex(), {
        ...validOptions,
        dirtyEntries: [
          { path: "plans/README.md", code: "R ", renameOrCopy: true },
        ],
      }),
    ).rejects.toThrow(/renames\/copies/iu);
    await expect(
      validatePlan004Index(validIndex(), {
        ...validOptions,
        committedEntries: [
          {
            path: "plans/README.md",
            sourcePath: "old.md",
            code: "R100",
            renameOrCopy: true,
          },
        ],
      }),
    ).rejects.toThrow(/committed renames\/copies/iu);
  });

  it("rejects mutable scope expansion and inherited snapshot drift", async () => {
    const expanded = validIndex();
    expanded.units[0].scope.exact_paths = ["outside.ts", "plans/README.md"];
    await expect(validatePlan004Index(expanded, validOptions)).rejects.toThrow(
      /authorized dispatch scope/u,
    );

    await expect(
      validatePlan004Index(validIndex(), {
        ...validOptions,
        inheritedSnapshot: {
          ...validOptions.inheritedSnapshot,
          unstaged_patch_sha256: `sha256:${"9".repeat(64)}`,
        },
      }),
    ).rejects.toThrow(/adopted snapshot/u);
  });

  it("rejects Plan 003 eligibility without an indexed final PASS", async () => {
    const index = validIndex();
    index.active_dispatch = null;
    index.units[0].status = "TODO";
    index.units[0].checkpoint_sha = null;
    index.plan_003_eligible = true;
    await expect(
      validatePlan004Index(index, {
        ...validOptions,
        allowInheritedDirty: false,
        dirtyEntries: [],
        readmeText: "- **Active plan/unit:** none\n",
      }),
    ).rejects.toThrow(/final PASS/u);
  });

  it("binds dependency completions and checkpoint ancestry", async () => {
    const index = validIndex();
    const completion = "b".repeat(40);
    index.active_dispatch = { unit: "004/01", checkpoint_sha: completion };
    index.units[0].status = "DONE";
    index.units[0].completion_sha = completion;
    index.units[0].verification = [
      {
        command: "test",
        result: "pass",
        output_sha256: `sha256:${"5".repeat(64)}`,
      },
    ];
    index.units[0].successor_eligible = true;
    index.units[1].status = "IN_PROGRESS";
    index.units[1].scope.materialized = true;
    index.units[1].scope.exact_paths = ["product.ts"];
    index.units[1].dependency_completion_sha = completion;
    index.units[1].checkpoint_sha = completion;
    await expect(
      validatePlan004Index(index, {
        ...validOptions,
        authorizedScopePaths: ["product.ts"],
        dirtyEntries: [{ path: "product.ts", code: " M", renameOrCopy: false }],
        readmeText: `- **Active plan/unit:** \`004/01\`\n- **Ancestry checkpoint:** \`${completion}\`\n`,
      }),
    ).resolves.toBeTruthy();

    index.units[1].scope.exact_paths = [];
    await expect(
      validatePlan004Index(index, {
        ...validOptions,
        authorizedScopePaths: [],
        dirtyEntries: [],
        readmeText: `- **Active plan/unit:** \`004/01\`\n- **Ancestry checkpoint:** \`${completion}\`\n`,
      }),
    ).rejects.toThrow(/inherited paths are not fully contained/u);
    index.units[1].scope.exact_paths = ["product.ts"];

    index.units[1].dependency_completion_sha = "c".repeat(40);
    await expect(
      validatePlan004Index(index, {
        ...validOptions,
        authorizedScopePaths: ["product.ts"],
        dirtyEntries: [],
        readmeText: `- **Active plan/unit:** \`004/01\`\n- **Ancestry checkpoint:** \`${completion}\`\n`,
      }),
    ).rejects.toThrow(/dependency completion differs/u);
  });

  it("requires passing verification evidence for technical successors", async () => {
    const index = validIndex();
    index.active_dispatch = null;
    index.units[0].status = "DONE";
    index.units[0].completion_sha = "b".repeat(40);
    index.units[0].successor_eligible = true;
    await expect(
      validatePlan004Index(index, {
        ...validOptions,
        allowInheritedDirty: false,
        dirtyEntries: [],
        readmeText: "- **Active plan/unit:** none\n",
      }),
    ).rejects.toThrow(/verification evidence/u);
  });

  it("pins requested checkpoints and derives final eligibility", () => {
    const index = validIndex();
    expect(resolveCheckpoint(index, base, "post-commit")).toBe(base);
    expect(() =>
      resolveCheckpoint(index, "b".repeat(40), "post-commit"),
    ).toThrow(/checkpoint differs/u);

    index.active_dispatch = null;
    index.terminal_decision = { result: "PASS" };
    index.plan_003_eligible = false;
    expect(() => assertDerivedExpectation(index, "final")).toThrow(
      /eligibility differs/u,
    );
    index.plan_003_eligible = true;
    expect(assertDerivedExpectation(index, "final")).toBe("PASS");
    expect(() =>
      assertDispatchFollowsCheckpoint("c".repeat(40), "b".repeat(40), "004/01"),
    ).toThrow(/immediately follow/u);
  });

  it("rejects real paths outside the repository", () => {
    const root = path.resolve(tmpdir(), "plan-004-root");
    expect(() =>
      assertRealPathContained(
        root,
        path.resolve(tmpdir(), "outside", "receipt.json"),
        "receipt",
      ),
    ).toThrow(/outside the repository/u);
  });

  it("requires one canonical Markdown control field", () => {
    expect(
      readUniqueMarkdownField(
        "- **Plan 004 evidence authority:**\n  `index@sha256:value`\n",
        "Plan 004 evidence authority",
      ),
    ).toBe("`index@sha256:value`");
    expect(() =>
      readUniqueMarkdownField(
        "- **Status:** DEFERRED\n- **Status:** ACTIVE\n",
        "Status",
      ),
    ).toThrow(/exactly one/u);
    expect(() => assertNoHiddenIndexRecords("h hidden.ts\0")).toThrow(
      /assume-unchanged/u,
    );
    expect(() => assertNoHiddenIndexRecords("S sparse.ts\0")).toThrow(
      /skip-worktree/u,
    );
    expect(() => assertNoHiddenIndexRecords("H normal.ts\0")).not.toThrow();
    expect(() =>
      assertInheritedAuthorityPreserved(
        { product_paths: ["changed.ts"] },
        { product_paths: ["original.ts"] },
      ),
    ).toThrow(/Unit 004\/00 completion/u);
  });

  it("parses porcelain records and marks renames fail-closed", () => {
    expect(
      parsePorcelainV1Z(" M file.ts\0?? new.ts\0R  dest.ts\0source.ts\0"),
    ).toEqual([
      { path: "file.ts", code: " M", renameOrCopy: false },
      { path: "new.ts", code: "??", renameOrCopy: false },
      { path: "dest.ts", code: "R ", renameOrCopy: true },
    ]);
    expect(parseNameStatusZ("M\0file.ts\0R100\0old.ts\0new.ts\0")).toEqual([
      { path: "file.ts", code: "M", renameOrCopy: false },
      {
        path: "new.ts",
        sourcePath: "old.ts",
        code: "R100",
        renameOrCopy: true,
      },
    ]);
  });

  it("enumerates every commit so transient paths cannot disappear", () => {
    const first = "b".repeat(40);
    const second = "c".repeat(40);
    const outputs = new Map([
      [
        `rev-list --reverse --ancestry-path ${base}..HEAD`,
        `${first}\n${second}\n`,
      ],
      [`rev-list --parents -n 1 ${first}`, `${first} ${base}\n`],
      [
        `diff --no-ext-diff --no-textconv --name-status -z --find-renames --find-copies --find-copies-harder --diff-filter=ACDMRTUX ${base}..${first}`,
        "M\0secret.ts\0",
      ],
      [`rev-list --parents -n 1 ${second}`, `${second} ${first}\n`],
      [
        `diff --no-ext-diff --no-textconv --name-status -z --find-renames --find-copies --find-copies-harder --diff-filter=ACDMRTUX ${first}..${second}`,
        "D\0secret.ts\0",
      ],
    ]);
    expect(
      enumerateCommittedEntries(base, "HEAD", (arguments_) =>
        outputs.get(arguments_.join(" ")),
      ),
    ).toEqual([
      { path: "secret.ts", code: "M", renameOrCopy: false },
      { path: "secret.ts", code: "D", renameOrCopy: false },
    ]);
    expect(() =>
      assertCommittedEntriesAuthorized(
        [{ path: "secret.ts", code: "M", renameOrCopy: false }],
        ["allowed.ts"],
        "004/01 completed range",
      ),
    ).toThrow(/out-of-scope path/u);
  });
});
