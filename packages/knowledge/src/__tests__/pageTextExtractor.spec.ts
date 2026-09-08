import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parseYamlFrontmatter } from "../build/parseYamlFrontmatter.js";
import {
  hasSelectedMdxErrors,
  parseSelectedMdxDocument,
} from "../build/selectedMdxDocument.js";
import { parseDocumentModel } from "../documents/documentSchema.js";

const repoRoot = process.cwd();

function source(documentId: string, sourcePath: string, route: string) {
  return { document_id: documentId, source_path: sourcePath, route };
}

describe("parseSelectedMdxDocument", () => {
  it("keeps Button Loading attached to its h2 purpose, including its nested best-practice rationale", async () => {
    const raw = await readFile(
      path.join(repoRoot, "site/docs/components/button/examples.mdx"),
      "utf8",
    );
    const document = parseSelectedMdxDocument({
      source: source(
        "component.button.loading",
        "site/docs/components/button/examples.mdx",
        "/salt/components/button/examples",
      ),
      mdx: parseYamlFrontmatter(raw).content,
      selectors: [
        {
          id: "button.loading",
          heading_path: ["Loading"],
          include_descendants: true,
        },
      ],
    });

    expect(document.diagnostics).toEqual([]);
    expect(document.sections.map((section) => section.id)).toEqual([
      "button.loading",
      "button.loading.best-practices",
    ]);
    expect(document.sections[0].blocks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: "paragraph",
          children: expect.arrayContaining([
            expect.objectContaining({
              kind: "inline_code",
              value: "loading={true}",
            }),
          ]),
        }),
      ]),
    );
    expect(document.sections[1].blocks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: "paragraph",
          children: expect.arrayContaining([
            expect.objectContaining({ kind: "strong" }),
            expect.objectContaining({
              kind: "inline_code",
              value: "loadingAnnouncement",
            }),
          ]),
        }),
        {
          kind: "live_preview",
          component_name: "button",
          example_name: "Loading",
          display_name: null,
          purpose_section_id: "button.loading",
          example_source_path: "site/src/examples/button/Loading.tsx",
        },
      ]),
    );
  });

  it("preserves selected Forms prose, lists, links, Diagram assets, callouts, and literal ImageSwitcher metadata", async () => {
    const raw = await readFile(
      path.join(repoRoot, "site/docs/patterns/forms.mdx"),
      "utf8",
    );
    const document = parseSelectedMdxDocument({
      source: source(
        "pattern.forms",
        "site/docs/patterns/forms.mdx",
        "/salt/patterns/forms",
      ),
      mdx: parseYamlFrontmatter(raw).content,
      selectors: [
        { id: "forms.overview", heading_path: [], include_descendants: false },
        {
          id: "forms.when-to-use",
          heading_path: ["When to use"],
          include_descendants: false,
        },
        {
          id: "forms.when-not-to-use",
          heading_path: ["When not to use"],
          include_descendants: false,
        },
        {
          id: "forms.submission-and-recovery",
          heading_path: ["How to build", "Submission and recovery"],
          include_descendants: false,
        },
        {
          id: "forms.anatomy",
          heading_path: ["How to build", "Anatomy"],
          include_descendants: false,
        },
        {
          id: "forms.standard-layout",
          heading_path: ["How to build", "Standard layout"],
          include_descendants: true,
        },
      ],
    });

    expect(document.diagnostics).toEqual([]);
    expect(document.sections.map((section) => section.id)).toContain(
      "forms.overview",
    );
    const anatomy = document.sections.find(
      (section) => section.id === "forms.anatomy",
    );
    expect(anatomy?.blocks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: "list", ordered: true }),
        expect.objectContaining({
          kind: "diagram",
          asset: {
            public_path: "/img/patterns/forms/form-anatomy.png",
            source_path: "site/public/img/patterns/forms/form-anatomy.png",
          },
        }),
      ]),
    );
    const standardLayout = document.sections.find(
      (section) => section.id === "forms.standard-layout",
    );
    expect(standardLayout?.blocks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: "guidance_callout", tone: "positive" }),
        expect.objectContaining({
          kind: "diagram_group",
          label: "Show vertical spacing",
        }),
      ]),
    );
    const links = standardLayout?.blocks
      .filter((block) => block.kind === "paragraph")
      .flatMap((block) => block.children)
      .filter((inline) => inline.kind === "link");
    expect(links).toContainEqual(
      expect.objectContaining({ href: "../foundations/spacing" }),
    );
  });

  it("preserves fenced code whitespace exactly", () => {
    const document = parseSelectedMdxDocument({
      source: source("fixture.code", "site/docs/fixture.mdx", "/salt/fixture"),
      mdx: "## Code\n\n```tsx\nconst value = {\n  ready: true,\n};\n```\n",
      selectors: [
        {
          id: "fixture.code",
          heading_path: ["Code"],
          include_descendants: false,
        },
      ],
    });

    expect(document.diagnostics).toEqual([]);
    expect(document.sections[0].blocks).toContainEqual({
      kind: "code",
      language: "tsx",
      meta: null,
      value: "const value = {\n  ready: true,\n};",
    });
  });

  it("keeps expressions and ESM inert while reporting unsupported selected content", () => {
    const document = parseSelectedMdxDocument({
      source: source("fixture.inert", "site/docs/fixture.mdx", "/salt/fixture"),
      mdx: "import value from 'runtime';\n\n## Selected\n\n{/* comment only */}\n\n{value}\n\n<Unknown />\n",
      selectors: [
        {
          id: "fixture.inert",
          heading_path: ["Selected"],
          include_descendants: false,
        },
      ],
    });

    expect(hasSelectedMdxErrors(document)).toBe(true);
    expect(document.diagnostics.map((diagnostic) => diagnostic.code)).toEqual([
      "MDX_EXPRESSION_INERT",
      "MDX_UNSUPPORTED_COMPONENT",
    ]);
    expect(document.sections[0].blocks).toEqual([
      { kind: "unsupported", diagnostic_id: "MDX_EXPRESSION_INERT:1" },
      { kind: "unsupported", diagnostic_id: "MDX_UNSUPPORTED_COMPONENT:2" },
    ]);
  });

  it("accepts only literal ImageSwitcher image metadata and validates portable model locators", () => {
    const dynamic = parseSelectedMdxDocument({
      source: source(
        "fixture.images",
        "site/docs/fixture.mdx",
        "/salt/fixture",
      ),
      mdx: '## Images\n\n<ImageSwitcher images={makeImages()} label="Show images" />\n',
      selectors: [
        {
          id: "fixture.images",
          heading_path: ["Images"],
          include_descendants: false,
        },
      ],
    });
    expect(dynamic.diagnostics.map((diagnostic) => diagnostic.code)).toEqual([
      "MDX_DYNAMIC_ATTRIBUTE",
    ]);

    expect(() =>
      parseDocumentModel({
        contract: "salt-document/1",
        source: source("fixture.invalid", "../outside.mdx", "/salt/fixture"),
        sections: [],
        diagnostics: [],
      }),
    ).toThrow(/portable repository path/i);
  });
});
