import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import {
  createKnowledgeStore,
  decideSaltProject,
  inspectSaltProjectFacts,
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

export async function loadRetrievalRuntime(rootDir: string) {
  const [{ facts, limitations }, store] = await Promise.all([
    inspectSaltProjectFacts({ rootDir }),
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
