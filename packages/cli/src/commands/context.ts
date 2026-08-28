import {
  buildKnowledgeContext,
  renderKnowledgeContext,
} from "@salt-ds/knowledge";
import { loadRetrievalRuntime } from "./retrievalRuntime.js";

export interface RunContextCommandInput {
  rootDir: string;
  query: string;
  format: "markdown" | "json";
  limit: number;
}

export async function runContextCommand(input: RunContextCommandInput) {
  const runtime = await loadRetrievalRuntime(input.rootDir);
  const query = {
    query: input.query,
    limit: input.limit,
    installed_versions: runtime.installedVersions,
    max_utf8_bytes: 16 * 1024,
  };
  const result = buildKnowledgeContext(runtime.store, query);
  return {
    output:
      input.format === "json"
        ? JSON.stringify(result) + "\n"
        : renderKnowledgeContext(runtime.store, query),
    exitCode: 0,
  };
}
