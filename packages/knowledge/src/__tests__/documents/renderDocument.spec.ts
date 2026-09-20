import { describe, expect, it } from "vitest";

import {
  documentSectionText,
  renderDocumentBlocks,
  renderDocumentInline,
  renderDocumentSection,
} from "../../documents/renderDocument.js";

describe("renderDocument", () => {
  it("keeps complete code whitespace inside a fence that malicious closing fences cannot close", () => {
    const source =
      "function example() {\n  const markdown = `\n`````\n# injected`;\n\n  return markdown;\n}\n";
    expect(
      renderDocumentBlocks(
        [
          {
            kind: "code",
            language: "tsx",
            meta: null,
            value: source,
          },
        ],
        { route: "/salt/patterns/forms" },
      ),
    ).toBe(`\`\`\`\`\`\`tsx\n${source}\n\`\`\`\`\`\``);
  });

  it("renders links, callouts, diagrams, and example-file references as compiler-owned Markdown", () => {
    const markdown = renderDocumentSection(
      {
        id: "submission",
        semantic_role: "behavior" as const,
        heading_path: ["Forms", "Submission"],
        heading: [{ kind: "text", value: "Submission" }],
        level: 2,
        blocks: [
          {
            kind: "paragraph",
            children: [
              { kind: "text", value: "Read " },
              {
                kind: "link",
                href: "../accessibility#status",
                title: null,
                children: [{ kind: "text", value: "status guidance" }],
              },
              { kind: "text", value: "." },
            ],
          },
          {
            kind: "guidance_callout",
            tone: "positive",
            label: "Keep drafts",
            blocks: [
              {
                kind: "paragraph",
                children: [
                  { kind: "text", value: "Recover after a failed save." },
                ],
              },
            ],
          },
          {
            kind: "diagram",
            asset: {
              public_path: "/img/patterns/forms/recovery.png",
              source_path: "site/public/img/patterns/forms/recovery.png",
            },
            alt: "Recovery flow",
            caption: "Retry after errors",
            blocks: [],
          },
          {
            kind: "live_preview",
            component_name: "patterns/forms",
            example_name: "StandardLayout",
            display_name: "Standard layout",
            purpose_section_id: "submission",
            example_source_path: "site/src/examples/patterns/forms/index.tsx",
          },
        ],
      },
      {
        route: "/salt/patterns/forms",
        fileReference: (path) =>
          path === "site/src/examples/patterns/forms/index.tsx"
            ? "record:guide:guide.forms.workflow#file/site/src/examples/patterns/forms/index.tsx"
            : null,
      },
    );

    expect(markdown).toContain(
      "[status guidance](https://www.saltdesignsystem.com/salt/accessibility#status)",
    );
    expect(markdown).toContain("> **Keep drafts**");
    expect(markdown).toContain(
      "Diagram: [Recovery flow](https://www.saltdesignsystem.com/img/patterns/forms/recovery.png)",
    );
    expect(markdown).toContain(
      "Complete example file: `record:guide:guide.forms.workflow#file/site/src/examples/patterns/forms/index.tsx`",
    );
  });

  it("renders unsafe links as unavailable text and preserves source text for search", () => {
    const nodes = [
      {
        kind: "link" as const,
        href: "javascript:alert(1)",
        title: null,
        children: [{ kind: "text" as const, value: "click" }],
      },
    ];
    expect(
      renderDocumentInline(nodes, { route: "/salt/components/button" }),
    ).toBe("click (unavailable link)");
    expect(
      documentSectionText({
        id: "button.loading",
        semantic_role: "behavior" as const,
        heading_path: ["Button", "Loading"],
        heading: null,
        level: null,
        blocks: [
          {
            kind: "paragraph",
            children: [{ kind: "text", value: "Visible loading state" }],
          },
        ],
      }),
    ).toBe("Button Loading Visible loading state");
  });
});
