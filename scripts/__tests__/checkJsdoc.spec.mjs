import { mkdtemp, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import { checkPropsTables, checkSource } from "../checkJsdoc.mjs";

function check(members) {
  return checkSource(
    "Example.tsx",
    `export interface ExampleProps {\n${members}\n}\n`,
  ).map(({ rule, line }) => ({ rule, line }));
}

function rulesFor(members) {
  return check(members).map(({ rule }) => rule);
}

describe("checkSource", () => {
  it("accepts props that follow the standards", () => {
    expect(
      check(`
  /**
   * If \`true\`, the arrow is hidden.
   */
  hideArrow?: boolean;
  /**
   * Delay in milliseconds before the popup is shown.
   * @default 300
   */
  enterDelay?: number;
  /**
   * The placement of the popup relative to its trigger.
   * @default "right"
   */
  placement?: "top" | "right" | "bottom" | "left";
  /**
   * Callback fired when the open state changes.
   * @param open - If \`true\`, the popup is open.
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * Props applied to the \`input\` element.
   */
  inputProps?: object;
  /**
   * The color of the text. When \`styleAs\` is \`"inherit"\`, it defaults to
   * \`"inherit"\`.
   * @default "primary"
   */
  color?: string;
  /**
   * If \`true\`, the example has hover styling.
   * @deprecated since 1.71.0. Use \`InteractableExample\` instead.
   */
  hoverable?: boolean;`),
    ).toEqual([]);
  });

  it("only checks props types", () => {
    expect(
      checkSource(
        "Example.ts",
        "interface ExampleState {\n  /** lowercase */\n  open: boolean;\n}\n",
      ),
    ).toEqual([]);
  });

  it("reports comments that aren't JSDoc", () => {
    expect(rulesFor("  // The size.\n  size?: number;")).toEqual([
      "plain-comment",
    ]);
    expect(
      rulesFor(
        "  // biome-ignore lint/suspicious/noExplicitAny: test\n  size?: any;",
      ),
    ).toEqual([]);
  });

  it("reports the block's layout", () => {
    expect(rulesFor("  /** The size. */\n  size?: number;")).toEqual([
      "format",
    ]);
    expect(rulesFor("  /** The size.\n   */\n  size?: number;")).toEqual([
      "format",
    ]);
    expect(rulesFor("  /**\n   * The size.\n   **/\n  size?: number;")).toEqual(
      ["format"],
    );
  });

  it("reports descriptions that aren't sentences", () => {
    expect(rulesFor("  /**\n   * the size.\n   */\n  size?: number;")).toEqual([
      "sentence",
    ]);
    expect(rulesFor("  /**\n   * The size\n   */\n  size?: number;")).toEqual([
      "sentence",
    ]);
    expect(rulesFor("  /**\n   * @default 1\n   */\n  size?: number;")).toEqual(
      ["description"],
    );
  });

  it("reports phrasing that doesn't match the kind of prop", () => {
    expect(
      rulesFor("  /**\n   * Whether it's open.\n   */\n  open?: boolean;"),
    ).toEqual(["phrasing"]);
    expect(
      rulesFor(
        "  /**\n   * Handler for changes.\n   */\n  onChange?: () => void;",
      ),
    ).toEqual(["phrasing"]);
    expect(
      rulesFor(
        "  /**\n   * Props for the input.\n   */\n  inputProps?: object;",
      ),
    ).toEqual(["phrasing"]);
  });

  it("reports descriptions that repeat the type", () => {
    expect(
      rulesFor(
        '  /**\n   * Either "top" or "bottom".\n   */\n  side?: "top" | "bottom";',
      ),
    ).toEqual(["repeats-type"]);
  });

  it("reports @default values that aren't written as in code", () => {
    const defaults = [
      "@default false",
      "@default undefined",
      "@default `top`",
      "@default 'top'",
      '@default "top".',
      "@default top",
      "@default",
    ];
    for (const tag of defaults) {
      expect(
        rulesFor(`  /**\n   * The side.\n   * ${tag}\n   */\n  side?: string;`),
        tag,
      ).toEqual(["default"]);
    }
  });

  it("reports defaults written in the description", () => {
    expect(
      rulesFor(
        '  /**\n   * The side. Defaults to `"top"`.\n   */\n  side?: string;',
      ),
    ).toEqual(["prose-default"]);
    expect(
      rulesFor(
        "  /**\n   * The maximum value.\n   * Default value is 100.\n   */\n  max?: number;",
      ),
    ).toEqual(["prose-default"]);
    expect(
      rulesFor(
        "  /**\n   * The gap between columns. Defaults to the value of `gap`.\n   */\n  columnGap?: number;",
      ),
    ).toEqual([]);
    expect(
      rulesFor(
        "  /**\n   * If `true`, the accent is hidden. When the `Drawer` is `resizable`, it defaults to `true`.\n   */\n  disableAccent?: boolean;",
      ),
    ).toEqual([]);
  });

  it("reports British spelling outside code", () => {
    expect(
      rulesFor("  /**\n   * The colour of the text.\n   */\n  tint?: string;"),
    ).toEqual(["spelling"]);
    expect(
      rulesFor(
        "  /**\n   * The value of `--salt-colour`.\n   */\n  tint?: string;",
      ),
    ).toEqual([]);
  });

  it("reports @param on props that aren't functions", () => {
    expect(
      rulesFor(
        "  /**\n   * The format.\n   * @param date - The date.\n   */\n  format?: string;",
      ),
    ).toEqual(["param"]);
  });

  it("reports @deprecated before other tags", () => {
    expect(
      rulesFor(
        "  /**\n   * The size.\n   * @deprecated since 1.0.0. Use `scale` instead.\n   * @default 1\n   */\n  size?: number;",
      ),
    ).toEqual(["deprecated-last"]);
  });

  it("lets a comment with a reason ignore a rule", () => {
    expect(
      rulesFor(
        "  // jsdoc-lint-ignore default: the value is a constant's name.\n  /**\n   * The size.\n   * @default size\n   */\n  size?: number;",
      ),
    ).toEqual([]);
    expect(
      rulesFor(
        "  // jsdoc-lint-ignore default\n  /**\n   * The size.\n   * @default size\n   */\n  size?: number;",
      ),
    ).toEqual(["ignore"]);
    expect(
      rulesFor(
        "  // jsdoc-lint-ignore unknown-rule: reason.\n  /**\n   * The size.\n   */\n  size?: number;",
      ),
    ).toEqual(["ignore"]);
  });

  it("reports the line of the comment", () => {
    expect(
      check("  size?: number;\n  /** The width. */\n  width?: number;"),
    ).toEqual([{ rule: "format", line: 3 }]);
  });
});

describe("checkPropsTables", () => {
  let dir;

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it("reports props that the props table shows with no description", async () => {
    // Inside the repository, so react's types resolve.
    dir = await mkdtemp(
      path.join(path.dirname(fileURLToPath(import.meta.url)), ".check-jsdoc-"),
    );
    const file = path.join(dir, "Example.tsx");
    await writeFile(
      file,
      `import type { ReactElement } from "react";

export interface ExampleProps {
  /**
   * The size.
   */
  size?: number;
  width?: number;
  // jsdoc-lint-ignore props-table: it's documented on the site.
  height?: number;
}

export function Example(props: ExampleProps): ReactElement | null {
  return null;
}
`,
    );
    const findings = checkPropsTables([file]);
    expect(findings.map(({ rule, line }) => ({ rule, line }))).toEqual([
      { rule: "props-table", line: 8 },
    ]);
    expect(findings[0].message).toContain("`width`");
  });
});
