import path from "node:path";
import { discoverSalt } from "@salt-ds/semantic-core/tools/discoverSalt";
import { getSaltEntity } from "@salt-ds/semantic-core/tools/getSaltEntity";
import { getSaltExamples } from "@salt-ds/semantic-core/tools/getSaltExamples";
import { writeJsonFile } from "../lib/common.js";
import { resolveSemanticRegistry, readRegistryLoadOptionsFromFlags } from "../lib/registry.js";
import type { RequiredCliIo } from "../types.js";

function readBooleanFlag(value: string | undefined): boolean | undefined {
  if (value == null) {
    return undefined;
  }

  return value === "true";
}

function readPositiveInteger(value: string | undefined): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

function readListFlag(value: string | undefined): string[] | undefined {
  if (!value) {
    return undefined;
  }

  const values = value
    .split(/[\n,]/)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0 && entry !== "true");

  return values.length > 0 ? values : undefined;
}

function readViewFlag(
  value: string | undefined,
): "compact" | "full" | undefined {
  return value === "compact" || value === "full" ? value : undefined;
}

async function writeSupportOutput(
  payload: unknown,
  flags: Record<string, string>,
  io: RequiredCliIo,
  formatText: (payload: Record<string, unknown>) => string,
): Promise<void> {
  const outputPath = flags.output
    ? path.resolve(io.cwd, flags.output)
    : undefined;

  if (outputPath) {
    await writeJsonFile(outputPath, payload);
  }

  if (flags.json === "true") {
    io.writeStdout(`${JSON.stringify(payload, null, 2)}\n`);
    return;
  }

  io.writeStdout(formatText(payload as Record<string, unknown>));
  if (outputPath) {
    io.writeStdout(`Wrote JSON report to ${outputPath}\n`);
  }
}

function formatEntityLookup(payload: Record<string, unknown>): string {
  const decision = payload.decision as
    | { status?: string; why?: string }
    | undefined;
  const entity = payload.entity as { name?: string } | null | undefined;
  const matches = Array.isArray(payload.matches) ? payload.matches : [];
  const lines = [
    "Salt Entity",
    `Status: ${decision?.status ?? "unknown"}`,
    `Entity: ${entity?.name ?? "none"}`,
    `Matches: ${matches.length}`,
  ];

  if (decision?.why) {
    lines.push(`Why: ${decision.why}`);
  }
  if (typeof payload.next_step === "string") {
    lines.push(`Next: ${payload.next_step}`);
  }

  return `${lines.join("\n")}\n`;
}

function formatExamplesLookup(payload: Record<string, unknown>): string {
  const decision = payload.decision as
    | { target_name?: string | null; target_type?: string | null; why?: string }
    | undefined;
  const alternatives = Array.isArray(payload.alternatives)
    ? payload.alternatives
    : [];
  const lines = [
    "Salt Examples",
    `Target: ${decision?.target_name ?? "none"}`,
    `Type: ${decision?.target_type ?? "unknown"}`,
    `Alternatives: ${alternatives.length}`,
  ];

  if (decision?.why) {
    lines.push(`Why: ${decision.why}`);
  }
  if (typeof payload.next_step === "string") {
    lines.push(`Next: ${payload.next_step}`);
  }

  return `${lines.join("\n")}\n`;
}

function formatDiscovery(payload: Record<string, unknown>): string {
  const decision = payload.decision as
    | { workflow?: string; why?: string }
    | null
    | undefined;
  const lines = [
    "Salt Discovery",
    `Mode: ${typeof payload.mode === "string" ? payload.mode : "unknown"}`,
    `Workflow: ${decision?.workflow ?? "none"}`,
  ];

  if (decision?.why) {
    lines.push(`Why: ${decision.why}`);
  }
  if (typeof payload.next_step === "string") {
    lines.push(`Next: ${payload.next_step}`);
  }

  return `${lines.join("\n")}\n`;
}

export async function runGetSaltEntityCommand(
  positionals: string[],
  flags: Record<string, string>,
  io: RequiredCliIo,
): Promise<number> {
  const lookup = flags.name ?? positionals.join(" ").trim();

  if (!lookup && !flags.query) {
    io.writeStderr(
      "Missing entity name. Use `salt-ds get_salt_entity <name> --json` or pass --query.\n",
    );
    return 30;
  }

  try {
    const { registry } = await resolveSemanticRegistry(
      io.cwd,
      flags["registry-dir"],

      readRegistryLoadOptionsFromFlags(flags),
    );
    const payload = getSaltEntity(registry, {
      entity_type: flags["entity-type"] as Parameters<
        typeof getSaltEntity
      >[1]["entity_type"],
      name: lookup || undefined,
      query: flags.query,
      package: flags.package,
      status: flags.status as Parameters<typeof getSaltEntity>[1]["status"],
      include: readListFlag(flags.include) as Parameters<
        typeof getSaltEntity
      >[1]["include"],
      include_related: readBooleanFlag(flags["include-related"]),
      include_starter_code: readBooleanFlag(flags["include-starter-code"]),
      max_results: readPositiveInteger(flags["max-results"]),
      include_deprecated: readBooleanFlag(flags["include-deprecated"]),
      view: readViewFlag(flags.view),
    });

    await writeSupportOutput(payload, flags, io, formatEntityLookup);
    return payload.decision.status === "not_found" ? 10 : 0;
  } catch (error) {
    io.writeStderr(
      `${error instanceof Error ? error.message : "Failed to retrieve the Salt entity."}\n`,
    );
    return 30;
  }
}

export async function runGetSaltExamplesCommand(
  positionals: string[],
  flags: Record<string, string>,
  io: RequiredCliIo,
): Promise<number> {
  const targetName = flags["target-name"] ?? positionals.join(" ").trim();

  if (!targetName && !flags.query) {
    io.writeStderr(
      "Missing example target. Use `salt-ds get_salt_examples <target> --json` or pass --query.\n",
    );
    return 30;
  }

  try {
    const { registry } = await resolveSemanticRegistry(
      io.cwd,
      flags["registry-dir"],

      readRegistryLoadOptionsFromFlags(flags),
    );
    const payload = getSaltExamples(registry, {
      target_type: flags["target-type"] as Parameters<
        typeof getSaltExamples
      >[1]["target_type"],
      target_name: targetName || undefined,
      package: flags.package,
      query: flags.query,
      complexity: flags.complexity as Parameters<
        typeof getSaltExamples
      >[1]["complexity"],
      include_code: readBooleanFlag(flags["include-code"]),
      include_starter_code: readBooleanFlag(flags["include-starter-code"]),
      max_results: readPositiveInteger(flags["max-results"]),
      view: readViewFlag(flags.view),
    });

    await writeSupportOutput(payload, flags, io, formatExamplesLookup);
    return payload.best_example ? 0 : 10;
  } catch (error) {
    io.writeStderr(
      `${error instanceof Error ? error.message : "Failed to retrieve Salt examples."}\n`,
    );
    return 30;
  }
}

export async function runDiscoverSaltCommand(
  positionals: string[],
  flags: Record<string, string>,
  io: RequiredCliIo,
): Promise<number> {
  const query = (flags.query ?? positionals.join(" ").trim()) || undefined;

  try {
    const { registry } = await resolveSemanticRegistry(
      io.cwd,
      flags["registry-dir"],

      readRegistryLoadOptionsFromFlags(flags),
    );
    const payload = discoverSalt(registry, {
      query,
      area: flags.area as Parameters<typeof discoverSalt>[1]["area"],
      package: flags.package,
      status: flags.status as Parameters<typeof discoverSalt>[1]["status"],
      related_to: flags["related-name"]
        ? {
            entity_type: (flags["related-type"] ?? "component") as NonNullable<
              Parameters<typeof discoverSalt>[1]["related_to"]
            >["entity_type"],
            name: flags["related-name"],
            package: flags["related-package"],
          }
        : undefined,
      view: readViewFlag(flags.view),
    });

    await writeSupportOutput(payload, flags, io, formatDiscovery);
    return payload.decision ? 0 : 10;
  } catch (error) {
    io.writeStderr(
      `${error instanceof Error ? error.message : "Failed to discover Salt guidance."}\n`,
    );
    return 30;
  }
}
