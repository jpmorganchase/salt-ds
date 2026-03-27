import type { SuggestedFollowUp } from "../consumerPresentation.js";
import {
  describeProjectConventionsChecks,
  type GuidanceBoundary,
} from "../guidanceBoundary.js";
import { unique } from "../utils.js";
import type {
  ImplementationPhase,
  ImplementationWorkItem,
  ImplementationWorkstream,
  ManualReviewWorkItem,
  MigrateToSaltInput,
  MigrateToSaltResult,
  MigrationCheckpoint,
  MigrationFamiliarityContract,
  SaltSolutionType,
  SourceUiModel,
  SourceUiRegion,
  StarterCodeSnippet,
  TranslateImplementationPlan,
  TranslationRecord,
} from "./sourceUiTypes.js";

function toImplementationWorkItem(
  translation: TranslationRecord,
): ImplementationWorkItem {
  return {
    source_model_ref: translation.source_model_ref,
    source_kind: translation.source_kind,
    source_label: translation.label,
    page_region_refs: translation.page_region_refs,
    grouping_refs: translation.grouping_refs,
    target_name: translation.salt_target.name,
    solution_type: translation.salt_target.solution_type,
    confidence: translation.confidence,
    confidence_detail: translation.confidence_detail,
    why: translation.salt_target.why,
    next_action: translation.implementation.next_action,
    docs: translation.salt_target.docs,
  };
}

function buildWorkstreams(
  translations: TranslationRecord[],
  sourceModel: SourceUiModel,
): ImplementationWorkstream[] {
  const workstreams: ImplementationWorkstream[] = [];

  for (const grouping of sourceModel.groupings) {
    const matchingTranslations = translations.filter((translation) =>
      translation.grouping_refs?.includes(grouping.id),
    );
    if (matchingTranslations.length === 0) {
      continue;
    }

    workstreams.push({
      label: grouping.label,
      region_refs: grouping.region_refs,
      translation_refs: matchingTranslations.map(
        (translation) => translation.source_model_ref,
      ),
      focus: grouping.reason,
      actions: matchingTranslations.map(
        (translation) => translation.implementation.next_action,
      ),
    });
  }

  for (const region of sourceModel.page_regions) {
    const matchingTranslations = translations.filter((translation) =>
      translation.page_region_refs?.includes(region.id),
    );
    if (
      matchingTranslations.length === 0 ||
      workstreams.some((workstream) =>
        workstream.region_refs.includes(region.id),
      )
    ) {
      continue;
    }

    workstreams.push({
      label: region.label,
      region_refs: [region.id],
      translation_refs: matchingTranslations.map(
        (translation) => translation.source_model_ref,
      ),
      focus: `Translate the ${region.label.toLowerCase()} as one coherent region.`,
      actions: matchingTranslations.map(
        (translation) => translation.implementation.next_action,
      ),
    });
  }

  return workstreams;
}

function getRegionWrapper(region: SourceUiRegion): {
  open: string[];
  close: string[];
} {
  switch (region.kind) {
    case "header":
      return {
        open: [`<header aria-label="${region.label}">`],
        close: ["</header>"],
      };
    case "sidebar":
      return {
        open: [`<aside aria-label="${region.label}">`],
        close: ["</aside>"],
      };
    case "content":
      return {
        open: ["<main>", `  {/* ${region.label} */}`],
        close: ["</main>"],
      };
    case "footer":
      return {
        open: [`<footer aria-label="${region.label}">`],
        close: ["</footer>"],
      };
    default:
      return {
        open: [`<section aria-label="${region.label}">`],
        close: ["</section>"],
      };
  }
}

function buildLeafScaffold(translation: TranslationRecord): {
  imports: Array<{ packageName: string; exportName: string }>;
  lines: string[];
} {
  const targetName = translation.salt_target.name ?? translation.label;

  if (targetName === "Link") {
    return {
      imports: [{ packageName: "@salt-ds/core", exportName: "Link" }],
      lines: [`<Link href="/next">${translation.label}</Link>`],
    };
  }

  if (targetName === "Button") {
    return {
      imports: [{ packageName: "@salt-ds/core", exportName: "Button" }],
      lines: [`<Button appearance="solid">${translation.label}</Button>`],
    };
  }

  if (targetName === "Input") {
    return {
      imports: [{ packageName: "@salt-ds/core", exportName: "Input" }],
      lines: [`<Input aria-label="${translation.label}" />`],
    };
  }

  if (/(Checkbox|Radio|Switch)/.test(targetName)) {
    return {
      imports: [{ packageName: "@salt-ds/core", exportName: targetName }],
      lines: [`<${targetName} aria-label="${translation.label}" />`],
    };
  }

  return {
    imports: [],
    lines: [
      "<div>",
      `  {/* Build ${targetName} here. */}`,
      `  {/* ${translation.implementation.next_action} */}`,
      ...(translation.confidence_detail.next_question
        ? [
            `  {/* Resolve first: ${translation.confidence_detail.next_question} */}`,
          ]
        : []),
      "</div>",
    ],
  };
}

function buildCombinedScaffold(
  translations: TranslationRecord[],
  sourceModel: SourceUiModel,
  plan: TranslateImplementationPlan,
): StarterCodeSnippet[] | undefined {
  if (translations.length === 0) {
    return undefined;
  }

  const imports = new Map<string, Set<string>>();
  const body: string[] = [];
  const usedTranslations = new Set<string>();
  const regionById = new Map(
    sourceModel.page_regions.map((region) => [region.id, region]),
  );

  const addImport = (packageName: string, exportName: string) => {
    const current = imports.get(packageName);
    if (current) {
      current.add(exportName);
      return;
    }
    imports.set(packageName, new Set([exportName]));
  };

  const addLines = (lines: string[], indent = "    ") => {
    for (const line of lines) {
      body.push(`${indent}${line}`);
    }
  };

  for (const workstream of plan.workstreams) {
    const firstRegion = workstream.region_refs
      .map((ref) => regionById.get(ref))
      .find(Boolean);
    const wrapper = firstRegion
      ? getRegionWrapper(firstRegion)
      : {
          open: [`<section aria-label="${workstream.label}">`],
          close: ["</section>"],
        };
    addLines(wrapper.open);
    addLines([`{/* ${workstream.focus} */}`]);

    for (const translationRef of workstream.translation_refs) {
      const translation = translations.find(
        (entry) => entry.source_model_ref === translationRef,
      );
      if (!translation) {
        continue;
      }

      usedTranslations.add(translation.source_model_ref);
      const scaffold = buildLeafScaffold(translation);
      for (const item of scaffold.imports) {
        addImport(item.packageName, item.exportName);
      }
      addLines(scaffold.lines, "      ");
    }

    addLines(wrapper.close);
  }

  const remaining = translations.filter(
    (translation) => !usedTranslations.has(translation.source_model_ref),
  );
  if (remaining.length > 0) {
    addLines(['<section aria-label="Other translated targets">']);
    for (const translation of remaining) {
      const scaffold = buildLeafScaffold(translation);
      for (const item of scaffold.imports) {
        addImport(item.packageName, item.exportName);
      }
      addLines(scaffold.lines, "      ");
    }
    addLines(["</section>"]);
  }

  const importLines = [...imports.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([packageName, exports]) => {
      const names = [...exports].sort((left, right) =>
        left.localeCompare(right),
      );
      return `import { ${names.join(", ")} } from "${packageName}";`;
    });

  const code = [
    ...importLines,
    ...(importLines.length > 0 ? [""] : []),
    "export function TranslatedSaltScaffold() {",
    "  return (",
    "    <>",
    ...body,
    "    </>",
    "  );",
    "}",
  ].join("\n");

  return [
    {
      label: "Translated Salt scaffold",
      language: "tsx",
      code,
      notes: [
        "Built from the translated workstreams and page regions. Replace placeholder sections with the linked starter snippets or canonical examples.",
        ...(plan.scaffold_handoff
          ? [
              `Start with: ${plan.scaffold_handoff.start_with.join(" | ")}`,
              `Build around: ${plan.scaffold_handoff.build_around.join(", ") || "the translated workstreams"}`,
              plan.scaffold_handoff.validate_after_scaffold,
            ]
          : []),
      ],
    },
  ];
}

export function buildFamiliarityContract(
  sourceProfile: MigrateToSaltResult["source_profile"],
  sourceModel: SourceUiModel,
  translations: TranslationRecord[],
): MigrationFamiliarityContract {
  const preserve = new Set<string>([
    "Preserve the core task flow and information hierarchy users rely on today.",
  ]);
  const allowSaltChanges = new Set<string>([
    "Allow Salt-native changes in spacing, typography, component styling, and visual emphasis.",
  ]);
  const requiresConfirmation = new Set<string>([
    "Reordered primary and secondary tasks or actions.",
    "Merged, split, or removed steps in the current flow.",
  ]);

  if (
    sourceModel.ui_regions.some(
      (region) =>
        region.role === "action" ||
        region.role === "navigation" ||
        region.kind === "split-action",
    )
  ) {
    preserve.add(
      "Preserve the primary action hierarchy, destination cues, and supporting action order.",
    );
  }

  if (
    sourceModel.page_regions.some((region) =>
      ["header", "sidebar", "content", "footer"].includes(region.kind),
    ) ||
    sourceModel.ui_regions.some((region) => region.scope === "app-structure")
  ) {
    preserve.add(
      "Preserve the important navigation landmarks and shell orientation even if the visual composition becomes more Salt-native.",
    );
    allowSaltChanges.add(
      "Allow Salt-native recomposition of shells, toolbars, dialogs, and grouped regions when the underlying task flow stays intact.",
    );
    requiresConfirmation.add(
      "A different shell structure, navigation model, or page-region hierarchy.",
    );
  }

  if (sourceModel.states.length > 0) {
    preserve.add(
      "Preserve the critical loading, empty, error, and validation states that users need to complete the task confidently.",
    );
    requiresConfirmation.add(
      "Hidden, delayed, or removed state visibility for loading, empty, error, or validation feedback.",
    );
  }

  if (sourceModel.groupings.length > 0) {
    preserve.add(
      "Preserve the grouped interaction anchors that keep related fields, commands, or overlays understandable as one flow.",
    );
  }

  if (
    sourceProfile.ui_flavor === "external-ui" ||
    sourceProfile.ui_flavor === "generic-react" ||
    sourceProfile.ui_flavor === "mixed"
  ) {
    allowSaltChanges.add(
      "Replace ad hoc structure and foreign visual language with canonical Salt composition where the underlying task intent is preserved.",
    );
  }

  if (
    translations.some(
      (translation) =>
        translation.delta_category === "workflow-change-requires-confirmation",
    )
  ) {
    requiresConfirmation.add(
      "Any migration area already flagged as requiring workflow confirmation before implementation is locked.",
    );
  }

  return {
    preserve: [...preserve],
    allow_salt_changes: [...allowSaltChanges],
    requires_confirmation: [...requiresConfirmation],
  };
}

export function buildMigrationCheckpoints(
  sourceModel: SourceUiModel,
  translations: TranslationRecord[],
): MigrationCheckpoint[] {
  const beforeChecks = new Set<string>([
    "Capture the current task flow before rewriting structure or styling.",
    "Note the minimum information hierarchy that users need to orient themselves.",
  ]);
  const afterChecks = new Set<string>([
    "Confirm the migrated Salt result still supports the same user task flow.",
    "Run review_salt_ui on the migrated Salt code after the first implementation pass.",
  ]);

  if (
    sourceModel.ui_regions.some(
      (region) =>
        region.role === "action" ||
        region.role === "navigation" ||
        region.kind === "split-action",
    )
  ) {
    beforeChecks.add(
      "Capture the current action order, destination cues, and any secondary actions users expect to find together.",
    );
    afterChecks.add(
      "Confirm the Salt result still presents the primary and secondary actions in an understandable order.",
    );
  }

  if (
    sourceModel.page_regions.some((region) =>
      ["header", "sidebar", "content", "footer"].includes(region.kind),
    )
  ) {
    beforeChecks.add(
      "Capture the current landmarks and page regions so the migration keeps the important navigation anchors recognizable.",
    );
    afterChecks.add(
      "Confirm the final Salt shell still exposes the expected landmarks and regional hierarchy.",
    );
  }

  if (sourceModel.states.length > 0) {
    beforeChecks.add(
      "Capture which loading, empty, error, and validation states are visible in the current experience.",
    );
    afterChecks.add(
      "Confirm those key states are still visible or intentionally redesigned with explicit sign-off.",
    );
  }

  if (
    translations.some(
      (translation) =>
        translation.delta_category === "workflow-change-requires-confirmation",
    )
  ) {
    beforeChecks.add(
      "Resolve any workflow-change confirmation points before the first Salt scaffold is treated as final.",
    );
    afterChecks.add(
      "Re-check any previously flagged workflow changes with the user or team before rollout.",
    );
  }

  afterChecks.add(
    "Use runtime evidence when needed to compare the migrated result against the important experience anchors captured before migration.",
  );

  return [
    {
      phase: "before",
      title: "Before migration",
      checks: [...beforeChecks],
    },
    {
      phase: "after",
      title: "After migration",
      checks: [...afterChecks],
    },
  ];
}

export function buildImplementationPlan(
  translations: TranslationRecord[],
  sourceModel: SourceUiModel,
  codeProvided: boolean,
): TranslateImplementationPlan {
  const directSwaps = translations
    .filter((translation) => translation.migration_kind === "direct")
    .map(toImplementationWorkItem);
  const patternRewrites = translations
    .filter((translation) => translation.migration_kind === "pattern")
    .map(toImplementationWorkItem);
  const foundationMappings = translations
    .filter((translation) => translation.migration_kind === "foundation")
    .map(toImplementationWorkItem);
  const manualReviews = translations
    .filter((translation) => translation.migration_kind === "manual-review")
    .map(
      (translation): ManualReviewWorkItem => ({
        ...toImplementationWorkItem(translation),
        reason: translation.salt_target.why || "Needs a manual Salt review.",
      }),
    );
  const workstreams = buildWorkstreams(translations, sourceModel);

  const phases: ImplementationPhase[] = [];

  if (translations.length > 0) {
    phases.push({
      title: "Lock the translation map",
      focus:
        sourceModel.summary.translation_mode === "map-from-description"
          ? "Confirm the inferred UI regions before coding details."
          : "Confirm each detected source region has the right Salt target before refactoring.",
      actions: [
        `Confirm the translated regions: ${translations
          .map(
            (translation) =>
              `${translation.label} -> ${translation.salt_target.name ?? "manual review"}`,
          )
          .join("; ")}.`,
        ...(sourceModel.summary.translation_mode === "map-from-description"
          ? [
              "Recheck the inferred structure against the description, mockup, or screenshot before coding lower-level details.",
            ]
          : []),
      ],
    });
  }

  if (workstreams.length > 0) {
    phases.push({
      title: "Translate the grouped regions",
      focus:
        "Implement the highest-value grouped flows or page regions before polishing individual controls.",
      actions: workstreams.flatMap((workstream) => workstream.actions),
    });
  }

  if (directSwaps.length > 0) {
    phases.push({
      title: "Implement the direct swaps",
      focus: "Replace the clearest primitive-level pieces first.",
      actions: directSwaps.map((item) => item.next_action),
    });
  }

  if (patternRewrites.length > 0 || foundationMappings.length > 0) {
    phases.push({
      title: "Rebuild the structured flows",
      focus:
        "Handle multi-part Salt patterns and supporting foundations after the easy swaps are in place.",
      actions: [
        ...patternRewrites.map((item) => item.next_action),
        ...foundationMappings.map((item) => item.next_action),
      ],
    });
  }

  if (manualReviews.length > 0) {
    phases.push({
      title: "Resolve the open redesign points",
      focus:
        "Lower-confidence or no-direct-match areas need a final Salt decision before implementation is locked.",
      actions: manualReviews.map(
        (item) =>
          `${item.source_label}: ${item.reason}${item.confidence_detail.next_question ? ` Question: ${item.confidence_detail.next_question}` : ""}`,
      ),
    });
  }

  phases.push({
    title: "Validate the migrated Salt UI",
    focus:
      "Use canonical Salt guidance and code analysis once the first translation pass exists.",
    actions: [
      "Check the highest-risk targets with get_salt_entity or get_salt_examples before final polish.",
      codeProvided
        ? "Run review_salt_ui on the migrated code after the first Salt translation pass."
        : "Run review_salt_ui on the first Salt implementation pass after scaffolding the translated UI.",
    ],
  });

  const validationSequence = unique([
    ...translations.map(
      (translation) => translation.implementation.validation_step,
    ),
    codeProvided
      ? "Run review_salt_ui after the first migration pass."
      : "Run review_salt_ui after the first implementation pass.",
  ]);

  const starterCodeTargets = translations
    .filter(
      (translation) =>
        translation.implementation.starter_code_available &&
        translation.salt_target.name &&
        translation.salt_target.solution_type,
    )
    .slice(0, 2)
    .map((translation) => ({
      source_kind: translation.source_kind,
      source_label: translation.label,
      target_name: translation.salt_target.name as string,
      solution_type: translation.salt_target.solution_type as Exclude<
        SaltSolutionType,
        "auto" | "token"
      >,
    }));

  return {
    direct_swaps: directSwaps,
    pattern_rewrites: patternRewrites,
    foundation_mappings: foundationMappings,
    manual_reviews: manualReviews,
    workstreams,
    phases,
    validation_sequence: validationSequence,
    starter_code_targets:
      starterCodeTargets.length > 0 ? starterCodeTargets : undefined,
    scaffold_handoff:
      translations.length > 0
        ? {
            start_with: [
              ...directSwaps.slice(0, 2).map((item) => item.next_action),
              ...patternRewrites.slice(0, 1).map((item) => item.next_action),
            ].slice(0, 3),
            build_around: workstreams
              .slice(0, 2)
              .map((workstream) => workstream.label),
            validate_after_scaffold: codeProvided
              ? "Run review_salt_ui after the first translated scaffold is in place."
              : "Run review_salt_ui after the first Salt scaffold is in place.",
          }
        : undefined,
  };
}

export function buildAssumptions(
  sourceProfile: MigrateToSaltResult["source_profile"],
  sourceModel: SourceUiModel,
): string[] | undefined {
  const assumptions: string[] = [];

  if (!sourceProfile.code_provided && sourceProfile.query_provided) {
    assumptions.push(
      "The source UI model is inferred from the description or mockup language rather than executable code.",
    );
  }

  if (
    sourceProfile.code_provided &&
    sourceProfile.ui_flavor === "generic-react"
  ) {
    assumptions.push(
      "The source appears to be generic React or native HTML, so component intent is inferred from names, props, and structure rather than a known library contract.",
    );
  }

  if (sourceProfile.ui_flavor === "mixed") {
    assumptions.push(
      "The source already mixes Salt and non-Salt UI. Keep the existing Salt pieces where they already fit and translate only the remaining external regions.",
    );
  }

  if (
    sourceModel.summary.translation_mode === "map-from-description" &&
    sourceModel.summary.structured_flows > 0
  ) {
    assumptions.push(
      "Pattern-level flows were inferred from the description. Confirm interaction details before finalizing hierarchy and states.",
    );
  }

  if (sourceModel.summary.signal_sources.length === 2) {
    assumptions.push(
      "Some translated regions were inferred from both direct code evidence and the request language. Resolve any conflicts in favor of the actual UI requirement.",
    );
  }

  if (sourceModel.states.length > 0 && !sourceProfile.code_provided) {
    assumptions.push(
      "State handling was inferred from the request language. Confirm whether loading, empty, error, and validation states are all required in the first pass.",
    );
  }

  return assumptions.length > 0 ? assumptions : undefined;
}

export function buildClarifyingQuestions(input: {
  sourceProfile: MigrateToSaltResult["source_profile"];
  sourceModel: SourceUiModel;
  translations: TranslationRecord[];
}): string[] | undefined {
  const questions = unique([
    ...input.translations
      .filter(
        (translation) =>
          (translation.confidence_detail.level === "low" ||
            translation.migration_kind === "manual-review") &&
          translation.confidence_detail.next_question,
      )
      .map(
        (translation) => translation.confidence_detail.next_question as string,
      ),
    ...(input.sourceProfile.ui_flavor === "external-ui" ||
    input.sourceProfile.ui_flavor === "generic-react" ||
    input.sourceProfile.ui_flavor === "mixed"
      ? [
          "What must remain familiar for existing users: task order, action hierarchy, landmarks, or state visibility?",
        ]
      : []),
    ...(input.sourceModel.states.length > 0
      ? [
          "Which loading, empty, error, or validation states are critical in the first migration pass?",
        ]
      : []),
    ...(input.translations.some(
      (translation) => translation.delta_category === "salt-recomposition",
    )
      ? [
          "Can Salt-native recomposition change the layout, or should the migrated result stay closer to the current structure?",
        ]
      : []),
  ]);

  return questions.length > 0 ? questions.slice(0, 4) : undefined;
}

export function buildDecisionGates(
  translations: TranslationRecord[],
): MigrateToSaltResult["decision_gates"] {
  const gates = translations
    .filter(
      (translation) =>
        translation.migration_kind === "manual-review" &&
        translation.confidence_detail.next_question,
    )
    .map((translation, index) => ({
      id: `decision-gate-${index + 1}`,
      source_model_ref: translation.source_model_ref,
      source_kind: translation.source_kind,
      question: translation.confidence_detail.next_question as string,
      reason:
        translation.confidence_detail.reasons[0] ?? translation.salt_target.why,
      suggested_workflow:
        translation.source_scope === "control"
          ? ("get_salt_entity" as const)
          : ("create_salt_ui" as const),
    }));

  return gates.length > 0 ? gates : undefined;
}

export function buildStarterCodeOutput(
  translations: TranslationRecord[],
): StarterCodeSnippet[] | undefined {
  const seen = new Set<string>();
  const snippets: StarterCodeSnippet[] = [];

  for (const translation of translations) {
    for (const snippet of translation.salt_target.starter_code ?? []) {
      const key = `${snippet.label}::${snippet.code}`;
      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
      snippets.push(snippet);

      if (snippets.length >= 4) {
        return snippets;
      }
    }
  }

  return snippets.length > 0 ? snippets : undefined;
}

export function buildCombinedScaffoldOutput(
  translations: TranslationRecord[],
  sourceModel: SourceUiModel,
  plan: TranslateImplementationPlan,
): StarterCodeSnippet[] | undefined {
  return buildCombinedScaffold(translations, sourceModel, plan);
}

export function buildMigrationPlan(
  plan: TranslateImplementationPlan,
  codeProvided: boolean,
): string[] {
  const steps: string[] = [];

  if (plan.direct_swaps.length > 0) {
    steps.push(
      `Replace the clearest primitive-level pieces first: ${plan.direct_swaps
        .map(
          (item) =>
            `${item.source_kind} -> ${item.target_name ?? "Salt target"}`,
        )
        .join(", ")}.`,
    );
  }

  if (plan.pattern_rewrites.length > 0) {
    steps.push(
      `Rebuild the multi-part flows around Salt patterns or higher-level structures: ${plan.pattern_rewrites
        .map(
          (item) =>
            `${item.source_kind} -> ${item.target_name ?? "pattern review"}`,
        )
        .join(", ")}.`,
    );
  }

  if (plan.manual_reviews.length > 0) {
    steps.push(
      `Review the lower-confidence or no-direct-match areas before coding: ${plan.manual_reviews
        .map((item) => String(item.source_kind))
        .join(", ")}.`,
    );
  }

  steps.push(
    codeProvided
      ? "After the first translation pass, run review_salt_ui on the migrated Salt code to validate primitives, composition, and tokens."
      : "After choosing the Salt structure, validate the target components or patterns with canonical examples before implementation.",
  );

  return steps;
}

export function buildSuggestedFollowUps(
  translations: TranslationRecord[],
  input: MigrateToSaltInput,
  guidanceBoundary?: GuidanceBoundary,
): SuggestedFollowUp[] | undefined {
  const first = translations[0];
  const manualReview = translations.find(
    (translation) => translation.migration_kind === "manual-review",
  );
  const solutionType = first?.salt_target.solution_type ?? null;
  const targetName = first?.salt_target.name ?? null;
  const projectConventionSuffix = guidanceBoundary?.project_conventions
    .check_recommended
    ? (() => {
        const checks = describeProjectConventionsChecks(
          guidanceBoundary.project_conventions.topics,
        );
        return checks
          ? ` Check the repo's project conventions for ${checks} before final implementation.`
          : " Check any relevant project conventions before final implementation.";
      })()
    : "";

  const followUps: SuggestedFollowUp[] = [];

  if (
    targetName &&
    (solutionType === "component" || solutionType === "pattern")
  ) {
    followUps.push({
      workflow: "get_salt_examples",
      reason: `Review canonical ${targetName} examples before implementing the translated Salt structure.${projectConventionSuffix}`,
      args: {
        target_type: solutionType,
        target_name: targetName,
        max_results: 5,
      },
    });
    followUps.push({
      workflow: "get_salt_entity",
      reason: `Inspect ${targetName} in full detail before finalizing the translation.${projectConventionSuffix}`,
      args: {
        entity_type: solutionType,
        name: targetName,
        view: "full",
      },
    });
  }

  if (input.include_starter_code === false && first) {
    followUps.push({
      workflow: "migrate_to_salt",
      reason: `Rerun the translation with starter code enabled so the builder can scaffold the highest-confidence Salt targets directly.${projectConventionSuffix}`,
      args: {
        ...(input.code ? { code: input.code } : {}),
        ...(input.query ? { query: input.query } : {}),
        ...(input.source_outline
          ? { source_outline: input.source_outline }
          : {}),
        ...(input.package ? { package: input.package } : {}),
        include_starter_code: true,
        view: "full",
      },
    });
  }

  if (manualReview) {
    followUps.push({
      workflow: "create_salt_ui",
      reason: `Resolve the lower-confidence ${manualReview.label.toLowerCase()} translation before implementation.${projectConventionSuffix}`,
      args: {
        query: manualReview.label,
        solution_type:
          manualReview.source_scope === "control" ? "component" : "pattern",
        ...(input.package ? { package: input.package } : {}),
        ...(input.prefer_stable ? { prefer_stable: input.prefer_stable } : {}),
        view: "full",
      },
    });
  }

  return followUps.length > 0 ? followUps : undefined;
}
