import { describe, expect, it } from "vitest";
import {
  deriveComparableSaltVersion,
  evaluatePackCompatibility,
} from "../layerDiagnostics.js";

describe("layerDiagnostics version normalization", () => {
  it("treats bare workspace protocol ranges as unknown comparable versions", () => {
    expect(
      deriveComparableSaltVersion({
        declaredVersion: "workspace:^",
      }),
    ).toBeNull();
  });

  it("normalizes workspace protocol specs that include a real semver range", () => {
    expect(
      deriveComparableSaltVersion({
        declaredVersion: "workspace:^1.2.3",
      }),
    ).toBe("1.2.3");
  });

  it("does not throw when compatibility checks see workspace protocol versions", () => {
    expect(
      evaluatePackCompatibility({
        supportedSaltRange: "^1.0.0",
        currentSaltVersion: "workspace:^",
      }),
    ).toMatchObject({
      status: "unknown-current-version",
      checkedVersion: null,
    });
  });
});
