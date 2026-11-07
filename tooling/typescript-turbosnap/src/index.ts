import fs from "node:fs";
import path from "node:path";
import type { BuilderStats } from "storybook/internal/types";
import ts from "typescript";
import type { Plugin } from "vite";

type TurbosnapPluginOptions = {
  /** Project root (https://vite.dev/config/shared-options#root). */
  rootDir: string;
  /** Resolved relative to rootDir; defaults to tsconfig.json. */
  tsConfigFilePath?: string;
};

type RuntimeModule = {
  id: string;
  importedIds?: readonly string[];
  dynamicallyImportedIds?: readonly string[];
};

type ModuleMetadata = {
  imports: Map<string, { target: string | undefined; name: string }>;
  targets: Set<string>;
  exports?: Map<string, ts.Symbol>;
  facade: boolean;
};

type PackageInfo = { filename: string; sideEffects: unknown };

type Stats = {
  modules: {
    id: string;
    name: string;
    reasons: { moduleName: string }[];
  }[];
};

type StatsPlugin = Plugin & { storybookGetStats: () => BuilderStats };

const virtualPrefix = "virtual:/@storybook/builder-vite/";
const stripQuery = (name: string) => name.split("?")[0];
const absolute = (name: string) => path.resolve(stripQuery(name));
const isVirtual = (name: string) =>
  name.replace(/^\0/, "").startsWith(virtualPrefix);
const isUserCode = (name: string | undefined): name is string =>
  Boolean(
    name &&
      (isVirtual(name) ||
        (!name.startsWith("\0") &&
          !name.startsWith("vite/") &&
          name !== "react/jsx-runtime" &&
          !name.replaceAll("\\", "/").includes("/node_modules/"))),
  );

/**
 * Builds a source-input graph, including
 * erased type imports that can change generated docgen metadata. It does not
 * run a language-service reference search for each variable declaration.
 *
 * A named import traverses the selected export through facades. Every facade on
 * that route is retained as an input, but unrelated exports do not acquire an
 * edge into the facade. Selectivity is enabled only for packages declaring
 * JavaScript side-effect-free; unknown packages use conservative module edges.
 */
export function createForwardGraph({
  rootDir,
  tsConfigFilePath = "tsconfig.json",
}: TurbosnapPluginOptions) {
  rootDir = path.resolve(rootDir);
  tsConfigFilePath = path.resolve(rootDir, tsConfigFilePath);
  const config = ts.readConfigFile(tsConfigFilePath, ts.sys.readFile);
  if (config.error)
    throw new Error(
      ts.flattenDiagnosticMessageText(config.error.messageText, "\n"),
    );
  const configInputs = new Set([absolute(tsConfigFilePath)]);
  const parsed = ts.parseJsonConfigFileContent(
    config.config,
    {
      ...ts.sys,
      readFile(filename) {
        configInputs.add(absolute(filename));
        return ts.sys.readFile(filename);
      },
    },
    path.dirname(tsConfigFilePath),
  );
  if (parsed.errors.length) {
    throw new Error(
      parsed.errors
        .map((error) =>
          ts.flattenDiagnosticMessageText(error.messageText, "\n"),
        )
        .join("\n"),
    );
  }
  const program = ts.createProgram(parsed.fileNames, parsed.options);
  const checker = program.getTypeChecker();
  const resolutionCache = ts.createModuleResolutionCache(
    rootDir,
    (name) => (ts.sys.useCaseSensitiveFileNames ? name : name.toLowerCase()),
    parsed.options,
  );
  const graph = new Map<string, Set<string>>();
  const modules = new Map<string, ModuleMetadata>();
  const extraSources = new Map<string, ts.SourceFile | undefined>();
  const exportCache = new Map<string, Set<string>>();
  const sideEffectsCache = new Map<string, boolean>();
  const packageCache = new Map<string, PackageInfo | undefined>();
  const analysed = new Set<string>();
  const pending: ts.SourceFile[] = [];
  const runtimeFiles = new Set<string>();
  const globalGuard = `\0${virtualPrefix}turbosnap-global-inputs.js`;
  const globalInputs = new Set<string>();
  const moduleAugmentations = new Map<string, Set<string>>();
  const wholeModuleActive = new Set<string>();

  function normalize(name: string): string {
    if (isVirtual(name)) return `/${name.replace(/^\0/, "")}`;
    return `./${path.relative(rootDir, stripQuery(name)).replaceAll("\\", "/")}`;
  }

  function entry(file: string): Set<string> {
    const name = normalize(file);
    let reasons = graph.get(name);
    if (!reasons) {
      reasons = new Set();
      graph.set(name, reasons);
    }
    return reasons;
  }

  function add(dependency: string, importer: string): void {
    if (!isUserCode(dependency) || !isUserCode(importer)) return;
    const normalized = normalize(importer);
    if (normalize(dependency) !== normalized) entry(dependency).add(normalized);
  }

  function source(file: string | undefined): ts.SourceFile | undefined {
    if (!file || isVirtual(file)) return undefined;
    const filename = absolute(file);
    const existing = program.getSourceFile(filename);
    if (existing) return existing;
    if (extraSources.has(filename)) return extraSources.get(filename);
    // Storybook preview/config modules may be outside tsconfig.include. Their
    // imports must still be analyzed precisely, especially shared decorators.
    if (!isUserCode(filename) || !/\.[cm]?[jt]sx?$/.test(filename))
      return undefined;
    const contents = ts.sys.readFile(filename);
    const sf =
      contents === undefined
        ? undefined
        : ts.createSourceFile(
            filename,
            contents,
            ts.ScriptTarget.Latest,
            true,
            /tsx$/.test(filename)
              ? ts.ScriptKind.TSX
              : /jsx$/.test(filename)
                ? ts.ScriptKind.JSX
                : /\.[cm]?js$/.test(filename)
                  ? ts.ScriptKind.JS
                  : ts.ScriptKind.TS,
          );
    extraSources.set(filename, sf);
    return sf;
  }

  function queue(file: string | undefined): void {
    if (!file || !isUserCode(file)) return;
    const sf = source(file);
    if (sf && !analysed.has(sf.fileName)) pending.push(sf);
  }

  function connect(files: Iterable<string>, importer: string): void {
    for (const file of files) {
      add(file, importer);
      queue(file);
      // Augmentations can target a leaf reached through one or more facades.
      // Attach them to the consumer of every resolved route, not only the
      // spelling of its direct import.
      addAugmentations(undefined, file, importer);
    }
  }

  function specifierText(specifier: ts.Expression): string | undefined {
    return ts.isStringLiteralLike(specifier) ? specifier.text : undefined;
  }

  function resolve(
    specifier: string | ts.Expression,
    sf: ts.SourceFile,
  ): string | undefined {
    const value =
      typeof specifier === "string" ? specifier : specifierText(specifier);
    if (value === undefined) return undefined;
    const result = ts.resolveModuleName(
      value,
      sf.fileName,
      parsed.options,
      ts.sys,
      resolutionCache,
    ).resolvedModule;
    if (result) return absolute(result.resolvedFileName);
    // TS intentionally does not resolve arbitrary CSS/assets. Vite's actual
    // resolved imports are retained below, including aliases and query suffixes.
    if (value.startsWith("."))
      return absolute(path.join(path.dirname(sf.fileName), value));
    return undefined;
  }

  function exportedSymbol(
    sf: ts.SourceFile,
    name: string,
  ): ts.Symbol | undefined {
    const info = metadata(sf);
    if (!info.exports) {
      const symbol =
        program.getSourceFile(sf.fileName) && checker.getSymbolAtLocation(sf);
      info.exports = new Map(
        symbol
          ? checker.getExportsOfModule(symbol).map((item) => [item.name, item])
          : [],
      );
    }
    return info.exports.get(name);
  }

  function metadata(sf: ts.SourceFile): ModuleMetadata {
    let info = modules.get(sf.fileName);
    if (info) return info;
    info = {
      imports: new Map(),
      targets: new Set(),
      exports: undefined,
      facade: true,
    };
    modules.set(sf.fileName, info);
    for (const statement of sf.statements) {
      if (ts.isImportDeclaration(statement)) {
        const target = resolve(statement.moduleSpecifier, sf);
        if (target) info.targets.add(target);
        const clause = statement.importClause;
        if (clause?.name)
          info.imports.set(clause.name.text, { target, name: "default" });
        if (clause?.namedBindings && ts.isNamedImports(clause.namedBindings)) {
          for (const binding of clause.namedBindings.elements) {
            info.imports.set(binding.name.text, {
              target,
              name: binding.propertyName?.text ?? binding.name.text,
            });
          }
        } else if (
          clause?.namedBindings &&
          ts.isNamespaceImport(clause.namedBindings)
        ) {
          info.imports.set(clause.namedBindings.name.text, {
            target,
            name: "*",
          });
        }
      } else if (ts.isExportDeclaration(statement)) {
        const target =
          statement.moduleSpecifier && resolve(statement.moduleSpecifier, sf);
        if (target) info.targets.add(target);
      } else if (
        !(
          ts.isEmptyStatement(statement) ||
          (ts.isExportAssignment(statement) &&
            ts.isIdentifier(statement.expression))
        )
      ) {
        info.facade = false;
      }
    }
    return info;
  }

  function packageFor(file: string): PackageInfo | undefined {
    let directory = path.dirname(file);
    const visited: string[] = [];
    let result: PackageInfo | undefined;
    while (true) {
      if (packageCache.has(directory)) {
        result = packageCache.get(directory);
        break;
      }
      visited.push(directory);
      const filename = path.join(directory, "package.json");
      if (fs.existsSync(filename)) {
        try {
          const manifest: unknown = JSON.parse(
            fs.readFileSync(filename, "utf8"),
          );
          result = {
            filename,
            sideEffects:
              manifest &&
              typeof manifest === "object" &&
              "sideEffects" in manifest
                ? manifest.sideEffects
                : undefined,
          };
        } catch {
          // An unreadable sideEffects contract cannot enable precise facades.
          result = { filename, sideEffects: undefined };
        }
        break;
      }
      const parent = path.dirname(directory);
      if (parent === directory) break;
      directory = parent;
    }
    for (const item of visited) packageCache.set(item, result);
    return result;
  }

  function sideEffectFree(file: string): boolean {
    const cached = sideEffectsCache.get(file);
    if (cached !== undefined) return cached;
    const contract = packageFor(file)?.sideEffects;
    // These are the contracts used by Salt. Unrecognized glob syntax deliberately
    // falls back to ordinary module propagation instead of guessing.
    const safe =
      /\.d\.[cm]?ts$/.test(file) ||
      contract === false ||
      (Array.isArray(contract) &&
        contract.every(
          (item) =>
            typeof item === "string" &&
            !item.startsWith("!") &&
            /\.(?:css|scss|sass|less)$/.test(item),
        ));
    sideEffectsCache.set(file, safe);
    return safe;
  }

  function preciseFacade(sf: ts.SourceFile): boolean {
    return metadata(sf).facade && sideEffectFree(sf.fileName);
  }

  function ultimateDeclarations(symbol: ts.Symbol | undefined): string[] {
    if (symbol && symbol.flags & ts.SymbolFlags.Alias) {
      symbol = checker.getAliasedSymbol(symbol);
    }
    return (symbol?.declarations ?? []).map(
      (declaration) => declaration.getSourceFile().fileName,
    );
  }

  function resolveExport(
    file: string | undefined,
    name: string,
    ancestors = new Set<string>(),
  ): Set<string> {
    if (!file || !isUserCode(file)) return new Set();
    const key = `${file}\0${name}`;
    const cached = exportCache.get(key);
    if (cached) return cached;
    const result = new Set([file]);
    const sf = source(file);
    if (!sf || ancestors.has(key)) return result;
    const nextAncestors = new Set(ancestors).add(key);
    const addExport = (
      target: string | undefined,
      targetName: string,
    ): void => {
      const dependencies =
        targetName === "*"
          ? wholeModule(target)
          : resolveExport(target, targetName, nextAncestors);
      for (const item of dependencies) result.add(item);
    };
    const symbol = exportedSymbol(sf, name);
    for (const dependency of ultimateDeclarations(symbol))
      if (isUserCode(dependency)) result.add(dependency);
    for (const statement of sf.statements) {
      if (ts.isExportDeclaration(statement)) {
        const target =
          statement.moduleSpecifier && resolve(statement.moduleSpecifier, sf);
        const clause = statement.exportClause;
        if (clause && ts.isNamedExports(clause)) {
          for (const binding of clause.elements)
            if (binding.name.text === name) {
              const importedName =
                binding.propertyName?.text ?? binding.name.text;
              if (target) addExport(target, importedName);
              else {
                const imported = metadata(sf).imports.get(importedName);
                if (imported) addExport(imported.target, imported.name);
              }
            }
        } else if (
          clause &&
          ts.isNamespaceExport(clause) &&
          clause.name.text === name
        ) {
          for (const item of wholeModule(target)) result.add(item);
        } else if (!clause && target && name !== "default") {
          const targetSource = source(target);
          if (
            targetSource &&
            (!program.getSourceFile(targetSource.fileName) ||
              exportedSymbol(targetSource, name))
          )
            addExport(target, name);
        }
      } else if (
        name === "default" &&
        ts.isExportAssignment(statement) &&
        ts.isIdentifier(statement.expression)
      ) {
        const imported = metadata(sf).imports.get(statement.expression.text);
        if (imported) addExport(imported.target, imported.name);
      }
    }
    // Avoid caching a partial traversal of a cyclic re-export route. TS's final
    // symbol declarations above still retain its concrete defining input.
    if (ancestors.size === 0 && wholeModuleActive.size === 0)
      exportCache.set(key, result);
    return result;
  }

  function wholeModule(
    file: string | undefined,
    visited = new Set<string>(),
  ): Set<string> {
    if (!file || !isUserCode(file) || visited.has(file)) return new Set();
    visited.add(file);
    const result = new Set([file]);
    const sf = source(file);
    if (!sf || wholeModuleActive.has(file)) return result;
    wholeModuleActive.add(file);
    const symbol =
      program.getSourceFile(sf.fileName) && checker.getSymbolAtLocation(sf);
    for (const item of symbol ? checker.getExportsOfModule(symbol) : []) {
      for (const dependency of resolveExport(file, item.name))
        result.add(dependency);
    }
    // Export-star-only facades and side-effect-only modules may have no named
    // exports. Retain their physical inputs for namespace/dynamic consumption.
    if (metadata(sf).facade)
      for (const target of metadata(sf).targets) {
        for (const dependency of wholeModule(target, visited))
          result.add(dependency);
      }
    wholeModuleActive.delete(file);
    return result;
  }

  function addAugmentations(
    specifier: string | undefined,
    target: string | undefined,
    importer: string,
  ): void {
    for (const key of [specifier, target]) {
      if (!key) continue;
      for (const dependency of moduleAugmentations.get(key) ?? []) {
        add(dependency, importer);
        queue(dependency);
      }
    }
  }

  function importBinding(
    target: string | undefined,
    name: string,
    importer: string,
    specifier: string | undefined,
  ): void {
    addAugmentations(specifier, target, importer);
    connect(
      name === "*" ? wholeModule(target) : resolveExport(target, name),
      importer,
    );
  }

  // Ambient inputs can change generated types/docgen without a runtime import.
  // Global declarations use a conservative all-input guard; module augmentation
  // is scoped to consumers of the augmented module. No identifier-wide checker
  // scan or repeated reference searches are required.
  for (const sf of program.getSourceFiles()) {
    if (!isUserCode(sf.fileName) || program.isSourceFileDefaultLibrary(sf))
      continue;
    // allowJs + include:packages also loads generated dist-cjs outputs. CommonJS
    // modules are not ambient scripts even though isExternalModule() is false.
    const commonJs = Boolean(
      ("commonJsModuleIndicator" in sf && sf.commonJsModuleIndicator) ||
        /\.(?:cjs|cts)$/.test(sf.fileName),
    );
    if (!ts.isExternalModule(sf) && !commonJs && !/\.json$/.test(sf.fileName))
      globalInputs.add(sf.fileName);
    for (const statement of sf.statements) {
      if (ts.isNamespaceExportDeclaration(statement))
        globalInputs.add(sf.fileName);
      if (!ts.isModuleDeclaration(statement)) continue;
      if (
        statement.flags & ts.NodeFlags.GlobalAugmentation ||
        !ts.isStringLiteral(statement.name)
      ) {
        if (statement.flags & ts.NodeFlags.GlobalAugmentation)
          globalInputs.add(sf.fileName);
        continue;
      }
      const name = statement.name.text;
      // Wildcard ambient asset declarations are compile-time typing for Vite
      // imports. Guard these globally: changing them can change generated types.
      if (name.includes("*")) {
        globalInputs.add(sf.fileName);
        continue;
      }
      const target = resolve(name, sf);
      for (const key of new Set([name, target])) {
        if (!key) continue;
        let inputs = moduleAugmentations.get(key);
        if (!inputs) {
          inputs = new Set();
          moduleAugmentations.set(key, inputs);
        }
        inputs.add(sf.fileName);
      }
    }
  }

  function analyse(sf: ts.SourceFile): void {
    if (analysed.has(sf.fileName)) return;
    analysed.add(sf.fileName);
    entry(sf.fileName);
    const facade = preciseFacade(sf);
    const consume = (
      target: string | undefined,
      name: string,
      specifier: string | undefined,
    ) => importBinding(target, name, sf.fileName, specifier);
    for (const statement of sf.statements) {
      if (ts.isImportDeclaration(statement)) {
        const target = resolve(statement.moduleSpecifier, sf);
        const clause = statement.importClause;
        if (!clause)
          consume(target, "*", specifierText(statement.moduleSpecifier));
        else if (!facade) {
          if (clause.name)
            consume(
              target,
              "default",
              specifierText(statement.moduleSpecifier),
            );
          const bindings = clause.namedBindings;
          if (bindings && ts.isNamedImports(bindings)) {
            for (const binding of bindings.elements)
              consume(
                target,
                binding.propertyName?.text ?? binding.name.text,
                specifierText(statement.moduleSpecifier),
              );
            if (!bindings.elements.length)
              consume(target, "*", specifierText(statement.moduleSpecifier));
          } else if (bindings)
            consume(target, "*", specifierText(statement.moduleSpecifier));
        } else if (target && !sideEffectFree(target)) {
          consume(target, "*", specifierText(statement.moduleSpecifier));
        }
      } else if (
        ts.isExportDeclaration(statement) &&
        statement.moduleSpecifier
      ) {
        const target = resolve(statement.moduleSpecifier, sf);
        const clause = statement.exportClause;
        // export type {} is commonly used specifically to load augmentations.
        const emptyTypeExport =
          statement.isTypeOnly &&
          clause &&
          ts.isNamedExports(clause) &&
          !clause.elements.length;
        if (!facade || emptyTypeExport || (target && !sideEffectFree(target))) {
          consume(target, "*", specifierText(statement.moduleSpecifier));
        }
      } else if (
        ts.isImportEqualsDeclaration(statement) &&
        ts.isExternalModuleReference(statement.moduleReference) &&
        statement.moduleReference.expression
      ) {
        const expression = statement.moduleReference.expression;
        if (ts.isStringLiteralLike(expression))
          consume(resolve(expression, sf), "*", expression.text);
      }
    }
    const visit = (node: ts.Node): void => {
      if (
        ts.isImportTypeNode(node) &&
        ts.isLiteralTypeNode(node.argument) &&
        ts.isStringLiteral(node.argument.literal)
      ) {
        const literal = node.argument.literal;
        let qualifier = node.qualifier;
        while (qualifier && ts.isQualifiedName(qualifier))
          qualifier = qualifier.left;
        consume(
          resolve(literal, sf),
          qualifier && ts.isIdentifier(qualifier) ? qualifier.text : "*",
          literal.text,
        );
      } else if (
        ts.isCallExpression(node) &&
        node.arguments.length &&
        (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
          (ts.isIdentifier(node.expression) &&
            node.expression.text === "require"))
      ) {
        const literal = node.arguments[0];
        if (ts.isStringLiteralLike(literal)) {
          consume(resolve(literal, sf), "*", literal.text);
        }
      }
      ts.forEachChild(node, visit);
    };
    ts.forEachChild(sf, visit);
    for (const reference of sf.referencedFiles)
      connect(
        [path.resolve(path.dirname(sf.fileName), reference.fileName)],
        sf.fileName,
      );
  }

  function drain(): void {
    let next = pending.pop();
    while (next) {
      analyse(next);
      next = pending.pop();
    }
  }

  function moduleParsed(mod: RuntimeModule): void {
    if (!isUserCode(mod.id)) return;
    runtimeFiles.add(mod.id);
    entry(mod.id);
    const sf = isVirtual(mod.id) ? undefined : source(mod.id);
    const targets = sf && metadata(sf).targets;
    for (const imported of [
      ...(mod.importedIds ?? []),
      ...(mod.dynamicallyImportedIds ?? []),
    ]) {
      if (!isUserCode(imported)) continue;
      if (!sf || !targets?.has(absolute(imported))) {
        connect(wholeModule(imported), mod.id);
      }
    }
    if (sf) queue(sf.fileName);
    drain();
  }

  function getStats(): Stats & { toJson: () => Stats } {
    // Guard all ambient inputs even when Vite erased them and never called
    // moduleParsed. They are intentionally conservative rather than invisible.
    for (const dependency of globalInputs) {
      add(dependency, globalGuard);
      queue(dependency);
    }
    // A single bridge keeps the guard O(ambient inputs + runtime modules), not
    // their Cartesian product. It never points into the app/glob virtuals,
    // whose direct dependencies Chromatic interprets specially.
    if (globalInputs.size)
      for (const importer of runtimeFiles) {
        if (!isVirtual(importer)) add(globalGuard, importer);
      }
    for (const importer of runtimeFiles) {
      if (isVirtual(importer)) continue;
      for (const input of configInputs) add(input, importer);
      const manifest = packageFor(importer);
      if (manifest) add(manifest.filename, importer);
    }
    drain();
    const stats = {
      modules: [...graph].map(([name, reasons]) => ({
        id: name,
        name,
        reasons: [...reasons].map((moduleName) => ({ moduleName })),
      })),
    };
    return { ...stats, toJson: () => stats };
  }

  return { moduleParsed, getStats };
}

export function typescriptTurbosnap(
  options: TurbosnapPluginOptions,
): StatsPlugin {
  const graph = createForwardGraph(options);
  return {
    name: "storybook:rollup-plugin-webpack-stats",
    enforce: "post",
    moduleParsed: graph.moduleParsed,
    storybookGetStats: graph.getStats,
  };
}
