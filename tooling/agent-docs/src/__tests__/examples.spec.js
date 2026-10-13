import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { createExampleResolver, unshownPatternExamples } from "../examples.mjs";

const roots = [];

async function writeExamples(files) {
  const root = await mkdtemp(path.join(tmpdir(), "salt-agent-examples-"));
  roots.push(root);
  for (const [file, content] of Object.entries(files)) {
    const target = path.join(root, file);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, content);
  }
  return root;
}

async function createExamples(files) {
  return createExampleResolver({ examplesDir: await writeExamples(files) });
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
    });
    expect(example.support).toEqual([
      expect.objectContaining({
        kind: "file",
        displayPath: "./styles.css",
        examplePath: "button/styles.css",
      }),
    ]);
  });

  it("resolves pattern examples the same way, one file per example", async () => {
    const examples = await createExamples({
      "patterns/forms/index.ts": 'export * from "./Standard";\n',
      "patterns/forms/Standard.tsx":
        'import { fields } from "./fields";\nexport const Standard = () => fields;\n',
      "patterns/forms/fields.ts": "export const fields = [];\n",
    });
    const example = await examples.resolve("patterns/forms", "Standard");
    expect(example.entry).toMatchObject({
      displayPath: "patterns/forms/Standard.tsx",
    });
    expect(example.support.map((file) => file.displayPath)).toEqual([
      "./fields.ts",
    ]);
    expect(await examples.resolve("patterns/forms", "Missing")).toEqual({
      error:
        "Example patterns/forms/Missing.tsx does not exist in site/src/examples.",
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

  it("ignores imports in comments", async () => {
    const examples = await createExamples({
      "button/Primary.tsx":
        '// import { Old } from "./Old";\n/* import "@salt-ds/core/src/button"; */\nimport { fields } from "./fields";\nexport const Primary = () => fields;\n',
      "button/fields.ts": "export const fields = [];\n",
    });
    const example = await examples.resolve("button", "Primary");
    expect(example.error).toBeUndefined();
    expect(example.support.map((file) => file.displayPath)).toEqual([
      "./fields.ts",
    ]);
  });

  it("reports imports from unpublished package folders", async () => {
    const examples = await createExamples({
      "date-picker/Custom.tsx":
        'import { Helper } from "./Helper";\nexport const Custom = () => Helper;\n',
      "date-picker/Helper.tsx":
        'import { Panel } from "@salt-ds/date-components/stories/Panel";\nexport const Helper = Panel;\n',
    });
    expect(await examples.resolve("date-picker", "Custom")).toEqual({
      error:
        "Example date-picker/Custom imports @salt-ds/date-components/stories/Panel, which isn't published, so readers can't use it. Copy what it needs into the example's folder.",
    });
  });

  it("reports missing examples", async () => {
    const examples = await createExamples({});
    expect(await examples.resolve("button", "Primary")).toEqual({
      error: "Example button/Primary.tsx does not exist in site/src/examples.",
    });
  });
});

describe("unshownPatternExamples", () => {
  it("lists pattern examples that no page resolved", async () => {
    const examplesDir = await writeExamples({
      "patterns/forms/index.ts":
        'export * from "./Compact";\nexport * from \'./Standard\';\nexport * from "./types";\n// export * from "./Old";\n',
      "patterns/forms/Compact.tsx": "export const Compact = () => null;\n",
      "patterns/forms/Standard.tsx": "export const Standard = () => null;\n",
      "patterns/forms/types.ts": "export type Field = string;\n",
      "patterns/forms/Old.tsx": "export const Old = () => null;\n",
      "button/index.ts": 'export * from "./Primary";\n',
      "button/Primary.tsx": "export const Primary = () => null;\n",
    });
    const examples = createExampleResolver({ examplesDir });
    await examples.resolve("patterns/forms", "Compact");
    expect(
      await unshownPatternExamples({ examplesDir, shown: examples.shown }),
    ).toEqual(["patterns/forms/Standard"]);
  });
});
