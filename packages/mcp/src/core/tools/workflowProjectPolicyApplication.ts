import type { StarterCodeSnippet } from "./starterCode.js";
import type { WorkflowProjectPolicyArtifact } from "./workflowProjectPolicy.js";

export interface ProjectPolicyReviewGuidanceCandidate {
  title: string;
  recommendation: string;
  reason: string;
  rule_id: string;
  source_urls: string[];
}

function unique(values: Array<string | null | undefined>): string[] {
  return [
    ...new Set(values.filter((value): value is string => Boolean(value))),
  ];
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function formatNamedImport(name: string, from: string): string {
  return `import { ${name} } from "${from}";`;
}

function buildStarterPolicyAdaptationNotes(
  code: string,
  language: StarterCodeSnippet["language"],
  projectPolicy: WorkflowProjectPolicyArtifact,
): string[] {
  const adaptations: string[] = [];

  if (language === "tsx") {
    for (const wrapper of projectPolicy.approvedWrapperDetails) {
      if (
        !code.includes(`<${wrapper.wraps}`) &&
        !code.includes(`</${wrapper.wraps}>`)
      ) {
        continue;
      }
      adaptations.push(
        wrapper.import
          ? `Replace canonical ${wrapper.wraps} with the repo-approved ${wrapper.name}; use this exact named import: ${formatNamedImport(wrapper.import.name, wrapper.import.from)} ${wrapper.reason}`
          : `Repo policy prefers ${wrapper.name} over canonical ${wrapper.wraps}, but no import metadata is declared; keep the canonical component until policy metadata is complete.`,
      );
    }

    const theme = projectPolicy.themeDefaults;
    if (theme) {
      const providerImport = theme.providerImport
        ? formatNamedImport(
            theme.providerImport.name,
            theme.providerImport.from,
          )
        : ["SaltProvider", "SaltProviderNext"].includes(theme.provider)
          ? formatNamedImport(theme.provider, "@salt-ds/core")
          : `declare provider_import metadata for ${theme.provider}`;
      const requirements = [
        providerImport,
        ...(theme.imports.length > 0
          ? [`load ${theme.imports.join(", ")}`]
          : []),
        ...(theme.props.length > 0
          ? [
              `set ${theme.props
                .map((entry) => `${entry.name}="${entry.value}"`)
                .join(", ")}`,
            ]
          : []),
      ];
      adaptations.push(
        `Apply the repo theme bootstrap during implementation: ${requirements.join(" ")}.`,
      );
    }
  }

  for (const alias of projectPolicy.tokenAliases) {
    if (code.includes(alias.saltName)) {
      adaptations.push(
        `Replace canonical token ${alias.saltName} with repo alias ${alias.prefer}. ${alias.reason}`,
      );
    }
  }

  for (const family of projectPolicy.tokenFamilyPolicies) {
    adaptations.push(
      `Apply repo token-family policy ${family.family}:${family.mode}. ${family.reason}`,
    );
  }

  return adaptations.length > 0
    ? [
        "Canonical Salt starter code is intentionally unchanged; apply the following declared repo-policy adaptations during implementation, then run review_salt_ui on the full source.",
        ...unique(adaptations),
      ]
    : [];
}

export function applyProjectPolicyToStarterCodeSnippets(
  snippets: StarterCodeSnippet[] | undefined,
  projectPolicy: WorkflowProjectPolicyArtifact | null | undefined,
): StarterCodeSnippet[] | undefined {
  if (!snippets || !projectPolicy) {
    return snippets;
  }

  return snippets.map((snippet) => {
    if (snippet.language !== "tsx" && snippet.language !== "css") {
      return snippet;
    }

    const notes = [
      ...(snippet.notes ?? []),
      ...buildStarterPolicyAdaptationNotes(
        snippet.code,
        snippet.language,
        projectPolicy,
      ),
    ];
    const source_urls = unique([
      ...(snippet.source_urls ?? []),
      ...projectPolicy.sourceUrls,
    ]);

    return {
      ...snippet,
      code: snippet.code,
      ...(notes.length > 0 ? { notes } : {}),
      ...(source_urls.length > 0 ? { source_urls } : {}),
    };
  });
}

function codeMentionsIdentifier(code: string, identifier: string): boolean {
  return (
    new RegExp(`<${escapeRegExp(identifier)}(?=[\\s>/])`).test(code) ||
    new RegExp(`\\b${escapeRegExp(identifier)}\\b`).test(code)
  );
}

function codeHasSideEffectImport(code: string, importPath: string): boolean {
  return new RegExp(
    `^\\s*import\\s+["']${escapeRegExp(importPath)}["'];?\\s*$`,
    "m",
  ).test(code);
}

function readJsxOpeningTagAttributes(
  code: string,
  componentName: string,
): string | null {
  const match = code.match(
    new RegExp(`<${escapeRegExp(componentName)}\\b([\\s\\S]*?)>`, "m"),
  );

  return match?.[1] ?? null;
}

function getThemePolicyDrift(input: {
  code: string;
  provider: string;
  imports: string[];
  props: Array<{
    name: string;
    value: string;
  }>;
}): {
  missingImports: string[];
  missingProps: string[];
  mismatchedProps: string[];
} {
  const missingImports = input.imports.filter(
    (importPath) => !codeHasSideEffectImport(input.code, importPath),
  );
  const openingTagAttributes = readJsxOpeningTagAttributes(
    input.code,
    input.provider,
  );
  if (!openingTagAttributes) {
    return {
      missingImports,
      missingProps: input.props.map((prop) => `${prop.name}="${prop.value}"`),
      mismatchedProps: [],
    };
  }

  const missingProps: string[] = [];
  const mismatchedProps: string[] = [];
  for (const prop of input.props) {
    const exactPropPattern = new RegExp(
      `\\b${escapeRegExp(prop.name)}\\s*=\\s*["']${escapeRegExp(prop.value)}["']`,
    );
    if (exactPropPattern.test(openingTagAttributes)) {
      continue;
    }

    const propPresencePattern = new RegExp(
      `\\b${escapeRegExp(prop.name)}\\s*=`,
    );
    if (propPresencePattern.test(openingTagAttributes)) {
      mismatchedProps.push(`${prop.name}="${prop.value}"`);
    } else {
      missingProps.push(`${prop.name}="${prop.value}"`);
    }
  }

  return {
    missingImports,
    missingProps,
    mismatchedProps,
  };
}

export function buildProjectPolicyReviewGuidanceCandidates(input: {
  code: string;
  projectPolicy: WorkflowProjectPolicyArtifact | null | undefined;
}): ProjectPolicyReviewGuidanceCandidate[] {
  if (!input.projectPolicy) {
    return [];
  }

  const candidates: ProjectPolicyReviewGuidanceCandidate[] = [];

  for (const wrapper of input.projectPolicy.approvedWrapperDetails) {
    if (
      !wrapper.import ||
      !codeMentionsIdentifier(input.code, wrapper.wraps) ||
      codeMentionsIdentifier(input.code, wrapper.name)
    ) {
      continue;
    }

    candidates.push({
      title: `Use ${wrapper.name} instead of raw ${wrapper.wraps} when repo policy applies.`,
      recommendation: `Replace ${wrapper.wraps} with ${wrapper.name} and use this exact named import: ${formatNamedImport(wrapper.import.name, wrapper.import.from)}`,
      reason: wrapper.reason,
      rule_id: "review-project-policy-wrapper",
      source_urls: unique([
        ...wrapper.sourceUrls,
        ...input.projectPolicy.sourceUrls,
      ]),
    });
  }

  const themeDefaults = input.projectPolicy.themeDefaults;
  const usesDefaultSaltThemeBootstrap =
    /<SaltProvider(?:Next)?\b/.test(input.code) ||
    /@salt-ds\/theme\//.test(input.code);
  const usesRepoThemeProvider = Boolean(
    themeDefaults?.provider &&
      codeMentionsIdentifier(input.code, themeDefaults.provider),
  );

  if (
    themeDefaults?.provider &&
    (usesDefaultSaltThemeBootstrap || usesRepoThemeProvider)
  ) {
    const needsThemeBootstrapReplacement =
      usesDefaultSaltThemeBootstrap && !usesRepoThemeProvider;
    const themePolicyDrift = getThemePolicyDrift({
      code: input.code,
      provider: themeDefaults.provider,
      imports: themeDefaults.imports,
      props: usesRepoThemeProvider ? themeDefaults.props : [],
    });
    const hasThemePolicyDrift =
      themePolicyDrift.missingImports.length > 0 ||
      themePolicyDrift.missingProps.length > 0 ||
      themePolicyDrift.mismatchedProps.length > 0;

    if (!needsThemeBootstrapReplacement && !hasThemePolicyDrift) {
      // Repo theme policy is already reflected in the code.
    } else {
      const recommendationParts: string[] = [];
      if (needsThemeBootstrapReplacement) {
        recommendationParts.push(
          themeDefaults.providerImport
            ? `Replace the default Salt theme bootstrap with ${themeDefaults.provider} and use this exact named import: ${formatNamedImport(themeDefaults.providerImport.name, themeDefaults.providerImport.from)}`
            : `Replace the default Salt theme bootstrap with the repo-approved ${themeDefaults.provider}.`,
        );
      }
      if (themePolicyDrift.missingImports.length > 0) {
        recommendationParts.push(
          `Add the required repo theme imports: ${themePolicyDrift.missingImports.join(", ")}.`,
        );
      }
      if (themePolicyDrift.missingProps.length > 0) {
        recommendationParts.push(
          `Add the required provider props on ${themeDefaults.provider}: ${themePolicyDrift.missingProps.join(", ")}.`,
        );
      }
      if (themePolicyDrift.mismatchedProps.length > 0) {
        recommendationParts.push(
          `Align the provider props on ${themeDefaults.provider} with repo policy: ${themePolicyDrift.mismatchedProps.join(", ")}.`,
        );
      }

      const reasonSuffix = [
        themePolicyDrift.missingImports.length > 0
          ? `missing imports (${themePolicyDrift.missingImports.join(", ")})`
          : null,
        themePolicyDrift.missingProps.length > 0
          ? `missing props (${themePolicyDrift.missingProps.join(", ")})`
          : null,
        themePolicyDrift.mismatchedProps.length > 0
          ? `mismatched props (${themePolicyDrift.mismatchedProps.join(", ")})`
          : null,
      ]
        .filter((value): value is string => Boolean(value))
        .join("; ");

      candidates.push({
        title: "Align the theme bootstrap with repo policy.",
        recommendation: recommendationParts.join(" "),
        reason: reasonSuffix
          ? `${themeDefaults.reason ?? "The repo declares its own approved Salt bootstrap."} Current code is missing repo theme requirements: ${reasonSuffix}.`
          : (themeDefaults.reason ??
            "The repo declares its own approved Salt bootstrap."),
        rule_id: "review-project-policy-theme-default",
        source_urls: unique([
          ...themeDefaults.sourceUrls,
          ...input.projectPolicy.sourceUrls,
        ]),
      });
    }
  }

  for (const alias of input.projectPolicy.tokenAliases) {
    if (!input.code.includes(alias.saltName)) {
      continue;
    }

    candidates.push({
      title: `Prefer ${alias.prefer} over ${alias.saltName} in this repo.`,
      recommendation: `Replace ${alias.saltName} with ${alias.prefer}.`,
      reason: alias.reason,
      rule_id: "review-project-policy-token-alias",
      source_urls: unique([
        ...alias.sourceUrls,
        ...input.projectPolicy.sourceUrls,
      ]),
    });
  }

  for (const policy of input.projectPolicy.tokenFamilyPolicies) {
    if (
      policy.mode === "canonical-only" ||
      !input.code.includes(`--salt-${policy.family}-`)
    ) {
      continue;
    }

    candidates.push({
      title: `Check ${policy.family} token usage against repo policy.`,
      recommendation: `Review ${policy.family} token usage and prefer the repo-local alias strategy (${policy.mode}) where applicable.`,
      reason: policy.reason,
      rule_id: "review-project-policy-token-family",
      source_urls: unique([
        ...policy.sourceUrls,
        ...input.projectPolicy.sourceUrls,
      ]),
    });
  }

  return candidates;
}
