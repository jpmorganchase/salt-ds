import * as t from "@babel/types";
import {
  deduplicateSaltEvidenceRefs,
  SALT_EVIDENCE_REF_CONTRACT,
  type SaltEvidenceClaimKind,
  type SaltEvidenceRef,
} from "../../evidence.js";
import type { SaltRegistry } from "../../types.js";
import {
  buildValidationIssueFromValidationRule,
  type SaltValidationRulePack,
  validateValidationRulePackEvidence,
} from "../../validationRulePacks.js";
import {
  type ImportedSaltSymbol,
  resolveImportedSaltSymbol,
  traverseAst,
} from "../codeAnalysisCommon.js";
import type { ValidationCategory, ValidationIssue } from "./shared.js";
import {
  buildComponentRegistryEvidenceRef,
  buildEvidence,
} from "./validateSaltUsageHelpers.js";
import { getJsxAttributeName } from "./validateSaltUsageJsx.js";

export interface AddValidationRulePackIssuesInput {
  registry: SaltRegistry;
  rulePack: SaltValidationRulePack | undefined;
  ast: t.File;
  directImportByLocal: Map<string, ImportedSaltSymbol>;
  namespaceImportByLocal: Map<string, ImportedSaltSymbol>;
  addIssue: (issue: ValidationIssue) => void;
  missingData: string[];
}

function matchesImportedComponent(
  imported: ImportedSaltSymbol,
  component: SaltRegistry["components"][number],
): boolean {
  return (
    component.package.name === imported.packageName &&
    (component.name === imported.imported ||
      component.aliases.includes(imported.imported))
  );
}

function claimKindForCategory(
  category: ValidationCategory,
): SaltEvidenceClaimKind {
  switch (category) {
    case "primitive-choice":
      return "component";
    case "composition":
      return "composition";
    case "accessibility":
      return "accessibility";
    case "tokens":
      return "token";
    case "deprecated":
      return "prop";
    case "catalog-status":
      return "status";
  }
}

function buildSubmittedTextEvidenceRef(
  ruleId: string,
  category: ValidationCategory,
): SaltEvidenceRef {
  return {
    contract: SALT_EVIDENCE_REF_CONTRACT,
    id: `${ruleId}.submitted-text.code.validation-ref`,
    source_kind: "submitted_text",
    claim_kind: claimKindForCategory(category),
    submitted_text: {
      field_path: "code",
    },
    note: "Validator matched source code supplied to validateSaltUsage.",
  };
}

export function addValidationRulePackIssues(
  input: AddValidationRulePackIssuesInput,
): void {
  if (!input.rulePack) {
    return;
  }

  const validationIssues = validateValidationRulePackEvidence(
    input.rulePack,
    input.registry,
  );
  if (validationIssues.length > 0) {
    for (const issue of validationIssues) {
      input.missingData.push(
        `Validation rule pack '${input.rulePack.id}' skipped: ${issue.code} at ${issue.path}. ${issue.message}`,
      );
    }
    return;
  }

  const componentById = new Map(
    input.registry.components.map((component) => [component.id, component]),
  );
  const generatedEvidenceRefsByRuleId = new Map<string, SaltEvidenceRef[]>();
  for (const rule of input.rulePack.rules) {
    const component = componentById.get(rule.match.component_id);
    if (!component) {
      continue;
    }
    const generatedEvidenceRefs = [
      buildComponentRegistryEvidenceRef({
        registry: input.registry,
        component,
        claim_kind: "component",
        field_path: "id",
        id_suffix: `${rule.id}.component-target`,
      }),
      buildSubmittedTextEvidenceRef(rule.id, rule.category),
    ];
    try {
      deduplicateSaltEvidenceRefs([
        ...rule.evidence_refs,
        ...generatedEvidenceRefs,
      ]);
    } catch (error) {
      input.missingData.push(
        `Validation rule pack '${input.rulePack.id}' skipped: conflicting_evidence_ref for rule '${rule.id}'. ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return;
    }
    generatedEvidenceRefsByRuleId.set(rule.id, generatedEvidenceRefs);
  }
  const matchCounts = new Map<string, number>();

  traverseAst(input.ast, {
    JSXOpeningElement(path) {
      const imported = resolveImportedSaltSymbol(
        path.node.name,
        input.directImportByLocal,
        input.namespaceImportByLocal,
      );
      if (!imported) {
        return;
      }

      const attributeNames = new Set(
        path.node.attributes
          .filter((attribute): attribute is t.JSXAttribute =>
            t.isJSXAttribute(attribute),
          )
          .map((attribute) => getJsxAttributeName(attribute))
          .filter((name): name is string => Boolean(name)),
      );

      for (const rule of input.rulePack?.rules ?? []) {
        const component = componentById.get(rule.match.component_id);
        if (!component || !matchesImportedComponent(imported, component)) {
          continue;
        }

        if (
          !rule.match.attribute_names.some((attributeName) =>
            attributeNames.has(attributeName),
          )
        ) {
          continue;
        }

        matchCounts.set(rule.id, (matchCounts.get(rule.id) ?? 0) + 1);
      }
    },
  });

  for (const rule of input.rulePack.rules) {
    const matches = matchCounts.get(rule.id) ?? 0;
    if (matches === 0) {
      continue;
    }

    const component = componentById.get(rule.match.component_id);
    if (!component) {
      continue;
    }

    input.addIssue(
      buildValidationIssueFromValidationRule({
        rule,
        matches,
        evidence: buildEvidence(
          `Validation rule pack '${input.rulePack.id}' matched supplied code for rule '${rule.id}'`,
          matches,
        ),
        evidence_refs: generatedEvidenceRefsByRuleId.get(rule.id) ?? [],
      }),
    );
  }
}
