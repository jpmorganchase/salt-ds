import { runDoctorCommand } from "./commands/doctor.js";
import { runExportContextCommand } from "./commands/exportContext.js";
import { runInfoCommand } from "./commands/info.js";
import { runInitCommand } from "./commands/init.js";
import { runRuntimeInspectCommand } from "./commands/runtimeInspect.js";
import { runReviewHookCommand } from "./commands/workflow/review/hook/index.js";
import { runVerifyAttestationsCommand } from "./commands/workflow/review/verify/index.js";
import { parseArgs, printHelp } from "./lib/args.js";
import type { CliIo, RequiredCliIo } from "./types.js";

function normalizeIo(io: CliIo): RequiredCliIo {
  const writeStdout =
    io.writeStdout ?? ((message: string) => process.stdout.write(message));
  const writeStderr =
    io.writeStderr ?? ((message: string) => process.stderr.write(message));

  return {
    cwd: io.cwd ?? process.cwd(),
    writeStdout,
    writeStderr,
    stdin: io.stdin,
  };
}

export async function runCli(
  argv: string[] = process.argv.slice(2),
  io: CliIo = {},
): Promise<number> {
  const normalizedIo = normalizeIo(io);
  const { command, positionals, flags } = parseArgs(argv);

  if (command === "help" || flags.help === "true") {
    const helpCommand = command === "help" ? positionals[0] : command;
    return printHelp(normalizedIo.writeStdout, helpCommand);
  }

  if (command === "doctor") {
    return runDoctorCommand(positionals, flags, normalizedIo);
  }

  if (command === "info") {
    return runInfoCommand(positionals, flags, normalizedIo);
  }

  if (command === "init") {
    return runInitCommand(positionals, flags, normalizedIo);
  }

  if (command === "export-context") {
    return runExportContextCommand(positionals, flags, normalizedIo);
  }

  if (command === "hook") {
    return runReviewHookCommand(positionals, flags, normalizedIo);
  }

  if (command === "verify") {
    return runVerifyAttestationsCommand(flags, { io: normalizedIo });
  }

  if (command === "runtime" && positionals[0] === "inspect") {
    return runRuntimeInspectCommand(positionals, flags, normalizedIo);
  }

  if (command === "lint") {
    normalizedIo.writeStderr(
      "salt-ds lint has been removed. Use the `review_salt_ui` MCP tool for source validation and structured fix guidance.\n",
    );
    return 1;
  }

  if (
    command === "create" ||
    command === "review" ||
    command === "migrate" ||
    command === "upgrade"
  ) {
    normalizedIo.writeStderr(
      `salt-ds ${command} has been removed. The Salt workflow commands now live exclusively in the @salt-ds/mcp server (tool: ${
        command === "create"
          ? "create_salt_ui"
          : command === "review"
            ? "review_salt_ui"
            : command === "migrate"
              ? "migrate_to_salt"
              : "upgrade_salt_ui"
      }). The CLI keeps doctor / info / init / export-context / hook / verify / runtime inspect for support-tier use.\n`,
    );
    return 1;
  }

  normalizedIo.writeStderr(
    `Unknown command: ${command}. Run \`salt-ds help\` for usage.\n`,
  );
  return 1;
}
