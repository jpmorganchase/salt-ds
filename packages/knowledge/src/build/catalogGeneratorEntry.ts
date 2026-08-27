import path from "node:path";
import ts from "typescript";

export { buildRegistry } from "./buildRegistry.js";
export {
  createCatalogInputInventory,
  validateCatalogInputPatterns,
} from "./catalogInputInventory.js";
export { createSealedCatalogGeneratorDigest } from "./generatorDependencyInventory.js";
export {
  createExtractionParityProjection,
  createExtractionParityReceipt,
} from "./extractionParity.js";

export const catalogGeneratorTypeScriptIdentity = Object.freeze({
  version: ts.version,
  default_lib_directory: path.dirname(ts.getDefaultLibFilePath({})),
});
