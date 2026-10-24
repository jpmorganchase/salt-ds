// salt-ds: sets up coding agents with an application's installed Salt docs,
// and checks Salt code against them. What it reads, the docs and check data,
// ships in each installed Salt package, so it matches the installed versions.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { run as init } from "./agents-md.mjs";
import { run as check } from "./salt-check.mjs";

const CHECK_COMMAND = "salt-ds check";

const USAGE = `Usage: salt-ds <command> [options]

Commands:
  init    Add an index of your installed Salt docs to AGENTS.md, import it from
          CLAUDE.md, and with --copilot add it to Copilot's instructions
  check   Check Salt tokens, props and component parts against the installed docs

Both use the Salt packages installed for the application: the current folder,
or --project. Run "salt-ds <command> --help" for a command's options.`;

class UsageError extends Error {}

/** The value of `--name <value>` or `--name=<value>`, and the other args. */
function takeOption(args, name) {
  const rest = [];
  let value;
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === `--${name}`) {
      value = args[index + 1];
      if (!value || value.startsWith("--")) {
        throw new UsageError(`--${name} requires a value`);
      }
      index += 1;
    } else if (arg.startsWith(`--${name}=`)) {
      value = arg.slice(name.length + 3);
    } else {
      rest.push(arg);
    }
  }
  return { value, rest };
}

function declares(manifest, name) {
  return ["dependencies", "devDependencies", "optionalDependencies"].some(
    (field) => manifest[field]?.[name],
  );
}

/** The package.json whose script --script updates, read and parsed. */
function readScriptTarget(project) {
  const file = path.join(project, "package.json");
  if (!existsSync(file)) {
    throw new UsageError(`--script needs a package.json in ${project}`);
  }
  const text = readFileSync(file, "utf8");
  try {
    return { file, text, manifest: JSON.parse(text) };
  } catch (error) {
    throw new UsageError(`Cannot read ${file}: ${error.message}`);
  }
}

/** Makes the package.json script `name` end by running salt-ds check. */
function addCheckToScript({ target, name, check: checkOnly, log }) {
  const { file, text, manifest } = target;
  const current = manifest.scripts?.[name];
  if (current && /\bsalt-ds check\b/.test(current)) {
    log(`The ${name} script runs salt-ds check.`);
    return 0;
  }
  if (checkOnly) {
    log(`The ${name} script needs to run salt-ds check.`);
    return 1;
  }
  manifest.scripts = {
    ...manifest.scripts,
    [name]: current ? `${current} && ${CHECK_COMMAND}` : CHECK_COMMAND,
  };
  const indent = /^([ \t]+)"/m.exec(text)?.[1] ?? "  ";
  const eol = text.includes("\r\n") ? "\r\n" : "\n";
  writeFileSync(
    file,
    `${JSON.stringify(manifest, null, indent).replace(/\n/g, eol)}${eol}`,
  );
  log(
    `${current ? "Updated" : "Added"} the ${name} script to run salt-ds check.`,
  );
  if (!declares(manifest, "@salt-ds/cli")) {
    log(
      `Add @salt-ds/cli to devDependencies so the ${name} script can run salt-ds, for example with npm install --save-dev @salt-ds/cli.`,
    );
  }
  return 0;
}

function runInit(args, { log, cwd }) {
  const { value: scriptName, rest } = takeOption(args, "script");
  const help = rest.includes("--help") || rest.includes("-h");
  // The application whose package.json to update, as init selects it, read
  // before init writes anything so a missing or broken one changes nothing.
  const { value: project = takeOption(rest, "dir").value ?? "." } = takeOption(
    rest,
    "project",
  );
  const target =
    scriptName && !help
      ? readScriptTarget(path.resolve(cwd, project))
      : undefined;
  let code;
  try {
    code = init(rest, { log, cwd });
  } catch (error) {
    throw new UsageError(error.message);
  }
  if (help) return code;
  const checkOnly = rest.includes("--check");
  if (target) {
    return Math.max(
      code,
      addCheckToScript({ target, name: scriptName, check: checkOnly, log }),
    );
  }
  if (!checkOnly) {
    log(
      "Add --script typecheck (or lint) to run salt-ds check whenever that script runs, in CI or by an agent.",
    );
  }
  return code;
}

export async function run(
  args,
  { log = console.log, cwd = process.cwd() } = {},
) {
  try {
    const [command, ...rest] = args;
    if (command === "--version" || command === "-v") {
      const manifest = fileURLToPath(
        new URL("../package.json", import.meta.url),
      );
      log(JSON.parse(readFileSync(manifest, "utf8")).version);
      return 0;
    }
    if (!command || command === "--help" || command === "-h") {
      log(USAGE);
      return command ? 0 : 2;
    }
    if (command === "init") return runInit(rest, { log, cwd });
    if (command === "check") return check(rest, { log, cwd });
    throw new UsageError(`Unknown command: ${command}\n\n${USAGE}`);
  } catch (error) {
    if (!(error instanceof UsageError)) throw error;
    log(`salt-ds: ${error.message}`);
    return 2;
  }
}
