import { runDoctorCommand } from "./commands/doctor.js";
import { runExportContextCommand } from "./commands/exportContext.js";
import { runInfoCommand } from "./commands/info.js";
import { runInitCommand } from "./commands/init.js";
import { runRuntimeInspectCommand } from "./commands/runtimeInspect.js";
import {
  runDiscoverSaltCommand,
  runGetSaltEntityCommand,
  runGetSaltExamplesCommand,
} from "./commands/support.js";
import { runCreateCommand } from "./commands/workflow/create/index.js";
import { runMigrateCommand } from "./commands/workflow/migrate/index.js";
import { runReviewCommand } from "./commands/workflow/review/index.js";
import { runUpgradeCommand } from "./commands/workflow/upgrade/index.js";
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

  if (command === "create") {
    return runCreateCommand(positionals, flags, normalizedIo);
  }

  if (command === "review") {
    return runReviewCommand(positionals, flags, normalizedIo);
  }

  if (command === "migrate") {
    return runMigrateCommand(positionals, flags, normalizedIo);
  }

  if (command === "upgrade") {
    return runUpgradeCommand(positionals, flags, normalizedIo);
  }

  if (command === "export-context") {
    return runExportContextCommand(positionals, flags, normalizedIo);
  }

  if (command === "get_salt_entity" || command === "get-salt-entity") {
    return runGetSaltEntityCommand(positionals, flags, normalizedIo);
  }

  if (command === "get_salt_examples" || command === "get-salt-examples") {
    return runGetSaltExamplesCommand(positionals, flags, normalizedIo);
  }

  if (command === "discover_salt" || command === "discover-salt") {
    return runDiscoverSaltCommand(positionals, flags, normalizedIo);
  }

  if (command === "runtime" && positionals[0] === "inspect") {
    return runRuntimeInspectCommand(positionals, flags, normalizedIo);
  }

  if (command === "lint") {
    normalizedIo.writeStderr(
      "salt-ds lint has been removed. Use `salt-ds review [target ...]` for source validation and structured fix guidance.\n",
    );
    return 1;
  }

  normalizedIo.writeStderr(
    `Unknown command: ${command}. Run \`salt-ds help\` for usage.\n`,
  );
  return 1;
}
