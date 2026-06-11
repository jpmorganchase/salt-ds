import { promises as fs } from "node:fs";
import path from "node:path";
import type { ValidationSeverity } from "@salt-ds/semantic-core/validation/shared";
import {
  emitHookAdvice,
  emitHookBlock,
  emitHookPass,
  type HookInput,
  HookInputError,
  readHookInput,
} from "../../../../lib/hookIO.js";
import { analyzeLintTargets } from "../../../../lib/lintAnalysis.js";
import { readRegistryLoadOptionsFromFlags } from "../../../../lib/registry.js";
import type { LintCommandResult, RequiredCliIo } from "../../../../types.js";

export const HOOK_LINTABLE_EXTENSIONS = new Set([
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".mjs",
  ".cjs",
  ".mts",
  ".cts",
]);

export const SALT_PACKAGE_IMPORT_NEEDLE = "@salt-ds/";

export function isLikelyLintableExtension(filePath: string): boolean {
  return HOOK_LINTABLE_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

export async function fileContainsSaltImport(filePath: string): Promise<boolean> {
  try {
    const content = await fs.readFile(filePath, "utf8");
    return content.includes(SALT_PACKAGE_IMPORT_NEEDLE);
  } catch {
    return false;
  }
}

export interface ReviewHookPolicyRule {
  kind?: string;
  reason?: string;
  scope?: string;
}

export async function readReviewHookPolicyRules(
  rootDir: string,
): Promise<ReviewHookPolicyRule[]> {
  const teamConfigPath = path.join(rootDir, ".salt", "team.json");
  let raw: string;
  try {
    raw = await fs.readFile(teamConfigPath, "utf8");
  } catch {
    return [];
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return [];
  }

  const value = (parsed as Record<string, unknown>).require_human_review_for;
  if (!Array.isArray(value)) {
    return [];
  }

  const rules: ReviewHookPolicyRule[] = [];
  for (const entry of value) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      continue;
    }
    const record = entry as Record<string, unknown>;
    const rule: ReviewHookPolicyRule = {};
    if (typeof record.kind === "string") {
      rule.kind = record.kind;
    }
    if (typeof record.reason === "string") {
      rule.reason = record.reason;
    }
    if (typeof record.scope === "string") {
      rule.scope = record.scope;
    }
    rules.push(rule);
  }
  return rules;
}

export function matchesReviewHookRule(
  rule: ReviewHookPolicyRule,
  paths: string[],
  toolName: string | null,
): boolean {
  // Empty rule matches everything (treated as a blanket escalation marker).
  if (!rule.scope && !rule.kind) {
    return paths.length > 0 || toolName != null;
  }
  if (rule.kind && toolName && rule.kind === toolName) {
    return true;
  }
  if (!rule.scope) {
    return false;
  }
  // PR-7 stopgap matcher: substring match on the relative/absolute path.
  // PR-18 (E5) will replace this with a glob matcher when it expands the
  // require_human_review_for schema.
  return paths.some((candidate) => candidate.includes(rule.scope as string));
}

export function describeMatchedRule(
  rule: ReviewHookPolicyRule,
  matchedPaths: string[],
): string {
  const parts: string[] = [];
  if (rule.kind) {
    parts.push(`kind=${rule.kind}`);
  }
  if (rule.scope) {
    parts.push(`scope=${rule.scope}`);
  }
  if (rule.reason) {
    parts.push(`reason=${rule.reason}`);
  }
  if (matchedPaths.length > 0) {
    parts.push(`paths=${matchedPaths.slice(0, 3).join(", ")}`);
  }
  return parts.length > 0
    ? parts.join("; ")
    : "Matched a Salt human-review rule.";
}

/**
 * Mutates `sourceValidation` in place to surface require_human_review_for
 * matches as ordinary blocking findings. Each matching file gains one synthetic
 * issue per matching rule, with rule id `policy.require_human_review_for.<kind>`
 * (or `.unspecified` when no kind is declared). Per-file decision/summary and
 * aggregate summary fields are recomputed so the existing review pipeline maps
 * the result to a blocked contract status without any other branching logic.
 */
export function applyRequireHumanReviewPolicyFindings(
  sourceValidation: LintCommandResult,
  rules: ReviewHookPolicyRule[],
): void {
  if (rules.length === 0 || sourceValidation.files.length === 0) {
    return;
  }
  let mutated = false;
  for (const file of sourceValidation.files) {
    const matchedRules: ReviewHookPolicyRule[] = [];
    for (const rule of rules) {
      if (matchesReviewHookRule(rule, [file.relativePath], null)) {
        matchedRules.push(rule);
      }
    }
    if (matchedRules.length === 0) {
      continue;
    }
    mutated = true;
    const existingIssues = Array.isArray(file.issues) ? file.issues : [];
    const policyIssues: Array<Record<string, unknown>> = [];
    let topMessage: string | null = null;
    for (const rule of matchedRules) {
      const kindSlug = (rule.kind ?? "unspecified")
        .trim()
        .replace(/[^a-zA-Z0-9._-]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .toLowerCase() || "unspecified";
      const ruleId = `policy.require_human_review_for.${kindSlug}`;
      const summary = describeMatchedRule(rule, [file.relativePath]);
      const message = `require_human_review_for: ${summary}`;
      const title = `require_human_review_for: ${rule.kind ?? "unspecified"}`;
      if (topMessage == null) {
        topMessage = message;
      }
      policyIssues.push({
        id: `${ruleId}.${file.relativePath}`,
        category: "conventions",
        rule: ruleId,
        rule_id: ruleId,
        severity: "error",
        title,
        message,
        path: file.relativePath,
        source_urls: [],
        evidence_refs: [],
      });
    }
    file.issues = [...existingIssues, ...policyIssues];
    const incrementedErrors = file.summary.errors + policyIssues.length;
    file.summary = { ...file.summary, errors: incrementedErrors };
    if (file.decision.status !== "needs_attention") {
      file.decision = {
        status: "needs_attention",
        why: topMessage ?? "Salt require_human_review_for policy matched.",
      };
    }
  }
  if (!mutated) {
    return;
  }
  // Recompute aggregate summary so the contract layer sees the right counts.
  let cleanFiles = 0;
  let filesNeedingAttention = 0;
  let errors = 0;
  let warnings = 0;
  let infos = 0;
  let fixCount = 0;
  let migrationCount = 0;
  for (const file of sourceValidation.files) {
    if (file.decision.status === "needs_attention") {
      filesNeedingAttention += 1;
    } else {
      cleanFiles += 1;
    }
    errors += file.summary.errors;
    warnings += file.summary.warnings;
    infos += file.summary.infos;
    fixCount += file.summary.fix_count;
    migrationCount += file.summary.migration_count;
  }
  sourceValidation.summary = {
    cleanFiles,
    filesNeedingAttention,
    errors,
    warnings,
    infos,
    fixCount,
    migrationCount,
  };
}

export interface ReviewHookBlockingFinding {
  path: string;
  message: string;
  severity: ValidationSeverity;
  ruleId?: string;
}

export function summarizeReviewHookBlockingFindings(
  sourceValidation: LintCommandResult,
): ReviewHookBlockingFinding[] {
  const findings: ReviewHookBlockingFinding[] = [];
  for (const file of sourceValidation.files) {
    for (const issue of file.issues ?? []) {
      const record = issue as Record<string, unknown>;
      const severity = record.severity;
      if (severity !== "error") {
        continue;
      }
      const message =
        (typeof record.message === "string" && record.message) ||
        (typeof record.title === "string" && record.title) ||
        "Salt review flagged an issue.";
      const ruleId =
        typeof record.rule_id === "string"
          ? record.rule_id
          : typeof record.ruleId === "string"
            ? record.ruleId
            : undefined;
      findings.push({
        path: file.relativePath,
        message,
        severity: severity as ValidationSeverity,
        ruleId,
      });
    }
  }
  return findings;
}

export function formatReviewHookBlockingReason(
  findings: ReviewHookBlockingFinding[],
): string {
  const header =
    findings.length === 1
      ? "salt-ds review blocked 1 finding before commit:"
      : `salt-ds review blocked ${findings.length} findings before commit:`;
  const body = findings.slice(0, 20).map((finding) => {
    const ruleSuffix = finding.ruleId ? ` [${finding.ruleId}]` : "";
    return `- ${finding.path}: ${finding.message}${ruleSuffix}`;
  });
  const trailer =
    findings.length > body.length
      ? [
          `(+${findings.length - body.length} more — run \`salt-ds review\` to see all)`,
        ]
      : [];
  return [header, ...body, ...trailer].join("\n");
}

export async function resolveReviewHookFilePaths(
  hookInput: HookInput,
  io: RequiredCliIo,
): Promise<string[]> {
  const baseDir = hookInput.hookCwd ?? io.cwd;
  const raw = hookInput.editedFilePaths();
  const resolved: string[] = [];
  const seen = new Set<string>();
  for (const candidate of raw) {
    const absolute = path.isAbsolute(candidate)
      ? candidate
      : path.resolve(baseDir, candidate);
    if (seen.has(absolute)) {
      continue;
    }
    seen.add(absolute);
    resolved.push(absolute);
  }
  return resolved;
}

export async function runReviewHookPostToolUse(
  hookInput: HookInput,
  flags: Record<string, string>,
  io: RequiredCliIo,
): Promise<number> {
  const candidatePaths = await resolveReviewHookFilePaths(hookInput, io);
  if (candidatePaths.length === 0) {
    return emitHookPass();
  }

  // Filter to lintable extensions before reading file contents.
  const lintableCandidates = candidatePaths.filter(isLikelyLintableExtension);
  if (lintableCandidates.length === 0) {
    return emitHookPass();
  }

  // Filter further to Salt-bearing files. Skip files that no longer exist
  // (e.g. the agent deleted them) so the hook never crashes the agent loop.
  const saltBearing: string[] = [];
  for (const candidate of lintableCandidates) {
    if (await fileContainsSaltImport(candidate)) {
      saltBearing.push(candidate);
    }
  }
  if (saltBearing.length === 0) {
    return emitHookPass();
  }

  try {
    const sourceValidation = await analyzeLintTargets(
      saltBearing,
      io.cwd,
      flags["registry-dir"],
      readRegistryLoadOptionsFromFlags(flags),
    );
    applyRequireHumanReviewPolicyFindings(
      sourceValidation,
      await readReviewHookPolicyRules(hookInput.hookCwd ?? io.cwd),
    );

    const blocking = summarizeReviewHookBlockingFindings(sourceValidation);
    if (blocking.length === 0) {
      return emitHookPass();
    }
    return emitHookBlock(formatReviewHookBlockingReason(blocking), io);
  } catch (error) {
    io.writeStderr(
      `salt-ds review --hook: ${error instanceof Error ? error.message : String(error)}\n`,
    );
    return 1;
  }
}

export async function runReviewHookPreToolUse(
  hookInput: HookInput,
  io: RequiredCliIo,
): Promise<number> {
  const rules = await readReviewHookPolicyRules(hookInput.hookCwd ?? io.cwd);
  if (rules.length === 0) {
    return emitHookAdvice(
      {
        hookSpecificOutput: {
          hookEventName: "PreToolUse",
          permissionDecision: "allow",
        },
      },
      io,
    );
  }

  const filePaths = await resolveReviewHookFilePaths(hookInput, io);
  const baseDir = hookInput.hookCwd ?? io.cwd;
  const relativePaths = filePaths.map(
    (absolute) => path.relative(baseDir, absolute) || absolute,
  );

  for (const rule of rules) {
    if (matchesReviewHookRule(rule, relativePaths, hookInput.toolName)) {
      const matchedPaths = rule.scope
        ? relativePaths.filter((candidate) =>
            candidate.includes(rule.scope as string),
          )
        : relativePaths;
      return emitHookAdvice(
        {
          hookSpecificOutput: {
            hookEventName: "PreToolUse",
            permissionDecision: "ask",
            permissionDecisionReason: describeMatchedRule(rule, matchedPaths),
          },
        },
        io,
      );
    }
  }

  return emitHookAdvice(
    {
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "allow",
      },
    },
    io,
  );
}

export async function runReviewHookCommand(
  _positionals: string[],
  flags: Record<string, string>,
  io: RequiredCliIo,
): Promise<number> {
  let hookInput: HookInput | null;
  try {
    hookInput = await readHookInput({ stream: io.stdin });
  } catch (error) {
    if (error instanceof HookInputError) {
      io.writeStderr(`salt-ds review --hook: ${error.message}\n`);
      return 1;
    }
    throw error;
  }

  if (!hookInput) {
    io.writeStderr(
      "salt-ds review --hook requires hook JSON on stdin. See https://code.visualstudio.com/docs/agent-customization/hooks\n",
    );
    return 1;
  }

  switch (hookInput.hookEventName) {
    case "PostToolUse":
      return runReviewHookPostToolUse(hookInput, flags, io);
    case "PreToolUse":
      return runReviewHookPreToolUse(hookInput, io);
    default:
      // Unhandled events are a silent pass — keeps shared hook wiring forward-compatible.
      return emitHookPass();
  }
}
