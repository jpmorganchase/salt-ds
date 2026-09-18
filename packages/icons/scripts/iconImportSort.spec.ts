import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";
import {
  breakPascalCasingWithSpace,
  importSortPredicate,
  svgFileNameToComponentName,
} from "./iconImportSort.mjs";

const scriptsRoot = path.dirname(fileURLToPath(import.meta.url));
const svgRoot = path.resolve(scriptsRoot, "../src/SVG");
const storyPath = path.resolve(scriptsRoot, "../stories/icon.all.ts");
const generatorPath = path.resolve(scriptsRoot, "generateIcons.mjs");
const helperUrl = pathToFileURL(
  path.resolve(scriptsRoot, "iconImportSort.mjs"),
).href;

function svgComponentNames(): string[] {
  return fs
    .readdirSync(svgRoot, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".svg"))
    .map((entry) => `${svgFileNameToComponentName(entry.name)}Icon`);
}

function generatedComponentNames(): string[] {
  const source = fs.readFileSync(storyPath, "utf8");
  const start = source.indexOf("export const allIcons = [");
  const end = source.indexOf("];", start);
  expect(start).toBeGreaterThanOrEqual(0);
  expect(end).toBeGreaterThan(start);
  return [...source.slice(start, end).matchAll(/\b([A-Za-z0-9]+Icon),/gu)].map(
    ([, name]) => name,
  );
}

function controlledLocaleOrder(locale: string, names: string[]) {
  const script = `
    const NativeCollator = Intl.Collator;
    const injectedLocale = ${JSON.stringify(locale)};
    class ControlledCollator extends NativeCollator {
      constructor(locales, options) {
        super(locales === undefined || (Array.isArray(locales) && locales.length === 0) ? injectedLocale : locales, options);
      }
    }
    Object.defineProperty(Intl, "Collator", { configurable: true, value: ControlledCollator, writable: true });
    const helper = await import(${JSON.stringify(helperUrl)});
    const names = JSON.parse(process.argv[1]);
    process.stdout.write(JSON.stringify({ locale: new Intl.Collator().resolvedOptions().locale, order: [...names].sort(helper.importSortPredicate) }));
  `;
  const result = spawnSync(
    process.execPath,
    ["--input-type=module", "--eval", script, JSON.stringify(names)],
    { encoding: "utf8", windowsHide: true },
  );
  expect(result.error).toBeUndefined();
  expect(result.status, result.stderr).toBe(0);
  return JSON.parse(result.stdout) as { locale: string; order: string[] };
}

describe("icon import sort", () => {
  it("matches generated icons and the fixed English natural order", () => {
    const svgNames = svgComponentNames();
    const generatedNames = generatedComponentNames();
    const uniqueSvgNames = new Set(svgNames);
    const uniqueGeneratedNames = new Set(generatedNames);

    expect(uniqueSvgNames.size).toBe(svgNames.length);
    expect(uniqueGeneratedNames.size).toBe(generatedNames.length);
    expect([...uniqueGeneratedNames].sort()).toEqual(
      [...uniqueSvgNames].sort(),
    );

    const production = [...svgNames].sort(importSortPredicate);
    const oracle = [...svgNames].sort((left, right) =>
      new Intl.Collator("en", { numeric: true }).compare(
        breakPascalCasingWithSpace(left),
        breakPascalCasingWithSpace(right),
      ),
    );
    expect(generatedNames).toEqual(production);
    expect(production).toEqual(oracle);
    expect([...svgNames].sort(importSortPredicate)).toEqual(production);
    expect(production.indexOf("Forward5Icon")).toBeLessThan(
      production.indexOf("Forward10Icon"),
    );
    expect(production.indexOf("Replay5Icon")).toBeLessThan(
      production.indexOf("Replay10Icon"),
    );
    expect(production.indexOf("BuildReportIcon")).toBeLessThan(
      production.indexOf("BuildingIcon"),
    );

    const alternateOrders = ["cs", "lt"].map((locale) =>
      [...svgNames].sort((left, right) =>
        new Intl.Collator(locale, { numeric: true }).compare(
          breakPascalCasingWithSpace(left),
          breakPascalCasingWithSpace(right),
        ),
      ),
    );
    expect(
      alternateOrders.some(
        (order) => order.join("\n") !== production.join("\n"),
      ),
    ).toBe(true);
  });

  it("is independent of three controlled default locales", () => {
    const names = svgComponentNames();
    const results = ["en", "cs", "lt"].map((locale) =>
      controlledLocaleOrder(locale, names),
    );
    expect(new Set(results.map(({ locale }) => locale)).size).toBe(3);
    expect(results[1].order).toEqual(results[0].order);
    expect(results[2].order).toEqual(results[0].order);
  });

  it("keeps the side-effecting generator wired to the pure comparator", () => {
    const source = fs.readFileSync(generatorPath, "utf8");
    expect(source).toContain('from "./iconImportSort.mjs"');
    expect(source.match(/\.sort\(importSortPredicate\)/gu)).toHaveLength(3);
    expect(source).not.toContain("new Intl.Collator");
  });
});
