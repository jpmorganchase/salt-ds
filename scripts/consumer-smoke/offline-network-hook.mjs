import {
  BLOCKED_NETWORK_MODULES,
  blockedNetworkError,
} from "./offline-network-surfaces.mjs";

const blockedModules = new Set(BLOCKED_NETWORK_MODULES);
const workerModules = new Set(["worker_threads", "node:worker_threads"]);
const allowsNamedScannerWorker =
  process.env.SALT_OFFLINE_ALLOW_SCANNER_WORKER === "1";

export async function resolve(specifier, context, nextResolve) {
  if (
    blockedModules.has(specifier) &&
    !(allowsNamedScannerWorker && workerModules.has(specifier))
  ) {
    throw blockedNetworkError(specifier);
  }
  return nextResolve(specifier, context);
}
