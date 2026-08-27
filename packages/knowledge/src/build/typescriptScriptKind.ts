import path from "node:path";
import ts from "typescript";

export function typescriptScriptKindForFileName(
  fileName: string,
): ts.ScriptKind {
  switch (path.extname(fileName).toLowerCase()) {
    case ".js":
    case ".cjs":
    case ".mjs":
      return ts.ScriptKind.JS;
    case ".jsx":
      return ts.ScriptKind.JSX;
    case ".tsx":
      return ts.ScriptKind.TSX;
    case ".json":
      return ts.ScriptKind.JSON;
    case ".ts":
    case ".cts":
    case ".mts":
    default:
      return ts.ScriptKind.TS;
  }
}
