import semver from "semver";

const WORKSPACE_PROTOCOL_PREFIX = "workspace:";
const WORKSPACE_WILDCARD_RANGES = new Set(["*", "^", "~"]);

export const EXACT_SEMVER_PATTERN =
  /^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-(?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*)(?:\.(?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*))*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/u;

export function parseExactSemVer(
  value: string | null | undefined,
): string | null {
  if (!value || !EXACT_SEMVER_PATTERN.test(value)) return null;
  try {
    return semver.parse(value, { loose: false }) ? value : null;
  } catch {
    return null;
  }
}

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
      null
    );
  } catch {
    return null;
  }
}
