import fs from "node:fs/promises";
import path from "node:path";
import type {
  WorkflowCompositionCertainty,
  WorkflowCompositionContract,
  WorkflowCompositionSlot,
} from "@salt-ds/semantic-core/tools/compositionContract";
import type { ReviewExpectedTargets } from "@salt-ds/semantic-core/tools/reviewSaltUi";
import type { SaltRegistry } from "@salt-ds/semantic-core/types";

export interface LoadedCreateReviewTargets {
  reportPath: string;
  expectedTargets: ReviewExpectedTargets;
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function readStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value
        .map((entry) => readString(entry))
        .filter((entry): entry is string => Boolean(entry))
    : [];
}

function readRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
}

function collectSourceUrls(value: unknown): string[] {
  if (Array.isArray(value)) {
    return unique(value.flatMap((entry) => collectSourceUrls(entry)));
  }

  const record = readRecord(value);
  if (!record) {
    return [];
  }

  const collected = [
    ...readStringArray(record.source_urls),
    ...readStringArray(record.canonical_source_urls),
    ...readStringArray(record.starter_source_urls),
  ];

  for (const entry of Object.values(record)) {
    collected.push(...collectSourceUrls(entry));
  }

  return unique(collected);
}

function collectDecisionNames(payload: Record<string, unknown>): string[] {
  const result = readRecord(payload.result);
  const intent = readRecord(result?.intent);
  const recommendation = readRecord(result?.recommendation);
  const recommendationDecision = readRecord(recommendation?.decision);
  const directDecision = readRecord(result?.decision);
  const summary = readRecord(result?.summary);
  const canonicalChoice = readString(intent?.canonicalChoice);

  return unique(
    [
      readString(recommendationDecision?.name),
      readString(directDecision?.name),
      readString(summary?.decisionName),
      readString(summary?.finalDecisionName),
      canonicalChoice?.includes(":")
        ? canonicalChoice.split(":").slice(1).join(":").trim()
        : canonicalChoice,
    ].filter((entry): entry is string => Boolean(entry)),
  );
}

function collectPatternNamesFromSources(
  registry: SaltRegistry,
  sourceUrls: string[],
): string[] {
  const matched = registry.patterns
    .filter((pattern) => {
      const docUrl = readString(pattern.related_docs.overview);
      return docUrl ? sourceUrls.includes(docUrl) : false;
    })
    .map((pattern) => pattern.name);

  return unique(matched);
}

function collectComponentNamesFromSources(
  registry: SaltRegistry,
  sourceUrls: string[],
): string[] {
  const matched = registry.components
    .filter((component) => {
      const relatedDocs = [
        component.related_docs.overview,
        component.related_docs.usage,
        component.related_docs.accessibility,
        component.related_docs.examples,
      ].filter((entry): entry is string => Boolean(entry));
      return relatedDocs.some((entry) => sourceUrls.includes(entry));
    })
    .map((component) => component.name);

  return unique(matched);
}

function expandPatternNamesFromStarterSources(
  registry: SaltRegistry,
  patternNames: string[],
): string[] {
  const expanded = new Set(patternNames);
  let changed = true;

  while (changed) {
    changed = false;
    const currentNames = [...expanded];
    for (const patternName of currentNames) {
      const pattern = registry.patterns.find(
        (entry) => entry.name === patternName,
      );
      if (!pattern?.starter_scaffold?.source_urls) {
        continue;
      }

      for (const candidate of collectPatternNamesFromSources(
        registry,
        pattern.starter_scaffold.source_urls,
      )) {
        if (expanded.has(candidate)) {
          continue;
        }
        expanded.add(candidate);
        changed = true;
      }
    }
  }

  return [...expanded];
}

function readCompositionCertainty(
  value: unknown,
): WorkflowCompositionCertainty | null {
  return value === "explicitly_requested" ||
    value === "strongly_implied" ||
    value === "optional" ||
    value === "confirmation_needed"
    ? value
    : null;
}

function readCompositionSlot(value: unknown): WorkflowCompositionSlot | null {
  const record = readRecord(value);
  const id = readString(record?.id);
  const label = readString(record?.label);
  const certainty = readCompositionCertainty(record?.certainty);
  const reason = readString(record?.reason);
  if (!id || !label || !certainty || !reason) {
    return null;
  }

  return {
    id,
    label,
    certainty,
    preferred_patterns: readStringArray(record?.preferred_patterns),
    preferred_components: readStringArray(record?.preferred_components),
    reason,
    source_urls: readStringArray(record?.source_urls),
    notes: readStringArray(record?.notes),
  };
}

function readCompositionContract(
  payload: Record<string, unknown>,
): WorkflowCompositionContract | null {
  const result = readRecord(payload.result);
  const recommendation = readRecord(result?.recommendation);
  const candidate =
    readRecord(recommendation?.composition_contract) ??
    readRecord(result?.composition_contract);
  const primaryTarget = readRecord(candidate?.primary_target);
  const solutionType = readString(primaryTarget?.solution_type);
  const name = readString(primaryTarget?.name);

  if (
    !candidate ||
    !solutionType ||
    !["component", "pattern", "foundation", "token"].includes(solutionType)
  ) {
    return null;
  }

  return {
    primary_target: {
      solution_type:
        solutionType as WorkflowCompositionContract["primary_target"]["solution_type"],
      name,
    },
    expected_patterns: readStringArray(candidate.expected_patterns),
    expected_components: readStringArray(candidate.expected_components),
    slots: Array.isArray(candidate.slots)
      ? candidate.slots
          .map((slot) => readCompositionSlot(slot))
          .filter((slot): slot is WorkflowCompositionSlot => Boolean(slot))
      : [],
    avoid: readStringArray(candidate.avoid),
    source_urls: readStringArray(candidate.source_urls),
  };
}

export async function loadCreateReviewTargets(
  cwd: string,
  reportPathFlag: string | undefined,
  registry: SaltRegistry,
): Promise<LoadedCreateReviewTargets | null> {
  if (!reportPathFlag) {
    return null;
  }

  const reportPath = path.resolve(cwd, reportPathFlag);
  const payload = JSON.parse(await fs.readFile(reportPath, "utf8")) as unknown;
  const root = readRecord(payload);
  if (!root) {
    throw new Error("The create report must be a JSON object.");
  }

  const workflow = readRecord(root.workflow);
  const workflowId = readString(workflow?.id);
  if (workflowId !== "create" && workflowId !== "create_salt_ui") {
    throw new Error(
      "The create report does not contain a create workflow envelope.",
    );
  }

  const result = readRecord(root.result);
  const recommendation =
    readRecord(result?.recommendation) ?? readRecord(result);
  if (!result || !recommendation) {
    throw new Error(
      "The create report does not contain the expected recommendation payload.",
    );
  }

  const compositionContract = readCompositionContract(root);
  const sourceUrls = unique(collectSourceUrls(root));
  const decisionNames = collectDecisionNames(root);
  const decisionComponents = registry.components
    .filter((component) => decisionNames.includes(component.name))
    .map((component) => component.name);
  const decisionPatterns = registry.patterns
    .filter((pattern) => decisionNames.includes(pattern.name))
    .map((pattern) => pattern.name);
  const sourceComponents = collectComponentNamesFromSources(
    registry,
    sourceUrls,
  );
  const sourcePatterns = collectPatternNamesFromSources(registry, sourceUrls);
  const contractComponents = compositionContract?.expected_components ?? [];
  const contractPatterns = compositionContract?.expected_patterns ?? [];

  const expectedTargets: ReviewExpectedTargets = {
    source: "create_report",
    components: unique([
      ...contractComponents,
      ...decisionComponents,
      ...sourceComponents,
    ]),
    patterns: expandPatternNamesFromStarterSources(registry, [
      ...contractPatterns,
      ...decisionPatterns,
      ...sourcePatterns,
    ]),
    composition_contract: compositionContract,
  };

  return {
    reportPath: reportPath.split(path.sep).join("/"),
    expectedTargets,
  };
}
