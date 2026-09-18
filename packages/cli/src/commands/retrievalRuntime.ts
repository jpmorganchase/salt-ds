import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import {
  createKnowledgeStore,
  decideSaltProject,
  inspectSaltProjectFacts,
  SaltProjectInspectionError,
} from "@salt-ds/knowledge";

const requireFromCli = createRequire(
  typeof __filename === "string" ? __filename : import.meta.url,
);

function loadSelectionStore() {
  const knowledgePackageRoot = path.dirname(
    requireFromCli.resolve("@salt-ds/knowledge/package.json"),
  );
  const bundleDir = existsSync(path.join(knowledgePackageRoot, "manifest.json"))
    ? knowledgePackageRoot
    : path.join(knowledgePackageRoot, "generated");
  return createKnowledgeStore({ bundleDir });
}

export interface ProjectSelectionInput {
  /** Repository filesystem authority. */
  rootDir: string;
  /** Explicit project path relative to the repository authority. */
  project: string;
}

function projectPath(rootDir: string, project: string): string {
  if (
    typeof project !== "string" ||
    project.length === 0 ||
    project.includes("\0") ||
    /^[A-Za-z]:/u.test(project) ||
    path.isAbsolute(project) ||
    path.win32.isAbsolute(project) ||
    path.posix.isAbsolute(project) ||
    project.split(/[\\/]/u).includes("..")
  )
    throw new SaltProjectInspectionError(
      "SALT_PROJECT_ROOT_UNAVAILABLE",
      "The project selection must be relative to the repository authority.",
    );
  const authorityRoot = path.resolve(rootDir);
  const selectedRoot = path.resolve(authorityRoot, project);
  const relative = path.relative(authorityRoot, selectedRoot);
  if (
    relative === ".." ||
    relative.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relative)
  )
    throw new SaltProjectInspectionError(
      "SALT_PROJECT_ROOT_UNAVAILABLE",
      "The project selection must stay inside the repository authority.",
    );
  return selectedRoot;
}

function portableRelative(authorityRoot: string, rootDir: string): string {
  const relative = path.relative(authorityRoot, rootDir);
  return relative === "" ? "." : relative.replaceAll("\\", "/");
}

export async function loadRetrievalRuntime(input: ProjectSelectionInput) {
  const selectedRoot = projectPath(input.rootDir, input.project);
  const [{ facts, limitations, authorityRoot }, store] = await Promise.all([
    inspectSaltProjectFacts({
      rootDir: selectedRoot,
      authorityRoot: input.rootDir,
    }),
    Promise.resolve(loadSelectionStore()),
  ]);
  const selection = decideSaltProject(facts, store.manifest);
  const installedVersions = Object.fromEntries(
    selection.installed_package_vector.map((entry) => [
      entry.name,
      entry.version,
    ]),
  );
  return {
    facts,
    store,
    selection,
    installedVersions,
    inspectionLimitations: limitations,
    authorityRoot,
    projectRelative: portableRelative(authorityRoot, facts.root_dir),
  };
}

export function renderRejectedProjectSelection(
  selection: Awaited<ReturnType<typeof loadRetrievalRuntime>>["selection"],
  format: "markdown" | "json",
): string {
  if (format === "json") return `${JSON.stringify(selection)}\n`;
  return [
    "# Salt project selection",
    "",
    `Status: ${selection.status}`,
    `Reason: ${selection.reason_code}`,
    "",
  ].join("\n");
}
