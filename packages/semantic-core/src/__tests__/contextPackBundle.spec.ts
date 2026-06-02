import { describe, expect, it } from "vitest";
import {
  buildContextPackManifest,
  type SaltContextPackManifestEntry,
} from "../contextManifest.js";
import {
  buildContextPackBundle,
  checkContextPackBundlePersistence,
  SALT_CONTEXT_PACK_BUNDLE_CONTRACT,
  SALT_CONTEXT_PACK_PERSISTENCE_CHECK_CONTRACT,
  type SaltContextPackBundle,
  type SaltContextPackBundleFile,
} from "../contextPackBundle.js";
import { buildContextPackBundleReleaseGate } from "../contextPackReleaseGate.js";
import {
  SALT_EVIDENCE_REF_CONTRACT,
  SALT_GENERATED_ARTIFACT_CONTRACT,
  type SaltGeneratedArtifact,
} from "../evidence.js";
import type { ComponentRecord, SaltRegistry } from "../types.js";
import {
  validateSaltContextPackBundleSchema,
  validateSaltContextPackPersistenceCheckSchema,
} from "./contextPackBundleSchemaTestUtils.js";
import { validateSaltGeneratedArtifactReleaseGateBatchSchema } from "./generatedArtifactReleaseGateSchemaTestUtils.js";

// Context-pack bundle tests use tiny fixture-only names and paths. They do not
// add production Salt component, prop, token, import, example, or a11y facts.
const GENERATED_AT = "2026-04-30T00:00:00.000Z";

function buildFixtureEntry(): SaltContextPackManifestEntry {
  return {
    kind: "component",
    id: "fixture-action",
    name: "FixtureAction",
    output_path: ".salt/context/components/fixture-action.json",
    contract: "salt_context_component_v1",
    status: "validated",
    registry: {
      version: "fixture-registry",
      hash: "fixture-hash",
      generated_at: GENERATED_AT,
    },
    generated_artifact_id: "component-context.fixture-action",
    generated_artifact_kind: "component-context",
    evidence_ref_ids: ["fixture-action.name.ref"],
    evidence_ref_count: 1,
    unsupported_claim_count: 0,
    missing: [],
  };
}

function buildFixtureFile(
  entry = buildFixtureEntry(),
): SaltContextPackBundleFile {
  return {
    kind: entry.kind,
    id: entry.id,
    output_path: entry.output_path,
    mime_type: "application/json",
    contract: entry.contract,
    generated_artifact_kind: entry.generated_artifact_kind,
    evidence_ref_ids: entry.evidence_ref_ids,
    text: '{"contract":"salt_context_component_v1"}',
  };
}

function buildFixtureBundle(): SaltContextPackBundle {
  const entry = buildFixtureEntry();
  const manifest = buildContextPackManifest({
    generated_at: GENERATED_AT,
    generator: {
      name: "semantic-core context pack fixture",
    },
    registry: {
      version: "fixture-registry",
      hash: "fixture-hash",
      generated_at: GENERATED_AT,
    },
    entries: [entry],
  });

  return buildContextPackBundle({
    generated_at: GENERATED_AT,
    generator: {
      name: "semantic-core context pack fixture",
    },
    registry: manifest.registry,
    manifest,
    files: [buildFixtureFile(entry)],
  });
}

function buildFixtureComponent(): ComponentRecord {
  return {
    id: "fixture-action",
    name: "FixtureAction",
    aliases: [],
    package: {
      name: "@salt-ds/fixture",
      status: "stable",
      since: null,
    },
    summary: "Fixture component for context pack release-gate tests.",
    status: "stable",
    category: ["fixture"],
    tags: [],
    when_to_use: [],
    when_not_to_use: [],
    alternatives: [],
    props: [],
    accessibility: {
      summary: [],
      rules: [],
    },
    patterns: [],
    examples: [],
    related_docs: {
      overview: "https://example.test/salt/fixture-action",
      usage: null,
      accessibility: null,
      examples: null,
    },
    source: {
      repo_path: "packages/fixture/src/FixtureAction.tsx",
      export_name: "FixtureAction",
    },
    deprecations: [],
    last_verified_at: GENERATED_AT,
  };
}

function buildFixtureRegistry(): SaltRegistry {
  return {
    generated_at: GENERATED_AT,
    version: "fixture-registry",
    build_info: null,
    packages: [],
    components: [buildFixtureComponent()],
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

function buildFixtureGeneratedArtifact(): SaltGeneratedArtifact {
  return {
    contract: SALT_GENERATED_ARTIFACT_CONTRACT,
    artifact_kind: "component-context",
    id: "component-context.fixture-action",
    generated_at: GENERATED_AT,
    generator: {
      name: "semantic-core context pack fixture",
    },
    registry: {
      version: "fixture-registry",
      hash: "fixture-hash",
      generated_at: GENERATED_AT,
    },
    claims: [
      {
        id: "fixture-action.name",
        kind: "component",
        text: "FixtureAction",
        field_path: "component.name",
        evidence_ref_ids: ["fixture-action.name.ref"],
      },
    ],
    evidence_refs: [
      {
        contract: SALT_EVIDENCE_REF_CONTRACT,
        id: "fixture-action.name.ref",
        source_kind: "registry",
        claim_kind: "component",
        registry: {
          entity_type: "component",
          entity_id: "fixture-action",
          entity_name: "FixtureAction",
          field_path: "name",
          registry_version: "fixture-registry",
          registry_hash: "fixture-hash",
        },
        source: {
          url: "https://example.test/salt/fixture-action",
          repo_path: "packages/fixture/src/FixtureAction.tsx",
        },
        confidence: "high",
      },
    ],
  };
}

function buildReleaseGateFixtureBundle(): SaltContextPackBundle {
  const entry = buildFixtureEntry();
  const manifest = buildContextPackManifest({
    generated_at: GENERATED_AT,
    generator: {
      name: "semantic-core context pack fixture",
    },
    registry: {
      version: "fixture-registry",
      hash: "fixture-hash",
      generated_at: GENERATED_AT,
    },
    entries: [entry],
    coverage_gaps: [
      {
        kind: "prompt",
        id: "fixture-prompt-gap",
        status: "unsupported",
        reason: "Fixture prompt gap without source-backed EvidenceRefs.",
        missing: ["fixture prompt EvidenceRefs"],
        evidence_ref_ids: [],
      },
    ],
  });

  return buildContextPackBundle({
    generated_at: GENERATED_AT,
    generator: {
      name: "semantic-core context pack fixture",
    },
    registry: manifest.registry,
    manifest,
    files: [
      {
        ...buildFixtureFile(entry),
        text: JSON.stringify(
          {
            contract: "salt_context_component_v1",
            generated_artifact: buildFixtureGeneratedArtifact(),
          },
          null,
          2,
        ),
      },
    ],
  });
}

describe("context pack bundle persistence", () => {
  it("checks exact fixture file text while keeping host persistence explicit", () => {
    const bundle = buildFixtureBundle();
    const manifestPath = ".salt/context/manifest.json";
    const check = checkContextPackBundlePersistence({
      bundle,
      manifest_path: manifestPath,
      persisted_text_by_path: {
        [manifestPath]: JSON.stringify(bundle.manifest, null, 2),
        [bundle.files[0]?.output_path ?? ""]: bundle.files[0]?.text,
      },
    });

    expect(validateSaltContextPackBundleSchema(bundle)).toEqual([]);
    expect(validateSaltContextPackPersistenceCheckSchema(check)).toEqual([]);
    expect(check).toEqual(
      expect.objectContaining({
        contract: SALT_CONTEXT_PACK_PERSISTENCE_CHECK_CONTRACT,
        bundle_contract: SALT_CONTEXT_PACK_BUNDLE_CONTRACT,
        status: "current",
        current: true,
        host_action_required: true,
        content_status: "validated",
        missing_outputs: [],
        stale_outputs: [],
      }),
    );
  });

  it("detects missing and stale fixture persisted outputs by exact text", () => {
    const bundle = buildFixtureBundle();
    const manifestPath = ".salt/context/manifest.json";
    const missingCheck = checkContextPackBundlePersistence({
      bundle,
      manifest_path: manifestPath,
      persisted_text_by_path: {
        [manifestPath]: JSON.stringify(bundle.manifest, null, 2),
      },
    });
    const staleCheck = checkContextPackBundlePersistence({
      bundle,
      manifest_path: manifestPath,
      persisted_text_by_path: {
        [manifestPath]: JSON.stringify(bundle.manifest, null, 2),
        [bundle.files[0]?.output_path ?? ""]: "{}",
      },
    });

    expect(validateSaltContextPackPersistenceCheckSchema(missingCheck)).toEqual(
      [],
    );
    expect(missingCheck).toEqual(
      expect.objectContaining({
        status: "missing",
        current: false,
        missing_outputs: [".salt/context/components/fixture-action.json"],
      }),
    );
    expect(validateSaltContextPackPersistenceCheckSchema(staleCheck)).toEqual(
      [],
    );
    expect(staleCheck).toEqual(
      expect.objectContaining({
        status: "stale",
        current: false,
        stale_outputs: [".salt/context/components/fixture-action.json"],
      }),
    );
    expect(staleCheck.files).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          output_path: ".salt/context/components/fixture-action.json",
          status: "stale",
          mismatches: ["text"],
        }),
      ]),
    );
  });

  it("blocks context-pack release when manifest gaps remain unsupported", () => {
    const gate = buildContextPackBundleReleaseGate({
      bundle: buildReleaseGateFixtureBundle(),
      registry: buildFixtureRegistry(),
      artifact_path: "fixture-context-pack",
    });

    expect(validateSaltGeneratedArtifactReleaseGateBatchSchema(gate)).toEqual(
      [],
    );
    expect(gate).toEqual(
      expect.objectContaining({
        status: "blocked",
        releasable: false,
        artifact_path: "fixture-context-pack",
        target_count: 1,
        passed_count: 1,
        blocked_count: 0,
        invalid_count: 0,
        coverage_gap_count: 1,
      }),
    );
    expect(gate.coverage_gaps).toEqual([
      expect.objectContaining({
        id: "fixture-prompt-gap",
        status: "unsupported",
        missing: ["fixture prompt EvidenceRefs"],
      }),
    ]);
  });
});
