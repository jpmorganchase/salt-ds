import { parentPort } from "node:worker_threads";
import {
  analyzeSaltCode,
  loadKnowledgeRuntimeContext,
  type SubmittedArtifactLanguage,
} from "@salt-ds/knowledge";

interface ScannerWorkerRequest {
  contract: "salt-scan-worker-request/1";
  type: "scan";
  job_id: string;
  payload: {
    path: string;
    language: SubmittedArtifactLanguage;
    text: string;
    package_versions: Record<string, string>;
    limits: {
      source_bytes: number;
      ast_nodes: number;
      evidence_candidates: number;
      findings: number;
    };
  };
}

type ScannerWorkerResponse =
  | {
      contract: "salt-scan-worker-response/1";
      type: "result";
      job_id: string;
      analysis: object;
    }
  | {
      contract: "salt-scan-worker-response/1";
      type: "error";
      job_id: string;
      code: "SCAN_ANALYZER_FAILURE" | "SCAN_FINDING_LIMIT";
    };

const LANGUAGES = new Set<SubmittedArtifactLanguage>([
  "javascript",
  "jsx",
  "typescript",
  "tsx",
  "css",
]);

const LIMIT_CEILINGS = {
  source_bytes: 5 * 1024 * 1024,
  ast_nodes: 1_000_000,
  evidence_candidates: 100_000,
  findings: 2_000,
} as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function parseScannerWorkerRequest(
  value: unknown,
): ScannerWorkerRequest | null {
  if (
    !isRecord(value) ||
    value.contract !== "salt-scan-worker-request/1" ||
    value.type !== "scan" ||
    !isRecord(value.payload)
  ) {
    return null;
  }
  const payload = value.payload;
  if (
    typeof value.job_id !== "string" ||
    value.job_id.length < 1 ||
    value.job_id.length > 128 ||
    typeof payload.path !== "string" ||
    payload.path.length < 1 ||
    payload.path.length > 32_768 ||
    payload.path.includes("\0") ||
    payload.path.includes("\\") ||
    payload.path.startsWith("/") ||
    /^[a-z]:/iu.test(payload.path) ||
    payload.path.split("/").some((segment) => segment === "..") ||
    typeof payload.language !== "string" ||
    !LANGUAGES.has(payload.language as SubmittedArtifactLanguage) ||
    typeof payload.text !== "string" ||
    !isRecord(payload.package_versions) ||
    Object.keys(payload.package_versions).length > 32 ||
    Object.entries(payload.package_versions).some(
      ([name, version]) =>
        !/^@salt-ds\/[a-z0-9][a-z0-9._-]{0,204}$/u.test(name) ||
        typeof version !== "string" ||
        version.length < 1 ||
        version.length > 256,
    ) ||
    !isRecord(payload.limits)
  ) {
    return null;
  }
  for (const name of [
    "source_bytes",
    "ast_nodes",
    "evidence_candidates",
    "findings",
  ] as const) {
    if (
      !Number.isSafeInteger(payload.limits[name]) ||
      (payload.limits[name] as number) < 1 ||
      (payload.limits[name] as number) > LIMIT_CEILINGS[name]
    ) {
      return null;
    }
  }
  if (
    Buffer.byteLength(payload.text, "utf8") >
    (payload.limits.source_bytes as number)
  ) {
    return null;
  }
  return value as unknown as ScannerWorkerRequest;
}

const messagePort = parentPort;
if (!messagePort) {
  throw new Error("The Salt scanner worker requires a parent message port.");
}

const runtime = loadKnowledgeRuntimeContext();
let busy = false;

messagePort.on("message", async (message: unknown) => {
  const request = parseScannerWorkerRequest(message);
  if (!request || busy) {
    messagePort.postMessage({
      contract: "salt-scan-worker-response/1",
      type: "error",
      job_id:
        message && typeof message === "object" && "job_id" in message
          ? String(message.job_id).slice(0, 128)
          : "invalid",
      code: "SCAN_ANALYZER_FAILURE",
    } satisfies ScannerWorkerResponse);
    return;
  }
  busy = true;
  try {
    const context = await runtime;
    const analysis = analyzeSaltCode(
      context,
      {
        artifacts: [
          {
            id: request.payload.path,
            language: request.payload.language,
            text: request.payload.text,
          },
        ],
        package_versions: request.payload.package_versions,
      },
      null,
      "caller_package_versions",
      {
        max_artifact_utf8_bytes: request.payload.limits.source_bytes,
        max_ast_nodes_per_artifact: request.payload.limits.ast_nodes,
        max_facts_per_artifact: request.payload.limits.evidence_candidates,
        max_rule_comparisons_per_artifact:
          request.payload.limits.evidence_candidates,
      },
    );
    if (
      analysis.results[0]?.coverage.detected_findings >
      request.payload.limits.findings
    ) {
      messagePort.postMessage({
        contract: "salt-scan-worker-response/1",
        type: "error",
        job_id: request.job_id,
        code: "SCAN_FINDING_LIMIT",
      } satisfies ScannerWorkerResponse);
    } else {
      messagePort.postMessage({
        contract: "salt-scan-worker-response/1",
        type: "result",
        job_id: request.job_id,
        analysis,
      } satisfies ScannerWorkerResponse);
    }
  } catch {
    messagePort.postMessage({
      contract: "salt-scan-worker-response/1",
      type: "error",
      job_id: request.job_id,
      code: "SCAN_ANALYZER_FAILURE",
    } satisfies ScannerWorkerResponse);
  } finally {
    busy = false;
  }
});
