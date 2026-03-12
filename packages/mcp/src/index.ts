export { buildRegistry } from "./build/buildRegistry.js";
export { runCli } from "./cli.js";
export { loadRegistry } from "./registry/loadRegistry.js";
export { createSaltMcpServer } from "./server/createServer.js";

export * from "./tools/index.js";
export type {
  BuildRegistryOptions,
  ChangeRecord,
  ComponentRecord,
  CountrySymbolRecord,
  DeprecationRecord,
  ExampleRecord,
  IconRecord,
  LoadRegistryOptions,
  PackageRecord,
  PageKind,
  PageRecord,
  PatternRecord,
  RegistryBuildInfo,
  RegistrySourceArtifact,
  SaltRegistry,
  SaltStatus,
  SearchArea,
  SearchIndexEntry,
  TokenRecord,
} from "./types.js";
