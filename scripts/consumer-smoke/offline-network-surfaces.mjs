export const OFFLINE_NETWORK_ERROR_PREFIX =
  "Offline smoke blocked network usage";

export const BLOCKED_NETWORK_MODULES = Object.freeze([
  "http",
  "http2",
  "https",
  "inspector",
  "inspector/promises",
  "child_process",
  "cluster",
  "worker_threads",
  "dgram",
  "dns",
  "dns/promises",
  "net",
  "tls",
  "_http_agent",
  "_http_client",
  "_http_common",
  "_http_incoming",
  "_http_outgoing",
  "_http_server",
  "_tls_common",
  "_tls_wrap",
  "node:http",
  "node:http2",
  "node:https",
  "node:inspector",
  "node:inspector/promises",
  "node:child_process",
  "node:cluster",
  "node:worker_threads",
  "node:dgram",
  "node:dns",
  "node:dns/promises",
  "node:net",
  "node:tls",
  "node:_http_agent",
  "node:_http_client",
  "node:_http_common",
  "node:_http_incoming",
  "node:_http_outgoing",
  "node:_http_server",
  "node:_tls_common",
  "node:_tls_wrap",
]);

export const BLOCKED_PROCESS_BINDINGS = Object.freeze([
  "cares_wrap",
  "http_parser",
  "pipe_wrap",
  "process_wrap",
  "spawn_sync",
  "tcp_wrap",
  "tls_wrap",
  "udp_wrap",
]);

export function blockedNetworkError(surface) {
  return new Error(
    `${OFFLINE_NETWORK_ERROR_PREFIX} through ${surface}. Public Salt tooling must not use network after install.`,
  );
}
