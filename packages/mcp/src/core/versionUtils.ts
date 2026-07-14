import semver from "semver";

const WORKSPACE_PROTOCOL_PREFIX = "workspace:";
const WORKSPACE_WILDCARD_RANGES = new Set(["*", "^", "~"]);

function stripWorkspaceProtocol(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (!trimmed.toLowerCase().startsWith(WORKSPACE_PROTOCOL_PREFIX)) {
    return trimmed;
  }

  const workspaceSpec = trimmed.slice(WORKSPACE_PROTOCOL_PREFIX.length).trim();
  if (!workspaceSpec || WORKSPACE_WILDCARD_RANGES.has(workspaceSpec)) {
    return null;
  }

  return workspaceSpec;
}

export function normalizeComparableVersion(
  value: string | null | undefined,
): string | null {
  if (!value) {
    return null;
  }

  const comparableValue = stripWorkspaceProtocol(value);
  if (!comparableValue) {
    return null;
  }

  try {
    return (
      semver.valid(comparableValue) ??
      semver.minVersion(comparableValue)?.version ??
      semver.coerce(comparableValue)?.version ??
      null
    );
  } catch {
    return semver.coerce(comparableValue)?.version ?? null;
  }
}
