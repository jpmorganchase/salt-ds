export { buildRegistry } from "./build/buildRegistry.js";
export { runCli } from "./cli.js";
export { loadRegistry } from "./registry/loadRegistry.js";
export { createSaltMcpServer } from "./server/createServer.js";

export {
  type AnalyzeSaltCodeInput,
  type AnalyzeSaltCodeResult,
  analyzeSaltCode,
} from "./tools/analyzeSaltCode.js";
export {
  type ChooseSaltSolutionInput,
  type ChooseSaltSolutionResult,
  chooseSaltSolution,
  type SaltSolutionType,
} from "./tools/chooseSaltSolution.js";
export {
  type CompareSaltVersionsInput,
  type CompareSaltVersionsResult,
  compareSaltVersions,
} from "./tools/compareSaltVersions.js";
export {
  type ClarifyingQuestion,
  type DiscoverSaltDecision,
  type DiscoverSaltInput,
  type DiscoverSaltResult,
  discoverSalt,
} from "./tools/discoverSalt.js";
export {
  type GetSaltEntityInput,
  type GetSaltEntityResult,
  getSaltEntity,
  type SaltEntityType,
} from "./tools/getSaltEntity.js";
export {
  type GetSaltExamplesInput,
  type GetSaltExamplesResult,
  getSaltExamples,
} from "./tools/getSaltExamples.js";
export {
  TOOL_DEFINITIONS,
  type ToolDefinition,
} from "./tools/toolDefinitions.js";
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
