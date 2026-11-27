import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  highlightExampleSource,
  listExampleSources,
  readExampleSource,
} from "./exampleSource";

let examplesDir: string;

beforeAll(async () => {
  examplesDir = await mkdtemp(path.join(tmpdir(), "salt-examples-"));
  await mkdir(path.join(examplesDir, "button", "data"), { recursive: true });
  await writeFile(
    path.join(examplesDir, "button", "Primary.tsx"),
    "export const Primary = () => <button>Hi</button>;\n\n",
  );
  await writeFile(path.join(examplesDir, "button", "index.ts"), "");
  await writeFile(path.join(examplesDir, "button", "styles.css"), "");
  await writeFile(path.join(examplesDir, "README.md"), "");
});

afterAll(() => rm(examplesDir, { recursive: true, force: true }));

describe("listExampleSources", () => {
  it("lists only top-level TSX files in example folders", async () => {
    expect(await listExampleSources(examplesDir)).toEqual([
      { componentName: "button", exampleName: "Primary" },
    ]);
  });
});

describe("readExampleSource", () => {
  it("reads an example", async () => {
    expect(
      await readExampleSource(
        { componentName: "button", exampleName: "Primary" },
        examplesDir,
      ),
    ).toContain("export const Primary");
  });

  it("returns undefined for a missing example", async () => {
    expect(
      await readExampleSource(
        { componentName: "button", exampleName: "Missing" },
        examplesDir,
      ),
    ).toBeUndefined();
  });

  it("rejects names that could leave the examples folder", async () => {
    expect(
      await readExampleSource(
        { componentName: "..", exampleName: "Primary" },
        examplesDir,
      ),
    ).toBeUndefined();
  });
});

describe("highlightExampleSource", () => {
  it("emits light and dark colours as CSS variables without trailing lines", async () => {
    const html = await highlightExampleSource("const a = 1;\n\n");
    expect(html).toContain("--shiki-light");
    expect(html).toContain("--shiki-dark");
    expect(html).not.toMatch(/<span class="line"><\/span><\/code>/);
  });
});
