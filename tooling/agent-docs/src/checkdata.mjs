import { deprecationOf } from "./mdx.mjs";

/** Each documented package's data for salt-check.mjs, in its docs folder. */
// The CLI reads the data, so it names the file.
export { CHECK_DATA_FILE } from "../../../packages/cli/lib/packages.mjs";
export const CHECK_SCHEMA_VERSION = 1;

/**
 * Token data for `@salt-ds/theme`: every token's state and replacements, and
 * the token reference page that lists it. A token is "deprecated" when every
 * theme that declares it deprecates it, and "palette" when it's only a
 * palette token in a group that characteristics reference (so it shouldn't be
 * used directly).
 */
export function tokenCheckData({ tokens, files }) {
  const page = new Map();
  for (const [docPath, markdown] of files) {
    for (const [, name] of markdown.matchAll(/^- `(--salt-[\w-]+)`/gm)) {
      if (!page.has(name)) page.set(name, docPath);
    }
  }
  const byName = new Map();
  for (const token of tokens) {
    if (!byName.has(token.name)) byName.set(token.name, []);
    byName.get(token.name).push(token);
  }
  const pages = [...new Set(page.values())].sort();
  const entries = {};
  for (const [name, declared] of [...byName].sort(([left], [right]) =>
    left < right ? -1 : left > right ? 1 : 0,
  )) {
    const current = declared.filter(({ tier }) => tier !== "deprecated");
    const state =
      current.length === 0
        ? "deprecated"
        : current.every(({ tier, direct }) => tier === "palette" && !direct)
          ? "palette"
          : "current";
    const replacements =
      state === "deprecated"
        ? (declared.find(({ replacements }) => replacements)?.replacements ??
          [])
        : [];
    entries[name] = [
      state,
      pages.indexOf(page.get(name)),
      ...(replacements.length > 0 ? [replacements] : []),
    ];
  }
  return { pages, tokens: entries };
}

/**
 * Component data for a package: each component's docs page, deprecated props
 * with their deprecation text, and required parts.
 */
export function componentCheckData({ components, pages, requiredParts }) {
  const entries = {};
  for (const [name, component] of [...components].sort(([left], [right]) =>
    left < right ? -1 : left > right ? 1 : 0,
  )) {
    const entry = {};
    if (pages.has(name)) entry.page = pages.get(name);
    const deprecated = {};
    for (const prop of Object.values(component.props ?? {})) {
      const text = deprecationOf(prop.description);
      if (text) deprecated[prop.name] = text;
    }
    if (Object.keys(deprecated).length > 0) entry.deprecatedProps = deprecated;
    if (requiredParts[name]) entry.parts = requiredParts[name];
    if (Object.keys(entry).length > 0) entries[name] = entry;
  }
  return { components: entries };
}

export function renderCheckData({ packageName, version, data }) {
  return `${JSON.stringify({ schemaVersion: CHECK_SCHEMA_VERSION, name: packageName, version, ...data })}\n`;
}
