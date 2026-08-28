import {
  inspectSaltProjectFacts,
  loadKnowledgeRuntimeContext,
} from "@salt-ds/knowledge";

export async function loadRetrievalRuntime(rootDir: string) {
  const [{ facts, limitations }, knowledge] = await Promise.all([
    inspectSaltProjectFacts({ rootDir }),
    loadKnowledgeRuntimeContext(),
  ]);
  const installedVersions = Object.fromEntries(
    facts.installation.resolvedPackages.map((entry) => [
      entry.name,
      entry.resolvedVersion,
    ]),
  );
  return {
    store: knowledge.store,
    installedVersions,
    inspectionLimitations: limitations,
  };
}
