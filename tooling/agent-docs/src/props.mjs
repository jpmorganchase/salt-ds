import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);

// Matches site/propsGen.js so the props match the website's props tables.
const DOCGEN_OPTIONS = {
  propFilter: (prop) =>
    !/@types[\\/]react[\\/]/.test(prop.parent?.fileName || ""),
  shouldExtractLiteralValuesFromEnum: true,
  shouldRemoveUndefinedFromOptional: true,
};

/** Returns react-docgen-typescript component docs by package directory. */
export function createPropsProvider({ packagesDir }) {
  const docgen = require("react-docgen-typescript");
  // Resolve cross-package types from source even before packages are built.
  const configPath = path.resolve(packagesDir, "..", "tsconfig.json");
  const parser = existsSync(configPath)
    ? docgen.withCustomConfig(configPath, DOCGEN_OPTIONS)
    : docgen.withDefaultConfig(DOCGEN_OPTIONS);
  const cache = new Map();

  function componentsFor(packageDirectory) {
    if (!cache.has(packageDirectory)) {
      const entry = path.join(packagesDir, packageDirectory, "src", "index.ts");
      const components = existsSync(entry) ? parser.parse(entry) : [];
      cache.set(
        packageDirectory,
        new Map(
          components.map((component) => [component.displayName, component]),
        ),
      );
    }
    return cache.get(packageDirectory);
  }

  return {
    get(packageDirectory, componentName) {
      return componentsFor(packageDirectory).get(componentName);
    },
  };
}
