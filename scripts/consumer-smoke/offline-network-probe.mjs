import { spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  BLOCKED_NETWORK_MODULES,
  BLOCKED_PROCESS_BINDINGS,
  OFFLINE_NETWORK_ERROR_PREFIX,
} from "./offline-network-surfaces.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const offlineNetworkGuardUrl = pathToFileURL(
  path.join(__dirname, "offline-network-guard.mjs"),
).href;

// The shipped MCP runtime supports no third-party HTTP client. Native Node
// transports and global web APIs are the complete loader-enforced boundary.
export const SUPPORTED_THIRD_PARTY_HTTP_CLIENT_PACKAGES = Object.freeze([]);

export function createOfflineNetworkProbeSource() {
  return [
    `const blocked = ${JSON.stringify(BLOCKED_NETWORK_MODULES)};`,
    `const marker = ${JSON.stringify(OFFLINE_NETWORK_ERROR_PREFIX)};`,
    `const blockedBindings = ${JSON.stringify(BLOCKED_PROCESS_BINDINGS)};`,
    "const failures = [];",
    'const nodeModule = await import("node:module");',
    "const require = nodeModule.createRequire(import.meta.url);",
    "for (const specifier of blocked) {",
    '  for (const [mode, attempt] of [["esm", () => import(specifier)], ["cjs", () => require(specifier)]]) {',
    "    try { await attempt(); failures.push(`${mode}:${specifier}:allowed`); }",
    "    catch (error) { if (!String(error?.message).includes(marker)) failures.push(`${mode}:${specifier}:wrong-error`); }",
    "  }",
    "  try { process.getBuiltinModule(specifier); failures.push(`getBuiltin:${specifier}:allowed`); }",
    "  catch (error) { if (!String(error?.message).includes(marker)) failures.push(`getBuiltin:${specifier}:wrong-error`); }",
    "}",
    "try { process.dlopen({}, 'blocked'); failures.push('process.dlopen:allowed'); }",
    "catch (error) { if (!String(error?.message).includes(marker)) failures.push('process.dlopen:wrong-error'); }",
    "try { process.execve('blocked', [], {}); failures.push('process.execve:allowed'); }",
    "catch (error) { if (!String(error?.message).includes(marker)) failures.push('process.execve:wrong-error'); }",
    "for (const binding of blockedBindings) {",
    "  try { process.binding(binding); failures.push(`process.binding:${binding}:allowed`); }",
    "  catch (error) { if (!String(error?.message).includes(marker)) failures.push(`process.binding:${binding}:wrong-error`); }",
    "}",
    'for (const [name, attempt] of [["register", () => nodeModule.register(\'data:text/javascript,export{}\')], ["registerHooks", () => nodeModule.registerHooks({ resolve(specifier, context, nextResolve) { return nextResolve(specifier, context); } })]]) {',
    "  try { attempt(); failures.push(`node:module.${name}:allowed`); }",
    "  catch (error) { if (!String(error?.message).includes(marker)) failures.push(`node:module.${name}:wrong-error`); }",
    "}",
    'for (const [name, attempt] of [["fetch", () => fetch("data:text/plain,blocked")], ["websocket", () => new WebSocket("data:text/plain,blocked")], ["eventsource", () => new EventSource("data:text/plain,blocked")]]) {',
    "  try { await attempt(); failures.push(`${name}:allowed`); }",
    "  catch (error) { if (!String(error?.message).includes(marker)) failures.push(`${name}:wrong-error`); }",
    "}",
    'await import("node:path");',
    'if (failures.length) throw new Error(`guard allowed: ${failures.join(", ")}`);',
  ].join("\n");
}

export function runOfflineNetworkGuardSelfTest() {
  const result = spawnSync(
    process.execPath,
    [
      "--import",
      offlineNetworkGuardUrl,
      "--input-type=module",
      "--eval",
      createOfflineNetworkProbeSource(),
    ],
    { encoding: "utf8" },
  );
  if (result.status !== 0) {
    throw new Error(
      `Offline network guard self-test failed.\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`,
    );
  }
}

export function runOfflineScannerWorkerContainmentSelfTest() {
  const source = [
    'const { Worker } = await import("node:worker_threads");',
    "let blocked = false;",
    "try { new Worker('data:text/javascript,export{}', { type: 'module' }); }",
    `catch (error) { blocked = String(error?.message).includes(${JSON.stringify(OFFLINE_NETWORK_ERROR_PREFIX)}); }`,
    "if (!blocked) throw new Error('nested scanner Worker was allowed');",
  ].join("\n");
  const result = spawnSync(
    process.execPath,
    [
      "--import",
      offlineNetworkGuardUrl,
      "--input-type=module",
      "--eval",
      source,
    ],
    {
      encoding: "utf8",
      env: {
        ...process.env,
        SALT_OFFLINE_ALLOW_SCANNER_WORKER: "1",
        SALT_SCANNER_WORKER_CONTEXT: "1",
      },
    },
  );
  if (result.status !== 0) {
    throw new Error(
      `Offline scanner containment self-test failed.\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`,
    );
  }
}
