export const targetJob =
  "implement, repair, or migrate a Salt UI change against the exact installed Salt vector, finding the right current guidance while avoiding unsupported or unnecessary changes";

export const problemCategories = Object.freeze([
  "component_choice",
  "composition",
  "migration",
  "provider_theme",
  "repair",
  "retrieval",
  "unsupported_change_avoidance",
]);

const forbiddenCallerFields = new Set([
  "aggregate",
  "decision",
  "result",
  "summary",
  "totals",
]);

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

function rejectCallerOutcome(value) {
  if (Array.isArray(value)) {
    for (const entry of value) rejectCallerOutcome(entry);
    return;
  }
  if (value === null || typeof value !== "object") return;
  for (const [field, nested] of Object.entries(value)) {
    invariant(
      !forbiddenCallerFields.has(field),
      `Caller-supplied ${field} is forbidden`,
    );
    rejectCallerOutcome(nested);
  }
}

function eligibleAlternatives(input) {
  const domains = new Set(input.authority.primary_source_domains);
  return input.sources
    .filter(
      (source) =>
        source.accessible &&
        source.current &&
        source.relevant &&
        domains.has(source.primary_source_domain),
    )
    .toSorted((left, right) =>
      left.alternative_id.localeCompare(right.alternative_id),
    );
}

export function buildAlternativesDecision(input) {
  rejectCallerOutcome(input);
  const sources = eligibleAlternatives(input);
  const uniqueIds = new Set(sources.map((source) => source.alternative_id));
  const includesSaltDocs = sources.some(
    (source) => source.alternative_type === "salt_docs_search",
  );
  const includesAiTool = sources.some((source) =>
    ["adjacent_ai_tool", "design_system_ai_tool"].includes(
      source.alternative_type,
    ),
  );
  const gates = {
    at_least_three_accessible_current_alternatives:
      sources.length >= 3 && uniqueIds.size === sources.length,
    includes_ordinary_salt_docs_search: includesSaltDocs,
    includes_ai_or_design_system_tool: includesAiTool,
    primary_sources_captured: sources.every(
      (source) => source.capture_sha256 && source.source_date,
    ),
  };
  const ready = Object.values(gates).every(Boolean);
  return {
    contract: "salt-ai-opportunity-alternatives-decision/1",
    schema_version: "1.0.0",
    unit_id: "004/03",
    phase: "alternatives",
    target_job: targetJob,
    authorization_sha256: input.authority.authorization_sha256,
    external_locator_sha256: input.external_locator_sha256,
    valid_cohort_count: 0,
    shortlist: sources.map((source) => ({
      alternative_id: source.alternative_id,
      alternative_type: source.alternative_type,
      capabilities: source.capabilities,
      current_workflow_use_count: 0,
    })),
    other_current_workflow_use_count: 0,
    primary_sources: sources.map((source) => ({
      alternative_id: source.alternative_id,
      source_type: source.alternative_type,
      source_date: source.source_date,
      capture_sha256: source.capture_sha256,
    })),
    gates,
    result: ready
      ? "READY_FOR_NEED_RESEARCH"
      : "DEFER_ALTERNATIVE_SELECTION_BLOCKED",
  };
}

export function buildDevelopmentBaseline(input, alternativesReceiptSha256) {
  rejectCallerOutcome(input);
  return {
    contract: "salt-ai-development-baseline/1",
    schema_version: "1.0.0",
    unit_id: "004/03",
    target_job: targetJob,
    alternatives_receipt_sha256: alternativesReceiptSha256,
    external_locator_sha256: input.external_locator_sha256,
    assets: eligibleAlternatives(input).map((source, index) => ({
      asset_id: `source-${source.alternative_id}`,
      sha256: source.capture_sha256,
      source_type: source.alternative_type,
      source_date: source.source_date,
      permitted_roles: ["read", "search"],
      order: index + 1,
      budgets: {
        max_queries: 8,
        max_read_bytes: 2_000_000,
      },
      known_limitations: source.known_limitations,
    })),
  };
}

function currentWorkflowCounts(validParticipants, shortlist) {
  const counts = new Map(shortlist.map((entry) => [entry.alternative_id, 0]));
  let other = 0;
  for (const participant of validParticipants) {
    if (participant.current_workflow_alternative_id === "other") {
      other += 1;
    } else {
      counts.set(
        participant.current_workflow_alternative_id,
        (counts.get(participant.current_workflow_alternative_id) ?? 0) + 1,
      );
    }
  }
  return {
    shortlist: shortlist.map((entry) => ({
      alternative_id: entry.alternative_id,
      alternative_type: entry.alternative_type,
      capabilities: entry.capabilities,
      current_workflow_use_count: counts.get(entry.alternative_id) ?? 0,
    })),
    other,
  };
}

function categoryCounts(validParticipants) {
  return problemCategories
    .map((category) => {
      const participants = validParticipants.filter((participant) =>
        participant.problem_categories.includes(category),
      );
      return {
        category,
        participant_count: participants.length,
        team_count: new Set(
          participants.map((participant) => participant.team_id),
        ).size,
      };
    })
    .filter((entry) => entry.participant_count > 0);
}

export function buildNeedDecision(input, alternatives) {
  rejectCallerOutcome(input);
  const validParticipants = input.participants.filter(
    (participant) => participant.valid,
  );
  const recurringProblemCount = validParticipants.filter(
    (participant) => participant.recurring_problem,
  ).length;
  const categories = categoryCounts(validParticipants);
  const workflow = currentWorkflowCounts(
    validParticipants,
    alternatives.shortlist,
  );
  const gates = {
    viable_comparator_shortlist:
      alternatives.result === "READY_FOR_NEED_RESEARCH" &&
      alternatives.shortlist.length >= 3,
    minimum_valid_cohort: validParticipants.length >= 4,
    recurring_problem_rate_at_least_80_percent:
      validParticipants.length > 0 &&
      recurringProblemCount * 5 >= validParticipants.length * 4,
    repeated_category_across_two_teams: categories.some(
      (entry) => entry.participant_count >= 2 && entry.team_count >= 2,
    ),
  };
  invariant(
    gates.minimum_valid_cohort || input.boundary_exhausted,
    "Insufficient cohort cannot be decided before its boundary is exhausted",
  );
  let result;
  if (!gates.viable_comparator_shortlist) {
    result = "DEFER_ALTERNATIVE_SELECTION_BLOCKED";
  } else if (!gates.minimum_valid_cohort) {
    result = "DEFER_INSUFFICIENT_COHORT";
  } else if (Object.values(gates).every(Boolean)) {
    result = "PASS_NEED";
  } else {
    result = "CUT_NEED";
  }
  return {
    contract: "salt-ai-opportunity-need-decision/1",
    schema_version: "1.0.0",
    unit_id: "004/03",
    phase: "need",
    target_job: targetJob,
    authorization_sha256: input.authority.authorization_sha256,
    alternatives_receipt_sha256: input.alternatives_receipt_sha256,
    outreach_attempt_count: input.outreach_attempt_count,
    business_day_count: input.business_day_count,
    boundary_exhausted: input.boundary_exhausted,
    valid_cohort_count: validParticipants.length,
    recurring_problem_count: recurringProblemCount,
    problem_categories: categories,
    shortlist: workflow.shortlist,
    other_current_workflow_use_count: workflow.other,
    gates,
    result,
  };
}

export function deriveDecisionResult(receipt) {
  if (receipt.contract === "salt-ai-opportunity-alternatives-decision/1") {
    const shortlistIds = receipt.shortlist.map((entry) => entry.alternative_id);
    const sourceIds = receipt.primary_sources.map(
      (entry) => entry.alternative_id,
    );
    invariant(
      isSortedUnique(shortlistIds),
      "Alternatives receipt shortlist is not sorted and unique",
    );
    const expectedGates = {
      at_least_three_accessible_current_alternatives: shortlistIds.length >= 3,
      includes_ordinary_salt_docs_search: receipt.shortlist.some(
        (entry) => entry.alternative_type === "salt_docs_search",
      ),
      includes_ai_or_design_system_tool: receipt.shortlist.some((entry) =>
        ["adjacent_ai_tool", "design_system_ai_tool"].includes(
          entry.alternative_type,
        ),
      ),
      primary_sources_captured:
        sourceIds.length === shortlistIds.length &&
        sourceIds.every((id, index) => id === shortlistIds[index]),
    };
    invariant(
      stableGates(receipt.gates) === stableGates(expectedGates),
      "Alternatives receipt gates do not match its frozen shortlist",
    );
    invariant(
      receipt.valid_cohort_count === 0 &&
        receipt.other_current_workflow_use_count === 0 &&
        receipt.shortlist.every(
          (entry) => entry.current_workflow_use_count === 0,
        ),
      "Alternatives receipt contains premature cohort counts",
    );
    return Object.values(expectedGates).every(Boolean)
      ? "READY_FOR_NEED_RESEARCH"
      : "DEFER_ALTERNATIVE_SELECTION_BLOCKED";
  }
  if (receipt.contract === "salt-ai-opportunity-need-decision/1") {
    const shortlistIds = receipt.shortlist.map((entry) => entry.alternative_id);
    invariant(
      isSortedUnique(shortlistIds),
      "Need receipt shortlist is not sorted and unique",
    );
    invariant(
      isSortedUnique(receipt.problem_categories.map((entry) => entry.category)),
      "Need receipt problem categories are not sorted and unique",
    );
    const workflowCount =
      receipt.other_current_workflow_use_count +
      receipt.shortlist.reduce(
        (total, entry) => total + entry.current_workflow_use_count,
        0,
      );
    invariant(
      workflowCount === receipt.valid_cohort_count,
      "Need receipt current-workflow counts do not match its valid cohort",
    );
    invariant(
      receipt.recurring_problem_count <= receipt.valid_cohort_count,
      "Need receipt recurring-problem count exceeds its valid cohort",
    );
    for (const category of receipt.problem_categories)
      invariant(
        category.team_count <= category.participant_count &&
          category.participant_count <= receipt.valid_cohort_count,
        "Need receipt problem-category counts are inconsistent",
      );
    const expectedGates = {
      viable_comparator_shortlist: receipt.shortlist.length >= 3,
      minimum_valid_cohort: receipt.valid_cohort_count >= 4,
      recurring_problem_rate_at_least_80_percent:
        receipt.valid_cohort_count > 0 &&
        receipt.recurring_problem_count * 5 >= receipt.valid_cohort_count * 4,
      repeated_category_across_two_teams: receipt.problem_categories.some(
        (entry) => entry.participant_count >= 2 && entry.team_count >= 2,
      ),
    };
    invariant(
      stableGates(receipt.gates) === stableGates(expectedGates),
      "Need receipt gates do not match its aggregate counts",
    );
    if (!expectedGates.viable_comparator_shortlist)
      return "DEFER_ALTERNATIVE_SELECTION_BLOCKED";
    if (!expectedGates.minimum_valid_cohort) {
      invariant(
        receipt.boundary_exhausted,
        "Insufficient cohort cannot be decided before its boundary is exhausted",
      );
      return "DEFER_INSUFFICIENT_COHORT";
    }
    return Object.values(expectedGates).every(Boolean)
      ? "PASS_NEED"
      : "CUT_NEED";
  }
  throw new Error("Unsupported opportunity decision contract");
}

function stableGates(gates) {
  return JSON.stringify(
    Object.fromEntries(
      Object.entries(gates).toSorted(([left], [right]) =>
        left.localeCompare(right),
      ),
    ),
  );
}

function isSortedUnique(values) {
  const sorted = [...new Set(values)].toSorted((left, right) =>
    left.localeCompare(right),
  );
  return (
    values.length === sorted.length &&
    values.every((value, index) => value === sorted[index])
  );
}
