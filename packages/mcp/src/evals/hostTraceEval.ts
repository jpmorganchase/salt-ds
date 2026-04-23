export type HostTraceCriticalFailureCode =
  | "broadened_success_without_composite_recipe"
  | "implement_without_source_backed_evidence"
  | "missing_dependency_action"
  | "ask_user_ignored"
  | "generic_example_used_as_canonical_evidence"
  | "review_post_action_skipped";

export interface HostTraceCriticalFailure {
  code: HostTraceCriticalFailureCode;
  message: string;
  tool_id?: string;
}

export interface HostTraceToolCall {
  index: number;
  tool_id: string;
  input_text: string;
  output_text: string;
  output_values?: string[];
}

export interface HostTraceWorkflowContract {
  tool_call_index: number;
  tool_id: string;
  contract: Record<string, unknown>;
}

export interface HostTraceEvalReport {
  passed: boolean;
  critical_failures: HostTraceCriticalFailure[];
  observations: string[];
  tool_calls: HostTraceToolCall[];
  workflow_contracts: HostTraceWorkflowContract[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readString(
  record: Record<string, unknown>,
  key: string,
): string | null {
  const value = record[key];
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function readStringArray(
  record: Record<string, unknown>,
  key: string,
): string[] {
  const value = record[key];
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === "string")
    : [];
}

function safeJsonParse(value: string): unknown | null {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function stringifyUnknown(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }
  try {
    return JSON.stringify(value);
  } catch {
    return "";
  }
}

function readToolCallText(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(readToolCallText).filter(Boolean).join("\n");
  }
  if (!isRecord(value)) {
    return "";
  }

  return [
    readString(value, "value"),
    readString(value, "text"),
    readString(value, "input"),
    readString(value, "command"),
    readString(value, "cmd"),
    stringifyUnknown(value.rawInput),
  ]
    .filter(Boolean)
    .join("\n");
}

function collectToolCalls(raw: unknown): HostTraceToolCall[] {
  const calls: HostTraceToolCall[] = [];

  const readOutputValues = (output: unknown): string[] => {
    if (Array.isArray(output)) {
      return output.map(readToolCallText).filter(Boolean);
    }
    const text = readToolCallText(output);
    return text ? [text] : [];
  };

  const visit = (value: unknown) => {
    if (Array.isArray(value)) {
      for (const entry of value) {
        visit(entry);
      }
      return;
    }

    if (!isRecord(value)) {
      return;
    }

    const toolId = readString(value, "toolId");
    if (toolId) {
      const details = isRecord(value.resultDetails)
        ? value.resultDetails
        : {};
      const outputValues = readOutputValues(details.output ?? value.output);
      calls.push({
        index: calls.length,
        tool_id: toolId,
        input_text: readToolCallText(details.input ?? value.rawInput),
        output_text: outputValues.join("\n"),
        output_values: outputValues,
      });
    }

    for (const entry of Object.values(value)) {
      visit(entry);
    }
  };

  visit(raw);
  return calls;
}

function collectParsedOutputs(toolCall: HostTraceToolCall): unknown[] {
  return (toolCall.output_values ?? [toolCall.output_text])
    .flatMap((chunk) => {
      const parsed = safeJsonParse(chunk.trim());
      return parsed ? [parsed] : [];
    });
}

function collectWorkflowContractsFromValue(
  value: unknown,
  toolCall: HostTraceToolCall,
): HostTraceWorkflowContract[] {
  const contracts: HostTraceWorkflowContract[] = [];
  const isWorkflowContractId = (contract: unknown) =>
    contract === "salt_workflow_v1" || contract === "salt_workflow_v3";

  const visit = (entry: unknown) => {
    if (Array.isArray(entry)) {
      for (const item of entry) {
        visit(item);
      }
      return;
    }

    if (!isRecord(entry)) {
      return;
    }

    // Old captured host traces may contain pre-reset contract labels. Keep
    // them scorable as regression evidence without exposing v3 as public API.
    if (isWorkflowContractId(entry.contract)) {
      contracts.push({
        tool_call_index: toolCall.index,
        tool_id: toolCall.tool_id,
        contract: entry,
      });
    }

    for (const child of Object.values(entry)) {
      visit(child);
    }
  };

  visit(value);
  return contracts;
}

function collectWorkflowContracts(
  toolCalls: HostTraceToolCall[],
): HostTraceWorkflowContract[] {
  return toolCalls.flatMap((toolCall) =>
    collectParsedOutputs(toolCall).flatMap((parsed) =>
      collectWorkflowContractsFromValue(parsed, toolCall),
    ),
  );
}

function collectStrings(value: unknown, strings: string[] = []): string[] {
  if (typeof value === "string") {
    strings.push(value);
    return strings;
  }
  if (Array.isArray(value)) {
    for (const entry of value) {
      collectStrings(entry, strings);
    }
    return strings;
  }
  if (isRecord(value)) {
    for (const entry of Object.values(value)) {
      collectStrings(entry, strings);
    }
  }
  return strings;
}

function getRecord(value: unknown, key: string): Record<string, unknown> | null {
  const entry = isRecord(value) ? value[key] : null;
  return isRecord(entry) ? entry : null;
}

function hasCompositeProfileTabsAvatar(raw: unknown): boolean {
  const text = collectStrings(raw).join("\n").toLowerCase();
  return (
    /\bprofile\b/.test(text) && /\btabs?\b/.test(text) && /\bavatar\b/.test(text)
  );
}

function hasRecipeEntity(contract: Record<string, unknown>, entity: string) {
  const recipe = getRecord(contract, "recipe");
  const steps = Array.isArray(recipe?.steps) ? recipe.steps : [];
  return steps.some((step) =>
    stringifyUnknown(step).toLowerCase().includes(entity.toLowerCase()),
  );
}

function hasSourceBackedEvidence(contract: Record<string, unknown>): boolean {
  const evidence = getRecord(contract, "evidence");
  const sourceUrls = Array.isArray(evidence?.source_urls)
    ? evidence.source_urls
    : [];
  const items = Array.isArray(evidence?.items) ? evidence.items : [];
  const hasSourceUrls =
    sourceUrls.some((entry) => typeof entry === "string" && entry.length > 0) ||
    items.some(
      (item) =>
        isRecord(item) &&
        Array.isArray(item.source_urls) &&
        item.source_urls.some(
          (entry) => typeof entry === "string" && entry.length > 0,
        ),
    );
  const hasSourceKind = items.some(
    (item) =>
      isRecord(item) &&
      (item.kind === "docs" ||
        item.kind === "registry" ||
        item.kind === "examples" ||
        item.kind === "project_policy"),
  );

  return hasSourceUrls && hasSourceKind;
}

function collectEvidenceSourceUrls(contract: Record<string, unknown>): string[] {
  const evidence = getRecord(contract, "evidence");
  if (!evidence) {
    return [];
  }

  return [
    ...readStringArray(evidence, "source_urls"),
    ...(Array.isArray(evidence.items)
      ? evidence.items
          .filter(isRecord)
          .flatMap((item) => readStringArray(item, "source_urls"))
      : []),
  ];
}

function isCanonicalSaltSourceUrl(value: string): boolean {
  return (
    value.startsWith("/salt/") ||
    /(?:^|[./-])salt-ds(?:[./-]|$)/i.test(value) ||
    /saltdesignsystem\.com/i.test(value)
  );
}

function isGenericExampleSourceUrl(value: string): boolean {
  return (
    /^https?:\/\//i.test(value) &&
    !isCanonicalSaltSourceUrl(value) &&
    /(react\.dev|developer\.mozilla|mui\.com|bootstrap|tailwind|codepen|codesandbox|stackblitz|example\.com)/i.test(
      value,
    )
  );
}

function usesGenericExamplesAsCanonicalEvidence(
  contract: Record<string, unknown>,
): boolean {
  const evidence = getRecord(contract, "evidence");
  const items = Array.isArray(evidence?.items) ? evidence.items : [];
  const hasExampleEvidence = items.some(
    (item) => isRecord(item) && item.kind === "examples",
  );
  const sourceUrls = collectEvidenceSourceUrls(contract);

  return (
    hasExampleEvidence &&
    sourceUrls.some(isGenericExampleSourceUrl) &&
    !sourceUrls.some(isCanonicalSaltSourceUrl)
  );
}

function contextShowsNoSaltPackages(toolCalls: HostTraceToolCall[]): boolean {
  return toolCalls.some((toolCall) =>
    collectParsedOutputs(toolCall).some((parsed) => {
      const result = getRecord(parsed, "result");
      const salt = getRecord(result, "salt");
      return Array.isArray(salt?.packages) && salt.packages.length === 0;
    }),
  );
}

function hasTerminalSaltInstall(toolCalls: HostTraceToolCall[]): boolean {
  return toolCalls.some(
    (toolCall) =>
      /terminal/i.test(toolCall.tool_id) &&
      /\bnpm\s+(?:install|i)\b[\s\S]*@salt-ds\//i.test(
        toolCall.input_text,
      ),
  );
}

function hasInstallDependencyContractBefore(
  contracts: HostTraceWorkflowContract[],
  toolCallIndex: number,
): boolean {
  return contracts.some((entry) => {
    if (entry.tool_call_index > toolCallIndex) {
      return false;
    }
    const action = getRecord(entry.contract, "action");
    return action?.kind === "install_dependencies";
  });
}

function isImplementationLikeToolCall(toolCall: HostTraceToolCall): boolean {
  return (
    /edit|write/i.test(toolCall.tool_id) ||
    (/terminal/i.test(toolCall.tool_id) &&
      /\b(npm|pnpm|yarn|bun|touch|cat|python|node|sed)\b/i.test(
        toolCall.input_text,
      ))
  );
}

function isReviewToolCall(toolCall: HostTraceToolCall): boolean {
  return (
    /review_salt_ui/i.test(toolCall.tool_id) ||
    /\bsalt-ds\s+review\b/i.test(toolCall.input_text)
  );
}

export function evaluateHostTrace(raw: unknown): HostTraceEvalReport {
  const toolCalls = collectToolCalls(raw);
  const workflowContracts = collectWorkflowContracts(toolCalls);
  const criticalFailures: HostTraceCriticalFailure[] = [];
  const observations: string[] = [];
  const isCompositeProfile = hasCompositeProfileTabsAvatar(raw);
  const noSaltPackages = contextShowsNoSaltPackages(toolCalls);

  if (isCompositeProfile) {
    observations.push(
      "Trace contains a composite profile request with tabs and avatar.",
    );
  }
  if (noSaltPackages) {
    observations.push("Project context reported no installed Salt packages.");
  }

  for (const entry of workflowContracts) {
    const { contract } = entry;
    const request = getRecord(contract, "request");
    const action = getRecord(contract, "action");

    if (
      contract.workflow === "create" &&
      contract.status === "success" &&
      request?.match_status === "broadened"
    ) {
      criticalFailures.push({
        code: "broadened_success_without_composite_recipe",
        tool_id: entry.tool_id,
        message:
          "A broadened create result was marked success; broadened or composite create work must return a recipe, retrieval step, dependency action, or clarification.",
      });
    }

    if (
      contract.workflow === "create" &&
      action?.kind === "implement" &&
      !hasSourceBackedEvidence(contract)
    ) {
      criticalFailures.push({
        code: "implement_without_source_backed_evidence",
        tool_id: entry.tool_id,
        message:
          "A create result allowed implementation without source-backed evidence fields and source URLs.",
      });
    }

    if (
      contract.workflow === "create" &&
      action?.kind === "implement" &&
      usesGenericExamplesAsCanonicalEvidence(contract)
    ) {
      criticalFailures.push({
        code: "generic_example_used_as_canonical_evidence",
        tool_id: entry.tool_id,
        message:
          "A create result used generic external examples as canonical Salt evidence for implementation.",
      });
    }

    if (
      isCompositeProfile &&
      contract.workflow === "create" &&
      action?.kind === "implement" &&
      !hasRecipeEntity(contract, "Avatar")
    ) {
      criticalFailures.push({
        code: "broadened_success_without_composite_recipe",
        tool_id: entry.tool_id,
        message:
          "A profile tabs/avatar request was treated as implementable without a composite recipe that grounds Avatar.",
      });
    }

    if (
      noSaltPackages &&
      contract.workflow === "create" &&
      action?.kind === "implement"
    ) {
      criticalFailures.push({
        code: "missing_dependency_action",
        tool_id: entry.tool_id,
        message:
          "Project context showed no Salt packages, but the create contract allowed implementation instead of an install_dependencies action.",
      });
    }

    if (contract.workflow === "create" && action?.kind === "implement") {
      const postAction = getRecord(action, "post_action");
      if (postAction?.kind === "review") {
        const firstEditAfterImplement = toolCalls.find(
          (toolCall) =>
            toolCall.index > entry.tool_call_index &&
            isImplementationLikeToolCall(toolCall),
        );
        const reviewAfterEdit =
          firstEditAfterImplement &&
          toolCalls.some(
            (toolCall) =>
              toolCall.index > firstEditAfterImplement.index &&
              isReviewToolCall(toolCall),
          );

        if (firstEditAfterImplement && !reviewAfterEdit) {
          criticalFailures.push({
            code: "review_post_action_skipped",
            tool_id: firstEditAfterImplement.tool_id,
            message:
              "The host edited after an implement contract with a review post-action but did not run the Salt review workflow afterward.",
          });
        }
      }
    }
  }

  const firstTerminalInstall = toolCalls.findIndex((toolCall) =>
    hasTerminalSaltInstall([toolCall]),
  );
  if (
    firstTerminalInstall >= 0 &&
    !hasInstallDependencyContractBefore(workflowContracts, firstTerminalInstall)
  ) {
    criticalFailures.push({
      code: "missing_dependency_action",
      tool_id: toolCalls[firstTerminalInstall]?.tool_id,
      message:
        "The host installed Salt packages without a prior install_dependencies contract action.",
    });
  }

  const askUserContract = workflowContracts.find((entry) => {
    const action = getRecord(entry.contract, "action");
    return action?.kind === "ask_user";
  });
  if (askUserContract) {
    const laterToolCall = toolCalls.find(
      (toolCall) =>
        toolCall.index > askUserContract.tool_call_index &&
        isImplementationLikeToolCall(toolCall),
    );
    if (laterToolCall) {
      criticalFailures.push({
        code: "ask_user_ignored",
        tool_id: laterToolCall.tool_id,
        message:
          "A workflow asked the user a blocking question, but the host continued with implementation-like work.",
      });
    }
  }

  return {
    passed: criticalFailures.length === 0,
    critical_failures: criticalFailures,
    observations,
    tool_calls: toolCalls,
    workflow_contracts: workflowContracts,
  };
}
