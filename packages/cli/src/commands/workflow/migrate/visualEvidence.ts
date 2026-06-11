import type { LoadedMigrationVisualEvidence } from "../../../lib/migrationVisualEvidence.js";
import type {
  MigrateWorkflowResult,
  RuntimeInspectResult,
} from "../shared/types.js";

export function buildMigrateVisualEvidence(
  visualEvidence: LoadedMigrationVisualEvidence,
  requestedUrl: string | null,
  runtimeResult: RuntimeInspectResult | null,
): MigrateWorkflowResult["artifacts"]["visualEvidence"] {
  const reasons: string[] = [];
  let level: MigrateWorkflowResult["artifacts"]["visualEvidence"]["confidenceImpact"]["level"] =
    "none";

  if (visualEvidence.visualInputs.length > 0) {
    level = "supporting";
    reasons.push(
      "Adapter-derived mockup or screenshot evidence contributed regions, actions, and states before the Salt mapping step.",
    );
  } else if (visualEvidence.sourceOutline) {
    level = "supporting";
    reasons.push(
      "Structured outline signals contributed regions, actions, and states before the Salt mapping step.",
    );
  }

  if (runtimeResult) {
    level = visualEvidence.mergedOutline ? "stronger-scoping" : "supporting";
    reasons.push(
      "Current UI capture contributed live landmarks, action hierarchy, structure, and layout signals.",
    );
  }

  const mockups = visualEvidence.visualInputs
    .filter((entry) => entry.kind === "mockup")
    .map((entry) => ({
      sourceType: entry.sourceType,
      source: entry.source,
      label: entry.label,
      confidence: entry.confidence,
      regions: entry.counts.regions,
      actions: entry.counts.actions,
      states: entry.counts.states,
      notes: entry.counts.notes,
      adapterNotes: entry.notes,
    }));
  const screenshots = visualEvidence.visualInputs
    .filter((entry) => entry.kind === "screenshot")
    .map((entry) => ({
      sourceType: entry.sourceType,
      source: entry.source,
      label: entry.label,
      confidence: entry.confidence,
      regions: entry.counts.regions,
      actions: entry.counts.actions,
      states: entry.counts.states,
      notes: entry.counts.notes,
      adapterNotes: entry.notes,
    }));

  return {
    contract: {
      role: "supporting-evidence",
      notCanonicalSourceOfTruth: true,
      supportedInputs: [
        "structured-outline",
        "current-ui-capture",
        "mockup-image",
        "screenshot-file",
        "image-url",
      ],
      interpretationOwner: "agent-or-adapter",
      normalizationRequired: true,
      normalizationContract: "migrate_visual_evidence_v1",
      structuredOutputs: [
        "landmarks",
        "action-hierarchy",
        "layout-signals",
        "familiarity-anchors",
        "confidence-impact",
      ],
    },
    interpretationOwner: "agent-or-adapter",
    inputs: {
      structuredOutline: {
        provided: Boolean(visualEvidence.sourceOutline),
        path: visualEvidence.sourceOutline?.path ?? null,
        regions: visualEvidence.sourceOutline?.counts.regions ?? 0,
        actions: visualEvidence.sourceOutline?.counts.actions ?? 0,
        states: visualEvidence.sourceOutline?.counts.states ?? 0,
        notes: visualEvidence.sourceOutline?.counts.notes ?? 0,
      },
      currentUiCapture: {
        requested: Boolean(requestedUrl),
        url: requestedUrl,
        mode: runtimeResult?.inspectionMode ?? null,
        currentExperienceCaptured: Boolean(runtimeResult),
        screenshotArtifacts: runtimeResult?.screenshots.length ?? 0,
      },
      mockups,
      screenshots,
    },
    derivedOutline: {
      available: Boolean(visualEvidence.mergedOutline),
      regions: visualEvidence.mergedOutline?.counts.regions ?? 0,
      actions: visualEvidence.mergedOutline?.counts.actions ?? 0,
      states: visualEvidence.mergedOutline?.counts.states ?? 0,
      notes: visualEvidence.mergedOutline?.counts.notes ?? 0,
    },
    confidenceImpact: {
      level,
      reasons,
      changedScoping: level !== "none",
      changedConfidence: reasons.length > 0,
    },
    ambiguities: visualEvidence.ambiguities,
  };
}

export function describeMigrateVisualEvidence(
  visualEvidence: MigrateWorkflowResult["artifacts"]["visualEvidence"],
): string {
  const activeInputs: string[] = [];
  if (visualEvidence.inputs.structuredOutline.provided) {
    activeInputs.push("structured outline");
  }
  if (visualEvidence.inputs.mockups.length > 0) {
    activeInputs.push("mockup image");
  }
  if (visualEvidence.inputs.screenshots.length > 0) {
    activeInputs.push("screenshot evidence");
  }
  if (visualEvidence.inputs.currentUiCapture.requested) {
    activeInputs.push("current UI capture");
  }

  if (activeInputs.length === 0) {
    return "none";
  }

  return `${activeInputs.join(" + ")} (${visualEvidence.confidenceImpact.level})`;
}
