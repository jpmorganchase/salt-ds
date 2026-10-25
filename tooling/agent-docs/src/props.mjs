import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { createTypeIndex } from "./types.mjs";

const require = createRequire(import.meta.url);

const fromReactTypes = (prop) =>
  /@types[\\/]react[\\/]/.test(prop.parent?.fileName || "");

/** Returns react-docgen-typescript component docs by package directory. */
export function createPropsProvider({ packagesDir }) {
  const docgen = require("react-docgen-typescript");
  // The React props each component inherits, which the tables leave out:
  // component name -> interface (such as TdHTMLAttributes) -> prop names.
  let inherited = new Map();
  // Matches site/propsGen.js so the props match the website's props tables.
  const options = {
    propFilter: (prop, component) => {
      if (!fromReactTypes(prop)) return true;
      const byInterface = inherited.get(component.name) ?? new Map();
      const names = byInterface.get(prop.parent.name) ?? [];
      names.push(prop.name);
      byInterface.set(prop.parent.name, names);
      inherited.set(component.name, byInterface);
      return false;
    },
    shouldExtractLiteralValuesFromEnum: true,
    shouldRemoveUndefinedFromOptional: true,
  };
  // Resolve cross-package types from source even before packages are built.
  const configPath = path.resolve(packagesDir, "..", "tsconfig.json");
  const parser = existsSync(configPath)
    ? docgen.withCustomConfig(configPath, options)
    : docgen.withDefaultConfig(options);
  const types = createTypeIndex({ packagesDir });
  const cache = new Map();
  // The file declaring a component: docgen reports the entry point it parsed.
  const sourceOf = (packageDirectory, component) =>
    types.declaringFile(packageDirectory, component.displayName);

  function componentsFor(packageDirectory) {
    if (!cache.has(packageDirectory)) {
      const entry = path.join(packagesDir, packageDirectory, "src", "index.ts");
      inherited = new Map();
      const components = existsSync(entry) ? parser.parse(entry) : [];
      cache.set(
        packageDirectory,
        new Map(
          components.map((component) => [
            component.displayName,
            {
              ...component,
              inherited: Object.fromEntries(
                inherited.get(component.displayName) ?? [],
              ),
            },
          ]),
        ),
      );
    }
    return cache.get(packageDirectory);
  }

  return {
    get(packageDirectory, componentName) {
      return componentsFor(packageDirectory).get(componentName);
    },
    /** Every component parsed from the package's entry point, by name. */
    all(packageDirectory) {
      return componentsFor(packageDirectory);
    },
    /**
     * Definitions of the Salt types named in a component's prop types,
     * leaving out those already in `shown` (and adding the rest to it).
     */
    typeDefinitions(packageDirectory, component, propTypes, shown) {
      const file = sourceOf(packageDirectory, component);
      return file
        ? types.definitions(
            propTypes,
            { file, componentName: component.displayName },
            shown,
          )
        : [];
    },
    /** A prop's declared type, for props docgen prints as `any`. */
    declaredType(packageDirectory, component, propName) {
      const file = sourceOf(packageDirectory, component);
      return file
        ? types.declaredPropType(component.displayName, file, propName)
        : undefined;
    },
    /** The elements whose attributes a component's props extend, such as ["td"]. */
    elementsOf(packageDirectory, component) {
      const file = sourceOf(packageDirectory, component);
      return file ? types.elementsOf(component.displayName, file) : [];
    },
  };
}
