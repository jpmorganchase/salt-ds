import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  docPathForRoute,
  packageFromSourceUrl,
  routeForRelativePath,
} from "../pages.mjs";
import {
  collectCountrySymbols,
  collectIcons,
  renderCountrySymbolReference,
  renderIconReference,
  renderTokenReference,
} from "../references.mjs";
import { summarize } from "../render.mjs";

describe("routes", () => {
  it("maps site files to routes and doc paths", () => {
    expect(routeForRelativePath("components/button/usage.mdx")).toBe(
      "/salt/components/button/usage",
    );
    expect(routeForRelativePath("components/button/index.mdx")).toBe(
      "/salt/components/button",
    );
    expect(docPathForRoute("/salt/foundations/color")).toBe(
      "foundations/color.md",
    );
  });

  it("infers the package from a source URL", () => {
    expect(
      packageFromSourceUrl(
        "https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/slider",
      ),
    ).toBe("@salt-ds/core");
    expect(packageFromSourceUrl(undefined)).toBeUndefined();
  });
});

describe("summarize", () => {
  it("keeps short text and cuts long text at a sentence or word", () => {
    expect(summarize("Short.")).toBe("Short.");
    const long = `${"First sentence is long enough. ".repeat(4)}Tail`;
    expect(summarize(long, 70)).toBe(
      "First sentence is long enough. First sentence is long enough.",
    );
    expect(summarize("one two three four five", 12)).toBe("one two…");
  });
});

describe("icon and country references", () => {
  let root;

  beforeAll(async () => {
    root = await mkdtemp(path.join(tmpdir(), "salt-agent-docs-refs-"));
    const icons = path.join(root, "icons/src/components");
    await mkdir(icons, { recursive: true });
    await writeFile(
      path.join(icons, "index.ts"),
      'export * from "./Add";\nexport * from "./Success";\n',
    );
    await writeFile(
      path.join(icons, "Add.tsx"),
      "export const AddIcon = forwardRef(() => null);\n",
    );
    await writeFile(
      path.join(icons, "Success.tsx"),
      "/** @deprecated since 1.13.0. Use `CheckmarkIcon` instead. */\nexport const SuccessIcon = forwardRef(() => null);\n",
    );
    const countries = path.join(root, "countries/src/components");
    await mkdir(countries, { recursive: true });
    await writeFile(
      path.join(countries, "index.ts"),
      'export { default as GB } from "./GB";\nexport { default as GB_Sharp } from "./GB_Sharp";\n',
    );
  });

  afterAll(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it("lists icons with their deprecations", async () => {
    const icons = await collectIcons(path.join(root, "icons"));
    expect(icons).toEqual([
      { name: "AddIcon", deprecated: undefined },
      {
        name: "SuccessIcon",
        deprecated: "since 1.13.0. Use `CheckmarkIcon` instead.",
      },
    ]);
    const markdown = renderIconReference({
      icons,
      packageVersion: "1.0.0",
      links: { icon: "components/icon.md" },
    });
    expect(markdown).toContain(
      "- `SuccessIcon`: deprecated since 1.13.0. Use `CheckmarkIcon` instead.",
    );
  });

  it("lists country codes and notes sharp variants", async () => {
    const symbols = await collectCountrySymbols(path.join(root, "countries"));
    expect(symbols).toEqual(["GB", "GB_Sharp"]);
    const markdown = renderCountrySymbolReference({
      symbols,
      packageVersion: "1.0.0",
      links: { countrySymbol: "components/country-symbol.md" },
    });
    expect(markdown).toContain("`_Sharp` suffix");
    expect(markdown.trimEnd().endsWith("`GB`")).toBe(true);
  });
});

describe("token reference", () => {
  const token = (name, tier, group) => ({
    name,
    tier,
    group,
    themes: new Set(["shared"]),
  });
  const tokens = [
    token("--salt-actionable-bold", "characteristics", "actionable"),
    ...Array.from({ length: 60 }, (_, index) =>
      token(
        `--salt-color-blue-${String(index).padStart(3, "0")}`,
        "foundations",
        "color",
      ),
    ),
    token("--salt-spacing-100", "foundations", "spacing"),
  ];
  const links = {
    designTokens: "./themes/design-tokens.md",
    howToRead: "./themes/design-tokens/how-to-read-tokens.md",
  };

  it("is one file when it fits", () => {
    const files = renderTokenReference({
      tokens,
      packageVersion: "1.0.0",
      links,
    });
    expect(files.map((file) => file.docPath)).toEqual(["tokens.md"]);
    expect(files[0].markdown).toContain(
      "### actionable\n\n- `--salt-actionable-bold`",
    );
  });

  it("splits by tier, then group, then part to stay within the budget", () => {
    const files = renderTokenReference({
      tokens,
      packageVersion: "1.0.0",
      links,
      budget: 2048,
    });
    const byPath = new Map(files.map((file) => [file.docPath, file.markdown]));
    expect([...byPath.keys()]).toEqual([
      "tokens.md",
      "tokens/characteristics.md",
      "tokens/foundations/color-1.md",
      "tokens/foundations/color-2.md",
      "tokens/foundations/spacing.md",
    ]);
    for (const markdown of byPath.values()) {
      expect(Buffer.byteLength(markdown)).toBeLessThanOrEqual(2048);
    }
    expect(byPath.get("tokens.md")).toContain(
      "- [color, part 1 of 2](tokens/foundations/color-1.md): ",
    );
    expect(byPath.get("tokens/foundations/spacing.md")).toContain(
      "# Foundation tokens: spacing\n\nBase values.",
    );
    expect(byPath.get("tokens/foundations/spacing.md")).toContain(
      "[design tokens reference](../../tokens.md)",
    );
  });
});
