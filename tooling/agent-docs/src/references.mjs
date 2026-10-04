import { readFile } from "node:fs/promises";
import path from "node:path";
import postcss from "postcss";
import { MAX_PAGE_BYTES } from "./config.mjs";
import { listFiles } from "./files.mjs";
import { relativeDocLink } from "./links.mjs";

export const TOKEN_REFERENCE_PATH = "tokens.md";

const TOKEN_TIERS = [
  {
    key: "characteristics",
    title: "Characteristic tokens",
    guidance:
      "Semantic tokens grouped by purpose. These are the tokens to reference in components and patterns.",
  },
  {
    key: "foundations",
    title: "Foundation tokens",
    guidance:
      "Base values. Foundations can sometimes be referenced directly, depending on the use case.",
  },
  {
    key: "palette",
    title: "Palette tokens",
    guidance:
      "Intermediate values used by characteristic tokens to support modes. Never reference palette tokens directly.",
  },
  {
    key: "deprecated",
    title: "Deprecated tokens",
    guidance:
      "Do not use these tokens in new code. Where a deprecated token is an alias of a characteristic or foundation token, that token is shown; check the theme changelog for other replacements.",
  },
];

function tierFor(relativePath) {
  if (relativePath.split("/").includes("deprecated")) return "deprecated";
  if (relativePath.includes("/palette/")) return "palette";
  if (relativePath.includes("/characteristics/")) return "characteristics";
  if (relativePath.split("/").includes("foundations")) return "foundations";
  return undefined;
}

function themeFor(relativePath) {
  if (relativePath.startsWith("next/")) return "next";
  if (relativePath.startsWith("legacy/")) return "legacy";
  return "shared";
}

/** Collects every `--salt-*` custom property declared in the theme CSS. */
export async function collectTokens(themeCssDir) {
  const files = await listFiles(themeCssDir, (file) => file.endsWith(".css"));
  const tokens = new Map();
  for (const relativePath of files) {
    const tier = tierFor(relativePath);
    if (!tier) continue;
    const group = path.posix.basename(relativePath, ".css");
    const root = postcss.parse(
      await readFile(path.join(themeCssDir, relativePath), "utf8"),
    );
    root.walkDecls((declaration) => {
      if (!declaration.prop.startsWith("--salt-")) return;
      const existing = tokens.get(declaration.prop) ?? {
        name: declaration.prop,
        tier,
        group,
        themes: new Set(),
        alias: undefined,
      };
      existing.themes.add(themeFor(relativePath));
      if (tier === "deprecated" && !existing.alias) {
        const match = /^var\((--salt-[a-z0-9-]+)\)$/.exec(
          declaration.value.trim(),
        );
        if (match) existing.alias = match[1];
      }
      tokens.set(declaration.prop, existing);
    });
  }
  const sorted = [...tokens.values()].sort((left, right) =>
    left.name.localeCompare(right.name),
  );
  // Only point deprecated tokens at tokens that may be referenced directly.
  const tierByName = new Map(sorted.map((token) => [token.name, token.tier]));
  for (const token of sorted) {
    const aliasTier = token.alias ? tierByName.get(token.alias) : undefined;
    token.replacement =
      aliasTier === "characteristics" || aliasTier === "foundations"
        ? token.alias
        : undefined;
  }
  return sorted;
}

function themeNote(themes) {
  if (themes.has("shared") || (themes.has("next") && themes.has("legacy"))) {
    return "";
  }
  if (themes.has("next")) return " (SaltProviderNext theme only)";
  if (themes.has("legacy")) return " (legacy theme only)";
  return "";
}

function tokenLine(token) {
  const replacement = token.replacement
    ? `: alias of \`${token.replacement}\``
    : "";
  return `- \`${token.name}\`${replacement}${themeNote(token.themes)}`;
}

function groupNames(tokens) {
  return [...new Set(tokens.map((token) => token.group))].sort();
}

/** Token lines, under a heading per group unless `grouped` is false. */
function tokenListLines(tokens, { grouped, headingLevel }) {
  if (!grouped) return [...tokens.map(tokenLine), ""];
  return groupNames(tokens).flatMap((group) => [
    `${"#".repeat(headingLevel)} ${group}`,
    "",
    ...tokens.filter((token) => token.group === group).map(tokenLine),
    "",
  ]);
}

function introLines({ packageVersion, links, split }) {
  return [
    "# Design tokens",
    "",
    `Every design token (CSS custom property) declared by \`@salt-ds/theme@${packageVersion}\`, grouped by tier. Values depend on the theme, mode and density; read the CSS in \`@salt-ds/theme/css\` for values.${split ? " The lists are split into files that can each be read in one go." : ""}`,
    "",
    `Read [Design tokens](${links.designTokens}) and [How to read semantic tokens](${links.howToRead}) before choosing tokens.`,
    "",
  ];
}

function finish(lines) {
  return `${lines.join("\n").trimEnd()}\n`;
}

/** Splits tokens into runs whose lists stay under `limit` bytes. */
function chunkTokens(tokens, limit) {
  const chunks = [];
  let current = [];
  let bytes = 0;
  for (const token of tokens) {
    const lineBytes = Buffer.byteLength(tokenLine(token)) + 1;
    if (current.length > 0 && bytes + lineBytes > limit) {
      chunks.push(current);
      current = [];
      bytes = 0;
    }
    current.push(token);
    bytes += lineBytes;
  }
  if (current.length > 0) chunks.push(current);
  return chunks;
}

function tokenCount(tokens) {
  return `${tokens.length} ${tokens.length === 1 ? "token" : "tokens"}`;
}

/**
 * Renders the design token reference. It is one `tokens.md` when that fits in
 * `budget`; otherwise `tokens.md` links to one file per tier, or per group and
 * then per part of a group for tiers that are too long to read in one go.
 */
export function renderTokenReference({
  tokens,
  packageVersion,
  links,
  budget = MAX_PAGE_BYTES,
}) {
  const tiers = TOKEN_TIERS.map((tier) => ({
    ...tier,
    tokens: tokens.filter((token) => token.tier === tier.key),
  })).filter((tier) => tier.tokens.length > 0);

  const single = finish([
    ...introLines({ packageVersion, links, split: false }),
    ...tiers.flatMap((tier) => [
      `## ${tier.title}`,
      "",
      tier.guidance,
      "",
      ...tokenListLines(tier.tokens, {
        grouped: tier.key !== "deprecated",
        headingLevel: 3,
      }),
    ]),
  ]);
  if (Buffer.byteLength(single) <= budget) {
    return [{ docPath: TOKEN_REFERENCE_PATH, markdown: single }];
  }

  const files = [];
  const overview = introLines({ packageVersion, links, split: true });
  const fileFor = ({ docPath, title, guidance, list }) => {
    const back = relativeDocLink(docPath, TOKEN_REFERENCE_PATH);
    files.push({
      docPath,
      markdown: finish([
        `# ${title}`,
        "",
        `${guidance} Part of the [design tokens reference](${back}) for \`@salt-ds/theme@${packageVersion}\`.`,
        "",
        ...list,
      ]),
    });
  };
  // Leaves room for a file's heading and guidance.
  const listBudget = budget - 1024;

  for (const tier of tiers) {
    overview.push(`## ${tier.title}`, "", tier.guidance, "");
    const grouped = tier.key !== "deprecated";
    const tierList = tokenListLines(tier.tokens, { grouped, headingLevel: 2 });
    if (Buffer.byteLength(tierList.join("\n")) <= listBudget) {
      const docPath = `tokens/${tier.key}.md`;
      fileFor({
        docPath,
        title: tier.title,
        guidance: tier.guidance,
        list: tierList,
      });
      const groups = grouped
        ? ` in groups: ${groupNames(tier.tokens).join(", ")}`
        : "";
      overview.push(
        `- [${tier.title}](${docPath}): ${tokenCount(tier.tokens)}${groups}.`,
        "",
      );
      continue;
    }
    for (const group of groupNames(tier.tokens)) {
      const chunks = chunkTokens(
        tier.tokens.filter((token) => token.group === group),
        listBudget,
      );
      chunks.forEach((chunk, index) => {
        const part = chunks.length > 1 ? index + 1 : undefined;
        const docPath = `tokens/${tier.key}/${group}${part ? `-${part}` : ""}.md`;
        const label = part
          ? `${group}, part ${part} of ${chunks.length}`
          : group;
        fileFor({
          docPath,
          title: `${tier.title}: ${label}`,
          guidance: tier.guidance,
          list: tokenListLines(chunk, { grouped: false }),
        });
        const range = part
          ? `, \`${chunk[0].name}\` to \`${chunk.at(-1).name}\``
          : "";
        overview.push(
          `- [${label}](${docPath}): ${tokenCount(chunk)}${range}.`,
        );
      });
    }
    overview.push("");
  }
  return [
    { docPath: TOKEN_REFERENCE_PATH, markdown: finish(overview) },
    ...files,
  ];
}

/** Icon component names exported by @salt-ds/icons, with deprecations. */
export async function collectIcons(iconsDir) {
  const componentsDir = path.join(iconsDir, "src", "components");
  const index = await readFile(path.join(componentsDir, "index.ts"), "utf8");
  const icons = [];
  for (const [, file] of index.matchAll(/export \* from "\.\/([^"]+)"/g)) {
    const source = await readFile(
      path.join(componentsDir, `${file}.tsx`),
      "utf8",
    );
    const pattern =
      /(?:\/\*\*([\s\S]*?)\*\/\s*)?export const ([A-Z][A-Za-z0-9]*Icon)\b/g;
    for (const [, comment, name] of source.matchAll(pattern)) {
      const deprecated = /@deprecated\s+([^\n*]*)/.exec(comment ?? "");
      icons.push({ name, deprecated: deprecated?.[1].trim() });
    }
  }
  return icons.sort((left, right) => left.name.localeCompare(right.name));
}

export function renderIconReference({ icons, packageVersion, links }) {
  const lines = [
    "# Icons",
    "",
    `Icon components exported by \`@salt-ds/icons@${packageVersion}\`. Import them by name, for example \`import { AddIcon } from "@salt-ds/icons";\`. See [Icon](${links.icon}) for usage and accessibility guidance.`,
    "",
  ];
  for (const icon of icons) {
    lines.push(
      icon.deprecated
        ? `- \`${icon.name}\`: deprecated ${icon.deprecated}`
        : `- \`${icon.name}\``,
    );
  }
  return `${lines.join("\n")}\n`;
}

/** Country symbol components exported by @salt-ds/countries. */
export async function collectCountrySymbols(countriesDir) {
  const index = await readFile(
    path.join(countriesDir, "src", "components", "index.ts"),
    "utf8",
  );
  return [...index.matchAll(/export \{ default as ([A-Za-z0-9_]+) \}/g)]
    .map((match) => match[1])
    .sort();
}

export function renderCountrySymbolReference({
  symbols,
  packageVersion,
  links,
}) {
  const codes = symbols.filter((symbol) => !symbol.endsWith("_Sharp"));
  const sharp = new Set(symbols.filter((symbol) => symbol.endsWith("_Sharp")));
  const allSharp = codes.every((code) => sharp.has(`${code}_Sharp`));
  const lines = [
    "# Country symbols",
    "",
    `Country symbol components exported by \`@salt-ds/countries@${packageVersion}\`, named by ISO 3166-1 alpha-2 code. Import them by name, for example \`import { GB } from "@salt-ds/countries";\`. See [Country symbol](${links.countrySymbol}) for usage.`,
    "",
    allSharp
      ? "Each symbol also has a sharp variant named with a `_Sharp` suffix, for example `GB_Sharp`."
      : `Sharp variants: ${[...sharp].map((symbol) => `\`${symbol}\``).join(", ")}.`,
    "",
    codes.map((code) => `\`${code}\``).join(", "),
  ];
  return `${lines.join("\n")}\n`;
}
