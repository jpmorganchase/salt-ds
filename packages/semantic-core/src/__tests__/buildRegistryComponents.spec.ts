import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { extractComponents } from "../build/buildRegistryComponents.js";
import { buildComponentContext } from "../contextArtifacts.js";
import { buildContextCoverageAudit } from "../contextCoverageAudit.js";
import { validateGeneratedArtifactEvidence } from "../evidence.js";
import { validateGeneratedArtifactRegistryEvidence } from "../generatedArtifactValidation.js";
import type { ComponentRecord, PackageRecord, SaltRegistry } from "../types.js";
import { validateSaltContextCoverageAuditSchema } from "./contextCoverageAuditSchemaTestUtils.js";

// All Salt-looking strings in this file are intentionally tiny fixture facts.
const GENERATED_AT = "2026-05-03T00:00:00.000Z";
const GENERATOR = {
  name: "semantic-core component registry fixture",
  version: "0.0.0",
};

function buildFixturePackage(): PackageRecord {
  return {
    id: "package.fixture",
    name: "@salt-ds/fixture",
    status: "stable",
    version: "0.0.0",
    summary: "Fixture package for registry extraction tests.",
    source_root: "packages/fixture",
    changelog_path: null,
    docs_root: "/salt/components",
  };
}

function buildFixtureRegistry(component: ComponentRecord): SaltRegistry {
  return {
    generated_at: GENERATED_AT,
    version: "fixture-registry",
    build_info: null,
    packages: [buildFixturePackage()],
    components: [component],
    icons: [],
    country_symbols: [],
    pages: [],
    patterns: [],
    guides: [],
    tokens: [],
    deprecations: [],
    examples: [],
    changes: [],
    search_index: [],
  };
}

async function writeFixtureRepo(
  repoRoot: string,
  options: {
    accessibilityContent?: string;
    sourceContent?: string;
  } = {},
): Promise<void> {
  const componentDir = path.join(
    repoRoot,
    "site/docs/components/fixture-action",
  );
  const exampleDir = path.join(repoRoot, "site/src/examples/fixture-action");
  const accessibilityContent =
    options.accessibilityContent ??
    `---
title: Fixture action accessibility
---

Use the fixture action with an explicit accessible label.

## Keyboard interactions

| Key | Description |
| --- | --- |
| Tab | Moves focus to the fixture action. |

## Accessibility considerations

Announce fixture state changes through source-backed fixture text.
`;

  await fs.mkdir(componentDir, { recursive: true });
  await fs.mkdir(exampleDir, { recursive: true });
  if (options.sourceContent) {
    const sourceDir = path.join(
      repoRoot,
      "packages/fixture/src/fixture-action",
    );
    await fs.mkdir(sourceDir, { recursive: true });
    await fs.writeFile(
      path.join(sourceDir, "Foo.tsx"),
      options.sourceContent,
      "utf8",
    );
  }
  await fs.writeFile(
    path.join(repoRoot, "site/component-category-map.json"),
    `${JSON.stringify(
      {
        components: {
          fixtureAction: {
            route: "/salt/components/fixture-action/index",
            category: "Fixture",
          },
        },
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
  await fs.writeFile(
    path.join(componentDir, "index.mdx"),
    `---
layout: DetailComponent
title: Fixture action
data:
  package:
    name: "@salt-ds/fixture"
  description: Fixture source-backed action component.
  sourceCodeUrl: https://github.com/example/fixture/blob/main/packages/fixture/src/fixture-action/Foo.tsx
---

Fixture source-backed action component overview.
`,
    "utf8",
  );
  await fs.writeFile(
    path.join(componentDir, "accessibility.mdx"),
    accessibilityContent,
    "utf8",
  );
  await fs.writeFile(
    path.join(componentDir, "examples.mdx"),
    `## Basic fixture action

Fixture source-backed example.

<LivePreview componentName="fixture-action" exampleName="BasicFixtureAction" displayName="Basic fixture action" />
`,
    "utf8",
  );
  await fs.writeFile(
    path.join(exampleDir, "BasicFixtureAction.tsx"),
    `export function BasicFixtureAction() {
  return <FixtureAction />;
}
`,
    "utf8",
  );
}

describe("component registry extraction", () => {
  it("extracts fixture accessibility guidance from source docs without Best practices and preserves EvidenceRefs", async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-component-registry-fixture-"),
    );

    try {
      await writeFixtureRepo(repoRoot);

      const components = await extractComponents(
        repoRoot,
        new Map([[buildFixturePackage().name, buildFixturePackage()]]),
        { byPackage: new Map() },
        GENERATED_AT,
      );

      expect(components).toHaveLength(1);
      const component = components[0];
      expect(component.accessibility.summary).toEqual([
        "Use the fixture action with an explicit accessible label.",
        "Announce fixture state changes through source-backed fixture text.",
      ]);
      expect(component.accessibility.summary.join(" ")).not.toMatch(
        /Keyboard interactions|Moves focus|Tab/i,
      );
      expect(component.accessibility.rules).toEqual([
        {
          id: "fixture-action-a11y-1",
          severity: "warning",
          rule: "Use the fixture action with an explicit accessible label.",
        },
        {
          id: "fixture-action-a11y-2",
          severity: "warning",
          rule: "Announce fixture state changes through source-backed fixture text.",
        },
      ]);

      const registry = buildFixtureRegistry(component);
      const context = buildComponentContext({
        registry,
        component,
        generated_at: GENERATED_AT,
        generator: GENERATOR,
        registry_hash: "fixture-registry-hash",
      });
      const accessibilityClaim = context.generated_artifact.claims.find(
        (claim) => claim.field_path === "accessibility.summary.0",
      );
      const accessibilityEvidenceRef = context.evidence_refs.find(
        (ref) => ref.id === accessibilityClaim?.evidence_ref_ids[0],
      );

      expect(context.status).toBe("validated");
      expect(accessibilityClaim).toEqual(
        expect.objectContaining({
          kind: "accessibility",
          evidence_ref_ids: [expect.any(String)],
        }),
      );
      expect(accessibilityEvidenceRef).toEqual(
        expect.objectContaining({
          source_kind: "registry",
          claim_kind: "accessibility",
          registry: expect.objectContaining({
            entity_id: "component.fixture-action",
            field_path: "accessibility.summary.0",
          }),
          source: expect.objectContaining({
            url: "/salt/components/fixture-action/accessibility",
            repo_path: "packages/fixture/src/fixture-action/Foo.tsx",
          }),
        }),
      );
      expect(
        validateGeneratedArtifactEvidence(context.generated_artifact),
      ).toEqual([]);
      expect(
        validateGeneratedArtifactRegistryEvidence(
          context.generated_artifact,
          registry,
        ),
      ).toEqual([]);
    } finally {
      await fs.rm(repoRoot, { recursive: true, force: true });
    }
  });

  it("keeps keyboard-only fixture accessibility docs as a registry gap without inventing claims", async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-component-keyboard-fixture-"),
    );

    try {
      await writeFixtureRepo(repoRoot, {
        accessibilityContent: `---
title: Fixture action accessibility
---

## Keyboard interactions

<KeyboardControls>
  <KeyboardControl keyOrCombos={["Tab"]} description="Moves focus to the fixture action." />
</KeyboardControls>
`,
      });

      const components = await extractComponents(
        repoRoot,
        new Map([[buildFixturePackage().name, buildFixturePackage()]]),
        { byPackage: new Map() },
        GENERATED_AT,
      );

      expect(components).toHaveLength(1);
      const component = components[0];
      expect(component.accessibility.summary).toEqual([]);
      expect(component.accessibility.rules).toEqual([]);

      const registry = buildFixtureRegistry(component);
      const context = buildComponentContext({
        registry,
        component,
        generated_at: GENERATED_AT,
        generator: GENERATOR,
        registry_hash: "fixture-registry-hash",
      });
      const audit = buildContextCoverageAudit({
        registry,
        generated_at: GENERATED_AT,
        generator: GENERATOR,
      });

      expect(context.generated_artifact.claims).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            kind: "accessibility",
          }),
        ]),
      );
      expect(
        validateGeneratedArtifactEvidence(context.generated_artifact),
      ).toEqual([]);
      expect(
        validateGeneratedArtifactRegistryEvidence(
          context.generated_artifact,
          registry,
        ),
      ).toEqual([]);
      expect(validateSaltContextCoverageAuditSchema(audit)).toEqual([]);
      expect(audit).toEqual(
        expect.objectContaining({
          status: "unsupported",
          component_contexts: expect.objectContaining({
            selected_records: 1,
            validated_contexts: 1,
            unsupported_contexts: 0,
            source_gap_count: 1,
          }),
          docs_registry_gaps: expect.arrayContaining([
            expect.objectContaining({
              kind: "component",
              id: "component.fixture-action",
              missing: ["non-keyboard accessibility guidance"],
            }),
          ]),
        }),
      );
    } finally {
      await fs.rm(repoRoot, { recursive: true, force: true });
    }
  });

  it("extracts source-backed fixture ARIA implementation summaries when accessibility docs are keyboard-only", async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-component-source-a11y-fixture-"),
    );

    try {
      await writeFixtureRepo(repoRoot, {
        accessibilityContent: `---
title: Fixture action accessibility
---

## Keyboard interactions

<KeyboardControls>
  <KeyboardControl keyOrCombos={["Tab"]} description="Moves focus to the fixture action." />
</KeyboardControls>
`,
        sourceContent: `export function FixtureAction() {
  return (
    <button
      role="switch"
      aria-label="Fixture source label"
      aria-describedby="fixture-description"
    >
      <span aria-hidden="true" />
    </button>
  );
}
`,
      });

      const components = await extractComponents(
        repoRoot,
        new Map([[buildFixturePackage().name, buildFixturePackage()]]),
        { byPackage: new Map() },
        GENERATED_AT,
      );

      expect(components).toHaveLength(1);
      const component = components[0];
      expect(component.accessibility.summary).toEqual([
        "Fixture action source declares ARIA role: `switch`.",
        "Fixture action source declares ARIA attributes: `aria-describedby`, `aria-hidden`, `aria-label`.",
      ]);
      expect(component.accessibility.rules).toEqual([]);

      const registry = buildFixtureRegistry(component);
      const context = buildComponentContext({
        registry,
        component,
        generated_at: GENERATED_AT,
        generator: GENERATOR,
        registry_hash: "fixture-registry-hash",
      });
      const audit = buildContextCoverageAudit({
        registry,
        generated_at: GENERATED_AT,
        generator: GENERATOR,
      });
      const accessibilityClaim = context.generated_artifact.claims.find(
        (claim) => claim.field_path === "accessibility.summary.0",
      );
      const accessibilityEvidenceRef = context.evidence_refs.find(
        (ref) => ref.id === accessibilityClaim?.evidence_ref_ids[0],
      );

      expect(context.status).toBe("validated");
      expect(accessibilityClaim).toEqual(
        expect.objectContaining({
          kind: "accessibility",
          evidence_ref_ids: [expect.any(String)],
        }),
      );
      expect(accessibilityEvidenceRef).toEqual(
        expect.objectContaining({
          source_kind: "registry",
          claim_kind: "accessibility",
          registry: expect.objectContaining({
            entity_id: "component.fixture-action",
            field_path: "accessibility.summary.0",
          }),
          source: expect.objectContaining({
            repo_path: "packages/fixture/src/fixture-action/Foo.tsx",
          }),
        }),
      );
      expect(accessibilityEvidenceRef?.source?.url ?? null).toBeNull();
      expect(
        validateGeneratedArtifactEvidence(context.generated_artifact),
      ).toEqual([]);
      expect(
        validateGeneratedArtifactRegistryEvidence(
          context.generated_artifact,
          registry,
        ),
      ).toEqual([]);
      expect(validateSaltContextCoverageAuditSchema(audit)).toEqual([]);
      expect(
        audit.docs_registry_gaps.filter(
          (gap) => gap.id === "component.fixture-action",
        ),
      ).toEqual([]);
    } finally {
      await fs.rm(repoRoot, { recursive: true, force: true });
    }
  });

  it("does not promote fixture source focus plumbing into accessibility summaries", async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-component-focus-source-fixture-"),
    );

    try {
      await writeFixtureRepo(repoRoot, {
        accessibilityContent: `---
title: Fixture action accessibility
---

## Keyboard interactions

<KeyboardControls>
  <KeyboardControl keyOrCombos={["Tab"]} description="Moves focus to the fixture action." />
</KeyboardControls>
`,
        sourceContent: `export function FixtureAction() {
  return <button tabIndex={0} onFocus={() => undefined}>Fixture</button>;
}
`,
      });

      const components = await extractComponents(
        repoRoot,
        new Map([[buildFixturePackage().name, buildFixturePackage()]]),
        { byPackage: new Map() },
        GENERATED_AT,
      );

      expect(components).toHaveLength(1);
      const component = components[0];
      expect(component.accessibility.summary).toEqual([]);
      expect(component.accessibility.rules).toEqual([]);

      const registry = buildFixtureRegistry(component);
      const context = buildComponentContext({
        registry,
        component,
        generated_at: GENERATED_AT,
        generator: GENERATOR,
        registry_hash: "fixture-registry-hash",
      });
      const audit = buildContextCoverageAudit({
        registry,
        generated_at: GENERATED_AT,
        generator: GENERATOR,
      });

      expect(context.generated_artifact.claims).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            kind: "accessibility",
          }),
        ]),
      );
      expect(
        validateGeneratedArtifactEvidence(context.generated_artifact),
      ).toEqual([]);
      expect(
        validateGeneratedArtifactRegistryEvidence(
          context.generated_artifact,
          registry,
        ),
      ).toEqual([]);
      expect(validateSaltContextCoverageAuditSchema(audit)).toEqual([]);
      expect(audit.docs_registry_gaps).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            kind: "component",
            id: "component.fixture-action",
            missing: ["non-keyboard accessibility guidance"],
          }),
        ]),
      );
    } finally {
      await fs.rm(repoRoot, { recursive: true, force: true });
    }
  });
});
