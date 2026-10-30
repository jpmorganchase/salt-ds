import { readFile } from "node:fs/promises";
import path from "node:path";
import postcss from "postcss";
import { MAX_PAGE_BYTES } from "./config.mjs";
import { compareText, listFiles } from "./files.mjs";
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
      "Intermediate values used by characteristic tokens to support modes. Don't reference palette tokens directly, except in a group that no characteristic token references, which is marked.",
  },
  {
    key: "deprecated",
    title: "Deprecated tokens",
    guidance:
      "Do not use these tokens in new code. A replacement is shown when the theme CSS or changelog names one, and an alias when every declaration directly references the same characteristic or foundation token. Check the theme changelog for other replacements.",
  },
];

function tierFor(relativePath) {
  if (relativePath.split("/").includes("deprecated")) return "deprecated";
  if (relativePath.includes("/palette/")) return "palette";
  if (relativePath.includes("/characteristics/")) return "characteristics";
  if (relativePath.split("/").includes("foundations")) return "foundations";
  return undefined;
}

const THEME_ENTRYPOINTS = {
  legacy: "theme.css",
  next: "theme-next.css",
  "salt-interim": "experimental/salt-interim.css",
};

/** Availability follows stylesheet imports, not the directory holding a token. */
function stylesheetThemes(stylesheets) {
  const themes = new Map();
  function visit(file, theme) {
    const root = stylesheets.get(file);
    if (!root) throw new Error(`Cannot resolve theme stylesheet: ${file}`);
    if (!themes.has(file)) themes.set(file, new Set());
    if (themes.get(file).has(theme)) return;
    themes.get(file).add(theme);
    root.walkAtRules("import", (rule) => {
      // Local CSS imports may use url(...), url("..."), or "...".
      const match =
        /^(?:url\(\s*(?:"([^"]+)"|'([^']+)'|([^)'"\s]+))\s*\)|"([^"]+)"|'([^']+)')/.exec(
          rule.params,
        );
      const target = match?.slice(1).find(Boolean);
      if (!target) {
        throw new Error(`Unsupported CSS @import in ${file}: ${rule.params}`);
      }
      visit(path.posix.join(path.posix.dirname(file), target), theme);
    });
  }
  for (const [theme, entry] of Object.entries(THEME_ENTRYPOINTS)) {
    visit(entry, theme);
  }
  return themes;
}

/**
 * A theme can declare a token in a current tier file and again in a deprecated
 * one, as when a deprecated token is reinstated; the current declaration wins.
 */
function preferredDeclaration(declarations) {
  return (
    declarations.find(({ tier }) => tier !== "deprecated") ?? declarations[0]
  );
}

/**
 * The replacement a deprecated declaration's trailing comment names, as in
 * `/* Use --salt-x *\/`, `/* Use ---salt-x *\/` or `/* --salt-x *\/`.
 */
function namedReplacement(declaration) {
  const comment = declaration.next();
  if (
    comment?.type !== "comment" ||
    comment.source?.start?.line !== declaration.source?.end?.line
  ) {
    return undefined;
  }
  return /^(?:use\s+)?-*(--salt-[A-Za-z0-9-]+)$/i.exec(
    comment.text.trim(),
  )?.[1];
}

const TOKEN_LIST = /^`?--salt-[\w-]+`?(?:\s+or\s+`?--salt-[\w-]+`?)*$/;

/**
 * Replacements a ```diff block's hunk records: a run of removed tokens then a
 * run of added ones, which pair up in order when there are as many of each,
 * or all go to the one added token. Other hunks are ambiguous. A hunk with a
 * line that isn't a token, such as a CSS declaration using one, isn't a list
 * of tokens. An added line may declare its token, giving the new token's
 * value, but a removed line that declares one, `- --salt-a: 1px;`, gives its
 * old value, so the hunk lists value changes, as does a hunk with a token on
 * both sides, however they're ordered. A removed token's own comment, as in
 * `- --salt-a /* Use --salt-b *\/`, names its replacement when it names only
 * a token, and otherwise records that it has none.
 */
function diffHunkReplacements({ removed, added }) {
  const entries = [];
  const paired = removed.filter(({ comment }) => comment === undefined);
  for (const { token, comment, line } of removed) {
    if (comment === undefined) continue;
    const named = /^use\s+(--salt-[\w-]+)$/i.exec(comment)?.[1];
    entries.push({ line, token, names: named ? [named] : undefined });
  }
  const addedTokens = new Set(added.map(({ token }) => token));
  if (
    paired.length > 0 &&
    (added.length === paired.length || added.length === 1) &&
    !removed.some(({ token }) => addedTokens.has(token))
  ) {
    paired.forEach(({ token, line }, index) => {
      const to = added[added.length === 1 ? 0 : index].token;
      entries.push({ line, token, names: [to] });
    });
  }
  return entries;
}

/**
 * Replacements the theme changelog records, in two forms. Tables whose first
 * column is a token and a later column is headed "Replacement" or "Use
 * instead", where a cell other than tokens joined by "or", such as a
 * calculation or "None", names no replacement. And ```diff blocks listing
 * removed tokens before the tokens that replace them; see
 * `diffHunkReplacements`. A token mentioned as undeprecated has none. The
 * newest release comes first and wins.
 */
export function changelogReplacements(markdown) {
  const entries = [];
  const cells = (line) =>
    line
      .trim()
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim());
  const lines = markdown.split("\n");
  // The table column holding replacements, if the current table has one.
  let column = -1;
  let fence;
  let hunk;
  const endHunk = () => {
    if (hunk && !hunk.invalid) entries.push(...diffHunkReplacements(hunk));
    hunk = undefined;
  };
  lines.forEach((line, index) => {
    const fenceMatch = /^\s*(`{3,}|~{3,})\s*(\w*)/.exec(line);
    if (fence) {
      if (fenceMatch && fenceMatch[1][0] === fence.marker[0]) {
        endHunk();
        fence = undefined;
        return;
      }
      if (!fence.diff) return;
      const change = /^\s*([-+])\s*(.*)$/.exec(line);
      if (!change || change[2] === "") {
        endHunk();
        return;
      }
      const [, sign, text] = change;
      const token = /^--salt-[\w-]+/.exec(text)?.[0];
      if (sign === "-" && hunk?.added.length > 0) endHunk();
      hunk ??= { removed: [], added: [] };
      if (!token || (sign === "-" && /^--salt-[\w-]+\s*:/.test(text))) {
        hunk.invalid = true;
      } else if (sign === "+") {
        hunk.added.push({ token });
      } else {
        const comment = /\/\*\s*(.*?)\s*\*\//.exec(text)?.[1];
        hunk.removed.push({ token, comment, line: index });
      }
      return;
    }
    if (fenceMatch) {
      fence = { marker: fenceMatch[1], diff: fenceMatch[2] === "diff" };
      column = -1;
      return;
    }
    // A token that was undeprecated lost the replacement it had, whether
    // "Undeprecated", "Undeprecate" or "Un-deprecated".
    if (/\bun-?deprecat/i.test(line)) {
      for (const [token] of line.matchAll(/--salt-[\w-]+/g)) {
        entries.push({ line: index, token, names: undefined });
      }
    }
    if (/^\s*\|[\s:|-]+\|\s*$/.test(line)) {
      column = cells(lines[index - 1] ?? "").findIndex(
        (header, at) => at > 0 && /^(?:replacement|use instead)/i.test(header),
      );
      return;
    }
    if (!line.trim().startsWith("|")) {
      column = -1;
      return;
    }
    if (column < 0) return;
    const row = cells(line);
    const token = /^`?(--salt-[\w-]+)`?$/.exec(row[0])?.[1];
    if (!token) return;
    const to = row[column] ?? "";
    entries.push({
      line: index,
      token,
      names: TOKEN_LIST.test(to)
        ? [...to.matchAll(/--salt-[\w-]+/g)].map(([name]) => name)
        : undefined,
    });
  });
  const replacements = new Map();
  const seen = new Set();
  for (const { token, names } of entries.sort(
    (left, right) => left.line - right.line,
  )) {
    if (seen.has(token)) continue;
    seen.add(token);
    if (names) replacements.set(token, names);
  }
  return replacements;
}

/**
 * Collects every `--salt-*` custom property declared in the theme CSS, with
 * one entry per tier the token has: a token can be current in one theme and
 * deprecated in another. `changelog` holds the replacements from
 * `changelogReplacements`, and `warn` reports named replacements that can't
 * be used.
 */
export async function collectTokens(
  themeCssDir,
  { changelog = new Map(), warn = () => {} } = {},
) {
  const files = await listFiles(themeCssDir, (file) => file.endsWith(".css"));
  const stylesheets = new Map(
    await Promise.all(
      files.map(async (file) => [
        file,
        postcss.parse(await readFile(path.join(themeCssDir, file), "utf8")),
      ]),
    ),
  );
  const themes = stylesheetThemes(stylesheets);
  // Declarations in the classified token files, in file order.
  const declarationsByName = new Map();
  const aliasesByName = new Map();
  // Replacements that deprecated declarations' comments name.
  const namedByName = new Map();
  // Tokens that characteristic tokens reference.
  const referencedByCharacteristics = new Set();
  for (const relativePath of files) {
    const tier = tierFor(relativePath);
    const group = path.posix.basename(relativePath, ".css");
    const fileThemes = themes.get(relativePath) ?? new Set();
    const root = stylesheets.get(relativePath);
    root.walkDecls((declaration) => {
      if (!declaration.prop.startsWith("--salt-")) return;
      const alias = /^var\(\s*(--salt-[A-Za-z0-9-]+)\s*\)$/.exec(
        declaration.value.trim(),
      )?.[1];
      const aliases = aliasesByName.get(declaration.prop) ?? new Set();
      // Keep undefined too: a literal, calculation or fallback is not an alias.
      // Overrides outside the classified token files must also agree.
      aliases.add(alias);
      aliasesByName.set(declaration.prop, aliases);
      if (!tier) return;
      if (tier === "characteristics") {
        for (const [, name] of declaration.value.matchAll(
          /var\(\s*(--salt-[A-Za-z0-9-]+)/g,
        )) {
          referencedByCharacteristics.add(name);
        }
      }
      const named = tier === "deprecated" && namedReplacement(declaration);
      if (named) {
        if (!namedByName.has(declaration.prop)) {
          namedByName.set(declaration.prop, new Set());
        }
        namedByName.get(declaration.prop).add(named);
      }
      if (!declarationsByName.has(declaration.prop)) {
        declarationsByName.set(declaration.prop, []);
      }
      declarationsByName
        .get(declaration.prop)
        .push({ tier, group, themes: fileThemes });
    });
  }

  const tokens = [];
  for (const [name, declarations] of declarationsByName) {
    const entries = new Map();
    const entryFor = ({ tier, group }) => {
      if (!entries.has(tier)) {
        entries.set(tier, { name, tier, group, themes: new Set() });
      }
      return entries.get(tier);
    };
    for (const theme of Object.keys(THEME_ENTRYPOINTS)) {
      const inTheme = declarations.filter((declaration) =>
        declaration.themes.has(theme),
      );
      if (inTheme.length > 0) {
        entryFor(preferredDeclaration(inTheme)).themes.add(theme);
      }
    }
    // Declared only in files that no supported entrypoint imports.
    if (entries.size === 0) entryFor(preferredDeclaration(declarations));
    tokens.push(...entries.values());
  }
  const sorted = tokens.sort(
    (left, right) =>
      compareText(left.name, right.name) ||
      TOKEN_TIERS.findIndex(({ key }) => key === left.tier) -
        TOKEN_TIERS.findIndex(({ key }) => key === right.tier),
  );
  // Only point deprecated tokens at tokens that may be referenced directly.
  const tierByName = new Map();
  for (const token of sorted) {
    if (!tierByName.has(token.name) || token.tier !== "deprecated") {
      tierByName.set(token.name, token.tier);
    }
  }
  const usable = (name) => {
    const tier = tierByName.get(name);
    return tier === "characteristics" || tier === "foundations";
  };
  // Each deprecated token's next step: the replacement its theme CSS names,
  // then the theme changelog's, then an alias inferred from its values.
  const steps = new Map();
  for (const token of sorted) {
    const aliases = aliasesByName.get(token.name);
    token.alias =
      aliases.size === 1 ? aliases.values().next().value : undefined;
    if (token.tier !== "deprecated") continue;
    const named = namedByName.get(token.name);
    if (named?.size > 1) {
      warn(
        `${token.name}: the theme CSS names different replacements in different themes (${[...named].join(", ")}), so none is shown.`,
      );
    } else if (named) {
      steps.set(token.name, { names: [...named], source: "the theme CSS" });
    } else if (changelog.has(token.name)) {
      steps.set(token.name, {
        names: changelog.get(token.name),
        source: "the theme changelog",
      });
    } else if (token.alias) {
      steps.set(token.name, { names: [token.alias] });
    }
  }
  // Follows replacements that are themselves deprecated to current tokens.
  const resolve = (name, seen = new Set()) => {
    if (usable(name)) return [name];
    if (seen.has(name)) return [];
    seen.add(name);
    return [
      ...new Set(
        (steps.get(name)?.names ?? []).flatMap((next) => resolve(next, seen)),
      ),
    ];
  };
  for (const token of sorted) {
    const step = token.tier === "deprecated" && steps.get(token.name);
    if (!step) continue;
    // From its replacements: a token deprecated in one theme can be usable
    // in another, and isn't its own replacement.
    const replacements = [
      ...new Set(
        step.names.flatMap((next) => resolve(next, new Set([token.name]))),
      ),
    ];
    if (replacements.length > 0) {
      token.replacements = replacements;
      // Otherwise the token is an alias of its replacement.
      token.replacementNamed =
        Boolean(step.source) ||
        replacements.length > 1 ||
        replacements[0] !== token.alias;
      continue;
    }
    // A replacement that is deprecated with no replacement of its own, as the
    // shadow colors are, leaves the token without one. Only the theme CSS's
    // comments can be corrected; the changelog records past releases.
    for (const name of step.source === "the theme CSS" ? step.names : []) {
      if (!tierByName.has(name)) {
        warn(
          `${token.name}: ${step.source} names ${name} as its replacement, which is not a token, so none is shown.`,
        );
      } else if (tierByName.get(name) !== "deprecated") {
        warn(
          `${token.name}: ${step.source} names ${name} as its replacement, which is a ${tierByName.get(name)} token, so it isn't shown.`,
        );
      }
    }
  }
  // Palette groups that no characteristic references are used directly, as
  // Salt's components use the corner tokens for border radius.
  const paletteGroups = new Map();
  for (const token of sorted.filter(({ tier }) => tier === "palette")) {
    if (!paletteGroups.has(token.group)) paletteGroups.set(token.group, []);
    paletteGroups.get(token.group).push(token);
  }
  for (const group of paletteGroups.values()) {
    const direct = group.every(
      (token) => !referencedByCharacteristics.has(token.name),
    );
    for (const token of group) token.direct = direct;
  }
  return sorted;
}

const DIRECT_PALETTE_NOTE =
  "No characteristic token references these, so reference them directly.";

function themeNote(themes) {
  if (themes.size === Object.keys(THEME_ENTRYPOINTS).length) return "";
  if (themes.size === 0) {
    return " (not included in the supported theme entrypoints)";
  }
  const names = [
    ["next", "SaltProviderNext"],
    ["legacy", "legacy"],
    ["salt-interim", "experimental salt-interim"],
  ]
    .filter(([key]) => themes.has(key))
    .map(([, name]) => name);
  return names.length > 0
    ? ` (${names.join(" and ")} ${names.length === 1 ? "theme" : "themes"} only)`
    : "";
}

function tokenLine(token) {
  const replacements = (token.replacements ?? [])
    .map((name) => `\`${name}\``)
    .join(" or ");
  const replacement = token.replacementNamed
    ? `: use ${replacements} instead`
    : replacements
      ? `: alias of ${replacements}`
      : "";
  return `- \`${token.name}\`${replacement}${themeNote(token.themes)}`;
}

function groupNames(tokens) {
  return [...new Set(tokens.map((token) => token.group))].sort();
}

/** Token lines, under a heading per group unless `grouped` is false. */
function tokenListLines(tokens, { grouped, headingLevel }) {
  if (!grouped) return [...tokens.map(tokenLine), ""];
  return groupNames(tokens).flatMap((group) => {
    const groupTokens = tokens.filter((token) => token.group === group);
    return [
      `${"#".repeat(headingLevel)} ${group}`,
      "",
      ...(groupTokens.every((token) => token.direct)
        ? [DIRECT_PALETTE_NOTE, ""]
        : []),
      ...groupTokens.map(tokenLine),
      "",
    ];
  });
}

function introLines({ packageVersion, links, split }) {
  return [
    "# Design tokens",
    "",
    `Every design token (CSS custom property) declared by \`@salt-ds/theme@${packageVersion}\`, grouped by tier. Values depend on the theme, mode and density; read the CSS in \`@salt-ds/theme/css\` for values.${split ? " The lists are split into files that can each be read in one go." : ""}`,
    "",
    `Read [Design tokens](${links.designTokens}) and [How to read semantic tokens](${links.howToRead}) before choosing tokens. Prefer a component prop where one does the job, and use tokens for custom styling.`,
    "",
    'Tokens marked experimental salt-interim require `@salt-ds/theme/css/experimental/salt-interim.css` and `theme="salt-interim"` on `SaltProvider`. This theme is experimental and is not recommended for production use.',
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
        const direct = chunk.every((token) => token.direct);
        fileFor({
          docPath,
          title: `${tier.title}: ${label}`,
          guidance: direct
            ? `${tier.guidance} ${DIRECT_PALETTE_NOTE}`
            : tier.guidance,
          list: tokenListLines(chunk, { grouped: false }),
        });
        const range = part
          ? `, \`${chunk[0].name}\` to \`${chunk.at(-1).name}\``
          : "";
        overview.push(
          `- [${label}](${docPath}): ${tokenCount(chunk)}${range}.${direct ? ` ${DIRECT_PALETTE_NOTE}` : ""}`,
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
  return icons.sort((left, right) => compareText(left.name, right.name));
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
