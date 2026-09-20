import { describe, expect, it } from "vitest";
import {
  parseSelectedMdxDocument,
  type SelectedMdxSectionSelector,
} from "../../build/selectedMdxDocument.js";
import type { KnowledgeRecordStore } from "../../manifest/knowledgeStore.js";
import {
  buildKnowledgeContext,
  renderKnowledgeContext,
} from "../../search/searchSalt.js";

interface GuideFixture {
  name: string;
  route: string;
  mdx: string;
  selectors: SelectedMdxSectionSelector[];
  indexed?: boolean;
  component?: string;
}

function fixtureStore(guides: GuideFixture[]): KnowledgeRecordStore {
  const records = new Map<string, unknown>();
  const contents = new Map<string, unknown>();
  const pages: unknown[] = [];
  const searchDocuments: unknown[] = [];
  guides.forEach((fixture, index) => {
    const id = `guide.fixture-${index}`;
    const contentId = `content.fixture-${index}`;
    const guide = {
      family: "guide",
      id,
      name: fixture.name,
      detail_content_ref: {
        family: "content",
        id: contentId,
        codec: "document_detail",
      },
    };
    records.set(`guide:${id}`, guide);
    const page = {
      family: "page",
      id: `page.fixture-${index}`,
      route: fixture.route,
      document_ref: { family: "guide", id },
    };
    pages.push(page);
    records.set(`page:${page.id}`, page);
    const componentRefs = fixture.component
      ? [{ family: "component", id: `component.${fixture.component}` }]
      : [];
    if (fixture.component) {
      records.set(`component:component.${fixture.component}`, {
        family: "component",
        id: `component.${fixture.component}`,
        name: fixture.component,
        detail_content_ref: {
          family: "content",
          id: "content.button-props",
          codec: "component_detail",
        },
      });
    }
    contents.set(contentId, {
      document: parseSelectedMdxDocument({
        source: {
          document_id: id,
          source_path: `site/docs/fixture-${index}.mdx`,
          route: fixture.route,
        },
        mdx: fixture.mdx,
        selectors: fixture.selectors,
      }),
      recipe_manifest: null,
      source_refs: [],
      component_refs: componentRefs,
      files: [],
      limitations: [],
    });
    if (fixture.indexed !== false) {
      searchDocuments.push({
        target: { family: "guide", id },
        title: fixture.name,
        summary: fixture.name,
        terms: [fixture.name],
        facets: {},
      });
    }
  });
  contents.set("content.button-props", {
    props: [
      {
        name: "loadingAnnouncement",
        type: "string",
        description: "Announces pending status for Button accessibility.",
        required: false,
        default: null,
      },
    ],
  });
  return {
    manifest: {
      bundle_digest: `sha256:${"a".repeat(64)}`,
      semantic_digest: `sha256:${"b".repeat(64)}`,
      compatibility: { packages: [] },
    },
    getFamily: (family: string) =>
      family === "search_document"
        ? searchDocuments
        : family === "page"
          ? pages
          : [],
    getRecord: (family: string, id: string) =>
      records.get(`${family}:${id}`) ?? null,
    getContentValue: (reference: { id: string }) => contents.get(reference.id),
  } as unknown as KnowledgeRecordStore;
}

const loadingSelector: SelectedMdxSectionSelector = {
  id: "button.loading",
  heading_path: ["Loading"],
  include_descendants: true,
};
const buttonRoute = "/salt/components/button/examples";
const loadingGuidance =
  "## Loading\n\nUse `loadingAnnouncement` to announce the Button's pending state.";

function contextMarkdown(result: ReturnType<typeof buildKnowledgeContext>) {
  return result.canonical_documents
    ?.flatMap((document) =>
      document.sections.map((section) => section.markdown),
    )
    .join("\n");
}

describe("canonical task questions", () => {
  it.each([false, true])(
    "retains directly matching behavior with decision guidance present: %s",
    (includeDecision) => {
      const selectors: SelectedMdxSectionSelector[] = [loadingSelector];
      let mdx =
        "## Loading\n\nKeep the editor visible while the operation completes.";
      if (includeDecision) {
        mdx +=
          "\n\n## When to use\n\nChoose an overlay to keep the worklist in view.";
        selectors.push({
          id: "editor.use",
          heading_path: ["When to use"],
          include_descendants: false,
        });
      }
      const store = fixtureStore([
        {
          name: "Editor",
          route: "/salt/patterns/editor",
          mdx,
          selectors,
        },
      ]);
      const result = buildKnowledgeContext(store, {
        query:
          "Should this editor use a dialog, and what happens while loading?",
      });
      const sections = result.canonical_documents?.flatMap(
        (document) => document.sections,
      );
      const loading = sections?.find(
        (section) => section.id === "button.loading",
      );
      expect(loading?.source_path).toBe("site/docs/fixture-0.mdx");
      expect(loading?.markdown).toContain("Keep the editor visible");
      if (includeDecision) {
        expect(contextMarkdown(result)).toContain("keep the worklist in view");
      }
    },
  );

  it.each(["reader", "readers"])(
    "retains assistive-technology guidance alongside narrow layout for screen %s",
    (reader) => {
      const store = fixtureStore([
        {
          name: "Loading feedback",
          route: "/salt/patterns/feedback",
          mdx: [
            "## Accessibility",
            "Expose status changes through the live region.",
            "## Constraints",
            "At narrow widths, stack actions vertically.",
          ].join("\n\n"),
          selectors: [
            {
              id: "feedback.accessibility",
              heading_path: ["Accessibility"],
              include_descendants: false,
            },
            {
              id: "feedback.layout",
              heading_path: ["Constraints"],
              include_descendants: false,
            },
          ],
        },
      ]);
      const result = buildKnowledgeContext(store, {
        query: `How should loading announcements work for screen ${reader} on a narrow screen?`,
      });
      const sections = result.canonical_documents?.flatMap(
        (document) => document.sections,
      );
      for (const [id, evidence] of [
        [
          "feedback.accessibility",
          "Expose status changes through the live region",
        ],
        ["feedback.layout", "stack actions vertically"],
      ]) {
        const section = sections?.find((candidate) => candidate.id === id);
        expect(section?.source_path).toBe("site/docs/fixture-0.mdx");
        expect(section?.markdown).toContain(evidence);
      }
    },
  );

  it.each([
    {
      query: "What happens to focus when submitted fields are invalid?",
      relatedSection: "form.accessibility",
      relatedEvidence: "Keep focus within the open editor",
      behaviorEvidence: "move focus to the first field needing attention",
    },
    {
      query:
        "How should the form behave on a narrow screen while a save is pending?",
      relatedSection: "form.constraints",
      relatedEvidence: "Stack form actions at narrow widths",
      behaviorEvidence: "prevent duplicate submissions",
    },
  ])(
    "retains all relevant authored roles for: $query",
    ({ query, relatedSection, relatedEvidence, behaviorEvidence }) => {
      const store = fixtureStore([
        {
          name: "Form focus and layout",
          route: "/salt/patterns/forms",
          mdx: [
            "## Accessibility",
            "Keep focus within the open editor.",
            "## Constraints",
            "Stack form actions at narrow widths.",
            "## Submission and recovery",
            "When submitted fields are invalid, retain values and move focus to the first field needing attention. While a save is pending, prevent duplicate submissions.",
          ].join("\n\n"),
          selectors: [
            {
              id: "form.accessibility",
              heading_path: ["Accessibility"],
              include_descendants: false,
            },
            {
              id: "form.constraints",
              heading_path: ["Constraints"],
              include_descendants: false,
            },
            {
              id: "form.behavior",
              heading_path: ["Submission and recovery"],
              include_descendants: false,
            },
          ],
        },
      ]);
      const result = buildKnowledgeContext(store, { query });
      const sections = result.canonical_documents?.flatMap(
        (document) => document.sections,
      );
      for (const [id, evidence] of [
        [relatedSection, relatedEvidence],
        ["form.behavior", behaviorEvidence],
      ]) {
        const section = sections?.find((candidate) => candidate.id === id);
        expect(section?.source_path).toBe("site/docs/fixture-0.mdx");
        expect(section?.markdown).toContain(evidence);
      }
    },
  );

  it.each([
    { cue: "limitation", heading: "Limitations", includeBehavior: false },
    { cue: "limitations", heading: "Limitations", includeBehavior: true },
    { cue: "constraint", heading: "Constraints", includeBehavior: true },
    { cue: "constraints", heading: "Constraints", includeBehavior: false },
  ])(
    "retains authored $cue evidence with behavior present: $includeBehavior",
    ({ cue, heading, includeBehavior }) => {
      const selectors: SelectedMdxSectionSelector[] = [
        {
          id: "record.limits",
          heading_path: [heading],
          include_descendants: false,
        },
      ];
      let mdx = `## ${heading}\n\nProduction support does not cover concurrent edits.`;
      if (includeBehavior) {
        mdx +=
          "\n\n## Submission and recovery\n\nPreserve the draft after a failed save.";
        selectors.push({
          id: "record.recovery",
          heading_path: ["Submission and recovery"],
          include_descendants: false,
        });
      }
      const store = fixtureStore([
        {
          name: "Record editor",
          route: "/salt/patterns/forms",
          mdx,
          selectors,
        },
      ]);
      const result = buildKnowledgeContext(store, {
        query: `What ${cue} apply to production use of this record editor?`,
      });
      const limits = result.canonical_documents
        ?.flatMap((document) => document.sections)
        .find((section) => section.id === "record.limits");
      expect(limits).toMatchObject({
        semantic_role: "constraint",
        source_path: "site/docs/fixture-0.mdx",
      });
      expect(limits?.markdown).toContain("does not cover concurrent edits");
      if (includeBehavior) {
        expect(contextMarkdown(result)).toContain("Preserve the draft");
      }
    },
  );

  it("keeps pending announcement evidence when the question asks about accessibility", () => {
    const store = fixtureStore([
      {
        name: "Button Loading",
        route: buttonRoute,
        mdx: loadingGuidance,
        selectors: [loadingSelector],
      },
    ]);
    const result = buildKnowledgeContext(store, {
      query:
        "How should a Button announce its pending state for accessibility?",
    });
    expect(contextMarkdown(result)).toContain("loadingAnnouncement");
    const loading = result.canonical_documents
      ?.flatMap((document) => document.sections)
      .find((section) => section.id === "button.loading");
    expect(loading).toMatchObject({
      semantic_role: "behavior",
      source_path: "site/docs/fixture-0.mdx",
    });
  });

  it("preserves the requested API fact ahead of broad role guidance in a bounded response", () => {
    const store = fixtureStore([
      {
        name: "Button Loading",
        route: buttonRoute,
        mdx: `${loadingGuidance}\n\n## Accessibility\n\n${"Keep Button focus visible throughout the interaction. ".repeat(20)}`,
        selectors: [
          loadingSelector,
          {
            id: "button.accessibility",
            heading_path: ["Accessibility"],
            include_descendants: false,
          },
        ],
        component: "Button",
      },
    ]);
    const input = {
      query: "Button loadingAnnouncement props accessibility pending",
      max_utf8_bytes: 3_000,
    };
    const result = buildKnowledgeContext(store, input);
    const api = result.canonical_documents
      ?.flatMap((document) => document.sections)
      .find((section) => section.id === "api/Button/loadingAnnouncement");
    expect(api?.markdown).toMatch(/\bstring\b/u);
    expect(api?.markdown).toMatch(/\boptional\b/u);
    expect(result.utf8_bytes + 1).toBeLessThanOrEqual(input.max_utf8_bytes);
    expect(
      Buffer.byteLength(renderKnowledgeContext(store, input), "utf8"),
    ).toBeLessThanOrEqual(input.max_utf8_bytes);
  });

  it("skips a malformed fragment and still resolves the next authored guidance link", () => {
    const store = fixtureStore([
      {
        name: "Form submission",
        route: "/salt/patterns/forms",
        mdx: `## Submission and recovery\n\nFor a pending form save, see [unavailable guidance](${buttonRoute}#%GG) and [Button Loading](${buttonRoute}#loading).`,
        selectors: [
          {
            id: "forms.submission",
            heading_path: ["Submission and recovery"],
            include_descendants: false,
          },
        ],
      },
      {
        name: "Button Loading",
        route: buttonRoute,
        mdx: loadingGuidance,
        selectors: [loadingSelector],
        indexed: false,
      },
    ]);
    const result = buildKnowledgeContext(store, {
      query: "form pending save",
    });
    expect(
      result.canonical_documents?.map((document) => document.reference),
    ).toContain("record:guide:guide.fixture-1");
    expect(contextMarkdown(result)).toContain("loadingAnnouncement");
  });
});
