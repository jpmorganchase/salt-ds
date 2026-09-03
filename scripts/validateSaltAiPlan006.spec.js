import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
  activationPaths,
  assertExactPaths,
  assertUnit02EvidenceContinuity,
  draftPaths,
  isImplementationPathAuthorized,
  validateControlObject,
} from "./validateSaltAiPlan006.mjs";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const activationParent = "519d9855bd7e222e6e66e3a746ad84d03bed407b";

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

describe("Plan 006 governance", () => {
  it("hashes the committed plan blob with one raw lowercase digest line", () => {
    const expected = sha256(
      execFileSync(
        "git",
        ["show", "HEAD:plans/006-make-salt-doctor-lightweight-or-retire.md"],
        { cwd: repositoryRoot },
      ),
    );
    const stdout = execFileSync(
      process.execPath,
      [
        path.join(repositoryRoot, "scripts/validateSaltAiPlan006.mjs"),
        "--phase",
        "plan-006-hash",
      ],
      { cwd: repositoryRoot, encoding: "utf8" },
    );
    expect(stdout).toBe(`${expected}\n`);
    expect(stdout).toMatch(/^[0-9a-f]{64}\n$/u);
  });

  it("freezes the activation and draft path sets", () => {
    expect(() =>
      assertExactPaths([...activationPaths], activationPaths, "activation"),
    ).not.toThrow();
    expect(() =>
      assertExactPaths([...draftPaths], draftPaths, "draft"),
    ).not.toThrow();
    expect(() =>
      assertExactPaths(
        [...draftPaths, "packages/cli/src/cli.ts"],
        draftPaths,
        "hostile activation parent",
      ),
    ).toThrow(/path set mismatch/u);
  });

  it.each([
    "AGENTS.md",
    "package.json",
    "plans/006-make-salt-doctor-lightweight-or-retire.md",
    "plans/README.md",
    "plans/evidence/006/control.json",
    "scripts/validateSaltAiPlan006.mjs",
    "scripts/validateSaltAiPlan006.spec.js",
  ])("rejects governance path %s from implementation scope", (locator) => {
    expect(isImplementationPathAuthorized("006/00", locator)).toBe(false);
    expect(isImplementationPathAuthorized("006/01", locator)).toBe(false);
    expect(isImplementationPathAuthorized("006/02", locator)).toBe(false);
  });

  it("permits only the closed Unit 006/00 harness seams", () => {
    expect(
      isImplementationPathAuthorized(
        "006/00",
        "evals/salt-ai/doctor/runtimeFitness.mjs",
      ),
    ).toBe(true);
    expect(
      isImplementationPathAuthorized(
        "006/00",
        "scripts/consumer-smoke/checks.spec.js",
      ),
    ).toBe(true);
    expect(
      isImplementationPathAuthorized(
        "006/00",
        "scripts/consumer-smoke/offline-network-guard.mjs",
      ),
    ).toBe(false);
    expect(
      isImplementationPathAuthorized("006/00", "packages/cli/src/cli.ts"),
    ).toBe(false);
  });

  it("accepts the exact activation control and rejects unknown state", () => {
    const control = JSON.parse(
      readFileSync(
        path.join(repositoryRoot, "plans/evidence/006/control.json"),
        "utf8",
      ),
    );
    const planDigest = sha256(
      readFileSync(
        path.join(
          repositoryRoot,
          "plans/006-make-salt-doctor-lightweight-or-retire.md",
        ),
      ),
    );
    expect(
      validateControlObject(control, { planDigest, activationParent }),
    ).toEqual(control);

    const hostile = structuredClone(control);
    hostile.unreviewed = true;
    expect(() =>
      validateControlObject(hostile, { planDigest, activationParent }),
    ).toThrow(/unknown, missing, or reordered keys/u);
  });

  it("freezes Unit 006/02 to a rebuilt candidate with the Unit 006/00 external graph", () => {
    const external = {
      locator: "node_modules/example",
      name: "example",
      version: "1.0.0",
      integrity: "sha512-example",
    };
    const unit00 = {
      unit: "006/00",
      source_sha: "1".repeat(40),
      consumer: {
        package_json_sha256: "2".repeat(64),
        external_production_graph_sha256: "3".repeat(64),
        production_graph: [external],
      },
      packages: [
        { name: "@salt-ds/knowledge", tarball_sha256: "4".repeat(64) },
        { name: "@salt-ds/cli", tarball_sha256: "5".repeat(64) },
      ],
    };
    const unit02 = structuredClone(unit00);
    unit02.unit = "006/02";
    unit02.source_sha = "6".repeat(40);
    unit02.packages[0].tarball_sha256 = "7".repeat(64);
    unit02.packages[1].tarball_sha256 = "8".repeat(64);
    expect(() => assertUnit02EvidenceContinuity(unit00, unit02)).not.toThrow();

    unit02.consumer.production_graph[0].version = "2.0.0";
    expect(() => assertUnit02EvidenceContinuity(unit00, unit02)).toThrow(
      /graph entries drifted/u,
    );
  });

  it("rejects extra command-line arguments and unknown phases", () => {
    const script = path.join(
      repositoryRoot,
      "scripts/validateSaltAiPlan006.mjs",
    );
    expect(() =>
      execFileSync(
        process.execPath,
        [script, "--phase", "plan-006-hash", "unexpected"],
        { cwd: repositoryRoot, stdio: "pipe" },
      ),
    ).toThrow();
    expect(() =>
      execFileSync(
        process.execPath,
        [script, "--phase", "plan-006-placeholder"],
        { cwd: repositoryRoot, stdio: "pipe" },
      ),
    ).toThrow();
  });
});
