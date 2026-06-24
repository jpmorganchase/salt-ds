import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
  createSaltUi,
  getPublicContractValidationErrors,
  loadRegistry,
  migrateToSalt,
  type PublicContract,
  reviewSaltUi,
} from "@salt-ds/semantic-core";
import { buildRegistry } from "@salt-ds/semantic-core/build/buildRegistry";
import type { SaltRegistry } from "@salt-ds/semantic-core/types";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
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
// `upgrade_salt_ui` is intentionally not covered here. Its envelope builder
// dereferences `guidanceBoundary.project_conventions.check_recommended`
// without a null guard when the requested package has no registry entry —
// any ambiguous-input probe crashes the test instead of asserting an
// invariant. Fix the upgrade envelope first; then add the upgrade case.

const BUILT_AT = "2026-03-10T00:00:00Z";

let registry: SaltRegistry;
let registryDir: string;

beforeAll(async () => {
  registryDir = await fs.mkdtemp(
    path.join(os.tmpdir(), "salt-hard-gate-"),
  );
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
      view: "compact",
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
      view: "compact",
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
      view: "compact",
    }) as PublicContract;

    assertHardGate(contract);
    expect(contract.action.kind).not.toBe("implement");
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
      view: "compact",
    }) as PublicContract;

    assertHardGate(contract);
    expect(contract.action.kind).not.toBe("implement");
  });
});
