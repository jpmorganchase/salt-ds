import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

// Phase 0 task 0.12 / PR 20: repository-schema vendor-name regression test.
//
// Repository schemas describe what data *means*, never how a particular CI
// integration, host editor, or env-var convention consumes it. The
// `SALT_REVIEW_HUMAN_REVIEWED_LABEL` leak into `project-conventions.schema.json`
// (closed by PR 8, see `packages/mcp/docs/implementation-handoff.md` §8.6) was
// the trigger; this test makes the leak class impossible.
//
// Audited surface: every `*.schema.json` under `packages/mcp/schemas/`.
// The complementary Zod-side audit lives in
// `packages/mcp/src/__tests__/publishedSchemaVendorNameAudit.spec.ts`.

const SCHEMAS_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "..",
  "schemas",
);

// Case-insensitive literal matches. Each entry represents a class of
// information that has no place in a vendor-agnostic repository schema.
const FORBIDDEN_LITERALS: readonly string[] = [
  // CI vendor names.
  "github",
  "gitlab",
  "bitbucket",
  "circleci",
  "jenkins",
  "azure",
  "buildkite",
  // Host-editor / agent-host names.
  "vscode",
  "cursor",
];

// Specific tool/file names that are case-sensitive identifiers — matching
// case-insensitively would incorrectly flag lowercase use of the same letters
// inside unrelated words.
const FORBIDDEN_CASE_SENSITIVE: readonly string[] = ["AGENTS.md"];

// Env-var-style identifiers. `SALT_FOO_BAR` is an env-var convention; the
// lowercase `salt_workflow_v1` form is the contract-name convention and is
// allowed in schema text. Restricting to uppercase keeps the test focused on
// the env-var leak that motivated this regression test.
const SALT_ENV_VAR_PATTERN = /\bSALT_[A-Z][A-Z0-9_]*\b/g;

// JSON Schema fields that carry human-readable prose. Enum values, `const`
// values, `pattern` regexes, etc. are intentionally excluded — they describe
// concrete data, not editorial guidance about which vendor consumes it.
const DESCRIPTION_KEYS = new Set<string>([
  "title",
  "description",
  "markdownDescription",
  "$comment",
]);

interface ForbiddenHit {
  schemaFile: string;
  jsonPointer: string;
  field: string;
  matched: string;
  text: string;
}

function collectDescriptionStrings(
  schemaFile: string,
  node: unknown,
  pointer: string,
  sink: Array<{ jsonPointer: string; field: string; text: string }>,
): void {
  if (Array.isArray(node)) {
    node.forEach((item, index) => {
      collectDescriptionStrings(schemaFile, item, `${pointer}/${index}`, sink);
    });
    return;
  }
  if (node === null || typeof node !== "object") return;
  for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
    const childPointer = `${pointer}/${escapeJsonPointer(key)}`;
    if (DESCRIPTION_KEYS.has(key) && typeof value === "string") {
      sink.push({ jsonPointer: childPointer, field: key, text: value });
      continue;
    }
    collectDescriptionStrings(schemaFile, value, childPointer, sink);
  }
}

function escapeJsonPointer(segment: string): string {
  return segment.replace(/~/g, "~0").replace(/\//g, "~1");
}

function findForbiddenHits(
  schemaFile: string,
  jsonPointer: string,
  field: string,
  text: string,
): ForbiddenHit[] {
  const hits: ForbiddenHit[] = [];
  const lower = text.toLowerCase();
  for (const literal of FORBIDDEN_LITERALS) {
    if (lower.includes(literal)) {
      hits.push({ schemaFile, jsonPointer, field, matched: literal, text });
    }
  }
  for (const literal of FORBIDDEN_CASE_SENSITIVE) {
    if (text.includes(literal)) {
      hits.push({ schemaFile, jsonPointer, field, matched: literal, text });
    }
  }
  // Reset regex state — SALT_ENV_VAR_PATTERN is shared/global.
  SALT_ENV_VAR_PATTERN.lastIndex = 0;
  let envMatch: RegExpExecArray | null = SALT_ENV_VAR_PATTERN.exec(text);
  while (envMatch !== null) {
    hits.push({
      schemaFile,
      jsonPointer,
      field,
      matched: envMatch[0],
      text,
    });
    envMatch = SALT_ENV_VAR_PATTERN.exec(text);
  }
  return hits;
}

function formatHits(hits: ForbiddenHit[]): string {
  return hits
    .map(
      (hit) =>
        `  - ${hit.schemaFile} ${hit.jsonPointer} (${hit.field}): ` +
        `forbidden token "${hit.matched}" in: ${JSON.stringify(hit.text)}`,
    )
    .join("\n");
}

describe("repository JSON schemas — vendor-name regression test (PR 20 / task 0.12)", () => {
  const schemaFiles = readdirSync(SCHEMAS_DIR)
    .filter((entry) => entry.endsWith(".schema.json"))
    .sort();

  it("enumerates the repository JSON schema files (sanity check that the audit ran)", () => {
    expect(schemaFiles.length).toBeGreaterThan(0);
  });

  it("contains no CI vendor names, env-var identifiers, or host-editor names in any description / title / $comment field", () => {
    const allHits: ForbiddenHit[] = [];
    for (const file of schemaFiles) {
      const fullPath = path.join(SCHEMAS_DIR, file);
      const raw = readFileSync(fullPath, "utf8");
      const parsed = JSON.parse(raw) as unknown;
      const descriptions: Array<{
        jsonPointer: string;
        field: string;
        text: string;
      }> = [];
      collectDescriptionStrings(file, parsed, "", descriptions);
      for (const entry of descriptions) {
        allHits.push(
          ...findForbiddenHits(
            file,
            entry.jsonPointer,
            entry.field,
            entry.text,
          ),
        );
      }
    }
    if (allHits.length > 0) {
      throw new Error(
        `Found ${allHits.length} forbidden vendor/env-var/tool reference(s) ` +
          "in repository JSON schemas. Repository schemas describe what data " +
          "means, never which CI integration or host consumes it. Move the " +
          "vendor-specific guidance to consumer-facing docs and leave the " +
          `schema description vendor-agnostic.\n${formatHits(allHits)}`,
      );
    }
    expect(allHits).toEqual([]);
  });
});
