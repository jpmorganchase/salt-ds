import {
  buildKnowledgeContext,
  renderKnowledgeContext,
} from "@salt-ds/knowledge";
import {
  loadRetrievalRuntime,
  type ProjectSelectionInput,
  renderRejectedProjectSelection,
} from "./retrievalRuntime.js";

export interface RunContextCommandInput extends ProjectSelectionInput {
  query: string;
  format: "markdown" | "json";
  limit: number;
}

export async function runContextCommand(input: RunContextCommandInput) {
  const runtime = await loadRetrievalRuntime(input);
  if (runtime.selection.status !== "selected") {
    return {
      output: renderRejectedProjectSelection(runtime.selection, input.format),
      exitCode: 3,
    };
  }
  const query = {
    query: input.query,
    limit: input.limit,
    installed_versions: runtime.installedVersions,
    max_utf8_bytes: 16 * 1024,
  };
  return {
    output:
      input.format === "json"
        ? JSON.stringify(buildKnowledgeContext(runtime.store, query)) + "\n"
        : renderKnowledgeContext(runtime.store, query),
    exitCode: 0,
  };
}
