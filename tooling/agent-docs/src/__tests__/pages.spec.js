import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  discoverDocuments,
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

describe("pattern pages", () => {
  let siteDocsDir;

  beforeAll(async () => {
    siteDocsDir = await mkdtemp(path.join(tmpdir(), "salt-agent-docs-pages-"));
    await mkdir(path.join(siteDocsDir, "patterns"), { recursive: true });
    await writeFile(
      path.join(siteDocsDir, "patterns/formatted-input.mdx"),
      `---
title: Formatted input
description: "Formatted input guides users to enter data in a pattern."
alsoKnownAs: ["Input mask", "Phone number", 3]
aliases:
  - /salt/patterns/formatted-input
---

Body.
`,
    );
  });

  afterAll(async () => {
    await rm(siteDocsDir, { recursive: true, force: true });
  });

  it("lists a page's alsoKnownAs names, not its old URLs, as its aliases", async () => {
    const { documents } = await discoverDocuments({ siteDocsDir });
    const pattern = documents.find(
      (doc) => doc.route === "/salt/patterns/formatted-input",
    );
    expect(pattern.aliases).toEqual(["Input mask", "Phone number"]);
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
      'export * from "./Add";\nexport * from "./AddSolid";\nexport * from "./Success";\n',
    );
    await writeFile(
      path.join(icons, "Add.tsx"),
      "export const AddIcon = forwardRef(() => null);\n",
    );
    await writeFile(
      path.join(icons, "AddSolid.tsx"),
      "export const AddSolidIcon = forwardRef(() => null);\n",
    );
    await writeFile(
      path.join(root, "synonyms.json"),
      JSON.stringify([
        { iconName: "add", synonym: ["create", " Plus", "plus", "add"] },
        { iconName: "success", synonym: ["tick"] },
      ]),
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

  it("lists icons with their other words and deprecations", async () => {
    const icons = await collectIcons(path.join(root, "icons"), {
      synonymsFile: path.join(root, "synonyms.json"),
    });
    expect(icons).toEqual([
      { name: "AddIcon", deprecated: undefined, synonyms: ["create", "plus"] },
      {
        name: "AddSolidIcon",
        deprecated: undefined,
        synonyms: ["create", "plus"],
      },
      {
        name: "SuccessIcon",
        deprecated: "since 1.13.0. Use `CheckmarkIcon` instead.",
        synonyms: [],
      },
    ]);
    const [page, ...parts] = renderIconReference({
      icons,
      packageVersion: "1.0.0",
      links: { icon: "components/icon.md" },
    });
    expect(parts).toEqual([]);
    expect(page.docPath).toBe("icons.md");
    expect(page.markdown).toContain(
      "- `AddIcon`, `AddSolidIcon`: create, plus\n",
    );
    expect(page.markdown).not.toContain("- `AddSolidIcon`");
    expect(page.markdown).toContain(
      "- `SuccessIcon`: deprecated since 1.13.0. Use `CheckmarkIcon` instead.",
    );
  });

  it("splits a long icon list into linked parts", async () => {
    const icons = await collectIcons(path.join(root, "icons"), {
      synonymsFile: path.join(root, "synonyms.json"),
    });
    const files = renderIconReference({
      icons,
      packageVersion: "1.0.0",
      links: { icon: "components/icon.md" },
      lineBudget: 1,
    });
    expect(files.map((file) => file.docPath)).toEqual([
      "icons.md",
      "icons/part-1.md",
      "icons/part-2.md",
    ]);
    expect(files[0].markdown).toContain(
      "- [`AddIcon` to `AddSolidIcon`](icons/part-1.md): 2 icons.",
    );
    expect(files[2].markdown).toContain(
      "Part 2 of 2 of the [icon list](../icons.md)",
    );
    expect(files[2].markdown).toContain("- `SuccessIcon`: deprecated");
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
    themes: new Set(["legacy", "next", "salt-interim"]),
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
