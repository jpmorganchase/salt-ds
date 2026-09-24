/**
 * Wire types for the JSONL protocol between salt-eval (Python) and this package.
 * Mirrors salt-eval/schemas/grader-request.schema.json and grader-result.schema.json.
 * `parseRequest` is the only place untyped stdin becomes typed data.
 */

export const CHECK_KINDS = [
  "ts:typecheck",
  "lint:biome",
  "salt:imports-resolve",
  "salt:no-deprecated",
  "jsx:required-element",
  "jsx:required-ancestor",
  "jsx:forbidden-element",
  "jsx:prop-value",
  "jsx:prop-absent",
  "text:forbidden-pattern",
  "render:smoke",
] as const;

export type CheckKind = (typeof CHECK_KINDS)[number];

export type GraderVerdict = "correct" | "wrong" | "error";

export interface Evidence {
  file: string;
  line?: number;
  column?: number;
  text?: string;
}

export interface CheckResult {
  id: string;
  verdict: GraderVerdict;
  diagnostics: string[];
  evidence: Evidence[];
}

export interface Check {
  id: string;
  grader: CheckKind;
  params: Record<string, unknown>;
}

export interface GraderRequest {
  id: string;
  files: Record<string, string>;
  checks: Check[];
  fixture: string;
}

export type GraderResult =
  | { id: string; results: CheckResult[] }
  | { id: string; error: string };

export const DEFAULT_FIXTURE = "workspace-vite-react";

const SAFE_PATH = /^(?!\/)(?!.*\.\.)[^\0]+$/;

export class ProtocolError extends Error {}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isCheckKind(value: unknown): value is CheckKind {
  return (
    typeof value === "string" &&
    (CHECK_KINDS as readonly string[]).includes(value)
  );
}

export function parseRequest(raw: unknown): GraderRequest {
  if (!isRecord(raw)) {
    throw new ProtocolError("request must be a JSON object");
  }
  if (typeof raw.id !== "string" || raw.id.length === 0) {
    throw new ProtocolError("request.id must be a non-empty string");
  }
  if (!isRecord(raw.files)) {
    throw new ProtocolError("request.files must map paths to contents");
  }
  const files: Record<string, string> = {};
  for (const [path, content] of Object.entries(raw.files)) {
    if (!SAFE_PATH.test(path)) {
      throw new ProtocolError(`request.files has an unsafe path: ${path}`);
    }
    if (typeof content !== "string") {
      throw new ProtocolError(`request.files[${path}] must be a string`);
    }
    files[path] = content;
  }
  if (!Array.isArray(raw.checks)) {
    throw new ProtocolError("request.checks must be an array");
  }
  const checks: Check[] = raw.checks.map((check, index) => {
    if (!isRecord(check) || typeof check.id !== "string") {
      throw new ProtocolError(`request.checks[${index}] needs a string id`);
    }
    if (!isCheckKind(check.grader)) {
      throw new ProtocolError(
        `request.checks[${index}].grader ${String(check.grader)} is not one of ${CHECK_KINDS.join(", ")}`,
      );
    }
    const params = check.params ?? {};
    if (!isRecord(params)) {
      throw new ProtocolError(
        `request.checks[${index}].params must be an object`,
      );
    }
    return { id: check.id, grader: check.grader, params };
  });
  const fixture =
    typeof raw.fixture === "string" && raw.fixture.length > 0
      ? raw.fixture
      : DEFAULT_FIXTURE;
  if (!SAFE_PATH.test(fixture) || fixture.includes("/")) {
    throw new ProtocolError(
      `request.fixture must be a folder name, got ${fixture}`,
    );
  }
  return { id: raw.id, files, checks, fixture };
}
