import path from "node:path";
import { readBoundedProjectFile } from "@salt-ds/knowledge";
import {
  SALT_SCAN_LIMIT_DEFAULTS,
  SALT_SCAN_LIMIT_NAMES,
  type SaltScanLimits,
} from "./limits.js";

const MAX_CONFIG_BYTES = 256 * 1024;
const MAX_PATTERNS = 128;
const MAX_PATTERN_BYTES = 1024;
const CONFIG_KEYS = new Set(["$schema", "include", "exclude", "limits"]);
const LIMIT_KEYS = new Set<string>(SALT_SCAN_LIMIT_NAMES);

export type SaltConfigErrorReason =
  | "SALT_CONFIG_UNSAFE_FILE"
  | "SALT_CONFIG_PARSE_ERROR"
  | "SALT_CONFIG_UNKNOWN_KEY"
  | "SALT_CONFIG_INVALID_SCHEMA"
  | "SALT_CONFIG_INVALID_PATTERN"
  | "SALT_CONFIG_INVALID_LIMIT";

export class SaltConfigError extends Error {
  readonly code = "SALT_CONFIG_INVALID";
  readonly exitCode = 2;

  constructor(
    readonly reason: SaltConfigErrorReason,
    message: string,
  ) {
    super(message);
    this.name = "SaltConfigError";
  }
}

export interface SaltCliConfig {
  schema_version: "1.0.0";
  source: "default" | "salt.config.json";
  include: string[];
  exclude: string[];
  limits: SaltScanLimits;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizePattern(
  value: unknown,
  field: "include" | "exclude",
): string {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    Buffer.byteLength(value, "utf8") > MAX_PATTERN_BYTES ||
    value.includes("\0") ||
    value.includes("\\") ||
    value.startsWith("/") ||
    /^[A-Za-z]:/u.test(value)
  ) {
    throw new SaltConfigError(
      "SALT_CONFIG_INVALID_PATTERN",
      `${field} entries must be bounded portable relative patterns.`,
    );
  }
  const normalized = value.replace(/^\.\//u, "").replace(/\/{2,}/gu, "/");
  const segments = normalized.split("/");
  if (
    normalized.length === 0 ||
    segments.some((segment) => segment === "" || segment === "..")
  ) {
    throw new SaltConfigError(
      "SALT_CONFIG_INVALID_PATTERN",
      `${field} entries cannot escape or ambiguously address the project root.`,
    );
  }
  return normalized;
}

function parsePatterns(value: unknown, field: "include" | "exclude"): string[] {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > MAX_PATTERNS) {
    throw new SaltConfigError(
      "SALT_CONFIG_INVALID_PATTERN",
      `${field} must contain at most ${MAX_PATTERNS} unique patterns.`,
    );
  }
  const patterns = value.map((entry) => normalizePattern(entry, field));
  if (new Set(patterns).size !== patterns.length) {
    throw new SaltConfigError(
      "SALT_CONFIG_INVALID_PATTERN",
      `${field} contains duplicate patterns.`,
    );
  }
  return patterns;
}

function parseLimits(value: unknown): SaltScanLimits {
  if (value === undefined) return { ...SALT_SCAN_LIMIT_DEFAULTS };
  if (!isRecord(value)) {
    throw new SaltConfigError(
      "SALT_CONFIG_INVALID_LIMIT",
      "limits must be an object.",
    );
  }
  const unknown = Object.keys(value).filter((key) => !LIMIT_KEYS.has(key));
  if (unknown.length > 0) {
    throw new SaltConfigError(
      "SALT_CONFIG_UNKNOWN_KEY",
      `Unknown salt.config.json limit: ${unknown.sort()[0]}.`,
    );
  }
  const limits: SaltScanLimits = { ...SALT_SCAN_LIMIT_DEFAULTS };
  for (const name of SALT_SCAN_LIMIT_NAMES) {
    const configured = value[name];
    if (configured === undefined) continue;
    const minimum = name === "forced_worker_restarts" ? 0 : 1;
    if (
      !Number.isSafeInteger(configured) ||
      (configured as number) < minimum ||
      (configured as number) > SALT_SCAN_LIMIT_DEFAULTS[name]
    ) {
      throw new SaltConfigError(
        "SALT_CONFIG_INVALID_LIMIT",
        `${name} must be an integer from ${minimum} to ${SALT_SCAN_LIMIT_DEFAULTS[name]}; project config can only lower the default.`,
      );
    }
    limits[name] = configured as number;
  }
  return limits;
}

export async function loadSaltConfig(input: {
  authorityRoot: string;
  rootDir?: string;
}): Promise<SaltCliConfig> {
  const rootDir = path.resolve(input.rootDir ?? input.authorityRoot);
  const file = await readBoundedProjectFile({
    authorityRoot: input.authorityRoot,
    rootDir,
    filePath: path.join(rootDir, "salt.config.json"),
    maxUtf8Bytes: MAX_CONFIG_BYTES,
  });
  if (file.status === "absent") {
    return {
      schema_version: "1.0.0",
      source: "default",
      include: [],
      exclude: [],
      limits: { ...SALT_SCAN_LIMIT_DEFAULTS },
    };
  }
  if (file.status === "invalid") {
    throw new SaltConfigError(
      "SALT_CONFIG_UNSAFE_FILE",
      `salt.config.json failed safe inspection (${file.reason}).`,
    );
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(file.text) as unknown;
  } catch {
    throw new SaltConfigError(
      "SALT_CONFIG_PARSE_ERROR",
      "salt.config.json is not valid JSON.",
    );
  }
  if (!isRecord(parsed)) {
    throw new SaltConfigError(
      "SALT_CONFIG_PARSE_ERROR",
      "salt.config.json must contain one JSON object.",
    );
  }
  const unknown = Object.keys(parsed).filter((key) => !CONFIG_KEYS.has(key));
  if (unknown.length > 0) {
    throw new SaltConfigError(
      "SALT_CONFIG_UNKNOWN_KEY",
      `Unknown salt.config.json key: ${unknown.sort()[0]}.`,
    );
  }
  if (parsed.$schema !== undefined && typeof parsed.$schema !== "string") {
    throw new SaltConfigError(
      "SALT_CONFIG_INVALID_SCHEMA",
      "$schema must be a string when present.",
    );
  }
  return {
    schema_version: "1.0.0",
    source: "salt.config.json",
    include: parsePatterns(parsed.include, "include"),
    exclude: parsePatterns(parsed.exclude, "exclude"),
    limits: parseLimits(parsed.limits),
  };
}
