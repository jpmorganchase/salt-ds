import {
  buildProjectConventionRepoRefinementArtifact,
  type WorkflowRepoRefinementArtifact,
} from "@salt-ds/semantic-core/tools/workflowRepoRefinement";
import type {
  WorkflowProjectConventionsCheckSummary,
  WorkflowProjectConventionsSummary,
  WorkflowProjectPolicySummary,
} from "../../../lib/projectConventionsWorkflow.js";

export function formatProjectPolicyLayer(
  layer: { id: string; scope: string } | null | undefined,
): string | null {
  if (!layer) {
    return null;
  }

  return `${layer.id} (${layer.scope})`;
}

export function formatProjectPolicyLayers(
  layers: Array<{ id: string; scope: string }>,
): string | null {
  if (layers.length === 0) {
    return null;
  }

  return layers.map((layer) => formatProjectPolicyLayer(layer)).join(", ");
}

export function formatProjectConventionsTopics(
  topics: string[],
): string | null {
  if (topics.length === 0) {
    return null;
  }

  return topics.map((topic) => topic.replaceAll("-", " ")).join(", ");
}

export function formatThemeDefaultSummary(
  summary: WorkflowProjectConventionsSummary["themeDefaults"],
): string | null {
  if (!summary?.provider) {
    return null;
  }

  const propSummary =
    summary.props.length > 0
      ? ` (${summary.props.map((entry) => `${entry.name}=${entry.value}`).join(", ")})`
      : "";

  return `${summary.provider}${propSummary}`;
}

export function formatTokenFamilyPolicySummary(
  policies:
    | WorkflowProjectConventionsSummary["tokenFamilyPolicies"]
    | WorkflowProjectPolicySummary["tokenFamilyPolicies"],
): string | null {
  if (policies.length === 0) {
    return null;
  }

  return policies.map((entry) => `${entry.family}:${entry.mode}`).join(", ");
}

export function buildProjectPolicyNotes(
  summary: WorkflowProjectPolicySummary | null,
): string[] {
  if (!summary) {
    return [];
  }

  const notes: string[] = [];
  const consultedLayers = formatProjectPolicyLayers(summary.layersConsulted);
  const themeDefaultSummary = formatThemeDefaultSummary(summary.themeDefaults);
  const tokenFamilyPolicySummary = formatTokenFamilyPolicySummary(
    summary.tokenFamilyPolicies,
  );

  if (summary.declared) {
    notes.push(
      summary.policyMode === "stack"
        ? "Repo policy is layered through .salt/stack.json."
        : summary.policyMode === "team"
          ? "Repo policy is declared through .salt/team.json."
          : "Repo policy is declared for this repo.",
    );
  }

  if (consultedLayers) {
    notes.push(`Repo policy layers consulted: ${consultedLayers}.`);
  }

  if (summary.sharedPacks.length > 0) {
    notes.push(
      `Shared project conventions pack(s) available: ${summary.sharedPacks.join(", ")}.`,
    );
  }

  if (summary.approvedWrappers.length > 0) {
    notes.push(
      `Approved wrappers declared: ${summary.approvedWrappers.join(", ")}.`,
    );
  }

  if (themeDefaultSummary) {
    notes.push(`Repo theme default: ${themeDefaultSummary}.`);
  }

  if (summary.tokenAliases.length > 0) {
    notes.push(`Repo token aliases declared: ${summary.tokenAliases.length}.`);
  }

  if (tokenFamilyPolicySummary) {
    notes.push(`Repo token families: ${tokenFamilyPolicySummary}.`);
  }

  return Array.from(new Set([...notes, ...summary.warnings]));
}

export function appendProjectPolicyLines(
  lines: string[],
  summary: WorkflowProjectPolicySummary | null,
): void {
  if (!summary) {
    return;
  }

  const themeDefaultSummary = formatThemeDefaultSummary(summary.themeDefaults);
  const tokenFamilyPolicySummary = formatTokenFamilyPolicySummary(
    summary.tokenFamilyPolicies,
  );

  if (themeDefaultSummary) {
    lines.push(`Project theme default: ${themeDefaultSummary}`);
  }

  if (summary.tokenAliases.length > 0) {
    lines.push(`Project token aliases: ${summary.tokenAliases.length}`);
  }

  if (tokenFamilyPolicySummary) {
    lines.push(`Project token families: ${tokenFamilyPolicySummary}`);
  }
}

export function buildProjectConventionsCheckNotes(
  summary: WorkflowProjectConventionsCheckSummary | null,
): string[] {
  if (!summary) {
    return [];
  }

  const notes: string[] = [];
  const formattedTopics = formatProjectConventionsTopics(summary.topics);

  if (summary.declared) {
    notes.push(
      summary.policyMode === "stack"
        ? "Project conventions are declared through .salt/stack.json."
        : summary.policyMode === "team"
          ? "Project conventions are declared through .salt/team.json."
          : "Project conventions are declared for this repo.",
    );
  } else if (summary.checkRecommended) {
    notes.push(
      "No .salt/team.json or .salt/stack.json was detected even though project conventions may still refine the final project answer.",
    );
  }

  if (summary.sharedPacks.length > 0) {
    notes.push(
      `Shared project conventions pack(s) available: ${summary.sharedPacks.join(", ")}.`,
    );
  }

  if (summary.checkRecommended && formattedTopics) {
    notes.push(`Project conventions topics to confirm: ${formattedTopics}.`);
  }

  return Array.from(new Set([...notes, ...summary.warnings]));
}

export function toActionableProjectConventionsRepoRefinement(
  summary: WorkflowProjectConventionsSummary | null,
): WorkflowRepoRefinementArtifact | null {
  if (!summary?.applied) {
    return null;
  }

  return buildProjectConventionRepoRefinementArtifact({
    canonical_name: summary.canonicalChoice.name,
    final_name: summary.finalRecommendation,
    reason: summary.whyChanged ?? summary.appliedRule?.reason ?? null,
    import_reference:
      summary.finalChoice.import ?? summary.appliedRule?.import ?? null,
    source_urls: Array.from(
      new Set(
        [
          ...(summary.appliedRule?.docs ?? []),
          summary.appliedRule?.layer?.source ?? null,
        ].filter((value): value is string => Boolean(value)),
      ),
    ),
  });
}
