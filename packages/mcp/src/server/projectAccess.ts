import fs from "node:fs/promises";
import path from "node:path";

export const MAX_PROJECT_ROOTS = 16;

export interface ConfiguredProjectRoot {
  index: number;
  rootDir: string;
}

export class SaltMcpProjectRootError extends Error {
  readonly code:
    | "SALT_MCP_NO_PROJECT_ROOT"
    | "SALT_MCP_PROJECT_ROOT_AMBIGUOUS"
    | "SALT_MCP_PROJECT_ROOT_INVALID";

  constructor(code: SaltMcpProjectRootError["code"], message: string) {
    super(message);
    this.name = "SaltMcpProjectRootError";
    this.code = code;
  }
}

async function canonicalDirectory(input: string): Promise<string> {
  const requested = path.resolve(input);
  let canonical: string;
  try {
    canonical = await fs.realpath(requested);
  } catch {
    throw new SaltMcpProjectRootError(
      "SALT_MCP_PROJECT_ROOT_INVALID",
      `Configured project root is unavailable: ${requested}.`,
    );
  }
  const stats = await fs.lstat(canonical);
  if (!stats.isDirectory() || stats.isSymbolicLink()) {
    throw new SaltMcpProjectRootError(
      "SALT_MCP_PROJECT_ROOT_INVALID",
      `Configured project root is not a canonical directory: ${requested}.`,
    );
  }
  return canonical;
}

export async function configureProjectRoots(
  projectRoots: readonly string[],
): Promise<readonly ConfiguredProjectRoot[]> {
  if (projectRoots.length > MAX_PROJECT_ROOTS) {
    throw new SaltMcpProjectRootError(
      "SALT_MCP_PROJECT_ROOT_INVALID",
      `Salt MCP accepts at most ${MAX_PROJECT_ROOTS} configured project roots.`,
    );
  }
  const canonical = await Promise.all(projectRoots.map(canonicalDirectory));
  const unique = [...new Set(canonical)];
  return Object.freeze(
    unique.map((rootDir, index) => Object.freeze({ index, rootDir })),
  );
}

export function selectProjectRoot(
  roots: readonly ConfiguredProjectRoot[],
  requestedIndex: number | undefined,
): ConfiguredProjectRoot {
  if (roots.length === 0) {
    throw new SaltMcpProjectRootError(
      "SALT_MCP_NO_PROJECT_ROOT",
      "This operation needs a project root. Restart salt-mcp with --root <path> or pass projectRoots to createSaltMcpServer().",
    );
  }
  if (requestedIndex === undefined && roots.length > 1) {
    throw new SaltMcpProjectRootError(
      "SALT_MCP_PROJECT_ROOT_AMBIGUOUS",
      "Multiple project roots are configured; select one with project_root_index.",
    );
  }
  const index = requestedIndex ?? 0;
  const selected = roots[index];
  if (!selected) {
    throw new SaltMcpProjectRootError(
      "SALT_MCP_PROJECT_ROOT_INVALID",
      `project_root_index ${index} does not identify a configured root.`,
    );
  }
  return selected;
}
