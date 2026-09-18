const dns = require("node:dns");
const http = require("node:http");
const https = require("node:https");
const net = require("node:net");
const tls = require("node:tls");

if (process.env.SALT_SAMPLE_APP_OFFLINE_GUARD !== "1") {
  throw new Error(
    "The Salt sample-app offline guard requires explicit activation.",
  );
}

const loopbackHosts = new Set(["127.0.0.1", "::1", "[::1]", "localhost"]);

function normalizedHost(value) {
  return typeof value === "string"
    ? value.trim().toLowerCase().replace(/\.$/u, "")
    : null;
}

function blocked(host) {
  const error = new Error(
    `SALT_SAMPLE_APP_NETWORK_BLOCKED: ${host ?? "unknown-host"}`,
  );
  error.code = "SALT_SAMPLE_APP_NETWORK_BLOCKED";
  return error;
}

function assertHost(host) {
  const normalized = normalizedHost(host);
  if (
    normalized === null ||
    normalized === "" ||
    loopbackHosts.has(normalized)
  ) {
    return;
  }
  throw blocked(normalized);
}

function requestHost(input) {
  if (input instanceof URL) return input.hostname;
  if (typeof input === "string") {
    try {
      return new URL(input).hostname;
    } catch {
      return null;
    }
  }
  if (input && typeof input === "object") {
    return input.hostname ?? input.host ?? null;
  }
  return null;
}

function wrapRequest(module, method) {
  const original = module[method];
  module[method] = function guardedRequest(...args) {
    assertHost(requestHost(args[0]));
    return original.apply(this, args);
  };
}

wrapRequest(http, "request");
wrapRequest(http, "get");
wrapRequest(https, "request");
wrapRequest(https, "get");

function socketHost(args) {
  if (args[0] && typeof args[0] === "object") {
    return args[0].host ?? args[0].hostname ?? null;
  }
  if (typeof args[0] === "number") {
    return typeof args[1] === "string" ? args[1] : "localhost";
  }
  return null;
}

for (const [module, method] of [
  [net, "connect"],
  [net, "createConnection"],
  [tls, "connect"],
]) {
  const original = module[method];
  module[method] = function guardedSocket(...args) {
    assertHost(socketHost(args));
    return original.apply(this, args);
  };
}

for (const method of [
  "lookup",
  "resolve",
  "resolve4",
  "resolve6",
  "resolveAny",
  "resolveCaa",
  "resolveCname",
  "resolveMx",
  "resolveNaptr",
  "resolveNs",
  "resolvePtr",
  "resolveSoa",
  "resolveSrv",
  "resolveTxt",
]) {
  const original = dns[method];
  if (typeof original !== "function") continue;
  dns[method] = function guardedDns(host, ...args) {
    assertHost(host);
    return original.call(this, host, ...args);
  };
}

const originalFetch = globalThis.fetch;
globalThis.fetch = async function guardedFetch(input, init) {
  assertHost(requestHost(input));
  return originalFetch(input, init);
};
