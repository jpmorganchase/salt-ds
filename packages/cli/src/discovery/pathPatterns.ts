import { compileWorkspacePatterns } from "@salt-ds/knowledge";

export interface IgnoreRule {
  base: string;
  pattern: string;
  negated: boolean;
  directoryOnly: boolean;
  anchored: boolean;
}

function escapeRegExp(value: string): string {
  return value.replace(/[|\\{}()[\]^$+?.]/gu, "\\$&");
}

function globSource(pattern: string): string {
  let source = "";
  for (let index = 0; index < pattern.length; index += 1) {
    const character = pattern[index];
    if (character === "*") {
      if (pattern[index + 1] === "*") {
        index += 1;
        if (pattern[index + 1] === "/") {
          index += 1;
          source += "(?:.*/)?";
        } else {
          source += ".*";
        }
      } else {
        source += "[^/]*";
      }
    } else if (character === "?") {
      source += "[^/]";
    } else {
      source += escapeRegExp(character);
    }
  }
  return source;
}

const compiledGlobs = new Map<string, RegExp>();
const MAX_COMPILED_GLOBS = 4096;

export function matchesPortableGlob(
  portablePath: string,
  pattern: string,
): boolean {
  let compiled = compiledGlobs.get(pattern);
  if (!compiled) {
    if (compiledGlobs.size >= MAX_COMPILED_GLOBS) compiledGlobs.clear();
    compiled = new RegExp(`^${globSource(pattern)}$`, "u");
    compiledGlobs.set(pattern, compiled);
  }
  return compiled.test(portablePath);
}

export function parseGitIgnore(text: string, base: string): IgnoreRule[] {
  const rules: IgnoreRule[] = [];
  for (const rawLine of text.replaceAll("\r\n", "\n").split("\n")) {
    let line = rawLine.trim();
    if (line.length === 0 || line.startsWith("#")) continue;
    const negated = line.startsWith("!");
    if (negated) line = line.slice(1);
    if (line.startsWith("\\#") || line.startsWith("\\!")) line = line.slice(1);
    if (line.length === 0 || line.includes("\0")) continue;
    const directoryOnly = line.endsWith("/");
    if (directoryOnly) line = line.slice(0, -1);
    const anchored = line.startsWith("/");
    if (anchored) line = line.slice(1);
    line = line.replaceAll("\\", "/").replace(/\/{2,}/gu, "/");
    if (line.length === 0 || line.split("/").includes("..")) continue;
    rules.push({ base, pattern: line, negated, directoryOnly, anchored });
  }
  return rules;
}

function relativeToBase(portablePath: string, base: string): string | null {
  if (base === ".") return portablePath;
  if (portablePath === base) return "";
  return portablePath.startsWith(`${base}/`)
    ? portablePath.slice(base.length + 1)
    : null;
}

function matchesRule(
  portablePath: string,
  isDirectory: boolean,
  rule: IgnoreRule,
): boolean {
  if (rule.directoryOnly && !isDirectory) return false;
  const relative = relativeToBase(portablePath, rule.base);
  if (relative === null) return false;
  if (rule.anchored || rule.pattern.includes("/")) {
    return matchesPortableGlob(relative, rule.pattern);
  }
  return relative
    .split("/")
    .some((segment) => matchesPortableGlob(segment, rule.pattern));
}

export function isGitIgnored(
  portablePath: string,
  isDirectory: boolean,
  rules: readonly IgnoreRule[],
): boolean {
  let ignored = false;
  for (const rule of rules) {
    if (matchesRule(portablePath, isDirectory, rule)) {
      ignored = !rule.negated;
    }
  }
  return ignored;
}

export function matchesWorkspacePatterns(
  relativePackageRoot: string,
  patterns: readonly string[],
): boolean {
  const compiled = compileWorkspacePatterns(patterns);
  return compiled.status === "valid" && compiled.matches(relativePackageRoot);
}
