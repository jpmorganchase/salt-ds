import { runDoctorCommand } from "./commands/doctor.js";
import { runInfoCommand } from "./commands/info.js";
import { runInitCommand } from "./commands/init.js";
import { runRuntimeInspectCommand } from "./commands/runtimeInspect.js";
import {
  runCreateCommand,
  runMigrateCommand,
  runReviewCommand,
  runUpgradeCommand,
} from "./commands/workflow.js";
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
  };
}

export async function runCli(
  argv: string[] = process.argv.slice(2),
  io: CliIo = {},
): Promise<number> {
  const normalizedIo = normalizeIo(io);
  const { command, positionals, flags } = parseArgs(argv);

  if (command === "help" || flags.help === "true") {
    return printHelp(normalizedIo.writeStdout);
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
