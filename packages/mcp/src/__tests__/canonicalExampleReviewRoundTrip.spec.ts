import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildRegistry } from "../core/build/buildRegistry.js";
import { loadRegistry } from "../core/registry/loadRegistry.js";
import { reviewSaltUi } from "../core/tools/reviewSaltUi.js";
import type { SaltRegistry } from "../core/types.js";
import { REPO_ROOT } from "./registryTestUtils.js";

/**
 * Canonical-example review round-trip (gold-standard roadmap task 0.8 /
 * session-findings F4 / root cause #3 / M11).
 *
 * Every pattern story file under `packages/core/stories/patterns/**` is a
 * canonical Salt reference: it is what `get_salt_reference` should return
 * and what consumer code should look like after Salt's create / migrate
 * workflows. If `review_salt_ui` raises a blocking finding against
 * one of those stories, the heuristic is contradicting its own canonical
 * source — that is the M11 / F4 self-contradiction (consumer trace turn 4:
 * `Tooltip + Button` flagged as nested-interactive against the very
 * `app-header.stories.tsx` that uses the composition verbatim).
 *
 * This is a release gate: canonical Salt references must not be rejected by
 * Salt's own review workflow. Fix validator heuristics rather than changing
 * canonical stories to silence a finding.
 *
 * "Blocking" here = ValidationIssue.severity === "error", matching the
 * severity tier the MCP core reserves for findings that should block
 * implementation. Warnings and infos are reported separately for context
 * but do not fail the spec.
 */

const STORIES_ROOT = path.join(
  REPO_ROOT,
  "packages",
  "core",
  "stories",
  "patterns",
);

const STORY_FILE_PATTERN = /\.stories\.tsx$/;

interface BlockingFinding {
  storyPath: string;
  issueId: string;
  rule: string;
  severity: string;
  title: string;
  message: string;
  evidence: string[];
  canonicalSource: string | null;
  excerpt: string | null;
  excerptLine: number | null;
}

interface IssueLike {
  id?: unknown;
  rule?: unknown;
  severity?: unknown;
  title?: unknown;
  message?: unknown;
  evidence?: unknown;
  canonical_source?: unknown;
}

let registry: SaltRegistry;
let registryDir: string;

beforeAll(async () => {
  registryDir = await fs.mkdtemp(
    path.join(os.tmpdir(), "salt-canonical-review-"),
  );
  await buildRegistry({
    sourceRoot: REPO_ROOT,
    outputDir: registryDir,
    timestamp: "2026-03-10T00:00:00Z",
  });
  registry = await loadRegistry({ registryDir });
}, 120_000);

afterAll(async () => {
  if (registryDir) {
    await fs.rm(registryDir, { recursive: true, force: true });
  }
});

/**
 * Recursively walk `packages/core/stories/patterns/**` for `*.stories.tsx`
 * files. Enumerated at runtime per task brief — do NOT hardcode the list,
 * so newly-added patterns are picked up automatically without a test
 * change.
 */
async function enumeratePatternStoryFiles(): Promise<string[]> {
  const collected: string[] = [];

  async function walk(dir: string): Promise<void> {
    let entries: import("node:fs").Dirent[];
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch (cause) {
      throw new Error(
        `Failed to enumerate pattern stories under ${dir}: ${
          (cause as Error).message
        }`,
      );
    }
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
      } else if (entry.isFile() && STORY_FILE_PATTERN.test(entry.name)) {
        collected.push(full);
      }
    }
  }

  await walk(STORIES_ROOT);
  collected.sort();
  return collected;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

/**
 * `ValidationIssue` does not carry an AST location, so reconstruct a
 * best-effort "one-line excerpt" by scanning the source for an identifier
 * that the issue text references. Strips common noise words so the match
 * lands on something specific (`Tooltip`, `--salt-container-borderColor`,
 * `<table>`, ...) rather than on the first import of `react` or `Button`.
 *
 * Preference order:
 *   1. JSX opening tag `<Identifier` (the actual offending usage)
 *   2. Bare identifier on a non-import / non-comment line
 *   3. Bare identifier on any line (last-resort)
 *
 * If no specific identifier matches at all, fall back to `null` so the
 * diagnostic is honest about the gap rather than picking a misleading
 * line (such as the first React import).
 */
const EXCERPT_STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "from",
  "this",
  "that",
  "use",
  "using",
  "salt",
  "salt-ds",
  "saltds",
  "core",
  "ds",
  "react",
  "import",
  "imports",
  "props",
  "prop",
  "value",
  "name",
  "code",
  "rule",
  "issue",
  "found",
  "match",
  "matches",
  "review",
  "design",
  "system",
  "instead",
  "expected",
  "workflow",
  "guidance",
  "evidence",
  "registry",
  "canonical",
  "should",
  "would",
  "could",
  "must",
  "may",
  "primary",
  "secondary",
  "see",
  "via",
  "without",
  "within",
  "contains",
  "nested",
  "composition",
  "pitfalls",
  "interactive",
  "primitives",
]);

function isImportOrCommentLine(line: string): boolean {
  const trimmed = line.trim();
  return (
    trimmed.startsWith("import ") ||
    trimmed.startsWith("import{") ||
    trimmed.startsWith("import(") ||
    trimmed.startsWith("from ") ||
    trimmed.startsWith("//") ||
    trimmed.startsWith("/*") ||
    trimmed.startsWith("*")
  );
}

function clipExcerpt(line: string): string {
  const trimmed = line.trim();
  return trimmed.length > 180 ? `${trimmed.slice(0, 180)}…` : trimmed;
}

function tryExtractExcerpt(
  source: string,
  hint: string,
): { excerpt: string; lineNumber: number } | null {
  const tokens = [...hint.matchAll(/[A-Za-z@][A-Za-z0-9_@/.-]{2,}/g)]
    .map((match) => match[0])
    .filter((token) => {
      const normalized = token.replace(/^[@-]+/, "").toLowerCase();
      if (normalized.length < 3) return false;
      if (EXCERPT_STOP_WORDS.has(normalized)) return false;
      return true;
    });

  if (tokens.length === 0) {
    return null;
  }

  const lines = source.split("\n");

  // Pass 1: JSX opening tag — `<Identifier` or `<Identifier ` or
  // `<Identifier>` on a non-import/comment line. This is the actual
  // offending usage in nearly every composition-style rule.
  for (const token of tokens) {
    const jsxPattern = new RegExp(`<${token}\\b`);
    for (let i = 0; i < lines.length; i++) {
      if (isImportOrCommentLine(lines[i])) continue;
      if (jsxPattern.test(lines[i])) {
        return { excerpt: clipExcerpt(lines[i]), lineNumber: i + 1 };
      }
    }
  }

  // Pass 2: bare identifier on a non-import / non-comment line. Catches
  // rules whose evidence references CSS tokens, hex colors, or props
  // rather than JSX elements.
  for (const token of tokens) {
    for (let i = 0; i < lines.length; i++) {
      if (isImportOrCommentLine(lines[i])) continue;
      if (lines[i].includes(token)) {
        const trimmed = lines[i].trim();
        if (trimmed.length === 0) continue;
        return { excerpt: clipExcerpt(lines[i]), lineNumber: i + 1 };
      }
    }
  }

  // Pass 3: any line (fallback, mostly hits the import line — kept so we
  // still surface a recognizable identifier rather than `null`).
  for (const token of tokens) {
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(token)) {
        const trimmed = lines[i].trim();
        if (trimmed.length === 0) continue;
        return { excerpt: clipExcerpt(lines[i]), lineNumber: i + 1 };
      }
    }
  }

  return null;
}

function formatFinding(finding: BlockingFinding): string {
  const rel = path.relative(REPO_ROOT, finding.storyPath);
  const locator =
    finding.excerptLine !== null ? `${rel}:${finding.excerptLine}` : rel;
  const lines = [
    `- ${locator}`,
    `    id:       ${finding.issueId}`,
    `    rule:     ${finding.rule}`,
    `    severity: ${finding.severity}`,
    `    title:    ${finding.title}`,
    `    message:  ${finding.message}`,
  ];
  if (finding.evidence.length > 0) {
    lines.push(`    evidence: ${finding.evidence.join(" | ")}`);
  }
  if (finding.excerpt) {
    lines.push(`    excerpt:  ${finding.excerpt}`);
  } else {
    lines.push(
      "    excerpt:  (no specific identifier from the issue matched a source line — inspect the story manually)",
    );
  }
  if (finding.canonicalSource) {
    lines.push(`    docs:     ${finding.canonicalSource}`);
  }
  return lines.join("\n");
}

function formatFindings(findings: BlockingFinding[]): string {
  if (findings.length === 0) {
    return "(no blocking heuristics flagged)";
  }
  const byStory = new Map<string, BlockingFinding[]>();
  for (const finding of findings) {
    const bucket = byStory.get(finding.storyPath) ?? [];
    bucket.push(finding);
    byStory.set(finding.storyPath, bucket);
  }
  const sections: string[] = [];
  for (const [, items] of [...byStory.entries()].sort(([a], [b]) =>
    a.localeCompare(b),
  )) {
    sections.push(items.map(formatFinding).join("\n"));
  }
  return sections.join("\n");
}

describe("canonical-example review round-trip (roadmap task 0.8 / F4)", () => {
  it("enumerates at least one pattern story file under packages/core/stories/patterns/**", async () => {
    const stories = await enumeratePatternStoryFiles();
    expect(
      stories.length,
      `expected to find at least one *.stories.tsx file under ${path.relative(
        REPO_ROOT,
        STORIES_ROOT,
      )}, found 0 (story root may have moved)`,
    ).toBeGreaterThan(0);
  });

  it("review_salt_ui raises zero blocking findings for every canonical pattern story", async () => {
    const stories = await enumeratePatternStoryFiles();
    const blocking: BlockingFinding[] = [];

    for (const storyPath of stories) {
      const source = await fs.readFile(storyPath, "utf8");
      const result = reviewSaltUi(registry, {
        code: source,
        framework: "react",
        // view=full + max_issues=50 surfaces the full per-story issue
        // list so a story with many violations doesn't silently truncate
        // to 10.
        view: "full",
        max_issues: 50,
      });

      for (const rawIssue of result.issues ?? []) {
        const issue = rawIssue as IssueLike;
        const severity = asString(issue.severity);
        if (severity !== "error") {
          continue;
        }
        const id = asString(issue.id, "(unknown id)");
        const rule = asString(issue.rule, "(unknown rule)");
        const title = asString(issue.title);
        const message = asString(issue.message);
        const evidence = asStringArray(issue.evidence);
        const canonicalSource =
          typeof issue.canonical_source === "string"
            ? issue.canonical_source
            : null;
        const hint = [id, rule, title, message, ...evidence].join(" ");
        const extracted = tryExtractExcerpt(source, hint);
        blocking.push({
          storyPath,
          issueId: id,
          rule,
          severity,
          title,
          message,
          evidence,
          canonicalSource,
          excerpt: extracted?.excerpt ?? null,
          excerptLine: extracted?.lineNumber ?? null,
        });
      }
    }

    expect(
      blocking,
      `review_salt_ui flagged canonical pattern stories as blocking (gap count: ${
        blocking.length
      } across ${
        new Set(blocking.map((finding) => finding.storyPath)).size
      } file(s) of ${stories.length} story file(s) total).\n\nHeuristics to repair (do not edit pattern stories to silence them):\n${formatFindings(
        blocking,
      )}`,
    ).toEqual([]);
  }, 120_000);
});
