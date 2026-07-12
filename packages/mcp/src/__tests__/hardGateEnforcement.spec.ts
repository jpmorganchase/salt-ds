import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildRegistry } from "../core/build/buildRegistry.js";
import { loadRegistry } from "../core/registry/loadRegistry.js";
import { createSaltUi } from "../core/tools/createSaltUi.js";
import { migrateToSalt } from "../core/tools/migrateToSalt.js";
import {
  getPublicContractValidationErrors,
  type PublicContract,
} from "../core/tools/publicContract.js";
import { reviewSaltUi } from "../core/tools/reviewSaltUi.js";
import type { SaltRegistry } from "../core/types.js";
import {
  withAnalyzeWorkflowGuidance,
  withChooseWorkflowGuidance,
  withTranslateWorkflowGuidance,
} from "../server/workflowOutputs.js";
import { REPO_ROOT } from "./registryTestUtils.js";

// Behaviour-level Hard Gate enforcement test.
//
// The Skills package documents the Hard Gate as prose
// (`packages/skills/salt-ds/references/core.md`) and
// `packages/skills/__tests__/skillContracts.spec.ts` asserts that the prose
// contains the right phrases. Those tests are structural linters — they do
// not verify the runtime contract that the prose describes.
//
// This file closes that gap. For each public workflow, it confirms that the
// returned `salt_workflow_v1` contract self-enforces the Hard Gate
// invariants (via `getPublicContractValidationErrors`) and that ambiguous
// or under-grounded inputs do not return `action.kind: "implement"`.
//
// If a future change to a workflow ever returns `action.kind: implement`
// without `status: success`, `safety.exact_request_safe: true`, AND
// `evidence.status: complete`, this test fails — even if the prose still
// claims the Hard Gate is in force.
//
const BUILT_AT = "2026-03-10T00:00:00Z";

let registry: SaltRegistry;
let registryDir: string;

beforeAll(async () => {
  registryDir = await fs.mkdtemp(path.join(os.tmpdir(), "salt-hard-gate-"));
  await buildRegistry({
    sourceRoot: REPO_ROOT,
    outputDir: registryDir,
    timestamp: BUILT_AT,
  });
  registry = await loadRegistry({ registryDir });
}, 120000);

afterAll(async () => {
  if (registryDir) {
    await fs.rm(registryDir, { recursive: true, force: true });
  }
});

function assertHardGate(contract: PublicContract): void {
  // The contract must always self-validate.
  const errors = getPublicContractValidationErrors(contract);
  expect(
    errors,
    `Contract failed self-validation: ${errors.join("; ")}`,
  ).toEqual([]);

  // When the contract authorises implementation, every Hard Gate
  // precondition must hold simultaneously.
  if (contract.action.kind === "implement") {
    expect(contract.status).toBe("success");
    expect(contract.safety.exact_request_safe).toBe(true);
    expect(contract.evidence.status).toBe("complete");
  }
}

describe("Hard Gate enforcement (behaviour-level, not prose)", () => {
  it("create_salt_ui: ambiguous prompt does not authorise implementation", () => {
    const ambiguous = createSaltUi(registry, {
      query: "make something good for users",
      include_starter_code: false,
    });
    const contract = withChooseWorkflowGuidance(registry, ambiguous, {
      query: "make something good for users",
    }) as PublicContract;

    assertHardGate(contract);
    expect(contract.action.kind).not.toBe("implement");
  });

  it("create_salt_ui: empty-string prompt does not authorise implementation", () => {
    const empty = createSaltUi(registry, {
      query: "",
      include_starter_code: false,
    });
    const contract = withChooseWorkflowGuidance(registry, empty, {
      query: "",
    }) as PublicContract;

    assertHardGate(contract);
    expect(contract.action.kind).not.toBe("implement");
  });

  it("review_salt_ui: empty source does not authorise implementation", () => {
    const empty = reviewSaltUi(registry, {
      framework: "react",
      code: "",
      view: "compact",
    });
    const contract = withAnalyzeWorkflowGuidance(registry, empty, {
      code: "",
    }) as PublicContract;

    assertHardGate(contract);
    expect(contract.action.kind).not.toBe("implement");
  });

  it("review_salt_ui: parse fallback requires complete-file resubmission", () => {
    const code = `
      import { Button } from "@salt-ds/core";

      export function Incomplete() {
        return <Button>Save</Button>
    `;
    const incomplete = reviewSaltUi(registry, {
      framework: "react",
      code,
      view: "compact",
    });
    const contract = withAnalyzeWorkflowGuidance(registry, incomplete, {
      code,
      root_dir: "D:/fixture",
    }) as PublicContract;

    expect(incomplete.missing_data).toContain(
      "Code could not be parsed as JSX/TSX; validation fell back to a conservative stylesheet scan.",
    );
    assertHardGate(contract);
    expect(contract).toMatchObject({
      status: "blocked",
      safety: {
        canonical_complete: false,
        exact_request_safe: false,
      },
      action: {
        kind: "ask_user",
        question:
          "Can you provide the complete current contents of one changed Salt source file so review can rerun?",
        post_action: null,
      },
      evidence: {
        status: expect.stringMatching(/^(missing|partial)$/),
        missing: expect.arrayContaining([
          expect.stringContaining("complete current contents"),
        ]),
      },
      summary:
        "Salt review could not verify the complete source; submit full parseable changed-file contents and rerun.",
    });
    expect(contract.safety.blocking_reasons).toEqual(
      expect.arrayContaining([
        expect.stringContaining("complete current contents"),
      ]),
    );
  });

  it("migrate_to_salt: empty source outline does not authorise implementation", () => {
    const empty = migrateToSalt(registry, {
      source_outline: {
        regions: [],
        actions: [],
        states: [],
        notes: [],
      },
      include_starter_code: false,
    });
    const contract = withTranslateWorkflowGuidance(registry, empty, {
      source_outline: {
        regions: [],
        actions: [],
        states: [],
        notes: [],
      },
    }) as PublicContract;

    assertHardGate(contract);
    expect(contract.action.kind).not.toBe("implement");
  });

  it("migrate_to_salt validates the same combined scaffold it advertises", () => {
    const sourceOutline = {
      regions: ["header", "sidebar", "main content", "dialog footer"],
      actions: ["primary action with secondary menu", "navigation link"],
      states: ["loading", "validation"],
      notes: ["This screen has a confirmation dialog."],
    };
    const result = migrateToSalt(registry, {
      source_outline: sourceOutline,
      include_starter_code: true,
    });
    const contract = withTranslateWorkflowGuidance(registry, result, {
      source_outline: sourceOutline,
    }) as PublicContract;

    assertHardGate(contract);
    expect(result.combined_scaffold?.[0]?.code).toEqual(expect.any(String));
    expect(contract.guidance.kind).toBe("migrate");
    if (contract.guidance.kind !== "migrate") return;
    expect(contract.guidance.starter_guidance.snippets[0]).toMatchObject({
      code: result.combined_scaffold?.[0]?.code,
      label: expect.stringMatching(/starter/i),
    });
  });

  it("migrate_to_salt does not leak a combined scaffold after starter-code opt-out", () => {
    const sourceOutline = {
      regions: ["header", "sidebar", "main content", "dialog footer"],
      actions: ["primary action with secondary menu", "navigation link"],
      states: ["loading", "validation"],
      notes: ["This screen has a confirmation dialog."],
    };
    const result = migrateToSalt(registry, {
      source_outline: sourceOutline,
      include_starter_code: false,
    });
    const contract = withTranslateWorkflowGuidance(registry, result, {
      source_outline: sourceOutline,
    }) as PublicContract;

    expect(result.starter_code).toBeUndefined();
    expect(result.combined_scaffold?.length).toBeGreaterThan(0);
    assertHardGate(contract);
    expect(contract.guidance.kind).toBe("migrate");
    if (contract.guidance.kind !== "migrate") return;
    expect(contract.guidance.starter_guidance.snippets).toEqual([]);
    expect(contract.action.kind).not.toBe("implement");
  });
});
