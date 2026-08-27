import { formatAccessibilityImplementationSignalStatement } from "../catalog/accessibilityImplementationSignal.js";
import {
  createApiSymbolId,
  createDeprecationId,
  isApiSymbolSpaceReplacementCompatible,
} from "../catalog/catalogApiSymbolV2.js";
import { isSafeAbsoluteHttpsUrl } from "../catalog/catalogHttpsUrl.js";
import {
  assertNoLegacyContentIds,
  type CatalogContentCodecName,
  type CatalogContentMediaType,
  type CatalogContentReference,
  type CatalogPayloadForCodec,
  catalogContentCodecs,
  catalogContentReference,
  MAX_CATALOG_CONTENT_BYTES,
  parseCatalogContentPayload,
} from "../catalog/catalogPayloadSchemaV2.js";
import { isPortableRepositoryPath } from "../catalog/catalogPortablePath.js";
import {
  CATALOG_FAMILY_NAMES,
  CATALOG_SEARCH_TARGET_FAMILY_NAMES,
  type CatalogFamilyName,
  type CatalogRecord,
  type CatalogRecordForFamily,
  type CatalogReference,
  type CatalogReferenceFor,
  type CatalogValidationMetadata,
  canonicalSiteRouteCodec,
  createCatalogSearchDocument,
  evidenceCodec,
  policyProfileCodec,
  relationCodec,
  UNVALIDATED_SOURCE_ASSERTION_REASON,
} from "../catalog/catalogSchemaV2.js";
import {
  canonicalJson,
  compareCatalogIds,
  compareOrdinalStrings,
  sha256Bytes,
  shortStableId,
  stableShaId,
} from "../catalog/catalogSerialization.js";
import type { SaltTokenPolicyEvidenceRef } from "../evidence.js";
import type { SaltTokenPolicyStructuralRoleRulePackBody } from "../tokenPolicyStructuralRoleRules.js";
import type {
  AccessibilityImplementationSignal,
  ApiSymbolIdentity,
  ComponentRecord,
  CountrySymbolRecord,
  DeprecationRecord,
  ExampleRecord,
  GuideRecord,
  IconRecord,
  PackageRecord,
  PageRecord,
  PatternRecord,
  SaltRegistry,
  TokenDeclarationProjection,
  TokenRecord,
} from "../types.js";
import type {
  CatalogInputInventory,
  CatalogInputInventoryEntry,
} from "./catalogInputInventory.js";
import { isSemanticCatalogSourcePath } from "./catalogProductionSource.js";

export interface CatalogContentBlob {
  id: string;
  codec: CatalogContentCodecName;
  mediaType: CatalogContentMediaType;
  bytes: Uint8Array;
  extractionMethod:
    | "registry_projection"
    | "source_extraction"
    | "generated_policy"
    | "compiler_analysis";
}

export interface NormalizedCatalogV2 {
  records: Record<CatalogFamilyName, CatalogRecord[]>;
  contentBlobs: Map<string, CatalogContentBlob>;
}

type SourceRecord = CatalogRecordForFamily<"source">;
type EvidenceRecord = CatalogRecordForFamily<"evidence">;
type PolicyProfileRecord = CatalogRecordForFamily<"policy_profile">;

const textEncoder = new TextEncoder();

function catalogRef<Family extends CatalogFamilyName>(
  family: Family,
  id: string,
): CatalogReferenceFor<Family> {
  return { family, id };
}

function hasSameApiOwner(
  left: ApiSymbolIdentity,
  right: ApiSymbolIdentity,
): boolean {
  return (
    left.package === right.package &&
    left.entrypoint === right.entrypoint &&
    left.export_name === right.export_name
  );
}

function compareStrings(left: string, right: string): number {
  return compareOrdinalStrings(left, right);
}

function uniqueStrings(values: readonly string[]): string[] {
  return [...new Set(values.filter((value) => value.trim().length > 0))].sort(
    compareStrings,
  );
}

function uniqueOrderedStrings(values: readonly string[]): string[] {
  return [...new Set(values.filter((value) => value.trim().length > 0))];
}

class ContentBuilder {
  readonly blobs = new Map<string, CatalogContentBlob>();

  add<Codec extends CatalogContentCodecName>(
    codec: Codec,
    value: CatalogPayloadForCodec<Codec>,
    extractionMethod: CatalogContentBlob["extractionMethod"],
  ): CatalogContentReference<Codec> {
    assertNoLegacyContentIds(value);
    const parsed = parseCatalogContentPayload(codec, value);
    const mediaType = catalogContentCodecs[codec].mediaType;
    const serialized =
      typeof parsed === "string" ? parsed : canonicalJson(parsed);
    const bytes = textEncoder.encode(serialized);
    if (bytes.byteLength > MAX_CATALOG_CONTENT_BYTES) {
      throw new Error(
        `Catalog content '${codec}' is ${bytes.byteLength} bytes; the public resource limit is ${MAX_CATALOG_CONTENT_BYTES} bytes. Split the content before publication.`,
      );
    }
    const identity = new Uint8Array(
      textEncoder.encode(`${mediaType}\0`).byteLength + bytes.byteLength,
    );
    const prefix = textEncoder.encode(`${mediaType}\0`);
    identity.set(prefix, 0);
    identity.set(bytes, prefix.byteLength);
    const id = sha256Bytes(identity);
    const existing = this.blobs.get(id);
    if (existing) {
      if (
        existing.codec !== codec ||
        existing.mediaType !== mediaType ||
        Buffer.compare(Buffer.from(existing.bytes), Buffer.from(bytes)) !== 0
      ) {
        throw new Error(
          `Content '${id}' is assigned incompatible codecs or bytes.`,
        );
      }
      return catalogContentReference(codec, id);
    }

    this.blobs.set(id, {
      id,
      codec,
      mediaType,
      bytes,
      extractionMethod,
    });
    return catalogContentReference(codec, id);
  }
}

class SourceBuilder {
  readonly records = new Map<string, SourceRecord>();
  readonly inventoryByPath: Map<string, CatalogInputInventoryEntry>;
  readonly inventoryPaths: string[];

  constructor(inventory: CatalogInputInventory) {
    this.inventoryByPath = new Map(
      inventory.entries.map((entry) => [entry.path, entry]),
    );
    this.inventoryPaths = inventory.entries.map((entry) => entry.path);
  }

  private add(record: SourceRecord): CatalogReferenceFor<"source"> {
    const existing = this.records.get(record.id);
    if (existing) {
      if (
        existing.source_kind !== record.source_kind ||
        canonicalJson({
          ...existing,
          status: "neutral",
          ...("entrypoint_contexts" in existing
            ? { entrypoint_contexts: [] }
            : {}),
        }) !==
          canonicalJson({
            ...record,
            status: "neutral",
            ...("entrypoint_contexts" in record
              ? { entrypoint_contexts: [] }
              : {}),
          })
      ) {
        throw new Error(`Source id collision for ${record.id}.`);
      }
      const statuses = new Set([existing.status, record.status]);
      if (statuses.has("current") && statuses.has("deprecated")) {
        throw new Error(
          `Source '${record.id}' was classified as both current and deprecated.`,
        );
      }
      existing.status = statuses.has("deprecated")
        ? "deprecated"
        : statuses.has("current")
          ? "current"
          : "neutral";
      if (
        "entrypoint_contexts" in existing &&
        "entrypoint_contexts" in record
      ) {
        const contexts = new Map(
          [...existing.entrypoint_contexts, ...record.entrypoint_contexts].map(
            (context) => [canonicalJson(context), context] as const,
          ),
        );
        existing.entrypoint_contexts = [...contexts.values()].sort(
          (left, right) =>
            compareOrdinalStrings(canonicalJson(left), canonicalJson(right)),
        );
      }
      return catalogRef("source", existing.id);
    }
    this.records.set(record.id, record);
    return catalogRef("source", record.id);
  }

  fromRepoPath(
    locatorInput: string,
    status: SourceRecord["status"] = "neutral",
    entrypointContexts: Extract<
      SourceRecord,
      { source_kind: "repository_file" | "repository_directory" }
    >["entrypoint_contexts"] = [],
  ): CatalogReferenceFor<"source"> {
    if (!isPortableRepositoryPath(locatorInput)) {
      throw new Error(
        `Catalog repository source must use a portable repository-relative path: ${locatorInput}`,
      );
    }
    const locator = locatorInput;
    const file = this.inventoryByPath.get(locator);
    const fullDirectoryEntries = file
      ? []
      : this.inventoryPaths.filter((candidate) =>
          candidate.startsWith(`${locator}/`),
        );
    if (!file && fullDirectoryEntries.length === 0) {
      throw new Error(
        `Catalog source path is missing or has incorrect case: ${locator}`,
      );
    }
    if (file && !isSemanticCatalogSourcePath(locator)) {
      throw new Error(
        `Catalog source path is not production or consumed semantic evidence: ${locator}`,
      );
    }
    const semanticDirectoryEntries = fullDirectoryEntries.filter(
      isSemanticCatalogSourcePath,
    );
    if (!file && semanticDirectoryEntries.length === 0) {
      throw new Error(
        `Catalog source directory has no production or consumed semantic evidence: ${locator}`,
      );
    }

    const sourceKind = file
      ? ("repository_file" as const)
      : ("repository_directory" as const);
    const digest = file
      ? file.sha256
      : sha256Bytes(
          canonicalJson(
            semanticDirectoryEntries.map((candidate) => {
              const entry = this.inventoryByPath.get(candidate);
              if (!entry) {
                throw new Error(`Missing inventory entry for ${candidate}.`);
              }
              return entry;
            }),
          ),
        );
    const bytes = file
      ? file.bytes
      : semanticDirectoryEntries.reduce(
          (total, candidate) =>
            total + (this.inventoryByPath.get(candidate)?.bytes ?? 0),
          0,
        );
    const id = shortStableId("source", {
      source_kind: sourceKind,
      locator,
    });
    return this.add({
      family: "source",
      id,
      source_kind: sourceKind,
      locator,
      sha256: digest,
      bytes,
      status,
      entrypoint_contexts: [...entrypointContexts].sort((left, right) =>
        compareOrdinalStrings(canonicalJson(left), canonicalJson(right)),
      ),
      extraction_method: "input_inventory",
      validation: {
        state: "validated",
        method: "digest_bound",
        basis_digest: digest,
        validated_at: null,
      },
    });
  }

  fromExternalHttps(
    locatorInput: string,
    status: SourceRecord["status"] = "neutral",
  ): CatalogReferenceFor<"source"> {
    if (!isSafeAbsoluteHttpsUrl(locatorInput)) {
      throw new Error(
        `External catalog source must be a safe absolute HTTPS URL: ${locatorInput}`,
      );
    }
    const locator = locatorInput;
    return this.add({
      family: "source",
      id: shortStableId("source", {
        source_kind: "external_https",
        locator,
      }),
      source_kind: "external_https",
      locator,
      status,
      extraction_method: "external_reference",
      validation: {
        state: "unvalidated",
        reason:
          "The URL is syntactically valid HTTPS, but publication was not checked.",
        validated_at: null,
      },
    });
  }

  fromSiteRoute(
    locator: string,
    pageRef: CatalogReferenceFor<"page">,
    status: SourceRecord["status"] = "neutral",
  ): CatalogReferenceFor<"source"> {
    const basisDigest = sha256Bytes(
      canonicalJson({ locator, page_ref: pageRef }),
    );
    return this.add({
      family: "source",
      id: shortStableId("source", {
        source_kind: "site_route",
        locator,
        page_ref: pageRef,
      }),
      source_kind: "site_route",
      locator,
      page_ref: pageRef,
      status,
      extraction_method: "route_resolution",
      validation: {
        state: "validated",
        method: "route_resolved",
        basis_digest: basisDigest,
        validated_at: null,
      },
    });
  }

  fromPackage(
    packageRef: CatalogReferenceFor<"package">,
    version: string | null,
  ): CatalogReferenceFor<"source"> {
    const basisDigest = sha256Bytes(
      canonicalJson({ package_ref: packageRef, version }),
    );
    return this.add({
      family: "source",
      id: shortStableId("source", {
        source_kind: "package_source",
        package_ref: packageRef,
        version,
      }),
      source_kind: "package_source",
      package_ref: packageRef,
      version,
      status: "neutral",
      extraction_method: "package_metadata",
      validation: {
        state: "validated",
        method: "schema",
        basis_digest: basisDigest,
        validated_at: null,
      },
    });
  }

  fromCatalogRecord(
    recordRef: Extract<
      SourceRecord,
      { source_kind: "catalog_record_provenance" }
    >["record_ref"],
    fieldPath: string | null,
    basisDigest: string,
  ): CatalogReferenceFor<"source"> {
    return this.add({
      family: "source",
      id: shortStableId("source", {
        source_kind: "catalog_record_provenance",
        record_ref: recordRef,
        field_path: fieldPath,
        basis_digest: basisDigest,
      }),
      source_kind: "catalog_record_provenance",
      record_ref: recordRef,
      field_path: fieldPath,
      basis_digest: basisDigest,
      status: "neutral",
      extraction_method: "catalog_reference",
      validation: {
        state: "validated",
        method: "schema",
        basis_digest: basisDigest,
        validated_at: null,
      },
    });
  }

  fromPublicLocator(
    locatorInput: string,
    options: {
      status?: SourceRecord["status"];
      resolvePage?: (route: string) => CatalogReferenceFor<"page">;
    } = {},
  ): CatalogReferenceFor<"source"> {
    const locator = locatorInput;
    const status = options.status ?? "neutral";
    if (/^[a-z][a-z0-9+.-]*:/iu.test(locator)) {
      return this.fromExternalHttps(locator, status);
    }
    if (locator.startsWith("/")) {
      if (!options.resolvePage) {
        throw new Error(
          `Catalog route '${locator}' cannot be recorded without page resolution.`,
        );
      }
      const route = canonicalSiteRouteCodec.parse(locator);
      return this.fromSiteRoute(route, options.resolvePage(route), status);
    }
    throw new Error(
      `Catalog public source must use a canonical Salt route or safe absolute HTTPS URL: ${locator}`,
    );
  }
}

function linkValidation(
  href: string,
  pageRef: CatalogReferenceFor<"page"> | null,
): CatalogValidationMetadata {
  return pageRef
    ? {
        state: "validated",
        method: "route_resolved",
        basis_digest: sha256Bytes(canonicalJson({ href, page_ref: pageRef })),
        validated_at: null,
      }
    : {
        state: "unvalidated",
        reason:
          "The external HTTPS link was parsed but its publication was not checked.",
        validated_at: null,
      };
}

function unvalidatedAssertion(): CatalogValidationMetadata {
  return {
    state: "unvalidated",
    reason: UNVALIDATED_SOURCE_ASSERTION_REASON,
    validated_at: null,
  };
}

function buildNameResolver<
  const Family extends "component" | "pattern" | "page" | "package",
>(
  family: Family,
  records: Array<{
    id: string;
    name?: string;
    title?: string;
    aliases?: string[];
    route?: string;
  }>,
): (value: string) => CatalogReferenceFor<Family> {
  const exact = new Map<string, string>();
  const aliases = new Map<string, Set<string>>();
  for (const record of records) {
    const exactNames =
      family === "page"
        ? [record.route]
        : [record.name, record.title, record.route];
    for (const name of exactNames) {
      if (!name) continue;
      const previous = exact.get(name);
      if (previous && previous !== record.id) {
        throw new Error(
          `Duplicate exact ${family} name '${name}' for '${previous}' and '${record.id}'.`,
        );
      }
      exact.set(name, record.id);
    }
    const aliasNames =
      family === "page"
        ? [record.title, ...(record.aliases ?? [])]
        : (record.aliases ?? []);
    for (const alias of aliasNames) {
      if (!alias) continue;
      const ids = aliases.get(alias) ?? new Set<string>();
      ids.add(record.id);
      aliases.set(alias, ids);
    }
  }

  return (value: string): CatalogReferenceFor<Family> => {
    const exactId = exact.get(value);
    if (exactId) return catalogRef(family, exactId);
    const aliasMatches = aliases.get(value);
    if (aliasMatches?.size === 1) {
      return catalogRef(family, [...aliasMatches][0] as string);
    }
    if (aliasMatches && aliasMatches.size > 1) {
      throw new Error(
        `Ambiguous ${family} alias '${value}' resolves to ${[
          ...aliasMatches,
        ].join(", ")}.`,
      );
    }
    throw new Error(`Unresolved ${family} reference '${value}'.`);
  };
}

function sourcesForEvidenceRef(
  ref: SaltTokenPolicyEvidenceRef,
  sources: SourceBuilder,
  resolvePage: (route: string) => CatalogReferenceFor<"page">,
): CatalogReferenceFor<"source">[] {
  const references: CatalogReferenceFor<"source">[] = [];
  const add = (reference: CatalogReferenceFor<"source">): void => {
    if (!references.some((candidate) => candidate.id === reference.id)) {
      references.push(reference);
    }
  };

  if (ref.source.repo_path) {
    add(sources.fromRepoPath(ref.source.repo_path));
  }
  if (ref.source.url) {
    add(
      sources.fromPublicLocator(ref.source.url, {
        resolvePage,
      }),
    );
  }

  if (references.length === 0) {
    throw new Error(
      `Canonical evidence '${ref.id}' has no resolvable source reference.`,
    );
  }
  return references.sort((left, right) =>
    compareOrdinalStrings(left.id, right.id),
  );
}

function classifyLink(
  label: string,
  href: string,
): "external_demo" | "design_reference" | "documentation_link" {
  const normalized = `${label} ${href}`.toLowerCase();
  if (
    normalized.includes("figma") ||
    normalized.includes("design reference") ||
    normalized.includes("design spec")
  ) {
    return "design_reference";
  }
  if (
    normalized.includes("storybook") ||
    normalized.includes("demo") ||
    normalized.includes("codesandbox")
  ) {
    return "external_demo";
  }
  return "documentation_link";
}

function inferPageKindOwner(
  example: ExampleRecord,
  resolvePage: (value: string) => CatalogReference,
): CatalogReference {
  const candidates = [
    example.target_name,
    `/salt/foundations/${example.target_name.toLowerCase().replace(/\s+/gu, "-")}`,
  ];
  let lastError: unknown = null;
  for (const candidate of candidates) {
    try {
      return resolvePage(candidate);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error(`Unresolved foundation owner '${example.target_name}'.`);
}

export function normalizeCatalogV2(input: {
  registry: SaltRegistry;
  inventory: CatalogInputInventory;
  tokenPolicyStructuralRoleRulePackBody?: SaltTokenPolicyStructuralRoleRulePackBody | null;
}): NormalizedCatalogV2 {
  const records = Object.fromEntries(
    CATALOG_FAMILY_NAMES.map((family) => [family, []]),
  ) as unknown as Record<CatalogFamilyName, CatalogRecord[]>;
  const content = new ContentBuilder();
  const sources = new SourceBuilder(input.inventory);
  const pageRefByRoute = new Map<string, CatalogReferenceFor<"page">>();
  for (const page of input.registry.pages) {
    const existing = pageRefByRoute.get(page.route);
    if (existing && existing.id !== page.id) {
      throw new Error(
        `Duplicate page route '${page.route}' for '${existing.id}' and '${page.id}'.`,
      );
    }
    pageRefByRoute.set(page.route, catalogRef("page", page.id));
  }
  const resolvePageRoute = (route: string): CatalogReferenceFor<"page"> => {
    const reference = pageRefByRoute.get(route);
    if (!reference) {
      throw new Error(`Unresolved catalog page route '${route}'.`);
    }
    return reference;
  };
  const evidenceById = new Map<string, EvidenceRecord>();
  const policyById = new Map<string, PolicyProfileRecord>();
  const relationById = new Map<string, CatalogRecordForFamily<"relation">>();

  const addRecord = (record: CatalogRecord): void => {
    records[record.family].push(record);
  };

  const addEvidence = (inputRecord: unknown): string => {
    const record = evidenceCodec.parse(inputRecord);
    const previous = evidenceById.get(record.id);
    if (previous && canonicalJson(previous) !== canonicalJson(record)) {
      throw new Error(`Evidence id collision for '${record.id}'.`);
    }
    evidenceById.set(record.id, record);
    return record.id;
  };

  const addPolicy = <Kind extends PolicyProfileRecord["policy_kind"]>(
    policyKind: Kind,
    payload: CatalogPayloadForCodec<Kind>,
  ): string => {
    const parsedPayload = parseCatalogContentPayload(policyKind, payload);
    const identity = { policy_kind: policyKind, payload: parsedPayload };
    const id = shortStableId("policy-profile", identity);
    const record = policyProfileCodec.parse({
      family: "policy_profile",
      id,
      policy_kind: policyKind,
      summary: `${policyKind.replace(/_/gu, " ")} policy`,
      body_content_ref: content.add(
        policyKind,
        parsedPayload,
        "generated_policy",
      ),
    });
    const existing = policyById.get(id);
    if (existing && canonicalJson(existing) !== canonicalJson(record)) {
      throw new Error(`Policy profile id collision for '${id}'.`);
    }
    policyById.set(id, record);
    return id;
  };

  const addRelation = (
    relationKind:
      | "composes"
      | "related_to"
      | "documents"
      | "observed_in_example"
      | "export_observed_in_example"
      | "exported_from"
      | "replaced_by",
    source: CatalogReference,
    target: CatalogReference,
    options: {
      provenance: "declared" | "derived" | "observation" | "curated";
      role?: string | null;
      sourceOrdinal?: number;
      sourceEvidenceIds?: string[];
    },
  ): void => {
    const identity = {
      relation_kind: relationKind,
      source,
      target,
      provenance: options.provenance,
      role: options.role ?? null,
      ...(relationKind === "related_to" ||
      relationKind === "composes" ||
      relationKind === "documents"
        ? { source_ordinal: options.sourceOrdinal }
        : {}),
    };
    const id = stableShaId("relation", identity);
    const normative = relationKind === "replaced_by";
    const sourceEvidenceRefs = uniqueStrings(
      options.sourceEvidenceIds ?? [],
    ).map((evidenceId) => catalogRef("evidence", evidenceId));
    const record = relationCodec.parse({
      family: "relation",
      id,
      relation_kind: relationKind,
      source,
      target,
      provenance: options.provenance,
      role: options.role ?? null,
      ...(relationKind === "related_to" ||
      relationKind === "composes" ||
      relationKind === "documents"
        ? { source_ordinal: options.sourceOrdinal }
        : {}),
      normative,
      source_evidence_refs: sourceEvidenceRefs,
    });
    const existing = relationById.get(id);
    if (existing && canonicalJson(existing) !== canonicalJson(record)) {
      throw new Error(`Relation id collision for '${id}'.`);
    }
    relationById.set(id, record);
  };

  const packageRefByName = new Map<string, CatalogReferenceFor<"package">>();
  for (const packageRecord of input.registry.packages) {
    const sourceRoot = sources.fromRepoPath(packageRecord.source_root);
    const changelog = packageRecord.changelog_path
      ? sources.fromRepoPath(packageRecord.changelog_path)
      : null;
    const docs = packageRecord.docs_root
      ? sources.fromPublicLocator(packageRecord.docs_root, {
          resolvePage: resolvePageRoute,
        })
      : null;
    const fact: CatalogRecordForFamily<"package"> = {
      family: "package",
      id: packageRecord.id,
      name: packageRecord.name,
      aliases: [],
      summary: packageRecord.summary,
      detail_content_ref: content.add(
        "package_detail",
        {
          source_root: packageRecord.source_root,
          changelog_path: packageRecord.changelog_path,
          docs_root: packageRecord.docs_root,
        },
        "registry_projection",
      ),
      status: packageRecord.status,
      version: packageRecord.version,
      source_root_ref: sourceRoot,
      changelog_source_ref: changelog,
      docs_source_ref: docs,
    };
    addRecord(fact);
    packageRefByName.set(packageRecord.name, catalogRef("package", fact.id));
  }

  const requirePackageRef = (name: string): CatalogReferenceFor<"package"> => {
    const reference = packageRefByName.get(name);
    if (!reference) {
      throw new Error(`Unresolved package reference '${name}'.`);
    }
    return reference;
  };
  const apiSymbolById = new Map<string, CatalogRecordForFamily<"api_symbol">>();
  const ensureApiSymbol = (
    symbol: ApiSymbolIdentity,
  ): CatalogReferenceFor<"api_symbol"> => {
    const id = createApiSymbolId(symbol);
    const fact: CatalogRecordForFamily<"api_symbol"> = {
      family: "api_symbol",
      id,
      package_ref: requirePackageRef(symbol.package),
      entrypoint: symbol.entrypoint,
      export_name: symbol.export_name,
      symbol_space: symbol.symbol_space,
      member_path: symbol.member_path,
    };
    const existing = apiSymbolById.get(id);
    if (existing && canonicalJson(existing) !== canonicalJson(fact)) {
      throw new Error(`API symbol id collision for '${id}'.`);
    }
    if (!existing) {
      apiSymbolById.set(id, fact);
      addRecord(fact);
    }
    return catalogRef("api_symbol", id);
  };

  const componentFactByName = new Map<
    string,
    CatalogRecordForFamily<"component">
  >();
  for (const component of input.registry.components) {
    const policyProfileId = addPolicy("component_usage", {
      when_to_use: component.when_to_use,
      when_not_to_use: component.when_not_to_use,
      alternatives: component.alternatives,
      semantics: component.semantics ?? null,
      retrieval_signals: component.retrieval_signals ?? null,
    });
    const componentSource = component.source.repo_path
      ? sources.fromRepoPath(component.source.repo_path)
      : null;
    const fact: CatalogRecordForFamily<"component"> = {
      family: "component",
      id: component.id,
      name: component.name,
      aliases: uniqueStrings(component.aliases),
      summary: component.summary,
      detail_content_ref: content.add(
        "component_detail",
        {
          package_since: component.package.since,
          props: component.props,
          ...(component.prop_subjects
            ? { prop_subjects: component.prop_subjects }
            : {}),
          ...(component.sub_components
            ? {
                sub_components: component.sub_components.map(
                  ({ repo_path: _repoPath, ...subComponent }) => subComponent,
                ),
              }
            : {}),
          ...(component.composition
            ? { composition: component.composition }
            : {}),
          ...(component.implementation_requirements
            ? {
                implementation_requirements: {
                  required_imports:
                    component.implementation_requirements.required_imports.map(
                      ({ source_url: sourceUrl, ...requiredImport }) => ({
                        ...requiredImport,
                        source_ref: sources.fromPublicLocator(sourceUrl, {
                          resolvePage: resolvePageRoute,
                        }),
                      }),
                    ),
                },
              }
            : {}),
          related_docs: component.related_docs,
          ...(component.inference ? { inference: component.inference } : {}),
          deprecations: component.deprecations,
        },
        "registry_projection",
      ),
      status: component.status,
      package_ref: requirePackageRef(component.package.name),
      // Category maps declare the primary category first, followed by
      // secondary categories. Preserve that semantic order while removing
      // duplicates; the source builders already provide deterministic input.
      categories: uniqueOrderedStrings(component.category),
      tags: uniqueStrings(component.tags),
      source_ref: componentSource,
      export_name: component.source.export_name,
      policy_profile_ref: catalogRef("policy_profile", policyProfileId),
    };
    addRecord(fact);
    componentFactByName.set(component.name, fact);
    for (const subComponent of component.sub_components ?? []) {
      if (!subComponent.repo_path) {
        throw new Error(
          `Subcomponent export '${subComponent.export_name}' on '${component.name}' has no compiler-resolved source origin.`,
        );
      }
      addRelation(
        "exported_from",
        catalogRef("component", fact.id),
        sources.fromRepoPath(subComponent.repo_path),
        {
          provenance: "derived",
          role: `export:${subComponent.export_name}`,
        },
      );
    }
  }

  for (const icon of input.registry.icons) {
    if (!icon.source.repo_path) {
      throw new Error(
        `Icon export '${icon.source.export_name}' has no export-graph source origin.`,
      );
    }
    addRecord({
      family: "icon",
      id: icon.id,
      name: icon.name,
      aliases: uniqueStrings(icon.aliases),
      summary: icon.summary,
      detail_content_ref: content.add(
        "icon_detail",
        {
          package_since: icon.package.since,
          related_docs: icon.related_docs,
          deprecations: icon.deprecations,
        },
        "registry_projection",
      ),
      status: icon.status,
      package_ref: requirePackageRef(icon.package.name),
      base_name: icon.base_name,
      figma_name: icon.figma_name,
      category: icon.category,
      synonyms: uniqueStrings(icon.synonyms),
      variant: icon.variant,
      source_ref: sources.fromRepoPath(icon.source.repo_path),
      export_name: icon.source.export_name,
    });
  }

  for (const symbol of input.registry.country_symbols) {
    if (!symbol.variants.circle.repo_path || !symbol.variants.sharp.repo_path) {
      throw new Error(
        `Country symbol '${symbol.code}' has an export without a graph-proven source origin.`,
      );
    }
    addRecord({
      family: "country_symbol",
      id: symbol.id,
      name: symbol.name,
      aliases: uniqueStrings(symbol.aliases),
      summary: symbol.summary,
      detail_content_ref: content.add(
        "country_symbol_detail",
        {
          package_since: symbol.package.since,
          related_docs: symbol.related_docs,
          deprecations: symbol.deprecations,
        },
        "registry_projection",
      ),
      status: symbol.status,
      package_ref: requirePackageRef(symbol.package.name),
      code: symbol.code,
      variants: {
        circle: {
          export_name: symbol.variants.circle.export_name,
          source_ref: sources.fromRepoPath(symbol.variants.circle.repo_path),
        },
        sharp: {
          export_name: symbol.variants.sharp.export_name,
          source_ref: sources.fromRepoPath(symbol.variants.sharp.repo_path),
        },
      },
    });
  }

  const patternFactByName = new Map<
    string,
    CatalogRecordForFamily<"pattern">
  >();
  for (const pattern of input.registry.patterns) {
    const policyProfileId = addPolicy("pattern_usage", {
      when_to_use: pattern.when_to_use,
      when_not_to_use: pattern.when_not_to_use,
      semantics: pattern.semantics ?? null,
    });
    const fact: CatalogRecordForFamily<"pattern"> = {
      family: "pattern",
      id: pattern.id,
      name: pattern.name,
      aliases: uniqueStrings(pattern.aliases),
      summary: pattern.summary,
      detail_content_ref: content.add(
        "pattern_detail",
        {
          how_to_build: pattern.how_to_build,
          how_it_works: pattern.how_it_works,
          related_docs: pattern.related_docs,
          retrieval_signals: pattern.retrieval_signals ?? null,
        },
        "registry_projection",
      ),
      status: pattern.status,
      // Pattern category order is likewise primary then secondary.
      categories: uniqueOrderedStrings(pattern.category ?? []),
      policy_profile_ref: catalogRef("policy_profile", policyProfileId),
    };
    addRecord(fact);
    patternFactByName.set(pattern.name, fact);
  }
  const declaredCompositionConcepts = new Map<
    string,
    CatalogReferenceFor<"concept">
  >();
  for (const concept of [
    {
      id: "concept.composition.list",
      name: "List",
      concept_kind: "composition" as const,
      summary:
        "A source-declared list container concept; no canonical Salt component identity is asserted.",
    },
  ]) {
    addRecord({
      family: "concept",
      ...concept,
    });
    declaredCompositionConcepts.set(
      concept.name,
      catalogRef("concept", concept.id),
    );
  }

  for (const guide of input.registry.guides) {
    const guideEntities = uniqueOrderedStrings(
      guide.related_docs.related_components,
    );
    const guidePackages = uniqueOrderedStrings(guide.packages);
    const relatedPackages = uniqueOrderedStrings(
      guide.related_docs.related_packages,
    );
    if (
      guideEntities.length !== guide.related_docs.related_components.length ||
      guidePackages.length !== guide.packages.length ||
      relatedPackages.length !== guide.related_docs.related_packages.length ||
      canonicalJson(guidePackages) !== canonicalJson(relatedPackages)
    ) {
      throw new Error(
        `Guide '${guide.id}' package facts must uniquely and exactly match related package documents.`,
      );
    }
    const documentedEntityRefs = guideEntities.map((name) => {
      const component = componentFactByName.get(name);
      if (component) return catalogRef("component", component.id);
      const pattern = patternFactByName.get(name);
      if (pattern) return catalogRef("pattern", pattern.id);
      throw new Error(
        `Guide '${guide.id}' documents unknown component or pattern '${name}'.`,
      );
    });
    addRecord({
      family: "guide",
      id: guide.id,
      name: guide.name,
      aliases: uniqueStrings(guide.aliases),
      summary: guide.summary,
      detail_content_ref: content.add(
        "guide_detail",
        {
          steps: guide.steps.map((step) => ({
            title: step.title,
            statements: step.statements,
            snippets: step.snippets.map((snippet) => ({
              title: snippet.title,
              language: snippet.language,
              code_ref: content.add(
                "guide_snippet_code",
                snippet.code,
                "registry_projection",
              ),
            })),
          })),
          related_docs: {
            overview: guide.related_docs.overview,
          },
        },
        "registry_projection",
      ),
      kind: guide.kind,
      documented_entity_refs: documentedEntityRefs,
      package_refs: guidePackages.map(requirePackageRef),
    });
  }

  const pageFacts: CatalogRecordForFamily<"page">[] = [];
  for (const page of input.registry.pages) {
    if (!page.source_path) {
      throw new Error(`Page '${page.id}' is missing source_path.`);
    }
    const sourceRef = sources.fromRepoPath(page.source_path);
    const fact: CatalogRecordForFamily<"page"> = {
      family: "page",
      id: page.id,
      title: page.title,
      route: page.route,
      page_kind: page.page_kind,
      summary: page.summary,
      keywords: uniqueStrings(page.keywords),
      section_headings: page.section_headings,
      body_content_ref: content.add(
        "page_body",
        page.content,
        "source_extraction",
      ),
      detail_content_ref: content.add(
        "page_detail",
        {
          source_path: page.source_path,
        },
        "source_extraction",
      ),
      source_ref: sourceRef,
    };
    addRecord(fact);
    pageFacts.push(fact);
  }
  const pageFactByRoute = new Map(
    pageFacts.map((fact) => [fact.route, fact] as const),
  );
  const sourceForCatalogRoute = (
    route: string,
  ): CatalogReferenceFor<"source"> => {
    const page = pageFactByRoute.get(route);
    if (!page) {
      throw new Error(`Catalog route '${route}' has no source-backed page.`);
    }
    return page.source_ref;
  };
  const addStructuralRelationEvidence = (inputRelation: {
    relationKind: "composes" | "related_to" | "documents";
    source: CatalogReferenceFor<"component" | "pattern" | "guide">;
    target: CatalogReferenceFor<
      "component" | "pattern" | "concept" | "package"
    >;
    provenance: "declared" | "derived" | "curated";
    role: string | null;
    sourceOrdinal: number;
    sourceField: string;
    roleSourceField: string | null;
    sourceRef: CatalogReferenceFor<"source">;
  }): string => {
    const detail = parseCatalogContentPayload("structural_relation_assertion", {
      relation_kind: inputRelation.relationKind,
      source: inputRelation.source,
      target: inputRelation.target,
      provenance: inputRelation.provenance,
      role: inputRelation.role,
      source_ordinal: inputRelation.sourceOrdinal,
      source_field: inputRelation.sourceField,
      role_source_field: inputRelation.roleSourceField,
    });
    const id = stableShaId("structural-relation-assertion", {
      detail,
      source_ref: inputRelation.sourceRef,
    });
    return addEvidence({
      family: "evidence",
      id,
      evidence_kind: "source_assertion",
      assertion_kind: "structural_relation",
      owner: inputRelation.source,
      claim_kind: "structural_relation",
      source_refs: [inputRelation.sourceRef],
      detail_content_ref: content.add(
        "structural_relation_assertion",
        detail,
        "source_extraction",
      ),
      extraction_method: "source_extraction",
      validation: unvalidatedAssertion(),
    });
  };

  const tokenIdByName = new Map(
    input.registry.tokens.map((token) => [token.name, token.name]),
  );
  const tokenFactByName = new Map<string, CatalogRecordForFamily<"token">>();

  const addEvidenceRef = (
    _owner: CatalogReferenceFor<"token"> | null,
    ref: SaltTokenPolicyEvidenceRef,
  ): string => {
    const sourceRefs = sourcesForEvidenceRef(ref, sources, resolvePageRoute);
    if (
      ref.source.line_start != null &&
      ref.source.line_end != null &&
      ref.source.line_end < ref.source.line_start
    ) {
      throw new Error(
        `Canonical token evidence '${ref.id}' has a reversed source line range ${ref.source.line_start}-${ref.source.line_end}.`,
      );
    }
    // v1 evidence ids and registry snapshots are generated projections of the
    // owner occurrence. The canonical evidence identity is its source-backed
    // claim payload; owner-to-evidence assignment is carried by the shared
    // evidence profile on the token fact.
    const detail = {
      contract: ref.contract,
      source_kind: ref.source_kind,
      claim_kind: ref.claim_kind,
      source_metadata: {
        ...(ref.source.section === undefined
          ? {}
          : { section: ref.source.section }),
        ...(ref.source.line_start == null || ref.source.line_end == null
          ? {}
          : {
              line_range: [ref.source.line_start, ref.source.line_end] as [
                number,
                number,
              ],
            }),
      },
      ...(ref.note === undefined ? {} : { note: ref.note }),
    };
    return addEvidence({
      family: "evidence",
      id: shortStableId("evidence", {
        source_refs: sourceRefs,
        detail,
      }),
      evidence_kind: "source_assertion",
      assertion_kind: "token_policy",
      owner: null,
      claim_kind: ref.claim_kind,
      source_refs: sourceRefs,
      detail_content_ref: content.add(
        "token_policy_assertion",
        detail,
        "source_extraction",
      ),
      extraction_method: "source_extraction",
      validation: unvalidatedAssertion(),
    });
  };

  const addDocumentationEvidence = (
    owner: CatalogReference,
    label: string,
    href: string,
    pageRef: CatalogReferenceFor<"page"> | null = null,
    linkRole:
      | "example"
      | "resource"
      | "related_doc"
      | "deprecation_source"
      | "catalog_provenance" = "related_doc",
    ownerOrdinal: number | null = null,
    internal = false,
  ): string =>
    addEvidence({
      family: "evidence",
      id: stableShaId("documentation-link", {
        owner,
        label,
        href,
        page_ref: pageRef,
        link_role: linkRole,
        owner_ordinal: ownerOrdinal,
        internal,
      }),
      evidence_kind: "documentation_link",
      owner,
      owner_ordinal: ownerOrdinal,
      label,
      href,
      page_ref: pageRef,
      internal,
      link_role: linkRole,
      extraction_method: "link_extraction",
      validation: linkValidation(href, pageRef),
    });

  for (const token of input.registry.tokens) {
    const tokenId = tokenIdByName.get(token.name);
    if (!tokenId) throw new Error(`Missing token id for '${token.name}'.`);
    const owner = catalogRef("token", tokenId);
    const evidenceIds: string[] = [];
    const registryEvidenceRefs = [
      ...(token.policy?.evidence_refs ?? []),
      ...(token.policy_gap?.evidence_refs ?? []),
    ];
    const evidenceRefs =
      token.deprecated && token.policy
        ? registryEvidenceRefs.filter(
            (reference) =>
              reference.source_kind === "docs" &&
              reference.source?.url === "/salt/themes/design-tokens",
          )
        : registryEvidenceRefs;
    const policyDocs = (token.policy?.docs ?? []).filter(
      (locator) =>
        !token.deprecated || locator === "/salt/themes/design-tokens",
    );
    for (const evidenceRef of evidenceRefs) {
      evidenceIds.push(addEvidenceRef(owner, evidenceRef));
    }
    for (const href of policyDocs) {
      if (
        !evidenceRefs.some((evidenceRef) => evidenceRef.source?.url === href)
      ) {
        throw new Error(
          `Token '${token.name}' policy document '${href}' has no source-backed evidence reference.`,
        );
      }
    }
    const policyProfileId = token.policy
      ? addPolicy("token_usage", {
          policy: {
            usage_tier: token.policy.usage_tier,
            direct_component_use: token.policy.direct_component_use,
            preferred_for: token.deprecated ? [] : token.policy.preferred_for,
            avoid_for: token.deprecated
              ? ["Deprecated token; use replacement_token_refs for migration."]
              : token.policy.avoid_for,
            notes: token.deprecated
              ? [
                  `Deprecated ${token.policy.usage_tier} token; direct component use is forbidden.`,
                ]
              : token.policy.notes,
            docs_refs: policyDocs.map((locator) =>
              sources.fromPublicLocator(locator, {
                resolvePage: resolvePageRoute,
              }),
            ),
            ...(!token.deprecated && token.policy.structural_roles
              ? { structural_roles: token.policy.structural_roles }
              : {}),
            ...(!token.deprecated && token.policy.pairing !== undefined
              ? { pairing: token.policy.pairing }
              : {}),
          },
          guidance: token.guidance,
        })
      : token.policy_gap
        ? addPolicy("token_gap", {
            gap: {
              reason: token.policy_gap.reason,
              missing: token.policy_gap.missing,
            },
            guidance: token.guidance,
          })
        : token.guidance.length > 0
          ? addPolicy("token_usage", {
              policy: null,
              guidance: token.guidance,
            })
          : null;
    const evidenceProfileId =
      evidenceIds.length > 0
        ? addPolicy("token_evidence", {
            evidence_refs: uniqueStrings(evidenceIds).map((id) =>
              catalogRef("evidence", id),
            ),
          })
        : null;
    const fact: CatalogRecordForFamily<"token"> = {
      family: "token",
      id: tokenId,
      name: token.name,
      category: token.category,
      type: token.type,
      semantic_intent: token.semantic_intent,
      aliases: uniqueStrings(token.aliases),
      status: token.deprecated ? "deprecated" : "stable",
      replacement_token_refs: uniqueStrings(
        token.replacement_tokens ??
          (token.declarations ?? []).flatMap((declaration) =>
            declaration.replacement ? [declaration.replacement] : [],
          ),
      ).map((replacement) => {
        const replacementId = tokenIdByName.get(replacement);
        if (!replacementId) {
          throw new Error(
            `Token '${token.name}' references missing replacement '${replacement}'.`,
          );
        }
        if (replacementId === tokenId) {
          throw new Error(`Token '${token.name}' cannot replace itself.`);
        }
        return catalogRef("token", replacementId);
      }),
      policy_profile_ref: policyProfileId
        ? catalogRef("policy_profile", policyProfileId)
        : null,
      evidence_profile_ref: evidenceProfileId
        ? catalogRef("policy_profile", evidenceProfileId)
        : null,
      applies_to: [],
    };
    addRecord(fact);
    tokenFactByName.set(token.name, fact);
  }

  const declarationContextById = new Map<
    string,
    CatalogRecordForFamily<"declaration_context">
  >();
  for (const token of input.registry.tokens) {
    const tokenId = tokenIdByName.get(token.name);
    if (!tokenId) throw new Error(`Missing token id for '${token.name}'.`);
    for (const declaration of token.declarations ?? []) {
      const sourceRef = sources.fromRepoPath(
        declaration.source_path,
        declaration.deprecated ? "deprecated" : "current",
        declaration.source_contexts ?? [],
      );
      const replacementId = declaration.replacement
        ? tokenIdByName.get(declaration.replacement)
        : null;
      if (declaration.replacement && !replacementId) {
        throw new Error(
          `Token declaration '${declaration.id}' references missing replacement '${declaration.replacement}'.`,
        );
      }
      const selectorVariants = (declaration.selector_variants ?? []).map(
        (variant) => ({
          selector: variant.selector,
          dimensions: variant.dimensions.map((dimension) => ({
            name: dimension.name,
            value: dimension.value,
            established_by: dimension.established_by,
          })),
          constraints: variant.constraints,
        }),
      );
      const contextIdentity = {
        raw_selector: declaration.raw_selector,
        at_rules: declaration.at_rules ?? [],
        selector_variants: selectorVariants,
      };
      const contextId = shortStableId("declaration-context", contextIdentity);
      const contextRecord: CatalogRecordForFamily<"declaration_context"> = {
        family: "declaration_context",
        id: contextId,
        ...contextIdentity,
      };
      const existingContext = declarationContextById.get(contextId);
      if (
        existingContext &&
        canonicalJson(existingContext) !== canonicalJson(contextRecord)
      ) {
        throw new Error(`Declaration context id collision for '${contextId}'.`);
      }
      declarationContextById.set(contextId, contextRecord);
      const declarationRecord: CatalogRecordForFamily<"token_declaration"> = {
        family: "token_declaration",
        id: declaration.id,
        token_ref: catalogRef("token", tokenId),
        value: declaration.value,
        ...(declaration.raw_value != null
          ? { raw_value: declaration.raw_value }
          : {}),
        ...(declaration.important === true ? { important: true as const } : {}),
        context_ref: catalogRef("declaration_context", contextId),
        source_range: [
          declaration.source_range.start_offset,
          declaration.source_range.end_offset,
          declaration.source_range.start_line,
          declaration.source_range.start_column,
          declaration.source_range.end_line,
          declaration.source_range.end_column,
        ],
        source_ref: sourceRef,
        deprecated: declaration.deprecated,
        ...(replacementId
          ? {
              replacement_token_ref: catalogRef("token", replacementId),
            }
          : {}),
      };
      addRecord(declarationRecord);
      if (replacementId) {
        if (replacementId === tokenId) {
          throw new Error(
            `Token declaration '${declaration.id}' cannot replace its own token.`,
          );
        }
        const relationSource = catalogRef(
          "token_declaration",
          declarationRecord.id,
        );
        const relationTarget = catalogRef("token", replacementId);
        const replacementDetail = parseCatalogContentPayload(
          "token_replacement_assertion",
          {
            source: relationSource,
            target: relationTarget,
          },
        );
        const evidenceId = stableShaId("token-replacement-assertion", {
          detail: replacementDetail,
          source_ref: sourceRef,
        });
        addEvidence({
          family: "evidence",
          id: evidenceId,
          evidence_kind: "source_assertion",
          assertion_kind: "token_replacement",
          owner: relationSource,
          claim_kind: "token",
          source_refs: [sourceRef],
          detail_content_ref: content.add(
            "token_replacement_assertion",
            replacementDetail,
            "source_extraction",
          ),
          extraction_method: "source_extraction",
          validation: unvalidatedAssertion(),
        });
        addRelation("replaced_by", relationSource, relationTarget, {
          provenance: "declared",
          sourceEvidenceIds: [evidenceId],
        });
      }
    }
  }
  records.declaration_context.push(...declarationContextById.values());

  for (const token of input.registry.tokens) {
    const tokenId = tokenIdByName.get(token.name);
    if (!tokenId) throw new Error(`Missing token id for '${token.name}'.`);
    const relationSource = catalogRef("token", tokenId);
    const sourcesByReplacement = new Map<
      string,
      NonNullable<typeof token.replacement_sources>
    >();
    for (const source of token.replacement_sources ?? []) {
      const entries = sourcesByReplacement.get(source.replacement) ?? [];
      entries.push(source);
      sourcesByReplacement.set(source.replacement, entries);
    }
    for (const [replacement, replacementSources] of sourcesByReplacement) {
      const replacementId = tokenIdByName.get(replacement);
      if (!replacementId) {
        throw new Error(
          `Token '${token.name}' curated source references missing replacement '${replacement}'.`,
        );
      }
      if (replacementId === tokenId) {
        throw new Error(`Token '${token.name}' cannot replace itself.`);
      }
      const relationTarget = catalogRef("token", replacementId);
      const evidenceIds = replacementSources.map((replacementSource) => {
        const sourceRef = sources.fromRepoPath(
          replacementSource.source_path,
          "deprecated",
        );
        const replacementDetail = parseCatalogContentPayload(
          "token_replacement_assertion",
          {
            source: relationSource,
            target: relationTarget,
            source_kind: replacementSource.source_kind,
            source_path: replacementSource.source_path,
            source_text: replacementSource.source_text,
            line_start: replacementSource.line_start,
            line_end: replacementSource.line_end,
          },
        );
        const evidenceId = stableShaId("token-replacement-assertion", {
          detail: replacementDetail,
          source_ref: sourceRef,
        });
        addEvidence({
          family: "evidence",
          id: evidenceId,
          evidence_kind: "source_assertion",
          assertion_kind: "token_replacement",
          owner: relationSource,
          claim_kind: "token",
          source_refs: [sourceRef],
          detail_content_ref: content.add(
            "token_replacement_assertion",
            replacementDetail,
            "source_extraction",
          ),
          extraction_method: "source_extraction",
          validation: unvalidatedAssertion(),
        });
        return evidenceId;
      });
      addRelation("replaced_by", relationSource, relationTarget, {
        provenance: "curated",
        sourceEvidenceIds: evidenceIds,
      });
    }
  }

  const apiReplacementTargetsBySubject = new Map<string, Set<string>>();
  for (const deprecation of input.registry.deprecations) {
    const expectedDeprecationId = createDeprecationId(deprecation.subject);
    if (deprecation.id !== expectedDeprecationId) {
      throw new Error(
        `Deprecation '${deprecation.id}' does not match stable subject identity '${expectedDeprecationId}'.`,
      );
    }
    const subjectReference = ensureApiSymbol(deprecation.subject);
    const packageReference = requirePackageRef(deprecation.package);
    const subjectMember = deprecation.subject.member_path.at(-1);
    const expectedMemberKind =
      subjectMember === undefined
        ? null
        : subjectMember.kind === "prop"
          ? "prop"
          : "method";
    if (
      expectedMemberKind === null
        ? deprecation.kind === "prop" || deprecation.kind === "method"
        : deprecation.kind !== expectedMemberKind
    ) {
      throw new Error(
        `Deprecation '${deprecation.id}' kind does not match its public API subject.`,
      );
    }
    if (
      canonicalJson(packageReference) !==
      canonicalJson(requirePackageRef(deprecation.subject.package))
    ) {
      throw new Error(
        `Deprecation '${deprecation.id}' package does not match its API subject.`,
      );
    }
    const componentFact = deprecation.component
      ? (componentFactByName.get(deprecation.component) ?? null)
      : null;
    if (deprecation.component && !componentFact) {
      throw new Error(
        `Deprecation '${deprecation.id}' names an unresolved component association '${deprecation.component}'.`,
      );
    }
    if (
      componentFact &&
      canonicalJson(componentFact.package_ref) !==
        canonicalJson(packageReference)
    ) {
      throw new Error(
        `Deprecation '${deprecation.id}' component belongs to a different package.`,
      );
    }
    const componentReference = componentFact
      ? catalogRef("component", componentFact.id)
      : null;
    const sourceOccurrencesByKey = new Map(
      deprecation.source_occurrences.map((occurrence) => {
        const normalizedOccurrence = {
          source_ref: sources.fromRepoPath(occurrence.source_path),
          source_range: occurrence.source_range,
        };
        return [
          canonicalJson(normalizedOccurrence),
          normalizedOccurrence,
        ] as const;
      }),
    );
    const sourceOccurrences = [...sourceOccurrencesByKey.values()].sort(
      (left, right) =>
        compareOrdinalStrings(left.source_ref.id, right.source_ref.id) ||
        left.source_range.start_offset - right.source_range.start_offset ||
        left.source_range.end_offset - right.source_range.end_offset,
    );
    const deprecationSourceRefsById = new Map<
      string,
      CatalogReferenceFor<"source">
    >();
    for (const sourceRef of [
      ...sourceOccurrences.map((occurrence) => occurrence.source_ref),
      ...(deprecation.source_paths ?? []).map((sourcePath) =>
        sources.fromRepoPath(sourcePath),
      ),
      ...deprecation.source_urls.map((locator) =>
        sources.fromPublicLocator(locator, {
          resolvePage: resolvePageRoute,
        }),
      ),
    ]) {
      deprecationSourceRefsById.set(sourceRef.id, sourceRef);
    }
    const deprecationSourceRefs = [...deprecationSourceRefsById.values()].sort(
      (left, right) => compareOrdinalStrings(left.id, right.id),
    );
    for (const target of deprecation.replacement.targets) {
      if (
        !isApiSymbolSpaceReplacementCompatible(
          deprecation.subject.symbol_space,
          target.symbol_space,
        )
      ) {
        throw new Error(
          `Deprecation '${deprecation.id}' replacement target has an incompatible public type/value symbol space.`,
        );
      }
    }
    const replacementTargetRefs =
      deprecation.replacement.targets.map(ensureApiSymbol);
    const replacementTargetRef = deprecation.replacement.target
      ? ensureApiSymbol(deprecation.replacement.target)
      : null;
    if (deprecation.migration.value_map) {
      if (deprecation.subject.member_path.at(-1)?.kind !== "prop") {
        throw new Error(
          `Deprecation '${deprecation.id}' value map subject must be a public property.`,
        );
      }
      if (
        deprecation.replacement.targets.some(
          (target) => target.member_path.at(-1)?.kind !== "prop",
        )
      ) {
        throw new Error(
          `Deprecation '${deprecation.id}' value map targets must be public properties.`,
        );
      }
      if (
        deprecation.replacement.targets.some(
          (target) => !hasSameApiOwner(deprecation.subject, target),
        )
      ) {
        throw new Error(
          `Deprecation '${deprecation.id}' value map targets must belong to the deprecated property's public API owner.`,
        );
      }
    }
    const valueMap = deprecation.migration.value_map
      ? {
          fallback: deprecation.migration.value_map.fallback,
          cases: deprecation.migration.value_map.cases.map((entry) => ({
            from: entry.from,
            set: entry.set.map((assignment) => {
              if (assignment.target.member_path.at(-1)?.kind !== "prop") {
                throw new Error(
                  `Deprecation '${deprecation.id}' value map assignments must target public properties.`,
                );
              }
              if (!hasSameApiOwner(deprecation.subject, assignment.target)) {
                throw new Error(
                  `Deprecation '${deprecation.id}' value map assignments must belong to the deprecated property's public API owner.`,
                );
              }
              return {
                target_ref: ensureApiSymbol(assignment.target),
                value: assignment.value,
              };
            }),
          })),
        }
      : null;
    const detail = parseCatalogContentPayload("deprecation_detail", {
      replacement: {
        mode: deprecation.replacement.mode,
        target_ref: replacementTargetRef,
        target_refs: replacementTargetRefs,
        notes: deprecation.replacement.notes,
      },
      migration: {
        strategy: deprecation.migration.strategy,
        value_map: valueMap,
      },
      ...(deprecation.inference ? { inference: deprecation.inference } : {}),
    });
    const deprecationReference = catalogRef("deprecation", deprecation.id);
    addRecord({
      family: "deprecation",
      id: deprecation.id,
      subject_ref: subjectReference,
      package_ref: packageReference,
      component_ref: componentReference,
      kind: deprecation.kind,
      name: deprecation.name,
      deprecated_in: deprecation.deprecated_in,
      removed_in: deprecation.removed_in,
      source_refs: deprecationSourceRefs,
      source_occurrences: sourceOccurrences,
      detail_content_ref: content.add(
        "deprecation_detail",
        detail,
        "registry_projection",
      ),
    });
    for (const replacementTarget of replacementTargetRefs) {
      if (
        canonicalJson(subjectReference) === canonicalJson(replacementTarget)
      ) {
        throw new Error(
          `Deprecation '${deprecation.id}' cannot replace its own API subject.`,
        );
      }
      const targets =
        apiReplacementTargetsBySubject.get(subjectReference.id) ??
        new Set<string>();
      targets.add(replacementTarget.id);
      apiReplacementTargetsBySubject.set(subjectReference.id, targets);
    }
    if (deprecation.replacement.mode === "single" && replacementTargetRef) {
      const assertionDetail = parseCatalogContentPayload(
        "api_replacement_assertion",
        {
          deprecation_ref: deprecationReference,
          source: subjectReference,
          target: replacementTargetRef,
          source_occurrences: sourceOccurrences,
        },
      );
      const evidenceId = stableShaId("api-replacement-assertion", {
        detail: assertionDetail,
      });
      addEvidence({
        family: "evidence",
        id: evidenceId,
        evidence_kind: "source_assertion",
        assertion_kind: "api_replacement",
        owner: deprecationReference,
        claim_kind: "deprecation",
        source_refs: [
          ...new Map(
            sourceOccurrences.map((occurrence) => [
              occurrence.source_ref.id,
              occurrence.source_ref,
            ]),
          ).values(),
        ],
        detail_content_ref: content.add(
          "api_replacement_assertion",
          assertionDetail,
          "source_extraction",
        ),
        extraction_method: "source_extraction",
        validation: unvalidatedAssertion(),
      });
      addRelation("replaced_by", subjectReference, replacementTargetRef, {
        provenance: "declared",
        sourceEvidenceIds: [evidenceId],
      });
    }
  }
  const apiReplacementVisitState = new Map<string, "visiting" | "visited">();
  const visitApiReplacement = (symbolId: string): void => {
    const state = apiReplacementVisitState.get(symbolId);
    if (state === "visiting") {
      throw new Error(
        `API replacement graph contains a cycle through api_symbol:${symbolId}.`,
      );
    }
    if (state === "visited") return;
    apiReplacementVisitState.set(symbolId, "visiting");
    for (const targetId of apiReplacementTargetsBySubject.get(symbolId) ?? []) {
      visitApiReplacement(targetId);
    }
    apiReplacementVisitState.set(symbolId, "visited");
  };
  for (const symbolId of apiReplacementTargetsBySubject.keys()) {
    visitApiReplacement(symbolId);
  }

  const resolveComponent = buildNameResolver(
    "component",
    input.registry.components,
  );
  const resolvePattern = buildNameResolver("pattern", input.registry.patterns);
  const resolvePage = buildNameResolver(
    "page",
    pageFacts.map((page) => ({
      id: page.id,
      title: page.title,
      route: page.route,
      aliases: [],
    })),
  );

  const resolveExampleOwner = (example: ExampleRecord): CatalogReference => {
    switch (example.target_type) {
      case "component":
        return resolveComponent(example.target_name);
      case "pattern":
        return resolvePattern(example.target_name);
      case "foundation":
        return inferPageKindOwner(example, resolvePage);
    }
  };
  const resolveComponentOrPattern = (
    value: string,
  ): CatalogReferenceFor<"component" | "pattern" | "concept"> => {
    if (componentFactByName.has(value)) return resolveComponent(value);
    if (patternFactByName.has(value)) return resolvePattern(value);
    let componentMatch: CatalogReferenceFor<"component"> | null = null;
    let patternMatch: CatalogReferenceFor<"pattern"> | null = null;
    try {
      componentMatch = resolveComponent(value);
    } catch {
      componentMatch = null;
    }
    try {
      patternMatch = resolvePattern(value);
    } catch {
      patternMatch = null;
    }
    if (componentMatch && patternMatch) {
      throw new Error(
        `Ambiguous surface reference '${value}' resolves to both a component and a pattern.`,
      );
    }
    if (componentMatch) return componentMatch;
    if (patternMatch) return patternMatch;
    const conceptMatch = declaredCompositionConcepts.get(value);
    if (conceptMatch) return conceptMatch;
    throw new Error(`Unresolved component or pattern reference '${value}'.`);
  };

  const exampleOwnerLocalIds = new Set<string>();
  const exampleEvidenceIdByOwnerLocalKey = new Map<string, string>();
  const ownerOrdinalByOwnerLocalKey = new Map<string, number>();
  const nestedExampleByOwnerLocalKey = new Map<string, ExampleRecord>();
  const nextOwnerOrdinalByOwner = new Map<string, number>();
  const registerOwnerExampleOrder = (
    owner: CatalogReference,
    examples: readonly ExampleRecord[],
  ): void => {
    const ownerKey = `${owner.family}\0${owner.id}`;
    examples.forEach((example, ownerOrdinal) => {
      const declaredOwner = resolveExampleOwner(example);
      if (
        declaredOwner.family !== owner.family ||
        declaredOwner.id !== owner.id
      ) {
        throw new Error(
          `Nested example '${example.id}' declares ${declaredOwner.family}:${declaredOwner.id} but is nested under ${owner.family}:${owner.id}.`,
        );
      }
      const ownerLocalKey = `${ownerKey}\0${example.id}`;
      if (ownerOrdinalByOwnerLocalKey.has(ownerLocalKey)) {
        throw new Error(
          `Duplicate example local id '${example.id}' within ${owner.family}:${owner.id}.`,
        );
      }
      ownerOrdinalByOwnerLocalKey.set(ownerLocalKey, ownerOrdinal);
      nestedExampleByOwnerLocalKey.set(ownerLocalKey, example);
    });
    nextOwnerOrdinalByOwner.set(ownerKey, examples.length);
  };
  for (const component of input.registry.components) {
    registerOwnerExampleOrder(
      resolveComponent(component.name),
      component.examples,
    );
  }
  for (const pattern of input.registry.patterns) {
    registerOwnerExampleOrder(resolvePattern(pattern.name), pattern.examples);
  }

  const seenNestedOwnerLocalKeys = new Set<string>();
  for (const [registryOrdinal, example] of input.registry.examples.entries()) {
    const owner = resolveExampleOwner(example);
    const ownerKey = `${owner.family}\0${owner.id}`;
    const ownerLocalKey = `${ownerKey}\0${example.id}`;
    if (exampleOwnerLocalIds.has(ownerLocalKey)) {
      throw new Error(
        `Duplicate example local id '${example.id}' within ${owner.family}:${owner.id}.`,
      );
    }
    exampleOwnerLocalIds.add(ownerLocalKey);
    let ownerOrdinal = ownerOrdinalByOwnerLocalKey.get(ownerLocalKey);
    if (ownerOrdinal === undefined) {
      if (owner.family === "component" || owner.family === "pattern") {
        throw new Error(
          `Global example '${example.id}' for ${owner.family}:${owner.id} is missing from its nested owner examples.`,
        );
      }
      ownerOrdinal = nextOwnerOrdinalByOwner.get(ownerKey) ?? 0;
      ownerOrdinalByOwnerLocalKey.set(ownerLocalKey, ownerOrdinal);
      nextOwnerOrdinalByOwner.set(ownerKey, ownerOrdinal + 1);
    } else {
      const nestedExample = nestedExampleByOwnerLocalKey.get(ownerLocalKey);
      if (
        nestedExample &&
        canonicalJson(nestedExample) !== canonicalJson(example)
      ) {
        throw new Error(
          `Global example '${example.id}' differs from the record nested under ${owner.family}:${owner.id}.`,
        );
      }
      seenNestedOwnerLocalKeys.add(ownerLocalKey);
    }

    if (/\/\/\s*Linked resource:/iu.test(example.code)) {
      throw new Error(
        `Linked resource '${example.id}' must be modeled as link evidence, not executable example code.`,
      );
    }

    if ((example.source_url === null) === (example.source_path === null)) {
      throw new Error(
        `Executable example '${example.id}' for ${owner.family}:${owner.id} must have exactly one URL or repository source.`,
      );
    }
    const sourceRef =
      example.source_path !== null
        ? sources.fromRepoPath(example.source_path)
        : sources.fromPublicLocator(example.source_url as string, {
            resolvePage: resolvePageRoute,
          });
    const packageReference = example.package
      ? requirePackageRef(example.package)
      : null;
    const evidenceId = addEvidence({
      family: "evidence",
      id: `example:${owner.family}:${owner.id}:${example.id}`,
      evidence_kind: "executable_example",
      local_id: example.id,
      owner,
      owner_ordinal: ownerOrdinal,
      registry_ordinal: registryOrdinal,
      title: example.title,
      description: example.description,
      intent: uniqueStrings(example.intent),
      complexity: example.complexity,
      code_content_ref: content.add(
        "executable_example_code",
        example.code,
        "source_extraction",
      ),
      source_ref: sourceRef,
      package_ref: packageReference,
      extraction_method: "source_extraction",
      validation: unvalidatedAssertion(),
    });
    exampleEvidenceIdByOwnerLocalKey.set(ownerLocalKey, evidenceId);
    addRelation(
      "observed_in_example",
      owner,
      catalogRef("evidence", evidenceId),
      {
        provenance: "observation",
        sourceEvidenceIds: [evidenceId],
      },
    );
  }
  const missingGlobalExamples = [...ownerOrdinalByOwnerLocalKey.keys()]
    .filter(
      (ownerLocalKey) =>
        (ownerLocalKey.startsWith("component\0") ||
          ownerLocalKey.startsWith("pattern\0")) &&
        !seenNestedOwnerLocalKeys.has(ownerLocalKey),
    )
    .sort(compareStrings);
  if (missingGlobalExamples.length > 0) {
    throw new Error(
      `Nested owner examples are missing from the global registry: ${missingGlobalExamples.join(", ")}.`,
    );
  }

  for (const component of input.registry.components) {
    const owner = resolveComponent(component.name);
    for (const observedExport of component.canonical_example_exports ?? []) {
      if (!observedExport.export_repo_path) {
        throw new Error(
          `Observed export '${observedExport.export_name}' on '${component.name}' has no compiler-resolved source origin.`,
        );
      }
      const evidenceId = exampleEvidenceIdByOwnerLocalKey.get(
        `${owner.family}\0${owner.id}\0${observedExport.example_id}`,
      );
      if (!evidenceId) {
        throw new Error(
          `Observed export '${observedExport.export_name}' on '${component.name}' references missing example '${observedExport.example_id}'.`,
        );
      }
      addRelation(
        "export_observed_in_example",
        owner,
        sources.fromRepoPath(observedExport.export_repo_path),
        {
          provenance: "observation",
          role: `export:${observedExport.export_name}`,
          sourceEvidenceIds: [evidenceId],
        },
      );
    }
  }

  const addLink = (
    owner: CatalogReference,
    label: string,
    href: string,
    linkRole: "resource" | "related_doc" | "deprecation_source" = "related_doc",
    ownerOrdinal: number | null = null,
    internal = false,
  ): string => {
    if (!href.startsWith("/") && !isSafeAbsoluteHttpsUrl(href)) {
      throw new Error(
        `Repository path '${href}' must be modeled as source evidence, not link evidence.`,
      );
    }
    const kind = classifyLink(label, href);
    if (kind === "external_demo") {
      if (!isSafeAbsoluteHttpsUrl(href)) {
        throw new Error(`External demo link is not HTTPS: ${href}`);
      }
      return addEvidence({
        family: "evidence",
        id: stableShaId("external-demo", {
          owner,
          label,
          href,
          owner_ordinal: ownerOrdinal,
          internal,
        }),
        evidence_kind: "external_demo",
        owner,
        owner_ordinal: ownerOrdinal,
        label,
        href,
        internal,
        link_role: linkRole,
        extraction_method: "link_extraction",
        validation: linkValidation(href, null),
      });
    }
    if (kind === "design_reference") {
      if (!isSafeAbsoluteHttpsUrl(href)) {
        throw new Error(`Design reference link is not HTTPS: ${href}`);
      }
      return addEvidence({
        family: "evidence",
        id: stableShaId("design-reference", {
          owner,
          label,
          href,
          owner_ordinal: ownerOrdinal,
          internal,
        }),
        evidence_kind: "design_reference",
        owner,
        owner_ordinal: ownerOrdinal,
        label,
        href,
        internal,
        link_role: linkRole,
        extraction_method: "link_extraction",
        validation: linkValidation(href, null),
      });
    }
    let pageRef: CatalogReferenceFor<"page"> | null = null;
    if (href.startsWith("/")) {
      const route = canonicalSiteRouteCodec.parse(href);
      pageRef = resolvePageRoute(route);
    }
    return addDocumentationEvidence(
      owner,
      label,
      href,
      pageRef,
      linkRole,
      ownerOrdinal,
      internal,
    );
  };

  const componentByName = new Map(
    input.registry.components.map((component) => [component.name, component]),
  );
  for (const component of input.registry.components) {
    const owner = resolveComponent(component.name);
    const links = Object.entries(component.related_docs).filter(
      (entry): entry is [string, string] => Boolean(entry[1]),
    );
    for (const [label, href] of links) {
      addLink(owner, label, href);
    }
    const overview = component.related_docs.overview;
    if (component.patterns.length > 0 && !overview) {
      throw new Error(
        `Component '${component.name}' has declared pattern relations without a source-backed overview.`,
      );
    }
    for (const [sourceOrdinal, patternName] of component.patterns.entries()) {
      if (!overview) {
        throw new Error(
          `Component '${component.name}' relation ${sourceOrdinal} has no source-backed overview.`,
        );
      }
      const target = resolvePattern(patternName);
      const evidenceId = addStructuralRelationEvidence({
        relationKind: "related_to",
        source: owner,
        target,
        provenance: "declared",
        role: null,
        sourceOrdinal,
        sourceField: "component.patterns",
        roleSourceField: null,
        sourceRef: sourceForCatalogRoute(overview),
      });
      addRelation("related_to", owner, target, {
        provenance: "declared",
        sourceOrdinal,
        sourceEvidenceIds: [evidenceId],
      });
    }
  }

  for (const pattern of input.registry.patterns) {
    const owner = resolvePattern(pattern.name);
    for (const [ownerOrdinal, resource] of pattern.resources.entries()) {
      addLink(
        owner,
        resource.label,
        resource.href,
        "resource",
        ownerOrdinal,
        resource.internal,
      );
    }
    const overview = pattern.related_docs.overview;
    if (overview) addLink(owner, "overview", overview);
    if (
      (pattern.composed_of.length > 0 || pattern.related_patterns.length > 0) &&
      !overview
    ) {
      throw new Error(
        `Pattern '${pattern.name}' has declared relations without a source-backed overview.`,
      );
    }
    for (const [sourceOrdinal, composition] of pattern.composed_of.entries()) {
      if (!overview) {
        throw new Error(
          `Pattern '${pattern.name}' composition ${sourceOrdinal} has no source-backed overview.`,
        );
      }
      const target = resolveComponentOrPattern(composition.component);
      const evidenceId = addStructuralRelationEvidence({
        relationKind: "composes",
        source: owner,
        target,
        provenance: "declared",
        role: composition.role,
        sourceOrdinal,
        sourceField: "data.components",
        roleSourceField:
          composition.role === null
            ? null
            : `mcp.catalogEditorialOverrides.componentRoles[${JSON.stringify(composition.component)}]`,
        sourceRef: sourceForCatalogRoute(overview),
      });
      addRelation("composes", owner, target, {
        provenance: "declared",
        role: composition.role,
        sourceOrdinal,
        sourceEvidenceIds: [evidenceId],
      });
    }
    for (const [
      sourceOrdinal,
      relatedPattern,
    ] of pattern.related_patterns.entries()) {
      if (!overview) {
        throw new Error(
          `Pattern '${pattern.name}' related-pattern ${sourceOrdinal} has no source-backed overview.`,
        );
      }
      const target = resolvePattern(relatedPattern);
      const evidenceId = addStructuralRelationEvidence({
        relationKind: "related_to",
        source: owner,
        target,
        provenance: "declared",
        role: null,
        sourceOrdinal,
        sourceField: "pattern.related_patterns",
        roleSourceField: null,
        sourceRef: sourceForCatalogRoute(overview),
      });
      addRelation("related_to", owner, target, {
        provenance: "declared",
        sourceOrdinal,
        sourceEvidenceIds: [evidenceId],
      });
    }
  }

  for (const icon of input.registry.icons) {
    const owner = catalogRef("icon", icon.id);
    for (const [label, href] of Object.entries(icon.related_docs)) {
      if (href) addLink(owner, label, href);
    }
  }

  for (const symbol of input.registry.country_symbols) {
    const owner = catalogRef("country_symbol", symbol.id);
    for (const [label, href] of Object.entries(symbol.related_docs)) {
      if (href) addLink(owner, label, href);
    }
  }

  for (const guide of input.registry.guides) {
    const owner = catalogRef("guide", guide.id);
    const overview = guide.related_docs.overview;
    if (overview) addLink(owner, "overview", overview);
    const documentTargetCount =
      guide.related_docs.related_components.length +
      guide.related_docs.related_packages.length;
    if (documentTargetCount > 0 && !overview) {
      throw new Error(
        `Guide '${guide.id}' has derived relations without a source-backed overview.`,
      );
    }
    for (const [
      sourceOrdinal,
      componentName,
    ] of guide.related_docs.related_components.entries()) {
      if (!overview) {
        throw new Error(
          `Guide '${guide.id}' component relation ${sourceOrdinal} has no source-backed overview.`,
        );
      }
      const target = resolveComponentOrPattern(componentName);
      if (target.family === "concept") {
        throw new Error(
          `Guide '${guide.id}' cannot document composition concept '${componentName}'.`,
        );
      }
      const evidenceId = addStructuralRelationEvidence({
        relationKind: "documents",
        source: owner,
        target,
        provenance: "derived",
        role: null,
        sourceOrdinal,
        sourceField: "guide.related_docs.related_components",
        roleSourceField: null,
        sourceRef: sourceForCatalogRoute(overview),
      });
      addRelation("documents", owner, target, {
        provenance: "derived",
        sourceOrdinal,
        sourceEvidenceIds: [evidenceId],
      });
    }
    for (const [
      packageOrdinal,
      packageName,
    ] of guide.related_docs.related_packages.entries()) {
      if (!overview) {
        throw new Error(
          `Guide '${guide.id}' package relation ${packageOrdinal} has no source-backed overview.`,
        );
      }
      const sourceOrdinal = packageOrdinal;
      const target = requirePackageRef(packageName);
      const evidenceId = addStructuralRelationEvidence({
        relationKind: "documents",
        source: owner,
        target,
        provenance: "derived",
        role: null,
        sourceOrdinal,
        sourceField: "guide.related_docs.related_packages",
        roleSourceField: null,
        sourceRef: sourceForCatalogRoute(overview),
      });
      addRelation("documents", owner, target, {
        provenance: "derived",
        sourceOrdinal,
        sourceEvidenceIds: [evidenceId],
      });
    }
  }

  const resolveTokenTarget = (
    target: string,
  ): CatalogReferenceFor<"component"> => {
    if (!componentByName.has(target)) {
      throw new Error(
        `Token applicability target '${target}' is not a component.`,
      );
    }
    const reference = resolveComponent(target);
    if (reference.family !== "component") {
      throw new Error(
        `Token applicability target '${target}' resolved to '${reference.family}'.`,
      );
    }
    return catalogRef("component", reference.id);
  };
  for (const token of input.registry.tokens) {
    const fact = tokenFactByName.get(token.name);
    if (!fact) {
      throw new Error(`Missing token fact '${token.name}'.`);
    }
    const targets = new Map(
      token.applies_to.map((target) => {
        const reference = resolveTokenTarget(target);
        return [canonicalJson(reference), reference] as const;
      }),
    );
    fact.applies_to = [...targets.values()].sort((left, right) =>
      compareOrdinalStrings(canonicalJson(left), canonicalJson(right)),
    );
  }

  const accessibilityClaims: CatalogRecordForFamily<"accessibility_claim">[] =
    [];
  const addAccessibilitySignalEvidence = (
    owner: CatalogReference,
    signal: AccessibilityImplementationSignal,
  ): string => {
    if ((signal.source_url === null) === (signal.source_path === null)) {
      throw new Error(
        `Accessibility signal for ${owner.family}:${owner.id} must have exactly one URL or repository source.`,
      );
    }
    const sourceRef =
      signal.source_path !== null
        ? sources.fromRepoPath(signal.source_path)
        : sources.fromPublicLocator(signal.source_url as string, {
            resolvePage: resolvePageRoute,
          });
    return addEvidence({
      family: "evidence",
      id: stableShaId("accessibility-signal", {
        owner,
        signal,
      }),
      evidence_kind: "source_assertion",
      assertion_kind: "accessibility_implementation_signal",
      owner,
      claim_kind: "accessibility",
      source_refs: [sourceRef],
      detail_content_ref: content.add(
        "accessibility_implementation_signal",
        {
          kind: signal.kind,
          values: signal.values,
          source_kind: signal.source_kind,
        },
        "source_extraction",
      ),
      extraction_method: "source_extraction",
      validation: unvalidatedAssertion(),
    });
  };
  const addAccessibilityClaim = (inputClaim: {
    owner: CatalogReference;
    classification: "fact" | "guidance";
    sourceField: string;
    ordinal: number;
    statement: string;
    provenanceReferences: Array<
      CatalogReferenceFor<"source"> | CatalogReferenceFor<"evidence">
    >;
  }): void => {
    const statementContentRef = content.add(
      "accessibility_statement",
      inputClaim.statement,
      "registry_projection",
    );
    const provenanceReferences = [
      ...new Map(
        inputClaim.provenanceReferences.map((reference) => [
          canonicalJson(reference),
          reference,
        ]),
      ).values(),
    ];
    if (provenanceReferences.length === 0) {
      throw new Error(
        `Accessibility claim for ${inputClaim.owner.family}:${inputClaim.owner.id} has no provenance.`,
      );
    }
    const common = {
      family: "accessibility_claim" as const,
      id: stableShaId("accessibility-claim", {
        owner: inputClaim.owner,
        classification: inputClaim.classification,
        source_field: inputClaim.sourceField,
        ordinal: inputClaim.ordinal,
        statement_content_ref: statementContentRef,
        normativity: "descriptive",
        provenance_references: provenanceReferences,
      }),
      owner: inputClaim.owner as {
        family: "component" | "pattern" | "guide" | "page";
        id: string;
      },
      source_field: inputClaim.sourceField,
      ordinal: inputClaim.ordinal,
      statement_content_ref: statementContentRef,
      provenance: provenanceReferences.map((reference) => ({
        reference,
        supports: ["statement" as const, "classification" as const],
        source_range: null,
        // Repository documentation is page-level provenance unless an exact
        // source span is available. Do not misrepresent the statement digest
        // as a digest of source bytes.
        content_digest:
          reference.family === "evidence" ? statementContentRef.id : null,
      })),
      severity: null,
      rule_kind: null,
    };
    const claimRecord: CatalogRecordForFamily<"accessibility_claim"> =
      inputClaim.classification === "fact"
        ? {
            ...common,
            classification: "fact",
            normativity: "descriptive",
          }
        : {
            ...common,
            classification: "guidance",
            normativity: "descriptive",
          };
    const existing = accessibilityClaims.find(
      (claim) => claim.id === claimRecord.id,
    );
    if (existing) {
      if (canonicalJson(existing) !== canonicalJson(claimRecord)) {
        throw new Error(
          `Accessibility claim id collision for '${claimRecord.id}'.`,
        );
      }
      return;
    }
    accessibilityClaims.push(claimRecord);
  };

  for (const component of input.registry.components) {
    const owner = resolveComponent(component.name);
    const documentationSource = component.related_docs.accessibility
      ? sourceForCatalogRoute(component.related_docs.accessibility)
      : null;
    if (
      (component.accessibility.summary.length > 0 ||
        component.accessibility.rules.length > 0) &&
      documentationSource === null
    ) {
      throw new Error(
        `Component '${component.name}' has accessibility prose without an accessibility documentation source.`,
      );
    }
    for (const [
      ordinal,
      statement,
    ] of component.accessibility.summary.entries()) {
      addAccessibilityClaim({
        owner,
        classification: "guidance",
        sourceField: "accessibility.summary",
        ordinal,
        statement,
        provenanceReferences: [
          documentationSource as CatalogReferenceFor<"source">,
        ],
      });
    }
    // Legacy extraction labeled prose as warning rules without a curated
    // severity source. Preserve the statement, but deliberately downgrade it
    // to non-enforceable guidance in the canonical v2 model.
    for (const [
      ordinal,
      legacyRule,
    ] of component.accessibility.rules.entries()) {
      addAccessibilityClaim({
        owner,
        classification: "guidance",
        sourceField: "accessibility.rules",
        ordinal,
        statement: legacyRule.rule,
        provenanceReferences: [
          documentationSource as CatalogReferenceFor<"source">,
        ],
      });
    }
    for (const [ordinal, signal] of (
      component.accessibility.implementation_signals ?? []
    ).entries()) {
      const signalEvidenceId = addAccessibilitySignalEvidence(owner, signal);
      addAccessibilityClaim({
        owner,
        classification: "fact",
        sourceField: "accessibility.implementation_signals",
        ordinal,
        statement: formatAccessibilityImplementationSignalStatement(signal),
        provenanceReferences: [catalogRef("evidence", signalEvidenceId)],
      });
    }
  }

  for (const pattern of input.registry.patterns) {
    const owner = resolvePattern(pattern.name);
    const documentationSource = pattern.related_docs.overview
      ? sourceForCatalogRoute(pattern.related_docs.overview)
      : null;
    if (
      pattern.accessibility.summary.length > 0 &&
      documentationSource === null
    ) {
      throw new Error(
        `Pattern '${pattern.name}' has accessibility prose without an overview documentation source.`,
      );
    }
    for (const [
      ordinal,
      statement,
    ] of pattern.accessibility.summary.entries()) {
      addAccessibilityClaim({
        owner,
        classification: "guidance",
        sourceField: "accessibility.summary",
        ordinal,
        statement,
        provenanceReferences: [
          documentationSource as CatalogReferenceFor<"source">,
        ],
      });
    }
    for (const [ordinal, signal] of (
      pattern.accessibility.implementation_signals ?? []
    ).entries()) {
      const signalEvidenceId = addAccessibilitySignalEvidence(owner, signal);
      addAccessibilityClaim({
        owner,
        classification: "fact",
        sourceField: "accessibility.implementation_signals",
        ordinal,
        statement: formatAccessibilityImplementationSignalStatement(signal),
        provenanceReferences: [catalogRef("evidence", signalEvidenceId)],
      });
    }
  }

  const structuralRoleRulePackBody =
    input.tokenPolicyStructuralRoleRulePackBody ??
    input.registry.token_policy_structural_role_rule_pack ??
    null;
  if (structuralRoleRulePackBody) {
    const pack = structuralRoleRulePackBody;
    addPolicy("structural_role_rules", {
      contract: pack.contract,
      id: pack.id,
      generator: pack.generator,
      rules: pack.rules.map((rule) => {
        const evidenceRefs = rule.evidence_refs.map((reference) =>
          catalogRef("evidence", addEvidenceRef(null, reference)),
        );
        const sourceRefs = new Map<string, CatalogReferenceFor<"source">>();
        for (const reference of evidenceRefs) {
          const evidence = evidenceById.get(reference.id);
          if (
            evidence?.evidence_kind === "source_assertion" &&
            evidence.assertion_kind === "token_policy"
          ) {
            for (const sourceRef of evidence.source_refs) {
              sourceRefs.set(sourceRef.id, sourceRef);
            }
          }
        }
        return {
          id: rule.id,
          category: rule.category,
          kind: rule.kind,
          match: rule.match,
          emits: rule.emits,
          evidence_text: rule.evidence_text,
          evidence_terms: rule.evidence_terms,
          evidence_refs: evidenceRefs,
          source_refs: [...sourceRefs.values()].sort((left, right) =>
            compareOrdinalStrings(left.id, right.id),
          ),
        };
      }),
    });
  }

  records.source.push(...sources.records.values());
  records.evidence.push(...evidenceById.values());
  records.policy_profile.push(...policyById.values());
  records.relation.push(...relationById.values());
  records.accessibility_claim.push(...accessibilityClaims);

  for (const family of CATALOG_SEARCH_TARGET_FAMILY_NAMES) {
    for (const record of records[family]) {
      const searchDocument = createCatalogSearchDocument(record);
      if (!searchDocument) {
        throw new Error(
          `Searchable catalog family '${family}' did not produce a search document for '${record.id}'.`,
        );
      }
      addRecord(searchDocument);
    }
  }

  for (const family of CATALOG_FAMILY_NAMES) {
    records[family].sort(compareCatalogIds);
    const seen = new Set<string>();
    for (const record of records[family]) {
      if (seen.has(record.id)) {
        throw new Error(
          `Duplicate primary key '${record.id}' in family '${family}'.`,
        );
      }
      seen.add(record.id);
    }
  }

  return {
    records,
    contentBlobs: content.blobs,
  };
}

export function rehydrateTokenDeclaration(
  declaration: CatalogRecordForFamily<"token_declaration">,
  context: CatalogRecordForFamily<"declaration_context">,
  source: SourceRecord,
  replacementName: string | null,
): TokenDeclarationProjection {
  if (
    source.source_kind !== "repository_file" &&
    source.source_kind !== "repository_directory"
  ) {
    throw new Error(
      `Token declaration '${declaration.id}' requires a repository source.`,
    );
  }
  const selectorVariants = context.selector_variants.map((variant) => ({
    ...variant,
    dimensions: variant.dimensions.map((dimension) => ({
      ...dimension,
      selector: variant.selector,
    })),
  }));
  return {
    id: declaration.id,
    value: declaration.value,
    raw_value: declaration.raw_value ?? null,
    ...(declaration.important === true ? { important: true as const } : {}),
    raw_selector: context.raw_selector,
    source_context: [
      ...context.at_rules.map((atRule) =>
        `@${atRule.name} ${atRule.params}`.trim(),
      ),
      ...(context.raw_selector ? [context.raw_selector] : []),
    ],
    at_rules: context.at_rules,
    selector_variants: selectorVariants,
    source_contexts: source.entrypoint_contexts,
    source_range: {
      start_offset: declaration.source_range[0],
      end_offset: declaration.source_range[1],
      start_line: declaration.source_range[2],
      start_column: declaration.source_range[3],
      end_line: declaration.source_range[4],
      end_column: declaration.source_range[5],
    },
    source_path: source.locator,
    dimensions: selectorVariants.flatMap((variant) => variant.dimensions),
    deprecated: declaration.deprecated,
    replacement: replacementName,
  };
}

export type LegacyCatalogRecord =
  | PackageRecord
  | ComponentRecord
  | IconRecord
  | CountrySymbolRecord
  | PatternRecord
  | GuideRecord
  | PageRecord
  | TokenRecord
  | DeprecationRecord;
