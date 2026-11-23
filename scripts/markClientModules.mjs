import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const reactPackages = new Set(["react", "react-dom"]);
const saltPackagePrefix = "@salt-ds/";

function getPackageName(id) {
  if (id.startsWith(".") || id.startsWith("\0") || path.isAbsolute(id)) {
    return undefined;
  }
  const [scopeOrName, name] = id.split("/");
  return scopeOrName.startsWith("@") ? `${scopeOrName}/${name}` : scopeOrName;
}

function findManifest(packageName, fromDirectory) {
  let directory = fromDirectory;
  while (true) {
    const manifestPath = path.join(
      directory,
      "node_modules",
      packageName,
      "package.json",
    );
    if (existsSync(manifestPath)) return manifestPath;
    const parent = path.dirname(directory);
    if (parent === directory) return undefined;
    directory = parent;
  }
}

const nameOf = (node) => node.name ?? node.value;

// Imports used only by export specifiers do not make a barrel client-only.
// Rolldown exposes the source before TypeScript/JSX lowering, so skip types
// while retaining the expressions inside TypeScript assertions.
// References are conservative when a nested binding shadows an import.
function inspectRuntime(node, references, state) {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) {
    for (const child of node) inspectRuntime(child, references, state);
    return;
  }
  if (node.declare || node.importKind === "type" || node.exportKind === "type")
    return;
  switch (node.type) {
    case "ImportDeclaration":
    case "ExportAllDeclaration":
      return;
    case "ExportNamedDeclaration":
      inspectRuntime(node.declaration, references, state);
      return;
    case "ExportDefaultDeclaration":
      if (node.declaration.type !== "Identifier")
        inspectRuntime(node.declaration, references, state);
      return;
    case "Identifier":
    case "JSXIdentifier":
      references.add(node.name);
      return;
    case "JSXElement":
    case "JSXFragment":
      state.jsx = true;
      break;
  }
  if (node.type?.startsWith("TS")) {
    inspectRuntime(node.expression, references, state);
    if (node.type === "TSEnumDeclaration") {
      for (const member of node.body.members) {
        inspectRuntime(member.initializer, references, state);
      }
    } else if (node.type === "TSParameterProperty")
      inspectRuntime(node.parameter, references, state);
    else if (["TSModuleDeclaration", "TSModuleBlock"].includes(node.type))
      inspectRuntime(node.body, references, state);
    return;
  }
  for (const [key, value] of Object.entries(node)) {
    if ((key === "key" || key === "property") && !node.computed) continue;
    inspectRuntime(value, references, state);
  }
}

function declarationNames(node) {
  if (!node) return [];
  if (node.type === "Identifier") return [node.name];
  if (node.type === "VariableDeclaration")
    return node.declarations.flatMap((declaration) =>
      declarationNames(declaration.id),
    );
  if (node.type === "ObjectPattern")
    return node.properties.flatMap((property) =>
      declarationNames(property.value ?? property.argument),
    );
  if (node.type === "ArrayPattern")
    return node.elements.flatMap(declarationNames);
  if (node.type === "AssignmentPattern") return declarationNames(node.left);
  if (node.type === "RestElement") return declarationNames(node.argument);
  return declarationNames(node.id);
}

// Resolve individual imported symbols through barrels. Following all of a
// barrel's dependencies would also mark consumers of its server-safe utilities.
function hasExport(id, name, modules, seen = new Set()) {
  const module = modules.get(id);
  if (!module || name === "*" || module.exports.has(name)) return true;
  if (name === "default" || seen.has(id)) return false;
  seen.add(id);
  return module.stars.some((source) => hasExport(source, name, modules, seen));
}

function isClientBinding(id, name, modules, clients, externalIsClient, seen) {
  const module = modules.get(id);
  if (!module) return externalIsClient(id);
  // A client module earlier in an export-star list might not export this name.
  if (!hasExport(id, name, modules)) return false;
  if (clients.has(id)) return true;
  const key = `${id}\0${name}`;
  if (seen.has(key)) return false;
  seen.add(key);
  const follow = (binding) =>
    binding != null &&
    isClientBinding(
      binding.id,
      binding.name,
      modules,
      clients,
      externalIsClient,
      seen,
    );
  if (name === "*") {
    return (
      [...module.exports.values()].some(follow) ||
      module.stars.some((source) => follow({ id: source, name: "*" }))
    );
  }
  if (module.exports.has(name)) return follow(module.exports.get(name));
  return (
    name !== "default" &&
    module.stars.some((source) => follow({ id: source, name }))
  );
}

export function markClientModules({ cwd = process.cwd() } = {}) {
  const dependencies = new Map();
  let clientModules = new Set();

  function dependsOnReact(packageName) {
    if (!packageName) return false;
    if (!dependencies.has(packageName)) {
      const manifestPath = findManifest(packageName, cwd);
      const manifest = manifestPath
        ? JSON.parse(readFileSync(manifestPath, "utf8"))
        : {};
      dependencies.set(
        packageName,
        ["dependencies", "peerDependencies"].some((field) =>
          [...reactPackages].some((name) => manifest[field]?.[name] != null),
        ),
      );
    }
    return dependencies.get(packageName);
  }

  const externalIsClient = (id) => {
    const name = getPackageName(id);
    return (
      reactPackages.has(name) ||
      name?.startsWith(saltPackagePrefix) ||
      dependsOnReact(name)
    );
  };

  return {
    name: "mark-client-modules",
    async buildEnd(error) {
      if (error) return;
      // Output formats can build concurrently. Keep each graph local and only
      // replace the completed classification before that output's banner runs.
      const modules = new Map();
      const clients = new Set();
      await Promise.all(
        [...this.getModuleIds()].map(async (id) => {
          const info = this.getModuleInfo(id);
          if (!info?.code || /\.(?:css|json)$/.test(id)) return;
          const extension = path.extname(id);
          const lang =
            extension === ".tsx"
              ? "tsx"
              : /\.[cm]?ts$/.test(id)
                ? "ts"
                : extension === ".jsx"
                  ? "jsx"
                  : "js";
          const { body } = this.parse(info.code, { lang });
          const sources = new Map();
          await Promise.all(
            body
              .filter(
                (node) =>
                  node.source &&
                  node.importKind !== "type" &&
                  node.exportKind !== "type",
              )
              .map(async (node) => {
                const source = node.source.value;
                const resolved = await this.resolve(source, id);
                // Omit imports erased by TypeScript lowering/tree analysis.
                if (resolved && info.importedIds.includes(resolved.id))
                  sources.set(source, resolved.id);
              }),
          );

          const imports = new Map();
          const exports = new Map();
          const stars = [];
          const references = new Set();
          const state = { jsx: false };
          inspectRuntime(body, references, state);
          for (const node of body) {
            if (node.type !== "ImportDeclaration" || node.importKind === "type")
              continue;
            const source = sources.get(node.source.value);
            if (!source) continue;
            for (const specifier of node.specifiers) {
              if (specifier.importKind === "type") continue;
              imports.set(specifier.local.name, {
                id: source,
                name:
                  specifier.type === "ImportDefaultSpecifier"
                    ? "default"
                    : specifier.type === "ImportNamespaceSpecifier"
                      ? "*"
                      : nameOf(specifier.imported),
              });
            }
          }
          for (const node of body) {
            if (node.exportKind === "type") continue;
            if (node.type === "ExportNamedDeclaration") {
              if (node.declaration && !node.declaration.declare) {
                for (const name of declarationNames(node.declaration))
                  exports.set(name, null);
              }
              for (const specifier of node.specifiers) {
                if (specifier.exportKind === "type") continue;
                const source = node.source && sources.get(node.source.value);
                exports.set(
                  nameOf(specifier.exported),
                  source
                    ? { id: source, name: nameOf(specifier.local) }
                    : (imports.get(nameOf(specifier.local)) ?? null),
                );
              }
            } else if (node.type === "ExportDefaultDeclaration") {
              exports.set(
                "default",
                imports.get(node.declaration.name) ?? null,
              );
            } else if (node.type === "ExportAllDeclaration") {
              const source = sources.get(node.source.value);
              if (!source) continue;
              if (node.exported)
                exports.set(nameOf(node.exported), { id: source, name: "*" });
              else stars.push(source);
            }
          }
          modules.set(id, {
            imports: [...imports]
              .filter(([name]) => references.has(name))
              .map(([, binding]) => binding),
            exports,
            stars,
          });
          // Third-party React packages may execute client-only code even for
          // side-effect imports or re-exports. Salt marks its own modules.
          if (
            state.jsx ||
            body.some(
              (node) =>
                node.type === "ExpressionStatement" &&
                node.expression.value === "use client",
            ) ||
            [...sources.values()].some((source) => {
              const name = getPackageName(source);
              return (
                name &&
                !reactPackages.has(name) &&
                !name.startsWith(saltPackagePrefix) &&
                dependsOnReact(name)
              );
            })
          )
            clients.add(id);
        }),
      );

      let changed = true;
      while (changed) {
        changed = false;
        for (const [id, module] of modules) {
          if (
            !clients.has(id) &&
            module.imports.some((binding) =>
              isClientBinding(
                binding.id,
                binding.name,
                modules,
                clients,
                externalIsClient,
                new Set(),
              ),
            )
          ) {
            clients.add(id);
            changed = true;
          }
        }
      }
      clientModules = clients;
    },
    // Let Rolldown insert the line and adjust both ESM and CJS source maps.
    banner(chunk) {
      return chunk.moduleIds.some((id) => clientModules.has(id))
        ? '"use client";'
        : "";
    },
  };
}
