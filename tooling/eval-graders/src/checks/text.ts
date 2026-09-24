import type { Evidence } from "../protocol";
import {
  correct,
  defineCheck,
  optionalString,
  ParamError,
  requireString,
  wrong,
} from "./context";

const EVIDENCE_TEXT_LIMIT = 200;

function positionOf(
  content: string,
  index: number,
): { line: number; column: number } {
  const before = content.slice(0, index);
  const line = before.split("\n").length;
  const column = index - before.lastIndexOf("\n");
  return { line, column };
}

/** Fails when the regular expression matches anywhere in any artifact file. */
export const forbiddenPattern = defineCheck({
  parse(params) {
    const pattern = requireString(params, "pattern");
    const flags = (optionalString(params, "flags") ?? "").replace("g", "");
    try {
      return { regex: new RegExp(pattern, `${flags}g`) };
    } catch (error) {
      throw new ParamError(
        `params.pattern is not a valid regular expression: ${String(error)}`,
      );
    }
  },
  run(context, params) {
    const evidence: Evidence[] = [];
    for (const [file, content] of Object.entries(context.files)) {
      params.regex.lastIndex = 0;
      for (const match of content.matchAll(params.regex)) {
        if (match.index === undefined) continue;
        const { line, column } = positionOf(content, match.index);
        evidence.push({
          file,
          line,
          column,
          text: match[0].slice(0, EVIDENCE_TEXT_LIMIT),
        });
      }
    }
    if (evidence.length === 0) return correct();
    return wrong(
      evidence.map(
        (e) =>
          `forbidden pattern ${params.regex.source} matched at ${e.file}:${e.line}`,
      ),
      evidence,
    );
  },
});
