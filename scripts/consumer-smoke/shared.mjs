import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const repoRoot = path.resolve(__dirname, "..", "..");
export const distMcpDir = path.join(repoRoot, "dist", "salt-ds-mcp");
export const defaultSkillsSource = path.join(repoRoot, "packages", "skills");

export function getExecutable(name) {
  return process.platform === "win32" ? `${name}.cmd` : name;
}

export function getInstalledMcpBin(rootDir) {
  return path.join(
    rootDir,
    "node_modules",
    "@salt-ds",
    "mcp",
    "bin",
    "salt-mcp.js",
  );
}

export function parseArgs(argv) {
  const flags = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) {
      continue;
    }

    const key = token.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      flags[key] = "true";
      continue;
    }

    flags[key] = next;
    index += 1;
  }

  const published = flags.published === "true";
  const skillsSource = flags["skills-source"];
  const expectedSkillTreeHash = flags["expected-skill-tree-hash"];
  const result = {
    published,
    keepTemp: flags["keep-temp"] === "true",
    skipBuild: flags["skip-build"] === "true",
    skillsSource: published
      ? skillsSource
      : skillsSource
        ? path.resolve(skillsSource)
        : defaultSkillsSource,
    expectedSkillTreeHash,
    mcpSpec: flags["mcp-spec"],
    expectedVersion: flags["expected-version"],
    expectedGitHead: flags["expected-git-head"],
  };

  if (!published) {
    assert(
      !result.mcpSpec &&
        !result.expectedVersion &&
        !result.expectedGitHead &&
        !result.expectedSkillTreeHash,
      "Published identity options require --published.",
    );
    return result;
  }

  assert(result.mcpSpec, "Published smoke requires --mcp-spec.");
  assert(
    result.expectedVersion,
    "Published smoke requires --expected-version.",
  );
  assert(
    result.expectedGitHead,
    "Published smoke requires --expected-git-head.",
  );
  const specMatch = result.mcpSpec.match(
    /^@salt-ds\/mcp@(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)$/u,
  );
  assert(
    specMatch && !/snapshot/iu.test(result.mcpSpec),
    "Published --mcp-spec must be an exact non-snapshot @salt-ds/mcp version.",
  );
  assert(
    specMatch[1] === result.expectedVersion,
    "--mcp-spec and --expected-version must identify the same version.",
  );
  assert(
    /^[0-9a-f]{40}$/u.test(result.expectedGitHead),
    "--expected-git-head must be a full lowercase 40-character commit SHA.",
  );
  assert(
    Boolean(result.skillsSource) === Boolean(result.expectedSkillTreeHash),
    "Published skill source and expected tree hash must be supplied together.",
  );
  if (result.skillsSource) {
    assert(
      /^https:\/\/github\.com\/jpmorganchase\/salt-ds\/tree\/[0-9a-f]{40}\/packages\/skills\/?$/u.test(
        result.skillsSource,
      ),
      "Published --skills-source must use the immutable Salt GitHub tree URL with a full commit SHA.",
    );
    assert(
      /^[0-9a-f]{64}$/u.test(result.expectedSkillTreeHash),
      "--expected-skill-tree-hash must be a lowercase SHA-256 digest.",
    );
  }

  return result;
}

export function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

export async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

export async function runCommand(command, args, options = {}) {
  const {
    cwd = repoRoot,
    env = {},
    label = `${command} ${args.join(" ")}`,
    acceptableExitCodes = [0],
  } = options;

  return new Promise((resolve, reject) => {
    const useWindowsCmdShim =
      process.platform === "win32" && command.toLowerCase().endsWith(".cmd");
    const quoteWindowsArg = (value) =>
      /[\s"]/u.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
    const commandLine = useWindowsCmdShim
      ? [command, ...args.map(quoteWindowsArg)].join(" ")
      : null;
    const child = spawn(
      useWindowsCmdShim ? (process.env.ComSpec ?? "cmd.exe") : command,
      useWindowsCmdShim ? ["/d", "/s", "/c", commandLine] : args,
      {
        cwd,
        env: { ...process.env, ...env },
        stdio: ["ignore", "pipe", "pipe"],
        windowsHide: true,
      },
    );

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (acceptableExitCodes.includes(code ?? -1)) {
        resolve({ stdout, stderr, exitCode: code ?? 0 });
        return;
      }

      reject(
        new Error(
          `${label} failed with exit code ${code}\nstdout:\n${stdout}\nstderr:\n${stderr}`,
        ),
      );
    });
  });
}

export function startServer(html) {
  return new Promise((resolve) => {
    const server = http.createServer((_request, response) => {
      response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      response.end(html);
    });

    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (address && typeof address === "object") {
        resolve({
          server,
          url: `http://127.0.0.1:${address.port}/`,
        });
      }
    });
  });
}

export async function closeServer(server) {
  await new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}
