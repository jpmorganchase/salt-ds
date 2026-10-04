import { describe, expect, it } from "vitest";
import { EXAMPLE_NODE, stringifyMarkdown, u } from "../mdx.mjs";
import { placeExamples } from "../placement.mjs";

const sharedCss = {
  kind: "file",
  displayPath: "./styles.css",
  absolutePath: "/examples/button/styles.css",
  examplePath: "button/styles.css",
  language: "css",
  code: ".root {}\n",
};

function example(name, { code = `export const ${name} = 1;\n`, support } = {}) {
  return {
    type: EXAMPLE_NODE,
    name,
    entry: {
      language: "tsx",
      code,
      absolutePath: `/examples/button/${name}.tsx`,
      displayPath: `button/${name}.tsx`,
      isModule: false,
    },
    support: support ?? [sharedCss],
  };
}

function moduleExample(name) {
  return {
    type: EXAMPLE_NODE,
    name,
    entry: {
      language: "tsx",
      code: "export const Standard = 1;\nexport const Compact = 2;\n",
      absolutePath: "/examples/patterns/forms/index.tsx",
      displayPath: "patterns/forms/index.tsx",
      isModule: true,
    },
    support: [],
  };
}

function place(children, budget) {
  const result = placeExamples(children, {
    title: "Button",
    docPath: "components/button.md",
    budget,
  });
  return {
    markdown: stringifyMarkdown({ type: "root", children: result.children }),
    files: new Map(result.files.map((file) => [file.docPath, file.markdown])),
  };
}

describe("placeExamples", () => {
  it("shows examples inline with each supporting file once", () => {
    const { markdown, files } = place(
      [
        u.heading(2, [u.text("Accented")]),
        example("Accented"),
        u.blockquote([example("Neutral")]),
      ],
      Number.POSITIVE_INFINITY,
    );
    expect(markdown).toContain(
      "_Example:_ `Accented`\n\n```tsx\nexport const Accented = 1;\n```",
    );
    expect(markdown).toContain(
      "Supporting file `./styles.css`:\n\n```css\n.root {}\n```",
    );
    expect(markdown).toContain(
      "> Supporting file `./styles.css` is shown above.",
    );
    expect(files.size).toBe(0);
  });

  it("shows a module's source once for all of its examples", () => {
    const { markdown } = place(
      [moduleExample("Standard"), moduleExample("Compact")],
      Number.POSITIVE_INFINITY,
    );
    expect(markdown).toContain(
      "_Example:_ `Standard`, exported by `patterns/forms/index.tsx`:\n\n```tsx",
    );
    expect(markdown).toContain(
      "_Example:_ `Compact`, exported by `patterns/forms/index.tsx` (shown above).",
    );
    expect(markdown.match(/```tsx/g)).toHaveLength(1);
  });

  it("moves the largest examples off a long page, keeping the first", () => {
    const large = `export const Large = "${"x".repeat(2000)}";\n`;
    const { markdown, files } = place(
      [example("Basic"), example("Large", { code: large }), example("Small")],
      1500,
    );
    expect(markdown).toContain("_Example:_ `Basic`\n\n```tsx");
    expect(markdown).toContain(
      "_Example:_ `Large` ([source](./button/examples/large.md)).",
    );
    expect(markdown).toContain("_Example:_ `Small`\n\n```tsx");
    expect([...files.keys()].sort()).toEqual([
      "components/button/examples/files/button-styles-css.md",
      "components/button/examples/large.md",
    ]);
    const moved = files.get("components/button/examples/large.md");
    expect(moved).toContain("# Button example: Large");
    expect(moved).toContain(
      "Source of the `Large` example on the [Button](../../button.md) page.",
    );
    expect(moved).toContain(large.trimEnd());
    // Shared with other examples, so the moved example links to it.
    expect(moved).toContain(
      "Supporting file `./styles.css` is in [button/styles.css](./files/button-styles-css.md).",
    );
  });

  it("writes supporting files shared by moved examples once", () => {
    const { markdown, files } = place(
      [example("First"), example("Second")],
      10,
    );
    expect(markdown).toContain(
      "_Example:_ `First` ([source](./button/examples/first.md)).",
    );
    expect([...files.keys()].sort()).toEqual([
      "components/button/examples/files/button-styles-css.md",
      "components/button/examples/first.md",
      "components/button/examples/second.md",
    ]);
    expect(files.get("components/button/examples/second.md")).toContain(
      "Supporting file `./styles.css` is in [button/styles.css](./files/button-styles-css.md).",
    );
    expect(
      files.get("components/button/examples/files/button-styles-css.md"),
    ).toContain(
      "# Button example file: button/styles.css\n\nSupporting file for examples on the [Button](../../../button.md) page.\n\n```css\n.root {}\n```",
    );
  });
});

describe("placeExamples with large files and repeated examples", () => {
  it("links large supporting files instead of showing them", () => {
    const data = {
      ...sharedCss,
      displayPath: "./data.tsx",
      absolutePath: "/examples/button/data.tsx",
      examplePath: "button/data.tsx",
      language: "tsx",
      code: "export const rows = [];\n",
      large: true,
    };
    const { markdown, files } = place(
      [example("Accented", { support: [data] })],
      Number.POSITIVE_INFINITY,
    );
    expect(markdown).toContain(
      "Supporting file `./data.tsx` is in [button/data.tsx](./button/examples/files/button-data-tsx.md).",
    );
    expect(
      files.get("components/button/examples/files/button-data-tsx.md"),
    ).toContain("```tsx\nexport const rows = [];\n```");
  });

  it("writes an example shown twice on a page once", () => {
    const { markdown, files } = place(
      [example("Accented"), example("Solid"), example("Accented")],
      10,
    );
    expect([...files.keys()]).toContain(
      "components/button/examples/accented.md",
    );
    expect([...files.keys()]).not.toContain(
      "components/button/examples/accented-2.md",
    );
    expect(
      markdown.match(/\[source\]\(\.\/button\/examples\/accented\.md\)/g),
    ).toHaveLength(2);
  });

  it("names each example once in a moved module's file", () => {
    const { files } = place(
      [
        moduleExample("Standard"),
        moduleExample("Compact"),
        moduleExample("Standard"),
      ],
      10,
    );
    expect(files.get("components/button/examples/forms.md")).toContain(
      "Source of the `Standard` and `Compact` examples on the [Button](../../button.md) page.",
    );
  });
});
