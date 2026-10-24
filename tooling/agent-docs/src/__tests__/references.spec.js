import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import {
  changelogReplacements,
  collectTokens,
  renderTokenReference,
} from "../references.mjs";

const roots = [];
afterEach(async () => {
  await Promise.all(
    roots.splice(0).map((root) => rm(root, { recursive: true, force: true })),
  );
});

async function createTheme(overrides = {}) {
  const root = await mkdtemp(path.join(tmpdir(), "salt-token-reference-"));
  roots.push(root);
  const files = {
    "theme.css":
      '@import url("foundations/index.css"); @import "deprecated/foundations.css";',
    "theme-next.css":
      '@import "./theme.css"; @import url(next/foundations/color.css);',
    "experimental/salt-interim.css":
      "@import url('../foundations/index.css'); @import '../salt-interim/foundations/color.css';",
    "foundations/index.css": '@import "./size.css";',
    "foundations/size.css":
      ".salt-theme { --salt-size-separator-strokeWidth: 1px; }",
    "deprecated/foundations.css":
      ".salt-theme { --salt-size-divider-strokeWidth: var(--salt-size-separator-strokeWidth); }",
    "next/foundations/color.css":
      ".salt-theme-next { --salt-color-brown-100: brown; }",
    "salt-interim/foundations/color.css":
      ".salt-interim { --salt-color-brown-100: brown; --salt-color-gray-900-5a: gray; }",
    ...overrides,
  };
  for (const [name, css] of Object.entries(files)) {
    const file = path.join(root, name);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, css);
  }
  return root;
}

function render(tokens) {
  return renderTokenReference({
    tokens,
    packageVersion: "1.0.0",
    links: {
      designTokens: "./themes/design-tokens.md",
      howToRead: "./themes/design-tokens/how-to-read-tokens.md",
    },
  })
    .map((file) => file.markdown)
    .join("\n");
}

function expectNoAlias(markdown, name) {
  const line = markdown
    .split("\n")
    .find((line) => line.startsWith(`- \`${name}\``));
  expect(line, name).toBeDefined();
  expect(line, name).not.toContain("alias of");
}

describe("token availability", () => {
  it("distinguishes experimental tokens and preserves camelCase replacement names", async () => {
    const root = await createTheme();
    const tokens = await collectTokens(root);
    const markdown = render(tokens);
    expect(markdown).toContain(
      "`--salt-color-gray-900-5a` (experimental salt-interim theme only)",
    );
    expect(markdown).toContain(
      "`--salt-color-brown-100` (SaltProviderNext and experimental salt-interim themes only)",
    );
    expect(markdown).toContain(
      "`--salt-size-divider-strokeWidth`: alias of `--salt-size-separator-strokeWidth` (SaltProviderNext and legacy themes only)",
    );
    expect(markdown).toContain("- `--salt-size-separator-strokeWidth`\n");
    expect(markdown).toContain(
      "@salt-ds/theme/css/experimental/salt-interim.css",
    );
  });

  it("uses actual imports for common-directory tokens and unimported files", async () => {
    const root = await createTheme({
      "theme-next.css":
        '@import "./theme.css"; @import "./foundations/next-only.css";',
      "foundations/next-only.css":
        ".salt-theme-next { --salt-next-only: 1px; }",
      "salt-interim/foundations/unpublished.css":
        ".salt-interim { --salt-unpublished: 2px; }",
    });
    const markdown = render(await collectTokens(root));
    expect(markdown).toContain(
      "`--salt-next-only` (SaltProviderNext theme only)",
    );
    expect(markdown).toContain(
      "`--salt-unpublished` (not included in the supported theme entrypoints)",
    );
  });

  it.each(["theme-next.css", "foundations/size.css"])(
    "rejects a missing stylesheet instead of inferring availability: %s",
    async (file) => {
      const root = await createTheme();
      await rm(path.join(root, file));
      await expect(collectTokens(root)).rejects.toThrow(
        `Cannot resolve theme stylesheet: ${file}`,
      );
    },
  );

  it("qualifies common deprecated tokens using the real theme entrypoints", async () => {
    const tokens = await collectTokens(
      fileURLToPath(
        new URL("../../../../packages/theme/src/css", import.meta.url),
      ),
    );
    const byName = new Map(tokens.map((token) => [token.name, token]));
    expect(byName.get("--salt-accent-background").themes).toEqual(
      new Set(["legacy", "next"]),
    );
    expect(byName.get("--salt-color-gray-900-5a").themes).toEqual(
      new Set(["salt-interim"]),
    );
    expect(byName.get("--salt-color-brown-100").themes).toEqual(
      new Set(["next", "salt-interim"]),
    );
  });
});

describe("token tiers", () => {
  it("lists a token that a theme declares as current outside the deprecated tier", async () => {
    // Deprecated/foundations.css sorts before foundations/, and theme.css
    // imports both, as with the reinstated alpha foundation tokens.
    const root = await createTheme({
      "foundations/size.css":
        ".salt-theme { --salt-size-separator-strokeWidth: 1px; --salt-size-reinstated: 2px; }",
      "deprecated/foundations.css":
        ".salt-theme { --salt-size-divider-strokeWidth: var(--salt-size-separator-strokeWidth); --salt-size-reinstated: 2px; }",
    });
    const tokens = await collectTokens(root);
    const reinstated = tokens.filter(
      (token) => token.name === "--salt-size-reinstated",
    );
    expect(reinstated).toHaveLength(1);
    expect(reinstated[0]).toMatchObject({
      tier: "foundations",
      group: "size",
    });
    const markdown = render(tokens);
    expect(markdown).toContain("- `--salt-size-reinstated`\n");
    expect(
      markdown.slice(markdown.indexOf("## Deprecated tokens")),
    ).not.toContain("--salt-size-reinstated");
  });

  it("lists a token deprecated in one theme under both tiers, each with its themes", async () => {
    const root = await createTheme({
      "theme.css":
        '@import url("foundations/index.css"); @import "legacy/palette/warning.css";',
      "theme-next.css":
        '@import url("foundations/index.css"); @import "next/deprecated/palette.css";',
      "legacy/palette/warning.css":
        ".salt-theme { --salt-palette-warning-hover: orange; }",
      "next/deprecated/palette.css":
        ".salt-theme-next { --salt-palette-warning-hover: darkorange; }",
    });
    const tokens = await collectTokens(root);
    expect(
      tokens
        .filter((token) => token.name === "--salt-palette-warning-hover")
        .map(({ tier, themes }) => ({ tier, themes: [...themes] })),
    ).toEqual([
      { tier: "palette", themes: ["legacy"] },
      { tier: "deprecated", themes: ["next"] },
    ]);
    const markdown = render(tokens);
    const deprecated = markdown.slice(markdown.indexOf("## Deprecated tokens"));
    expect(
      markdown.slice(0, markdown.indexOf("## Deprecated tokens")),
    ).toContain("`--salt-palette-warning-hover` (legacy theme only)");
    expect(deprecated).toContain(
      "`--salt-palette-warning-hover` (SaltProviderNext theme only)",
    );
  });

  it("classifies the reinstated alpha foundations and next-deprecated palette tokens in the real theme", async () => {
    const tokens = await collectTokens(
      fileURLToPath(
        new URL("../../../../packages/theme/src/css", import.meta.url),
      ),
    );
    const tiers = (name) =>
      tokens
        .filter((token) => token.name === name)
        .map(({ tier, themes }) => `${tier}:${[...themes].sort().join("+")}`);
    expect(tiers("--salt-color-black-15a")).toEqual([
      "foundations:legacy+next+salt-interim",
    ]);
    expect(tiers("--salt-color-white-15a")).toEqual([
      "foundations:legacy+next+salt-interim",
    ]);
    expect(tiers("--salt-palette-warning-action-hover")).toEqual([
      "palette:legacy",
      "deprecated:next",
    ]);
  });
});

describe("deprecated token replacements", () => {
  // A theme with characteristic, palette and deprecated tokens.
  const theme = (deprecated) =>
    createTheme({
      "theme.css":
        '@import url("foundations/index.css"); @import "next/palette/corner.css"; @import "next/palette/neutral.css"; @import "next/characteristics/container.css"; @import "deprecated/characteristics.css";',
      "next/palette/corner.css":
        ".salt-theme { --salt-palette-corner: 4px; --salt-palette-corner-weak: 2px; }",
      "next/palette/neutral.css":
        ".salt-theme { --salt-palette-neutral-border: gray; }",
      "next/characteristics/container.css":
        ".salt-theme { --salt-container-bold-borderColor: var(--salt-palette-neutral-border); --salt-container-subtle-borderColor: var(--salt-palette-neutral-border); }",
      "deprecated/characteristics.css": `.salt-theme { ${deprecated} }`,
    });

  it("uses the replacement a deprecated declaration's comment names, in any of its forms", async () => {
    const root = await theme(`
      --salt-old-a: gray; /* Use --salt-container-bold-borderColor */
      --salt-old-b: gray; /* Use ---salt-container-bold-borderColor */
      --salt-old-c: gray; /* --salt-container-subtle-borderColor */
      --salt-old-d: var(--salt-container-subtle-borderColor); /* Use --salt-container-bold-borderColor */
    `);
    const markdown = render(await collectTokens(root));
    expect(markdown).toContain(
      "- `--salt-old-a`: use `--salt-container-bold-borderColor` instead",
    );
    expect(markdown).toContain(
      "- `--salt-old-b`: use `--salt-container-bold-borderColor` instead",
    );
    expect(markdown).toContain(
      "- `--salt-old-c`: use `--salt-container-subtle-borderColor` instead",
    );
    // The comment wins over the alias the value implies.
    expect(markdown).toContain(
      "- `--salt-old-d`: use `--salt-container-bold-borderColor` instead",
    );
  });

  it("follows replacements that are themselves deprecated", async () => {
    const root = await theme(`
      --salt-oldest: gray; /* Use --salt-older */
      --salt-older: gray; /* Use --salt-old */
      --salt-old: var(--salt-container-bold-borderColor);
      --salt-cycle-a: gray; /* Use --salt-cycle-b */
      --salt-cycle-b: gray; /* Use --salt-cycle-a */
    `);
    const markdown = render(await collectTokens(root));
    expect(markdown).toContain(
      "- `--salt-oldest`: use `--salt-container-bold-borderColor` instead",
    );
    expect(markdown).toContain(
      "- `--salt-old`: alias of `--salt-container-bold-borderColor`",
    );
    expectNoAlias(markdown, "--salt-cycle-a");
  });

  it("warns about comments naming a token that doesn't exist, isn't current or differs between themes", async () => {
    const root = await createTheme({
      "theme.css":
        '@import url("foundations/index.css"); @import "next/palette/neutral.css"; @import "legacy/deprecated/characteristics.css";',
      "theme-next.css":
        '@import url("foundations/index.css"); @import "next/palette/neutral.css"; @import "next/deprecated/characteristics.css";',
      "next/palette/neutral.css":
        ".salt-theme { --salt-palette-neutral-border: gray; }",
      "legacy/deprecated/characteristics.css":
        ".salt-theme { --salt-old-missing: gray; /* Use --salt-nope */ --salt-old-palette: gray; /* Use --salt-palette-neutral-border */ --salt-old-split: gray; /* Use --salt-size-separator-strokeWidth */ }",
      "next/deprecated/characteristics.css":
        ".salt-theme-next { --salt-old-split: gray; /* Use --salt-spacing-100 */ }",
    });
    const warnings = [];
    const markdown = render(
      await collectTokens(root, { warn: (message) => warnings.push(message) }),
    );
    expect(warnings).toEqual([
      "--salt-old-split: the theme CSS names different replacements in different themes (--salt-size-separator-strokeWidth, --salt-spacing-100), so none is shown.",
      "--salt-old-missing: the theme CSS names --salt-nope as its replacement, which is not a token, so none is shown.",
      "--salt-old-palette: the theme CSS names --salt-palette-neutral-border as its replacement, which is a palette token, so it isn't shown.",
    ]);
    for (const name of [
      "--salt-old-missing",
      "--salt-old-palette",
      "--salt-old-split",
    ]) {
      expectNoAlias(markdown, name);
      expect(markdown).not.toMatch(new RegExp(`\`${name}\`: use`));
    }
  });

  it("uses the changelog's replacements after the theme CSS's, listing alternatives", async () => {
    const root = await theme(`
      --salt-old-a: gray;
      --salt-old-b: gray; /* Use --salt-container-subtle-borderColor */
      --salt-old-c: gray;
    `);
    const changelog = new Map([
      [
        "--salt-old-a",
        [
          "--salt-container-bold-borderColor",
          "--salt-container-subtle-borderColor",
        ],
      ],
      ["--salt-old-b", ["--salt-container-bold-borderColor"]],
      ["--salt-old-c", ["--salt-palette-neutral-border"]],
    ]);
    const warnings = [];
    const markdown = render(
      await collectTokens(root, {
        changelog,
        warn: (message) => warnings.push(message),
      }),
    );
    expect(markdown).toContain(
      "- `--salt-old-a`: use `--salt-container-bold-borderColor` or `--salt-container-subtle-borderColor` instead",
    );
    expect(markdown).toContain(
      "- `--salt-old-b`: use `--salt-container-subtle-borderColor` instead",
    );
    // A palette replacement isn't shown, and the changelog can't be corrected.
    expect(markdown).not.toMatch(/`--salt-old-c`: use/);
    expect(warnings).toEqual([]);
  });

  it("marks palette groups that no characteristic references as used directly", async () => {
    const root = await theme("--salt-old: gray;");
    const markdown = render(await collectTokens(root));
    const note =
      "No characteristic token references these, so reference them directly.";
    expect(markdown).toContain(
      `### corner\n\n${note}\n\n- \`--salt-palette-corner\``,
    );
    expect(markdown).toContain(
      "### neutral\n\n- `--salt-palette-neutral-border`",
    );
  });
});

describe("changelogReplacements", () => {
  it("reads replacement tables, newest first, and only tokens joined by or", () => {
    const changelog = `# @salt-ds/theme

## 2.0.0

- Deprecated tokens.

  | Deprecated token | Replacement token |
  | ---------------- | ----------------- |
  | \`--salt-a\` | \`--salt-b\` or \`--salt-c\` |
  | --salt-d | None |
  | \`--salt-e\` | \`--salt-f\` + \`--salt-g\` |

## 1.0.0

  | Name | Replacement |
  | - | - |
  | \`--salt-a\` | \`--salt-old\` |
  | \`--salt-d\` | \`--salt-old\` |
  | \`--salt-h\` | \`--salt-i\` |

  | Token | Old value | New value |
  | - | - | - |
  | \`--salt-j\` | \`--salt-k\` | \`--salt-l\` |
`;
    expect(changelogReplacements(changelog)).toEqual(
      new Map([
        ["--salt-a", ["--salt-b", "--salt-c"]],
        ["--salt-h", ["--salt-i"]],
      ]),
    );
  });

  it("finds the replacements for the tokens agents used from older Salt versions", async () => {
    const themeDir = fileURLToPath(
      new URL("../../../../packages/theme", import.meta.url),
    );
    const { readFile } = await import("node:fs/promises");
    const changelog = changelogReplacements(
      await readFile(path.join(themeDir, "CHANGELOG.md"), "utf8"),
    );
    const markdown = render(
      await collectTokens(path.join(themeDir, "src", "css"), { changelog }),
    );
    expect(markdown).toContain(
      "- `--salt-size-border`: use `--salt-spacing-fixed-100` or `--salt-size-fixed-100` instead",
    );
    expect(markdown).toContain(
      "- `--salt-container-secondary-borderColor`: use `--salt-container-bold-borderColor` instead",
    );
    expect(markdown).toContain(
      "- `--salt-container-borderStyle`: use `--salt-borderStyle-solid` instead",
    );
  });
});

describe("deprecated token aliases", () => {
  it("keeps a consistent alias even when the target's value changes", async () => {
    const root = await createTheme({
      "deprecated/foundations.css": `
        .salt-theme[data-mode="light"] {
          --salt-old-size: var(--salt-size-separator-strokeWidth);
        }
        .salt-theme[data-mode="dark"] {
          --salt-old-size: var( --salt-size-separator-strokeWidth );
        }
      `,
      "foundations/size.css": `
        .salt-theme[data-mode="light"] { --salt-size-separator-strokeWidth: 1px; }
        .salt-theme[data-mode="dark"] { --salt-size-separator-strokeWidth: 2px; }
      `,
    });
    expect(render(await collectTokens(root))).toContain(
      "`--salt-old-size`: alias of `--salt-size-separator-strokeWidth`",
    );
  });

  it.each([
    ["another token", "var(--salt-other-size)"],
    ["a literal", "2px"],
    ["a calculation", "calc(2 * var(--salt-size-separator-strokeWidth))"],
    ["a fallback", "var(--salt-size-separator-strokeWidth, 1px)"],
  ])(
    "omits aliases overridden by %s in either order",
    async (_label, value) => {
      const root = await createTheme({
        "deprecated/foundations.css": `
        .salt-theme {
          --salt-alias-first: var(--salt-size-separator-strokeWidth);
          --salt-alias-last: ${value};
        }
        .salt-theme[data-mode="dark"] {
          --salt-alias-first: ${value};
          --salt-alias-last: var(--salt-size-separator-strokeWidth);
        }
      `,
      });
      const markdown = render(await collectTokens(root));
      for (const name of ["--salt-alias-first", "--salt-alias-last"]) {
        expectNoAlias(markdown, name);
      }
    },
  );

  it.each(["next/foundations/color.css", "theme-next.css"])(
    "checks overrides outside deprecated files: %s",
    async (file) => {
      const root = await createTheme({
        [file]: `
          ${file === "theme-next.css" ? '@import "./theme.css";' : ""}
          .salt-theme-next { --salt-size-divider-strokeWidth: 2px; }
        `,
      });
      const markdown = render(await collectTokens(root));
      expectNoAlias(markdown, "--salt-size-divider-strokeWidth");
    },
  );

  it("does not suggest replacements for tokens listed outside the deprecated tier", async () => {
    const root = await createTheme({
      "theme.css": `
        @import "foundations/index.css";
        @import "legacy/palette/size.css";
      `,
      "theme-next.css": `
        @import "foundations/index.css";
        @import "next/deprecated/palette.css";
      `,
      "legacy/palette/size.css":
        ".salt-theme { --salt-palette-size: var(--salt-size-separator-strokeWidth); }",
      "next/deprecated/palette.css":
        ".salt-theme-next { --salt-palette-size: var(--salt-size-separator-strokeWidth); }",
    });
    const markdown = render(await collectTokens(root));
    expectNoAlias(markdown, "--salt-palette-size");
  });

  it("omits conflicting real color and font aliases while retaining stable replacements", async () => {
    const tokens = await collectTokens(
      fileURLToPath(
        new URL("../../../../packages/theme/src/css", import.meta.url),
      ),
    );
    const markdown = render(tokens);
    for (const name of [
      "--salt-palette-foreground-active",
      "--salt-palette-accent-action-active",
      "--salt-palette-text-fontFamily-heading",
      "--salt-palette-text-heading-fontWeight",
    ]) {
      expectNoAlias(markdown, name);
    }
    expectNoAlias(markdown, "--salt-size-divider-strokeWidth");
    expect(
      markdown
        .split("\n")
        .find((line) =>
          line.startsWith("- `--salt-typography-textDecoration-italic`"),
        ),
    ).toContain("alias of `--salt-typography-fontStyle-italic`");
  });
});
