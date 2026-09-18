import type { ArtifactTreeNodeReference } from "../manifest/artifactTree.js";
import { canonicalJson } from "../manifest/canonicalJson.js";
import {
  parseSha256Digest,
  type Sha256Digest,
  sha256Digest,
} from "../manifest/digestCodec.js";
import { parseKnowledgeArtifactPath } from "../manifest/pathCodec.js";

export const KNOWLEDGE_PACKAGE_FAMILIES = [
  "@salt-ds/ag-grid-theme",
  "@salt-ds/core",
  "@salt-ds/countries",
  "@salt-ds/date-adapters",
  "@salt-ds/date-components",
  "@salt-ds/embla-carousel",
  "@salt-ds/highcharts-theme",
  "@salt-ds/icons",
  "@salt-ds/lab",
  "@salt-ds/react-resizable-panels-theme",
  "@salt-ds/styles",
  "@salt-ds/theme",
  "@salt-ds/window",
] as const;

export const KNOWLEDGE_OPERATIONS = [
  "search",
  "docs",
  "context",
  "project_facts",
  "review",
] as const;

export interface KnowledgePackageCompatibility {
  name: (typeof KNOWLEDGE_PACKAGE_FAMILIES)[number];
  tested_version: string;
  supported_range: string;
  required: boolean;
}

export interface KnowledgeManifestV1 {
  $schema: "https://www.saltdesignsystem.com/ai/schemas/knowledge-manifest-1.json";
  schema_version: "1.0.0";
  record_schema_version: "1.0.0";
  bundle_version: string;
  semantic_digest: Sha256Digest;
  bundle_digest: Sha256Digest;
  semantic_source_digest: Sha256Digest;
  compiler_digest: Sha256Digest;
  reader_contract: "salt-knowledge-reader/1";
  analyzer_contract: "salt-artifact-analyzer/1";
  ruleset: {
    id: "salt-rules-current";
    version: string;
    digest: Sha256Digest;
    required_rule_implementations: string[];
  };
  operation_capabilities: Record<
    (typeof KNOWLEDGE_OPERATIONS)[number],
    "supported"
  >;
  compatibility: { packages: KnowledgePackageCompatibility[] };
  artifact_tree: {
    contract: "salt-artifact-tree/1";
    path_codec: "salt-posix-relative-path/1";
    root: ArtifactTreeNodeReference;
    node_count: number;
    tree_bytes: number;
    artifact_count: number;
    artifact_bytes: number;
    max_node_bytes: 65536;
    max_leaf_entries: 256;
    max_internal_children: 256;
    max_nodes: 512;
    max_tree_bytes: 8388608;
    max_artifacts: 40000;
  };
  support_artifacts: Array<{
    kind:
      | "semantic_source_inventory"
      | "compiler_inventory"
      | "generation_receipt";
    artifact: string;
  }>;
  limitations: { historical_completeness: false };
  agent_support?: {
    skill: { artifact: string };
    agents_pointer: { artifact: string };
  };
}

function requireObject(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object.`);
  }
  return value as Record<string, unknown>;
}

function requireExactVersion(value: unknown, label: string): string {
  if (
    typeof value !== "string" ||
    !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/u.test(value)
  ) {
    throw new Error(`${label} must be an exact semantic version.`);
  }
  return value;
}

export function computeKnowledgeBundleDigest(
  manifest: Omit<KnowledgeManifestV1, "bundle_digest"> | KnowledgeManifestV1,
): Sha256Digest {
  const { bundle_digest: _bundleDigest, ...identity } =
    manifest as KnowledgeManifestV1;
  return sha256Digest(canonicalJson(identity));
}

export function validateKnowledgeManifestV1(
  value: unknown,
): KnowledgeManifestV1 {
  const manifest = requireObject(value, "Knowledge manifest");
  if (
    manifest.$schema !==
      "https://www.saltdesignsystem.com/ai/schemas/knowledge-manifest-1.json" ||
    manifest.schema_version !== "1.0.0" ||
    manifest.record_schema_version !== "1.0.0" ||
    manifest.reader_contract !== "salt-knowledge-reader/1" ||
    manifest.analyzer_contract !== "salt-artifact-analyzer/1"
  ) {
    throw new Error("Knowledge manifest has an unsupported contract tuple.");
  }
  requireExactVersion(manifest.bundle_version, "Knowledge bundle version");
  for (const field of [
    "semantic_digest",
    "bundle_digest",
    "semantic_source_digest",
    "compiler_digest",
  ] as const) {
    parseSha256Digest(manifest[field]);
  }
  const ruleset = requireObject(manifest.ruleset, "Knowledge ruleset");
  if (
    ruleset.id !== "salt-rules-current" ||
    !Array.isArray(ruleset.required_rule_implementations) ||
    new Set(ruleset.required_rule_implementations).size !==
      ruleset.required_rule_implementations.length
  ) {
    throw new Error("Knowledge ruleset is malformed.");
  }
  requireExactVersion(ruleset.version, "Knowledge ruleset version");
  parseSha256Digest(ruleset.digest);
  const capabilities = requireObject(
    manifest.operation_capabilities,
    "Knowledge operation capabilities",
  );
  if (
    Object.keys(capabilities).sort().join("\0") !==
      [...KNOWLEDGE_OPERATIONS].sort().join("\0") ||
    KNOWLEDGE_OPERATIONS.some(
      (operation) => capabilities[operation] !== "supported",
    )
  ) {
    throw new Error(
      "Knowledge operation capabilities are not the closed v1 set.",
    );
  }
  const compatibility = requireObject(
    manifest.compatibility,
    "Knowledge compatibility",
  );
  if (!Array.isArray(compatibility.packages)) {
    throw new Error("Knowledge compatibility packages must be an array.");
  }
  const packageNames = compatibility.packages.map((entry) => {
    const candidate = requireObject(entry, "Knowledge compatibility package");
    requireExactVersion(candidate.tested_version, "Tested package version");
    if (
      candidate.supported_range !== candidate.tested_version ||
      typeof candidate.required !== "boolean"
    ) {
      throw new Error("Initial knowledge compatibility must use exact ranges.");
    }
    return candidate.name;
  });
  if (
    packageNames.join("\0") !== KNOWLEDGE_PACKAGE_FAMILIES.join("\0") ||
    compatibility.packages.filter(
      (entry) => (entry as KnowledgePackageCompatibility).required,
    ).length !== 1 ||
    !(compatibility.packages as KnowledgePackageCompatibility[]).find(
      (entry) => entry.name === "@salt-ds/core" && entry.required,
    )
  ) {
    throw new Error(
      "Knowledge compatibility does not cover the frozen families.",
    );
  }
  const tree = requireObject(manifest.artifact_tree, "Knowledge artifact tree");
  const root = requireObject(tree.root, "Knowledge artifact tree root");
  parseKnowledgeArtifactPath(root.file);
  parseSha256Digest(root.sha256);
  if (
    tree.contract !== "salt-artifact-tree/1" ||
    tree.path_codec !== "salt-posix-relative-path/1" ||
    tree.max_node_bytes !== 65_536 ||
    tree.max_leaf_entries !== 256 ||
    tree.max_internal_children !== 256 ||
    tree.max_nodes !== 512 ||
    tree.max_tree_bytes !== 8_388_608 ||
    tree.max_artifacts !== 40_000
  ) {
    throw new Error("Knowledge artifact tree budgets are not the v1 contract.");
  }
  if (!Array.isArray(manifest.support_artifacts)) {
    throw new Error("Knowledge support artifacts must be an array.");
  }
  const supportKinds = manifest.support_artifacts.map((entry) => {
    const candidate = requireObject(entry, "Knowledge support artifact");
    parseKnowledgeArtifactPath(candidate.artifact);
    return candidate.kind;
  });
  if (
    supportKinds.join("\0") !==
    [
      "semantic_source_inventory",
      "compiler_inventory",
      "generation_receipt",
    ].join("\0")
  ) {
    throw new Error("Knowledge support artifacts are incomplete or unordered.");
  }
  if (
    requireObject(manifest.limitations, "Knowledge limitations")
      .historical_completeness !== false
  ) {
    throw new Error(
      "Knowledge v1 must disclose incomplete historical coverage.",
    );
  }
  if (manifest.agent_support !== undefined) {
    const agentSupport = requireObject(
      manifest.agent_support,
      "Knowledge agent support",
    );
    const skill = requireObject(agentSupport.skill, "Knowledge Skill pointer");
    const agentsPointer = requireObject(
      agentSupport.agents_pointer,
      "Knowledge AGENTS pointer",
    );
    if (
      Object.keys(agentSupport).sort().join("\0") !== "agents_pointer\0skill" ||
      Object.keys(skill).join("\0") !== "artifact" ||
      Object.keys(agentsPointer).join("\0") !== "artifact" ||
      parseKnowledgeArtifactPath(skill.artifact) !==
        "skills/salt-design-system/SKILL.md" ||
      parseKnowledgeArtifactPath(agentsPointer.artifact) !==
        "skills/salt-design-system/references/managed-agents-block.md"
    ) {
      throw new Error(
        "Knowledge agent-support descriptors are not the closed v1 set.",
      );
    }
  }
  const parsed = manifest as unknown as KnowledgeManifestV1;
  if (computeKnowledgeBundleDigest(parsed) !== parsed.bundle_digest) {
    throw new Error(
      "Knowledge bundle digest does not match canonical manifest bytes.",
    );
  }
  return parsed;
}
