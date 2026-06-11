import type {
  LoadedMigrationVisualEvidence,
  ResolvedSourceOutline,
} from "../../../lib/migrationVisualEvidence.js";
import type {
  MigrateWorkflowResult,
  PublicTranslateResult,
} from "../shared/types.js";

export function buildMigrateQuestions(
  translation: PublicTranslateResult,
  sourceOutline: ResolvedSourceOutline | null,
  visualEvidence: LoadedMigrationVisualEvidence,
  currentExperience: MigrateWorkflowResult["artifacts"]["runtimeEvidence"]["currentExperience"],
): string[] {
  const combinedQuestions: string[] = [];

  if (sourceOutline && currentExperience) {
    const outlinedRegions = sourceOutline.outline.regions
      ?.slice(0, 3)
      .join(", ");
    const outlinedActions = sourceOutline.outline.actions
      ?.slice(0, 3)
      .join(", ");
    const outlinedStates = sourceOutline.outline.states?.slice(0, 3).join(", ");
    const liveLandmarks = currentExperience.landmarks.slice(0, 3).join(", ");
    const liveActions = currentExperience.interactionAnchors
      .slice(0, 3)
      .join(", ");

    if (outlinedRegions && liveLandmarks) {
      combinedQuestions.push(
        `Which live landmarks (${liveLandmarks}) must stay recognizable inside the outlined regions (${outlinedRegions})?`,
      );
    }

    if (outlinedActions && liveActions) {
      combinedQuestions.push(
        `Which live actions (${liveActions}) are non-negotiable, and do they still fit the outlined action set (${outlinedActions})?`,
      );
    }

    if (outlinedStates) {
      combinedQuestions.push(
        `Do the outlined states (${outlinedStates}) match the running experience closely enough for the first migration pass?`,
      );
    }
  }

  if (visualEvidence.visualInputs.some((entry) => entry.confidence === "low")) {
    combinedQuestions.push(
      "Which parts of the low-confidence screenshot or mockup interpretation must be confirmed before the first migration pass?",
    );
  }

  return Array.from(
    new Set([
      ...(combinedQuestions.length > 0 ? combinedQuestions : []),
      ...visualEvidence.ambiguities,
      ...(translation.clarifying_questions ?? []),
    ]),
  ).slice(0, 5);
}
