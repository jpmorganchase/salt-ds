/**
 * A modified version of: https://github.com/IanVS/vite-plugin-turbosnap
 * Reason, Module and Stats types; isUserCode, normalize, the plugin shell and generateBundle are copied.
 */

import { writeFile } from "fs/promises";
import { Project } from "ts-morph";
import path from "path";
import type { Plugin } from "vite";
import { normalizePath } from "vite";

/*
 * Reason, Module, and Stats are copied from chromatic types
 * https://github.com/chromaui/chromatic-cli/blob/145a5e295dde21042e96396c7e004f250d842182/bin-src/types.ts#L265-L276
 */
interface Reason {
  moduleName: string;
}
interface Module {
  id: string | number;
  name: string;
  modules?: Array<Pick<Module, "name">>;
  reasons?: Reason[];
}
interface Stats {
  modules: Module[];
}

type TurbosnapPluginOptions = {
  /** Project root (https://vitejs.dev/config/#root) */
  rootDir: string;
};

/**
 * We only care about user code, not node_modules, vite files, or (most) virtual files.
 */
function isUserCode(moduleName: string) {
  return Boolean(
    moduleName &&
      !moduleName.startsWith("vite/") &&
      !moduleName.startsWith("\x00") &&
      !moduleName.startsWith("\u0000") &&
      moduleName !== "react/jsx-runtime" &&
      !/node_modules\//.exec(moduleName)
  );
}

/**
 * Convert an absolute path name to a path relative to the vite root, with a starting `./`
 */
function normalize(rootDir: string, filename: string) {
  // Do not try to resolve virtual files
  if (filename.startsWith("/virtual:")) {
    return filename;
  }

  // We need them in the format `./path/to/file.js`.
  const relativePath = normalizePath(path.relative(rootDir, filename));
  // This seems hacky, got to be a better way to add a `./` to the start of a path.
  return `./${relativePath}`;
}

export function typescriptTurbosnap({
  rootDir,
}: TurbosnapPluginOptions): Plugin {
  const moduleMap: Record<string, Module> = {};

  function addFilesToModuleMap(filePath: string, reasonPaths: string[]) {
    const normalizedFilePath = normalize(rootDir, filePath);
    const normalizedReasons = reasonPaths.map((reasonPath) => ({
      moduleName: normalize(rootDir, reasonPath),
    }));

    if (!moduleMap[normalizedFilePath]) {
      moduleMap[normalizedFilePath] = {
        id: normalizedFilePath,
        name: normalizedFilePath,
        reasons: [],
      };
    }

    moduleMap[normalizedFilePath].reasons =
      moduleMap[normalizedFilePath].reasons!.concat(normalizedReasons);
  }

  const project = new Project({
    tsConfigFilePath: "./tsconfig.json",
  });

  return {
    name: "vite-plugin-typescript-turbosnap",
    enforce: "post",
    moduleParsed: function (mod) {
      if (isUserCode(mod.id)) {
        const file = project.getSourceFile(path.resolve(mod.id));

        if (file) {
          const filePath = file.getFilePath();
          const declarations = file.getVariableDeclarations();
          declarations?.forEach((declaration) => {
            const x = Array.from(
              new Set(
                declaration
                  .findReferences()
                  .flatMap((references) =>
                    references
                      .getReferences()
                      .map((reference) =>
                        reference.getSourceFile().getFilePath()
                      )
                  )
                  .filter((path) => path !== filePath)
              )
            );

            addFilesToModuleMap(filePath, x);
          });

          file
            .getImportDeclarations()
            // This gets modules imports for side effects e.g. css files
            .filter((importDeclaration) => !importDeclaration.getImportClause())
            .forEach((importDeclaration) => {
              const cssFile = path.resolve(
                path.dirname(filePath),
                importDeclaration.getModuleSpecifierValue()
              );
              addFilesToModuleMap(cssFile, [filePath]);
            });
        }
      }

      if (
        [
          "/virtual:/@storybook/builder-vite/storybook-stories.js",
          "/virtual:/@storybook/builder-vite/vite-app.js",
        ].includes(mod.id)
      ) {
        mod.importedIds
          .concat(mod.dynamicallyImportedIds)
          .filter((name) => isUserCode(name))
          .forEach((depId) => {
            addFilesToModuleMap(depId, [mod.id]);
          });
      }
    },
    generateBundle: function (this, outOpts) {
      const stats: Stats = { modules: Object.values(moduleMap) };

      // If we don't know where the output is going, we can't guarantee we'll put the results in the right spot.
      if (!outOpts.dir) {
        throw new Error("Vite option `build.outDir` was not configured.");
      }

      const filename = path.resolve(outOpts.dir, "preview-stats.json");
      console.log(`vite-plugin-typescript-turbosnap: writing to ${filename}`);
      return writeFile(filename, JSON.stringify(stats, null, 2));
    },
  };
}
