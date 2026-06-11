import {
  buildCreatePublicContract,
  buildMigratePublicContract,
  buildReviewPublicContract,
  buildUpgradePublicContract,
} from "@salt-ds/semantic-core/tools/publicContract";
import type { PublicContract } from "@salt-ds/semantic-core/tools/publicContract";
import type { MigrateToSaltResult } from "@salt-ds/semantic-core/tools/migrateToSalt";
import type { MigrateToSaltWorkflowContract } from "@salt-ds/semantic-core/tools/migrateToSalt";
import type {
  ReviewSaltUiResult,
  ReviewSaltUiWorkflowContract,
} from "@salt-ds/semantic-core/tools/reviewSaltUi";
import type { UpgradeSaltUiResult } from "@salt-ds/semantic-core/tools/upgradeSaltUi";
import type { UpgradeSaltUiWorkflowContract } from "@salt-ds/semantic-core/tools/upgradeSaltUi";
import type { CreateSaltUiWorkflowContract } from "@salt-ds/semantic-core/tools/workflowContracts";
import type { resolveSemanticRegistry } from "../../../lib/semanticRuntime.js";
import type { CreateWorkflowResult } from "./types.js";

export function toCreateAgentWorkflowJson(
  result: CreateWorkflowResult,
  contract: CreateSaltUiWorkflowContract,
  options: {
    registry: Awaited<ReturnType<typeof resolveSemanticRegistry>>["registry"];
    query: string;
    packageName?: string;
    saltPackages?: string[];
    packageManager?: string;
    resolvedEntities?: string[];
  },
): PublicContract {
  return buildCreatePublicContract(result.result.recommendation, contract, {
    transport_used: "cli",
    registry: options.registry,
    query: options.query,
    package: options.packageName,
    salt_packages: options.saltPackages,
    package_manager: options.packageManager,
    resolved_entities: options.resolvedEntities,
  });
}

export function toReviewAgentWorkflowJson(
  result: ReviewSaltUiResult,
  contract: ReviewSaltUiWorkflowContract,
  registry: Awaited<ReturnType<typeof resolveSemanticRegistry>>["registry"],
): PublicContract {
  return buildReviewPublicContract(result, contract, {
    transport_used: "cli",
    registry,
  });
}

export function toMigrateAgentWorkflowJson(
  result: MigrateToSaltResult,
  contract: MigrateToSaltWorkflowContract,
): PublicContract {
  return buildMigratePublicContract(result, contract, {
    transport_used: "cli",
  });
}

export function toUpgradeAgentWorkflowJson(
  result: UpgradeSaltUiResult,
  contract: UpgradeSaltUiWorkflowContract,
): PublicContract {
  return buildUpgradePublicContract(result, contract, {
    transport_used: "cli",
  });
}
