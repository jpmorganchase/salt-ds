import {
  renderKnowledgeDocumentMarkdown,
  resolveKnowledgeDocument,
} from "@salt-ds/knowledge";
import {
  loadRetrievalRuntime,
  renderRejectedProjectSelection,
} from "./retrievalRuntime.js";

export interface RunDocsCommandInput {
  rootDir: string;
  identifier: string;
  format: "markdown" | "json";
}

export async function runDocsCommand(input: RunDocsCommandInput) {
  const runtime = await loadRetrievalRuntime(input.rootDir);
  if (runtime.selection.status !== "selected") {
    return {
      output: renderRejectedProjectSelection(runtime.selection, input.format),
      exitCode: 3,
    };
  }
  const result = resolveKnowledgeDocument(runtime.store, {
    identifier: input.identifier,
    installed_versions: runtime.installedVersions,
  });
  const enriched = {
    ...result,
    project_inspection_limitations: runtime.inspectionLimitations,
  };
  return {
    output:
      input.format === "json"
        ? JSON.stringify(enriched) + "\n"
        : renderKnowledgeDocumentMarkdown(result),
    exitCode: result.status === "resolved" ? 0 : 1,
  };
}
