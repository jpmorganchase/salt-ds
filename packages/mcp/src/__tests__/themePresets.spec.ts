import {
  buildThemeSetupSnippet,
  createFoundationStarterCode,
  DEFAULT_NEW_WORK_THEME_PRESET_ID,
  formatThemePresetImports,
  formatThemePresetPropAssignments,
  getThemePreset,
  listThemePresets,
  type PageRecord,
} from "@salt-ds/semantic-core";
import { describe, expect, it } from "vitest";

const PAGE_BASE: Omit<PageRecord, "title"> = {
  id: "page.fixture-density",
  route: "/fixture/foundations/density",
  page_kind: "foundation",
  summary: "Fixture density guidance.",
  keywords: [],
  content: [],
  section_headings: [],
  last_verified_at: "2026-03-29T00:00:00Z",
};

describe("theme presets", () => {
  it("reports theme bootstrap as unsupported until evidence supplies facts", () => {
    const preset = getThemePreset(DEFAULT_NEW_WORK_THEME_PRESET_ID);

    expect(preset).toMatchObject({
      status: "unsupported",
      evidence_ref_ids: [],
      provider: null,
      imports: [],
      props: [],
    });
    expect(preset.missing).toEqual(
      expect.arrayContaining([
        "provider name evidence",
        "theme import evidence",
        "provider prop evidence",
        "font setup evidence",
      ]),
    );
    expect(listThemePresets()).toEqual([preset]);
    expect(formatThemePresetPropAssignments(preset)).toBe("");
    expect(formatThemePresetImports(preset)).toBe("");
  });

  it("renders an unsupported snippet instead of static provider code", () => {
    const snippet = buildThemeSetupSnippet(DEFAULT_NEW_WORK_THEME_PRESET_ID);

    expect(snippet).toContain("unsupported");
    expect(snippet).toContain("EvidenceRefs");
    expect(snippet).not.toMatch(/\bimport\s+\{/);
    expect(snippet).not.toMatch(/<\w+/);
  });

  it("keeps density starters degraded when theme facts are missing", () => {
    const snippets = createFoundationStarterCode({
      ...PAGE_BASE,
      title: "Density",
    });

    expect(snippets[0]?.code).toContain("pending evidence");
    expect(snippets[0]?.notes).toContain(
      "Theme, density, and size starter code is unsupported until provider and related prop facts resolve from evidence.",
    );
  });
});
