import {
  createComponentStarterCode,
  createRecipeStarterCode,
} from "@salt-ds/semantic-core";
import type { ComponentRecord } from "@salt-ds/semantic-core/types";
import { describe, expect, it } from "vitest";

const LEGACY_PROVIDER_PATTERN = /\bSaltProvider\b(?!Next)/;

function makeComponentWithExample(code: string): ComponentRecord {
  return {
    id: "component.banner",
    name: "Banner",
    aliases: [],
    package: {
      name: "@salt-ds/core",
      status: "stable",
      since: null,
    },
    summary: "Banner displays contextual feedback.",
    status: "stable",
    category: ["feedback"],
    tags: [],
    when_to_use: ["Use for contextual feedback."],
    when_not_to_use: [],
    alternatives: [],
    props: [],
    accessibility: {
      summary: [],
      rules: [],
    },
    patterns: [],
    examples: [
      {
        id: "banner.theme-example",
        title: "Themed banner",
        description: "A banner example with a local provider.",
        intent: ["banner"],
        complexity: "intermediate",
        code,
        source_url: "/salt/components/banner/examples",
        package: "@salt-ds/core",
        target_type: "component",
        target_name: "Banner",
      },
    ],
    related_docs: {
      overview: null,
      usage: null,
      accessibility: null,
      examples: "/salt/components/banner/examples",
    },
    source: {
      repo_path: null,
      export_name: "Banner",
    },
    deprecations: [],
    last_verified_at: "2026-03-10T00:00:00Z",
  };
}

describe("starter code theme bootstrap", () => {
  it("normalizes example-backed recipe starters to the new-work SaltProviderNext theme", () => {
    const snippets = createRecipeStarterCode({
      recipeName: "Profile header",
      components: [
        { name: "Button", package: "@salt-ds/core", role: "action" },
      ],
      supporting_example: {
        title: "Legacy themed example",
        source_url: "/salt/patterns/profile-header/examples",
        code: [
          "import {",
          "  Button,",
          "  SaltProvider,",
          '} from "@salt-ds/core";',
          'import "@salt-ds/theme/index.css";',
          "",
          "export function LegacyExample() {",
          "  return (",
          '    <SaltProvider density="high">',
          "      <Button>Save</Button>",
          "    </SaltProvider>",
          "  );",
          "}",
        ].join("\n"),
      },
    });

    const code = snippets[0]?.code ?? "";
    expect(code).toContain("SaltProviderNext");
    expect(code).toContain('import "@salt-ds/theme/index.css";');
    expect(code).toContain('import "@salt-ds/theme/css/theme-next.css";');
    expect(code).toContain('accent="teal"');
    expect(code).toContain('corner="rounded"');
    expect(code).toContain('headingFont="Amplitude"');
    expect(code).toContain('actionFont="Amplitude"');
    expect(code).toContain('density="high"');
    expect(code).not.toMatch(LEGACY_PROVIDER_PATTERN);
    expect(snippets[0]?.notes).toContain(
      "Theme bootstrap normalized to the recommended JPM Brand setup for new Salt work.",
    );
  });

  it("normalizes attached component examples that choose between legacy and next providers", () => {
    const snippets = createComponentStarterCode(
      makeComponentWithExample(
        [
          "import {",
          "  Banner,",
          "  SaltProvider,",
          "  SaltProviderNext,",
          "  StackLayout,",
          "  useTheme,",
          '} from "@salt-ds/core";',
          "",
          "export const ThemedBanner = () => {",
          "  const { themeNext } = useTheme();",
          "  const Provider = themeNext ? SaltProviderNext : SaltProvider;",
          "  return (",
          '    <Provider density="high" applyClassesTo="scope">',
          "      <StackLayout>",
          "        <Banner>Saved</Banner>",
          "      </StackLayout>",
          "    </Provider>",
          "  );",
          "};",
        ].join("\n"),
      ),
    );

    const exampleCode = snippets[1]?.code ?? "";
    expect(exampleCode).toContain("SaltProviderNext");
    expect(exampleCode).toContain(
      'import "@salt-ds/theme/css/theme-next.css";',
    );
    expect(exampleCode).toContain('accent="teal"');
    expect(exampleCode).toContain('density="high"');
    expect(exampleCode).toContain('applyClassesTo="scope"');
    expect(exampleCode).not.toContain("<Provider");
    expect(exampleCode).not.toContain("useTheme");
    expect(exampleCode).not.toMatch(LEGACY_PROVIDER_PATTERN);
    expect(snippets[1]?.notes).toContain(
      "Theme bootstrap normalized to the recommended JPM Brand setup for new Salt work.",
    );
  });
});
