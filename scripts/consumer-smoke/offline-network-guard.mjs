import Module from "node:module";

const blockedModules = new Set([
  "http",
  "https",
  "net",
  "tls",
  "node:http",
  "node:https",
  "node:net",
  "node:tls",
]);

function blockedError(surface) {
  return new Error(
    `Offline smoke blocked network usage through ${surface}. Public Salt MCP v1 calls must not use network after install.`,
  );
}

function createBlockedModule(request) {
  return new Proxy(
    {},
    {
      get(_target, property) {
        if (property === "__esModule") {
          return true;
        }
        throw blockedError(`${request}.${String(property)}`);
      },
      apply() {
        throw blockedError(request);
      },
    },
  );
}

const originalLoad = Module._load;
Module._load = function guardedLoad(request, parent, isMain) {
  if (blockedModules.has(request)) {
    return createBlockedModule(request);
  }
  return originalLoad.call(this, request, parent, isMain);
};

globalThis.fetch = async function blockedFetch() {
  throw blockedError("fetch");
};
