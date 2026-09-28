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
  const cache = new Map();

  function componentsFor(packageDirectory) {
    if (!cache.has(packageDirectory)) {
      const entry = path.join(packagesDir, packageDirectory, "src", "index.ts");
      const components = existsSync(entry)
        ? docgen.parse(entry, DOCGEN_OPTIONS)
        : [];
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
