/**
 * Deterministic host-side tool-selection ranker (Phase 0 task 0.10 / M15 / F8).
 *
 * Hosts (VS Code Copilot, Claude Code, Cursor, Codex, Windsurf, Copilot CLI…)
 * pick MCP tools by reading the tool's `name`, `description`, and
 * `annotations` and matching them against the user prompt. A weak description
 * forces the host to fall back to broader retrieval (`tool_search` in the
 * captured 9-turn trace, see `session-findings-2026-06.md` root cause #7).
 *
 * This ranker is intentionally deterministic and model-free. It mirrors the
 * lexical part of host tool-selection so we can catch description regressions
 * in CI:
 *
 *  1. Each tool becomes a small document built from its name tokens (heavily
 *     up-weighted, since hosts privilege name matches) and its description
 *     tokens.
 *  2. Idf is computed across the registered tool surface so common words
 *     like "salt" (which appears in every tool) are correctly down-weighted.
 *  3. Annotations bias the score: read-only intents should never route to a
 *     write tool; explicit persist/write intents lift `readOnlyHint: false`
 *     tools.
 *
 * Test-only. This deliberately lives outside the runtime server so a CI
 * description-quality heuristic cannot be mistaken for product routing.
 */

import type { ToolDefinition } from "../../server/toolDefinitions.js";

const STOP_WORDS = new Set<string>([
  "a",
  "an",
  "the",
  "and",
  "or",
  "but",
  "if",
  "in",
  "on",
  "at",
  "to",
  "for",
  "of",
  "with",
  "without",
  "from",
  "by",
  "as",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "am",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "doing",
  "will",
  "would",
  "could",
  "should",
  "shall",
  "may",
  "might",
  "must",
  "can",
  "cannot",
  "this",
  "that",
  "these",
  "those",
  "there",
  "here",
  "i",
  "me",
  "my",
  "mine",
  "you",
  "your",
  "yours",
  "we",
  "us",
  "our",
  "ours",
  "it",
  "its",
  "into",
  "onto",
  "out",
  "over",
  "under",
  "than",
  "then",
  "so",
  "such",
  "no",
  "not",
  "only",
  "own",
  "same",
  "very",
  "just",
  "also",
  "any",
  "all",
  "some",
  "each",
  "every",
  "between",
  "about",
  "after",
  "before",
  "while",
  "during",
  "because",
  "via",
  "per",
  "etc",
  "use",
  "using",
  "used",
  "uses",
  "want",
  "wants",
  "need",
  "needs",
  "please",
  "help",
  "me",
]);

/**
 * Tokenize free text into a normalized bag of lower-case alphanumeric tokens
 * with stop words and very short tokens (<2 chars) removed. Splits on
 * non-alphanumeric boundaries, so `salt_workflow_v1`, `SaltProviderNext`, and
 * `bootstrap-salt-repo` all decompose into their constituent terms.
 */
function tokenize(input: string): string[] {
  if (!input) {
    return [];
  }
  // Insert space at camelCase boundaries so SaltProviderNext -> Salt Provider
  // Next, then split on non-alphanumerics.
  const decased = input.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
  const lower = decased.toLowerCase();
  const raw = lower.split(/[^a-z0-9]+/);
  const out: string[] = [];
  for (const token of raw) {
    if (token.length < 2) continue;
    if (STOP_WORDS.has(token)) continue;
    out.push(token);
  }
  return out;
}

interface ToolDocument {
  name: string;
  nameTokens: string[];
  descTokens: string[];
  annotations: NonNullable<ToolDefinition["annotations"]>;
  uniqueTokens: Set<string>;
}

const DEFAULT_ANNOTATIONS: NonNullable<ToolDefinition["annotations"]> = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
};

function toDocument(tool: ToolDefinition): ToolDocument {
  const nameTokens = tokenize(tool.name);
  const descTokens = tokenize(tool.description);
  const annotations = { ...DEFAULT_ANNOTATIONS, ...(tool.annotations ?? {}) };
  return {
    name: tool.name,
    nameTokens,
    descTokens,
    annotations,
    uniqueTokens: new Set<string>([...nameTokens, ...descTokens]),
  };
}

/**
 * Tokens that signal the prompt explicitly intends to **persist** or
 * **install** something to the workspace, and therefore should not be
 * penalized for picking a `readOnlyHint: false` tool. We deliberately keep
 * this list narrow — verbs like `create`, `build`, `generate`, `make`,
 * `add` overlap heavily with read-only Salt tools that *recommend* code for
 * the host to write (e.g. `create_salt_ui`), so treating them as write
 * intent flips persistence tools above the right read-only workflow tool.
 *
 * Anything not in this list is treated as a read intent, which biases
 * persistence tools out of the top slot when the prompt is a casual lookup.
 */
const WRITE_INTENT_TOKENS = new Set<string>([
  "persist",
  "write",
  "save",
  "store",
  "record",
  "commit",
  "publish",
  "install",
  "scaffold",
  "bootstrap",
  "init",
  "initialize",
  "initialise",
  "setup",
  "overwrite",
]);

function detectsWriteIntent(promptTokens: Iterable<string>): boolean {
  for (const token of promptTokens) {
    if (WRITE_INTENT_TOKENS.has(token)) {
      return true;
    }
  }
  return false;
}

interface ToolRankingEntry {
  /** Registered tool name (e.g. `create_salt_ui`). */
  tool: string;
  /** Composite score; higher is better. Useful for debugging weak matches. */
  score: number;
  /** Plain-text breakdown surfaced for failing test diagnostics. */
  breakdown: {
    nameHits: string[];
    descriptionHits: string[];
    annotationBias: number;
  };
}

interface ToolSelectionRanker {
  rank(prompt: string): ToolRankingEntry[];
}

/**
 * Build a deterministic ranker over the given tool definitions. The ranker is
 * pure — same prompt + same tool set always produces the same ordering — and
 * the scoring uses only the public `name`, `description`, and `annotations`
 * surface that an MCP host actually sees over the wire.
 */
export function createToolSelectionRanker(
  tools: readonly ToolDefinition[],
): ToolSelectionRanker {
  if (tools.length === 0) {
    return {
      rank: () => [],
    };
  }

  const documents = tools.map(toDocument);
  const docCount = documents.length;

  // Inverse document frequency across the tool surface. Smoothed so a token
  // present in every tool (like "salt") still gets a small positive weight
  // rather than zero.
  const docFreq = new Map<string, number>();
  for (const doc of documents) {
    for (const token of doc.uniqueTokens) {
      docFreq.set(token, (docFreq.get(token) ?? 0) + 1);
    }
  }
  const idf = (token: string): number => {
    const df = docFreq.get(token) ?? 0;
    return Math.log(1 + (docCount - df + 0.5) / (df + 0.5));
  };

  return {
    rank(prompt: string): ToolRankingEntry[] {
      const promptTokens = tokenize(prompt);
      const promptUnique = new Set(promptTokens);
      const writeIntent = detectsWriteIntent(promptUnique);

      const entries = documents.map((doc, originalIndex) => {
        let nameScore = 0;
        let descScore = 0;
        const nameHits: string[] = [];
        const descriptionHits: string[] = [];

        const descCounts = new Map<string, number>();
        for (const token of doc.descTokens) {
          descCounts.set(token, (descCounts.get(token) ?? 0) + 1);
        }
        const nameSet = new Set(doc.nameTokens);

        for (const token of promptUnique) {
          const tokenIdf = idf(token);
          if (nameSet.has(token)) {
            // Name matches are the dominant signal — hosts privilege them
            // heavily because the name is the most-skimmed field in the
            // tools/list payload. Weight 5 keeps a single name hit ahead of
            // ~4 description hits on the same token even when idf is equal.
            nameScore += 5 * tokenIdf;
            nameHits.push(token);
          }
          const descCount = descCounts.get(token) ?? 0;
          if (descCount > 0) {
            // Cap per-token tf at 3 so a wordy description that happens to
            // repeat one prompt term cannot drown out a tighter description
            // whose match is more topical.
            const tf = Math.min(descCount, 3);
            descScore += tf * tokenIdf;
            descriptionHits.push(token);
          }
        }

        let annotationBias = 0;
        const isReadOnly = doc.annotations.readOnlyHint === true;
        const isDestructive = doc.annotations.destructiveHint === true;

        if (writeIntent) {
          // Write/persist/install intent: lift write tools, leave read tools
          // alone. We do not penalise read tools because most write tools
          // also have semantic name matches; the bias is a tiebreaker, not
          // an override.
          if (!isReadOnly) annotationBias += 0.75;
          if (isDestructive) annotationBias += 0.25;
        } else if (!isReadOnly) {
          // Pure read intent should never pick a write tool when a comparable
          // read-only option exists. Soft penalty keeps the persistence
          // tools out of the top slot for casual lookup prompts without
          // hiding them entirely.
          annotationBias -= 1.5;
        }

        return {
          tool: doc.name,
          score: nameScore + descScore + annotationBias,
          breakdown: {
            nameHits,
            descriptionHits,
            annotationBias,
          },
          // Preserve definition order as the deterministic tiebreaker so the
          // ranking is reproducible across machines and Node versions.
          originalIndex,
        };
      });

      entries.sort((left, right) => {
        if (right.score !== left.score) {
          return right.score - left.score;
        }
        return left.originalIndex - right.originalIndex;
      });

      return entries.map(({ originalIndex: _index, ...entry }) => entry);
    },
  };
}
