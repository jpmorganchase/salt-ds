import { describe, expect, it } from "vitest";
import {
  appendProjectConventionsNextStep,
  buildGuidanceBoundary,
  describeProjectConventionsChecks,
  describeProjectConventionsTopics,
} from "../../../semantic-core/src/index.js";

describe("guidanceBoundary", () => {
  it("formats project convention topics for user-facing text", () => {
    expect(describeProjectConventionsTopics(["wrappers"])).toBe(
      "repo wrappers",
    );
    expect(
      describeProjectConventionsTopics(["wrappers", "page-patterns"]),
    ).toBe("repo wrappers and page patterns");
    expect(
      describeProjectConventionsTopics([
        "wrappers",
        "page-patterns",
        "migration-shims",
      ]),
    ).toBe("repo wrappers, page patterns, and migration shims");
    expect(describeProjectConventionsChecks(["wrappers"])).toBe(
      "approved repo wrappers for analytics, defaults, or shared behavior",
    );
  });

  it("appends project conventions guidance to next steps only when recommended", () => {
    const boundary = buildGuidanceBoundary({
      workflow: "choose_salt_solution",
      solution_type: "component",
    });

    expect(
      appendProjectConventionsNextStep(
        "Review the recommended Salt direction.",
        boundary,
      ),
    ).toContain(
      "approved repo wrappers for analytics, defaults, or shared behavior",
    );

    const directBoundary = buildGuidanceBoundary({
      workflow: "choose_salt_solution",
      solution_type: "foundation",
    });

    expect(
      appendProjectConventionsNextStep(
        "Apply the typography guidance.",
        directBoundary,
      ),
    ).toBe("Apply the typography guidance.");
  });

  it("derives project convention topics for translation and analysis workflows", () => {
    const translationBoundary = buildGuidanceBoundary({
      workflow: "translate_ui_to_salt",
      has_translation_input: true,
      ui_flavor: "external-ui",
      project_conventions_topics: ["navigation-shell", "wrappers"],
    });

    expect(translationBoundary.project_conventions).toMatchObject({
      check_recommended: true,
      topics: expect.arrayContaining([
        "wrappers",
        "page-patterns",
        "navigation-shell",
      ]),
    });

    const analysisBoundary = buildGuidanceBoundary({
      workflow: "analyze_salt_code",
      issue_categories: ["composition", "deprecated"],
      has_deprecations: true,
    });

    expect(analysisBoundary.project_conventions).toMatchObject({
      check_recommended: true,
      topics: expect.arrayContaining([
        "wrappers",
        "page-patterns",
        "migration-shims",
      ]),
    });
  });
});
