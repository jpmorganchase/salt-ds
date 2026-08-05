import Module, { register, syncBuiltinESMExports } from "node:module";
import {
  BLOCKED_NETWORK_MODULES,
  BLOCKED_PROCESS_BINDINGS,
  blockedNetworkError,
} from "./offline-network-surfaces.mjs";

const blockedModules = new Set(BLOCKED_NETWORK_MODULES);
const blockedBindings = new Set(BLOCKED_PROCESS_BINDINGS);

const originalLoad = Module._load;
Module._load = function guardedLoad(request, parent, isMain) {
  if (blockedModules.has(request)) {
    throw blockedNetworkError(request);
  }
  return originalLoad.call(this, request, parent, isMain);
};

const originalGetBuiltinModule = process.getBuiltinModule.bind(process);
process.getBuiltinModule = function guardedGetBuiltinModule(specifier) {
  if (blockedModules.has(specifier)) {
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
