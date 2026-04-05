import { readFileSync } from "node:fs";
import type {
  NormalizedVisualEvidenceInput,
  VisualEvidenceConfidence,
} from "@salt-ds/semantic-core/tools/translation/sourceUiTypes";
import { describe, expect, it } from "vitest";
import {
  HOST_ATTACHMENT_PREPROCESSING_SCENARIO,
  type HostAttachmentEvalTrace,
  judgeHostAttachmentEvalScenario,
  reduceNormalizedVisualEvidenceToSourceOutline,
} from "../evals/hostAttachmentEval.js";

function readJson<T>(relativePath: string): T {
  return JSON.parse(
    readFileSync(new URL(relativePath, import.meta.url), "utf8"),
  ) as T;
}

type VisualEvidenceFixture = {
  contract: "migrate_visual_evidence_v1";
  visual_evidence: NormalizedVisualEvidenceInput[];
  ambiguities?: string[];
};

function buildBaseTrace(
  runnerId: string,
  handoffKind: "mcp" | "cli",
): HostAttachmentEvalTrace {
  const responseFixture = readJson<VisualEvidenceFixture>(
    "../../../../workflow-examples/migration-visual-grounding/migrate-visual-evidence.response.example.json",
  );
  const reduced = reduceNormalizedVisualEvidenceToSourceOutline({
    visual_evidence: responseFixture.visual_evidence,
    ambiguities: responseFixture.ambiguities,
  });
  const lowConfidenceLabels = responseFixture.visual_evidence
    .filter(
      (entry) =>
        (entry.confidence as VisualEvidenceConfidence | undefined) === "low",
    )
    .map((entry) => entry.label ?? entry.source);

  return {
    scenario_id: HOST_ATTACHMENT_PREPROCESSING_SCENARIO.id,
    runner_id: runnerId,
    status: "completed",
    transport_trace:
      handoffKind === "mcp"
        ? [
            {
              transport: "host",
              status: "succeeded",
              detail:
                "The host inspected the attachments and normalized them into migrate_visual_evidence_v1 before the MCP handoff.",
            },
            {
              transport: "mcp",
              status: "succeeded",
              detail:
                "The host called migrate_to_salt with source_outline only after preprocessing.",
            },
          ]
        : [
            {
              transport: "host",
              status: "succeeded",
              detail:
                "The host inspected the attachments and normalized them into migrate_visual_evidence_v1 before the CLI handoff.",
            },
            {
              transport: "cli",
              status: "succeeded",
              detail:
                "The host wrote a source-outline file and ran salt-ds migrate with --source-outline.",
            },
          ],
    preprocessing: {
      normalized_contract: responseFixture.contract,
      attachment_labels: responseFixture.visual_evidence.map(
        (entry) => entry.label ?? entry.source,
      ),
      low_confidence_labels: lowConfidenceLabels,
      ambiguities: responseFixture.ambiguities ?? [],
      reduced_source_outline: reduced,
      raw_attachment_passthrough: false,
    },
    handoff:
      handoffKind === "mcp"
        ? {
            kind: "mcp",
            tool: "migrate_to_salt",
            input_keys: ["query", "source_outline", "view"],
            source_outline: reduced,
          }
        : {
            kind: "cli",
            command: "salt-ds",
            args: [
              "migrate",
              "Preserve toolbar actions and loading state.",
              "--source-outline",
              ".salt/tmp/orders.source-outline.json",
              "--json",
            ],
            source_outline: reduced,
          },
    transcript: [
      "Attachment preprocessing stayed in the host.",
      "Low-confidence screenshot observations stayed visible as ambiguities.",
    ],
  };
}

describe("host attachment eval layer", () => {
  it("reduces normalized visual evidence into a source outline for stable host handoff checks", () => {
    const responseFixture = readJson<VisualEvidenceFixture>(
      "../../../../workflow-examples/migration-visual-grounding/migrate-visual-evidence.response.example.json",
    );

    expect(
      reduceNormalizedVisualEvidenceToSourceOutline({
        visual_evidence: responseFixture.visual_evidence,
        ambiguities: responseFixture.ambiguities,
      }),
    ).toEqual({
      regions: ["header", "sidebar", "content", "toolbar"],
      actions: ["Save", "Cancel", "Refresh"],
      states: ["loading", "empty"],
      notes: [
        "The mockup keeps the primary actions in the right-hand toolbar cluster.",
        "Screenshot-only interpretation is approximate and should be checked against runtime before rollout.",
        "Confirm the screenshot-derived toolbar landmarks against the running app before finalizing the first migration scaffold.",
      ],
    });
  });

  it("passes MCP-backed host traces that preprocess attachments before migrate_to_salt", () => {
    const judgment = judgeHostAttachmentEvalScenario(
      HOST_ATTACHMENT_PREPROCESSING_SCENARIO,
      buildBaseTrace("claude-mcp", "mcp"),
    );

    expect(judgment).toEqual({
      status: "passed",
      reasons: [
        "Runner claude-mcp kept attachment preprocessing outside Salt and handed off source_outline correctly.",
      ],
    });
    expect(
      judgeHostAttachmentEvalScenario(
        HOST_ATTACHMENT_PREPROCESSING_SCENARIO,
        buildBaseTrace("copilot-mcp", "mcp"),
      ).status,
    ).toBe("passed");
  });

  it("passes CLI-backed host traces that preprocess attachments before salt-ds migrate", () => {
    expect(
      judgeHostAttachmentEvalScenario(
        HOST_ATTACHMENT_PREPROCESSING_SCENARIO,
        buildBaseTrace("cursor-cli", "cli"),
      ).status,
    ).toBe("passed");
    expect(
      judgeHostAttachmentEvalScenario(
        HOST_ATTACHMENT_PREPROCESSING_SCENARIO,
        buildBaseTrace("codex-cli", "cli"),
      ).status,
    ).toBe("passed");
  });

  it("fails when a host trace passes raw attachments through to migrate_to_salt", () => {
    const trace = buildBaseTrace("broken-mcp", "mcp");
    trace.preprocessing.raw_attachment_passthrough = true;
    if (trace.handoff.kind !== "mcp") {
      throw new Error("Expected an MCP handoff trace.");
    }
    trace.handoff.input_keys.push("visual_evidence");

    expect(
      judgeHostAttachmentEvalScenario(
        HOST_ATTACHMENT_PREPROCESSING_SCENARIO,
        trace,
      ),
    ).toEqual(
      expect.objectContaining({
        status: "failed",
        reasons: expect.arrayContaining([
          expect.stringContaining("raw attachment passthrough"),
          expect.stringContaining("raw attachment keys"),
        ]),
      }),
    );
  });

  it("fails when a CLI host skips the source-outline handoff and uses raw screenshot flags instead", () => {
    const trace = buildBaseTrace("broken-cli", "cli");
    if (trace.handoff.kind !== "cli") {
      throw new Error("Expected a CLI handoff trace.");
    }
    trace.handoff.args = [
      "migrate",
      "Preserve toolbar actions and loading state.",
      "--screenshot",
      "current-toolbar.png",
      "--json",
    ];

    expect(
      judgeHostAttachmentEvalScenario(
        HOST_ATTACHMENT_PREPROCESSING_SCENARIO,
        trace,
      ),
    ).toEqual(
      expect.objectContaining({
        status: "failed",
        reasons: expect.arrayContaining([
          expect.stringContaining("did not use --source-outline"),
          expect.stringContaining("raw attachment flags"),
        ]),
      }),
    );
  });

  it("fails when a host trace drops low-confidence and ambiguity markers before handoff", () => {
    const trace = buildBaseTrace("broken-confidence", "mcp");
    trace.preprocessing.low_confidence_labels = [];
    trace.preprocessing.ambiguities = [];

    expect(
      judgeHostAttachmentEvalScenario(
        HOST_ATTACHMENT_PREPROCESSING_SCENARIO,
        trace,
      ),
    ).toEqual(
      expect.objectContaining({
        status: "failed",
        reasons: expect.arrayContaining([
          expect.stringContaining("low-confidence"),
          expect.stringContaining("ambiguities"),
        ]),
      }),
    );
  });
});
