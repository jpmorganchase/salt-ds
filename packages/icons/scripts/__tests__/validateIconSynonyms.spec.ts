import { describe, expect, it } from "vitest";
import { validateIconSynonyms } from "../validateIconSynonyms.mjs";

describe("validateIconSynonyms", () => {
  it("reports all deprecated entries with instructions for removing them", () => {
    expect(() =>
      validateIconSynonyms(
        [{ componentName: "StepDefault" }, { componentName: "StepActive" }],
        [{ iconName: "step-default" }, { iconName: "step-active" }],
      ),
    ).toThrow(
      [
        "Deprecated icons must not have entries in site/src/components/icon-preview/salt-icon-synonym.json.",
        "- step-default (StepDefaultIcon)",
        "- step-active (StepActiveIcon)",
        "Remove the complete entries and their rows in the Icons Synonym List spreadsheet.",
      ].join("\n"),
    );
  });

  it.each([
    { iconName: "step-active", synonym: [] },
    { iconName: "step-active", category: "deprecated" },
    { iconName: "STEP-ACTIVE" },
  ])("rejects a deprecated entry %j", (entry) => {
    expect(() =>
      validateIconSynonyms([{ componentName: "StepActive" }], [entry]),
    ).toThrow("salt-icon-synonym.json");
  });

  it.each(["help", "help-solid"])(
    "rejects %s when its solid variant is deprecated",
    (iconName) => {
      expect(() =>
        validateIconSynonyms([{ componentName: "HelpSolid" }], [{ iconName }]),
      ).toThrow(`- ${iconName} (HelpSolidIcon)`);
    },
  );

  it("allows supported icons and replacement names", () => {
    expect(() =>
      validateIconSynonyms(
        [
          { componentName: "Help" },
          { componentName: "StepActive" },
          { componentName: "StepDefault" },
        ],
        [
          { iconName: "help-circle" },
          { iconName: "help-circle-solid" },
          { iconName: "progress-active" },
          { iconName: "progress-draft" },
        ],
      ),
    ).not.toThrow();
  });
});
