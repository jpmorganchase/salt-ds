import semver from "semver";
import {
  SALT_EVIDENCE_REF_CONTRACT,
  type SaltEvidenceClaimKind,
  type SaltEvidenceRef,
} from "../../evidence.js";
import type {
  AccessibilityRule,
  ComponentRecord,
  DeprecationRecord,
  GuideRecord,
  SaltRegistry,
} from "../../types.js";
import { normalizeVersion } from "../codeAnalysisCommon.js";
import { findGuideByIdentifier } from "../guideLookup.js";
import { unique } from "../utils.js";
import {
  CHOOSING_PRIMITIVE_GUIDE_LOOKUP,
  COMPOSITION_PITFALLS_GUIDE_LOOKUP,
  CUSTOM_WRAPPERS_GUIDE_LOOKUP,
} from "./issueCatalog.js";
import type { ValidationIssue, ValidationSeverity } from "./shared.js";

export interface ComponentAccessibilityRuleEvidence {
  component: ComponentRecord;
  rule: AccessibilityRule;
  field_path: string;
  source_urls: string[];
  evidence_ref: SaltEvidenceRef;
}

export interface ComponentUsageContrastEvidence {
  action_component: ComponentRecord;
  navigation_component: ComponentRecord;
  action_guidance: {
    text: string;
    field_path: string;
    evidence_ref: SaltEvidenceRef;
  };
  navigation_guidance: {
    text: string;
    field_path: string;
    evidence_ref: SaltEvidenceRef;
  };
  source_urls: string[];
}

export type PrimitiveRecreationIntent = "action" | "navigation";

export type PrimitiveRecreationSurface =
  | "native-button"
  | "native-link"
  | "custom-button-role"
  | "custom-link-role";

export interface ComponentPrimitiveRecreationEvidence {
  component: ComponentRecord;
  guide: GuideRecord;
  component_guidance: {
    text: string;
    field_path: string;
    evidence_ref: SaltEvidenceRef;
  };
  guide_guidance: {
    text: string;
    field_path: string;
    evidence_ref: SaltEvidenceRef;
  };
  source_urls: string[];
}

export interface ComponentTabularRecreationEvidence {
  components: Array<{
    component: ComponentRecord;
    guidance: {
      text: string;
      field_path: string;
      evidence_ref: SaltEvidenceRef;
    };
  }>;
  guide: GuideRecord;
  guide_guidance: {
    text: string;
    field_path: string;
    evidence_ref: SaltEvidenceRef;
  };
  source_urls: string[];
}

export interface ComponentNestedInteractiveEvidence {
  outer_component: ComponentRecord;
  inner_component: ComponentRecord;
  outer_guidance: {
    text: string;
    field_path: string;
    evidence_ref: SaltEvidenceRef;
  };
  inner_guidance: {
    text: string;
    field_path: string;
    evidence_ref: SaltEvidenceRef;
  };
  guide: GuideRecord;
  guide_guidance: {
    text: string;
    field_path: string;
    evidence_ref: SaltEvidenceRef;
  };
  source_urls: string[];
}

export interface ComponentPassThroughWrapperEvidence {
  component: ComponentRecord;
  component_ref: SaltEvidenceRef;
  wrapper_guide: GuideRecord;
  wrapper_guidance: {
    text: string;
    field_path: string;
    evidence_ref: SaltEvidenceRef;
  };
  supporting_guide?: GuideRecord;
  supporting_guide_guidance?: {
    text: string;
    field_path: string;
    evidence_ref: SaltEvidenceRef;
  };
  source_urls: string[];
}

export interface ValidationSummary {
  errors: number;
  warnings: number;
  infos: number;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

export function buildEvidence(summary: string, matches: number): string[] {
  return [`${summary} (${matches} match${matches === 1 ? "" : "es"}).`];
}

export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function deprecationSeverity(
  deprecation: DeprecationRecord,
  version: { normalized: string | null },
): ValidationSeverity {
  if (!version.normalized) {
    return "warning";
  }

  const removedIn = normalizeVersion(deprecation.removed_in);
  if (removedIn && semver.gte(version.normalized, removedIn)) {
    return "error";
  }

  return "warning";
}

export function componentDocUrls(
  registry: SaltRegistry,
  name: string,
  preferred: Array<"overview" | "usage" | "accessibility" | "examples">,
): string[] {
  const component = registry.components.find((item) => item.name === name);
  if (!component) {
    return [];
  }

  const urls = preferred
    .map((key) => component.related_docs[key])
    .filter((url): url is string => Boolean(url));

  return unique(urls);
}

export function buildComponentRegistryEvidenceRef(input: {
  registry: Pick<SaltRegistry, "version" | "generated_at">;
  component: ComponentRecord;
  claim_kind: SaltEvidenceClaimKind;
  field_path: string;
  id_suffix: string;
}): SaltEvidenceRef {
  const sourceUrl =
    input.component.related_docs.overview ?? input.component.related_docs.usage;
  const source =
    input.component.source.repo_path || sourceUrl
      ? {
          repo_path: input.component.source.repo_path,
          url: sourceUrl,
        }
      : null;

  return {
    contract: SALT_EVIDENCE_REF_CONTRACT,
    id: `${input.component.id}.${input.id_suffix}.validation-ref`,
    source_kind: "registry",
    claim_kind: input.claim_kind,
    registry: {
      entity_type: "component",
      entity_id: input.component.id,
      entity_name: input.component.name,
      field_path: input.field_path,
      registry_version: input.registry.version,
    },
    source,
    confidence: "high",
    verified_at: input.component.last_verified_at,
  };
}

export function buildDeprecationRegistryEvidenceRef(input: {
  registry: Pick<SaltRegistry, "version" | "generated_at">;
  deprecation: DeprecationRecord;
  claim_kind: SaltEvidenceClaimKind;
  field_path: string;
  id_suffix: string;
}): SaltEvidenceRef {
  const sourceUrl = input.deprecation.source_urls[0] ?? null;

  return {
    contract: SALT_EVIDENCE_REF_CONTRACT,
    id: `${input.deprecation.id}.${input.id_suffix}.validation-ref`,
    source_kind: "registry",
    claim_kind: input.claim_kind,
    registry: {
      entity_type: "deprecation",
      entity_id: input.deprecation.id,
      entity_name: input.deprecation.name,
      field_path: input.field_path,
      registry_version: input.registry.version,
    },
    source: sourceUrl ? { url: sourceUrl } : null,
    confidence: "high",
    verified_at: null,
  };
}

export function buildDeprecationEvidenceRefs(input: {
  registry: Pick<SaltRegistry, "version" | "generated_at">;
  deprecation: DeprecationRecord;
  primary_claim_kind: SaltEvidenceClaimKind;
  id_suffix: string;
}): SaltEvidenceRef[] {
  const { registry, deprecation, id_suffix: idSuffix } = input;
  const refs: SaltEvidenceRef[] = [
    buildDeprecationRegistryEvidenceRef({
      registry,
      deprecation,
      claim_kind: input.primary_claim_kind,
      field_path: "name",
      id_suffix: `${idSuffix}.name`,
    }),
  ];

  if (deprecation.deprecated_in) {
    refs.push(
      buildDeprecationRegistryEvidenceRef({
        registry,
        deprecation,
        claim_kind: "status",
        field_path: "deprecated_in",
        id_suffix: `${idSuffix}.deprecated-in`,
      }),
    );
  }

  if (deprecation.removed_in) {
    refs.push(
      buildDeprecationRegistryEvidenceRef({
        registry,
        deprecation,
        claim_kind: "status",
        field_path: "removed_in",
        id_suffix: `${idSuffix}.removed-in`,
      }),
    );
  }

  if (deprecation.replacement.name) {
    refs.push(
      buildDeprecationRegistryEvidenceRef({
        registry,
        deprecation,
        claim_kind: "status",
        field_path: "replacement.name",
        id_suffix: `${idSuffix}.replacement-name`,
      }),
    );
  }

  if (deprecation.replacement.notes) {
    refs.push(
      buildDeprecationRegistryEvidenceRef({
        registry,
        deprecation,
        claim_kind: "status",
        field_path: "replacement.notes",
        id_suffix: `${idSuffix}.replacement-notes`,
      }),
    );
  }

  const [firstMigration] = deprecation.migration.details;
  if (firstMigration) {
    refs.push(
      buildDeprecationRegistryEvidenceRef({
        registry,
        deprecation,
        claim_kind: "status",
        field_path: "migration.details.0.from",
        id_suffix: `${idSuffix}.migration-from`,
      }),
      buildDeprecationRegistryEvidenceRef({
        registry,
        deprecation,
        claim_kind: "status",
        field_path: "migration.details.0.to",
        id_suffix: `${idSuffix}.migration-to`,
      }),
    );
  }

  return uniqueEvidenceRefs(refs);
}

function buildComponentUsageEvidenceRef(input: {
  registry: Pick<SaltRegistry, "version" | "generated_at">;
  component: ComponentRecord;
  claim_kind: SaltEvidenceClaimKind;
  field_path: string;
  id_suffix: string;
}): SaltEvidenceRef {
  const sourceUrl =
    input.component.related_docs.usage ?? input.component.related_docs.overview;
  const source =
    sourceUrl || input.component.source.repo_path
      ? {
          repo_path: input.component.source.repo_path,
          url: sourceUrl,
        }
      : null;

  return {
    contract: SALT_EVIDENCE_REF_CONTRACT,
    id: `${input.component.id}.${input.id_suffix}.validation-ref`,
    source_kind: "registry",
    claim_kind: input.claim_kind,
    registry: {
      entity_type: "component",
      entity_id: input.component.id,
      entity_name: input.component.name,
      field_path: input.field_path,
      registry_version: input.registry.version,
    },
    source,
    confidence: "high",
    verified_at: input.component.last_verified_at,
  };
}

function buildGuideEvidenceRef(input: {
  registry: Pick<SaltRegistry, "version" | "generated_at">;
  guide: GuideRecord;
  claim_kind: SaltEvidenceClaimKind;
  field_path: string;
  id_suffix: string;
}): SaltEvidenceRef {
  const sourceUrl = input.guide.related_docs.overview;
  const source = sourceUrl ? { url: sourceUrl } : null;

  return {
    contract: SALT_EVIDENCE_REF_CONTRACT,
    id: `${input.guide.id}.${input.id_suffix}.validation-ref`,
    source_kind: "registry",
    claim_kind: input.claim_kind,
    registry: {
      entity_type: "guide",
      entity_id: input.guide.id,
      entity_name: input.guide.name,
      field_path: input.field_path,
      registry_version: input.registry.version,
    },
    source,
    confidence: "high",
    verified_at: input.guide.last_verified_at,
  };
}

function hasSourceLocator(ref: SaltEvidenceRef): boolean {
  return Boolean(ref.source?.url || ref.source?.repo_path);
}

export function buildWorkflowInputCodeEvidenceRef(input: {
  id: string;
  note: string;
}): SaltEvidenceRef {
  return {
    contract: SALT_EVIDENCE_REF_CONTRACT,
    id: `${input.id}.workflow-input.code.validation-ref`,
    source_kind: "workflow_input",
    claim_kind: "workflow",
    workflow_input: {
      field_path: "code",
    },
    confidence: "high",
    verified_at: null,
    note: input.note,
  };
}

const NAVIGATION_USAGE_PATTERN =
  /\b(navigat(?:e|ion|es|ing)|destination|destinations|page|pages|site|sites|route|routes|url|href)\b/i;

function hasNavigationUsageText(value: string): boolean {
  return NAVIGATION_USAGE_PATTERN.test(value);
}

const ACTION_USAGE_PATTERN =
  /\b(action|actions|command|commands|event|events|execute|executes|trigger|triggers|submit|submits|submitting|open|opens|opening)\b/i;

function hasActionUsageText(value: string): boolean {
  return ACTION_USAGE_PATTERN.test(value);
}

function indexedGuidance(
  values: string[] | undefined,
  fieldPrefix: string,
  predicate: (value: string) => boolean,
): { text: string; field_path: string } | null {
  const index = (values ?? []).findIndex(predicate);
  if (index < 0 || !values) {
    return null;
  }

  return {
    text: values[index],
    field_path: `${fieldPrefix}.${index}`,
  };
}

function navigationTargetScore(
  component: ComponentRecord,
  actionComponent: ComponentRecord,
): number {
  let score = 0;
  if (
    [...component.category, ...(component.semantics?.category ?? [])].some(
      (value) => /\bnavigation\b/i.test(value),
    )
  ) {
    score += 4;
  }

  if (component.package.name === actionComponent.package.name) {
    score += 1;
  }

  const guidance = [
    ...component.when_to_use,
    ...(component.semantics?.preferred_for ?? []),
  ];
  if (guidance.some(hasNavigationUsageText)) {
    score += 3;
  }

  if (
    guidance.some((value) =>
      /\b(destination|destinations|page|pages|site|sites|url|href)\b/i.test(
        value,
      ),
    )
  ) {
    score += 2;
  }

  return score;
}

function findNavigationTargetComponent(
  registry: Pick<SaltRegistry, "components">,
  actionComponent: ComponentRecord,
): ComponentRecord | null {
  const explicitTargetNames = new Set([
    ...actionComponent.alternatives.map((item) => item.use),
    ...(actionComponent.retrieval_signals?.contrast_targets.map(
      (item) => item.target,
    ) ?? []),
  ]);
  const explicitTarget = registry.components.find(
    (component) =>
      explicitTargetNames.has(component.name) &&
      navigationTargetScore(component, actionComponent) > 0,
  );
  if (explicitTarget) {
    return explicitTarget;
  }

  if (!findActionNavigationGuidance(actionComponent, null)) {
    return null;
  }

  const [candidate] = registry.components
    .filter((component) => component.id !== actionComponent.id)
    .map((component) => ({
      component,
      score: navigationTargetScore(component, actionComponent),
    }))
    .filter((candidate) => candidate.score > 0)
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }
      return left.component.name.localeCompare(right.component.name);
    });

  return candidate?.component ?? null;
}

function findActionNavigationGuidance(
  actionComponent: ComponentRecord,
  navigationComponent: ComponentRecord | null,
): { text: string; field_path: string } | null {
  const targetName = navigationComponent?.name;
  const hasTargetedNavigationText = (item: string): boolean =>
    Boolean(targetName && item.includes(targetName)) &&
    hasNavigationUsageText(item);

  return (
    indexedGuidance(
      actionComponent.when_not_to_use,
      "when_not_to_use",
      hasTargetedNavigationText,
    ) ??
    indexedGuidance(
      actionComponent.semantics?.not_for,
      "semantics.not_for",
      hasTargetedNavigationText,
    ) ??
    indexedGuidance(
      actionComponent.when_not_to_use,
      "when_not_to_use",
      hasNavigationUsageText,
    ) ??
    indexedGuidance(
      actionComponent.semantics?.not_for,
      "semantics.not_for",
      hasNavigationUsageText,
    )
  );
}

function findNavigationComponentGuidance(
  navigationComponent: ComponentRecord,
): { text: string; field_path: string } | null {
  return (
    indexedGuidance(
      navigationComponent.when_to_use,
      "when_to_use",
      hasNavigationUsageText,
    ) ??
    indexedGuidance(
      navigationComponent.semantics?.preferred_for,
      "semantics.preferred_for",
      hasNavigationUsageText,
    )
  );
}

export function hasNavigationComponentCandidate(
  component: ComponentRecord,
): boolean {
  return Boolean(findNavigationComponentGuidance(component));
}

function actionTargetScore(
  component: ComponentRecord,
  navigationComponent: ComponentRecord,
): number {
  let score = 0;
  if (
    [...component.category, ...(component.semantics?.category ?? [])].some(
      (value) => /\bactions?\b/i.test(value),
    )
  ) {
    score += 4;
  }

  if (component.package.name === navigationComponent.package.name) {
    score += 1;
  }

  const guidance = [
    ...component.when_to_use,
    ...(component.semantics?.preferred_for ?? []),
  ];
  if (guidance.some(hasActionUsageText)) {
    score += 3;
  }

  return score;
}

function findActionTargetComponent(
  registry: Pick<SaltRegistry, "components">,
  navigationComponent: ComponentRecord,
): ComponentRecord | null {
  const explicitTargetNames = new Set([
    ...navigationComponent.alternatives.map((item) => item.use),
    ...(navigationComponent.retrieval_signals?.contrast_targets.map(
      (item) => item.target,
    ) ?? []),
  ]);
  const explicitTarget = registry.components.find(
    (component) =>
      explicitTargetNames.has(component.name) &&
      actionTargetScore(component, navigationComponent) > 0,
  );
  if (explicitTarget) {
    return explicitTarget;
  }

  if (!findNavigationActionGuidance(navigationComponent, null)) {
    return null;
  }

  const [candidate] = registry.components
    .filter((component) => component.id !== navigationComponent.id)
    .map((component) => ({
      component,
      score: actionTargetScore(component, navigationComponent),
    }))
    .filter((candidate) => candidate.score > 0)
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }
      return left.component.name.localeCompare(right.component.name);
    });

  return candidate?.component ?? null;
}

function findNavigationActionGuidance(
  navigationComponent: ComponentRecord,
  actionComponent: ComponentRecord | null,
): { text: string; field_path: string } | null {
  const targetName = actionComponent?.name;
  const hasTargetedActionText = (item: string): boolean =>
    Boolean(targetName && item.includes(targetName)) &&
    hasActionUsageText(item);

  return (
    indexedGuidance(
      navigationComponent.when_not_to_use,
      "when_not_to_use",
      hasTargetedActionText,
    ) ??
    indexedGuidance(
      navigationComponent.semantics?.not_for,
      "semantics.not_for",
      hasTargetedActionText,
    ) ??
    indexedGuidance(
      navigationComponent.when_not_to_use,
      "when_not_to_use",
      hasActionUsageText,
    ) ??
    indexedGuidance(
      navigationComponent.semantics?.not_for,
      "semantics.not_for",
      hasActionUsageText,
    )
  );
}

function findActionComponentGuidance(
  actionComponent: ComponentRecord,
): { text: string; field_path: string } | null {
  return (
    indexedGuidance(
      actionComponent.when_to_use,
      "when_to_use",
      hasActionUsageText,
    ) ??
    indexedGuidance(
      actionComponent.semantics?.preferred_for,
      "semantics.preferred_for",
      hasActionUsageText,
    )
  );
}

export function findActionNavigationRuleEvidence(
  registry: Pick<SaltRegistry, "version" | "generated_at" | "components">,
  actionComponent: ComponentRecord,
): ComponentUsageContrastEvidence | null {
  const navigationComponent = findNavigationTargetComponent(
    registry,
    actionComponent,
  );
  if (!navigationComponent) {
    return null;
  }

  const actionGuidance = findActionNavigationGuidance(
    actionComponent,
    navigationComponent,
  );
  const navigationGuidance =
    findNavigationComponentGuidance(navigationComponent);
  if (!actionGuidance || !navigationGuidance) {
    return null;
  }

  const actionRef = buildComponentUsageEvidenceRef({
    registry,
    component: actionComponent,
    claim_kind: "component",
    field_path: actionGuidance.field_path,
    id_suffix: "navigation-contrast-action",
  });
  const navigationRef = buildComponentUsageEvidenceRef({
    registry,
    component: navigationComponent,
    claim_kind: "component",
    field_path: navigationGuidance.field_path,
    id_suffix: "navigation-contrast-target",
  });
  if (!hasSourceLocator(actionRef) || !hasSourceLocator(navigationRef)) {
    return null;
  }

  return {
    action_component: actionComponent,
    navigation_component: navigationComponent,
    action_guidance: {
      text: actionGuidance.text,
      field_path: actionGuidance.field_path,
      evidence_ref: actionRef,
    },
    navigation_guidance: {
      text: navigationGuidance.text,
      field_path: navigationGuidance.field_path,
      evidence_ref: navigationRef,
    },
    source_urls: unique(
      [
        actionComponent.related_docs.usage,
        actionComponent.related_docs.overview,
        navigationComponent.related_docs.usage,
        navigationComponent.related_docs.overview,
      ].filter((url): url is string => Boolean(url)),
    ),
  };
}

export function hasActionNavigationRuleCandidate(
  registry: Pick<SaltRegistry, "components">,
  actionComponent: ComponentRecord,
): boolean {
  const navigationComponent = findNavigationTargetComponent(
    registry,
    actionComponent,
  );
  if (!navigationComponent) {
    return false;
  }

  return Boolean(
    findActionNavigationGuidance(actionComponent, navigationComponent) &&
      findNavigationComponentGuidance(navigationComponent),
  );
}

export function findNavigationActionRuleEvidence(
  registry: Pick<SaltRegistry, "version" | "generated_at" | "components">,
  navigationComponent: ComponentRecord,
): ComponentUsageContrastEvidence | null {
  const actionComponent = findActionTargetComponent(
    registry,
    navigationComponent,
  );
  if (!actionComponent) {
    return null;
  }

  const navigationGuidance = findNavigationActionGuidance(
    navigationComponent,
    actionComponent,
  );
  const actionGuidance = findActionComponentGuidance(actionComponent);
  if (!navigationGuidance || !actionGuidance) {
    return null;
  }

  const actionRef = buildComponentUsageEvidenceRef({
    registry,
    component: actionComponent,
    claim_kind: "component",
    field_path: actionGuidance.field_path,
    id_suffix: "action-contrast-target",
  });
  const navigationRef = buildComponentUsageEvidenceRef({
    registry,
    component: navigationComponent,
    claim_kind: "component",
    field_path: navigationGuidance.field_path,
    id_suffix: "action-contrast-navigation",
  });
  if (!hasSourceLocator(actionRef) || !hasSourceLocator(navigationRef)) {
    return null;
  }

  return {
    action_component: actionComponent,
    navigation_component: navigationComponent,
    action_guidance: {
      text: actionGuidance.text,
      field_path: actionGuidance.field_path,
      evidence_ref: actionRef,
    },
    navigation_guidance: {
      text: navigationGuidance.text,
      field_path: navigationGuidance.field_path,
      evidence_ref: navigationRef,
    },
    source_urls: unique(
      [
        navigationComponent.related_docs.usage,
        navigationComponent.related_docs.overview,
        actionComponent.related_docs.usage,
        actionComponent.related_docs.overview,
      ].filter((url): url is string => Boolean(url)),
    ),
  };
}

export function hasNavigationActionRuleCandidate(
  registry: Pick<SaltRegistry, "components">,
  navigationComponent: ComponentRecord,
): boolean {
  const actionComponent = findActionTargetComponent(
    registry,
    navigationComponent,
  );
  if (!actionComponent) {
    return false;
  }

  return Boolean(
    findNavigationActionGuidance(navigationComponent, actionComponent) &&
      findActionComponentGuidance(actionComponent),
  );
}

function findPrimitiveIntentComponentGuidance(
  component: ComponentRecord,
  intent: PrimitiveRecreationIntent,
): { text: string; field_path: string } | null {
  const hasIntentUsageText =
    intent === "action" ? hasActionUsageText : hasNavigationUsageText;

  return (
    indexedGuidance(component.when_to_use, "when_to_use", hasIntentUsageText) ??
    indexedGuidance(
      component.semantics?.preferred_for,
      "semantics.preferred_for",
      hasIntentUsageText,
    )
  );
}

function primitiveIntentComponentScore(
  component: ComponentRecord,
  intent: PrimitiveRecreationIntent,
  roleHint: "button" | "link",
): number {
  const guidance = findPrimitiveIntentComponentGuidance(component, intent);
  if (!guidance) {
    return 0;
  }

  let score = 4;
  const categoryPattern =
    intent === "action" ? /\bactions?\b/i : /\bnavigation\b/i;
  if (
    [...component.category, ...(component.semantics?.category ?? [])].some(
      (value) => categoryPattern.test(value),
    )
  ) {
    score += 3;
  }

  if (component.tags.some((value) => categoryPattern.test(value))) {
    score += 1;
  }

  const normalizedName = slugify(component.name);
  if (normalizedName === roleHint) {
    score += 4;
  } else if (normalizedName.includes(roleHint)) {
    score += 2;
  }

  if (component.status === "stable") {
    score += 1;
  }

  return score;
}

function findPrimitiveIntentComponent(
  registry: Pick<SaltRegistry, "components">,
  intent: PrimitiveRecreationIntent,
  roleHint: "button" | "link",
): ComponentRecord | null {
  const [candidate] = registry.components
    .map((component) => ({
      component,
      score: primitiveIntentComponentScore(component, intent, roleHint),
    }))
    .filter((candidate) => candidate.score > 0)
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }
      return left.component.name.localeCompare(right.component.name);
    });

  return candidate?.component ?? null;
}

const PRIMITIVE_RECREATION_GUIDE_PATTERN =
  /\b(choose|prefer|use|rebuild|recreate|creating)\b.*\b(Salt|component|primitive|custom|native)\b|\b(Salt|component|primitive|custom|native)\b.*\b(choose|prefer|use|rebuild|recreate|creating)\b/i;

function hasPrimitiveRecreationGuideText(value: string): boolean {
  return PRIMITIVE_RECREATION_GUIDE_PATTERN.test(value);
}

function findPrimitiveRecreationGuideGuidance(
  guide: GuideRecord,
): { text: string; field_path: string } | null {
  if (hasPrimitiveRecreationGuideText(guide.summary)) {
    return {
      text: guide.summary,
      field_path: "summary",
    };
  }

  for (const [stepIndex, step] of guide.steps.entries()) {
    const statementIndex = step.statements.findIndex(
      hasPrimitiveRecreationGuideText,
    );
    if (statementIndex >= 0) {
      return {
        text: step.statements[statementIndex],
        field_path: `steps.${stepIndex}.statements.${statementIndex}`,
      };
    }
  }

  return null;
}

function primitiveRecreationRoleHint(
  surface: PrimitiveRecreationSurface,
): "button" | "link" {
  return surface === "native-button" || surface === "custom-button-role"
    ? "button"
    : "link";
}

function primitiveRecreationIntent(
  surface: PrimitiveRecreationSurface,
): PrimitiveRecreationIntent {
  return surface === "native-button" || surface === "custom-button-role"
    ? "action"
    : "navigation";
}

export function findPrimitiveRecreationRuleEvidence(
  registry: Pick<
    SaltRegistry,
    "version" | "generated_at" | "components" | "guides"
  >,
  surface: PrimitiveRecreationSurface,
): ComponentPrimitiveRecreationEvidence | null {
  const intent = primitiveRecreationIntent(surface);
  const roleHint = primitiveRecreationRoleHint(surface);
  const component = findPrimitiveIntentComponent(registry, intent, roleHint);
  const guide = findGuideByIdentifier(
    registry.guides,
    CHOOSING_PRIMITIVE_GUIDE_LOOKUP,
  );
  if (!component || !guide) {
    return null;
  }

  const componentGuidance = findPrimitiveIntentComponentGuidance(
    component,
    intent,
  );
  const guideGuidance = findPrimitiveRecreationGuideGuidance(guide);
  if (!componentGuidance || !guideGuidance) {
    return null;
  }

  const componentRef = buildComponentUsageEvidenceRef({
    registry,
    component,
    claim_kind: "component",
    field_path: componentGuidance.field_path,
    id_suffix: `${surface}-component-target`,
  });
  const guideRef = buildGuideEvidenceRef({
    registry,
    guide,
    claim_kind: "composition",
    field_path: guideGuidance.field_path,
    id_suffix: `${surface}-primitive-policy`,
  });
  if (!hasSourceLocator(componentRef) || !hasSourceLocator(guideRef)) {
    return null;
  }

  return {
    component,
    guide,
    component_guidance: {
      text: componentGuidance.text,
      field_path: componentGuidance.field_path,
      evidence_ref: componentRef,
    },
    guide_guidance: {
      text: guideGuidance.text,
      field_path: guideGuidance.field_path,
      evidence_ref: guideRef,
    },
    source_urls: unique(
      [
        component.related_docs.usage,
        component.related_docs.overview,
        guide.related_docs.overview,
      ].filter((url): url is string => Boolean(url)),
    ),
  };
}

export function hasPrimitiveRecreationRuleCandidate(
  registry: Pick<SaltRegistry, "components" | "guides">,
  surface: PrimitiveRecreationSurface,
): boolean {
  const intent = primitiveRecreationIntent(surface);
  const roleHint = primitiveRecreationRoleHint(surface);
  const component = findPrimitiveIntentComponent(registry, intent, roleHint);
  const guide = findGuideByIdentifier(
    registry.guides,
    CHOOSING_PRIMITIVE_GUIDE_LOOKUP,
  );
  if (!component || !guide) {
    return false;
  }

  return Boolean(
    findPrimitiveIntentComponentGuidance(component, intent) &&
      findPrimitiveRecreationGuideGuidance(guide),
  );
}

const TABULAR_SURFACE_PATTERN =
  /\b(tabular|tables?|data[-\s]?grid|grids?|rows?|columns?|datasets?|data sets?|structured data)\b/i;

function hasTabularSurfaceText(value: string): boolean {
  return TABULAR_SURFACE_PATTERN.test(value);
}

function findTabularSurfaceComponentGuidance(
  component: ComponentRecord,
): { text: string; field_path: string } | null {
  const whenToUseGuidance = indexedGuidance(
    component.when_to_use,
    "when_to_use",
    hasTabularSurfaceText,
  );
  if (whenToUseGuidance) {
    return whenToUseGuidance;
  }

  const semanticGuidance = indexedGuidance(
    component.semantics?.preferred_for,
    "semantics.preferred_for",
    hasTabularSurfaceText,
  );
  if (semanticGuidance) {
    return semanticGuidance;
  }

  return hasTabularSurfaceText(component.summary)
    ? {
        text: component.summary,
        field_path: "summary",
      }
    : null;
}

function tabularSurfaceComponentScore(component: ComponentRecord): number {
  const guidance = findTabularSurfaceComponentGuidance(component);
  if (!guidance) {
    return 0;
  }

  let score = 4;
  const normalizedName = slugify(component.name);
  if (normalizedName === "table") {
    score += 6;
  } else if (
    /\btable\b/.test(normalizedName) ||
    normalizedName.endsWith("table")
  ) {
    score += 4;
  }

  if (
    /\b(data-)?grid\b/.test(normalizedName) ||
    normalizedName.endsWith("grid")
  ) {
    score += 3;
  }

  if (
    component.aliases.some((alias) => hasTabularSurfaceText(alias)) ||
    component.tags.some((tag) => hasTabularSurfaceText(tag)) ||
    [...component.category, ...(component.semantics?.category ?? [])].some(
      (category) => hasTabularSurfaceText(category),
    )
  ) {
    score += 2;
  }

  if (hasTabularSurfaceText(component.summary)) {
    score += 1;
  }

  if (component.status === "stable") {
    score += 1;
  }

  return score;
}

function findTabularSurfaceComponents(
  registry: Pick<SaltRegistry, "components">,
): ComponentRecord[] {
  return registry.components
    .map((component) => ({
      component,
      score: tabularSurfaceComponentScore(component),
    }))
    .filter((candidate) => candidate.score > 0)
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }
      return left.component.name.localeCompare(right.component.name);
    })
    .slice(0, 2)
    .map((candidate) => candidate.component);
}

export function findTabularRecreationRuleEvidence(
  registry: Pick<
    SaltRegistry,
    "version" | "generated_at" | "components" | "guides"
  >,
): ComponentTabularRecreationEvidence | null {
  const components = findTabularSurfaceComponents(registry);
  const guide = findGuideByIdentifier(
    registry.guides,
    CHOOSING_PRIMITIVE_GUIDE_LOOKUP,
  );
  if (components.length === 0 || !guide) {
    return null;
  }

  const guideGuidance = findPrimitiveRecreationGuideGuidance(guide);
  if (!guideGuidance) {
    return null;
  }

  const componentEvidence = components
    .map((component) => {
      const guidance = findTabularSurfaceComponentGuidance(component);
      if (!guidance) {
        return null;
      }

      const evidenceRef = buildComponentUsageEvidenceRef({
        registry,
        component,
        claim_kind: "component",
        field_path: guidance.field_path,
        id_suffix: "native-table-target",
      });
      if (!hasSourceLocator(evidenceRef)) {
        return null;
      }

      return {
        component,
        guidance: {
          text: guidance.text,
          field_path: guidance.field_path,
          evidence_ref: evidenceRef,
        },
      };
    })
    .filter(
      (
        item,
      ): item is ComponentTabularRecreationEvidence["components"][number] =>
        Boolean(item),
    );

  const guideRef = buildGuideEvidenceRef({
    registry,
    guide,
    claim_kind: "composition",
    field_path: guideGuidance.field_path,
    id_suffix: "native-table-primitive-policy",
  });
  if (
    componentEvidence.length === 0 ||
    componentEvidence.length !== components.length ||
    !hasSourceLocator(guideRef)
  ) {
    return null;
  }

  return {
    components: componentEvidence,
    guide,
    guide_guidance: {
      text: guideGuidance.text,
      field_path: guideGuidance.field_path,
      evidence_ref: guideRef,
    },
    source_urls: unique(
      [
        ...componentEvidence.flatMap(({ component }) => [
          component.related_docs.usage,
          component.related_docs.overview,
        ]),
        guide.related_docs.overview,
      ].filter((url): url is string => Boolean(url)),
    ),
  };
}

export function hasTabularRecreationRuleCandidate(
  registry: Pick<SaltRegistry, "components" | "guides">,
): boolean {
  const components = findTabularSurfaceComponents(registry);
  const guide = findGuideByIdentifier(
    registry.guides,
    CHOOSING_PRIMITIVE_GUIDE_LOOKUP,
  );
  return Boolean(
    components.length > 0 &&
      guide &&
      components.every(findTabularSurfaceComponentGuidance) &&
      findPrimitiveRecreationGuideGuidance(guide),
  );
}

const INTERACTIVE_COMPONENT_PATTERN =
  /\b(action|actions|command|commands|event|events|execute|executes|trigger|triggers|submit|submits|navigation|navigate|destination|route|href|interactive|interaction)\b/i;
const INTERACTIVE_COMPONENT_CATEGORY_PATTERN =
  /\b(actions?|navigation|inputs?|forms-and-inputs|selection-controls)\b/i;

function hasInteractiveComponentText(value: string): boolean {
  return INTERACTIVE_COMPONENT_PATTERN.test(value);
}

function findInteractiveComponentGuidance(
  component: ComponentRecord,
): { text: string; field_path: string } | null {
  return (
    indexedGuidance(
      component.when_to_use,
      "when_to_use",
      hasInteractiveComponentText,
    ) ??
    indexedGuidance(
      component.semantics?.preferred_for,
      "semantics.preferred_for",
      hasInteractiveComponentText,
    ) ??
    indexedGuidance(
      component.category,
      "category",
      hasInteractiveComponentText,
    ) ??
    indexedGuidance(component.tags, "tags", hasInteractiveComponentText) ??
    (hasInteractiveComponentText(component.summary)
      ? {
          text: component.summary,
          field_path: "summary",
        }
      : null)
  );
}

export function hasInteractiveComponentCandidate(
  component: ComponentRecord,
): boolean {
  return (
    [...component.category, ...(component.semantics?.category ?? [])].some(
      (category) => INTERACTIVE_COMPONENT_CATEGORY_PATTERN.test(category),
    ) && Boolean(findInteractiveComponentGuidance(component))
  );
}

const NESTED_INTERACTIVE_GUIDE_PATTERN =
  /\b(do not|avoid|never|remove|flatten)\b.*\b(nest|nested|nesting)\b.*\b(interactive|interaction|primitive|component)\b|\b(nest|nested|nesting)\b.*\b(interactive|interaction|primitive|component)\b/i;

function hasNestedInteractiveGuideText(value: string): boolean {
  return NESTED_INTERACTIVE_GUIDE_PATTERN.test(value);
}

function findNestedInteractiveGuideGuidance(
  guide: GuideRecord,
): { text: string; field_path: string } | null {
  if (hasNestedInteractiveGuideText(guide.summary)) {
    return {
      text: guide.summary,
      field_path: "summary",
    };
  }

  for (const [stepIndex, step] of guide.steps.entries()) {
    const statementIndex = step.statements.findIndex(
      hasNestedInteractiveGuideText,
    );
    if (statementIndex >= 0) {
      return {
        text: step.statements[statementIndex],
        field_path: `steps.${stepIndex}.statements.${statementIndex}`,
      };
    }
  }

  return null;
}

export function findNestedInteractiveRuleEvidence(
  registry: Pick<
    SaltRegistry,
    "version" | "generated_at" | "components" | "guides"
  >,
  outerComponent: ComponentRecord,
  innerComponent: ComponentRecord,
): ComponentNestedInteractiveEvidence | null {
  const guide = findGuideByIdentifier(
    registry.guides,
    COMPOSITION_PITFALLS_GUIDE_LOOKUP,
  );
  if (!guide) {
    return null;
  }

  const outerGuidance = findInteractiveComponentGuidance(outerComponent);
  const innerGuidance = findInteractiveComponentGuidance(innerComponent);
  const guideGuidance = findNestedInteractiveGuideGuidance(guide);
  if (!outerGuidance || !innerGuidance || !guideGuidance) {
    return null;
  }

  const outerRef = buildComponentUsageEvidenceRef({
    registry,
    component: outerComponent,
    claim_kind: "component",
    field_path: outerGuidance.field_path,
    id_suffix: "nested-interactive-outer",
  });
  const innerRef = buildComponentUsageEvidenceRef({
    registry,
    component: innerComponent,
    claim_kind: "component",
    field_path: innerGuidance.field_path,
    id_suffix: "nested-interactive-inner",
  });
  const guideRef = buildGuideEvidenceRef({
    registry,
    guide,
    claim_kind: "composition",
    field_path: guideGuidance.field_path,
    id_suffix: "nested-interactive-policy",
  });
  if (
    !hasSourceLocator(outerRef) ||
    !hasSourceLocator(innerRef) ||
    !hasSourceLocator(guideRef)
  ) {
    return null;
  }

  return {
    outer_component: outerComponent,
    inner_component: innerComponent,
    outer_guidance: {
      text: outerGuidance.text,
      field_path: outerGuidance.field_path,
      evidence_ref: outerRef,
    },
    inner_guidance: {
      text: innerGuidance.text,
      field_path: innerGuidance.field_path,
      evidence_ref: innerRef,
    },
    guide,
    guide_guidance: {
      text: guideGuidance.text,
      field_path: guideGuidance.field_path,
      evidence_ref: guideRef,
    },
    source_urls: unique(
      [
        outerComponent.related_docs.usage,
        outerComponent.related_docs.overview,
        innerComponent.related_docs.usage,
        innerComponent.related_docs.overview,
        guide.related_docs.overview,
      ].filter((url): url is string => Boolean(url)),
    ),
  };
}

export function hasNestedInteractiveRuleCandidate(
  registry: Pick<SaltRegistry, "guides">,
  outerComponent: ComponentRecord,
  innerComponent: ComponentRecord,
): boolean {
  const guide = findGuideByIdentifier(
    registry.guides,
    COMPOSITION_PITFALLS_GUIDE_LOOKUP,
  );

  return Boolean(
    guide &&
      findInteractiveComponentGuidance(outerComponent) &&
      findInteractiveComponentGuidance(innerComponent) &&
      findNestedInteractiveGuideGuidance(guide),
  );
}

const PASS_THROUGH_WRAPPER_GUIDE_PATTERN =
  /\bpass[-\s]?through wrappers?\b|\bwrappers?\b.*\b(forward|forwarding|forwards|props?|adds value|hiding)\b|\b(forward|forwarding|forwards|props?)\b.*\bwrappers?\b/i;

function hasPassThroughWrapperGuideText(value: string): boolean {
  return PASS_THROUGH_WRAPPER_GUIDE_PATTERN.test(value);
}

function findPassThroughWrapperGuideGuidance(
  guide: GuideRecord,
): { text: string; field_path: string } | null {
  for (const [stepIndex, step] of guide.steps.entries()) {
    const statementIndex = step.statements.findIndex(
      hasPassThroughWrapperGuideText,
    );
    if (statementIndex >= 0) {
      return {
        text: step.statements[statementIndex],
        field_path: `steps.${stepIndex}.statements.${statementIndex}`,
      };
    }
  }

  return hasPassThroughWrapperGuideText(guide.summary)
    ? {
        text: guide.summary,
        field_path: "summary",
      }
    : null;
}

export function findPassThroughWrapperRuleEvidence(
  registry: Pick<
    SaltRegistry,
    "version" | "generated_at" | "components" | "guides"
  >,
  component: ComponentRecord,
): ComponentPassThroughWrapperEvidence | null {
  const wrapperGuide = findGuideByIdentifier(
    registry.guides,
    CUSTOM_WRAPPERS_GUIDE_LOOKUP,
  );
  if (!wrapperGuide) {
    return null;
  }

  const wrapperGuidance = findPassThroughWrapperGuideGuidance(wrapperGuide);
  if (!wrapperGuidance) {
    return null;
  }

  const componentRef = buildComponentRegistryEvidenceRef({
    registry,
    component,
    claim_kind: "component",
    field_path: "name",
    id_suffix: "pass-through-wrapper-target",
  });
  const wrapperGuideRef = buildGuideEvidenceRef({
    registry,
    guide: wrapperGuide,
    claim_kind: "composition",
    field_path: wrapperGuidance.field_path,
    id_suffix: "pass-through-wrapper-policy",
  });
  if (!hasSourceLocator(componentRef) || !hasSourceLocator(wrapperGuideRef)) {
    return null;
  }

  const supportingGuide = findGuideByIdentifier(
    registry.guides,
    COMPOSITION_PITFALLS_GUIDE_LOOKUP,
  );
  const supportingGuidance = supportingGuide
    ? findPassThroughWrapperGuideGuidance(supportingGuide)
    : null;
  const supportingGuideRef =
    supportingGuide && supportingGuidance
      ? buildGuideEvidenceRef({
          registry,
          guide: supportingGuide,
          claim_kind: "composition",
          field_path: supportingGuidance.field_path,
          id_suffix: "pass-through-wrapper-supporting-policy",
        })
      : null;
  const supportingEvidence =
    supportingGuide &&
    supportingGuidance &&
    supportingGuideRef &&
    hasSourceLocator(supportingGuideRef)
      ? {
          guide: supportingGuide,
          guidance: supportingGuidance,
          evidence_ref: supportingGuideRef,
        }
      : null;

  return {
    component,
    component_ref: componentRef,
    wrapper_guide: wrapperGuide,
    wrapper_guidance: {
      text: wrapperGuidance.text,
      field_path: wrapperGuidance.field_path,
      evidence_ref: wrapperGuideRef,
    },
    supporting_guide: supportingEvidence?.guide,
    supporting_guide_guidance: supportingEvidence
      ? {
          text: supportingEvidence.guidance.text,
          field_path: supportingEvidence.guidance.field_path,
          evidence_ref: supportingEvidence.evidence_ref,
        }
      : undefined,
    source_urls: unique(
      [
        component.related_docs.overview,
        component.related_docs.usage,
        wrapperGuide.related_docs.overview,
        supportingEvidence?.guide.related_docs.overview,
      ].filter((url): url is string => Boolean(url)),
    ),
  };
}

export function findAccessibleNameRuleEvidence(
  registry: Pick<SaltRegistry, "version" | "generated_at">,
  component: ComponentRecord,
): ComponentAccessibilityRuleEvidence | null {
  const rule = component.accessibility.rules.find((item) =>
    /\b(accessible[-\s]name|aria-label|aria-labelledby)\b/i.test(item.rule),
  );
  if (!rule) {
    return null;
  }

  const sourceUrl =
    component.related_docs.accessibility ??
    component.related_docs.usage ??
    component.related_docs.overview;
  const source =
    sourceUrl || component.source.repo_path
      ? {
          repo_path: component.source.repo_path,
          url: sourceUrl,
        }
      : null;
  if (!source) {
    return null;
  }

  const fieldPath = `accessibility.rules.${rule.id}`;

  return {
    component,
    rule,
    field_path: fieldPath,
    source_urls: unique(
      [
        component.related_docs.accessibility,
        component.related_docs.usage,
      ].filter((url): url is string => Boolean(url)),
    ),
    evidence_ref: {
      contract: SALT_EVIDENCE_REF_CONTRACT,
      id: `${component.id}.${rule.id}.accessibility-rule.validation-ref`,
      source_kind: "registry",
      claim_kind: "accessibility",
      registry: {
        entity_type: "component",
        entity_id: component.id,
        entity_name: component.name,
        field_path: fieldPath,
        registry_version: registry.version,
      },
      source,
      confidence: "high",
      verified_at: component.last_verified_at,
    },
  };
}

export function findDecorativeIconRuleEvidence(
  registry: Pick<SaltRegistry, "version" | "generated_at">,
  component: ComponentRecord,
): ComponentAccessibilityRuleEvidence | null {
  const rule = component.accessibility.rules.find(
    (item) =>
      /\baria-hidden\b/i.test(item.rule) && /\bicons?\b/i.test(item.rule),
  );
  if (!rule) {
    return null;
  }

  const sourceUrl =
    component.related_docs.accessibility ??
    component.related_docs.usage ??
    component.related_docs.overview;
  const source =
    sourceUrl || component.source.repo_path
      ? {
          repo_path: component.source.repo_path,
          url: sourceUrl,
        }
      : null;
  if (!source) {
    return null;
  }

  const fieldPath = `accessibility.rules.${rule.id}`;

  return {
    component,
    rule,
    field_path: fieldPath,
    source_urls: unique(
      [
        component.related_docs.accessibility,
        component.related_docs.usage,
      ].filter((url): url is string => Boolean(url)),
    ),
    evidence_ref: {
      contract: SALT_EVIDENCE_REF_CONTRACT,
      id: `${component.id}.${rule.id}.accessibility-rule.validation-ref`,
      source_kind: "registry",
      claim_kind: "accessibility",
      registry: {
        entity_type: "component",
        entity_id: component.id,
        entity_name: component.name,
        field_path: fieldPath,
        registry_version: registry.version,
      },
      source,
      confidence: "high",
      verified_at: component.last_verified_at,
    },
  };
}

export function buildAccessibleNameValidationIssue(input: {
  evidence: ComponentAccessibilityRuleEvidence;
  matches: number;
}): ValidationIssue {
  const { component, rule } = input.evidence;
  const sourceUrls = input.evidence.source_urls;

  return {
    id: `a11y.${slugify(component.name)}-accessible-name`,
    category: "accessibility",
    rule: rule.id,
    severity: rule.severity,
    title: `${component.name} accessible-name requirement`,
    message: rule.rule,
    evidence: buildEvidence(
      `Detected icon-only ${component.name} usage without an accessible label attribute`,
      input.matches,
    ),
    canonical_source: sourceUrls[0] ?? null,
    suggested_fix: null,
    confidence: 0.9,
    source_urls: sourceUrls,
    evidence_refs: [input.evidence.evidence_ref],
    matches: input.matches,
    fix_hints: {
      related_components: [component.name],
    },
  };
}

export function buildDecorativeIconValidationIssue(input: {
  evidence: ComponentAccessibilityRuleEvidence;
  matches: number;
}): ValidationIssue {
  const { component, rule } = input.evidence;
  const sourceUrls = input.evidence.source_urls;

  return {
    id: `a11y.${slugify(component.name)}-decorative-icon-hidden`,
    category: "accessibility",
    rule: rule.id,
    severity: rule.severity,
    title: `${component.name} decorative-icon accessibility requirement`,
    message: rule.rule,
    evidence: buildEvidence(
      `Detected decorative ${component.name} icon usage without aria-hidden`,
      input.matches,
    ),
    canonical_source: sourceUrls[0] ?? null,
    suggested_fix: null,
    confidence: 0.9,
    source_urls: sourceUrls,
    evidence_refs: [input.evidence.evidence_ref],
    matches: input.matches,
    fix_hints: {
      related_components: [component.name],
    },
  };
}

export function buildActionNavigationValidationIssue(input: {
  evidence: ComponentUsageContrastEvidence;
  matches: number;
}): ValidationIssue {
  const {
    action_component: actionComponent,
    navigation_component: navigationComponent,
    action_guidance: actionGuidance,
    navigation_guidance: navigationGuidance,
  } = input.evidence;

  return {
    id: "component-choice.navigation",
    category: "primitive-choice",
    rule: "navigation-target-uses-navigation-component",
    severity: "error",
    title: `${actionComponent.name} used with a navigation target`,
    message: `${actionComponent.name}: ${actionGuidance.text} ${navigationComponent.name}: ${navigationGuidance.text}`,
    evidence: buildEvidence(
      `Detected ${actionComponent.name} usage with a navigation target attribute`,
      input.matches,
    ),
    canonical_source: input.evidence.source_urls[0] ?? null,
    suggested_fix: `Use ${navigationComponent.name} for navigation targets instead of ${actionComponent.name}.`,
    confidence: 0.95,
    source_urls: input.evidence.source_urls,
    evidence_refs: [
      actionGuidance.evidence_ref,
      navigationGuidance.evidence_ref,
    ],
    matches: input.matches,
    fix_hints: {
      related_components: [actionComponent.name, navigationComponent.name],
    },
  };
}

export function buildActionNavigationHandlerValidationIssue(input: {
  evidence: ComponentUsageContrastEvidence;
  matches: number;
}): ValidationIssue {
  const {
    action_component: actionComponent,
    navigation_component: navigationComponent,
    action_guidance: actionGuidance,
    navigation_guidance: navigationGuidance,
  } = input.evidence;

  return {
    id: "component-choice.navigation-handler",
    category: "primitive-choice",
    rule: "navigation-handler-uses-navigation-component",
    severity: "warning",
    title: `${actionComponent.name} click handler appears to navigate`,
    message: `${actionComponent.name}: ${actionGuidance.text} ${navigationComponent.name}: ${navigationGuidance.text}`,
    evidence: buildEvidence(
      `Detected ${actionComponent.name} click handler that appears to trigger navigation`,
      input.matches,
    ),
    canonical_source: input.evidence.source_urls[0] ?? null,
    suggested_fix: `Use ${navigationComponent.name} for navigation targets instead of ${actionComponent.name}.`,
    confidence: 0.78,
    source_urls: input.evidence.source_urls,
    evidence_refs: [
      actionGuidance.evidence_ref,
      navigationGuidance.evidence_ref,
    ],
    matches: input.matches,
    fix_hints: {
      related_components: [actionComponent.name, navigationComponent.name],
    },
  };
}

export function buildNavigationActionValidationIssue(input: {
  evidence: ComponentUsageContrastEvidence;
  matches: number;
}): ValidationIssue {
  const {
    action_component: actionComponent,
    navigation_component: navigationComponent,
    action_guidance: actionGuidance,
    navigation_guidance: navigationGuidance,
  } = input.evidence;

  return {
    id: "primitive-choice.link-action",
    category: "primitive-choice",
    rule: "navigation-component-used-as-action",
    severity: "warning",
    title: `${navigationComponent.name} used as an action without a navigation target`,
    message: `${navigationComponent.name}: ${navigationGuidance.text} ${actionComponent.name}: ${actionGuidance.text}`,
    evidence: buildEvidence(
      `Detected ${navigationComponent.name} usage with an interaction handler and no navigation target attribute`,
      input.matches,
    ),
    canonical_source: input.evidence.source_urls[0] ?? null,
    suggested_fix: `Use ${actionComponent.name} for actions instead of ${navigationComponent.name}, or add a navigation target when this component is meant to navigate.`,
    confidence: 0.86,
    source_urls: input.evidence.source_urls,
    evidence_refs: [
      navigationGuidance.evidence_ref,
      actionGuidance.evidence_ref,
    ],
    matches: input.matches,
    fix_hints: {
      related_components: [navigationComponent.name, actionComponent.name],
    },
  };
}

function primitiveRecreationSurfaceLabel(
  surface: PrimitiveRecreationSurface,
): string {
  switch (surface) {
    case "native-button":
      return "native button element";
    case "native-link":
      return "native anchor element";
    case "custom-button-role":
      return 'custom element with role="button"';
    case "custom-link-role":
      return 'custom element with role="link"';
  }
}

function primitiveRecreationRulePrefix(
  surface: PrimitiveRecreationSurface,
): string {
  switch (surface) {
    case "native-button":
      return "native-button";
    case "native-link":
      return "native-anchor";
    case "custom-button-role":
      return "custom-button-role";
    case "custom-link-role":
      return "custom-link-role";
  }
}

function primitiveRecreationConfidence(
  surface: PrimitiveRecreationSurface,
): number {
  return surface === "custom-button-role" || surface === "custom-link-role"
    ? 0.86
    : 0.8;
}

export function buildPrimitiveRecreationValidationIssue(input: {
  surface: PrimitiveRecreationSurface;
  evidence: ComponentPrimitiveRecreationEvidence;
  matches: number;
}): ValidationIssue {
  const { component, guide, component_guidance, guide_guidance } =
    input.evidence;
  const surfaceLabel = primitiveRecreationSurfaceLabel(input.surface);
  const intent = primitiveRecreationIntent(input.surface);

  return {
    id: `primitive-choice.${input.surface}`,
    category: "primitive-choice",
    rule: `${primitiveRecreationRulePrefix(input.surface)}-should-prefer-salt-${slugify(
      component.name,
    )}`,
    severity: "warning",
    title: `${surfaceLabel} detected in Salt UI code`,
    message: `${component.name}: ${component_guidance.text} ${guide.name}: ${guide_guidance.text}`,
    evidence: buildEvidence(
      `Detected ${surfaceLabel} in code that already uses Salt`,
      input.matches,
    ),
    canonical_source: input.evidence.source_urls[0] ?? null,
    suggested_fix: `Use ${component.name} for ${intent} intent instead of recreating that primitive with a ${surfaceLabel}.`,
    confidence: primitiveRecreationConfidence(input.surface),
    source_urls: input.evidence.source_urls,
    evidence_refs: [
      component_guidance.evidence_ref,
      guide_guidance.evidence_ref,
    ],
    matches: input.matches,
    fix_hints: {
      related_components: [component.name],
      guide_lookups: [CHOOSING_PRIMITIVE_GUIDE_LOOKUP],
    },
  };
}

function formatComponentNames(components: ComponentRecord[]): string {
  const names = components.map((component) => component.name);
  if (names.length <= 2) {
    return names.join(" or ");
  }

  return `${names.slice(0, -1).join(", ")}, or ${names.at(-1)}`;
}

export function buildTabularRecreationValidationIssue(input: {
  evidence: ComponentTabularRecreationEvidence;
  matches: number;
}): ValidationIssue {
  const components = input.evidence.components.map((item) => item.component);
  const componentNames = formatComponentNames(components);
  const componentGuidance = input.evidence.components
    .map(({ component, guidance }) => `${component.name}: ${guidance.text}`)
    .join(" ");

  return {
    id: "primitive-choice.native-table",
    category: "primitive-choice",
    rule: `native-table-should-prefer-salt-${components
      .map((component) => slugify(component.name))
      .join("-or-")}`,
    severity: "warning",
    title: "Raw HTML table detected in Salt UI code",
    message: `${componentGuidance} ${input.evidence.guide.name}: ${input.evidence.guide_guidance.text}`,
    evidence: buildEvidence(
      "Detected raw HTML table markup in code that already uses Salt",
      input.matches,
    ),
    canonical_source: input.evidence.source_urls[0] ?? null,
    suggested_fix: `Use ${componentNames} for tabular data instead of recreating the data surface with raw HTML table markup.`,
    confidence: 0.84,
    source_urls: input.evidence.source_urls,
    evidence_refs: [
      ...input.evidence.components.map((item) => item.guidance.evidence_ref),
      input.evidence.guide_guidance.evidence_ref,
    ],
    matches: input.matches,
    fix_hints: {
      related_components: components.map((component) => component.name),
      guide_lookups: [CHOOSING_PRIMITIVE_GUIDE_LOOKUP],
    },
  };
}

export function buildNestedInteractiveValidationIssue(input: {
  evidence: ComponentNestedInteractiveEvidence;
  matches: number;
}): ValidationIssue {
  const {
    outer_component: outerComponent,
    inner_component: innerComponent,
    outer_guidance: outerGuidance,
    inner_guidance: innerGuidance,
    guide,
    guide_guidance: guideGuidance,
  } = input.evidence;

  return {
    id: "composition.nested-interactive-primitives",
    category: "composition",
    rule: "avoid-nesting-interactive-salt-primitives",
    severity: "error",
    title: `${outerComponent.name} contains nested ${innerComponent.name}`,
    message: `${guide.name}: ${guideGuidance.text} ${outerComponent.name}: ${outerGuidance.text} ${innerComponent.name}: ${innerGuidance.text}`,
    evidence: buildEvidence(
      `Detected ${outerComponent.name} elements containing nested ${innerComponent.name}`,
      input.matches,
    ),
    canonical_source: input.evidence.source_urls[0] ?? null,
    suggested_fix: `Use a single interactive Salt component for the interaction instead of nesting ${innerComponent.name} inside ${outerComponent.name}.`,
    confidence: 0.94,
    source_urls: input.evidence.source_urls,
    evidence_refs: [
      guideGuidance.evidence_ref,
      outerGuidance.evidence_ref,
      innerGuidance.evidence_ref,
    ],
    matches: input.matches,
    fix_hints: {
      related_components: [outerComponent.name, innerComponent.name],
      guide_lookups: [COMPOSITION_PITFALLS_GUIDE_LOOKUP],
    },
  };
}

function uniqueEvidenceRefs(refs: SaltEvidenceRef[]): SaltEvidenceRef[] {
  return refs.filter(
    (ref, index) =>
      refs.findIndex((candidate) => candidate.id === ref.id) === index,
  );
}

export function buildPassThroughWrapperValidationIssue(input: {
  entries: Array<{
    evidence: ComponentPassThroughWrapperEvidence;
    wrapper_names: string[];
  }>;
  matches: number;
}): ValidationIssue {
  const firstEntry = input.entries[0];
  if (!firstEntry) {
    throw new Error(
      "buildPassThroughWrapperValidationIssue requires at least one evidence entry",
    );
  }

  const componentNames = unique(
    input.entries.map(({ evidence }) => evidence.component.name),
  );
  const wrapperSegments = input.entries.map(({ evidence, wrapper_names }) => {
    return `${wrapper_names.join(", ")} -> ${evidence.component.name}`;
  });
  const guideLookups = unique([
    CUSTOM_WRAPPERS_GUIDE_LOOKUP,
    ...input.entries.flatMap(({ evidence }) =>
      evidence.supporting_guide ? [COMPOSITION_PITFALLS_GUIDE_LOOKUP] : [],
    ),
  ]);
  const sourceUrls = unique(
    input.entries.flatMap(({ evidence }) => evidence.source_urls),
  );
  const evidenceRefs = uniqueEvidenceRefs(
    [
      ...input.entries.flatMap(({ evidence }) => [
        evidence.wrapper_guidance.evidence_ref,
        evidence.supporting_guide_guidance?.evidence_ref,
        evidence.component_ref,
      ]),
      buildWorkflowInputCodeEvidenceRef({
        id: "composition.pass-through-wrapper",
        note: "Validator matched pass-through wrapper source code supplied to validateSaltUsage.",
      }),
    ].filter((ref): ref is SaltEvidenceRef => Boolean(ref)),
  );

  return {
    id: "composition.pass-through-wrapper",
    category: "composition",
    rule: "avoid-pass-through-wrapper-over-salt-primitive",
    severity: "warning",
    title: "Pass-through wrapper over a Salt primitive detected",
    message: `${firstEntry.evidence.wrapper_guide.name}: ${firstEntry.evidence.wrapper_guidance.text} Wrapped component${componentNames.length === 1 ? "" : "s"}: ${componentNames.join(
      ", ",
    )}.`,
    evidence: buildEvidence(
      `Detected pass-through wrapper component${input.matches === 1 ? "" : "s"}: ${wrapperSegments.join(
        "; ",
      )}`,
      input.matches,
    ),
    canonical_source: sourceUrls[0] ?? null,
    suggested_fix: `${firstEntry.evidence.wrapper_guide.name}: ${firstEntry.evidence.wrapper_guidance.text}`,
    confidence: 0.88,
    source_urls: sourceUrls,
    evidence_refs: evidenceRefs,
    matches: input.matches,
    fix_hints: {
      related_components: componentNames,
      guide_lookups: guideLookups,
    },
  };
}

export function buildDeprecationFix(
  deprecation: DeprecationRecord,
): string | null {
  const [firstMigration] = deprecation.migration.details;
  if (firstMigration) {
    return `Replace ${firstMigration.from} with ${firstMigration.to}.`;
  }

  if (deprecation.replacement.name) {
    const replacementType = deprecation.replacement.type
      ? `${deprecation.replacement.type} `
      : "";
    return `Use ${replacementType}${deprecation.replacement.name}.`;
  }

  if (deprecation.replacement.notes) {
    return deprecation.replacement.notes;
  }

  return null;
}

function severityRank(severity: ValidationSeverity): number {
  if (severity === "error") {
    return 0;
  }
  if (severity === "warning") {
    return 1;
  }
  return 2;
}

export function createIssueCollector(): {
  issueMap: Map<string, ValidationIssue>;
  addIssue: (issue: ValidationIssue) => void;
} {
  const issueMap = new Map<string, ValidationIssue>();

  const addIssue = (issue: ValidationIssue): void => {
    const existing = issueMap.get(issue.id);
    if (existing) {
      existing.matches += issue.matches;
      existing.confidence = Math.max(existing.confidence, issue.confidence);
      existing.evidence = unique([...existing.evidence, ...issue.evidence]);
      existing.source_urls = unique([
        ...existing.source_urls,
        ...issue.source_urls,
      ]);
      existing.evidence_refs = [
        ...(existing.evidence_refs ?? []),
        ...(issue.evidence_refs ?? []),
      ].filter(
        (ref, index, refs) =>
          refs.findIndex((candidate) => candidate.id === ref.id) === index,
      );
      if (!existing.canonical_source && issue.canonical_source) {
        existing.canonical_source = issue.canonical_source;
      }
      if (!existing.suggested_fix && issue.suggested_fix) {
        existing.suggested_fix = issue.suggested_fix;
      }
      return;
    }
    issueMap.set(issue.id, issue);
  };

  return { issueMap, addIssue };
}

export function sortValidationIssues(
  issues: ValidationIssue[],
): ValidationIssue[] {
  return [...issues].sort((left, right) => {
    const severityDelta =
      severityRank(left.severity) - severityRank(right.severity);
    if (severityDelta !== 0) {
      return severityDelta;
    }
    if (left.matches !== right.matches) {
      return right.matches - left.matches;
    }
    return right.confidence - left.confidence;
  });
}

export function summarizeValidationIssues(
  issues: ValidationIssue[],
): ValidationSummary {
  return issues.reduce(
    (accumulator, issue) => {
      if (issue.severity === "error") {
        accumulator.errors += 1;
      } else if (issue.severity === "warning") {
        accumulator.warnings += 1;
      } else {
        accumulator.infos += 1;
      }
      return accumulator;
    },
    { errors: 0, warnings: 0, infos: 0 },
  );
}

export function finalizeValidationIssues(
  issueMap: Map<string, ValidationIssue>,
  maxIssues: number,
): {
  summary: ValidationSummary;
  issues: ValidationIssue[];
} {
  const sortedIssues = sortValidationIssues([...issueMap.values()]);
  return {
    summary: summarizeValidationIssues(sortedIssues),
    issues: sortedIssues.slice(0, maxIssues),
  };
}
