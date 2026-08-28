import Module, { register, syncBuiltinESMExports } from "node:module";
import {
  BLOCKED_NETWORK_MODULES,
  BLOCKED_PROCESS_BINDINGS,
  blockedNetworkError,
} from "./offline-network-surfaces.mjs";

const blockedModules = new Set(BLOCKED_NETWORK_MODULES);
const blockedBindings = new Set(BLOCKED_PROCESS_BINDINGS);
const workerModules = new Set(["worker_threads", "node:worker_threads"]);
const allowsNamedScannerWorker =
  process.env.SALT_OFFLINE_ALLOW_SCANNER_WORKER === "1";
const isScannerWorker = process.env.SALT_SCANNER_WORKER_CONTEXT === "1";

function isBlockedModule(request) {
  return (
    blockedModules.has(request) &&
    !(allowsNamedScannerWorker && workerModules.has(request))
  );
}

const originalLoad = Module._load;
Module._load = function guardedLoad(request, parent, isMain) {
  if (isBlockedModule(request)) {
    throw blockedNetworkError(request);
  }
  return originalLoad.call(this, request, parent, isMain);
};

const originalGetBuiltinModule = process.getBuiltinModule.bind(process);
process.getBuiltinModule = function guardedGetBuiltinModule(specifier) {
  if (isBlockedModule(specifier)) {
    throw blockedNetworkError(`process.getBuiltinModule(${specifier})`);
  }
  return originalGetBuiltinModule(specifier);
};

register(new URL("./offline-network-hook.mjs", import.meta.url));

Module.register = function blockedModuleRegister() {
  throw blockedNetworkError("node:module.register");
};
Module.registerHooks = function blockedModuleRegisterHooks() {
  throw blockedNetworkError("node:module.registerHooks");
};

if (isScannerWorker) {
  const workerThreads = originalGetBuiltinModule("node:worker_threads");
  workerThreads.Worker = class BlockedNestedScannerWorker {
    constructor() {
      throw blockedNetworkError("nested scanner Worker");
    }
  };
}
syncBuiltinESMExports();

process.dlopen = function blockedDlopen() {
  throw blockedNetworkError("process.dlopen");
};

process.execve = function blockedExecve() {
  throw blockedNetworkError("process.execve");
};

const originalBinding = process.binding.bind(process);
process.binding = function guardedBinding(name) {
  if (blockedBindings.has(name)) {
    throw blockedNetworkError(`process.binding(${name})`);
  }
  return originalBinding(name);
};

globalThis.fetch = async function blockedFetch() {
  throw blockedNetworkError("fetch");
};

globalThis.WebSocket = class BlockedWebSocket {
  constructor() {
    throw blockedNetworkError("WebSocket");
  }
};

globalThis.EventSource = class BlockedEventSource {
  constructor() {
    throw blockedNetworkError("EventSource");
  }
};
