import { describe, expect, it } from "vitest";

import { validateAccessibilityEvidence } from "./checkAccessibilityEvidence.mjs";

function validManifest() {
  const component = (id) => ({
    id,
    name: id,
    package: "@salt-ds/core",
    owner: "Salt maintainers",
    status: "tested",
    formallyConformant: false,
    reviewedOn: "2026-07-12",
    reviewBy: "2026-10-12",
    documentation: `site/docs/components/${id}/accessibility.mdx`,
    successCriteria: [
      { criterion: "4.1.2", level: "A", evidenceIds: [`${id}-behavior`] },
    ],
    automatedEvidence: [
      {
        id: `${id}-behavior`,
        kind: "behavior",
        path: `packages/core/src/${id}.cy.tsx`,
        covers: "Accessible behavior",
        status: "passed",
        recordedOn: "2026-07-12",
        command: `yarn cypress run --spec packages/core/src/${id}.cy.tsx`,
      },
    ],
    manualEvidence: [
      {
        matrixId: "nvda-firefox-windows",
        status: "not-tested",
        scenarios: ["Operate the component"],
        recordedOn: null,
      },
    ],
    exceptions: [],
    limitations: ["Manual coverage is pending."],
  });

  return {
    $schema: "./component-evidence.schema.json",
    schemaVersion: 1,
    conformanceTarget: "WCAG 2.2 Level AA",
    publicDocumentation: "site/docs/about/accessibility-evidence.mdx",
    supportMatrix: [
      {
        id: "nvda-firefox-windows",
        operatingSystem: "Windows",
        browser: "Firefox",
        assistiveTechnology: "NVDA",
      },
    ],
    components: [
      component("spinner"),
      component("number-input"),
      component("mega-menu"),
    ],
  };
}

describe("accessibility evidence policy", () => {
  it("accepts a current pilot with linked automated and honest manual evidence", () => {
    expect(
      validateAccessibilityEvidence(validManifest(), {
        today: "2026-07-12",
        pathExists: () => true,
      }),
    ).toEqual([]);
  });

  it("rejects stale reviews", () => {
    const manifest = validManifest();
    manifest.components[0].reviewBy = "2026-07-11";

    expect(
      validateAccessibilityEvidence(manifest, {
        today: "2026-07-12",
        pathExists: () => true,
      }),
    ).toContain(
      "components[0].reviewBy (2026-07-11) is stale as of 2026-07-12",
    );
  });

  it("enforces the quarterly review cadence", () => {
    const manifest = validManifest();
    manifest.components[0].reviewBy = "2027-07-12";

    expect(
      validateAccessibilityEvidence(manifest, {
        today: "2026-07-12",
        pathExists: () => true,
      }),
    ).toContain("components[0].reviewBy must be within 93 days of reviewedOn");
  });

  it("rejects missing manual matrix entries and broken evidence links", () => {
    const manifest = validManifest();
    manifest.supportMatrix.push({
      id: "jaws-chrome-windows",
      operatingSystem: "Windows",
      browser: "Chrome",
      assistiveTechnology: "JAWS",
    });
    manifest.components[0].successCriteria[0].evidenceIds = ["missing"];

    const errors = validateAccessibilityEvidence(manifest, {
      today: "2026-07-12",
      pathExists: () => true,
    });
    expect(errors).toContain(
      "components[0].successCriteria[0].evidenceIds references unknown evidence missing",
    );
    expect(errors).toContain(
      "components[0].manualEvidence is missing jaws-chrome-windows",
    );
  });

  it("rejects formal conformance without an assessment", () => {
    const manifest = validManifest();
    manifest.components[0].formallyConformant = true;

    expect(
      validateAccessibilityEvidence(manifest, {
        today: "2026-07-12",
        pathExists: () => true,
      }),
    ).toContain(
      "components[0].formallyConformant must remain false without a formal assessment",
    );
  });

  it("requires passed manual evidence before claiming support", () => {
    const manifest = validManifest();
    manifest.components[0].status = "supported";

    expect(
      validateAccessibilityEvidence(manifest, {
        today: "2026-07-12",
        pathExists: () => true,
      }),
    ).toContain(
      "components[0].status supported requires a current passed manual result for every supportMatrix entry",
    );
  });

  it("requires passed automated records before claiming tested behavior", () => {
    const manifest = validManifest();
    manifest.components[0].automatedEvidence[0].status = "failed";

    expect(
      validateAccessibilityEvidence(manifest, {
        today: "2026-07-12",
        pathExists: () => true,
      }),
    ).toContain(
      "components[0].status tested requires passed automated evidence",
    );
  });

  it("rejects automated evidence from an earlier review window", () => {
    const manifest = validManifest();
    manifest.components[0].automatedEvidence[0].recordedOn = "2026-07-11";

    expect(
      validateAccessibilityEvidence(manifest, {
        today: "2026-07-12",
        pathExists: () => true,
      }),
    ).toContain(
      "components[0].automatedEvidence[0].recordedOn must be within the active component review window",
    );
  });

  it("rejects manual evidence from an earlier review window", () => {
    const manifest = validManifest();
    manifest.components[0].manualEvidence[0] = {
      ...manifest.components[0].manualEvidence[0],
      status: "passed",
      recordedOn: "2026-07-11",
    };

    expect(
      validateAccessibilityEvidence(manifest, {
        today: "2026-07-12",
        pathExists: () => true,
      }),
    ).toContain(
      "components[0].manualEvidence[0].recordedOn must be within the active component review window",
    );
  });

  it("requires an owned, current record for exception status", () => {
    const manifest = validManifest();
    manifest.components[0].status = "exception";

    expect(
      validateAccessibilityEvidence(manifest, {
        today: "2026-07-12",
        pathExists: () => true,
      }),
    ).toContain(
      "components[0].status exception requires an active exception record",
    );

    manifest.components[0].exceptions = [
      {
        id: "spinner-announcement",
        impact: "Completion is not announced.",
        owner: "Salt maintainers",
        status: "open",
        reviewBy: "2026-07-11",
        successCriteria: ["4.1.2"],
      },
    ];
    expect(
      validateAccessibilityEvidence(manifest, {
        today: "2026-07-12",
        pathExists: () => true,
      }),
    ).toContain(
      "components[0].exceptions[0].reviewBy (2026-07-11) is stale as of 2026-07-12",
    );
  });
});
