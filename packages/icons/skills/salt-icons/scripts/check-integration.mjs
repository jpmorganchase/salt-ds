#!/usr/bin/env node
// Read-only integration checks for explicitly requested Salt icon basenames.
// No repository module is imported or evaluated. Geometry belongs to the artwork workflow's
// own generator/validator; this checks the surrounding registration artifacts.
import fs from "node:fs/promises";
import path from "node:path";

const HELP = `Usage:
  node check-integration.mjs --repo <repo-root> <basename> [basename ...]

Check only the named meanings and their registered SVG variants. Use bare,
lowercase basenames (bank-check, devices, favorite_strong), without .svg or
_solid. Unrelated legacy catalogue omissions are outside this check's scope.

Checks: inventory/SVG agreement, website synonym matching,
synonym/category hygiene, components and exports, story/site lists, CSS classes.
Exit 0: scoped checks pass (warnings may remain). Exit 1: errors or bad arguments.
This command reads files only. --help prints this message.
`;

const FILES = {
  inventory: "packages/icons/scripts/artwork/inventory.json",
  synonyms: "site/src/components/icon-preview/salt-icon-synonym.json",
  matcher: "site/src/components/icon-preview/IconPreview.tsx",
  index: "packages/icons/src/components/index.ts",
  story: "packages/icons/stories/icon.all.ts",
  site: "site/src/components/icon-preview/allIconsList.ts",
  css: "packages/icons/saltIcons.css",
};

function argumentsFor(args) {
  if (args.includes("--help") || args.includes("-h")) return { help: true };
  let repo;
  const names = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--repo") {
      if (repo || !args[i + 1] || args[i + 1].startsWith("--"))
        throw new Error("Supply --repo <repo-root> exactly once.");
      repo = args[++i];
    } else if (args[i].startsWith("-")) {
      throw new Error(`Unknown option: ${args[i]}`);
    } else {
      names.push(args[i]);
    }
  }
  if (!repo || !names.length)
    throw new Error("--repo and at least one explicit basename are required.");
  for (const name of names) {
    if (!/^[a-z0-9]+(?:[-_][a-z0-9]+)*$/.test(name) || name.endsWith("_solid"))
      throw new Error(`Use a bare lowercase basename without .svg or _solid: ${name}`);
  }
  if (new Set(names).size !== names.length)
    throw new Error("Supply each basename only once.");
  return { repo: path.resolve(repo), names };
}

// Matches getIconMetadataFromFileName/pascalCase in generateIcons.mjs.
function componentStem(file) {
  return file.slice(0, -4).split("_").join("-").split("-").map((part) =>
    part.charAt(0).toLocaleUpperCase("en-US") + part.slice(1).toLocaleLowerCase("en-US"),
  ).join("");
}

// A small lexer, not a TypeScript evaluator: comments and quoted strings cannot
// masquerade as exports/imports. The generated files use simple declarations.
function tokens(source) {
  const result = [];
  for (let i = 0; i < source.length;) {
    const start = i;
    const c = source[i];
    if (/\s/.test(c)) { i++; continue; }
    if (source.startsWith("//", i)) {
      i = source.indexOf("\n", i + 2);
      if (i < 0) break;
      continue;
    }
    if (source.startsWith("/*", i)) {
      const end = source.indexOf("*/", i + 2);
      if (end < 0) throw new Error("Unterminated source comment.");
      i = end + 2;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      let value = "";
      i++;
      while (i < source.length && source[i] !== c) {
        if (source[i] === "\\") {
          // Escaped module names are outside the generated source profile.
          value += source.slice(i, i + 2);
          i += 2;
        } else value += source[i++];
      }
      if (i >= source.length) throw new Error("Unterminated source string.");
      i++;
      result.push({ type: c === "`" ? "template" : "string", value, start });
      continue;
    }
    const identifier = source.slice(i).match(/^[A-Za-z_$][\w$]*/);
    if (identifier) {
      i += identifier[0].length;
      result.push({ type: "id", value: identifier[0], start });
    } else {
      result.push({ type: "punct", value: c, start });
      i++;
    }
  }
  return result;
}

function closingBrace(items, opening) {
  let depth = 0;
  for (let i = opening; i < items.length; i++) {
    if (items[i].type !== "punct") continue;
    if (items[i].value === "{") depth++;
    if (items[i].value === "}" && --depth === 0) return i;
  }
  return -1;
}

function sequenceCount(items, values) {
  let count = 0;
  for (let i = 0; i <= items.length - values.length; i++) {
    if (values.every((value, j) => items[i + j].value === value)) count++;
  }
  return count;
}

function indexExports(items, stem) {
  let count = 0;
  for (let i = 0; i < items.length - 3; i++) {
    if (items[i].value === "export" && items[i + 1].value === "*" &&
        items[i + 2].value === "from" && items[i + 3].type === "string" &&
        items[i + 3].value === `./${stem}`) count++;
  }
  return count;
}

function listRegistrations(items, symbol) {
  let imports = 0;
  let members = 0;
  let objects = 0;
  for (let i = 0; i < items.length; i++) {
    if (items[i].value === "import" && items[i + 1]?.value === "{") {
      const end = closingBrace(items, i + 1);
      if (end < 0) continue;
      if (items[end + 1]?.value === "from" && items[end + 2]?.value === "@salt-ds/icons") {
        for (let j = i + 2; j < end; j++) {
          if (items[j].value === symbol && ["{", ","].includes(items[j - 1].value) &&
              ["}", ","].includes(items[j + 1].value)) imports++;
        }
      }
    }
    if (items[i].value === "export" && items[i + 1]?.value === "const" &&
        items[i + 2]?.value === "allIcons" && items[i + 3]?.value === "=" &&
        items[i + 4]?.value === "{") {
      objects++;
      const end = closingBrace(items, i + 4);
      if (end < 0) continue;
      for (let j = i + 5; j < end; j++) {
        if (items[j].value === symbol && ["{", ","].includes(items[j - 1].value) &&
            ["}", ","].includes(items[j + 1].value)) members++;
      }
    }
  }
  return { imports, members, objects };
}

function verifyMatcherSource(source) {
  // Fail closed if the website matcher changes: do not silently validate using
  // a stale matcher. Read the simple current function as tokens, never eval it.
  const items = tokens(source);
  const start = items.findIndex((item, i) => item.value === "isIconNameMatch" &&
    items[i - 1]?.value === "const");
  if (start < 0) return false;
  const opening = items.findIndex((item, i) => i > start && item.value === "{");
  const end = closingBrace(items, opening);
  if (end < 0) return false;
  const body = items.slice(opening + 1, end);
  const pattern = body.find((item) => item.type === "template");
  if (!pattern || !/^\^\$\{figmaIconName\.replace\(\/-\/g,\s*(?:""|'')\)\}\(Solid\)\?Icon\$$/.test(pattern.value))
    return false;
  const normalized = body.filter((item) => item.value !== "," && item.value !== ";")
    .map((item) => item.type === "template" ? "PATTERN" : item.value).join(" ");
  return normalized === "const regex = new RegExp ( PATTERN i ) return regex . test ( componentName )";
}

async function main() {
  const options = argumentsFor(process.argv.slice(2));
  if (options.help) { console.log(HELP); return; }
  const { repo, names } = options;
  const errors = [];
  const warnings = new Set();
  const fail = (message) => errors.push(message);
  const warn = (message) => warnings.add(message);
  const read = async (relative) => {
    try { return await fs.readFile(path.join(repo, relative), "utf8"); }
    catch (error) { throw new Error(`${relative}: ${error.code ?? error.message}`); }
  };
  const source = Object.fromEntries(await Promise.all(Object.entries(FILES).map(
    async ([key, relative]) => [key, await read(relative)],
  )));
  const jsonArray = (key) => {
    let data;
    try { data = JSON.parse(source[key]); }
    catch { throw new Error(`${FILES[key]}: invalid JSON.`); }
    if (!Array.isArray(data)) throw new Error(`${FILES[key]}: expected a JSON array.`);
    return data;
  };
  const inventory = jsonArray("inventory");
  const metadata = jsonArray("synonyms");
  if (!verifyMatcherSource(source.matcher))
    fail(`${FILES.matcher}: matcher differs from the supported hyphen-removal, optional-Solid, case-insensitive contract. Review the checker before relying on its metadata results.`);
  const svgDir = "packages/icons/src/SVG";
  const actualFiles = (await fs.readdir(path.join(repo, svgDir), { withFileTypes: true }))
    .filter((entry) => entry.isFile()).map((entry) => entry.name);
  const componentFiles = new Set((await fs.readdir(path.join(repo, "packages/icons/src/components"), { withFileTypes: true }))
    .filter((entry) => entry.isFile()).map((entry) => entry.name));
  const syntax = Object.fromEntries(["index", "story", "site"].map((key) => [key, tokens(source[key])]));
  const css = source.css.replace(/\/\*[\s\S]*?\*\//g, "");
  const metadataMatchers = metadata.map((entry, index) => {
    if (!entry || typeof entry.iconName !== "string") return { entry, index };
    try {
      return { entry, index, regex: new RegExp(`^${entry.iconName.replace(/-/g, "")}(Solid)?Icon$`, "i") };
    } catch {
      warn(`${FILES.synonyms} row ${index + 1}: invalid iconName regular expression; the website matcher can throw when it reaches this row.`);
      return { entry, index };
    }
  });
  const inspectedRows = new Set();
  let variantTotal = 0;

  function checkMetadataRow({ entry, index }, name) {
    if (inspectedRows.has(index)) return;
    inspectedRows.add(index);
    const location = `${FILES.synonyms} row ${index + 1} (${name})`;
    if (entry.iconName !== entry.iconName.toLowerCase())
      warn(`${location}: iconName case is ignored by matching, but lowercase metadata names avoid misleading differences.`);
    if (/\s/.test(entry.iconName))
      warn(`${location}: whitespace in iconName is not removed by component matching.`);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(entry.iconName))
      fail(`${location}: use a plain hyphenated iconName; the website treats other characters as a regular expression and does not remove underscores.`);
    if (!Array.isArray(entry.synonym) || entry.synonym.length === 0) {
      fail(`${location}: synonym must be a nonempty array of lowercase terms.`);
    } else {
      const seen = new Set();
      entry.synonym.forEach((term, termIndex) => {
        if (typeof term !== "string" || !term.trim()) {
          fail(`${location}: synonym term ${termIndex + 1} must be a nonempty string.`);
          return;
        }
        if (term !== term.toLowerCase())
          fail(`${location}: synonym term ${termIndex + 1} must be lowercase; stored terms are searched case-sensitively.`);
        if (term !== term.trim())
          fail(`${location}: synonym term ${termIndex + 1} has leading/trailing whitespace.`);
        if (/\s/.test(term))
          warn(`${location}: synonym term ${termIndex + 1} contains whitespace. Search normalization removes whitespace from the query, not stored terms; a full spaced phrase may not match this term.`);
        const key = term.trim().toLowerCase();
        if (seen.has(key)) fail(`${location}: duplicate synonym term ${termIndex + 1} after trimming and lowercasing.`);
        seen.add(key);
      });
    }
    if (typeof entry.category !== "string" || !entry.category.trim())
      fail(`${location}: category must be a nonempty lowercase string.`);
    else {
      if (entry.category !== entry.category.toLowerCase()) fail(`${location}: category must be lowercase.`);
      if (entry.category !== entry.category.trim()) fail(`${location}: category has leading/trailing whitespace.`);
    }
  }

  for (const name of names) {
    const variants = [`${name}.svg`, `${name}_solid.svg`];
    const registered = variants.filter((file) => inventory.includes(file));
    const present = variants.filter((file) => actualFiles.includes(file));
    if (!registered.length) fail(`${name}: no requested variants registered in ${FILES.inventory}.`);
    for (const file of variants) {
      const count = inventory.filter((entry) => entry === file).length;
      if (count > 1) fail(`${file}: inventory contains ${count} duplicate registrations.`);
      if ((count > 0) !== present.includes(file))
        fail(`${file}: inventory/SVG disagreement (${count ? "registered but missing SVG" : "SVG exists but is unregistered"}).`);
      const wrongCase = actualFiles.filter((actual) => actual !== file && actual.toLowerCase() === file);
      if (wrongCase.length) fail(`${file}: actual SVG filename has different case: ${wrongCase.join(", ")}.`);
    }
    for (const file of registered) {
      variantTotal++;
      const stem = componentStem(file);
      const symbol = `${stem}Icon`;
      const collisions = [...new Set(inventory.filter((entry) => typeof entry === "string" &&
        entry.endsWith(".svg") && componentStem(entry) === stem))];
      if (collisions.length > 1) fail(`${file}: generated name ${symbol} collides with ${collisions.join(", ")}.`);
      const componentPath = `packages/icons/src/components/${stem}.tsx`;
      try {
        if (!componentFiles.has(`${stem}.tsx`))
          throw new Error(`${componentPath}: missing generated component file (exact filename case required).`);
        const component = tokens(await read(componentPath));
        if (sequenceCount(component, ["export", "const", symbol, "="]) !== 1)
          fail(`${componentPath}: expected exactly one exported ${symbol} declaration.`);
        if (sequenceCount(component, ["export", "type", `${symbol}Props`, "="]) !== 1)
          fail(`${componentPath}: expected exactly one exported ${symbol}Props declaration.`);
      } catch (error) { fail(error.message); }
      const exports = indexExports(syntax.index, stem);
      if (exports !== 1) fail(`${FILES.index}: expected one export from ./${stem}, found ${exports}.`);
      for (const key of ["story", "site"]) {
        const registration = listRegistrations(syntax[key], symbol);
        if (registration.imports !== 1 || registration.members !== 1 || registration.objects !== 1)
          fail(`${FILES[key]}: ${symbol} needs one @salt-ds/icons import and one shorthand member in one exported allIcons object (found ${registration.imports}/${registration.members}/${registration.objects}).`);
      }
      const escaped = stem.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const cssCount = [...css.matchAll(new RegExp(`(?:^|})\\s*\\.saltIcons-${escaped}(?=\\s*[{,])`, "g"))].length;
      if (cssCount !== 1) fail(`${FILES.css}: expected one .saltIcons-${stem} class selector, found ${cssCount}.`);

      const matches = metadataMatchers.filter(({ regex }) => regex?.test(symbol));
      if (matches.length !== 1)
        fail(`${symbol}: expected exactly one website synonym match, found ${matches.length}${matches.length ? ` (rows ${matches.map(({ index }) => index + 1).join(", ")}; duplicate/overlapping normalized matches make .find order-dependent)` : ""}.`);
      for (const match of matches) checkMetadataRow(match, name);
      if (!matches.length) {
        const intended = stem.replace(/Solid$/, "").toLowerCase();
        for (const row of metadataMatchers) {
          if (typeof row.entry?.iconName === "string" &&
              row.entry.iconName.replace(/[-_\s]/g, "").toLowerCase() === intended) {
            warn(`${symbol}: near-match at metadata row ${row.index + 1}; the real matcher removes hyphens only, not underscores or whitespace.`);
            checkMetadataRow(row, name);
          }
        }
      }
    }
    console.log(`Checked ${name}: ${registered.length} registered variant(s).`);
  }
  for (const warning of warnings) console.log(`WARN ${warning}`);
  for (const error of errors) console.error(`FAIL ${error}`);
  console.log(`\n${errors.length ? "FAIL" : "PASS"}: ${names.length} requested meaning(s), ${variantTotal} registered variant(s), ${errors.length} error(s), ${warnings.size} warning(s).`);
  console.log("Limits: registration checks only; no visual/semantic relevance, generated-geometry equivalence, or recipe execution checks. generate:icons and validate:icons own effective recipe and geometry validation.");
  console.log("Search normalization: the query is lowercased and whitespace is removed; stored synonym terms are not normalized. Hyphens are removed only when matching metadata iconName to component names; optional Solid and case-insensitive matching follow IconPreview.tsx.");
  if (errors.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(`FAIL ${error.message}`);
  console.error("Use --help for usage. No repository files were changed.");
  process.exitCode = 1;
});
