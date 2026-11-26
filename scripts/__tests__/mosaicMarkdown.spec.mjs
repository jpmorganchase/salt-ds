import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { getMarkdownRoute } from "../../site/src/lib/markdownRoutes";
import { createMarkdownComponents } from "../../site/src/mosaic-plugins/markdownComponents.mjs";

const temporaryDirs = [];

async function fixture() {
  const directory = await mkdtemp(path.join(os.tmpdir(), "salt-markdown-"));
  temporaryDirs.push(directory);
  const examplesDir = path.join(directory, "examples");
  const propsDir = path.join(directory, "props");
  await mkdir(path.join(examplesDir, "button"), { recursive: true });
  await mkdir(propsDir);
  return {
    examplesDir,
    propsDir,
    components: createMarkdownComponents({ examplesDir, propsDir }),
  };
}

afterEach(async () => {
  await Promise.all(
    temporaryDirs
      .splice(0)
      .map((directory) => rm(directory, { recursive: true, force: true })),
  );
});

describe("Mosaic Markdown exports", () => {
  it("includes the example's actual source and a link to supporting files", async () => {
    const { examplesDir, components } = await fixture();
    const source =
      'import { Button } from "@salt-ds/core";\nexport const Default = () => <Button>Save</Button>;\n';
    await writeFile(path.join(examplesDir, "button", "Default.tsx"), source);

    const markdown = await components.LivePreview({
      attributes: { componentName: "button", exampleName: "Default" },
    });
    expect(markdown).toContain(`\`\`\`tsx\n${source}\`\`\``);
    expect(markdown).toContain(
      "https://github.com/jpmorganchase/salt-ds/tree/main/site/src/examples/button",
    );
  });

  it("keeps example backticks inside the code fence", async () => {
    const { examplesDir, components } = await fixture();
    await writeFile(
      path.join(examplesDir, "button", "Default.tsx"),
      'const markdown = "```tsx";',
    );
    const markdown = await components.LivePreview({
      attributes: { componentName: "button", exampleName: "Default" },
    });
    expect(markdown).toContain('````tsx\nconst markdown = "```tsx";\n````');
  });

  it("renders generated prop metadata without breaking Markdown tables", async () => {
    const { propsDir, components } = await fixture();
    const props = [
      {
        displayName: "Button",
        props: {
          appearance: {
            name: "appearance",
            type: { name: '"solid" | "bordered"' },
            required: true,
            description: "First line\nSecond line with | a pipe",
            defaultValue: { value: '"solid"' },
          },
        },
      },
    ];
    await writeFile(
      path.join(propsDir, "core-props.json"),
      JSON.stringify(props),
    );
    const markdown = await components.PropsTable({
      attributes: { componentName: "Button" },
    });
    expect(markdown).toContain(
      '| ` appearance ` | ` "solid" \\| "bordered" ` | Yes |',
    );
    expect(markdown).toContain("First line<br />Second line with \\| a pipe");
    expect(markdown).toContain('` "solid" `');

    props[0].props.appearance.description = "Updated API description";
    await writeFile(
      path.join(propsDir, "core-props.json"),
      JSON.stringify(props),
    );
    expect(
      await components.PropsTable({ attributes: { componentName: "Button" } }),
    ).toContain("Updated API description");
  });

  it("reports absent generated API data instead of silently dropping it", async () => {
    const { propsDir, components } = await fixture();
    await writeFile(path.join(propsDir, "core-props.json"), "[]");
    await expect(
      components.PropsTable({ attributes: { componentName: "Button" } }),
    ).rejects.toThrow("No generated props for core/Button");
  });

  it("requires literal names within the example and props directories", async () => {
    const { components } = await fixture();
    await expect(
      components.LivePreview({
        attributes: { componentName: "../private", exampleName: "Default" },
      }),
    ).rejects.toThrow("Expected a literal componentName");
    await expect(
      components.PropsTable({
        attributes: { componentName: { expression: "getName()" } },
      }),
    ).rejects.toThrow("Expected a literal componentName");
  });
});

describe("Markdown URL handling", () => {
  it("serves explicit Markdown paths, the indexes and legacy documentation aliases", () => {
    expect(getMarkdownRoute("/llms.txt")).toBe("/llms.txt");
    expect(getMarkdownRoute("/llms-full.txt")).toBe("/llms-full.txt");
    expect(getMarkdownRoute("/salt/components/button/examples.md")).toBe(
      "/salt/components/button/examples",
    );
    expect(getMarkdownRoute("/components/button/examples.md")).toBe(
      "/salt/components/button/examples",
    );
    expect(getMarkdownRoute("/getting-started.md")).toBe(
      "/salt/getting-started",
    );
  });

  it("leaves ordinary documentation and asset URLs unchanged", () => {
    expect(getMarkdownRoute("/components/button")).toBeUndefined();
    expect(getMarkdownRoute("/salt")).toBeUndefined();
    expect(getMarkdownRoute("/salt/index")).toBeUndefined();
    expect(getMarkdownRoute("/search-records.json")).toBeUndefined();
  });
});
