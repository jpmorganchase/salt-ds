import path from "node:path";
import ts from "typescript";

export { buildRegistry } from "./buildRegistry.js";
export { createCatalogInputInventory } from "./catalogInputInventory.js";
export { createSealedCatalogGeneratorDigest } from "./generatorDependencyInventory.js";

export const catalogGeneratorTypeScriptIdentity = Object.freeze({
  version: ts.version,
  default_lib_directory: path.dirname(ts.getDefaultLibFilePath({})),
});
