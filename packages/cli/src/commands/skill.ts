import {
  digestToPathSegment,
  loadKnowledgeRuntimeContext,
  sha256Digest,
} from "@salt-ds/knowledge";

export type SaltSkillKind = "skill" | "agents";

export interface RunSkillCommandInput {
  action: "info" | "print";
  kind?: SaltSkillKind;
  bundleDir?: string;
}

const IMMUTABLE_ORIGIN = "https://www.saltdesignsystem.com";

function descriptors(manifest: Awaited<ReturnType<typeof loadKnowledgeRuntimeContext>>["store"]["manifest"]) {
  if (!manifest.agent_support) {
    throw new Error("The selected Knowledge bundle has no agent-support artifacts.");
  }
  return {
    skill: manifest.agent_support.skill.artifact,
    agents: manifest.agent_support.agents_pointer.artifact,
  } as const;
}

/** Inspect or print the verified Skill artifacts bundled with Knowledge. */
export async function runSkillCommand(input: RunSkillCommandInput): Promise<string> {
  const runtime = await loadKnowledgeRuntimeContext(
    input.bundleDir ? { bundleDir: input.bundleDir } : {},
  );
  const { store } = runtime;
  const manifest = store.manifest;
  const artifacts = descriptors(manifest);
  const source = input.bundleDir ? "custom" : "official";
  const segment = digestToPathSegment(manifest.bundle_digest);
  const describe = (kind: SaltSkillKind) => {
    const artifact = artifacts[kind];
    const bytes = store.readArtifact(artifact);
    return {
      kind,
      package_relative_path: artifact,
      sha256: sha256Digest(bytes),
      bytes: bytes.byteLength,
      bundle_version: manifest.bundle_version,
      bundle_digest: manifest.bundle_digest,
      provenance: source,
      immutable_url: `${IMMUTABLE_ORIGIN}/ai/v1/${segment}/${artifact}`,
    };
  };

  if (input.action === "info") {
    return `${JSON.stringify({
      contract: "salt-cli-skill-info/1",
      schema_version: "1.0.0",
      artifacts: [describe("skill"), describe("agents")],
    })}\n`;
  }
  if (!input.kind) throw new Error("skill print requires an artifact kind.");
  return store.readArtifact(artifacts[input.kind]).toString("utf8");
}
