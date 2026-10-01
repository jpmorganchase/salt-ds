import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { createExampleResolver, exportsName } from "../examples.mjs";

const roots = [];

async function createExamples(files) {
  const root = await mkdtemp(path.join(tmpdir(), "salt-agent-examples-"));
  roots.push(root);
  for (const [file, content] of Object.entries(files)) {
    const target = path.join(root, file);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, content);
  }
  return createExampleResolver({ examplesDir: root });
}

afterEach(async () => {
  await Promise.all(
    roots.splice(0).map((root) => rm(root, { recursive: true, force: true })),
  );
});

describe("createExampleResolver", () => {
  it("resolves an example file and the local files it imports", async () => {
    const examples = await createExamples({
      "button/Primary.tsx":
        'import "./styles.css";\nexport const Primary = () => null;\n',
      "button/styles.css": ".primary {}\n",
    });
    const example = await examples.resolve("button", "Primary");
    expect(example.entry).toMatchObject({
      displayPath: "button/Primary.tsx",
      isModule: false,
    });
    expect(example.support).toEqual([
      expect.objectContaining({
        kind: "file",
        displayPath: "./styles.css",
        examplePath: "button/styles.css",
      }),
    ]);
  });

  it("resolves a named export of a module's index.tsx", async () => {
    const examples = await createExamples({
      "patterns/forms/index.tsx":
        'import { fields } from "./fields";\nexport const Standard = () => fields;\n',
      "patterns/forms/fields.ts": "export const fields = [];\n",
    });
    const example = await examples.resolve("patterns/forms", "Standard");
    expect(example.entry).toMatchObject({
      displayPath: "patterns/forms/index.tsx",
      isModule: true,
    });
    expect(example.support.map((file) => file.displayPath)).toEqual([
      "./fields.ts",
    ]);
    expect(await examples.resolve("patterns/forms", "Missing")).toEqual({
      error: "Example patterns/forms/index.tsx has no Missing export.",
    });
  });

  it("marks large supporting files, which are linked rather than shown", async () => {
    const examples = await createExamples({
      "nav/Default.tsx":
        'import { items } from "./data";\nexport const Default = () => items;\n',
      "nav/data.ts": `export const items = "${"x".repeat(9000)}";\n`,
    });
    const { support } = await examples.resolve("nav", "Default");
    expect(support).toEqual([
      expect.objectContaining({ examplePath: "nav/data.ts", large: true }),
    ]);
  });

  it("reports missing examples", async () => {
    const examples = await createExamples({});
    expect(await examples.resolve("button", "Primary")).toEqual({
      error: "Example button/Primary.tsx does not exist in site/src/examples.",
    });
  });
});

describe("exportsName", () => {
  it("finds declared and listed exports", () => {
    expect(exportsName("export const Standard = 1;", "Standard")).toBe(true);
    expect(exportsName("export function Compact() {}", "Compact")).toBe(true);
    expect(
      exportsName("const A = 1;\nexport { A as Renamed };", "Renamed"),
    ).toBe(true);
    expect(exportsName("export const StandardLayout = 1;", "Standard")).toBe(
      false,
    );
  });
});
