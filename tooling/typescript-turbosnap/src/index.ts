/**
 * A modified version of: https://github.com/storybookjs/storybook/blob/8b16feb67674d6ccfdf3a1c539ca35e56f3e1968/code/builders/builder-vite/src/virtual-file-names.ts
 */

import path, { relative } from "node:path";
import slash from "slash";
import type { BuilderStats } from "storybook/internal/types";
import { Project } from "ts-morph";
import type { Plugin } from "vite";

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

const SB_VIRTUAL_FILES = {
  VIRTUAL_APP_FILE: "virtual:/@storybook/builder-vite/vite-app.js",
  VIRTUAL_STORIES_FILE: "virtual:/@storybook/builder-vite/storybook-stories.js",
  VIRTUAL_PREVIEW_FILE: "virtual:/@storybook/builder-vite/preview-entry.js",
  VIRTUAL_ADDON_SETUP_FILE: "virtual:/@storybook/builder-vite/setup-addons.js",
};

function _getResolvedVirtualModuleId(virtualModuleId: string) {
  return `\0${virtualModuleId}`;
}

function getOriginalVirtualModuleId(resolvedVirtualModuleId: string) {
  return resolvedVirtualModuleId.slice(1);
}

/**
 * Strips off query params added by rollup/vite to ids, to make paths compatible for comparison with
 * git.
 */
function stripQueryParams(filePath: string): string {
  return filePath.split("?")[0];
}

/**
 * We only care about user code, not node_modules, vite files, or (most) virtual files.
 */
function isUserCode(moduleName: string) {
  if (!moduleName) {
    return false;
  }

  // keep Storybook's virtual files because they import the story files, so they are essential to the module graph
  if (
    Object.values(SB_VIRTUAL_FILES).includes(
      getOriginalVirtualModuleId(moduleName),
    )
  ) {
    return true;
  }

  return Boolean(
    !moduleName.startsWith("vite/") &&
      !moduleName.startsWith("\0") &&
      moduleName !== "react/jsx-runtime" &&
      !moduleName.match(/node_modules\//) &&
      !moduleName.includes("__tests__"),
  );
}

/**
 * Convert an absolute path name to a path relative to the vite root, with a starting `./`
 */
/** Convert an absolute path name to a path relative to the vite root, with a starting `./` */
function normalize(workingDir: string, filename: string) {
  // Do not try to resolve virtual files
  if (filename.startsWith("virtual:")) {
    // We have to append a forward slash because otherwise we break turbosnap.
    // As soon as the chromatic-cli supports `virtual:` id's without a starting forward slash,
    // we can remove adding the forward slash here
    // Reference: https://github.com/chromaui/chromatic-cli/blob/v11.25.2/node-src/lib/getDependentStoryFiles.ts#L53
    return `/${filename}`;
  }
  // ! Maintain backwards compatibility with the old virtual file names
  // ! to ensure that the stats file doesn't change between the versions
  // ! Turbosnap is also only compatible with the old virtual file names
  // ! the old virtual file names did not start with the obligatory \0 character
  if (
    Object.values(SB_VIRTUAL_FILES).includes(
      getOriginalVirtualModuleId(filename),
    )
  ) {
    // We have to append a forward slash because otherwise we break turbosnap.
    // As soon as the chromatic-cli supports `virtual:` id's without a starting forward slash,
    // we can remove adding the forward slash here
    // Reference: https://github.com/chromaui/chromatic-cli/blob/v11.25.2/node-src/lib/getDependentStoryFiles.ts#L53
    return `/${getOriginalVirtualModuleId(filename)}`;
  }

  // Otherwise, we need them in the format `./path/to/file.js`.

  const relativePath = relative(workingDir, stripQueryParams(filename));
  // This seems hacky, got to be a better way to add a `./` to the start of a path.
  return `./${slash(relativePath)}`;
}

type StatsPlugin = Plugin & { storybookGetStats: () => BuilderStats };

export function typescriptTurbosnap({
  rootDir,
}: TurbosnapPluginOptions): StatsPlugin {
  const statsMap = new Map<string, Module>();

  function addFilesToModuleMap(filePath: string, reasonPaths: string[]) {
    const normalizedFilePath = normalize(rootDir, filePath);
    const normalizedReasons = reasonPaths.map((reasonPath) => ({
      moduleName: normalize(rootDir, reasonPath),
    }));

    let m = statsMap.get(normalizedFilePath);

    if (!m) {
      m = {
        id: normalizedFilePath,
        name: normalizedFilePath,
        reasons: [],
      };
    }

    for (const reason of normalizedReasons) {
      if (!m.reasons?.find((r) => r.moduleName === reason.moduleName)) {
        m.reasons?.push(reason);
      }
    }

    statsMap.set(normalizedFilePath, m);
  }

  const project = new Project({
    tsConfigFilePath: "./tsconfig.json",
  });

  return {
    name: "storybook:rollup-plugin-webpack-stats",
    enforce: "post",
    moduleParsed: (mod) => {
      if (!isUserCode(mod.id)) {
        return;
      }

      const file = project.getSourceFile(path.resolve(mod.id));

      if (!file) {
        const moduleImports = mod.importedIds.concat(
          mod.dynamicallyImportedIds,
        );

        for (const moduleImport of moduleImports) {
          if (isUserCode(moduleImport)) {
            addFilesToModuleMap(moduleImport, [mod.id]);
          }
        }

        return;
      }

      const filePath = file.getFilePath();
      const declarations = file.getVariableDeclarations() ?? [];
      const importDeclarations = file.getImportDeclarations() ?? [];

      for (const declaration of declarations) {
        const x = Array.from(
          new Set(
            declaration
              .findReferences()
              .flatMap((references) =>
                references
                  .getReferences()
                  .map((reference) => reference.getSourceFile().getFilePath()),
              )
              .filter((path) => path !== filePath && isUserCode(path)),
          ),
        );

        addFilesToModuleMap(filePath, x);
      }

      for (const importDeclaration of importDeclarations) {
        if (
          !(
            importDeclaration.isModuleSpecifierRelative() &&
            importDeclaration.getModuleSpecifierValue()?.endsWith(".css")
          )
        ) {
          continue;
        }

        const cssFile = path.resolve(
          path.dirname(filePath),
          importDeclaration.getModuleSpecifierValue(),
        );

        addFilesToModuleMap(cssFile, [filePath]);
      }
    },
    storybookGetStats() {
      const stats: Stats = { modules: Array.from(statsMap.values()) };
      return { ...stats, toJson: () => stats };
    },
  };
}
