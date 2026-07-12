import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import fg from "fast-glob";
import { describe, expect, it } from "vitest";

const REPO_ROOT = path.resolve(
  fileURLToPath(new URL("../../../../../", import.meta.url)),
);
const METADATA_PATH = "packages/theme/css/deprecated/token-replacements.json";
const SCHEMA_PATH =
  "packages/mcp/schemas/salt-theme-deprecated-token-replacements.schema.json";
const POLICY_REPLACEMENT_KINDS = new Set(["direct", "alternative", "scale"]);

interface DeprecatedTokenReplacementMetadata {
  schema: "salt_theme_deprecated_token_replacements_v1";
  entries: DeprecatedTokenReplacementMetadataEntry[];
}

interface DeprecatedTokenReplacementMetadataEntry {
  deprecated: string;
  replacements?: string[];
  replacement_kind:
    | "direct"
    | "alternative"
    | "scale"
    | "manual"
    | "unsupported";
  basis: {
    source_path: string;
    line_start: number;
    line_end: number;
  };
}

function readJsonFile<T>(repoPath: string): T {
  return JSON.parse(
    fs.readFileSync(path.join(REPO_ROOT, ...repoPath.split("/")), "utf8"),
  ) as T;
}

function collectSaltTokens(source: string): string[] {
  return [...source.matchAll(/--salt-[A-Za-z0-9_-]+/g)].map(
    (match) => match[0],
  );
}

async function collectSourceBackedTokens(): Promise<Set<string>> {
  const sourcePaths = await fg(
    [
      "packages/theme/css/**/*.css",
      "packages/theme/CHANGELOG.md",
      "site/docs/**/*.mdx",
    ],
    {
      cwd: REPO_ROOT,
      onlyFiles: true,
    },
  );
  const tokens = new Set<string>();
  for (const sourcePath of sourcePaths) {
    const source = fs.readFileSync(
      path.join(REPO_ROOT, ...sourcePath.split("/")),
      "utf8",
    );
    for (const token of collectSaltTokens(source)) {
      tokens.add(token);
    }
  }

  return tokens;
}

function readSourceLineRange(entry: DeprecatedTokenReplacementMetadataEntry) {
  const sourcePath = path.join(
    REPO_ROOT,
    ...entry.basis.source_path.split("/"),
  );
  const source = fs.readFileSync(sourcePath, "utf8");
  const lines = source.split(/\r?\n/u);
  return lines
    .slice(entry.basis.line_start - 1, entry.basis.line_end)
    .join("\n");
}

describe("theme deprecated token replacement metadata", () => {
  it("validates the production metadata against the shared schema", () => {
    const ajv = new Ajv2020({
      allErrors: true,
      strict: false,
    });
    const validate = ajv.compile(
      readJsonFile<Record<string, unknown>>(SCHEMA_PATH),
    );
    const metadata =
      readJsonFile<DeprecatedTokenReplacementMetadata>(METADATA_PATH);

    expect(validate(metadata), JSON.stringify(validate.errors, null, 2)).toBe(
      true,
    );
  });

  it("keeps every production entry backed by source lines and known source tokens", async () => {
    const metadata =
      readJsonFile<DeprecatedTokenReplacementMetadata>(METADATA_PATH);
    const sourceTokens = await collectSourceBackedTokens();
    const errors: string[] = [];

    for (const entry of metadata.entries) {
      const lineRange =
        entry.basis.line_end < entry.basis.line_start
          ? ""
          : readSourceLineRange(entry);
      const entryTokens = [entry.deprecated, ...(entry.replacements ?? [])];

      if (!sourceTokens.has(entry.deprecated)) {
        errors.push(`${entry.deprecated} is not present in source-backed data`);
      }
      for (const replacement of entry.replacements ?? []) {
        if (!sourceTokens.has(replacement)) {
          errors.push(
            `${entry.deprecated} replacement ${replacement} is not present in source-backed data`,
          );
        }
      }
      if (entry.basis.line_end < entry.basis.line_start) {
        errors.push(`${entry.deprecated} has an invalid basis line range`);
      }
      if (!entryTokens.some((token) => lineRange.includes(token))) {
        errors.push(
          `${entry.deprecated} basis does not contain the deprecated or replacement token`,
        );
      }
      if (
        POLICY_REPLACEMENT_KINDS.has(entry.replacement_kind) &&
        (entry.replacements?.length ?? 0) === 0
      ) {
        errors.push(`${entry.deprecated} has no source-backed replacement`);
      }
      if (
        !POLICY_REPLACEMENT_KINDS.has(entry.replacement_kind) &&
        (entry.replacements?.length ?? 0) > 0
      ) {
        errors.push(
          `${entry.deprecated} unsupported/manual entry must not emit replacements`,
        );
      }
    }

    expect(errors).toEqual([]);
  });
});
