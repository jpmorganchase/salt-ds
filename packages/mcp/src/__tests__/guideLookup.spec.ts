import { describe, expect, it } from "vitest";
import {
  findGuideByIdentifier,
  resolveGuideLookup,
} from "../tools/guideLookup.js";
import type { GuideRecord } from "../types.js";

const TIMESTAMP = "2026-03-10T00:00:00Z";

function createGuide(
  overrides: Partial<GuideRecord> & Pick<GuideRecord, "id" | "name">,
): GuideRecord {
  return {
    id: overrides.id,
    name: overrides.name,
    aliases: overrides.aliases ?? [],
    kind: overrides.kind ?? "getting-started",
    summary: overrides.summary ?? "",
    packages: overrides.packages ?? ["@salt-ds/core"],
    steps:
      overrides.steps ?? [
        {
          title: "Overview",
          statements: [],
          snippets: [],
        },
      ],
    related_docs: overrides.related_docs ?? {
      overview: `/salt/getting-started/${overrides.id}`,
      related_components: [],
      related_packages: ["@salt-ds/core"],
    },
    last_verified_at: overrides.last_verified_at ?? TIMESTAMP,
  };
}

describe("resolveGuideLookup", () => {
  it("falls back to guide content when there is no exact alias match", () => {
    const guides: GuideRecord[] = [
      createGuide({
        id: "guide.developing",
        name: "Developing with Salt",
        summary: "Learn how to bootstrap a React app with Salt.",
        steps: [
          {
            title: "Install packages",
            statements: ["Install @salt-ds/core and @salt-ds/theme."],
            snippets: [],
          },
        ],
      }),
    ];

    const result = resolveGuideLookup(guides, "bootstrap");

    expect(result.candidate).toMatchObject({
      name: "Developing with Salt",
    });
    expect(result.ambiguity).toBeUndefined();
  });

  it("matches decision-style queries from guide headings and statements", () => {
    const guides: GuideRecord[] = [
      createGuide({
        id: "guide.primitive-choice",
        name: "Choosing the right primitive",
        steps: [
          {
            title: "Button or Link",
            statements: [
              "Use Button for actions and Link for navigation.",
            ],
            snippets: [],
          },
        ],
      }),
      createGuide({
        id: "guide.wrappers",
        name: "Custom wrappers",
        steps: [
          {
            title: "Pass-through wrappers",
            statements: ["Avoid wrappers that only forward props."],
            snippets: [],
          },
        ],
      }),
    ];

    const result = resolveGuideLookup(guides, "button vs link");

    expect(result.candidate).toMatchObject({
      name: "Choosing the right primitive",
    });
  });

  it("prefers the guide whose content best matches wrapper-review language", () => {
    const guides: GuideRecord[] = [
      createGuide({
        id: "guide.primitive-choice",
        name: "Choosing the right primitive",
        summary: "Decide when to use Button, Link, or another Salt primitive.",
      }),
      createGuide({
        id: "guide.wrappers",
        name: "Custom wrappers",
        steps: [
          {
            title: "Pass-through wrappers",
            statements: [
              "Review wrappers that only forward props to a Salt primitive.",
            ],
            snippets: [],
          },
        ],
      }),
    ];

    const result = resolveGuideLookup(guides, "wrapper review");

    expect(result.candidate).toMatchObject({
      name: "Custom wrappers",
    });
  });

  it("resolves canonical guide identifiers by slug without content scoring", () => {
    const guides: GuideRecord[] = [
      createGuide({
        id: "custom-wrappers",
        name: "Custom wrappers",
      }),
    ];

    const result = findGuideByIdentifier(guides, "custom-wrappers");

    expect(result).toMatchObject({
      name: "Custom wrappers",
      related_docs: {
        overview: "/salt/getting-started/custom-wrappers",
      },
    });
  });

  it("returns ambiguity when content scoring ties", () => {
    const guides: GuideRecord[] = [
      createGuide({
        id: "guide.one",
        name: "Guide one",
        summary: "Shared integration guidance for developers.",
      }),
      createGuide({
        id: "guide.two",
        name: "Guide two",
        summary: "Shared integration guidance for developers.",
      }),
    ];

    const result = resolveGuideLookup(guides, "integration");

    expect(result.candidate).toBeNull();
    expect(result.ambiguity).toMatchObject({
      query: "integration",
      matched_by: "content",
    });
    expect(result.ambiguity?.matches).toHaveLength(2);
  });
});
