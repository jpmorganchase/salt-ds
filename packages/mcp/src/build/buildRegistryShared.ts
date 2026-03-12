import fs from "node:fs/promises";
import semver from "semver";

export function normalizeWhitespace(input: string): string {
  return input.replace(/\s+/g, " ").trim();
}

export function toKebabCase(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function toMatchKey(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function toPascalCase(input: string): string {
  return input
    .split(/[^a-zA-Z0-9]+/)
    .filter((part) => part.length > 0)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join("");
}

function splitPascalCase(input: string): string[] {
  return input
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .split(/\s+/)
    .filter((part) => part.length > 0);
}

export function pascalToKebabCase(input: string): string {
  return splitPascalCase(input)
    .map((part) => part.toLowerCase())
    .join("-");
}

export function pascalToLabel(input: string): string {
  return splitPascalCase(input).join(" ");
}

export function asString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

export function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

export function uniqueStrings(values: string[]): string[] {
  return [...new Set(values)];
}

export function normalizeVersion(
  value: string | null | undefined,
): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const valid = semver.valid(trimmed);
  if (valid) {
    return valid;
  }

  const min = semver.minVersion(trimmed)?.version;
  if (min) {
    return min;
  }

  return semver.coerce(trimmed)?.version ?? null;
}

export function preferEarlierVersion(
  current: string | null | undefined,
  candidate: string | null | undefined,
): string | null {
  const normalizedCurrent = normalizeVersion(current);
  const normalizedCandidate = normalizeVersion(candidate);

  if (!normalizedCurrent) {
    return normalizedCandidate;
  }
  if (!normalizedCandidate) {
    return normalizedCurrent;
  }

  return semver.lte(normalizedCurrent, normalizedCandidate)
    ? normalizedCurrent
    : normalizedCandidate;
}

export function cleanMarkdownText(raw: string): string {
  return normalizeWhitespace(
    raw
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/<[^>]+>/g, "")
      .replace(/^\s*[-*]\s+/g, "")
      .replace(/^\s*\d+\.\s+/g, "")
      .replace(/\s*\\\s*/g, " ")
      .replace(/^\s*\{\/\*.*\*\/\}\s*$/gm, ""),
  );
}

export function escapeRegExp(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function stripLeadingCommitHash(input: string): string {
  return input.replace(/^[a-f0-9]{7,}:\s*/i, "").trim();
}

export async function readFileOrNull(
  targetPath: string,
): Promise<string | null> {
  try {
    return await fs.readFile(targetPath, "utf8");
  } catch {
    return null;
  }
}
