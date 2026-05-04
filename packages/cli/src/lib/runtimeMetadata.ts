import fs from "node:fs";
import path from "node:path";
import { getPackageRoot } from "@salt-ds/semantic-core/registry/paths";
import {
  buildSaltCapabilityManifest,
  type SaltCapabilityManifest,
} from "@salt-ds/semantic-core/tools/capabilityManifest";

interface SaltCliPackageManifest {
  name: string;
  version: string;
}

let cachedPackageManifest: SaltCliPackageManifest | null = null;

function getSaltCliPackageManifest(): SaltCliPackageManifest {
  if (cachedPackageManifest) {
    return cachedPackageManifest;
  }

  const manifest = JSON.parse(
    fs.readFileSync(
      path.join(getPackageRoot(import.meta.url), "package.json"),
      "utf8",
    ),
  ) as Partial<SaltCliPackageManifest>;

  if (
    typeof manifest.name !== "string" ||
    manifest.name.length === 0 ||
    typeof manifest.version !== "string" ||
    manifest.version.length === 0
  ) {
    throw new Error(
      "packages/cli/package.json is missing a valid name or version.",
    );
  }

  cachedPackageManifest = {
    name: manifest.name,
    version: manifest.version,
  };

  return cachedPackageManifest;
}

export interface SaltCliRuntimeMetadata {
  package_name: string;
  cli_version: string;
}

export function getSaltCliRuntimeMetadata(): SaltCliRuntimeMetadata {
  const packageManifest = getSaltCliPackageManifest();

  return {
    package_name: packageManifest.name,
    cli_version: packageManifest.version,
  };
}

export function buildSaltCliCapabilityManifest(input: {
  registry_available: boolean;
  registry_version: string | null;
  registry_generated_at: string | null;
}): SaltCapabilityManifest {
  const runtime = getSaltCliRuntimeMetadata();

  return buildSaltCapabilityManifest({
    transport: "cli",
    runtime: {
      package_name: runtime.package_name,
      package_version: runtime.cli_version,
      server_name: null,
      command_name: "salt-ds",
    },
    registry: {
      available: input.registry_available,
      version: input.registry_version,
      generated_at: input.registry_generated_at,
    },
    contracts: {
      setup_contract_ids: ["info", "init"],
    },
    public_surface: {
      default_surface_ids: [
        "info",
        "init",
        "create",
        "review",
        "migrate",
        "upgrade",
        "export-context",
        "get_salt_entity",
        "get_salt_examples",
        "discover_salt",
      ],
      advanced_output_ids: ["full", "starter-only"],
    },
    support_tools: {
      policy: "default_read_only_host_surface",
      default_exposed: true,
    },
    support_surface: {
      retrieval_catalog: {
        available: input.registry_available,
        access: ["info", "command"],
      },
    },
    capabilities: {
      repo_context: true,
      repo_bootstrap: true,
      starter_code: true,
      exact_request_safety: true,
      deterministic_next_step: true,
      review_runtime_url: true,
      starter_only_create_artifact: true,
      visual_input: {
        source_outline: true,
        runtime_capture: true,
        image_or_mockup_inputs: true,
        normalized_adapter_contract: "migrate_visual_evidence_v1",
      },
      handoff: {
        portable_bundle: false,
      },
    },
    resources: {
      capability_manifest_uri: null,
      catalog_manifest_uri: null,
      catalog_entity_template_uri: null,
      catalog_candidates_template_uri: null,
      catalog_family_template_uri: null,
      context_manifest_uri: null,
      context_health_uri: null,
      context_coverage_uri: null,
      context_pack_uri: null,
      context_component_template_uri: null,
      context_component_markdown_template_uri: null,
      context_pattern_template_uri: null,
      context_foundation_template_uri: null,
    },
  });
}
