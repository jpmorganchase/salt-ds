import {
  BLOCKED_NETWORK_MODULES,
  blockedNetworkError,
} from "./offline-network-surfaces.mjs";

const blockedModules = new Set(BLOCKED_NETWORK_MODULES);

export async function resolve(specifier, context, nextResolve) {
  if (blockedModules.has(specifier)) {
    throw blockedNetworkError(specifier);
  }
  return nextResolve(specifier, context);
}
