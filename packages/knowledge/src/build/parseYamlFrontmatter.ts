import { JSON_SCHEMA, load as parseYaml } from "js-yaml";

const FRONTMATTER_DELIMITER = "---";
const MAX_FRONTMATTER_BYTES = 65_536;
const MAX_FRONTMATTER_NODES = 2_000;
const MAX_FRONTMATTER_DEPTH = 20;
const FORBIDDEN_MAPPING_KEYS = new Set([
  "__proto__",
  "constructor",
  "prototype",
]);

const getOpeningLine = (source: string): string => {
  const lineEnd = source.search(/\r?\n/u);
  return lineEnd === -1 ? source : source.slice(0, lineEnd);
};

function hasExplicitYamlTag(nodeSource: string): boolean {
  let position = 0;
  while (position < nodeSource.length) {
    const whitespace = /^[ \t\r\n]+/u.exec(nodeSource.slice(position));
    if (whitespace) {
      position += whitespace[0].length;
      continue;
    }
    if (nodeSource[position] === "#") {
      const lineEnd = nodeSource.indexOf("\n", position);
      if (lineEnd === -1) return false;
      position = lineEnd + 1;
      continue;
    }
    break;
  }
  return nodeSource[position] === "!";
}

function assertPlainYamlData(
  value: unknown,
): asserts value is Record<string, unknown> {
  let nodes = 0;
  const seenContainers = new WeakSet<object>();
  const visit = (candidate: unknown, depth: number): void => {
    nodes += 1;
    if (nodes > MAX_FRONTMATTER_NODES || depth > MAX_FRONTMATTER_DEPTH) {
      throw new Error("YAML frontmatter exceeds the structural safety limit");
    }
    if (
      candidate === null ||
      typeof candidate === "string" ||
      typeof candidate === "boolean" ||
      (typeof candidate === "number" && Number.isFinite(candidate))
    ) {
      return;
    }
    if (typeof candidate === "object") {
      if (seenContainers.has(candidate)) {
        throw new Error(
          "YAML frontmatter aliases and shared references are not supported",
        );
      }
      seenContainers.add(candidate);
    }
    if (Array.isArray(candidate)) {
      for (const entry of candidate) visit(entry, depth + 1);
      return;
    }
    if (
      typeof candidate !== "object" ||
      Object.getPrototypeOf(candidate) !== Object.prototype
    ) {
      throw new Error(
        "YAML frontmatter may contain only plain data mappings and arrays",
      );
    }
    for (const [key, entry] of Object.entries(candidate)) {
      if (FORBIDDEN_MAPPING_KEYS.has(key)) {
        throw new Error(
          `YAML frontmatter contains forbidden mapping key '${key}'`,
        );
      }
      visit(entry, depth + 1);
    }
  };

  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value) ||
    Object.getPrototypeOf(value) !== Object.prototype
  ) {
    throw new Error("YAML frontmatter root must be a plain mapping");
  }
  visit(value, 0);
}

export interface ParsedYamlFrontmatter {
  data: Record<string, unknown>;
  content: string;
}

/**
 * Parses repository-authored frontmatter as data only.
 *
 * Repository content is untrusted: language-qualified delimiters, YAML
 * aliases/tags, non-mapping roots, duplicate keys, and oversized/deep payloads
 * fail closed. No executable frontmatter engine is present.
 */
export const parseYamlFrontmatter = (
  rawSource: string,
): ParsedYamlFrontmatter => {
  const source = rawSource.replace(/^\uFEFF/u, "");
  const openingLine = getOpeningLine(source);
  const delimiterSuffix = openingLine.slice(FRONTMATTER_DELIMITER.length);

  if (!openingLine.startsWith(FRONTMATTER_DELIMITER)) {
    return { data: {}, content: source };
  }
  if (delimiterSuffix[0] === "-") {
    return { data: {}, content: source };
  }
  if (delimiterSuffix.trim().length > 0) {
    throw new Error(
      `Unsupported frontmatter delimiter ${JSON.stringify(openingLine)}: only untagged YAML frontmatter is supported`,
    );
  }

  const openingEnd = source.search(/\r?\n/u);
  if (openingEnd === -1) {
    throw new Error("YAML frontmatter is missing its closing delimiter");
  }
  const bodyStart =
    openingEnd + (source.slice(openingEnd, openingEnd + 2) === "\r\n" ? 2 : 1);
  const closingSearchEnd = Math.min(
    source.length,
    bodyStart + MAX_FRONTMATTER_BYTES + FRONTMATTER_DELIMITER.length + 2,
  );
  const closingWindow = source.slice(bodyStart, closingSearchEnd);
  const closing =
    /^---[ \t]*\r?\n/mu.exec(closingWindow) ??
    (closingSearchEnd === source.length
      ? /^---[ \t]*$/mu.exec(closingWindow)
      : null);
  if (!closing) {
    if (closingSearchEnd < source.length) {
      throw new Error("YAML frontmatter exceeds the 65536-byte safety limit");
    }
    throw new Error("YAML frontmatter is missing its closing delimiter");
  }
  const closingIndex = bodyStart + closing.index;
  if (closing.index > MAX_FRONTMATTER_BYTES) {
    throw new Error("YAML frontmatter exceeds the 65536-byte safety limit");
  }
  const frontmatter = source.slice(bodyStart, closingIndex);
  if (Buffer.byteLength(frontmatter, "utf8") > MAX_FRONTMATTER_BYTES) {
    throw new Error("YAML frontmatter exceeds the 65536-byte safety limit");
  }
  let containsYamlReference = false;
  let containsExplicitYamlTag = false;
  const nodeStartPositions: number[] = [];
  const parsed = parseYaml(frontmatter, {
    schema: JSON_SCHEMA,
    json: false,
    listener: (event, state) => {
      if (
        typeof state.anchor === "string" ||
        Object.keys(state.anchorMap ?? {}).length > 0
      ) {
        containsYamlReference = true;
      }
      if (event === "open") {
        nodeStartPositions.push(state.position);
      } else {
        const nodeStart = nodeStartPositions.pop();
        if (nodeStart === undefined) {
          throw new Error(
            "YAML frontmatter parser emitted an invalid node span",
          );
        }
        if (hasExplicitYamlTag(frontmatter.slice(nodeStart, state.position))) {
          containsExplicitYamlTag = true;
        }
      }
    },
  });
  if (nodeStartPositions.length !== 0) {
    throw new Error("YAML frontmatter parser left an incomplete node span");
  }
  if (containsYamlReference) {
    throw new Error("YAML frontmatter aliases and anchors are not supported");
  }
  if (containsExplicitYamlTag) {
    throw new Error("YAML frontmatter explicit tags are not supported");
  }
  const data = parsed === undefined ? {} : parsed;
  assertPlainYamlData(data);

  return {
    data,
    content: source.slice(closingIndex + closing[0].length),
  };
};
