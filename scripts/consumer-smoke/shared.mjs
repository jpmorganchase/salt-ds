import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const REPLACE_PROCESS_ENVIRONMENT = Symbol(
  "salt.consumer-smoke.replace-process-environment",
);

const WINDOWS_CMD_META_CHARACTERS = /([()\][%!^"`<>&|;, *?])/gu;

function escapeWindowsCommand(value) {
  return String(value).replace(WINDOWS_CMD_META_CHARACTERS, "^$1");
}

function escapeWindowsArgument(value, doubleEscapeMetaCharacters = false) {
  let escaped = String(value)
    .replace(/(?=(\\+?)?)\1"/gu, '$1$1\\"')
    .replace(/(?=(\\+?)?)\1$/gu, "$1$1");
  escaped = `"${escaped}"`.replace(WINDOWS_CMD_META_CHARACTERS, "^$1");
  return doubleEscapeMetaCharacters
    ? escaped.replace(WINDOWS_CMD_META_CHARACTERS, "^$1")
    : escaped;
}

export function createWindowsCmdInvocation(command, args) {
  const doubleEscapeMetaCharacters = /\.cmd$/iu.test(command);
  const commandLine = [
    escapeWindowsCommand(command),
    ...args.map((arg) =>
      escapeWindowsArgument(arg, doubleEscapeMetaCharacters),
    ),
  ].join(" ");
  return {
    command: process.env.ComSpec ?? "cmd.exe",
    args: ["/d", "/s", "/c", `"${commandLine}"`],
    windowsVerbatimArguments: true,
  };
}

export const repoRoot = path.resolve(__dirname, "..", "..");
export const distMcpDir = path.join(repoRoot, "dist", "salt-ds-mcp");

const CONSUMER_SMOKE_OPTIONS = new Set([
  "published",
  "keep-temp",
  "skip-build",
  "mcp-spec",
  "expected-version",
  "expected-git-head",
]);

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
    assert(
      CONSUMER_SMOKE_OPTIONS.has(key),
      `Unknown consumer smoke option: --${key}.`,
    );
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      flags[key] = "true";
      continue;
    }

    flags[key] = next;
    index += 1;
  }

  const published = flags.published === "true";
  const result = {
    published,
    keepTemp: flags["keep-temp"] === "true",
    skipBuild: flags["skip-build"] === "true",
    mcpSpec: flags["mcp-spec"],
    expectedVersion: flags["expected-version"],
    expectedGitHead: flags["expected-git-head"],
  };

  if (!published) {
    assert(
      !result.mcpSpec && !result.expectedVersion && !result.expectedGitHead,
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
  return result;
}

export function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

export function createMcpSurfaceFingerprint({
  client,
  toolNames,
  manifestUri,
  manifest,
  resourceCount,
  resourceTemplate,
}) {
  const capabilities = client.getServerCapabilities()?.resources;
  return {
    server: client.getServerVersion(),
    protocol_era: client.getProtocolEra(),
    protocol_revision: client.getNegotiatedProtocolVersion(),
    resource_capabilities: {
      subscribe: capabilities?.subscribe ?? null,
      listChanged: capabilities?.listChanged ?? null,
    },
    tool_names: toolNames,
    manifest_uri: manifestUri,
    catalog_version: manifest.catalog_version,
    semantic_digest: manifest.semantic_digest,
    supported_mcp_protocol_revisions: manifest.supported_mcp_protocol_revisions,
    families: manifest.families.map((family) => ({
      family: family.family,
      record_count: family.record_count,
    })),
    resource_count: resourceCount,
    resource_template: resourceTemplate,
  };
}

function structuredToolPayload(result, name) {
  assert(result?.isError !== true, `${name} returned an MCP tool error.`);
  assert(
    result?.structuredContent && typeof result.structuredContent === "object",
    `${name} omitted structured content.`,
  );
  return result.structuredContent;
}

export async function createMcpToolSemanticFingerprint(client, projectRoot) {
  const searchResult = await client.callTool({
    name: "search_salt",
    arguments: {
      query: "Button",
      families: ["component"],
      statuses: ["stable"],
      limit: 3,
    },
  });
  const search = structuredToolPayload(searchResult, "search_salt");
  const button = search.data?.matches?.find(
    (match) => match.title === "Button",
  );
  assert(
    button?.evidence?.matched_fields?.includes("title") &&
      button?.provenance?.resource_uri === button.uri &&
      /^salt:\/\/catalog\/v2\/sha256-[0-9a-f]{64}\//u.test(button.uri) &&
      search.coverage?.matched_documents ===
        search.data?.ambiguity?.candidate_count,
    "search_salt omitted its expected Button match evidence or provenance.",
  );
  const searchText = searchResult.content?.find(
    (part) => part.type === "text",
  )?.text;
  for (const match of search.data.matches) {
    assert(
      searchText?.includes(match.id) &&
        searchText?.includes(match.uri) &&
        searchResult.content.some(
          (part) => part.type === "resource_link" && part.uri === match.uri,
        ),
      "search_salt text/resource-link fallback diverged from structured matches.",
    );
  }

  const inspectionResult = await client.callTool({
    name: "inspect_salt_project",
    arguments: { root_dir: projectRoot, include_policy_ir: true },
  });
  const inspection = structuredToolPayload(
    inspectionResult,
    "inspect_salt_project",
  );
  const inspectionText = inspectionResult.content?.find(
    (part) => part.type === "text",
  )?.text;
  const expectedInspectionText = structuredClone(inspection);
  if (
    expectedInspectionText.data?.installation?.untrusted_project_data
      ?.resolved_packages
  ) {
    expectedInspectionText.data.installation.untrusted_project_data.resolved_packages =
      [];
  }
  assert(
    inspectionText &&
      JSON.stringify(JSON.parse(inspectionText)) ===
        JSON.stringify(expectedInspectionText),
    "inspect_salt_project text fallback did not redact only raw dependency facts.",
  );
  const resolvedPackages = [
    ...(inspection.data.installation?.untrusted_project_data
      ?.resolved_packages ?? []),
  ].sort((left, right) => left.name.localeCompare(right.name));
  assert(
    inspection.data.package_manifest?.name === "salt-consumer-smoke-existing" &&
      inspection.data.package_manifest?.package_manager === "npm" &&
      inspection.data.installation?.untrusted_project_data?.classification ===
        "untrusted_project_data" &&
      inspection.data.installation?.untrusted_project_data
        ?.instruction_authority === "none" &&
      resolvedPackages.some(
        (entry) =>
          entry.name === "@salt-ds/core" && entry.declared_version === "1.67.0",
      ) &&
      resolvedPackages.some(
        (entry) =>
          entry.name === "@salt-ds/theme" &&
          entry.declared_version === "1.43.0",
      ) &&
      inspection.data.policy?.mode === "team" &&
      inspection.scope?.kind === "configured_project_inspection" &&
      inspection.scope?.filesystem_access === "read_only" &&
      inspection.coverage?.requested_root === "evaluated" &&
      inspection.coverage?.policy === "policy_ir_evaluated",
    "inspect_salt_project omitted expected fixture facts or bounded coverage.",
  );

  const submitted = [
    'import { Button } from "@salt-ds/core";',
    "export function Demo() {",
    '  return <Button href="/next">Go</Button>;',
    "}",
  ].join("\n");
  const reviewResult = await client.callTool({
    name: "review_salt_code",
    arguments: {
      artifacts: [{ id: "demo.tsx", language: "tsx", text: submitted }],
    },
  });
  const review = structuredToolPayload(reviewResult, "review_salt_code");
  const reviewText = reviewResult.content?.find(
    (part) => part.type === "text",
  )?.text;
  assert(
    reviewText &&
      JSON.stringify(JSON.parse(reviewText)) === JSON.stringify(review),
    "review_salt_code text fallback diverged from structured content.",
  );
  const reviewed = review.data.results?.[0];
  assert(
    reviewed?.artifact?.id === "demo.tsx" &&
      reviewed?.artifact?.utf8_bytes === Buffer.byteLength(submitted, "utf8") &&
      /^sha256:[0-9a-f]{64}$/u.test(reviewed?.artifact?.content_digest) &&
      reviewed?.outcome === "findings" &&
      reviewed.findings.length > 0 &&
      reviewed.coverage?.parser === "babel" &&
      review.scope?.kind === "submitted_text_only",
    "review_salt_code omitted the expected grounded fixture finding.",
  );
  for (const finding of reviewed.findings) {
    for (const citation of finding.evidence.references.flatMap((reference) =>
      reference.locator ? [reference.locator] : [],
    )) {
      assert(
        /^(?:salt:\/\/(?:catalog\/v2\/sha256-[0-9a-f]{64}|project-policy\/v2\/[A-Za-z0-9_-]+\/sha256-[0-9a-f]{64})\/|https:\/\/)/u.test(
          citation,
        ),
        `review_salt_code returned a non-public citation: ${citation}`,
      );
    }
  }

  return {
    search: {
      scope: search.scope,
      coverage: search.coverage,
      ambiguity: search.data.ambiguity,
      matches: search.data.matches.map((match) => ({
        family: match.family,
        id: match.id,
        title: match.title,
        uri: match.uri,
        evidence: match.evidence,
        provenance_uri: match.provenance.resource_uri,
      })),
      provenance: search.provenance,
    },
    inspection: {
      scope: {
        kind: inspection.scope.kind,
        filesystem_access: inspection.scope.filesystem_access,
      },
      coverage: inspection.coverage,
      package_manifest: inspection.data.package_manifest,
      resolved_packages: resolvedPackages,
      workspace_kind: inspection.data.workspace?.kind ?? null,
      policy_mode: inspection.data.policy?.mode ?? null,
    },
    review: {
      scope: review.scope,
      coverage: review.coverage,
      artifact: reviewed.artifact,
      outcome: reviewed.outcome,
      findings: reviewed.findings.map((finding) => ({
        id: finding.id,
        rule_id: finding.rule_id,
        severity: finding.severity,
        submitted_artifact_id: finding.evidence.submitted_artifact_id,
        references: finding.evidence.references
          .map((reference) => ({
            locator: reference.locator,
            field_path: reference.field_path,
          }))
          .sort((left, right) =>
            `${left.locator}:${left.field_path}`.localeCompare(
              `${right.locator}:${right.field_path}`,
            ),
          ),
      })),
      provenance: review.provenance,
    },
  };
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
    timeoutMs = 5 * 60 * 1000,
  } = options;

  if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1) {
    throw new Error(
      `Command timeout must be a positive integer; received ${timeoutMs}.`,
    );
  }

  return new Promise((resolve, reject) => {
    const useWindowsCmdShim =
      process.platform === "win32" && command.toLowerCase().endsWith(".cmd");
    const windowsInvocation = useWindowsCmdShim
      ? createWindowsCmdInvocation(command, args)
      : null;
    const child = spawn(
      windowsInvocation?.command ?? command,
      windowsInvocation?.args ?? args,
      {
        cwd,
        env:
          env[REPLACE_PROCESS_ENVIRONMENT] === true
            ? env
            : { ...process.env, ...env },
        stdio: ["ignore", "pipe", "pipe"],
        windowsHide: true,
        windowsVerbatimArguments:
          windowsInvocation?.windowsVerbatimArguments ?? false,
      },
    );

    let stdout = "";
    let stderr = "";
    let timedOut = false;
    let settled = false;
    const finish = (callback) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      callback();
    };
    const timeout = setTimeout(() => {
      timedOut = true;
      child.kill();
    }, timeoutMs);
    timeout.unref();

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", (error) => finish(() => reject(error)));
    child.on("close", (code) => {
      if (timedOut) {
        finish(() =>
          reject(
            new Error(
              `${label} exceeded its ${timeoutMs}ms timeout and was terminated.\nstdout:\n${stdout}\nstderr:\n${stderr}`,
            ),
          ),
        );
        return;
      }
      if (acceptableExitCodes.includes(code ?? -1)) {
        finish(() => resolve({ stdout, stderr, exitCode: code ?? 0 }));
        return;
      }

      finish(() =>
        reject(
          new Error(
            `${label} failed with exit code ${code}\nstdout:\n${stdout}\nstderr:\n${stderr}`,
          ),
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
