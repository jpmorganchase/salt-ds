import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import {
  convertMdx,
  EXAMPLE_NODE,
  PROPS_NODE,
  stringifyMarkdown,
  stripFragments,
} from "../mdx.mjs";

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

  it("turns LivePreview into an example node for placement", async () => {
    const entry = { language: "tsx", code: "export const Accented = 1;\n" };
    const support = [{ kind: "asset", displayPath: "../assets/logo.svg" }];
    const ctx = createContext({
      examples: { resolve: async () => ({ entry, support }) },
    });
    const nodes = await convertMdx(
      '<LivePreview componentName="button" exampleName="Accented" />',
      ctx,
    );
    expect(nodes).toEqual([
      { type: EXAMPLE_NODE, name: "Accented", entry, support },
    ]);
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

  it("says when a component has no props of its own", async () => {
    const ctx = createContext({
      props: { get: () => ({ displayName: "CardContent", props: {} }) },
    });
    const markdown = await toMarkdown(
      '### `CardContent`\n\n<PropsTable componentName="CardContent" />',
      ctx,
    );
    expect(markdown).toBe(
      "### `CardContent`\n\n`CardContent` has no props of its own. It accepts the props of the element it renders; see its type declarations.\n",
    );
    expect(ctx.warnings).toEqual([]);
  });

  describe("what props tables leave out", () => {
    const components = {
      Cell: {
        displayName: "Cell",
        props: {
          value: {
            name: "value",
            required: false,
            type: { name: "Value" },
            description: "",
          },
        },
        inherited: {
          TdHTMLAttributes: ["colSpan", "rowSpan"],
          ImgHTMLAttributes: ["width"],
          HTMLAttributes: ["className"],
          AriaAttributes: ["aria-label"],
          DOMAttributes: ["onClick"],
          RefAttributes: ["ref"],
        },
      },
      CellIcon: {
        displayName: "CellIcon",
        props: {
          value: {
            name: "value",
            required: false,
            type: { name: "Value" },
            description: "",
          },
        },
        inherited: {
          // docgen credits a textarea's value to ButtonHTMLAttributes.
          ButtonHTMLAttributes: ["value"],
          HTMLAttributes: ["className"],
        },
      },
      Row: {
        displayName: "Row",
        props: {},
        inherited: { HTMLAttributes: ["id"], RefAttributes: ["ref"] },
      },
    };
    const props = {
      get: (_packageDirectory, name) => components[name],
      // Like the real provider, leaves out what the page has shown.
      typeDefinitions: (_packageDirectory, component, _types, shown) =>
        (component.displayName === "Row"
          ? []
          : [
              {
                name: "Value",
                kind: "alias",
                signature: "Value",
                text: "string | number",
              },
              { name: "Item", kind: "parameter", constraint: "object" },
              {
                name: "Big",
                kind: "interface",
                signature: "Big<T>",
                packageDirectory: "core",
              },
            ]
        ).filter(
          (definition) =>
            !shown.has(definition.name) && shown.add(definition.name),
        ),
      // The props interface names the element; CellIcon's names two.
      elementsOf: (_packageDirectory, component) =>
        component.displayName === "Cell" ? ["td"] : ["div", "textarea"],
    };

    it("says what a component inherits and defines its types once a page", async () => {
      const recorded = [];
      const ctx = createContext({
        props,
        subcomponents: (_packageDirectory, name) =>
          name === "Cell" ? ["CellIcon"] : [],
        recordComponent: (name) => recorded.push(name),
      });
      const markdown = await toMarkdown(
        '<PropsTable componentName="Cell" />\n\n<PropsTable componentName="Row" />',
        ctx,
      );
      expect(markdown).toBe(
        [
          "| Prop | Type | Default | Description |",
          "| - | - | - | - |",
          "| `value` | `Value` | - | - |",
          "",
          "It also accepts `<td>` attributes, such as `colSpan`, `rowSpan` and `width`, and `ref`, which the table leaves out. Types in this table: `Value` is `string | number`; `Item` is a type parameter (`extends object`) inferred from the props you pass; `Big<T>` is in the type declarations of `@salt-ds/core`.",
          "",
          "**`CellIcon`**, exported with `Cell`:",
          "",
          "| Prop | Type | Default | Description |",
          "| - | - | - | - |",
          "| `value` | `Value` | - | - |",
          "",
          "It also accepts HTML attributes, such as `value`, which the table leaves out.",
          "",
          "`Row` has no props of its own. It accepts HTML attributes and `ref`.",
          "",
        ].join("\n"),
      );
      expect(recorded).toEqual(["Cell", "CellIcon", "Row"]);
    });

    it("wraps each table and its parts' tables in a props node for placement", async () => {
      const ctx = createContext({
        props,
        subcomponents: (_packageDirectory, name) =>
          name === "Cell" ? ["CellIcon"] : [],
      });
      const nodes = await convertMdx(
        '<PropsTable componentName="Cell" />\n\n<PropsTable componentName="Row" />',
        ctx,
      );
      expect(
        nodes.map((node) => [node.type, node.names, node.children.length]),
      ).toEqual([
        // Cell's table and notes, then CellIcon's label, table and notes.
        [PROPS_NODE, ["Cell", "CellIcon"], 5],
        [PROPS_NODE, ["Row"], 1],
      ]);
    });
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

  it.each(["aria-hidden", 'aria-hidden="true"', "aria-hidden={true}"])(
    "treats an image with %s as decorative",
    async (attribute) => {
      const ctx = createContext();
      const markdown = await toMarkdown(
        `<Image src="/img/a.png" alt="Decoration" ${attribute} />\n\n<Image src="/img/b.png" ${attribute} />`,
        ctx,
      );
      expect(markdown).toBe("");
      expect(ctx.notes).toEqual([]);
    },
  );

  it("does not treat aria-hidden={false} as decorative", async () => {
    const ctx = createContext();
    const markdown = await toMarkdown(
      '<Image src="/img/a.png" alt="A card" aria-hidden={false} />',
      ctx,
    );
    expect(markdown).toBe("_Image: A card_\n");
  });

  it("leaves out a caption that repeats the alt text", async () => {
    const markdown = await toMarkdown(
      '<Diagram src="/img/a.png" alt="A card with a header" caption="A card with a header." />',
    );
    expect(markdown).toBe("_Image: A card with a header_\n");
  });

  it.each(["top", "bottom"])(
    "preserves diagram guidance in the website's %s order",
    async (position) => {
      const markdown = await toMarkdown(
        `<Diagram src="/form.png" alt="Form layout" contentPosition="${position}">\n\n### Labels\n\nKeep each label near its input.\n\n- Use a visible label.\n- Explain errors.\n\n</Diagram>`,
      );
      expect(markdown).toContain("### Labels");
      expect(markdown).toContain("Keep each label near its input.");
      expect(markdown).toContain("- Use a visible label.\n- Explain errors.");
      expect(markdown.indexOf("### Labels") < markdown.indexOf("_Image:")).toBe(
        position === "top",
      );
    },
  );

  it("keeps the Enterprise qualification in an inline sentence", async () => {
    const markdown = await toMarkdown(
      "Context Menu is <AgEnterpriseFeature/>.",
    );
    expect(markdown).toBe(
      "Context Menu is an [ag grid enterprise](https://www.ag-grid.com/react-data-grid/community-vs-enterprise/) feature.\n",
    );
  });

  it("preserves the real getting-started navigation cards", async () => {
    const source = await readFile(
      new URL(
        "../../../../site/docs/getting-started/index.mdx",
        import.meta.url,
      ),
      "utf8",
    );
    const ctx = createContext({
      links: { resolve: (url) => `${url}.md` },
    });
    const markdown = await toMarkdown(
      source.slice(source.indexOf("<QuickLinks")),
      ctx,
    );
    expect(markdown).toContain("[Developing](./developing.md)");
    expect(markdown).toContain("Learn how to install the Salt packages");
    expect(markdown).toContain("[Form integration](./form-integration.md)");
    expect(markdown).toContain("[AI coding agents](./ai-coding-agents.md)");
    expect(markdown.match(/^- /gm)).toHaveLength(8);
    expect(ctx.errors).toEqual([]);
  });

  it("uses explicit QuickLink children when both forms are present", async () => {
    const markdown = await toMarkdown(
      '<QuickLinks links={[{ title: "Unused", href: "/unused" }]}><QuickLink title="Forms" href="./forms">Form guidance</QuickLink></QuickLinks>',
    );
    expect(markdown).toBe("- [Forms](./forms): Form guidance\n");
  });

  it("rejects dynamic QuickLinks data instead of silently dropping it", async () => {
    const ctx = createContext();
    await toMarkdown("<QuickLinks links={getLinks()} />", ctx);
    expect(ctx.errors).toHaveLength(1);
    expect(ctx.errors[0]).toContain("literal objects");
  });

  it("keeps a disclosure's id as an anchor that links can target", async () => {
    const markdown = await toMarkdown(
      '<Disclosure id="legacy-theme" summary="Using the Legacy theme">\n\nUse `SaltProvider`.\n\n</Disclosure>',
    );
    expect(markdown).toBe(
      '<a id="legacy-theme"></a>\n\n**Using the Legacy theme**\n\nUse `SaltProvider`.\n',
    );
  });

  it("converts JSX tables to Markdown tables", async () => {
    const markdown = await toMarkdown(
      "<Table>\n  <THead>\n    <tr>\n      <th>Key</th>\n      <th>Action</th>\n    </tr>\n  </THead>\n  <TBody>\n    <tr>\n      <td><Kbd>Ctrl</Kbd> + <Kbd>S</Kbd></td>\n      <td>Saves   the\n   document</td>\n    </tr>\n  </TBody>\n</Table>",
    );
    expect(markdown).toBe(
      "| Key | Action |\n| - | - |\n| `Ctrl` + `S` | Saves the document |\n",
    );
  });

  it("repeats a cell that spans columns so each column keeps its header", async () => {
    const markdown = await toMarkdown(
      '<Table>\n  <THead>\n    <tr>\n      <th colSpan="1">Platform</th>\n      <th colSpan="3">Modifiers</th>\n    </tr>\n  </THead>\n  <TBody>\n    <tr>\n      <td>macOS</td>\n      <td>Ctrl</td>\n      <td>Option</td>\n      <td>Cmd</td>\n    </tr>\n  </TBody>\n</Table>',
    );
    expect(markdown).toBe(
      "| Platform | Modifiers | Modifiers | Modifiers |\n| - | - | - | - |\n| macOS | Ctrl | Option | Cmd |\n",
    );
  });

  it("repeats a cell that spans rows in the rows below", async () => {
    const markdown = await toMarkdown(
      '<table>\n  <tr><th>Key</th><th>Platform</th><th>Action</th></tr>\n  <tr><td rowSpan={2}>Tab</td><td>macOS</td><td>Next</td></tr>\n  <tr><td>Windows</td><td>Next field</td></tr>\n  <tr><td>Esc</td><td colspan="2">Closes</td></tr>\n</table>',
    );
    expect(markdown).toBe(
      "| Key | Platform | Action |\n| - | - | - |\n| Tab | macOS | Next |\n| Tab | Windows | Next field |\n| Esc | Closes | Closes |\n",
    );
  });

  it("marks deprecated tokens a page names, with their replacements", async () => {
    const deprecated = new Map([
      ["--salt-old-border", ["--salt-new-border"]],
      ["--salt-old-size", ["--salt-size-a", "--salt-size-b"]],
      ["--salt-old-gone", []],
    ]);
    const ctx = createContext({
      deprecatedToken: (name) => deprecated.get(name),
    });
    const markdown = await toMarkdown(
      'Use `--salt-old-border`, `--salt-old-size`, `--salt-old-gone` or `--salt-current`.\n\n<TokenTableWithControls tokens={["--salt-current", "--salt-old-border"]} />',
      ctx,
    );
    expect(markdown).toBe(
      "Use `--salt-old-border` (deprecated; use `--salt-new-border`), `--salt-old-size` (deprecated; use `--salt-size-a` or `--salt-size-b`), `--salt-old-gone` (deprecated) or `--salt-current`.\n\nTokens: `--salt-current`, `--salt-old-border` (deprecated; use `--salt-new-border`) ([token reference](@salt-ds/theme/docs/tokens.md)).\n",
    );
    expect(ctx.notes).toEqual([
      "--salt-old-border is deprecated; use --salt-new-border. The docs for agents say so where the page names it.",
      "--salt-old-size is deprecated; use --salt-size-a or --salt-size-b. The docs for agents say so where the page names it.",
      "--salt-old-gone is deprecated. The docs for agents say so where the page names it.",
      "--salt-old-border is deprecated; use --salt-new-border. The docs for agents say so where the page names it.",
    ]);
  });

  it("leaves deprecated tokens in headings and link text as written", async () => {
    const ctx = createContext({
      deprecatedToken: (name) =>
        name === "--salt-old-border" ? ["--salt-new-border"] : undefined,
    });
    const markdown = await toMarkdown(
      "### `--salt-old-border`\n\nSee [`--salt-old-border`](/salt/themes/tokens).",
      ctx,
    );
    expect(markdown).toBe(
      "### `--salt-old-border`\n\nSee [`--salt-old-border`](/salt/themes/tokens).\n",
    );
    expect(ctx.notes).toEqual([
      "--salt-old-border is deprecated; use --salt-new-border.",
      "--salt-old-border is deprecated; use --salt-new-border.",
    ]);
  });

  it("notes an example that uses a deprecated token", async () => {
    const ctx = createContext({
      deprecatedToken: (name) =>
        name === "--salt-shadow-1"
          ? ["--salt-overlayable-shadow-scroll"]
          : undefined,
      examples: {
        resolve: async () => ({
          entry: {
            language: "tsx",
            code: 'const s = "var(--salt-shadow-1)";\n',
          },
          support: [
            {
              kind: "file",
              code: ".a { color: var(--salt-content-primary-foreground); }",
            },
          ],
        }),
      },
    });
    await convertMdx(
      '<LivePreview componentName="patterns/app-header" exampleName="AppHeader" />',
      ctx,
    );
    expect(ctx.notes).toEqual([
      "Example patterns/app-header/AppHeader uses the deprecated token --salt-shadow-1; use --salt-overlayable-shadow-scroll.",
    ]);
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
