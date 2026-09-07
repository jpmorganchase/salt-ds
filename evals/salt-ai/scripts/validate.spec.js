import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { repositoryRoot } from "../../../scripts/saltAiEvidenceUtils.mjs";
import {
  validateCaseFixturePackageVector,
  validateEvaluation,
  validateFrozenBaseline,
} from "./validate.mjs";

const frozenSource = "da1d249225c7044dad1c3aa08c960eb08f84dddb";
const frozenReport = "evals/salt-ai/baselines/baseline-pre-platform.json";

function fixture(id, packageJson) {
  return { id, files: { "package.json": packageJson } };
}

function caseValue(id, packageVector, mismatch) {
  return {
    id,
    package_vector: packageVector,
    ...(mismatch ? { expected_fixture_package_vector_mismatch: mismatch } : {}),
  };
}

function packageVector(entries) {
  return entries.map(([name, version]) => ({ name, version }));
}

function realGit(arguments_) {
  return execFileSync("git", arguments_, {
    cwd: repositoryRoot,
    encoding: null,
    stdio: ["ignore", "pipe", "pipe"],
  });
}

describe("evaluation package-vector metadata", () => {
  it("validates the current 13-case corpus and its frozen baseline", async () => {
    await expect(validateEvaluation()).resolves.toMatchObject({
      activationCases: 3,
      baselines: 1,
      goldQueries: 40,
      outcomeCases: 13,
    });
  });

  it("accepts the genuinely partial current vector when it matches its fixture", () => {
    const vector = packageVector([
      ["@salt-ds/core", "1.69.0"],
      ["@salt-ds/theme", "1.43.0"],
    ]);
    expect(() =>
      validateCaseFixturePackageVector(
        caseValue("partial-package-mismatch", vector),
        fixture(
          "repo-partial-package-mismatch",
          JSON.stringify({
            dependencies: Object.fromEntries(
              vector.map(({ name, version }) => [name, version]),
            ),
          }),
        ),
      ),
    ).not.toThrow();
  });

  it.each([
    [
      "the old API Core/Theme vector",
      "retrieval-api-migrations",
      packageVector([
        ["@salt-ds/core", "1.69.0"],
        ["@salt-ds/theme", "1.44.0"],
        ["@salt-ds/date-adapters", "1.0.2"],
      ]),
      JSON.stringify({
        dependencies: {
          "@salt-ds/core": "1.70.0",
          "@salt-ds/theme": "1.45.0",
          "@salt-ds/date-adapters": "1.0.2",
        },
      }),
    ],
    [
      "the old navigation Core/Lab vector",
      "retrieval-navigation-overlay",
      packageVector([
        ["@salt-ds/core", "1.69.0"],
        ["@salt-ds/lab", "1.0.0-alpha.102"],
      ]),
      JSON.stringify({
        dependencies: {
          "@salt-ds/core": "1.70.0",
          "@salt-ds/lab": "1.0.0-alpha.103",
        },
      }),
    ],
  ])("rejects %s", (_label, id, vector, packageJson) => {
    expect(() =>
      validateCaseFixturePackageVector(
        caseValue(id, vector),
        fixture(`repo-${id}`, packageJson),
      ),
    ).toThrow(/package vector does not match fixture/u);
  });

  it.each([
    ["a missing vector", undefined],
    ["a non-array vector", {}],
    ["a malformed entry", [null]],
    [
      "an entry with undeclared metadata",
      [{ name: "@salt-ds/core", version: "1.70.0", ignore: true }],
    ],
    ["a non-string name", [{ name: ["@salt-ds/core"], version: "1.70.0" }]],
    ["a non-string version", [{ name: "@salt-ds/core", version: ["1.70.0"] }]],
    ["a package range", [{ name: "@salt-ds/core", version: "^1.70.0" }]],
    [
      "a duplicate package",
      [
        { name: "@salt-ds/core", version: "1.70.0" },
        { name: "@salt-ds/core", version: "1.70.0" },
      ],
    ],
  ])("rejects %s in case metadata", (_label, vector) => {
    expect(() =>
      validateCaseFixturePackageVector(
        caseValue("malformed-case", vector),
        fixture("repo-malformed", '{"dependencies":{}}'),
      ),
    ).toThrow();
  });

  it.each([
    ["missing package.json", { id: "missing", files: {} }],
    ["invalid package.json", fixture("invalid", "{")],
    [
      "malformed dependencies",
      fixture("malformed-dependencies", '{"dependencies":[]}'),
    ],
    [
      "a non-string Salt version",
      fixture("non-string-version", '{"dependencies":{"@salt-ds/core":170}}'),
    ],
    [
      "a dependency duplicated in devDependencies",
      fixture(
        "duplicate",
        '{"dependencies":{"@salt-ds/core":"1.70.0"},"devDependencies":{"@salt-ds/core":"1.70.0"}}',
      ),
    ],
    [
      "a conflicting dependency and devDependency",
      fixture(
        "conflict",
        '{"dependencies":{"@salt-ds/core":"1.70.0"},"devDependencies":{"@salt-ds/core":"1.69.0"}}',
      ),
    ],
  ])("rejects %s in a fixture manifest", (_label, value) => {
    expect(() =>
      validateCaseFixturePackageVector(caseValue("fixture-case", []), value),
    ).toThrow();
  });

  it("allows only an exact, explicit expected mismatch", () => {
    const declared = packageVector([["@salt-ds/core", "1.69.0"]]);
    const materialized = packageVector([["@salt-ds/core", "1.70.0"]]);
    const value = caseValue("deliberate-mismatch", declared, {
      reason: "Exercise unsupported installed evidence",
      case_vector: declared,
      fixture_vector: materialized,
    });
    const materializedFixture = fixture(
      "repo-deliberate-mismatch",
      '{"dependencies":{"@salt-ds/core":"1.70.0"}}',
    );

    expect(() =>
      validateCaseFixturePackageVector(value, materializedFixture),
    ).not.toThrow();
    expect(() =>
      validateCaseFixturePackageVector(
        {
          ...value,
          expected_fixture_package_vector_mismatch: {
            ...value.expected_fixture_package_vector_mismatch,
            fixture_vector: declared,
          },
        },
        materializedFixture,
      ),
    ).toThrow(/does not describe its exact vectors/u);
    expect(() =>
      validateCaseFixturePackageVector(
        {
          ...value,
          expected_fixture_package_vector_mismatch: {
            ...value.expected_fixture_package_vector_mismatch,
            allow_any_mismatch: true,
          },
        },
        materializedFixture,
      ),
    ).toThrow(/does not match fixture/u);
  });
});

describe("frozen evaluation baseline metadata", () => {
  it("validates the baseline against the recorded Plan 004/01 Git inputs", async () => {
    await expect(validateFrozenBaseline()).resolves.toMatchObject({
      manifest: { counts: { outcome_cases: 13 } },
      report: { cohort_id: "baseline-pre-platform" },
    });
  });

  it("rejects a changed historical input independently", async () => {
    const gitCommand = (arguments_) => {
      const bytes = realGit(arguments_);
      if (
        arguments_[0] === "show" &&
        arguments_[1] === `${frozenSource}:evals/salt-ai/manifest.json`
      ) {
        const manifest = JSON.parse(bytes.toString("utf8"));
        manifest.corpus_id = "mutated-history";
        return Buffer.from(JSON.stringify(manifest));
      }
      return bytes;
    };

    await expect(validateFrozenBaseline({ gitCommand })).rejects.toThrow(
      /recorded identities/u,
    );
  });

  it("rejects a changed live report independently", async () => {
    const reportPath = path.resolve(repositoryRoot, frozenReport);
    const readFileCommand = async (file) => {
      const bytes = await readFile(file);
      if (path.resolve(file) !== reportPath) return bytes;
      return Buffer.from(
        bytes
          .toString("utf8")
          .replace("baseline-pre-platform", "changed-live-baseline"),
      );
    };

    await expect(validateFrozenBaseline({ readFileCommand })).rejects.toThrow(
      /differs from its recorded Git source/u,
    );
  });

  it("rejects an uncontained path in the recorded unit scope", async () => {
    const indexPath = path.resolve(
      repositoryRoot,
      "plans/evidence/004/index.json",
    );
    const readFileCommand = async (file) => {
      const bytes = await readFile(file);
      if (path.resolve(file) !== indexPath) return bytes;
      const index = JSON.parse(bytes.toString("utf8"));
      const unit = index.units.find((candidate) => candidate.id === "004/01");
      unit.scope.exact_paths.push("C:\\outside.json");
      return Buffer.from(JSON.stringify(index));
    };

    await expect(validateFrozenBaseline({ readFileCommand })).rejects.toThrow(
      /Git path .* is not contained/u,
    );
  });
});
