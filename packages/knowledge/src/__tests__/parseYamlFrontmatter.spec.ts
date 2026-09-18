import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import { parseYamlFrontmatter } from "../build/parseYamlFrontmatter.js";

const EXECUTION_SENTINEL = "__saltMcpFrontmatterExecuted";
const BUILD_DIRECTORY = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../build",
);

afterEach(() => {
  delete (globalThis as Record<string, unknown>)[EXECUTION_SENTINEL];
});

describe("parseYamlFrontmatter", () => {
  it("parses untagged YAML frontmatter", () => {
    const parsed = parseYamlFrontmatter(
      "---\ntitle: Safe data\ncategories:\n  - components\n---\n# Body\n",
    );

    expect(parsed.data).toEqual({
      title: "Safe data",
      categories: ["components"],
    });
    expect(parsed.content).toBe("# Body\n");
  });

  it.each([
    "javascript",
    "js",
    "json",
  ])("rejects %s-tagged frontmatter without executing it", (language) => {
    const source = `---${language}\n(globalThis.${EXECUTION_SENTINEL} = true, { title: "unsafe" })\n---\n`;

    expect(() => parseYamlFrontmatter(source)).toThrow(
      /only untagged YAML frontmatter is supported/u,
    );
    expect(
      (globalThis as Record<string, unknown>)[EXECUTION_SENTINEL],
    ).toBeUndefined();
  });

  it("rejects a tagged delimiter after a byte-order mark", () => {
    expect(() =>
      parseYamlFrontmatter("\uFEFF---javascript\n({ safe: false })\n---\n"),
    ).toThrow(/only untagged YAML frontmatter is supported/u);
  });

  it.each([
    "--- \n",
    "---\t\r\n",
    "\uFEFF--- \n",
  ])("accepts whitespace-only delimiter suffixes", (opening) => {
    const parsed = parseYamlFrontmatter(`${opening}title: Safe\n---\nBody\n`);
    expect(parsed.data.title).toBe("Safe");
    expect(parsed.content).toBe("Body\n");
  });

  it("preserves a four-dash Markdown line as ordinary content", () => {
    const source = "----\nNot frontmatter\n";
    const parsed = parseYamlFrontmatter(source);
    expect(parsed.data).toEqual({});
    expect(parsed.content).toBe(source);
  });

  it("keeps executable frontmatter engines out of the build boundary", async () => {
    const entries = await fs.readdir(BUILD_DIRECTORY, {
      recursive: true,
      encoding: "utf8",
    });
    const importers: string[] = [];
    for (const entry of entries.filter((candidate) =>
      candidate.endsWith(".ts"),
    )) {
      const source = await fs.readFile(
        path.join(BUILD_DIRECTORY, entry),
        "utf8",
      );
      if (/from\s+["']gray-matter["']/u.test(source)) {
        importers.push(entry.replaceAll("\\", "/"));
      }
    }
    expect(importers).toEqual([]);
  });

  it.each([
    "---\nvalue: &shared unsafe\nother: *shared\n---\n",
    "---\nvalue: &é unsafe\nother: *é\n---\n",
    "---\nvalue: &\u00A0 unsafe\nother: *\u00A0\n---\n",
    '---\nroot: {"a":&x 1,"b":*x}\n---\n',
    "---\nvalue: &cycle\n  self: *cycle\n---\n",
    "---\nvalue: !!js/function >\n  function () { return true; }\n---\n",
    "---\nvalue: !!str 1\n---\n",
    "---\n!!map {value: 1}\n---\n",
    "---\nnull\n---\n",
    "---\n~\n---\n",
    "---\n- not\n- a\n- mapping\n---\n",
    "---\ntitle: first\ntitle: duplicate\n---\n",
    "---\nconstructor:\n  prototype:\n    polluted: true\n---\n",
    "---\ntitle: Missing close\n",
  ])("rejects unsafe or malformed YAML data", (source) => {
    expect(() => parseYamlFrontmatter(source)).toThrow();
  });

  it("rejects oversized frontmatter before scanning the rest of the source", () => {
    const oversized = `---\n${"a".repeat(65_537)}\n---\nBody\n`;
    expect(() => parseYamlFrontmatter(oversized)).toThrow(
      /65536-byte safety limit/u,
    );
  });

  it("does not accept a closing delimiter truncated at the scan boundary", () => {
    const maxSizeMapping = `key: ${"a".repeat(65_530)}\n`;
    expect(Buffer.byteLength(maxSizeMapping, "utf8")).toBe(65_536);
    expect(() =>
      parseYamlFrontmatter(`---\n${maxSizeMapping}---  javascript\nBody\n`),
    ).toThrow(/65536-byte safety limit/u);
  });

  it("does not treat quoted anchor-like text as YAML reference syntax", () => {
    expect(
      parseYamlFrontmatter('---\nlabel: "&not-an-anchor"\n---\nBody\n').data,
    ).toEqual({ label: "&not-an-anchor" });
    expect(
      parseYamlFrontmatter('---\nlabel: "!!not-a-tag"\n---\nBody\n').data,
    ).toEqual({ label: "!!not-a-tag" });
  });
});
