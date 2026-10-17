import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  convertedTokenNames,
  cssDir,
  generateRemUnits,
  outputPath,
  parseRules,
  SOURCES,
} from "../generate-rem-units.mjs";

const listCssFiles = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return listCssFiles(entryPath);
    return entry.name.endsWith(".css") ? [entryPath] : [];
  });

describe("rem-units.css", () => {
  it("matches the theme's px tokens", () => {
    expect(
      fs.readFileSync(outputPath, "utf8"),
      "rem-units.css is out of date. Run `yarn workspace @salt-ds/theme generate:rem-units`.",
    ).toBe(generateRemUnits());
  });

  it("covers every stylesheet that declares a converted token", () => {
    const names = convertedTokenNames();
    const sources = new Set(SOURCES.map(([file]) => path.join(cssDir, file)));
    const uncovered = listCssFiles(cssDir)
      .filter(
        (file) =>
          !sources.has(file) &&
          !file.startsWith(path.join(cssDir, "experimental")),
      )
      .flatMap((file) =>
        parseRules(fs.readFileSync(file, "utf8")).flatMap(({ lines }) =>
          lines.flatMap((line) =>
            typeof line === "object" && names.has(line.name)
              ? [`${path.relative(cssDir, file)}: ${line.name}`]
              : [],
          ),
        ),
      );

    expect(
      uncovered,
      "Add these stylesheets to SOURCES in generate-rem-units.mjs",
    ).toEqual([]);
  });

  it("converts px to rem and keeps hairlines in px", () => {
    const css = generateRemUnits();

    expect(css).toContain(
      ".salt-theme.salt-density-medium {\n  --salt-size-adornment: 0.5rem;",
    );
    expect(css).toMatch(/--salt-size-base: 1\.75rem;/);
    expect(css).not.toMatch(/--salt-size-fixed-\d+:/);
    expect(css).not.toMatch(/--salt-spacing-fixed-\d+:/);
    expect(css).not.toMatch(/--salt-size-border:/);
  });
});
