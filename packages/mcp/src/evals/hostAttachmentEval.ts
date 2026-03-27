import type {
  NormalizedVisualEvidenceInput,
  SourceUiOutlineInput,
} from "@salt-ds/semantic-core/tools/translation/sourceUiTypes";

export const HOST_ATTACHMENT_FIXTURE_PATHS = {
  normalizedVisualEvidence:
    "workflow-examples/migration-visual-grounding/migrate-visual-evidence.response.example.json",
  sourceOutline:
    "workflow-examples/migration-visual-grounding/migrate-source-outline.example.json",
  prompts:
    "workflow-examples/migration-visual-grounding/host-preprocessing-prompts.md",
} as const;

export interface HostAttachmentEvalScenario {
  id: string;
  fixture: {
    normalized_visual_evidence_path: string;
    source_outline_example_path: string;
    prompt_reference_path: string;
  };
  task: {
    workflow: "migrate";
    prompt: string;
    attachment_labels: string[];
  };
  capabilities: {
    host_attachment_inspection: true;
    mcp?: boolean;
    cli?: boolean;
  };
  expected: {
    normalization_contract: "migrate_visual_evidence_v1";
    final_handoff: "source_outline";
    allowed_handoffs: Array<"mcp" | "cli">;
    stop_raw_attachment_passthrough: true;
    preserve_low_confidence: true;
    preserve_ambiguities: true;
    required_source_outline_fragments: {
      regions?: string[];
      actions?: string[];
      states?: string[];
      notes?: string[];
    };
  };
}

export interface HostAttachmentTransportTraceEntry {
  transport: "host" | "mcp" | "cli";
  status: "succeeded" | "failed" | "fallback" | "unavailable";
  detail: string;
}

interface HostAttachmentPreprocessingTrace {
  normalized_contract: "migrate_visual_evidence_v1" | null;
  attachment_labels: string[];
  low_confidence_labels: string[];
  ambiguities: string[];
  reduced_source_outline: SourceUiOutlineInput | null;
  raw_attachment_passthrough: boolean;
}

interface MigrateToolHandoffTrace {
  kind: "mcp";
  tool: "migrate_to_salt";
  input_keys: string[];
  source_outline: SourceUiOutlineInput | null;
}

interface MigrateCliHandoffTrace {
  kind: "cli";
  command: "salt-ds";
  args: string[];
  source_outline: SourceUiOutlineInput | null;
}

export interface HostAttachmentEvalTrace {
  scenario_id: string;
  runner_id: string;
  status: "completed" | "skipped";
  transport_trace: HostAttachmentTransportTraceEntry[];
  preprocessing: HostAttachmentPreprocessingTrace;
  handoff: MigrateToolHandoffTrace | MigrateCliHandoffTrace;
  transcript: string[];
}

export interface HostAttachmentEvalJudgment {
  status: "passed" | "failed" | "skipped";
  reasons: string[];
}

const RAW_MCP_ATTACHMENT_KEYS = ["mockup", "screenshot", "visual_evidence"];
const RAW_CLI_ATTACHMENT_FLAGS = ["--mockup", "--screenshot"];

function uniqueStrings(values: Array<string | null | undefined>): string[] {
  return Array.from(
    new Set(
      values
        .filter((value): value is string => typeof value === "string")
        .map((value) => value.trim())
        .filter((value) => value.length > 0),
    ),
  );
}

function hasOutlineSignals(
  outline: SourceUiOutlineInput | null | undefined,
): boolean {
  if (!outline) {
    return false;
  }

  return (
    (outline.regions?.length ?? 0) +
      (outline.actions?.length ?? 0) +
      (outline.states?.length ?? 0) +
      (outline.notes?.length ?? 0) >
    0
  );
}

function missingFragments(
  available: string[] | undefined,
  required: string[] | undefined,
): string[] {
  if (!required || required.length === 0) {
    return [];
  }

  const haystack = available ?? [];
  return required.filter(
    (fragment) =>
      !haystack.some((value) =>
        value.toLowerCase().includes(fragment.toLowerCase()),
      ),
  );
}

function collectSourceOutlineFailures(
  outline: SourceUiOutlineInput | null,
  expected: HostAttachmentEvalScenario["expected"]["required_source_outline_fragments"],
): string[] {
  if (!hasOutlineSignals(outline)) {
    return [
      "The host trace did not carry a non-empty source_outline into the final Salt handoff.",
    ];
  }

  const failures = [
    ...missingFragments(outline?.regions, expected.regions).map(
      (fragment) =>
        `The reduced source_outline did not preserve the required region fragment: ${fragment}.`,
    ),
    ...missingFragments(outline?.actions, expected.actions).map(
      (fragment) =>
        `The reduced source_outline did not preserve the required action fragment: ${fragment}.`,
    ),
    ...missingFragments(outline?.states, expected.states).map(
      (fragment) =>
        `The reduced source_outline did not preserve the required state fragment: ${fragment}.`,
    ),
    ...missingFragments(outline?.notes, expected.notes).map(
      (fragment) =>
        `The reduced source_outline did not preserve the required note fragment: ${fragment}.`,
    ),
  ];

  return failures;
}

export function reduceNormalizedVisualEvidenceToSourceOutline(input: {
  visual_evidence: NormalizedVisualEvidenceInput[];
  ambiguities?: string[];
}): SourceUiOutlineInput {
  return {
    regions: uniqueStrings(
      input.visual_evidence.flatMap((entry) => entry.derived_outline.regions),
    ),
    actions: uniqueStrings(
      input.visual_evidence.flatMap((entry) => entry.derived_outline.actions),
    ),
    states: uniqueStrings(
      input.visual_evidence.flatMap((entry) => entry.derived_outline.states),
    ),
    notes: uniqueStrings([
      ...input.visual_evidence.flatMap((entry) => entry.derived_outline.notes),
      ...(input.ambiguities ?? []),
    ]),
  };
}

export const HOST_ATTACHMENT_PREPROCESSING_SCENARIO: HostAttachmentEvalScenario =
  {
    id: "migrate-host-attachment-preprocessing",
    fixture: {
      normalized_visual_evidence_path:
        HOST_ATTACHMENT_FIXTURE_PATHS.normalizedVisualEvidence,
      source_outline_example_path: HOST_ATTACHMENT_FIXTURE_PATHS.sourceOutline,
      prompt_reference_path: HOST_ATTACHMENT_FIXTURE_PATHS.prompts,
    },
    task: {
      workflow: "migrate",
      prompt:
        "Use salt-ds to migrate the attached legacy orders screen into Salt. Preserve toolbar actions, loading state, and the main navigation landmarks.",
      attachment_labels: ["legacy-orders.mockup.png", "current-toolbar.png"],
    },
    capabilities: {
      host_attachment_inspection: true,
      mcp: true,
      cli: true,
    },
    expected: {
      normalization_contract: "migrate_visual_evidence_v1",
      final_handoff: "source_outline",
      allowed_handoffs: ["mcp", "cli"],
      stop_raw_attachment_passthrough: true,
      preserve_low_confidence: true,
      preserve_ambiguities: true,
      required_source_outline_fragments: {
        regions: ["header", "toolbar"],
        actions: ["Save", "Refresh"],
        states: ["loading"],
        notes: ["checked against runtime", "toolbar landmarks"],
      },
    },
  };

export function judgeHostAttachmentEvalScenario(
  scenario: HostAttachmentEvalScenario,
  trace: HostAttachmentEvalTrace,
): HostAttachmentEvalJudgment {
  if (trace.status === "skipped") {
    return {
      status: "skipped",
      reasons: [
        `Runner ${trace.runner_id} skipped ${scenario.id}.`,
        ...trace.transcript,
      ],
    };
  }

  const failures: string[] = [];

  if (trace.scenario_id !== scenario.id) {
    failures.push(
      `Trace scenario_id ${trace.scenario_id} did not match scenario ${scenario.id}.`,
    );
  }

  const hostStep = trace.transport_trace.find(
    (entry) => entry.transport === "host",
  );
  if (!hostStep || hostStep.status !== "succeeded") {
    failures.push(
      "The normalized trace did not record a successful host-side attachment inspection step.",
    );
  }

  if (
    trace.preprocessing.normalized_contract !==
    scenario.expected.normalization_contract
  ) {
    failures.push(
      `The host trace did not preserve the expected normalization contract ${scenario.expected.normalization_contract}.`,
    );
  }

  const missingLabels = scenario.task.attachment_labels.filter(
    (label) => !trace.preprocessing.attachment_labels.includes(label),
  );
  if (missingLabels.length > 0) {
    failures.push(
      `The host trace did not preserve all expected attachment labels: ${missingLabels.join(", ")}.`,
    );
  }

  if (
    scenario.expected.stop_raw_attachment_passthrough &&
    trace.preprocessing.raw_attachment_passthrough
  ) {
    failures.push(
      "The host trace marked raw attachment passthrough as true. Attachments must be normalized before Salt handoff.",
    );
  }

  if (
    scenario.expected.preserve_low_confidence &&
    trace.preprocessing.low_confidence_labels.length === 0
  ) {
    failures.push(
      "The host trace dropped the low-confidence visual evidence markers.",
    );
  }

  if (
    scenario.expected.preserve_ambiguities &&
    trace.preprocessing.ambiguities.length === 0
  ) {
    failures.push(
      "The host trace dropped the visual ambiguities that should stay visible before implementation.",
    );
  }

  failures.push(
    ...collectSourceOutlineFailures(
      trace.preprocessing.reduced_source_outline,
      scenario.expected.required_source_outline_fragments,
    ),
  );

  if (!scenario.expected.allowed_handoffs.includes(trace.handoff.kind)) {
    failures.push(
      `The handoff kind ${trace.handoff.kind} is not allowed for scenario ${scenario.id}.`,
    );
  }

  const handoff = trace.handoff;
  if (handoff.kind === "mcp") {
    const mcpStep = trace.transport_trace.find(
      (entry) => entry.transport === "mcp",
    );
    if (!mcpStep || mcpStep.status !== "succeeded") {
      failures.push(
        "The normalized trace did not record a successful MCP handoff after preprocessing.",
      );
    }

    const rawKeys = RAW_MCP_ATTACHMENT_KEYS.filter((key) =>
      handoff.input_keys.includes(key),
    );
    if (!handoff.input_keys.includes("source_outline")) {
      failures.push(
        "The MCP handoff did not include source_outline after attachment preprocessing.",
      );
    }
    if (rawKeys.length > 0) {
      failures.push(
        `The MCP handoff still included raw attachment keys: ${rawKeys.join(", ")}.`,
      );
    }
    failures.push(
      ...collectSourceOutlineFailures(
        handoff.source_outline,
        scenario.expected.required_source_outline_fragments,
      ),
    );
  } else {
    const cliStep = trace.transport_trace.find(
      (entry) => entry.transport === "cli",
    );
    if (!cliStep || cliStep.status !== "succeeded") {
      failures.push(
        "The normalized trace did not record a successful CLI handoff after preprocessing.",
      );
    }

    if (!handoff.args.includes("--source-outline")) {
      failures.push(
        "The CLI handoff did not use --source-outline after attachment preprocessing.",
      );
    }
    const rawFlags = RAW_CLI_ATTACHMENT_FLAGS.filter((flag) =>
      handoff.args.includes(flag),
    );
    if (rawFlags.length > 0) {
      failures.push(
        `The CLI handoff still used raw attachment flags: ${rawFlags.join(", ")}.`,
      );
    }
    failures.push(
      ...collectSourceOutlineFailures(
        handoff.source_outline,
        scenario.expected.required_source_outline_fragments,
      ),
    );
  }

  return {
    status: failures.length > 0 ? "failed" : "passed",
    reasons:
      failures.length > 0
        ? failures
        : [
            `Runner ${trace.runner_id} kept attachment preprocessing outside Salt and handed off source_outline correctly.`,
          ],
  };
}
