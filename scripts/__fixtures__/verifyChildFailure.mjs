import { runCommands } from "../verifyRunner.mjs";

try {
  await runCommands([
    {
      label: "Fixture child",
      command: process.execPath,
      args: ["-e", "process.exit(23)"],
    },
  ]);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
