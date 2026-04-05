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

function removeNamedImport(
  line: string,
  importName: string,
): { line: string | null; removed: boolean } {
  const match = line.match(
    /^import\s+\{\s*([^}]+)\s*\}\s+from\s+["']([^"']+)["'];?\s*$/,
  );
  if (!match) {
    return { line, removed: false };
  }

  const [, importedNames, importSource] = match;
  const names = importedNames
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
  if (!names.includes(importName)) {
    return { line, removed: false };
  }

  const remaining = names.filter((name) => name !== importName);
  if (remaining.length === 0) {
    return { line: null, removed: true };
  }

  return {
    line: `import { ${remaining.join(", ")} } from "${importSource}";`,
    removed: true,
  };
}

function ensureImportLine(importLines: string[], importLine: string): string[] {
  return importLines.includes(importLine)
    ? importLines
    : [...importLines, importLine];
}

function replaceJsxIdentifier(
  code: string,
  fromName: string,
  toName: string,
): string {
  if (fromName === toName) {
    return code;
  }

  return code
    .replace(
      new RegExp(`<${escapeRegExp(fromName)}(?=[\\s>])`, "g"),
      `<${toName}`,
    )
    .replace(new RegExp(`</${escapeRegExp(fromName)}>`, "g"), `</${toName}>`);
}

function replaceStarterImportsAndTags(
  code: string,
  input: {
    fromName: string;
    toName: string;
    importFrom: string;
  },
): string {
  const lines = code.split("\n");
  const importLines: string[] = [];
  const bodyLines: string[] = [];
  let inImportBlock = true;

  for (const line of lines) {
    if (inImportBlock && (line.startsWith("import ") || line.trim() === "")) {
      if (line.startsWith("import ")) {
        const { line: rewritten } = removeNamedImport(line, input.fromName);
        if (rewritten) {
          importLines.push(rewritten);
        }
      } else {
        importLines.push(line);
      }
      continue;
    }

    inImportBlock = false;
    bodyLines.push(line);
  }

  const nextImportLines = ensureImportLine(
    importLines.filter(
      (line) =>
        line.trim() !== "" &&
        line !== `import { ${input.toName} } from "${input.importFrom}";`,
    ),
    `import { ${input.toName} } from "${input.importFrom}";`,
  ).sort((left, right) => left.localeCompare(right));

  const rewrittenBody = replaceJsxIdentifier(
    bodyLines.join("\n"),
    input.fromName,
    input.toName,
  );

  return [...nextImportLines, "", rewrittenBody].join("\n");
}

function applyThemeDefaultsToStarterCode(
  code: string,
  projectPolicy: WorkflowProjectPolicyArtifact,
): { code: string; applied: boolean; blockedReason: string | null } {
  const themeDefaults = projectPolicy.themeDefaults;
  if (!themeDefaults?.provider) {
    return { code, applied: false, blockedReason: null };
  }

  const providerMatch = code.match(
    new RegExp(
      `<(${escapeRegExp(themeDefaults.provider)}|SaltProviderNext|SaltProvider)\\b`,
    ),
  );
  const currentProvider = providerMatch?.[1] ?? null;
  const needsCustomProviderImport =
    currentProvider !== null &&
    currentProvider !== themeDefaults.provider &&
    !themeDefaults.providerImport &&
    !["SaltProvider", "SaltProviderNext"].includes(themeDefaults.provider);

  if (needsCustomProviderImport) {
    return {
      code,
      applied: false,
      blockedReason: `Repo theme defaults declare ${themeDefaults.provider} but do not include provider_import metadata, so the starter bootstrap was left unchanged.`,
    };
  }

  let updated = code;
  let applied = false;

  if (currentProvider && themeDefaults.providerImport) {
    updated = replaceStarterImportsAndTags(updated, {
      fromName: currentProvider,
      toName: themeDefaults.provider,
      importFrom: themeDefaults.providerImport.from,
    });
    applied = true;
  } else if (
    currentProvider &&
    themeDefaults.provider.startsWith("SaltProvider")
  ) {
    updated = replaceStarterImportsAndTags(updated, {
      fromName: currentProvider,
      toName: themeDefaults.provider,
      importFrom: "@salt-ds/core",
    });
    applied = true;
  }

  if (currentProvider && themeDefaults.imports.length > 0) {
    const lines = updated.split("\n");
    const bodyStartIndex = lines.findIndex(
      (line, index) =>
        index > 0 && !line.startsWith("import ") && line.trim() !== "",
    );
    const importBlock =
      bodyStartIndex === -1 ? lines : lines.slice(0, bodyStartIndex);
    const bodyBlock = bodyStartIndex === -1 ? [] : lines.slice(bodyStartIndex);
    const filteredImports = importBlock.filter(
      (line) => !/^import\s+["']@salt-ds\/theme\//.test(line.trim()),
    );

    for (const importPath of themeDefaults.imports) {
      const cssImportLine = `import "${importPath}";`;
      if (!filteredImports.includes(cssImportLine)) {
        filteredImports.push(cssImportLine);
      }
    }

    updated = [...filteredImports, "", ...bodyBlock].join("\n");
    applied = true;
  }

  if (currentProvider) {
    const providerName =
      currentProvider === themeDefaults.provider ||
      themeDefaults.providerImport ||
      themeDefaults.provider.startsWith("SaltProvider")
        ? themeDefaults.provider
        : currentProvider;
    const providerBlockPattern = new RegExp(
      `<${escapeRegExp(providerName)}[\\s\\S]*?>`,
    );
    const providerProps = themeDefaults.props.map(
      (prop) => `      ${prop.name}="${prop.value}"`,
    );
    const replacement =
      providerProps.length > 0
        ? [`    <${providerName}`, ...providerProps, "    >"].join("\n")
        : `    <${providerName}>`;
    const nextUpdated = updated.replace(providerBlockPattern, replacement);
    if (nextUpdated !== updated) {
      updated = nextUpdated;
      applied = true;
    }
  }

  return { code: updated, applied, blockedReason: null };
}

function applyTokenAliasesToStarterCode(
  code: string,
  projectPolicy: WorkflowProjectPolicyArtifact,
): { code: string; appliedAliases: string[] } {
  let updated = code;
  const appliedAliases: string[] = [];

  for (const alias of projectPolicy.tokenAliases) {
    if (!updated.includes(alias.saltName)) {
      continue;
    }

    updated = updated.split(alias.saltName).join(alias.prefer);
    appliedAliases.push(alias.prefer);
  }

  return {
    code: updated,
    appliedAliases: unique(appliedAliases),
  };
}

function applyWrapperPoliciesToStarterCode(
  code: string,
  projectPolicy: WorkflowProjectPolicyArtifact,
): { code: string; wrappersApplied: string[] } {
  let updated = code;
  const wrappersApplied: string[] = [];

  for (const wrapper of projectPolicy.approvedWrapperDetails) {
    if (!wrapper.import || !updated.includes(wrapper.wraps)) {
      continue;
    }

    const nextUpdated = replaceStarterImportsAndTags(updated, {
      fromName: wrapper.wraps,
      toName: wrapper.name,
      importFrom: wrapper.import.from,
    });
    if (nextUpdated !== updated) {
      updated = nextUpdated;
      wrappersApplied.push(wrapper.name);
    }
  }

  return {
    code: updated,
    wrappersApplied: unique(wrappersApplied),
  };
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

    const wrapperRewrite =
      snippet.language === "tsx"
        ? applyWrapperPoliciesToStarterCode(snippet.code, projectPolicy)
        : { code: snippet.code, wrappersApplied: [] };
    const themeRewrite =
      snippet.language === "tsx"
        ? applyThemeDefaultsToStarterCode(wrapperRewrite.code, projectPolicy)
        : { code: wrapperRewrite.code, applied: false, blockedReason: null };
    const tokenRewrite = applyTokenAliasesToStarterCode(
      themeRewrite.code,
      projectPolicy,
    );

    const notes = [
      ...(snippet.notes ?? []),
      ...(wrapperRewrite.wrappersApplied.length > 0
        ? [
            `Repo wrapper policy applied: ${wrapperRewrite.wrappersApplied.join(", ")}.`,
          ]
        : []),
      ...(themeRewrite.applied
        ? ["Repo theme defaults applied to the starter bootstrap."]
        : []),
      ...(themeRewrite.blockedReason ? [themeRewrite.blockedReason] : []),
      ...(tokenRewrite.appliedAliases.length > 0
        ? [
            `Repo token aliases applied: ${tokenRewrite.appliedAliases.join(", ")}.`,
          ]
        : []),
      ...(projectPolicy.tokenFamilyPolicies.length > 0
        ? [
            `Repo token family policies in scope: ${projectPolicy.tokenFamilyPolicies
              .map((entry) => `${entry.family}:${entry.mode}`)
              .join(", ")}.`,
          ]
        : []),
    ];

    const source_urls = unique([
      ...(snippet.source_urls ?? []),
      ...projectPolicy.sourceUrls,
    ]);

    return {
      ...snippet,
      code: tokenRewrite.code,
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
      recommendation: `Replace ${wrapper.wraps} with ${wrapper.name} and import it from ${wrapper.import.from}.`,
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
            ? `Replace the default Salt theme bootstrap with ${themeDefaults.provider} from ${themeDefaults.providerImport.from}.`
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
