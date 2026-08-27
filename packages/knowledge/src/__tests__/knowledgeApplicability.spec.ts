import { describe, expect, it } from "vitest";
import {
  currentKnowledgeApplicability,
  deprecationTimelineKnowledgeApplicability,
  resolvePackageKnowledgeApplicability,
  unknownKnowledgeApplicability,
} from "../applicability/knowledgeApplicability.js";

describe("knowledge applicability", () => {
  it("labels catalog search as current guidance without historical claims", () => {
    expect(currentKnowledgeApplicability()).toEqual({
      state: "current",
      basis: "catalog_current_target",
      package_name: null,
      target_version: null,
      catalog_version: null,
      peer_compatibility: "not_evaluated",
      historical_completeness: false,
    });
  });

  it("accepts only exact valid package-version equality", () => {
    expect(
      resolvePackageKnowledgeApplicability({
        packageName: "@salt-ds/core",
        targetVersion: "1.69.0",
        catalogVersion: "1.69.0",
      }),
    ).toMatchObject({
      state: "applicable",
      basis: "exact_catalog_package_version",
      target_version: "1.69.0",
      catalog_version: "1.69.0",
      peer_compatibility: "not_evaluated",
      historical_completeness: false,
    });
    for (const targetVersion of [
      "1.68.0",
      "2.0.0",
      "^1.69.0",
      "1.69.0+local.1",
      "v1.69.0",
      " 1.69.0 ",
      null,
    ]) {
      expect(
        resolvePackageKnowledgeApplicability({
          packageName: "@salt-ds/core",
          targetVersion,
          catalogVersion: "1.69.0",
        }),
      ).toMatchObject({
        state: "unknown",
        basis: "evidence_unavailable",
        peer_compatibility: "not_evaluated",
        historical_completeness: false,
      });
    }

    expect(
      resolvePackageKnowledgeApplicability({
        packageName: "@salt-ds/core",
        targetVersion: "1.69.0-alpha.1+local.1",
        catalogVersion: "1.69.0-alpha.1+local.1",
      }),
    ).toMatchObject({
      state: "applicable",
      target_version: "1.69.0-alpha.1+local.1",
      catalog_version: "1.69.0-alpha.1+local.1",
    });
  });

  it("keeps narrow deprecation timing distinct from package equality", () => {
    expect(
      deprecationTimelineKnowledgeApplicability({
        packageName: "@salt-ds/core",
        targetVersion: "1.35.0",
        catalogVersion: "1.69.0",
      }),
    ).toEqual({
      state: "applicable",
      basis: "deprecation_timeline",
      package_name: "@salt-ds/core",
      target_version: "1.35.0",
      catalog_version: "1.69.0",
      peer_compatibility: "not_evaluated",
      historical_completeness: false,
    });
  });

  it("normalizes unavailable evidence to an explicit unknown state", () => {
    expect(
      unknownKnowledgeApplicability({
        packageName: "@salt-ds/ag-grid-theme",
        targetVersion: "workspace:*",
        catalogVersion: "2.9.0",
      }),
    ).toEqual({
      state: "unknown",
      basis: "evidence_unavailable",
      package_name: "@salt-ds/ag-grid-theme",
      target_version: null,
      catalog_version: "2.9.0",
      peer_compatibility: "not_evaluated",
      historical_completeness: false,
    });
  });
});
