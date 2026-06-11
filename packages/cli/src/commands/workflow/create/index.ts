import path from "node:path";
import { createSaltUi } from "@salt-ds/semantic-core/tools/createSaltUi";
import { buildCreateSaltUiWorkflowContract } from "@salt-ds/semantic-core/tools/workflowContracts";
import { applyProjectPolicyToStarterCodeSnippets } from "@salt-ds/semantic-core/tools/workflowProjectPolicyApplication";
import type { CreateRuleId } from "@salt-ds/semantic-core/tools/workflowRuleIds";
import { readRepeatableFlagValues } from "../../../lib/args.js";
import { writeJsonFile } from "../../../lib/common.js";
import { collectSaltInfo } from "../../../lib/infoContext.js";
import {
  loadCreateProjectConventionsSummary,
  loadWorkflowProjectPolicySummary,
} from "../../../lib/projectConventionsWorkflow.js";
import {
  readRegistryLoadOptionsFromFlags,
  resolveSemanticRegistry,
} from "../../../lib/registry.js";
import type { RequiredCliIo } from "../../../types.js";
import { toCreateAgentWorkflowJson } from "../shared/agentJson.js";
import {
  buildCliWorkflowContextRequirement,
  buildCliWorkflowSummaryNextStep,
  buildCreateConfidence,
  toCliStarterValidationStatus,
  toCliWorkflowReadiness,
} from "../shared/confidence.js";
import {
  getWorkflowExitCode,
  rejectUnsupportedJsonVariant,
} from "../shared/exitCode.js";
import { toPublicCliSuggestedFollowUps } from "../shared/followUps.js";
import { writeWorkflowOutput } from "../shared/output.js";
import {
  buildProjectPolicyNotes,
  formatProjectPolicyLayer,
  formatProjectPolicyLayers,
  toActionableProjectConventionsRepoRefinement,
} from "../shared/policy.js";
import type {
  CreateWorkflowResult,
  PublicCreateRecommendation,
} from "../shared/types.js";

import { formatCreateReport } from "./format.js";

export async function runCreateCommand(
  positionals: string[],
  flags: Record<string, string>,
  io: RequiredCliIo,
): Promise<number> {
  const invalidJsonVariantExitCode = rejectUnsupportedJsonVariant(
    "create",
    flags,
    io,
  );
  if (invalidJsonVariantExitCode != null) {
    return invalidJsonVariantExitCode;
  }

  const query = positionals.join(" ").trim();
  if (!query) {
    io.writeStderr("Missing query. Usage: salt-ds create <query>\n");
    return 30;
  }

  try {
    const createType = flags.type === "composition" ? "pattern" : flags.type;
    const resolvedEntities = readRepeatableFlagValues(flags["resolved-entity"]);
    const context = await collectSaltInfo(io.cwd, flags["registry-dir"]);
    const { registry } = await resolveSemanticRegistry(
      io.cwd,
      flags["registry-dir"],

      readRegistryLoadOptionsFromFlags(flags),
    );
    const rawRecommendation = createSaltUi(registry, {
      query,
      solution_type:
        createType === "component" ||
        createType === "pattern" ||
        createType === "foundation" ||
        createType === "token" ||
        createType === "auto"
          ? createType
          : undefined,
      package: flags.package,
      status:
        flags.status === "stable" ||
        flags.status === "beta" ||
        flags.status === "lab" ||
        flags.status === "deprecated"
          ? flags.status
          : undefined,
      include_starter_code: flags["include-starter-code"] !== "false",
      view: flags.full === "true" ? "full" : "compact",
    }) as PublicCreateRecommendation;
    const recommendation: PublicCreateRecommendation = {
      ...rawRecommendation,
      suggested_follow_ups: toPublicCliSuggestedFollowUps(
        rawRecommendation.suggested_follow_ups,
      ),
    };
    const projectConventions = await loadCreateProjectConventionsSummary({
      rootDir: io.cwd,
      policy: context.policy,
      salt: context.salt,
      decision: recommendation.decision,
      guidanceBoundary: recommendation.guidance_boundary,
    });
    const projectPolicy = await loadWorkflowProjectPolicySummary({
      rootDir: io.cwd,
      policy: context.policy,
      salt: context.salt,
    });
    const policyStarterCode = applyProjectPolicyToStarterCodeSnippets(
      recommendation.starter_code,
      projectPolicy,
    );
    const policyRecommendation: PublicCreateRecommendation = {
      ...recommendation,
      ...(policyStarterCode ? { starter_code: policyStarterCode } : {}),
    };
    const canonicalContract = buildCreateSaltUiWorkflowContract(
      registry,
      policyRecommendation,
      {
        query,
        context_checked: true,
        project_policy: projectPolicy,
        starter_code: policyStarterCode,
      },
    );
    const starterValidation = canonicalContract.starter_validation;
    const repoRefinement = canonicalContract.repo_refinement;
    const projectConventionRepoRefinement =
      toActionableProjectConventionsRepoRefinement(projectConventions);
    const effectiveRepoRefinement =
      projectConventionRepoRefinement ?? repoRefinement;
    const workflowReadiness = toCliWorkflowReadiness(
      canonicalContract.readiness,
    );
    const consultedPolicyLayers = formatProjectPolicyLayers(
      projectConventions?.layersConsulted ?? [],
    );
    const appliedPolicyLayer = formatProjectPolicyLayer(
      projectConventions?.appliedRule?.layer,
    );
    const result: CreateWorkflowResult = {
      workflow: {
        id: "create",
        transportUsed: "cli",
        implementationGate: canonicalContract.implementation_gate,
        confidence: buildCreateConfidence(
          policyRecommendation,
          context,
          projectConventions,
          starterValidation,
          canonicalContract.implementation_gate,
        ),
        readiness: workflowReadiness,
        contextRequirement: buildCliWorkflowContextRequirement(),
        projectConventionsCheck: canonicalContract.project_conventions_check,
        provenance: canonicalContract.provenance,
      },
      result: {
        intent: {
          userTask: canonicalContract.intent.user_task,
          keyInteraction: canonicalContract.intent.key_interaction,
          compositionDirection: canonicalContract.intent.composition_direction,
          canonicalChoice: canonicalContract.intent.canonical_choice,
          ruleIds: canonicalContract.intent.rule_ids as CreateRuleId[],
        },
        recommendation: policyRecommendation,
        summary: {
          mode: policyRecommendation.mode,
          solutionType: policyRecommendation.solution_type,
          decisionName: policyRecommendation.decision.name,
          finalDecisionName:
            effectiveRepoRefinement?.final_name ??
            policyRecommendation.decision.name,
          finalDecisionSource:
            effectiveRepoRefinement?.source === "project_policy"
              ? "project_policy"
              : "canonical_salt",
          starterValidationStatus: toCliStarterValidationStatus(
            workflowReadiness,
            starterValidation,
          ),
          nextStep: buildCliWorkflowSummaryNextStep({
            readiness: workflowReadiness,
            defaultNextStep:
              canonicalContract.implementation_gate.next_step ??
              recommendation.next_step ??
              "Use the recommended Salt direction as the first scaffold, then validate the changed code with salt-ds review.",
          }),
          suggestedFollowUps:
            recommendation.suggested_follow_ups?.map(
              (entry) => entry.workflow,
            ) ?? [],
        },
      },
      artifacts: {
        context,
        starterValidation,
        projectConventions,
        projectPolicy,
        repoRefinement: effectiveRepoRefinement,
        notes: Array.from(
          new Set([
            ...context.notes,
            ...(!context.policy.teamConfigPath &&
            !context.policy.stackConfigPath
              ? [
                  "No .salt/team.json or .salt/stack.json is declared yet. Proceed with the canonical Salt direction first, and add repo-local policy only if durable wrappers, bans, or pattern preferences would change the final answer.",
                ]
              : []),
            ...(recommendation.guidance_boundary.project_conventions
              .check_recommended
              ? [
                  "The canonical create result recommends a project-conventions check before the final project answer is locked.",
                ]
              : []),
            ...(projectConventions &&
            projectConventionRepoRefinement?.status ===
              "refined_by_project_policy"
              ? [
                  `Project conventions changed the final project answer from ${
                    projectConventions.canonicalChoice.name ?? "none"
                  } to ${projectConventions.finalRecommendation ?? "none"}.`,
                  ...(appliedPolicyLayer
                    ? [`Project policy layer applied: ${appliedPolicyLayer}.`]
                    : []),
                ]
              : projectConventions?.applied
                ? [
                    `Project conventions suggested ${
                      projectConventions.finalRecommendation ?? "none"
                    } instead of ${
                      projectConventions.canonicalChoice.name ?? "none"
                    }, but no actionable import metadata was declared, so the workflow output stayed on canonical Salt.`,
                    ...(appliedPolicyLayer
                      ? [
                          `Project policy layer consulted: ${appliedPolicyLayer}.`,
                        ]
                      : []),
                  ]
                : projectConventions?.consulted
                  ? [
                      "Project conventions were checked and kept the canonical Salt answer.",
                    ]
                  : []),
            ...(repoRefinement?.status === "refined_by_project_policy" &&
            projectConventionRepoRefinement == null
              ? [
                  `Repo policy refines the final project answer from ${
                    repoRefinement.canonical_name ?? "none"
                  } to ${repoRefinement.final_name ?? "none"}.`,
                ]
              : []),
            ...(consultedPolicyLayers
              ? [`Project policy layers consulted: ${consultedPolicyLayers}.`]
              : []),
            ...(projectConventions?.themeDefaults?.provider
              ? [
                  `Project theme default: ${projectConventions.themeDefaults.provider}.`,
                ]
              : []),
            ...(projectConventions && projectConventions.tokenAliases.length > 0
              ? [
                  `Project token aliases declared: ${projectConventions.tokenAliases.length}.`,
                ]
              : []),
            ...(projectConventions &&
            projectConventions.tokenFamilyPolicies.length > 0
              ? [
                  `Project token family policies declared: ${projectConventions.tokenFamilyPolicies
                    .map((entry) => `${entry.family}:${entry.mode}`)
                    .join(", ")}.`,
                ]
              : []),
            ...(projectConventions?.warnings ?? []),
            ...buildProjectPolicyNotes(projectPolicy),
            ...(starterValidation?.status === "needs_attention"
              ? [
                  `Starter code self-check found Salt issues: ${starterValidation.top_issue ?? "review the starter validation output before editing."}`,
                ]
              : []),
          ]),
        ),
      },
    };

    const compactJson = toCreateAgentWorkflowJson(result, canonicalContract, {
      registry,
      query,
      packageName: flags.package,
      saltPackages: context.salt.packages.map((entry) => entry.name),
      packageManager: context.environment.packageManager,
      resolvedEntities,
    });

    if (flags["starter-only"] === "true" && flags.json === "true") {
      const starterOnlyResult = {
        workflow: "create",
        status: compactJson.status,
        decision: policyRecommendation.decision,
        starter_code: policyRecommendation.starter_code ?? null,
        composition_contract: policyRecommendation.composition_contract ?? null,
        required_follow_through:
          canonicalContract.implementation_gate.required_follow_through,
        action: compactJson.action,
      };
      const jsonOutputPath = flags["json-file"] ?? flags.output;
      if (jsonOutputPath) {
        await writeJsonFile(
          path.resolve(io.cwd, jsonOutputPath),
          starterOnlyResult,
        );
      }
      io.writeStdout(`${JSON.stringify(starterOnlyResult, null, 2)}\n`);
      return getWorkflowExitCode(compactJson);
    }

    await writeWorkflowOutput(result, flags, io, formatCreateReport, {
      compactJsonOverride: compactJson,
    });
    return getWorkflowExitCode(compactJson);
  } catch (error) {
    io.writeStderr(
      `${error instanceof Error ? error.message : "Failed to plan the Salt UI creation."}\n`,
    );
    return 30;
  }
}
