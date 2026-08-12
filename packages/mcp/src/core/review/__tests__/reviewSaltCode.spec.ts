import { describe, expect, it } from "vitest";
import type { CatalogStoreV2 } from "../../catalog/catalogStoreV2.js";
import type { ProjectConventions } from "../../policy/index.js";
import { compileSaltProjectPolicyIrV2 } from "../../policy/projectPolicyIr.js";
import type {
  ComponentRecord,
  DeprecationRecord,
  SaltRegistry,
  TokenRecord,
} from "../../types.js";
import { createReviewCatalogFromLegacyRegistry } from "../reviewCatalogAdapter.js";
import {
  MAX_REVIEW_SUBMITTED_UTF8_BYTES,
  reviewSaltCode as reviewSaltCodeProduction,
} from "../reviewSaltCode.js";

function button(): ComponentRecord {
  return {
    id: "button",
    name: "Button",
    aliases: [],
    package: { name: "@salt-ds/core", status: "stable", since: null },
    summary: "Fixture Button.",
    status: "stable",
    category: ["action"],
    tags: [],
    when_to_use: ["Use for actions."],
    when_not_to_use: [
      "When the primary action is to take the user to another page or window rather than to trigger a function. Instead, use Link.",
    ],
    usage_content_ref: "content.component.button.usage",
    alternatives: [],
    props: ["oldProp", "variant"].map((name) => ({
      name,
      type: "string",
      required: false,
      description: "Fixture prop.",
      deprecated: false,
    })),
    prop_subjects: ["oldProp", "variant"].map((name) => ({
      package: "@salt-ds/core",
      entrypoint: ".",
      export_name: "ButtonProps",
      symbol_space: "type" as const,
      member_path: [{ kind: "prop" as const, name }],
    })),
    accessibility: { summary: [], rules: [] },
    patterns: [],
    examples: [],
    related_docs: {
      overview: null,
      usage: null,
      accessibility: null,
      examples: null,
    },
    source: {
      repo_path: "packages/core/src/button/Button.tsx",
      export_name: "Button",
    },
    deprecations: [
      "button.old-prop.deprecation",
      "button.variant.deprecation",
      "button.old-prop.invalid-version",
      "button.old-prop.invalid-removal",
      "button.other-props.variant.deprecation",
    ],
    last_verified_at: null,
  };
}

function registry(overrides: Partial<SaltRegistry> = {}): SaltRegistry {
  return {
    generated_at: null,
    version: "fixture-registry",
    semantic_hash: `sha256:${"a".repeat(64)}`,
    build_info: null,
    packages: [],
    components: [button()],
    icons: [],
    country_symbols: [],
    pages: [],
    patterns: [],
    guides: [],
    tokens: [],
    deprecations: [],
    examples: [],
    ...overrides,
  };
}

function fixtureStore(fixtureRegistry: SaltRegistry): CatalogStoreV2 {
  const contentRecords = new Map<string, unknown>();
  for (const component of fixtureRegistry.components) {
    if (component.usage_content_ref) {
      contentRecords.set(component.usage_content_ref, {
        when_to_use: component.when_to_use,
        when_not_to_use: component.when_not_to_use,
      });
    }
  }
  for (const deprecation of fixtureRegistry.deprecations) {
    contentRecords.set(`content.deprecation.${deprecation.id}`, {
      replacement: { target_ref: deprecation.replacement.target },
    });
  }
  return {
    manifest: {
      semantic_digest: fixtureRegistry.semantic_hash ?? "unavailable",
    },
    getRecord(family: string, id: string) {
      if (!fixtureRegistry.semantic_hash) return null;
      if (family === "component") {
        const component = fixtureRegistry.components.find(
          (candidate) => candidate.id === id,
        );
        return component ? { family, ...component } : null;
      }
      if (family === "deprecation") {
        const deprecation = fixtureRegistry.deprecations.find(
          (candidate) => candidate.id === id,
        );
        return deprecation
          ? {
              family,
              ...deprecation,
              subject_ref: deprecation.subject,
              detail_content_ref: {
                family: "content",
                codec: "json",
                id: `content.deprecation.${deprecation.id}`,
              },
            }
          : null;
      }
      if (family === "token_declaration") {
        const declaration = fixtureRegistry.tokens
          .flatMap((token) => token.declarations ?? [])
          .find((candidate) => candidate.id === id);
        return declaration ? { family, ...declaration } : null;
      }
      if (family === "content") {
        return contentRecords.has(id)
          ? { family, codec: "json", id, media_type: "application/json" }
          : null;
      }
      return null;
    },
    getContentJson(reference: { id: string }) {
      return contentRecords.get(reference.id) ?? null;
    },
  } as unknown as CatalogStoreV2;
}

function reviewSaltCode(
  fixtureRegistry: SaltRegistry,
  input: Parameters<typeof reviewSaltCodeProduction>[1],
  policy: Parameters<typeof reviewSaltCodeProduction>[2] = null,
) {
  return reviewSaltCodeProduction(
    {
      reviewCatalog: createReviewCatalogFromLegacyRegistry(fixtureRegistry),
      store: fixtureStore(fixtureRegistry),
    },
    input,
    policy,
  );
}

function reviewPolicy(conventions: ProjectConventions) {
  return {
    ir: compileSaltProjectPolicyIrV2({
      policyMode: "team",
      declared: true,
      layers: [
        {
          id: "team",
          scope: "team",
          source: {
            type: "file",
            declared_path: ".salt/team.json",
            resolved_path: "D:/fixture/.salt/team.json",
          },
          conventions,
        },
      ],
    }),
    root_dir: "D:/fixture",
    digest: `sha256:${"b".repeat(64)}`,
    salt_version: null,
  };
}

function deprecation(
  overrides: Partial<DeprecationRecord> = {},
): DeprecationRecord {
  const target = {
    package: "@salt-ds/core",
    entrypoint: ".",
    export_name: "Link",
    symbol_space: "value" as const,
    member_path: [],
  };
  return {
    id: "button.deprecation",
    subject: {
      package: "@salt-ds/core",
      entrypoint: ".",
      export_name: "Button",
      symbol_space: "value",
      member_path: [],
    },
    package: "@salt-ds/core",
    component: "Button",
    kind: "component",
    name: "Button",
    deprecated_in: "2.0.0",
    removed_in: "3.0.0",
    replacement: {
      mode: "single",
      target,
      targets: [target],
      type: "component",
      name: "Link",
      notes: null,
    },
    migration: {
      strategy: "replace",
      value_map: null,
      details: [],
    },
    source_paths: ["packages/core/src/button/Button.tsx"],
    source_occurrences: [],
    source_urls: [],
    ...overrides,
  };
}

function deprecatedToken(): TokenRecord {
  return {
    name: "--salt-old-token",
    category: "color",
    type: "color",
    value: null,
    declarations: [
      {
        id: "token-declaration.old-token",
        value: "#000",
        raw_selector: ":root",
        source_context: [],
        source_range: {
          start_offset: 0,
          end_offset: 10,
          start_line: 1,
          start_column: 1,
          end_line: 1,
          end_column: 11,
        },
        source_path: "packages/theme/old-token.css",
        dimensions: [],
        deprecated: true,
        replacement: "--salt-new-token",
      },
    ],
    semantic_intent: null,
    themes: [],
    densities: [],
    applies_to: [],
    guidance: [],
    aliases: [],
    policy: null,
    policy_gap: null,
    deprecated: true,
    last_verified_at: null,
  };
}

const NAVIGATION_SOURCE = [
  'import { Button } from "@salt-ds/core";',
  'export const Demo = () => <Button href="/next" />;',
].join("\n");

describe("bounded public review", () => {
  it("finds grounded navigation usage before its valid later import", () => {
    const result = reviewSaltCode(registry(), {
      artifacts: [
        {
          id: "later-import.tsx",
          language: "tsx",
          text: [
            'export const Demo = () => <Button href="/next" />;',
            'import { Button } from "@salt-ds/core";',
          ].join("\n"),
        },
      ],
    });

    expect(result.data.results[0]!.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          rule_id: "salt.component.action_navigation_target",
        }),
      ]),
    );
  });

  it("applies only established project-policy occurrences", () => {
    const source = [
      'import { Button } from "@salt-ds/core";',
      "export const Demo = () => <Button>Save</Button>;",
    ].join("\n");
    const inspect = (
      wrapper: NonNullable<ProjectConventions["approved_wrappers"]>[number],
    ) =>
      reviewSaltCode(
        registry(),
        { artifacts: [{ id: "policy.tsx", language: "tsx", text: source }] },
        reviewPolicy({
          contract: "project_conventions_v1",
          version: "1.0.0",
          approved_wrappers: [wrapper],
        }),
      );

    const applicable = inspect({
      name: "ActionButton",
      wraps: "Button",
      reason: "Team convention.",
    });
    expect(applicable.data.results[0]!.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          rule_id: "salt.project_policy.approved_wrapper",
          severity: "info",
          remediation: null,
          policy_evaluation: expect.objectContaining({
            trust: "untrusted_advisory",
            category: "approved_wrapper",
            conflict_group: null,
            competing_claims: [],
          }),
          evidence: expect.objectContaining({
            references: expect.arrayContaining([
              expect.objectContaining({
                locator: expect.stringMatching(
                  /^salt:\/\/project-policy\/v2\//u,
                ),
                field_path: "claim.declaration.name",
              }),
              expect.objectContaining({
                field_path: "claim.declaration.reason",
              }),
              expect.objectContaining({ field_path: "claim.selector" }),
              expect.objectContaining({ field_path: "claim.applicability" }),
              expect.objectContaining({
                field_path: "claim.source",
              }),
            ]),
          }),
        }),
      ]),
    );

    const opaque = inspect({
      name: "ContextButton",
      wraps: "Button",
      reason: "Conditional convention.",
      use_when: ["Only when an authored sentence says so."],
    });
    expect(
      opaque.data.results[0]!.findings.some((finding) =>
        finding.rule_id.startsWith("salt.project_policy."),
      ),
    ).toBe(false);
    expect(
      opaque.coverage.project_policy.unknown_occurrence_artifact_pairs,
    ).toBe(1);

    const migrationOnly = inspect({
      name: "MigrationButton",
      wraps: "Button",
      reason: "Migration-only shim.",
      migration_shim: true,
    });
    expect(
      migrationOnly.data.results[0]!.findings.some((finding) =>
        finding.rule_id.startsWith("salt.project_policy."),
      ),
    ).toBe(false);
    expect(
      migrationOnly.coverage.project_policy
        .contradicted_occurrence_artifact_pairs,
    ).toBe(1);

    const unverifiedImport = inspect({
      name: "ImportedButton",
      wraps: "Button",
      reason: "Must resolve before use.",
      import: { from: "./ImportedButton", name: "ImportedButton" },
    });
    expect(
      unverifiedImport.data.results[0]!.findings.some((finding) =>
        finding.rule_id.startsWith("salt.project_policy."),
      ),
    ).toBe(false);
    expect(unverifiedImport.data.results[0]!.limitations.join(" ")).toMatch(
      /import target was not verified/iu,
    );

    const versionedPolicy = reviewPolicy({
      contract: "project_conventions_v1",
      version: "1.0.0",
      supported_salt_range: "^2.0.0",
      approved_wrappers: [
        {
          name: "VersionedButton",
          wraps: "Button",
          reason: "Exact Core version required.",
        },
      ],
    });
    const reviewAtVersion = (version: string) =>
      reviewSaltCode(
        registry(),
        {
          artifacts: [{ id: "versioned.tsx", language: "tsx", text: source }],
          package_versions: { "@salt-ds/core": version },
        },
        versionedPolicy,
      );
    expect(
      reviewAtVersion("^2.0.0").data.results[0]!.findings.some(
        (finding) => finding.rule_id === "salt.project_policy.approved_wrapper",
      ),
    ).toBe(false);
    expect(
      reviewAtVersion("2.4.0").data.results[0]!.findings.find(
        (finding) => finding.rule_id === "salt.project_policy.approved_wrapper",
      )?.policy_evaluation?.salt_version,
    ).toBe("2.4.0");
  });

  it("returns cross-category policy conflicts for host arbitration", () => {
    const policy = reviewPolicy({
      contract: "project_conventions_v1",
      version: "1.0.0",
      preferred_components: [
        {
          salt_name: "Button",
          prefer: "PrimaryButton",
          reason: "Prefer the product wrapper.",
        },
      ],
      approved_wrappers: [
        {
          name: "ActionButton",
          wraps: "Button",
          reason: "Use the team wrapper.",
        },
      ],
    });
    const result = reviewSaltCode(
      registry(),
      {
        artifacts: [
          {
            id: "policy-conflict.tsx",
            language: "tsx",
            text: [
              'import { Button } from "@salt-ds/core";',
              "export const Demo = () => <Button>Save</Button>;",
            ].join("\n"),
          },
        ],
      },
      policy,
    );

    const findings = result.data.results[0]!.findings.filter((finding) =>
      finding.rule_id.startsWith("salt.project_policy."),
    );
    expect(findings).toHaveLength(2);
    const conflictGroups = new Set(
      findings.map((finding) => finding.policy_evaluation?.conflict_group),
    );
    expect(conflictGroups.size).toBe(1);
    expect([...conflictGroups][0]).toMatch(/^project-policy-conflict:/u);
    for (const finding of findings) {
      expect(finding).toMatchObject({
        severity: "info",
        remediation: null,
        policy_evaluation: {
          trust: "untrusted_advisory",
          competing_claims: [
            expect.objectContaining({
              locator: expect.stringMatching(/^salt:\/\/project-policy\/v2\//u),
            }),
          ],
        },
      });
    }
  });

  it("binds project-policy component selectors to one canonical package identity", () => {
    const policy = reviewPolicy({
      contract: "project_conventions_v1",
      version: "1.0.0",
      approved_wrappers: [
        {
          name: "ActionButton",
          wraps: "Button",
          reason: "Team convention.",
        },
      ],
    });
    const policyFindings = (source: string, fixtureRegistry = registry()) =>
      reviewSaltCode(
        fixtureRegistry,
        {
          artifacts: [
            { id: "package-identity.tsx", language: "tsx", text: source },
          ],
        },
        policy,
      );

    const wrongPackage = policyFindings(
      [
        'import { Button } from "@salt-ds/lab";',
        "export const Demo = () => <Button>Save</Button>;",
      ].join("\n"),
    );
    expect(
      wrongPackage.data.results[0]!.findings.filter(
        (finding) => finding.rule_id === "salt.project_policy.approved_wrapper",
      ),
    ).toEqual([]);

    const mixedPackages = policyFindings(
      [
        'import { Button as CoreButton } from "@salt-ds/core";',
        'import { Button as LabButton } from "@salt-ds/lab";',
        "export const Demo = () => (",
        "  <>",
        "    <CoreButton>Save</CoreButton>",
        "    <LabButton>Cancel</LabButton>",
        "  </>",
        ");",
      ].join("\n"),
    );
    const mixedPolicyFindings = mixedPackages.data.results[0]!.findings.filter(
      (finding) => finding.rule_id === "salt.project_policy.approved_wrapper",
    );
    expect(mixedPolicyFindings).toHaveLength(1);
    expect(mixedPolicyFindings[0]!.parsed_fact.subject).toBe(
      "@salt-ds/core#Button",
    );

    const labButton: ComponentRecord = {
      ...button(),
      id: "lab-button",
      package: { name: "@salt-ds/lab", status: "stable", since: null },
      source: {
        repo_path: "packages/lab/src/button/Button.tsx",
        export_name: "Button",
      },
    };
    const ambiguousCatalog = policyFindings(NAVIGATION_SOURCE, {
      ...registry(),
      components: [button(), labButton],
    });
    expect(
      ambiguousCatalog.data.results[0]!.findings.filter(
        (finding) => finding.rule_id === "salt.project_policy.approved_wrapper",
      ),
    ).toEqual([]);
    expect(ambiguousCatalog.data.results[0]!.limitations.join(" ")).toMatch(
      /one unique canonical catalog package identity/iu,
    );
    expect(ambiguousCatalog.data.results[0]!.coverage.policy).toMatchObject({
      status: "limited",
      applicable_occurrences: 0,
      contradicted_occurrences: 0,
      unknown_occurrences: 1,
    });
  });

  it("never turns an allow-local-aliases family policy into a replacement", () => {
    const token = deprecatedToken();
    token.deprecated = false;
    token.declarations = token.declarations?.map((declaration) => ({
      ...declaration,
      deprecated: false,
    }));
    const result = reviewSaltCode(
      registry({ tokens: [token] }),
      {
        artifacts: [
          {
            id: "tokens.css",
            language: "css",
            text: `.x { color: var(${token.name}); }`,
          },
        ],
      },
      reviewPolicy({
        contract: "project_conventions_v1",
        version: "1.0.0",
        token_family_policies: [
          {
            family: "color",
            mode: "allow-local-aliases",
            reason: "Local aliases are optional.",
          },
        ],
      }),
    );

    expect(result.data.results[0]!.findings).toEqual([]);
    expect(JSON.stringify(result)).not.toMatch(/replacement|use .*alias/iu);
  });

  it("withholds lower-layer policy when a required higher layer is unresolved", () => {
    const policy = reviewPolicy({
      contract: "project_conventions_v1",
      version: "1.0.0",
      approved_wrappers: [
        {
          name: "ActionButton",
          wraps: "Button",
          reason: "Team convention.",
        },
      ],
    });
    const lowerLayer = policy.ir.layers[0]!;
    policy.ir.layers.push({
      ...lowerLayer,
      layer_id: "required-project-layer",
      layer_index: 1,
      optional: false,
      source: {
        type: "file",
        declared_path: ".salt/project.json",
        resolved_path: null,
      },
      resolution_status: "missing",
      occurrence_ids: [],
    });

    const result = reviewSaltCode(
      registry(),
      {
        artifacts: [
          {
            id: "unresolved-layer.tsx",
            language: "tsx",
            text: NAVIGATION_SOURCE,
          },
        ],
      },
      policy,
    );

    expect(
      result.data.results[0]!.findings.some((finding) =>
        finding.rule_id.startsWith("salt.project_policy."),
      ),
    ).toBe(false);
    expect(result.data.results[0]!.coverage.policy.unknown_occurrences).toBe(1);
    expect(result.data.results[0]!.limitations.join(" ")).toMatch(
      /required later policy layer was unresolved/iu,
    );
  });

  it("reports a sole unresolved required policy layer as limited", () => {
    const policy = reviewPolicy({
      contract: "project_conventions_v1",
      version: "1.0.0",
    });
    policy.ir.layers[0] = {
      ...policy.ir.layers[0]!,
      resolution_status: "missing",
      occurrence_ids: [],
    };

    const result = reviewSaltCode(
      registry(),
      {
        artifacts: [
          {
            id: "missing-policy.tsx",
            language: "tsx",
            text: NAVIGATION_SOURCE,
          },
        ],
      },
      policy,
    );

    expect(result.data.results[0]!.coverage.policy).toMatchObject({
      status: "limited",
      unresolved_required_layers: 1,
      evaluated_occurrences: 0,
    });
    expect(result.coverage.project_policy).toMatchObject({
      status: "limited",
      unresolved_required_layers: 1,
    });
    expect(result.data.results[0]!.limitations.join(" ")).toMatch(
      /required project-policy layer was unresolved/iu,
    );
  });

  it("binds a matched fact to an exact submitted range and catalog field", () => {
    const result = reviewSaltCode(registry(), {
      artifacts: [{ id: "demo", language: "tsx", text: NAVIGATION_SOURCE }],
    });
    const finding = result.data.results[0]!.findings[0]!;

    expect(finding).toMatchObject({
      rule_id: "salt.component.action_navigation_target",
      parsed_fact: {
        kind: "jsx_prop",
        property: "href",
        certainty: "known",
      },
      evidence: {
        submitted_artifact_id: "demo",
        validation: "source_bound",
        references: [
          {
            locator: expect.stringMatching(
              /^salt:\/\/catalog\/v2\/sha256-a{64}\/content\/content\.component\.button\.usage$/u,
            ),
            field_path: "when_not_to_use.0",
          },
        ],
      },
    });
    expect(
      Buffer.from(NAVIGATION_SOURCE, "utf8")
        .subarray(finding.location.start_offset, finding.location.end_offset)
        .toString("utf8"),
    ).toBe('href="/next"');
  });

  it("discloses a matched rule whose exact catalog evidence is unavailable", () => {
    const result = reviewSaltCode(registry({ semantic_hash: null }), {
      artifacts: [{ id: "demo", language: "tsx", text: NAVIGATION_SOURCE }],
    });

    expect(result.data.results[0]).toMatchObject({
      outcome: "no_findings_in_evaluated_scope",
      findings: [],
      coverage: { skipped_rule_matches: 1 },
      limitations: [
        expect.stringContaining(
          "exact source-bound catalog evidence was unavailable",
        ),
        expect.any(String),
      ],
    });
  });

  it("does not claim rules were evaluated for malformed input", () => {
    const result = reviewSaltCode(registry(), {
      artifacts: [{ id: "broken", language: "tsx", text: "const broken = <" }],
    });
    expect(result.data.results[0]).toMatchObject({
      outcome: "not_evaluated",
      findings: [],
      coverage: { evaluated_rule_ids: [] },
    });
  });

  it("rejects duplicate artifact ids and non-exact versions do not broaden matching deprecations", () => {
    expect(() =>
      reviewSaltCode(registry(), {
        artifacts: [
          { id: "duplicate", language: "javascript", text: "const a = 1;" },
          { id: "duplicate", language: "javascript", text: "const b = 2;" },
        ],
      }),
    ).toThrow(/unique artifact ids/iu);

    for (const packageVersion of [
      "not-a-version",
      "release-2.3.4",
      "2.3",
      "^2.3.4",
      ">=2",
      "workspace:^2.3.4",
    ]) {
      const invalidVersion = reviewSaltCode(
        registry({ deprecations: [deprecation()] }),
        {
          package_versions: { "@salt-ds/core": packageVersion },
          artifacts: [{ id: "demo", language: "tsx", text: NAVIGATION_SOURCE }],
        },
      );
      expect(invalidVersion.data.results[0]!.findings).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({ rule_id: "salt.deprecation.used_import" }),
        ]),
      );
      expect(invalidVersion.data.results[0]!.limitations.join(" ")).toMatch(
        /not valid exact semantic versions/iu,
      );
    }
  });

  it("does not claim an invalid version skipped a deprecation when no candidate matched", () => {
    const result = reviewSaltCode(registry(), {
      package_versions: { "@salt-ds/core": "invalid" },
      artifacts: [{ id: "demo", language: "tsx", text: NAVIGATION_SOURCE }],
    });

    expect(result.data.results[0]!.limitations.join(" ")).not.toMatch(
      /valid exact semantic versions/iu,
    );
    expect(result.data.results[0]!.coverage.skipped_rule_matches).toBe(0);
  });

  it("does not infer navigation policy from approximate prose", () => {
    const approximate = button();
    approximate.when_not_to_use = [
      "Avoid navigation links and href targets when another choice is available.",
    ];
    const result = reviewSaltCode(registry({ components: [approximate] }), {
      artifacts: [{ id: "demo", language: "tsx", text: NAVIGATION_SOURCE }],
    });

    expect(result.data.results[0]).toMatchObject({
      findings: [],
      coverage: { skipped_rule_matches: 1 },
    });
  });

  it("cites the exact reordered navigation-policy statement", () => {
    const reordered = button();
    reordered.when_not_to_use.unshift("Another exact policy statement.");
    const result = reviewSaltCode(registry({ components: [reordered] }), {
      artifacts: [{ id: "demo", language: "tsx", text: NAVIGATION_SOURCE }],
    });

    expect(result.data.results[0]!.findings[0]!.evidence.references[0]).toEqual(
      expect.objectContaining({ field_path: "when_not_to_use.1" }),
    );
  });

  it("requires a non-empty static navigation destination", () => {
    const source = [
      'import { Button } from "@salt-ds/core";',
      "export const Demo = () => (",
      '  <><Button href="" /><Button href="   " /><Button href="#" /><Button to="/next" /></>',
      ");",
    ].join("\n");
    const result = reviewSaltCode(registry(), {
      artifacts: [{ id: "demo", language: "tsx", text: source }],
    });

    expect(result.data.results[0]!.findings).toHaveLength(2);
    expect(
      result.data.results[0]!.findings.map(
        (finding) => finding.parsed_fact.property,
      ),
    ).toEqual(["href", "to"]);
  });

  it("uses exact package versions for removal severity and complete evidence", () => {
    const fixtureRegistry = registry({ deprecations: [deprecation()] });
    const beforeRemoval = reviewSaltCode(fixtureRegistry, {
      package_versions: { "@salt-ds/core": "2.9.9" },
      artifacts: [{ id: "demo", language: "tsx", text: NAVIGATION_SOURCE }],
    });
    const atRemoval = reviewSaltCode(fixtureRegistry, {
      package_versions: { "@salt-ds/core": "3.0.0" },
      artifacts: [{ id: "demo", language: "tsx", text: NAVIGATION_SOURCE }],
    });
    const withoutVersion = reviewSaltCode(fixtureRegistry, {
      artifacts: [{ id: "demo", language: "tsx", text: NAVIGATION_SOURCE }],
    });
    const importFinding = (result: typeof beforeRemoval) =>
      result.data.results[0]!.findings.find(
        (finding) => finding.rule_id === "salt.deprecation.used_import",
      )!;

    expect(importFinding(beforeRemoval).severity).toBe("warning");
    expect(importFinding(atRemoval).severity).toBe("error");
    expect(importFinding(withoutVersion).severity).toBe("warning");
    expect(
      importFinding(atRemoval).evidence.references.map((ref) => ref.field_path),
    ).toEqual([
      "subject_ref",
      "deprecated_in",
      "removed_in",
      "replacement.target_ref",
    ]);
  });

  it("uses the canonical package version for a subpath import", () => {
    const adapterDeprecation = deprecation({
      id: "adapter-moment.deprecation",
      package: "@salt-ds/date-adapters",
      component: null,
      name: "AdapterMoment",
      subject: {
        package: "@salt-ds/date-adapters",
        entrypoint: "./moment",
        export_name: "AdapterMoment",
        symbol_space: "value",
        member_path: [],
      },
    });
    const source = [
      'import { AdapterMoment } from "@salt-ds/date-adapters/moment";',
      "export const adapter = AdapterMoment;",
    ].join("\n");
    const fixtureRegistry = registry({ deprecations: [adapterDeprecation] });
    const reviewAt = (version: string) =>
      reviewSaltCode(fixtureRegistry, {
        package_versions: { "@salt-ds/date-adapters": version },
        artifacts: [{ id: "adapter", language: "typescript", text: source }],
      });
    const findingAt = (version: string) =>
      reviewAt(version).data.results[0]!.findings.find(
        (finding) => finding.rule_id === "salt.deprecation.used_import",
      );

    expect(findingAt("1.9.9")).toBeUndefined();
    expect(findingAt("2.0.0")?.severity).toBe("warning");
    expect(findingAt("3.0.0")?.severity).toBe("error");
    expect(
      reviewAt("2.0.0").data.results[0]!.limitations.join(" "),
    ).not.toMatch(/No package_versions entry/iu);
  });

  it("does not turn erased TypeScript references into value deprecations", () => {
    const source = [
      'import { Button } from "@salt-ds/core";',
      "interface Fixture extends Button {}",
      "class Demo implements Button {}",
      "export type { Button };",
    ].join("\n");
    const result = reviewSaltCode(registry({ deprecations: [deprecation()] }), {
      artifacts: [{ id: "types", language: "typescript", text: source }],
    });

    expect(result.data.results[0]!.findings).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ rule_id: "salt.deprecation.used_import" }),
      ]),
    );
  });

  it("does not turn typeof or ambient heritage into value deprecations", () => {
    const source = [
      'import { Button } from "@salt-ds/core";',
      "type ButtonConstructor = typeof Button;",
      "declare class Demo extends Button {}",
    ].join("\n");
    const result = reviewSaltCode(registry({ deprecations: [deprecation()] }), {
      artifacts: [
        { id: "ambient-types", language: "typescript", text: source },
      ],
    });

    expect(result.data.results[0]!.findings).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ rule_id: "salt.deprecation.used_import" }),
      ]),
    );
  });

  it("does not ground component rules through a type-only JSX import", () => {
    const source = [
      'import type { Button } from "@salt-ds/core";',
      'export const Demo = () => <Button href="/next" />;',
    ].join("\n");
    const result = reviewSaltCode(registry({ deprecations: [deprecation()] }), {
      artifacts: [{ id: "type-only-jsx", language: "tsx", text: source }],
    });

    expect(result.data.results[0]!.findings).toEqual([]);
    expect(result.data.results[0]!.limitations).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/type-only Salt import/iu),
      ]),
    );
  });

  it("grounds deprecated tokens in canonical declaration records", () => {
    const result = reviewSaltCode(registry({ tokens: [deprecatedToken()] }), {
      artifacts: [
        {
          id: "demo.css",
          language: "css",
          text: ".demo { color: var(--salt-old-token); }",
        },
      ],
    });
    const finding = result.data.results[0]!.findings.find(
      (candidate) => candidate.rule_id === "salt.token.deprecated_identity",
    );

    expect(finding?.evidence.references).toEqual([
      {
        locator: expect.stringMatching(
          /\/token-declarations\/token-declaration\.old-token$/u,
        ),
        field_path: "deprecated",
      },
    ]);
  });

  it("skips versioned deprecations with incomplete timing metadata", () => {
    const result = reviewSaltCode(
      registry({ deprecations: [deprecation({ deprecated_in: null })] }),
      {
        package_versions: { "@salt-ds/core": "3.0.0" },
        artifacts: [{ id: "demo", language: "tsx", text: NAVIGATION_SOURCE }],
      },
    );

    expect(result.data.results[0]!.findings).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ rule_id: "salt.deprecation.used_import" }),
      ]),
    );
    expect(result.data.results[0]!.limitations.join(" ")).toMatch(
      /deprecated_in was missing or invalid/iu,
    );
  });

  it("skips import and prop deprecations with invalid removal metadata", () => {
    const propDeprecation = deprecation({
      id: "button.old-prop.invalid-removal",
      kind: "prop",
      name: "oldProp",
      removed_in: "not-semver",
      subject: {
        package: "@salt-ds/core",
        entrypoint: ".",
        export_name: "ButtonProps",
        symbol_space: "type",
        member_path: [{ kind: "prop", name: "oldProp" }],
      },
    });
    const source = [
      'import { Button } from "@salt-ds/core";',
      'export const Demo = () => <Button oldProp="legacy" />;',
    ].join("\n");
    const result = reviewSaltCode(
      registry({
        deprecations: [
          deprecation({ removed_in: "not-semver" }),
          propDeprecation,
        ],
      }),
      {
        package_versions: { "@salt-ds/core": "3.0.0" },
        artifacts: [{ id: "demo", language: "tsx", text: source }],
      },
    );
    const reviewed = result.data.results[0]!;

    expect(reviewed.findings.map((finding) => finding.rule_id)).not.toEqual(
      expect.arrayContaining([
        "salt.deprecation.used_import",
        "salt.deprecation.static_prop",
      ]),
    );
    expect(reviewed.limitations.join(" ")).toMatch(
      /removed_in was invalid for the applicable supplied package version/iu,
    );
    expect(reviewed.coverage.skipped_rule_matches).toBeGreaterThanOrEqual(2);
  });

  it("applies version timing independently to each imported Salt package", () => {
    const labDeprecation = deprecation({
      id: "lab-thing.deprecation",
      package: "@salt-ds/lab",
      component: "LabThing",
      name: "LabThing",
      removed_in: "5.0.0",
      subject: {
        package: "@salt-ds/lab",
        entrypoint: ".",
        export_name: "LabThing",
        symbol_space: "value",
        member_path: [],
      },
    });
    const source = [
      'import { Button } from "@salt-ds/core";',
      'import { LabThing } from "@salt-ds/lab";',
      "export const used = [Button, LabThing];",
    ].join("\n");
    const fixtureRegistry = registry({
      deprecations: [deprecation(), labDeprecation],
    });
    const result = reviewSaltCode(fixtureRegistry, {
      package_versions: {
        "@salt-ds/core": "3.0.0",
        "@salt-ds/lab": "4.0.0",
      },
      artifacts: [{ id: "mixed", language: "typescript", text: source }],
    });
    const deprecations = result.data.results[0]!.findings.filter(
      (finding) => finding.rule_id === "salt.deprecation.used_import",
    );

    expect(deprecations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          severity: "error",
          parsed_fact: expect.objectContaining({
            subject: "@salt-ds/core#Button",
          }),
        }),
        expect.objectContaining({
          severity: "warning",
          parsed_fact: expect.objectContaining({
            subject: "@salt-ds/lab#LabThing",
          }),
        }),
      ]),
    );

    const invalidLab = reviewSaltCode(fixtureRegistry, {
      package_versions: {
        "@salt-ds/core": "3.0.0",
        "@salt-ds/lab": "invalid",
      },
      artifacts: [{ id: "mixed", language: "typescript", text: source }],
    });
    expect(invalidLab.data.results[0]!.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          severity: "error",
          parsed_fact: expect.objectContaining({
            subject: "@salt-ds/core#Button",
          }),
        }),
      ]),
    );
    expect(invalidLab.data.results[0]!.limitations.join(" ")).toContain(
      "@salt-ds/lab",
    );
  });

  it("prioritizes later errors over earlier warnings when truncating", () => {
    const textDeprecation = deprecation({
      id: "text.deprecation",
      component: "Text",
      name: "Text",
      subject: {
        package: "@salt-ds/core",
        entrypoint: ".",
        export_name: "Text",
        symbol_space: "value",
        member_path: [],
      },
    });
    const result = reviewSaltCode(
      registry({ deprecations: [textDeprecation] }),
      {
        package_versions: { "@salt-ds/core": "3.0.0" },
        max_findings: 1,
        artifacts: [
          { id: "warning.tsx", language: "tsx", text: NAVIGATION_SOURCE },
          {
            id: "error.ts",
            language: "typescript",
            text: [
              'import { Text } from "@salt-ds/core";',
              "export const Used = Text;",
            ].join("\n"),
          },
        ],
      },
    );

    expect(result.coverage.returned_findings).toBe(1);
    expect(result.data.results[0]!.findings).toEqual([]);
    expect(result.data.results[1]!.findings).toEqual([
      expect.objectContaining({ severity: "error" }),
    ]);
  });

  it("bounds the number of per-package version entries", () => {
    expect(() =>
      reviewSaltCode(registry(), {
        package_versions: Object.fromEntries(
          Array.from({ length: 33 }, (_, index) => [
            `@salt-ds/package-${index}`,
            "2.0.0",
          ]),
        ),
        artifacts: [{ id: "demo", language: "tsx", text: NAVIGATION_SOURCE }],
      }),
    ).toThrow(/at most 32 package_versions entries/iu);
  });

  it("does not echo an unbounded package name into review limitations", () => {
    const packageName = `@salt-ds/${"x".repeat(40_000)}`;
    const result = reviewSaltCode(registry(), {
      artifacts: [
        {
          id: "oversized-package-name",
          language: "typescript",
          text: `import { Fixture } from "${packageName}";\nexport { Fixture };`,
        },
      ],
    });

    expect(JSON.stringify(result)).not.toContain(packageName);
    expect(Buffer.byteLength(JSON.stringify(result), "utf8")).toBeLessThan(
      64 * 1024,
    );
  });

  it("scopes stable finding ids to their submitted artifact", () => {
    const result = reviewSaltCode(registry(), {
      artifacts: [
        { id: "a.tsx", language: "tsx", text: NAVIGATION_SOURCE },
        { id: "b.tsx", language: "tsx", text: NAVIGATION_SOURCE },
      ],
    });
    const [first, second] = result.data.results;
    const firstId = first?.findings[0]?.id;
    const secondId = second?.findings[0]?.id;

    expect(firstId).toBeTruthy();
    expect(secondId).toBeTruthy();
    expect(firstId).not.toBe(secondId);
    expect(
      reviewSaltCode(registry(), {
        artifacts: [{ id: "a.tsx", language: "tsx", text: NAVIGATION_SOURCE }],
      }).data.results[0]?.findings[0]?.id,
    ).toBe(firstId);
  });

  it("checks statically named deprecated props with dynamic values", () => {
    const propDeprecation = deprecation({
      id: "button.old-prop.deprecation",
      kind: "prop",
      name: "oldProp",
      removed_in: null,
      subject: {
        package: "@salt-ds/core",
        entrypoint: ".",
        export_name: "ButtonProps",
        symbol_space: "type",
        member_path: [{ kind: "prop", name: "oldProp" }],
      },
    });
    const source = [
      'import { Button } from "@salt-ds/core";',
      "export const Demo = (value: string) => <Button oldProp={value} />;",
    ].join("\n");
    const result = reviewSaltCode(
      registry({ deprecations: [propDeprecation] }),
      {
        artifacts: [{ id: "demo", language: "tsx", text: source }],
      },
    );

    expect(result.data.results[0]!.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ rule_id: "salt.deprecation.static_prop" }),
      ]),
    );
  });

  it("matches prop deprecations through exact component ownership and fails closed on ambiguity", () => {
    const propDeprecation = deprecation({
      id: "button.variant.deprecation",
      kind: "prop",
      name: "variant",
      removed_in: null,
      subject: {
        package: "@salt-ds/core",
        entrypoint: ".",
        export_name: "ButtonProps",
        symbol_space: "type",
        member_path: [{ kind: "prop", name: "variant" }],
      },
    });
    const source = [
      'import { Button } from "@salt-ds/core";',
      'export const Demo = () => <Button variant="primary" />;',
    ].join("\n");
    const inspect = (
      components: ComponentRecord[],
      candidate: DeprecationRecord = propDeprecation,
    ) =>
      reviewSaltCode(registry({ components, deprecations: [candidate] }), {
        artifacts: [{ id: "prop", language: "tsx", text: source }],
      }).data.results[0]!.findings.filter(
        (finding) => finding.rule_id === "salt.deprecation.static_prop",
      );

    expect(inspect([button()])).toHaveLength(1);
    expect(
      inspect([button()], { ...propDeprecation, component: "Text" }),
    ).toHaveLength(1);
    expect(
      inspect([button()], { ...propDeprecation, component: null }),
    ).toHaveLength(1);
    expect(
      inspect([button()], {
        ...propDeprecation,
        id: "button.other-props.variant.deprecation",
        subject: {
          ...propDeprecation.subject,
          export_name: "OtherProps",
        },
      }),
    ).toHaveLength(0);
    const ambiguous = button();
    ambiguous.id = "button.second-owner";
    expect(inspect([button(), ambiguous])).toHaveLength(0);
  });

  it("matches a shared inherited prop identity on each consuming component", () => {
    const sharedDeprecation = deprecation({
      id: "text.variant.deprecation",
      kind: "prop",
      name: "variant",
      removed_in: null,
      component: "Text",
      subject: {
        package: "@salt-ds/core",
        entrypoint: ".",
        export_name: "TextProps",
        symbol_space: "type",
        member_path: [{ kind: "prop", name: "variant" }],
      },
    });
    const sharedComponent = (name: "Text" | "Link") => {
      const component = button();
      component.id = name.toLowerCase();
      component.name = name;
      component.source.export_name = name;
      component.prop_subjects = [
        {
          package: "@salt-ds/core",
          entrypoint: ".",
          export_name: "TextProps",
          symbol_space: "type",
          member_path: [{ kind: "prop", name: "variant" }],
        },
      ];
      return component;
    };
    const fixtureRegistry = registry({
      components: [sharedComponent("Text"), sharedComponent("Link")],
      deprecations: [sharedDeprecation],
    });

    for (const componentName of ["Text", "Link"]) {
      const result = reviewSaltCode(fixtureRegistry, {
        artifacts: [
          {
            id: componentName,
            language: "tsx",
            text: `import { ${componentName} } from "@salt-ds/core";\nexport const Demo = () => <${componentName} variant="primary" />;`,
          },
        ],
      });
      expect(
        result.data.results[0]!.findings.filter(
          (finding) => finding.rule_id === "salt.deprecation.static_prop",
        ),
      ).toHaveLength(1);
    }
  });

  it("counts only matching deprecations skipped by an invalid package version", () => {
    const propDeprecation = deprecation({
      id: "button.old-prop.invalid-version",
      kind: "prop",
      name: "oldProp",
      subject: {
        package: "@salt-ds/core",
        entrypoint: ".",
        export_name: "ButtonProps",
        symbol_space: "type",
        member_path: [{ kind: "prop", name: "oldProp" }],
      },
    });
    const source = [
      'import { Button } from "@salt-ds/core";',
      'export const Demo = () => <Button oldProp="legacy" />;',
    ].join("\n");
    const result = reviewSaltCode(
      registry({ deprecations: [deprecation(), propDeprecation] }),
      {
        package_versions: { "@salt-ds/core": "invalid" },
        artifacts: [{ id: "invalid", language: "tsx", text: source }],
      },
    );

    expect(result.data.results[0]!.coverage.skipped_rule_matches).toBe(2);
    expect(result.data.results[0]!.limitations.join(" ")).toMatch(
      /skipped 1 matching deprecation record/iu,
    );
  });

  it("enforces the aggregate direct-core UTF-8 input budget", () => {
    const artifactText = `/*${"x".repeat(MAX_REVIEW_SUBMITTED_UTF8_BYTES / 4 - 4)}*/`;
    const artifacts = Array.from({ length: 4 }, (_, index) => ({
      id: `artifact-${index}`,
      language: "javascript" as const,
      text: artifactText,
    }));
    expect(
      artifacts.reduce(
        (total, artifact) => total + Buffer.byteLength(artifact.text, "utf8"),
        0,
      ),
    ).toBe(MAX_REVIEW_SUBMITTED_UTF8_BYTES);
    expect(() => reviewSaltCode(registry(), { artifacts })).not.toThrow();
    artifacts[3]!.text += "x";
    expect(() => reviewSaltCode(registry(), { artifacts })).toThrow(
      /aggregate submitted UTF-8 bytes/iu,
    );
  });

  it("enforces the per-artifact UTF-8 byte budget", () => {
    expect(() =>
      reviewSaltCode(registry(), {
        artifacts: [
          {
            id: "multibyte.js",
            language: "javascript",
            text: `/*${"é".repeat(140_000)}*/`,
          },
        ],
      }),
    ).toThrow(/UTF-8 bytes per artifact/iu);
  });

  it("bounds direct-core artifact count and identifier size before analysis", () => {
    expect(() => reviewSaltCode(registry(), { artifacts: [] })).toThrow(
      /between 1 and 8 artifacts/iu,
    );
    expect(() =>
      reviewSaltCode(registry(), {
        artifacts: Array.from({ length: 9 }, (_, index) => ({
          id: `artifact-${index}`,
          language: "javascript" as const,
          text: " ",
        })),
      }),
    ).toThrow(/between 1 and 8 artifacts/iu);
    expect(() =>
      reviewSaltCode(registry(), {
        artifacts: [
          {
            id: "x".repeat(513),
            language: "javascript",
            text: " ",
          },
        ],
      }),
    ).toThrow(/artifact ids/iu);
    expect(() =>
      reviewSaltCode(registry(), {
        artifacts: [
          {
            id: "\0".repeat(512),
            language: "javascript",
            text: "export {};",
          },
        ],
      }),
    ).toThrow(/JSON-encoded UTF-8 bytes/iu);
  });

  it("does not return partial facts or rule coverage after an analysis limit", () => {
    const result = reviewSaltCode(registry(), {
      artifacts: [
        {
          id: "complex.js",
          language: "javascript",
          text: `const values = [${Array.from({ length: 60_000 }, () => "0").join(",")}];`,
        },
      ],
    });

    expect(result.data.results[0]).toMatchObject({
      outcome: "not_evaluated",
      findings: [],
      coverage: {
        parser: "limited",
        fact_counts: [],
        evaluated_rule_ids: [],
        detected_findings: 0,
        returned_findings: 0,
      },
    });
  });

  it("allocates structural work budgets fairly across artifacts", () => {
    const text = `const values = [${Array.from({ length: 40_000 }, () => "0").join(",")}];`;
    const result = reviewSaltCode(registry(), {
      artifacts: Array.from({ length: 3 }, (_, index) => ({
        id: `aggregate-${index}.js`,
        language: "javascript" as const,
        text,
      })),
    });

    expect(result.data.results.map((entry) => entry.coverage.parser)).toEqual([
      "limited",
      "limited",
      "limited",
    ]);
    for (const entry of result.data.results) {
      expect(entry).toMatchObject({
        outcome: "not_evaluated",
        findings: [],
        coverage: { fact_counts: [], evaluated_rule_ids: [] },
      });
    }
  });
});
