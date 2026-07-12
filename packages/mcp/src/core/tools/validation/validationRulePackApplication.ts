import * as t from "@babel/types";
import {
  SALT_EVIDENCE_REF_CONTRACT,
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
import type { ValidationIssue } from "./shared.js";
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

function buildWorkflowInputEvidenceRef(ruleId: string): SaltEvidenceRef {
  return {
    contract: SALT_EVIDENCE_REF_CONTRACT,
    id: `${ruleId}.workflow-input.code.validation-ref`,
    source_kind: "workflow_input",
    claim_kind: "workflow",
    workflow_input: {
      field_path: "code",
    },
    confidence: "high",
    verified_at: null,
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
        evidence_refs: [
          buildComponentRegistryEvidenceRef({
            registry: input.registry,
            component,
            claim_kind: "component",
            field_path: "id",
            id_suffix: `${rule.id}.component-target`,
          }),
          buildWorkflowInputEvidenceRef(rule.id),
        ],
      }),
    );
  }
}
