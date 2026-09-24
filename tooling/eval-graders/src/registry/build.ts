/**
 * Census of public exports and their `@deprecated` tags for the Salt packages, read from
 * `packages/<name>/src/index.ts` with the TypeScript compiler API. Cached per git commit;
 * a dirty working tree is never cached because the census could be stale next run.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import ts from "typescript";

export const REGISTRY_PACKAGES = [
  "core",
  "lab",
  "icons",
  "date-components",
] as const;

export interface ExportEntry {
  /** Deprecation message from the JSDoc tag, or null when the export is current. */
  deprecated: string | null;
}

export interface Registry {
  gitSha: string;
  builtAt: string;
  /** Package specifier (e.g. `@salt-ds/core`) to exported names. */
  packages: Record<string, Record<string, ExportEntry>>;
}

function gitSha(repoRoot: string): string {
  try {
    const sha = execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: repoRoot,
      encoding: "utf8",
    }).trim();
    const dirty = execFileSync(
      "git",
      [
        "status",
        "--porcelain",
        "--",
        ...REGISTRY_PACKAGES.map((p) => `packages/${p}/src`),
      ],
      { cwd: repoRoot, encoding: "utf8" },
    ).trim();
    return dirty ? `${sha}-dirty` : sha;
  } catch {
    return "unknown";
  }
}

function compilerOptions(repoRoot: string): ts.CompilerOptions {
  const configPath = path.join(repoRoot, "tsconfig.json");
  const parsed = ts.getParsedCommandLineOfConfigFile(
    configPath,
    {},
    {
      ...ts.sys,
      onUnRecoverableConfigFileDiagnostic: (diagnostic) => {
        throw new Error(
          ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"),
        );
      },
    },
  );
  if (!parsed) throw new Error(`Could not read ${configPath}`);
  return { ...parsed.options, noEmit: true };
}

function deprecationOf(
  symbol: ts.Symbol,
  checker: ts.TypeChecker,
): string | null {
  const target =
    symbol.flags & ts.SymbolFlags.Alias
      ? checker.getAliasedSymbol(symbol)
      : symbol;
  for (const candidate of [symbol, target]) {
    const tag = candidate
      .getJsDocTags(checker)
      .find((t) => t.name === "deprecated");
    if (tag) {
      return ts.displayPartsToString(tag.text) || "deprecated";
    }
  }
  return null;
}

export function buildRegistry(repoRoot: string): Registry {
  const entries = REGISTRY_PACKAGES.map((name) => ({
    specifier: `@salt-ds/${name}`,
    file: path.join(repoRoot, "packages", name, "src", "index.ts"),
  })).filter((entry) => existsSync(entry.file));
  const program = ts.createProgram(
    entries.map((e) => e.file),
    compilerOptions(repoRoot),
  );
  const checker = program.getTypeChecker();
  const packages: Registry["packages"] = {};
  for (const entry of entries) {
    const source = program.getSourceFile(entry.file);
    const moduleSymbol = source && checker.getSymbolAtLocation(source);
    if (!moduleSymbol) {
      throw new Error(`No module symbol for ${entry.file}`);
    }
    const exports: Record<string, ExportEntry> = {};
    for (const symbol of checker.getExportsOfModule(moduleSymbol)) {
      exports[symbol.name] = { deprecated: deprecationOf(symbol, checker) };
    }
    packages[entry.specifier] = exports;
  }
  return {
    gitSha: gitSha(repoRoot),
    builtAt: new Date().toISOString(),
    packages,
  };
}

export function loadRegistry(repoRoot: string, cacheDir: string): Registry {
  const sha = gitSha(repoRoot);
  const cachePath = path.join(cacheDir, `registry-${sha}.json`);
  const cacheable = sha !== "unknown" && !sha.endsWith("-dirty");
  if (cacheable && existsSync(cachePath)) {
    return JSON.parse(readFileSync(cachePath, "utf8")) as Registry;
  }
  const registry = buildRegistry(repoRoot);
  if (cacheable) {
    mkdirSync(cacheDir, { recursive: true });
    writeFileSync(cachePath, JSON.stringify(registry));
  }
  return registry;
}
