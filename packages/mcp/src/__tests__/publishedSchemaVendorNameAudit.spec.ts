import * as z from "zod/v4";
import { describe, expect, it } from "vitest";
import { TOOL_DEFINITIONS } from "../server/toolDefinitions.js";

// Phase 0 task 0.12 / PR 20: published-schema vendor-name regression test
// (Zod side).
//
// Audited surface: every MCP tool definition exported from
// `packages/mcp/src/server/toolDefinitions.ts`. For each tool we check both
// the tool-level `description` string (surfaced to MCP hosts as the tool's
// human-readable purpose) and every `.describe()` / `.meta()` string attached
// to the input/output Zod schemas (surfaced as JSON Schema descriptions to
// hosts that auto-render tool argument forms).
//
// The complementary JSON-schema-side audit lives in
// `packages/semantic-core/src/__tests__/publishedSchemaVendorNameAudit.spec.ts`.

// Case-insensitive literal matches. Each entry represents a class of
// information that has no place in a vendor-agnostic published schema.
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

// JSON Schema fields that carry human-readable prose, as produced by
// `z.toJSONSchema()` from `.describe()` / `.meta()` calls. Enum values,
// `const` values, `pattern` regexes, etc. are intentionally excluded —
// they describe concrete data, not editorial guidance about which vendor
// consumes it.
const DESCRIPTION_KEYS = new Set<string>([
  "title",
  "description",
  "markdownDescription",
  "$comment",
]);

interface ForbiddenHit {
  toolName: string;
  location: string;
  jsonPointer: string;
  field: string;
  matched: string;
  text: string;
}

function collectDescriptionStrings(
  node: unknown,
  pointer: string,
  sink: Array<{ jsonPointer: string; field: string; text: string }>,
): void {
  if (Array.isArray(node)) {
    node.forEach((item, index) => {
      collectDescriptionStrings(item, `${pointer}/${index}`, sink);
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
    collectDescriptionStrings(value, childPointer, sink);
  }
}

function escapeJsonPointer(segment: string): string {
  return segment.replace(/~/g, "~0").replace(/\//g, "~1");
}

function findForbiddenHits(
  toolName: string,
  location: string,
  jsonPointer: string,
  field: string,
  text: string,
): ForbiddenHit[] {
  const hits: ForbiddenHit[] = [];
  const lower = text.toLowerCase();
  for (const literal of FORBIDDEN_LITERALS) {
    if (lower.includes(literal)) {
      hits.push({
        toolName,
        location,
        jsonPointer,
        field,
        matched: literal,
        text,
      });
    }
  }
  for (const literal of FORBIDDEN_CASE_SENSITIVE) {
    if (text.includes(literal)) {
      hits.push({
        toolName,
        location,
        jsonPointer,
        field,
        matched: literal,
        text,
      });
    }
  }
  SALT_ENV_VAR_PATTERN.lastIndex = 0;
  let envMatch: RegExpExecArray | null = SALT_ENV_VAR_PATTERN.exec(text);
  while (envMatch !== null) {
    hits.push({
      toolName,
      location,
      jsonPointer,
      field,
      matched: envMatch[0],
      text,
    });
    envMatch = SALT_ENV_VAR_PATTERN.exec(text);
  }
  return hits;
}

// A tool's input/output schema may be either a single ZodType (e.g.
// `z.object({...})`) or a plain object literal whose values are individual
// ZodType field schemas. Normalize the latter to a wrapping `z.object()` so
// `z.toJSONSchema()` can render both shapes uniformly.
function toRootSchema(
  schema: z.ZodType | Record<string, z.ZodType>,
): z.ZodType {
  if (schema instanceof z.ZodType) return schema;
  return z.object(schema as Record<string, z.ZodType>);
}

function auditSchema(
  toolName: string,
  location: string,
  schema: z.ZodType | Record<string, z.ZodType>,
): ForbiddenHit[] {
  const root = toRootSchema(schema);
  const jsonSchema = z.toJSONSchema(root, {
    // Inline references so the walker sees every description in context;
    // a registry of refs would otherwise hide descriptions behind $ref nodes.
    unrepresentable: "any",
  });
  const descriptions: Array<{
    jsonPointer: string;
    field: string;
    text: string;
  }> = [];
  collectDescriptionStrings(jsonSchema, "", descriptions);
  const hits: ForbiddenHit[] = [];
  for (const entry of descriptions) {
    hits.push(
      ...findForbiddenHits(
        toolName,
        location,
        entry.jsonPointer,
        entry.field,
        entry.text,
      ),
    );
  }
  return hits;
}

function formatHits(hits: ForbiddenHit[]): string {
  return hits
    .map(
      (hit) =>
        `  - ${hit.toolName} :: ${hit.location} ${hit.jsonPointer} ` +
        `(${hit.field}): forbidden token "${hit.matched}" in: ` +
        JSON.stringify(hit.text),
    )
    .join("\n");
}

describe("published Zod tool schemas — vendor-name regression test (PR 20 / task 0.12)", () => {
  it("enumerates the published MCP tool definitions (sanity check that the audit ran)", () => {
    expect(TOOL_DEFINITIONS.length).toBeGreaterThan(0);
  });

  it("contains no CI vendor names, env-var identifiers, or host-editor names in any tool description or Zod .describe() / .meta() string", () => {
    const allHits: ForbiddenHit[] = [];

    for (const definition of TOOL_DEFINITIONS) {
      // 1. The tool-level human-readable description.
      allHits.push(
        ...findForbiddenHits(
          definition.name,
          "definition.description",
          "",
          "description",
          definition.description,
        ),
      );

      // 2. Input-schema descriptions.
      allHits.push(
        ...auditSchema(definition.name, "inputSchema", definition.inputSchema),
      );

      // 3. Output-schema descriptions, if declared.
      if (definition.outputSchema !== undefined) {
        allHits.push(
          ...auditSchema(
            definition.name,
            "outputSchema",
            definition.outputSchema,
          ),
        );
      }
    }

    if (allHits.length > 0) {
      throw new Error(
        `Found ${allHits.length} forbidden vendor/env-var/tool reference(s) ` +
          `in published MCP tool schemas. Published schemas describe what ` +
          `data means, never which CI integration or host consumes it. ` +
          `Move the vendor-specific guidance to consumer-facing docs (e.g. ` +
          `packages/cli/docs/ci-integration.md) and leave the schema ` +
          `.describe() string vendor-agnostic.\n${formatHits(allHits)}`,
      );
    }
    expect(allHits).toEqual([]);
  });
});
