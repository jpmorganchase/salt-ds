import {
  buildThemeSetupSnippet,
  createFoundationStarterCode,
  DEFAULT_NEW_WORK_THEME_PRESET_ID,
  formatThemePresetPropAssignments,
  getThemePreset,
  type PageRecord,
} from "@salt-ds/semantic-core";
import { describe, expect, it } from "vitest";

const PAGE_BASE: Omit<PageRecord, "title"> = {
  id: "page.density",
  route: "/salt/foundations/density",
  page_kind: "foundation",
  summary: "Density guidance",
  keywords: [],
  content: [],
  section_headings: [],
  last_verified_at: "2026-03-29T00:00:00Z",
};

describe("theme presets", () => {
  it("models the default JPM Brand mapping explicitly", () => {
    const preset = getThemePreset(DEFAULT_NEW_WORK_THEME_PRESET_ID);

    expect(preset).toMatchObject({
      provider: "SaltProviderNext",
      imports: [
        "@salt-ds/theme/index.css",
        "@salt-ds/theme/css/theme-next.css",
      ],
      props: [
        { name: "accent", value: "teal" },
        { name: "corner", value: "rounded" },
        { name: "headingFont", value: "Amplitude" },
        { name: "actionFont", value: "Amplitude" },
      ],
    });
    expect(formatThemePresetPropAssignments(preset)).toContain(
      'headingFont="Amplitude"',
    );
  });

  it("renders the exact JPM Brand guide snippet", () => {
    const snippet = buildThemeSetupSnippet(DEFAULT_NEW_WORK_THEME_PRESET_ID);

    expect(snippet).toContain(
      'import { SaltProviderNext } from "@salt-ds/core";',
    );
    expect(snippet).toContain('import "@salt-ds/theme/css/theme-next.css";');
    expect(snippet).toContain('accent="teal"');
    expect(snippet).toContain('corner="rounded"');
    expect(snippet).toContain('headingFont="Amplitude"');
    expect(snippet).toContain('actionFont="Amplitude"');
  });

  it("uses the default theme preset in density starters", () => {
    const snippets = createFoundationStarterCode({
      ...PAGE_BASE,
      title: "Density",
    });

    expect(snippets[0]?.code).toContain("SaltProviderNext");
    expect(snippets[0]?.code).toContain('accent="teal"');
    expect(snippets[0]?.code).toContain('density="medium"');
    expect(snippets[0]?.notes).toContain(
      "Use the recommended JPM Brand theme bootstrap for new work, then layer density or size choices on top.",
    );
  });
});
