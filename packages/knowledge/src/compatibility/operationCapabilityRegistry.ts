import { canonicalJson } from "../manifest/canonicalJson.js";
import { sha256Digest } from "../manifest/digestCodec.js";
import { REVIEW_RULE_CHARACTERIZATION } from "../review/reviewRuleCharacterization.js";
import type { KnowledgeManifestV1 } from "../schemas/knowledgeManifestV1.js";

export type KnowledgeOperation = keyof KnowledgeManifestV1["operation_capabilities"];

const REQUIRED_RULE_IMPLEMENTATIONS = REVIEW_RULE_CHARACTERIZATION.map(
  (rule) => `${rule.rule_id}@1`,
).sort();
const RULESET_DIGEST = sha256Digest(canonicalJson(REVIEW_RULE_CHARACTERIZATION));

export interface OperationCapabilityDecision {
  operation: KnowledgeOperation;
  supported: boolean;
  limitation: string | null;
}

export function resolveOperationCapability(
  manifest: KnowledgeManifestV1,
  operation: KnowledgeOperation,
): OperationCapabilityDecision {
  const supportedTuple =
    manifest.reader_contract === "salt-knowledge-reader/1" &&
    manifest.analyzer_contract === "salt-artifact-analyzer/1" &&
    manifest.ruleset.id === "salt-rules-current" &&
    manifest.ruleset.version === "1.0.0" &&
    manifest.ruleset.digest === RULESET_DIGEST &&
    JSON.stringify(manifest.ruleset.required_rule_implementations) ===
      JSON.stringify(REQUIRED_RULE_IMPLEMENTATIONS) &&
    manifest.operation_capabilities[operation] === "supported";
  return supportedTuple
    ? { operation, supported: true, limitation: null }
    : {
        operation,
        supported: false,
        limitation: `UNSUPPORTED_KNOWLEDGE_CAPABILITY_TUPLE:${operation}`,
      };
}

export function assertOperationCapability(
  manifest: KnowledgeManifestV1,
  operation: KnowledgeOperation,
): void {
  const decision = resolveOperationCapability(manifest, operation);
  if (!decision.supported) throw new Error(decision.limitation ?? operation);
}
