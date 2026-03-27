import type { SaltRegistry } from "../types.js";
import { reviewSaltUi } from "./reviewSaltUi.js";
import type { StarterCodeSnippet } from "./starterCode.js";

const DESIGN_TOKENS_DOC_URL = "/salt/themes/design-tokens/index";

export interface StarterValidationSummary {
  status: "clean" | "needs_attention";
  snippets_checked: number;
  errors: number;
  warnings: number;
  infos: number;
  fix_count: number;
  migration_count: number;
  top_issue: string | null;
  next_step: string | null;
  source_urls: string[];
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function findUngroundedSaltTokenNames(
  registry: SaltRegistry,
  code: string,
): string[] {
  const knownTokens = new Set(
    registry.tokens.map((token) => token.name.toLowerCase()),
  );
  const matches = code.match(/--salt-[A-Za-z0-9-]+/g) ?? [];
  return unique(
    matches.filter((tokenName) => !knownTokens.has(tokenName.toLowerCase())),
  );
}

export function validateStarterCodeSnippets(
  registry: SaltRegistry,
  snippets: StarterCodeSnippet[] | undefined,
): StarterValidationSummary | null {
  const candidateSnippets =
    snippets?.filter(
      (snippet) =>
        snippet.language === "tsx" &&
        snippet.label.toLowerCase().includes("starter"),
    ) ?? [];

  if (candidateSnippets.length === 0) {
    return null;
  }

  let errors = 0;
  let warnings = 0;
  let infos = 0;
  let fixCount = 0;
  let migrationCount = 0;
  let topIssue: string | null = null;
  let nextStep: string | null = null;
  const sourceUrls: string[] = [];
  let needsAttention = false;

  for (const snippet of candidateSnippets) {
    const analysis = reviewSaltUi(registry, {
      code: snippet.code,
      max_issues: 10,
      view: "compact",
    });

    errors += analysis.summary.errors;
    warnings += analysis.summary.warnings;
    infos += analysis.summary.infos;
    fixCount += analysis.summary.fix_count;
    migrationCount += analysis.summary.migration_count;
    sourceUrls.push(...analysis.source_urls);

    if (analysis.decision.status === "needs_attention") {
      needsAttention = true;
      topIssue ??= analysis.decision.why;
      nextStep ??= analysis.next_step ?? null;
    }

    const ungroundedTokenNames = findUngroundedSaltTokenNames(
      registry,
      snippet.code,
    );
    if (ungroundedTokenNames.length > 0) {
      needsAttention = true;
      warnings += ungroundedTokenNames.length;
      topIssue ??=
        ungroundedTokenNames.length === 1
          ? `Starter code references an unverified Salt token name: ${ungroundedTokenNames[0]}.`
          : `Starter code references unverified Salt token names: ${ungroundedTokenNames.join(", ")}.`;
      nextStep ??=
        "Replace or verify the Salt token names against canonical Salt token guidance before editing.";
      sourceUrls.push(DESIGN_TOKENS_DOC_URL);
    }
  }

  return {
    status: needsAttention ? "needs_attention" : "clean",
    snippets_checked: candidateSnippets.length,
    errors,
    warnings,
    infos,
    fix_count: fixCount,
    migration_count: migrationCount,
    top_issue: topIssue,
    next_step: nextStep,
    source_urls: unique(sourceUrls),
  };
}
