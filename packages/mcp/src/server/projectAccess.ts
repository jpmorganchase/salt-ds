import fs from "node:fs/promises";
import path from "node:path";

export type ProjectAccessOptions =
  | {
      mode: "restricted";
      allowedRoots: string[];
      defaultRoot?: string;
    }
  | {
      mode: "unrestricted_local_stdio";
      defaultRoot?: string;
    };

export type ProjectAccessPolicy =
  | {
      mode: "restricted";
      allowedRoots: string[];
      defaultRoot: string | null;
    }
  | {
      mode: "unrestricted_local_stdio";
      allowedRoots: null;
      defaultRoot: string;
    };

export type ProjectRootAuthorization =
  | {
      status: "authorized";
      rootDir: string;
      authorityRoot: string;
      mode: ProjectAccessPolicy["mode"];
    }
  | {
      status: "denied";
      reason:
        | "no_allowed_roots"
        | "no_default_root"
        | "outside_allowed_roots"
        | "unavailable"
        | "not_directory";
    };

function isPathInside(rootDir: string, candidatePath: string): boolean {
  const relative = path.relative(rootDir, candidatePath);
  return (
    relative === "" ||
    (!relative.startsWith(`..${path.sep}`) &&
      relative !== ".." &&
      !path.isAbsolute(relative))
  );
}

async function canonicalDirectory(directory: string): Promise<string> {
  const resolved = await fs.realpath(path.resolve(directory));
  const stats = await fs.stat(resolved);
  if (!stats.isDirectory()) {
    throw new Error(`Configured project root is not a directory: ${directory}`);
  }
  return resolved;
}

export async function createProjectAccessPolicy(
  options?: ProjectAccessOptions,
): Promise<ProjectAccessPolicy> {
  if (options?.mode === "unrestricted_local_stdio") {
    return {
      mode: "unrestricted_local_stdio",
      allowedRoots: null,
      defaultRoot: await canonicalDirectory(
        options.defaultRoot ?? process.cwd(),
      ),
    };
  }

  const allowedRoots = [
    ...new Set(
      await Promise.all(
        (options?.allowedRoots ?? []).map((root) => canonicalDirectory(root)),
      ),
    ),
  ];
  let defaultRoot: string | null = null;
  if (options?.defaultRoot) {
    defaultRoot = await canonicalDirectory(options.defaultRoot);
    if (!allowedRoots.some((root) => isPathInside(root, defaultRoot!))) {
      throw new Error(
        "Configured project defaultRoot must be contained by an allowed root after realpath resolution.",
      );
    }
  } else if (allowedRoots.length === 1) {
    defaultRoot = allowedRoots[0]!;
  }
  return { mode: "restricted", allowedRoots, defaultRoot };
}

export async function authorizeProjectRoot(
  policy: ProjectAccessPolicy,
  requestedRoot: string | undefined,
): Promise<ProjectRootAuthorization> {
  if (policy.mode === "restricted" && policy.allowedRoots.length === 0) {
    return { status: "denied", reason: "no_allowed_roots" };
  }
  if (!requestedRoot && !policy.defaultRoot) {
    return { status: "denied", reason: "no_default_root" };
  }

  const baseRoot =
    policy.defaultRoot ??
    (policy.mode === "restricted" ? policy.allowedRoots[0]! : process.cwd());
  const candidate = requestedRoot
    ? path.resolve(baseRoot, requestedRoot)
    : baseRoot;
  let realCandidate: string;
  try {
    realCandidate = await fs.realpath(candidate);
    const stats = await fs.stat(realCandidate);
    if (!stats.isDirectory()) {
      return { status: "denied", reason: "not_directory" };
    }
  } catch {
    return { status: "denied", reason: "unavailable" };
  }

  if (policy.mode === "unrestricted_local_stdio") {
    return {
      status: "authorized",
      rootDir: realCandidate,
      authorityRoot: realCandidate,
      mode: policy.mode,
    };
  }
  const authorityRoot = policy.allowedRoots.find((root) =>
    isPathInside(root, realCandidate),
  );
  return authorityRoot
    ? {
        status: "authorized",
        rootDir: realCandidate,
        authorityRoot,
        mode: policy.mode,
      }
    : { status: "denied", reason: "outside_allowed_roots" };
}
