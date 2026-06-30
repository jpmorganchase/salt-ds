import path from "node:path";
import { writeJsonFile } from "../lib/common.js";
import {
  emitHookAdvice,
  emitHookPass,
  type HookInput,
  HookInputError,
  readHookInput,
} from "../lib/hookIO.js";
import { collectSaltInfo } from "../lib/infoContext.js";
import type { RequiredCliIo, SaltInfoResult } from "../types.js";

function formatInfoReport(result: SaltInfoResult): string {
  const lines = [
    "Salt DS Info",
    `Root: ${result.rootDir}`,
    `Contract: compact ${result.capabilityManifest.contracts.compact_workflow_contract_version} (${result.capabilityManifest.manifest_version})`,
    `Framework: ${result.framework.name}`,
    `Workspace: ${result.workspace.kind}${result.workspace.workspaceRoot ? ` (${result.workspace.workspaceRoot})` : ""}`,
    `Package manager: ${result.environment.packageManager}`,
    `Salt packages: ${
      result.salt.packages.length > 0
        ? result.salt.packages
            .map((pkg) => `${pkg.name}@${pkg.version}`)
            .join(", ")
        : "none detected"
    }`,
    `Salt installation: ${
      result.salt.installation.healthSummary.health !== "pass"
        ? `${result.salt.installation.healthSummary.health} (${result.salt.installation.healthSummary.recommendedAction})`
        : result.salt.installation.installedPackages.length > 0
          ? `consistent (${result.salt.installation.versionHealth.installedVersions.join(", ")})`
          : "no installed Salt packages found on the resolution path"
    }`,
    `Installation inspection: ${
      result.salt.installation.inspection.strategy === "package-manager-command"
        ? `${result.salt.installation.inspection.packageManager} ${result.salt.installation.inspection.status === "succeeded" ? "command" : "fallback"}`
        : "node_modules scan"
    }${result.salt.installation.inspection.limitations.length > 0 ? " (limited)" : ""}`,
    `Install layout: ${result.salt.installation.inspection.packageLayout}`,
    `Install issue scope: ${result.salt.installation.workspace.issueSourceHint}`,
    `Registry: ${
      result.registry.available
        ? `${result.registry.source} (${result.registry.registryDir})`
        : "unavailable"
    }`,
    `Catalog support: ${
      result.capabilityManifest.support_surface.retrieval_catalog.available
        ? `${result.capabilityManifest.support_surface.retrieval_catalog.contract_version} via ${result.capabilityManifest.support_surface.retrieval_catalog.access.join(", ")}`
        : "unavailable"
    }`,
    `Generated context: ${result.generatedContext.status} (${result.generatedContext.entryCount} entr${result.generatedContext.entryCount === 1 ? "y" : "ies"})`,
    `Policy: ${
      result.policy.mode === "none"
        ? "not detected"
        : `${result.policy.mode} policy detected`
    }`,
    `Shared conventions packs: ${
      result.policy.sharedConventions.enabled
        ? `enabled (${result.policy.sharedConventions.packCount} package-backed layer${result.policy.sharedConventions.packCount === 1 ? "" : "s"})`
        : "not detected"
    }`,
    `Repo instructions: ${result.repoInstructions.path ?? "not detected"}`,
    `Runtime targets: ${result.runtime.detectedTargets.length}`,
  ];

  if (result.policy.stackLayers.length > 0) {
    lines.push("Policy layers:");
    lines.push(
      ...result.policy.stackLayers.map(
        (layer) =>
          `- ${layer.id} [${layer.scope}] via ${layer.sourceType}:${layer.source}${layer.optional ? " (optional)" : ""}${layer.resolution.packId ? ` {${layer.resolution.packId}}` : ""}${layer.resolution.compatibility ? ` <${layer.resolution.compatibility.status}>` : ""}${layer.resolution.reason ? ` - ${layer.resolution.reason}` : ""}`,
      ),
    );
  }

  if (result.catalog?.query) {
    lines.push("Catalog query:");
    lines.push(
      `- ${result.catalog.query.query} -> ${result.catalog.query.owner?.entity.name ?? "no owner"} [${result.catalog.query.status}]`,
    );
  }

  if (result.catalog?.entity) {
    lines.push("Catalog entity:");
    lines.push(
      `- ${result.catalog.entity.query} -> ${result.catalog.entity.matches.length} match${result.catalog.entity.matches.length === 1 ? "" : "es"} [${result.catalog.entity.status}]`,
    );
  }

  if (result.catalog?.family) {
    lines.push("Catalog family:");
    lines.push(
      `- ${result.catalog.family.query} -> ${result.catalog.family.matches.length} family match${result.catalog.family.matches.length === 1 ? "" : "es"} [${result.catalog.family.status}]`,
    );
  }

  if (result.imports.aliases.length > 0) {
    lines.push("Aliases:");
    lines.push(
      ...result.imports.aliases.map(
        (alias) => `- ${alias.alias} -> ${alias.targets.join(", ")}`,
      ),
    );
  }

  if (result.notes.length > 0) {
    lines.push("Notes:");
    lines.push(...result.notes.map((note) => `- ${note}`));
  }

  if (
    result.salt.installation.healthSummary.health !== "pass" &&
    result.salt.installation.remediation.explainCommand
  ) {
    lines.push("Next:");
    lines.push(
      `- Inspect dependency drift with ${result.salt.installation.remediation.explainCommand}`,
    );
    if (result.salt.installation.remediation.dedupeCommand) {
      lines.push(
        `- Dedupe installs with ${result.salt.installation.remediation.dedupeCommand}`,
      );
    }
  }

  if (result.salt.installation.workspace.workspaceRoot) {
    lines.push(
      `Workspace install root: ${result.salt.installation.workspace.workspaceRoot}`,
    );
  }

  if (result.salt.installation.inspection.manifestOverrideFields.length > 0) {
    lines.push(
      `Manifest override fields: ${result.salt.installation.inspection.manifestOverrideFields.join(", ")}`,
    );
  }

  if (result.salt.installation.inspection.limitations.length > 0) {
    lines.push(
      `Inspection limitations: ${result.salt.installation.inspection.limitations.join(" | ")}`,
    );
  }

  if (result.salt.installation.duplicatePackages.length > 0) {
    lines.push(
      `Duplicate Salt packages: ${result.salt.installation.duplicatePackages.map((saltPackage) => saltPackage.name).join(", ")}`,
    );
  }

  if (result.salt.installation.healthSummary.blockingWorkflows.length > 0) {
    lines.push(
      `Blocked workflows: ${result.salt.installation.healthSummary.blockingWorkflows.join(", ")}`,
    );
  }

  return `${lines.join("\n")}\n`;
}

export async function runInfoCommand(
  positionals: string[],
  flags: Record<string, string>,
  io: RequiredCliIo,
): Promise<number> {
  if (flags.hook === "true") {
    return runInfoHookCommand(positionals, flags, io);
  }

  const rootDir = path.resolve(io.cwd, positionals[0] ?? ".");
  const result = await collectSaltInfo(rootDir, flags["registry-dir"], {
    policyDetail: "resolved",
    catalogQuery: flags["catalog-query"],
    entityName: flags.entity,
    familyName: flags.family,
  });
  const outputPath = flags.output
    ? path.resolve(io.cwd, flags.output)
    : undefined;

  if (outputPath) {
    await writeJsonFile(outputPath, result);
  }

  if (flags.json === "true") {
    io.writeStdout(`${JSON.stringify(result, null, 2)}\n`);
  } else {
    io.writeStdout(formatInfoReport(result));
    if (outputPath) {
      io.writeStdout(`Wrote JSON report to ${outputPath}\n`);
    }
  }

  return 0;
}

function buildInfoHookAdditionalContext(result: SaltInfoResult): string {
  const lines: string[] = [];
  lines.push(`Salt DS context for ${result.rootDir}`);
  lines.push(
    `Contract: compact ${result.capabilityManifest.contracts.compact_workflow_contract_version} (${result.capabilityManifest.manifest_version})`,
  );
  if (result.salt.packages.length > 0) {
    lines.push(
      `Salt packages: ${result.salt.packages
        .map((pkg) => `${pkg.name}@${pkg.version}`)
        .join(", ")}`,
    );
  } else {
    lines.push("Salt packages: none detected");
  }

  const installHealth = result.salt.installation.healthSummary.health;
  if (installHealth !== "pass") {
    lines.push(
      `Salt installation: ${installHealth} (${result.salt.installation.healthSummary.recommendedAction})`,
    );
  }

  if (result.policy.mode === "none") {
    lines.push(
      "Policy: not declared (default Salt team policy; run `salt-ds init` to record durable repo conventions)",
    );
  } else {
    lines.push(
      `Policy: ${result.policy.mode} (${result.policy.mode === "team" ? (result.policy.teamConfigPath ?? ".salt/team.json") : (result.policy.stackConfigPath ?? ".salt/stack.json")})`,
    );
  }

  const registryStatus = result.registry.available
    ? `${result.registry.source ?? "registry"}${result.registry.registryDir ? ` (${result.registry.registryDir})` : ""}`
    : "unavailable";
  lines.push(`Registry: ${registryStatus}`);
  lines.push(
    `MCP package: ${result.registry.mcpPackageInstalled ? "available" : "not installed"} (transport: ${result.registry.canonicalTransport})`,
  );

  const supportSurface =
    result.capabilityManifest.support_surface.retrieval_catalog;
  if (supportSurface.available) {
    lines.push(
      `Catalog: ${supportSurface.contract_version} via ${supportSurface.access.join(", ")}`,
    );
  }

  if (result.runtime.detectedTargets.length > 0) {
    lines.push(
      `Runtime targets: ${result.runtime.detectedTargets
        .map((target) => `${target.label} ${target.url}`)
        .join(", ")}`,
    );
  }

  lines.push(
    "Prefer: salt-ds review, salt-ds create, salt-ds migrate, salt-ds upgrade. Always run `salt-ds review` (or the ui:verify script) after edits.",
  );

  return lines.join("\n");
}

async function runInfoHookCommand(
  positionals: string[],
  flags: Record<string, string>,
  io: RequiredCliIo,
): Promise<number> {
  let hookInput: HookInput | null;
  try {
    hookInput = await readHookInput({ stream: io.stdin });
  } catch (error) {
    if (error instanceof HookInputError) {
      io.writeStderr(`salt-ds info --hook: ${error.message}\n`);
      return 1;
    }
    throw error;
  }

  if (!hookInput) {
    io.writeStderr(
      "salt-ds info --hook requires hook JSON on stdin. See https://code.visualstudio.com/docs/agent-customization/hooks\n",
    );
    return 1;
  }

  // Only SessionStart benefits from a one-shot context injection. Other events
  // are a pass-through so misconfigured hook wiring stays silent.
  if (hookInput.hookEventName !== "SessionStart") {
    return emitHookPass();
  }

  const rootDir = path.resolve(
    io.cwd,
    positionals[0] ?? hookInput.hookCwd ?? ".",
  );

  try {
    const result = await collectSaltInfo(rootDir, flags["registry-dir"]);
    const additionalContext = buildInfoHookAdditionalContext(result);
    return emitHookAdvice(
      {
        hookSpecificOutput: {
          hookEventName: "SessionStart",
          additionalContext,
        },
      },
      io,
    );
  } catch (error) {
    io.writeStderr(
      `salt-ds info --hook: ${error instanceof Error ? error.message : String(error)}\n`,
    );
    return 1;
  }
}
