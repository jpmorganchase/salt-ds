import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import { collectTokens, renderTokenReference } from "../references.mjs";

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
