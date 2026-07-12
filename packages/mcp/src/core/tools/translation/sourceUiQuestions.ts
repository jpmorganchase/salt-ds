import type {
  SourceUiNode,
  TranslationConfidenceBlocker,
} from "./sourceUiTypes.js";

function getScopeQuestionPrefix(source: SourceUiNode): string {
  if (source.scope === "app-structure") {
    return "Which regions must stay persistent, and which are only local content?";
  }

  if (source.scope === "flow" || source.complexity === "multi-part") {
    return "Which parts, actions, and supporting states need to stay grouped together?";
  }

  return "What is the minimum interaction model this source needs in Salt?";
}

export function getBlockerQuestion(
  source: SourceUiNode,
  blocker: TranslationConfidenceBlocker | null,
): string | undefined {
  if (!blocker) {
    return undefined;
  }

  switch (blocker) {
    case "project-conventions-dependency":
      return source.scope === "app-structure"
        ? "Does the repo already have an approved shell or navigation wrapper for this app-level region, or a page layout that should take precedence?"
        : "Does the repo already have an approved wrapper, shell, or page pattern that should override the canonical Salt starter?";
    case "incomplete-source-structure":
      if (source.role === "overlay") {
        return "Which parts are required in the first Salt pass: header, body, footer actions, and supporting states?";
      }
      if (source.role === "data-entry" || source.role === "selection") {
        return "Does this need validation, helper text, or grouped field structure in the Salt version?";
      }
      return getScopeQuestionPrefix(source);
    case "ambiguous-structure":
      if (source.role === "navigation" && source.scope === "control") {
        return "Is this a single destination, or is it part of a broader navigation structure?";
      }
      if (source.role === "overlay") {
        return "Is this a lightweight confirmation, or does it need a fuller interaction flow with supporting parts?";
      }
      return getScopeQuestionPrefix(source);
    case "missing-source-semantics":
      return "What is the minimum interaction and state model this source needs in the Salt version?";
    case "pattern-rewrite":
      return "What grouped behavior matters most to preserve: structure, states, or interaction flow?";
    case "no-direct-salt-match":
      if (source.role === "navigation") {
        return "Should this resolve to one destination primitive, or to a broader navigation structure?";
      }
      if (source.role === "data-display") {
        return "Is this a dense data surface with filters or commands, or just a simple read-only list?";
      }
      return getScopeQuestionPrefix(source);
  }
}
