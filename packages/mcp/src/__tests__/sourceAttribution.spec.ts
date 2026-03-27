import { describe, expect, it } from "vitest";
import {
  buildStructuredToolContent,
  collectToolSources,
} from "../server/sourceAttribution.js";

describe("sourceAttribution", () => {
  it("collects and normalizes site, external, and repo sources", () => {
    const payload = {
      package: {
        docs_root: "/salt/components",
        source_root: "packages/core",
        changelog_path: "packages/core/CHANGELOG.md",
      },
      component: {
        related_docs: {
          overview: "/salt/components/button",
          usage: "/salt/components/button/usage",
        },
        source: {
          repo_path: "packages/core/src/button",
        },
        changes: [
          {
            source_urls: ["packages/core/CHANGELOG.md", "/salt/changelog"],
          },
        ],
      },
      page: {
        route: "/salt/components/button/accessibility",
      },
      resource: {
        href: "https://storybook.saltdesignsystem.com/?path=/story/components-button--default",
      },
    };

    expect(collectToolSources(payload)).toEqual(
      expect.arrayContaining([
        {
          original: "/salt/components",
          resolved: "https://www.saltdesignsystem.com/salt/components",
          kind: "site",
        },
        {
          original: "/salt/components/button",
          resolved: "https://www.saltdesignsystem.com/salt/components/button",
          kind: "site",
        },
        {
          original: "packages/core/CHANGELOG.md",
          resolved: "packages/core/CHANGELOG.md",
          kind: "repo",
        },
        {
          original: "packages/core/src/button",
          resolved: "packages/core/src/button",
          kind: "repo",
        },
        {
          original:
            "https://storybook.saltdesignsystem.com/?path=/story/components-button--default",
          resolved:
            "https://storybook.saltdesignsystem.com/?path=/story/components-button--default",
          kind: "external",
        },
      ]),
    );
  });

  it("adds the design tokens index as the default token docs source", () => {
    const structuredContent = buildStructuredToolContent({
      tokens: [],
      total_matches: 0,
      truncated: false,
    });

    expect(structuredContent).toMatchObject({
      sources: expect.arrayContaining([
        {
          original: "/salt/themes/design-tokens/index",
          resolved:
            "https://www.saltdesignsystem.com/salt/themes/design-tokens/index",
          kind: "site",
        },
      ]),
    });
  });

  it("collects docs arrays as source-bearing fields", () => {
    const sources = collectToolSources({
      recommended: {
        docs: [
          "/salt/themes/design-tokens/index",
          "/salt/themes/design-tokens/container-characteristic",
        ],
      },
    });

    expect(sources).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          original: "/salt/themes/design-tokens/index",
          kind: "site",
        }),
        expect.objectContaining({
          original: "/salt/themes/design-tokens/container-characteristic",
          kind: "site",
        }),
      ]),
    );
  });
});
