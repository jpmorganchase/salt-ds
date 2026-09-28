import { describe, expect, it } from "vitest";
import { convertMdx, stringifyMarkdown, stripFragments } from "../mdx.mjs";

function createContext(overrides = {}) {
  const errors = [];
  const warnings = [];
  const notes = [];
  return {
    sitePath: "/salt/components/button/usage",
    packageName: "@salt-ds/core",
    docPath: "components/button.md",
    links: { resolve: (url) => url },
    examples: { resolve: async () => ({ error: "No examples." }) },
    props: { get: () => undefined },
    shownSupport: new Set(),
    referenceLink: (packageName, docPath) => `${packageName}/docs/${docPath}`,
    error: (_node, message) => errors.push(message),
    warn: (_node, message) => warnings.push(message),
    note: (_node, message) => notes.push(message),
    errors,
    warnings,
    notes,
    ...overrides,
  };
}

async function toMarkdown(source, ctx = createContext()) {
  return stringifyMarkdown({
    type: "root",
    children: await convertMdx(source, ctx),
  });
}

describe("convertMdx", () => {
  it("drops ESM and comments but keeps prose", async () => {
    const markdown = await toMarkdown(
      'import x from "y";\n\n## Title\n\n{/* A comment */}\n\nSome **text**.',
    );
    expect(markdown).toBe("## Title\n\nSome **text**.\n");
  });

  it("inlines LivePreview examples and their supporting files once", async () => {
    const ctx = createContext({
      examples: {
        resolve: async (componentName, exampleName) => ({
          entry: {
            language: "tsx",
            code: `export const ${exampleName} = 1;\n`,
          },
          support: [
            {
              kind: "file",
              displayPath: "./index.module.css",
              absolutePath: `/examples/${componentName}/index.module.css`,
              language: "css",
              code: ".root {}\n",
            },
            { kind: "asset", displayPath: "../assets/logo.svg" },
          ],
        }),
      },
    });
    const markdown = await toMarkdown(
      '<LivePreview componentName="button" exampleName="Accented" />\n\n<LivePreview componentName="button" exampleName="Neutral" />',
      ctx,
    );
    expect(markdown).toContain("_Example:_ `Accented`");
    expect(markdown).toContain("```tsx\nexport const Accented = 1;\n```");
    expect(markdown).toContain(
      "Supporting file `./index.module.css`:\n\n```css\n.root {}\n```",
    );
    expect(markdown).toContain(
      "Supporting file `./index.module.css` is shown above.",
    );
    expect(markdown).toContain("Asset `../assets/logo.svg` (not included).");
    expect(ctx.errors).toEqual([]);
  });

  it("reports unresolved examples", async () => {
    const ctx = createContext();
    await toMarkdown('<LivePreview componentName="x" exampleName="Y" />', ctx);
    expect(ctx.errors).toEqual(["No examples."]);
  });

  it("renders props tables with literal types, tags and defaults", async () => {
    const ctx = createContext({
      props: {
        get: (packageDirectory, componentName) =>
          packageDirectory === "core" && componentName === "Button"
            ? {
                props: {
                  appearance: {
                    name: "appearance",
                    required: false,
                    type: {
                      name: "enum",
                      value: [{ value: '"solid"' }, { value: '"bordered"' }],
                    },
                    description:
                      "The appearance.\n@default solid\n@since 1.36.0.",
                  },
                  variant: {
                    name: "variant",
                    required: true,
                    type: { name: "string" },
                    description:
                      "Old prop.\n@deprecated since 1.36.0. Use `appearance`.\n\n| a | b |\n| - | - |",
                  },
                },
              }
            : undefined,
      },
    });
    const markdown = await toMarkdown(
      '<PropsTable componentName="Button" />',
      ctx,
    );
    expect(markdown).toContain(
      '| `appearance` | `"solid" \\| "bordered"` | `solid` | The appearance. Since 1.36.0. |',
    );
    expect(markdown).toContain(
      "| `variant` (required) | `string` | - | **Deprecated** since 1.36.0. Use `appearance`. Old prop. |",
    );
  });

  it("warns instead of failing when a PropsTable has no props", async () => {
    const ctx = createContext();
    const markdown = await toMarkdown(
      '<PropsTable componentName="useThing" />',
      ctx,
    );
    expect(markdown).toBe("");
    expect(ctx.warnings).toEqual([
      "No props found for useThing in packages/core.",
    ]);
  });

  it("converts keyboard controls to a list", async () => {
    const markdown = await toMarkdown(
      '<KeyboardControls>\n<KeyboardControl keyOrCombos={["Enter", "Space"]}>\n- Selects the item.\n</KeyboardControl>\n</KeyboardControls>',
    );
    expect(markdown).toBe("- **Enter or Space**\n  - Selects the item.\n");
  });

  it("labels guidance callouts and callouts like the site", async () => {
    const markdown = await toMarkdown(
      '<GuidanceCallout type="positive">\nUse short labels.\n</GuidanceCallout>\n\n<Callout status="warning">\nLegacy only.\n</Callout>',
    );
    expect(markdown).toBe(
      "> **Do**\n>\n> Use short labels.\n\n> **Warning**\n>\n> Legacy only.\n",
    );
  });

  it("keeps alt text and captions and notes images without alt text", async () => {
    const ctx = createContext();
    const markdown = await toMarkdown(
      '<Diagram src="/img/a.png" alt="A card" caption="Cards group content." />\n\n<Diagram src="/img/b.png" alt="" />',
      ctx,
    );
    expect(markdown).toBe("_Image: A card_ Cards group content.\n");
    expect(ctx.notes).toEqual(["<Diagram> /img/b.png has no alt text."]);
  });

  it("converts JSX tables to Markdown tables", async () => {
    const markdown = await toMarkdown(
      "<Table>\n  <THead>\n    <tr>\n      <th>Key</th>\n      <th>Action</th>\n    </tr>\n  </THead>\n  <TBody>\n    <tr>\n      <td><Kbd>Ctrl</Kbd> + <Kbd>S</Kbd></td>\n      <td>Saves   the\n   document</td>\n    </tr>\n  </TBody>\n</Table>",
    );
    expect(markdown).toBe(
      "| Key | Action |\n| - | - |\n| `Ctrl` + `S` | Saves the document |\n",
    );
  });

  it("links interactive galleries to reference docs", async () => {
    const markdown = await toMarkdown("<IconPreview />");
    expect(markdown).toBe(
      "Every icon is listed in the [icon list](@salt-ds/icons/docs/icons.md).\n",
    );
  });

  it("rewrites links through the resolver and drops asset links", async () => {
    const ctx = createContext({
      links: {
        resolve: (url) =>
          url === "/img/x.png"
            ? null
            : url === "../dialog"
              ? "./dialog.md"
              : url,
      },
    });
    const markdown = await toMarkdown(
      "See [dialogs](../dialog) and [the image](/img/x.png).",
      ctx,
    );
    expect(markdown).toBe("See [dialogs](./dialog.md) and the image.\n");
  });

  it("reports unsupported components", async () => {
    const ctx = createContext();
    await toMarkdown("<FancyWidget />", ctx);
    expect(ctx.errors).toEqual([
      "Unsupported MDX component <FancyWidget>. Add a handler to tooling/agent-docs/src/mdx.mjs.",
    ]);
  });
});

describe("stripFragments", () => {
  it("removes fragment includes and keeps line numbers", () => {
    const { source, fragments } = stripFragments(
      'Text\n:fragment{src="./fragments/feedback.mdx"}\nMore',
    );
    expect(source).toBe("Text\n\nMore");
    expect(fragments).toEqual([{ src: "./fragments/feedback.mdx", line: 2 }]);
  });
});
