import path from "node:path";
import semver from "semver";
import type { ChangeRecord, ComponentRecord, PackageRecord } from "../types.js";
import {
  cleanMarkdownText,
  escapeRegExp,
  normalizeVersion,
  pascalToLabel,
  preferEarlierVersion,
  readFileOrNull,
  stripLeadingCommitHash,
  toKebabCase,
  toMatchKey,
  uniqueStrings,
} from "./buildRegistryShared.js";

export interface PackageChangelogMetadata {
  deprecatedBySymbol: Map<string, string>;
}

interface ParsedChangelogItem {
  version: string;
  release_type: ChangeRecord["release_type"];
  text: string;
}

interface ComponentMentionPattern {
  component: ComponentRecord;
  regex: RegExp;
  phrase_length: number;
}

function classifyReleaseType(heading: string): ChangeRecord["release_type"] {
  const normalized = heading.trim().toLowerCase();
  if (normalized.includes("major")) {
    return "major";
  }
  if (normalized.includes("minor")) {
    return "minor";
  }
  if (normalized.includes("patch")) {
    return "patch";
  }
  return "unknown";
}

function parseChangelogItems(content: string): ParsedChangelogItem[] {
  const items: ParsedChangelogItem[] = [];
  let currentVersion: string | null = null;
  let currentReleaseType: ChangeRecord["release_type"] = "unknown";
  let currentLines: string[] = [];
  let inCodeBlock = false;

  const flushItem = () => {
    if (!currentVersion || currentLines.length === 0) {
      currentLines = [];
      return;
    }

    const text = cleanMarkdownText(
      stripLeadingCommitHash(currentLines.join(" ")),
    );
    if (text.length > 0) {
      items.push({
        version: currentVersion,
        release_type: currentReleaseType,
        text,
      });
    }
    currentLines = [];
  };

  for (const rawLine of content.split(/\r?\n/)) {
    const trimmed = rawLine.trim();
    if (trimmed.startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) {
      continue;
    }

    const versionMatch = trimmed.match(/^##\s+([0-9][^\s]*)\s*$/);
    if (versionMatch) {
      flushItem();
      currentVersion = normalizeVersion(versionMatch[1]);
      currentReleaseType = "unknown";
      continue;
    }

    const releaseTypeMatch = trimmed.match(/^###\s+(.+?)\s*$/);
    if (releaseTypeMatch) {
      flushItem();
      currentReleaseType = classifyReleaseType(releaseTypeMatch[1]);
      continue;
    }

    if (!currentVersion) {
      continue;
    }

    if (/^- /.test(rawLine)) {
      flushItem();
      currentLines = [rawLine.replace(/^- /, "").trim()];
      continue;
    }

    if (currentLines.length === 0 || trimmed.length === 0) {
      continue;
    }

    currentLines.push(trimmed.replace(/^- /, ""));
  }

  flushItem();
  return items;
}

function summarizeChangeText(text: string): string {
  const normalized = stripLeadingCommitHash(cleanMarkdownText(text));
  return normalized.match(/^.*?[.!?](?:\s|$)/)?.[0]?.trim() ?? normalized;
}

function classifyChangeKind(text: string): ChangeRecord["kind"] {
  const normalized = stripLeadingCommitHash(cleanMarkdownText(text))
    .toLowerCase()
    .trim();

  if (normalized.includes("deprecated")) {
    return "deprecated";
  }
  if (/^removed\b/.test(normalized)) {
    return "removed";
  }
  if (/^(fix|fixed)\b/.test(normalized)) {
    return "fixed";
  }
  if (/^(add|added|introduce|introduced|create|created)\b/.test(normalized)) {
    return "added";
  }
  return "changed";
}

function buildComponentMentionPatterns(
  components: ComponentRecord[],
): ComponentMentionPattern[] {
  const seen = new Set<string>();
  const patterns: ComponentMentionPattern[] = [];

  for (const component of components) {
    const phrases = uniqueStrings(
      [
        component.name,
        component.source.export_name
          ? pascalToLabel(component.source.export_name)
          : null,
      ].filter((value): value is string => Boolean(value)),
    );

    for (const phrase of phrases) {
      const normalizedPhrase = cleanMarkdownText(phrase).toLowerCase();
      if (!normalizedPhrase) {
        continue;
      }

      const words = normalizedPhrase.split(/\s+/).filter(Boolean);
      if (words.length === 0) {
        continue;
      }

      const lastWord = words[words.length - 1];
      const leadingWords = words.slice(0, -1).map(escapeRegExp);
      const patternSource =
        leadingWords.length > 0
          ? `\\b${leadingWords.join("[-\\\\s]+")}[-\\\\s]+${escapeRegExp(lastWord)}(?:'s|s)?\\b`
          : `\\b${escapeRegExp(lastWord)}(?:'s|s)?\\b`;
      const dedupeKey = `${component.id}:${patternSource}`;
      if (seen.has(dedupeKey)) {
        continue;
      }

      seen.add(dedupeKey);
      patterns.push({
        component,
        regex: new RegExp(patternSource, "gi"),
        phrase_length: normalizedPhrase.length,
      });
    }
  }

  return patterns.sort(
    (left, right) => right.phrase_length - left.phrase_length,
  );
}

function findMatchedComponentsForChange(
  text: string,
  components: ComponentRecord[],
): Array<{
  component: ComponentRecord;
  inference: NonNullable<ChangeRecord["inference"]>;
}> {
  const occupiedRanges: Array<{ start: number; end: number }> = [];
  const matchedComponents = new Map<
    string,
    {
      component: ComponentRecord;
      inference: NonNullable<ChangeRecord["inference"]>;
    }
  >();
  const normalizedText = stripLeadingCommitHash(cleanMarkdownText(text));
  const patterns = buildComponentMentionPatterns(components);

  for (const candidate of patterns) {
    candidate.regex.lastIndex = 0;
    let match: RegExpExecArray | null = candidate.regex.exec(normalizedText);
    while (match) {
      const start = match.index;
      const end = start + match[0].length;
      const overlapsExisting = occupiedRanges.some(
        (range) => start < range.end && end > range.start,
      );
      if (!overlapsExisting) {
        occupiedRanges.push({ start, end });
        matchedComponents.set(candidate.component.id, {
          component: candidate.component,
          inference: {
            matched_by: "component_name",
            confidence: candidate.phrase_length >= 10 ? "high" : "medium",
          },
        });
      }

      match = candidate.regex.exec(normalizedText);
    }
  }

  return [...matchedComponents.values()];
}

function buildChangeId(
  packageName: string,
  version: string,
  targetType: ChangeRecord["target_type"],
  targetName: string,
  ordinal: number,
): string {
  return `chg.${toKebabCase(packageName)}.${toKebabCase(version)}.${targetType}.${toKebabCase(targetName)}.${ordinal}`;
}

function extractDeprecatedSymbolsFromLine(line: string): string[] {
  const symbols = new Set<string>();
  const normalizedLine = line.trim();

  for (const match of normalizedLine.matchAll(
    /`([^`]+)`(?:\s+[A-Za-z]+){0,4}\s+(?:has been|is now|being)?\s*deprecated\b/gi,
  )) {
    const symbol = match[1]?.trim();
    if (symbol) {
      symbols.add(symbol);
    }
  }

  const deprecatedClauseMatch = normalizedLine.match(/\bDeprecated\b\s+(.+)/i);
  if (!deprecatedClauseMatch) {
    return [...symbols];
  }

  const clause = deprecatedClauseMatch[1]
    .split(/(?<=\.)\s|:\s|;\s|\s+should\b/i)[0]
    ?.trim();
  if (!clause) {
    return [...symbols];
  }

  const codeSymbols = [...clause.matchAll(/`([^`]+)`/g)]
    .map((match) => match[1]?.trim())
    .filter((value): value is string => Boolean(value));
  if (codeSymbols.length > 0) {
    for (const symbol of codeSymbols) {
      symbols.add(symbol);
    }
    return [...symbols];
  }

  for (const match of clause.matchAll(/\b[A-Z][A-Za-z0-9_]+\b/g)) {
    const symbol = match[0]?.trim();
    if (symbol) {
      symbols.add(symbol);
    }
  }

  return [...symbols];
}

function parsePackageChangelogMetadata(
  content: string,
): PackageChangelogMetadata {
  const deprecatedBySymbol = new Map<string, string>();
  let currentVersion: string | null = null;

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    const versionMatch = line.match(/^##\s+([0-9][^\s]*)\s*$/);
    if (versionMatch) {
      currentVersion = normalizeVersion(versionMatch[1]);
      continue;
    }

    if (!currentVersion || !/deprecated/i.test(line)) {
      continue;
    }

    const symbols = extractDeprecatedSymbolsFromLine(line);
    for (const symbol of symbols) {
      const key = toMatchKey(symbol);
      if (!key) {
        continue;
      }

      deprecatedBySymbol.set(
        key,
        preferEarlierVersion(deprecatedBySymbol.get(key), currentVersion) ??
          currentVersion,
      );
    }
  }

  return { deprecatedBySymbol };
}

export async function loadPackageChangelogMetadata(
  repoRoot: string,
  packages: PackageRecord[],
): Promise<Map<string, PackageChangelogMetadata>> {
  const metadataByPackage = new Map<string, PackageChangelogMetadata>();

  for (const pkg of packages) {
    if (!pkg.changelog_path) {
      continue;
    }
    const changelogPath = pkg.changelog_path;

    const changelog = await readFileOrNull(path.join(repoRoot, changelogPath));
    if (!changelog) {
      continue;
    }

    metadataByPackage.set(pkg.name, parsePackageChangelogMetadata(changelog));
  }

  return metadataByPackage;
}

export async function extractChanges(
  repoRoot: string,
  packages: PackageRecord[],
  components: ComponentRecord[],
  generatedAt: string,
): Promise<ChangeRecord[]> {
  const componentsByPackage = new Map(
    packages.map(
      (pkg) =>
        [
          pkg.name,
          components.filter((component) => component.package.name === pkg.name),
        ] as const,
    ),
  );
  const changes: ChangeRecord[] = [];

  for (const pkg of packages) {
    if (!pkg.changelog_path) {
      continue;
    }
    const changelogPath = pkg.changelog_path;

    const changelog = await readFileOrNull(path.join(repoRoot, changelogPath));
    if (!changelog) {
      continue;
    }

    const changelogItems = parseChangelogItems(changelog);
    const packageComponents = componentsByPackage.get(pkg.name) ?? [];

    changelogItems.forEach((item, index) => {
      const summary = summarizeChangeText(item.text);
      const details = stripLeadingCommitHash(item.text);
      const kind = classifyChangeKind(item.text);
      const matchedComponents = findMatchedComponentsForChange(
        item.text,
        packageComponents,
      );

      if (matchedComponents.length === 0) {
        changes.push({
          id: buildChangeId(pkg.name, item.version, "package", pkg.name, index),
          package: pkg.name,
          target_type: "package",
          target_name: pkg.name,
          version: item.version,
          release_type: item.release_type,
          kind,
          summary,
          details,
          source_urls: [changelogPath],
          inference: {
            matched_by: "package_default",
            confidence: "low",
          },
          last_verified_at: generatedAt,
        });
        return;
      }

      for (const match of matchedComponents) {
        changes.push({
          id: buildChangeId(
            pkg.name,
            item.version,
            "component",
            match.component.name,
            index,
          ),
          package: pkg.name,
          target_type: "component",
          target_name: match.component.name,
          version: item.version,
          release_type: item.release_type,
          kind,
          summary,
          details,
          source_urls: [changelogPath],
          inference: match.inference,
          last_verified_at: generatedAt,
        });
      }
    });
  }

  return changes.sort((left, right) => {
    if (left.package !== right.package) {
      return left.package.localeCompare(right.package);
    }

    const versionCompare = semver.rcompare(left.version, right.version);
    if (versionCompare !== 0) {
      return versionCompare;
    }

    if (left.target_type !== right.target_type) {
      return left.target_type.localeCompare(right.target_type);
    }

    if (left.target_name !== right.target_name) {
      return left.target_name.localeCompare(right.target_name);
    }

    return left.summary.localeCompare(right.summary);
  });
}
