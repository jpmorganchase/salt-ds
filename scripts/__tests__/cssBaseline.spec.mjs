import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import esbuild from "esbuild";
import postcss from "postcss";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  esbuildCssBaseline,
  postcssCssBaseline,
  transformCss,
  transformCssFile,
} from "../cssBaseline.mjs";

const lower = (css) => transformCss(css, "test.css");

describe("transformCss", () => {
  it("adds :-webkit-any() fallbacks for :is() and selector lists in :not()", () => {
    const css = lower(
      ".a :is(.b, .c) { color: red } .d:not(.e, .f) { color: red }",
    );
    expect(css).toContain(".a :-webkit-any(.b, .c)");
    expect(css).toContain(".a :is(.b, .c)");
    expect(css).toContain(".d:not(:-webkit-any(.e, .f))");
  });

  it("flattens nesting", () => {
    expect(lower(".a { &:hover { color: red } }")).toMatch(/^\.a:hover \{/m);
  });

  it("expands properties older browsers lack", () => {
    const css = lower(".a { inset: 0; margin-inline: 1px 2px }");
    expect(css).not.toMatch(/\binset:/);
    expect(css).toMatch(/\btop: 0/);
    expect(css).toContain("margin-inline-start: 1px");
    expect(css).toContain("margin-inline-end: 2px");
  });

  it("adds vendor prefixes the baseline needs", () => {
    expect(lower(".a { mask: url(a.svg) }")).toContain("-webkit-mask:");
  });

  it("keeps direction-dependent properties as authored", () => {
    const css = lower(
      ".a { inset-inline-start: 0; inset-inline-end: 1px; inset-inline: 0 1px; border-start-end-radius: 2px }",
    );
    expect(css).toContain("inset-inline-start: 0");
    expect(css).toContain("inset-inline-end: 1px");
    expect(css).toContain("inset-inline: 0 1px");
    expect(css).toContain("border-start-end-radius: 2px");
    expect(css).not.toContain(":lang(");
  });

  it("leaves custom properties that share those names alone", () => {
    expect(lower(".a { --a-inset-inline-start: 0 }")).toContain(
      "--a-inset-inline-start: 0",
    );
  });
});

describe("bundler plugins", () => {
  let dir;

  beforeEach(async () => {
    dir = await mkdtemp(path.join(tmpdir(), "css-baseline-"));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it("transformCssFile writes the lowered CSS", async () => {
    const from = path.join(dir, "in.css");
    const to = path.join(dir, "out.css");
    await writeFile(from, ".a { inset: 0 }");
    await transformCssFile(from, to);
    expect(await readFile(to, "utf8")).not.toMatch(/\binset:/);
  });

  it("the PostCSS plugin lowers Salt CSS and skips node_modules", async () => {
    const css = ".a { inset: 0 }";
    const salt = await postcss([postcssCssBaseline()]).process(css, {
      from: path.join(dir, "packages/core/src/a.css"),
    });
    const vendor = await postcss([postcssCssBaseline()]).process(css, {
      from: path.join(dir, "node_modules/vendor/a.css"),
    });
    expect(salt.css).not.toMatch(/\binset:/);
    expect(vendor.css).toBe(css);
  });

  it("the esbuild plugin lowers each imported file", async () => {
    await writeFile(path.join(dir, "part.css"), ".a { inset: 0 }");
    await writeFile(path.join(dir, "entry.css"), '@import "./part.css";');
    const result = await esbuild.build({
      entryPoints: [path.join(dir, "entry.css")],
      bundle: true,
      write: false,
      plugins: [esbuildCssBaseline()],
    });
    expect(result.outputFiles[0].text).not.toMatch(/\binset:/);
  });
});
