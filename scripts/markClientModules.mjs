import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

// Marks modules that use React with the "use client" directive, so they can be
// imported from React Server Components. React versions and bundlers without
// server components ignore the directive.
//
// A module is marked when it:
// - uses bindings from `react` or `react-dom`, which provide hooks and
//   context. Side-effect imports of React are safe on the server.
// - uses bindings from another marked module, like a context created with a
//   client-only helper. Any binding from another Salt package counts, as
//   which of its modules are marked isn't known here.
// - imports a third-party package that depends on React. These don't mark
//   their own client modules, so loading them on the server can fail.
// Bindings that are only re-exported don't count, so barrel files and plain
// utilities stay usable on the server.

const reactPackages = ["react", "react-dom"];
// Packages built with this plugin, which mark their own client modules.
const saltPackagePrefix = "@salt-ds/";
const directive = '"use client";';

function getPackageName(id) {
  const [scopeOrName, name] = id.split("/");
  return scopeOrName.startsWith("@") ? `${scopeOrName}/${name}` : scopeOrName;
}

// Whether a module's source imports any bindings. Barrel files only re-export
// with `export ... from`, so they don't.
function hasBindingImports(moduleInfo) {
  return (moduleInfo?.ast?.body ?? []).some(
    (node) => node.type === "ImportDeclaration" && node.specifiers.length > 0,
  );
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

    if (existsSync(manifestPath)) {
      return manifestPath;
    }

    const parent = path.dirname(directory);
    if (parent === directory) {
      return undefined;
    }
    directory = parent;
  }
}

export function markClientModules({ cwd = process.cwd() } = {}) {
  const dependsOnReact = new Map();

  function packageDependsOnReact(packageName) {
    if (!dependsOnReact.has(packageName)) {
      const manifestPath = findManifest(packageName, cwd);
      const manifest = manifestPath
        ? JSON.parse(readFileSync(manifestPath, "utf8"))
        : {};

      dependsOnReact.set(
        packageName,
        ["dependencies", "peerDependencies"].some((field) =>
          reactPackages.some((name) => manifest[field]?.[name] != null),
        ),
      );
    }

    return dependsOnReact.get(packageName);
  }

  return {
    name: "mark-client-modules",
    generateBundle(_outputOptions, bundle) {
      const chunks = Object.values(bundle).filter(
        (output) => output.type === "chunk",
      );
      const isChunk = (id) => bundle[id]?.type === "chunk";
      const importsBindings = new Set(
        chunks.filter((chunk) =>
          hasBindingImports(this.getModuleInfo(chunk.facadeModuleId)),
        ),
      );
      // `importedBindings` resolves bindings imported through barrel files to
      // the module that defines them, but also lists re-exported bindings, so
      // only count them for modules that import bindings themselves.
      const usesBindings = (chunk, id) =>
        importsBindings.has(chunk) &&
        (chunk.importedBindings[id] ?? []).length > 0;

      const clientChunks = new Set(
        chunks.filter((chunk) =>
          chunk.imports.some((id) => {
            if (isChunk(id)) {
              return false;
            }

            const packageName = getPackageName(id);

            if (
              reactPackages.includes(packageName) ||
              packageName.startsWith(saltPackagePrefix)
            ) {
              return usesBindings(chunk, id);
            }

            return packageDependsOnReact(packageName);
          }),
        ),
      );

      let changed = true;
      while (changed) {
        changed = false;

        for (const chunk of chunks) {
          if (
            !clientChunks.has(chunk) &&
            chunk.imports.some(
              (id) =>
                isChunk(id) &&
                clientChunks.has(bundle[id]) &&
                usesBindings(chunk, id),
            )
          ) {
            clientChunks.add(chunk);
            changed = true;
          }
        }
      }

      for (const chunk of clientChunks) {
        chunk.code = `${directive}\n${chunk.code}`;

        // The directive adds a line before the generated code, so shift the
        // source map, which is already emitted as a separate asset.
        if (chunk.map) {
          chunk.map.mappings = `;${chunk.map.mappings}`;
        }

        const sourcemap = bundle[chunk.sourcemapFileName];
        if (sourcemap?.type === "asset") {
          const map = JSON.parse(sourcemap.source.toString());
          map.mappings = `;${map.mappings}`;
          sourcemap.source = JSON.stringify(map);
        }
      }
    },
  };
}
