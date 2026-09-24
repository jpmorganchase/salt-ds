import { existsSync, readdirSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { CHECKS } from "../checks";
import { Environment, gradeRequest } from "../grade";
import { CHECK_KINDS, type CheckKind } from "../protocol";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES = path.join(HERE, "fixtures");
const REPO_ROOT = path.resolve(HERE, "..", "..", "..", "..");

const environment = new Environment({
  repoRoot: REPO_ROOT,
  fixturesDir: path.join(REPO_ROOT, "salt-eval", "fixtures"),
  cacheDir: path.join(tmpdir(), "salt-eval-graders-spec"),
  saltTypes: "src",
});

const IMPLEMENTED = CHECK_KINDS.filter((kind) => kind !== "render:smoke");

function slug(kind: CheckKind): string {
  return kind.replace(":", "-");
}

interface FixtureSpec {
  params: Record<string, unknown>;
  expect: string;
}

function fixtureFiles(dir: string, name: string): Record<string, string> {
  const code = path.join(dir, `${name}.tsx.txt`);
  if (existsSync(code)) {
    return { "src/Fixture.tsx": readFileSync(code, "utf8") };
  }
  return { "response.md": readFileSync(path.join(dir, `${name}.md`), "utf8") };
}

function grade(
  kind: CheckKind,
  params: Record<string, unknown>,
  files: Record<string, string>,
) {
  const result = gradeRequest(
    {
      id: "spec",
      files,
      checks: [{ id: "check", grader: kind, params }],
      fixture: "workspace-vite-react",
    },
    environment,
  );
  if (!("results" in result)) throw new Error(result.error);
  return result.results[0];
}

describe.each(IMPLEMENTED)("%s", (kind) => {
  const dir = path.join(FIXTURES, slug(kind));
  const spec = JSON.parse(
    readFileSync(path.join(dir, "params.json"), "utf8"),
  ) as FixtureSpec;

  it("fires on must_fire with the expected diagnostic", () => {
    const result = grade(kind, spec.params, fixtureFiles(dir, "must_fire"));
    expect(result.verdict).toBe("wrong");
    expect(result.diagnostics.join("\n")).toContain(spec.expect);
  });

  it("stays quiet on must_not_fire", () => {
    const result = grade(kind, spec.params, fixtureFiles(dir, "must_not_fire"));
    expect(result).toMatchObject({ verdict: "correct", evidence: [] });
  });
});

describe("registry of checks", () => {
  it("has a fixture folder for every implemented kind and nothing else", () => {
    expect(readdirSync(FIXTURES).sort()).toEqual(IMPLEMENTED.map(slug).sort());
    expect(Object.keys(CHECKS).sort()).toEqual([...CHECK_KINDS].sort());
  });

  it("reports the reserved render:smoke kind as an error, never a failure", () => {
    const result = grade(
      "render:smoke",
      {},
      { "src/Fixture.tsx": "export const a = 1;" },
    );
    expect(result.verdict).toBe("error");
    expect(result.diagnostics).toEqual([
      "render:smoke is reserved and not implemented in this version",
    ]);
  });

  it("turns bad parameters into an error verdict with the parameter name", () => {
    const result = grade(
      "jsx:prop-value",
      { element: "FormField" },
      { "src/Fixture.tsx": "" },
    );
    expect(result).toEqual({
      id: "check",
      verdict: "error",
      diagnostics: [
        "jsx:prop-value failed: params.prop must be a non-empty string",
      ],
      evidence: [],
    });
  });
});

describe("evidence", () => {
  it("points at the offending element with line and column", () => {
    const files = {
      "src/Fixture.tsx":
        'import { FormField } from "@salt-ds/core";\nexport const F = () => (\n  <FormField disabled />\n);\n',
    };
    const result = grade(
      "jsx:prop-absent",
      { element: "FormField", prop: "disabled" },
      files,
    );
    expect(result.evidence).toEqual([
      {
        file: "src/Fixture.tsx",
        line: 3,
        column: 3,
        text: "<FormField disabled />",
      },
    ]);
  });

  it("typecheck evidence names the file relative to the fixture", () => {
    const files = { "src/Fixture.tsx": "export const n: number = 'x';\n" };
    const result = grade("ts:typecheck", {}, files);
    expect(result.verdict).toBe("wrong");
    expect(result.evidence[0]).toMatchObject({
      file: "src/Fixture.tsx",
      line: 1,
      column: 14,
      text: "n",
    });
    expect(result.diagnostics[0]).toContain("TS2322");
  });
});
