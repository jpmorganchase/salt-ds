import type {
  SaltTokenPolicyEvidenceRef,
  SaltTokenPolicyEvidenceSource,
} from "../evidence.js";
import type { SaltTokenPolicyStructuralRoleRulePack } from "../tokenPolicyStructuralRoleRules.js";
import type {
  AccessibilityImplementationSignal,
  AccessibilityRule,
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
  RegistrySourceLocator,
  SaltRegistry,
  TokenDeclarationProjection,
  TokenRecord,
} from "../types.js";
import { formatAccessibilityImplementationSignalStatement } from "./accessibilityImplementationSignal.js";
import { deepFreezeCatalogValue } from "./catalogImmutability.js";
import type {
  CatalogContentCodecName,
  CatalogContentReference,
  CatalogPayloadForCodec,
} from "./catalogPayloadSchemaV2.js";
import type {
  CatalogManifest,
  CatalogRecordForFamily,
  CatalogReference,
  CatalogReferenceFor,
  CatalogRuntimeFamilyName,
} from "./catalogSchemaV2.js";
import {
  canonicalJson,
  compareOrdinalStrings,
} from "./catalogSerialization.js";

export interface CatalogProjectionStore {
  readonly manifest: Pick<
    CatalogManifest,
    "catalog_version" | "semantic_digest"
  >;
  getFamily<Family extends CatalogRuntimeFamilyName>(
    family: Family,
  ): readonly CatalogRecordForFamily<Family>[];
  getRecord<Family extends CatalogRuntimeFamilyName>(
    family: Family,
    id: string,
  ): CatalogRecordForFamily<Family> | null;
  getContentText<Codec extends CatalogContentCodecName>(
    reference: CatalogContentReference<Codec>,
  ): string;
  getContentJson<Codec extends CatalogContentCodecName>(
    reference: CatalogContentReference<Codec>,
  ): CatalogPayloadForCodec<Codec>;
  prefetch(options?: { verifyEveryContentObject?: boolean }): void;
}

type SourceRecord = CatalogRecordForFamily<"source">;
type PolicyProfileRecord = CatalogRecordForFamily<"policy_profile">;
type EvidenceRecord = CatalogRecordForFamily<"evidence">;
type ExecutableExampleEvidence = Extract<
  EvidenceRecord,
  { evidence_kind: "executable_example" }
>;
type TokenPolicyAssertionEvidence = Extract<
  EvidenceRecord,
  {
    evidence_kind: "source_assertion";
    assertion_kind: "token_policy";
  }
>;
type AccessibilityAssertionEvidence = Extract<
  EvidenceRecord,
  {
    evidence_kind: "source_assertion";
    assertion_kind: "accessibility_implementation_signal";
  }
>;
type LinkEvidence = Extract<
  EvidenceRecord,
  {
    evidence_kind: "external_demo" | "design_reference" | "documentation_link";
  }
>;

function referenceKey(reference: CatalogReference): string {
  return `${reference.family}\0${reference.id}`;
}

function sameReference(
  left: CatalogReference,
  right: CatalogReference,
): boolean {
  return left.family === right.family && left.id === right.id;
}

function uniqueStrings(values: readonly string[]): string[] {
  return [...new Set(values)];
}

function compareExamples(left: ExampleRecord, right: ExampleRecord): number {
  return (
    compareOrdinalStrings(left.id, right.id) ||
    compareOrdinalStrings(left.target_type, right.target_type) ||
    compareOrdinalStrings(left.target_name, right.target_name)
  );
}

interface ProjectedExampleEntry {
  evidence: ExecutableExampleEvidence;
  example: ExampleRecord;
}

function sortProjectedExamples(
  entries: ProjectedExampleEntry[],
  dimension: "owner" | "registry",
): ExampleRecord[] {
  const sorted = [...entries].sort(
    (left, right) =>
      (dimension === "owner"
        ? left.evidence.owner_ordinal - right.evidence.owner_ordinal
        : left.evidence.registry_ordinal - right.evidence.registry_ordinal) ||
      compareExamples(left.example, right.example),
  );
  sorted.forEach((entry, expectedOrdinal) => {
    const ordinal =
      dimension === "owner"
        ? entry.evidence.owner_ordinal
        : entry.evidence.registry_ordinal;
    if (ordinal !== expectedOrdinal) {
      throw new Error(
        `Projected example ${dimension} ordinals must be unique and contiguous from zero; expected ${expectedOrdinal}, received ${ordinal} for '${entry.example.id}'.`,
      );
    }
  });
  return sorted.map((entry) => entry.example);
}

function sortSourceOrdinalRecords<
  RecordWithOrdinal extends { id: string; source_ordinal: number },
>(records: RecordWithOrdinal[], description: string): RecordWithOrdinal[] {
  const sorted = [...records].sort(
    (left, right) =>
      left.source_ordinal - right.source_ordinal ||
      compareOrdinalStrings(left.id, right.id),
  );
  sorted.forEach((record, expectedOrdinal) => {
    if (record.source_ordinal !== expectedOrdinal) {
      throw new Error(
        `${description} ordinals must be unique and contiguous from zero; expected ${expectedOrdinal}, received ${record.source_ordinal} for '${record.id}'.`,
      );
    }
  });
  return sorted;
}

/**
 * Transitional typed projection used by the remaining Phase 1 consumers.
 *
 * Canonical persistence is exclusively Salt catalog schema v2. This adapter
 * derives the old in-process collection view on demand and is intentionally
 * not a persisted compatibility format.
 */
export class CatalogRegistryProjection {
  readonly store: CatalogProjectionStore;
  private readonly derived = new Map<keyof SaltRegistry, unknown>();
  private declarationsByToken:
    | ReadonlyMap<
        string,
        readonly CatalogRecordForFamily<"token_declaration">[]
      >
    | undefined;

  constructor(store: CatalogProjectionStore) {
    this.store = store;
  }

  private requireSource(
    reference: CatalogReferenceFor<"source">,
  ): SourceRecord {
    const source = this.store.getRecord("source", reference.id);
    if (!source) {
      throw new Error(`Missing source '${reference.id}'.`);
    }
    return source;
  }

  private repositoryLocator(reference: CatalogReferenceFor<"source">): string {
    const source = this.requireSource(reference);
    if (
      source.source_kind !== "repository_file" &&
      source.source_kind !== "repository_directory"
    ) {
      throw new Error(
        `Source '${source.id}' must be a repository path, received '${source.source_kind}'.`,
      );
    }
    return source.locator;
  }

  private sourceUrl(reference: CatalogReferenceFor<"source">): string | null {
    const source = this.requireSource(reference);
    switch (source.source_kind) {
      case "site_route":
      case "external_https":
        return source.locator;
      case "repository_file":
      case "repository_directory":
        return null;
      case "package_source":
      case "catalog_record_provenance":
        throw new Error(
          `Source '${source.id}' cannot be projected as a public URL.`,
        );
    }
  }

  private publicSourceLocator(
    reference: CatalogReferenceFor<"source">,
  ): string {
    const source = this.requireSource(reference);
    if (
      source.source_kind !== "site_route" &&
      source.source_kind !== "external_https"
    ) {
      throw new Error(
        `Source '${source.id}' must be a public documentation locator, received '${source.source_kind}'.`,
      );
    }
    return source.locator;
  }

  private registrySourceLocator(
    reference: CatalogReferenceFor<"source">,
  ): RegistrySourceLocator {
    const source = this.requireSource(reference);
    switch (source.source_kind) {
      case "repository_file":
      case "repository_directory":
        return { source_url: null, source_path: source.locator };
      case "site_route":
      case "external_https":
        return { source_url: source.locator, source_path: null };
      case "package_source":
      case "catalog_record_provenance":
        throw new Error(
          `Source '${source.id}' cannot be projected as an authored locator.`,
        );
    }
  }

  private packageFact(reference: CatalogReferenceFor<"package">) {
    const packageRecord = this.store.getRecord("package", reference.id);
    if (!packageRecord) {
      throw new Error(`Missing package '${reference.id}'.`);
    }
    return packageRecord;
  }

  private packageName(
    reference: CatalogReferenceFor<"package"> | null,
  ): string | null {
    return reference ? this.packageFact(reference).name : null;
  }

  private apiSymbolIdentity(
    reference: CatalogReferenceFor<"api_symbol">,
  ): ApiSymbolIdentity {
    const symbol = this.store.getRecord("api_symbol", reference.id);
    if (!symbol) {
      throw new Error(`Missing API symbol '${reference.id}'.`);
    }
    return {
      package: this.packageFact(symbol.package_ref).name,
      entrypoint: symbol.entrypoint,
      export_name: symbol.export_name,
      symbol_space: symbol.symbol_space,
      member_path: symbol.member_path,
    };
  }

  private componentName(
    reference: CatalogReferenceFor<"component"> | null,
  ): string | null {
    if (!reference) return null;
    const component = this.store.getRecord("component", reference.id);
    if (!component) {
      throw new Error(`Missing component '${reference.id}'.`);
    }
    return component.name;
  }

  private namedTarget(reference: CatalogReference): string {
    switch (reference.family) {
      case "component":
      case "pattern":
      case "concept":
      case "package": {
        const record = this.store.getRecord(reference.family, reference.id);
        if (!record) {
          throw new Error(
            `Missing ${reference.family} relation target '${reference.id}'.`,
          );
        }
        return record.name;
      }
      default:
        throw new Error(
          `Relation target '${reference.family}:${reference.id}' has no compatible name projection.`,
        );
    }
  }

  private requirePolicyProfile(
    reference: CatalogReferenceFor<"policy_profile">,
  ): PolicyProfileRecord {
    const profile = this.store.getRecord("policy_profile", reference.id);
    if (!profile) {
      throw new Error(`Missing policy profile '${reference.id}'.`);
    }
    return profile;
  }

  private ownerName(reference: CatalogReference): {
    target_type: ExampleRecord["target_type"];
    target_name: string;
  } {
    switch (reference.family) {
      case "component": {
        const record = this.store.getRecord("component", reference.id);
        if (record) {
          return { target_type: "component", target_name: record.name };
        }
        break;
      }
      case "pattern": {
        const record = this.store.getRecord("pattern", reference.id);
        if (record) {
          return { target_type: "pattern", target_name: record.name };
        }
        break;
      }
      case "page": {
        const record = this.store.getRecord("page", reference.id);
        if (record) {
          return { target_type: "foundation", target_name: record.title };
        }
        break;
      }
    }
    throw new Error(
      `Example evidence has unsupported or missing owner ${referenceKey(reference)}.`,
    );
  }

  private evidenceForOwner(owner: CatalogReference): EvidenceRecord[] {
    return this.store
      .getFamily("evidence")
      .filter(
        (record) =>
          "owner" in record &&
          record.owner !== null &&
          sameReference(record.owner, owner),
      );
  }

  private claimsForOwner(
    owner: CatalogReference,
  ): CatalogRecordForFamily<"accessibility_claim">[] {
    return this.store
      .getFamily("accessibility_claim")
      .filter((claim) => sameReference(claim.owner, owner))
      .sort(
        (left, right) =>
          compareOrdinalStrings(left.source_field, right.source_field) ||
          left.ordinal - right.ordinal ||
          compareOrdinalStrings(left.id, right.id),
      );
  }

  private tokenPolicyAssertion(
    id: string,
  ): TokenPolicyAssertionEvidence | null {
    const evidence = this.store.getRecord("evidence", id);
    return evidence?.evidence_kind === "source_assertion" &&
      evidence.assertion_kind === "token_policy"
      ? evidence
      : null;
  }

  private accessibilityAssertion(
    id: string,
  ): AccessibilityAssertionEvidence | null {
    const evidence = this.store.getRecord("evidence", id);
    return evidence?.evidence_kind === "source_assertion" &&
      evidence.assertion_kind === "accessibility_implementation_signal"
      ? evidence
      : null;
  }

  private accessibility(owner: CatalogReference): {
    summary: string[];
    rules: AccessibilityRule[];
    implementation_signals: AccessibilityImplementationSignal[];
  } {
    const summary: string[] = [];
    const rules: AccessibilityRule[] = [];
    const implementationSignals: AccessibilityImplementationSignal[] = [];

    for (const claim of this.claimsForOwner(owner)) {
      const statement = this.store.getContentText(claim.statement_content_ref);
      if (claim.classification === "rule") {
        rules.push({
          id: claim.id,
          severity: claim.severity,
          rule: statement,
        });
        continue;
      }
      if (claim.classification === "guidance") {
        summary.push(statement);
        continue;
      }
      if (claim.source_field !== "accessibility.implementation_signals") {
        continue;
      }
      const evidenceProvenance = claim.provenance.filter(
        (provenance) => provenance.reference.family === "evidence",
      );
      if (claim.provenance.length !== 1 || evidenceProvenance.length !== 1) {
        throw new Error(
          `Accessibility implementation claim '${claim.id}' must bind exactly one evidence assertion.`,
        );
      }
      const evidence = this.accessibilityAssertion(
        evidenceProvenance[0].reference.id,
      );
      if (
        !evidence ||
        !sameReference(evidence.owner, owner) ||
        evidence.source_refs.length !== 1
      ) {
        throw new Error(
          `Accessibility implementation claim '${claim.id}' has an invalid assertion binding.`,
        );
      }
      const payload = this.store.getContentJson(evidence.detail_content_ref);
      if (
        statement !== formatAccessibilityImplementationSignalStatement(payload)
      ) {
        throw new Error(
          `Accessibility implementation claim '${claim.id}' statement does not match its assertion payload.`,
        );
      }
      implementationSignals.push({
        ...payload,
        ...this.registrySourceLocator(evidence.source_refs[0]),
      });
    }

    return {
      summary,
      rules,
      implementation_signals: implementationSignals,
    };
  }

  private exampleFromEvidence(
    evidence: EvidenceRecord,
  ): ProjectedExampleEntry | null {
    if (evidence.evidence_kind !== "executable_example") return null;
    const owner = this.ownerName(evidence.owner);
    return {
      evidence,
      example: {
        id: evidence.local_id,
        title: evidence.title,
        description: evidence.description,
        intent: [...evidence.intent],
        complexity: evidence.complexity,
        code: this.store.getContentText(evidence.code_content_ref),
        ...this.registrySourceLocator(evidence.source_ref),
        package: this.packageName(evidence.package_ref),
        ...owner,
      },
    };
  }

  private examplesForOwner(owner: CatalogReference): ExampleRecord[] {
    const entries = this.evidenceForOwner(owner)
      .map((evidence) => this.exampleFromEvidence(evidence))
      .filter((entry): entry is ProjectedExampleEntry => entry !== null);
    return sortProjectedExamples(entries, "owner");
  }

  private relatedPatternNames(source: CatalogReference): string[] {
    const relations: Array<
      Extract<
        CatalogRecordForFamily<"relation">,
        { relation_kind: "related_to" }
      >
    > = [];
    for (const relation of this.store.getFamily("relation")) {
      if (
        relation.relation_kind === "related_to" &&
        sameReference(relation.source, source)
      ) {
        relations.push(relation);
      }
    }
    return sortSourceOrdinalRecords(
      relations,
      `Related-pattern relations for ${source.family}:${source.id}`,
    ).map((relation) => {
      const target = this.store.getRecord("pattern", relation.target.id);
      if (!target) {
        throw new Error(
          `Related-pattern relation '${relation.id}' has no target.`,
        );
      }
      return target.name;
    });
  }

  private composedEntities(
    source: CatalogReferenceFor<"pattern">,
  ): PatternRecord["composed_of"] {
    const relations = this.store
      .getFamily("relation")
      .filter(
        (
          relation,
        ): relation is Extract<
          CatalogRecordForFamily<"relation">,
          { relation_kind: "composes" }
        > =>
          relation.relation_kind === "composes" &&
          sameReference(relation.source, source),
      );
    return sortSourceOrdinalRecords(
      relations,
      `Composition relations for ${source.family}:${source.id}`,
    ).map((relation) => ({
      component: this.namedTarget(relation.target),
      role: relation.role,
    }));
  }

  private documentedEntityNames(
    source: CatalogReferenceFor<"guide">,
    targetFamilies: readonly ("component" | "pattern" | "package")[],
  ): string[] {
    const relations = this.store
      .getFamily("relation")
      .filter(
        (
          relation,
        ): relation is Extract<
          CatalogRecordForFamily<"relation">,
          { relation_kind: "documents" }
        > =>
          relation.relation_kind === "documents" &&
          sameReference(relation.source, source) &&
          targetFamilies.includes(relation.target.family),
      );
    return sortSourceOrdinalRecords(
      relations,
      `Document relations for ${source.family}:${source.id}`,
    ).map((relation) => this.namedTarget(relation.target));
  }

  private observedComponentExports(
    owner: CatalogReferenceFor<"component">,
  ): NonNullable<ComponentRecord["canonical_example_exports"]> {
    const projected: NonNullable<ComponentRecord["canonical_example_exports"]> =
      [];
    for (const relation of this.store.getFamily("relation")) {
      if (
        relation.relation_kind !== "export_observed_in_example" ||
        !sameReference(relation.source, owner)
      ) {
        continue;
      }
      const evidenceRef = relation.source_evidence_refs[0];
      const evidence = evidenceRef
        ? this.store.getRecord("evidence", evidenceRef.id)
        : null;
      if (evidence?.evidence_kind !== "executable_example") {
        throw new Error(
          `Observed component export relation '${relation.id}' has no executable evidence.`,
        );
      }
      projected.push({
        export_name: relation.role.slice("export:".length),
        example_id: evidence.local_id,
        ...this.registrySourceLocator(evidence.source_ref),
        export_repo_path: this.repositoryLocator(relation.target),
      });
    }
    return projected.sort((left, right) =>
      compareOrdinalStrings(left.export_name, right.export_name),
    );
  }

  private componentExportOrigins(
    owner: CatalogReferenceFor<"component">,
  ): ReadonlyMap<string, string> {
    const origins = new Map<string, string>();
    for (const relation of this.store.getFamily("relation")) {
      if (
        relation.relation_kind !== "exported_from" ||
        relation.source.family !== "component" ||
        !sameReference(relation.source, owner)
      ) {
        continue;
      }
      origins.set(
        relation.role.slice("export:".length),
        (() => {
          const locator = this.repositoryLocator(relation.target);
          const exportName = relation.role.slice("export:".length);
          const previous = origins.get(exportName);
          if (previous && previous !== locator) {
            throw new Error(
              `Component '${owner.id}' export '${exportName}' has conflicting source origins.`,
            );
          }
          return locator;
        })(),
      );
    }
    return origins;
  }

  get packages(): PackageRecord[] {
    return this.cached("packages", () =>
      this.store.getFamily("package").map((fact) => {
        const detail = this.store.getContentJson(fact.detail_content_ref);
        const sourceRoot = this.repositoryLocator(fact.source_root_ref);
        const changelogPath = fact.changelog_source_ref
          ? this.repositoryLocator(fact.changelog_source_ref)
          : null;
        const docsRoot = fact.docs_source_ref
          ? this.publicSourceLocator(fact.docs_source_ref)
          : null;
        if (
          detail.source_root !== sourceRoot ||
          detail.changelog_path !== changelogPath ||
          detail.docs_root !== docsRoot
        ) {
          throw new Error(
            `Package '${fact.id}' detail paths do not match its source references.`,
          );
        }
        return {
          id: fact.id,
          name: fact.name,
          status: fact.status,
          version: fact.version,
          summary: fact.summary,
          source_root: sourceRoot,
          changelog_path: changelogPath,
          docs_root: docsRoot,
        };
      }),
    );
  }

  get components(): ComponentRecord[] {
    return this.cached("components", () =>
      this.store.getFamily("component").map((fact) => {
        const owner: CatalogReferenceFor<"component"> = {
          family: "component",
          id: fact.id,
        };
        const detail = this.store.getContentJson(fact.detail_content_ref);
        const packageRecord = this.packageFact(fact.package_ref);
        const exportOrigins = this.componentExportOrigins(owner);
        const policy = fact.policy_profile_ref
          ? this.requirePolicyProfile(fact.policy_profile_ref)
          : null;
        if (policy && policy.policy_kind !== "component_usage") {
          throw new Error(
            `Component '${fact.id}' references '${policy.policy_kind}' policy.`,
          );
        }
        const usage = policy
          ? this.store.getContentJson(policy.body_content_ref)
          : null;
        const subComponents = detail.sub_components?.map((subComponent) => {
          const repoPath = exportOrigins.get(subComponent.export_name);
          if (!repoPath) {
            throw new Error(
              `Component '${fact.id}' subcomponent export '${subComponent.export_name}' has no source origin.`,
            );
          }
          return {
            ...subComponent,
            repo_path: repoPath,
          };
        });
        const implementationRequirements = detail.implementation_requirements
          ? {
              required_imports:
                detail.implementation_requirements.required_imports.map(
                  (requiredImport) => ({
                    kind: requiredImport.kind,
                    specifier: requiredImport.specifier,
                    statement: requiredImport.statement,
                    source_url: this.publicSourceLocator(
                      requiredImport.source_ref,
                    ),
                  }),
                ),
            }
          : undefined;
        const canonicalExampleExports = this.observedComponentExports(owner);
        return {
          id: fact.id,
          name: fact.name,
          aliases: [...fact.aliases],
          package: {
            name: packageRecord.name,
            status: packageRecord.status,
            since: detail.package_since,
          },
          summary: fact.summary,
          status: fact.status,
          category: [...fact.categories],
          tags: [...fact.tags],
          when_to_use: usage?.when_to_use ?? [],
          when_not_to_use: usage?.when_not_to_use ?? [],
          ...(policy ? { usage_content_ref: policy.body_content_ref.id } : {}),
          alternatives: usage?.alternatives ?? [],
          props: detail.props,
          ...(detail.prop_subjects
            ? { prop_subjects: detail.prop_subjects }
            : {}),
          ...(subComponents ? { sub_components: subComponents } : {}),
          ...(canonicalExampleExports.length > 0
            ? {
                canonical_example_exports: canonicalExampleExports,
              }
            : {}),
          ...(detail.composition ? { composition: detail.composition } : {}),
          accessibility: this.accessibility(owner),
          patterns: this.relatedPatternNames(owner),
          examples: this.examplesForOwner(owner),
          ...(implementationRequirements
            ? {
                implementation_requirements: implementationRequirements,
              }
            : {}),
          related_docs: detail.related_docs,
          ...(usage?.semantics ? { semantics: usage.semantics } : {}),
          ...(usage?.retrieval_signals
            ? { retrieval_signals: usage.retrieval_signals }
            : {}),
          source: {
            repo_path: fact.source_ref
              ? this.repositoryLocator(fact.source_ref)
              : null,
            export_name: fact.export_name,
          },
          ...(detail.inference ? { inference: detail.inference } : {}),
          deprecations: detail.deprecations,
          last_verified_at: null,
        };
      }),
    );
  }

  get icons(): IconRecord[] {
    return this.cached("icons", () =>
      this.store.getFamily("icon").map((fact) => {
        const detail = this.store.getContentJson(fact.detail_content_ref);
        const packageRecord = this.packageFact(fact.package_ref);
        return {
          id: fact.id,
          name: fact.name,
          base_name: fact.base_name,
          figma_name: fact.figma_name,
          package: {
            name: packageRecord.name,
            status: packageRecord.status,
            since: detail.package_since,
          },
          summary: fact.summary,
          status: fact.status,
          category: fact.category,
          synonyms: [...fact.synonyms],
          aliases: [...fact.aliases],
          variant: fact.variant,
          related_docs: detail.related_docs,
          source: {
            repo_path: this.repositoryLocator(fact.source_ref),
            export_name: fact.export_name,
          },
          deprecations: detail.deprecations,
          last_verified_at: null,
        };
      }),
    );
  }

  get country_symbols(): CountrySymbolRecord[] {
    return this.cached("country_symbols", () =>
      this.store.getFamily("country_symbol").map((fact) => {
        const detail = this.store.getContentJson(fact.detail_content_ref);
        const packageRecord = this.packageFact(fact.package_ref);
        return {
          id: fact.id,
          code: fact.code,
          name: fact.name,
          package: {
            name: packageRecord.name,
            status: packageRecord.status,
            since: detail.package_since,
          },
          summary: fact.summary,
          status: fact.status,
          aliases: [...fact.aliases],
          variants: {
            circle: {
              export_name: fact.variants.circle.export_name,
              repo_path: this.repositoryLocator(
                fact.variants.circle.source_ref,
              ),
            },
            sharp: {
              export_name: fact.variants.sharp.export_name,
              repo_path: this.repositoryLocator(fact.variants.sharp.source_ref),
            },
          },
          related_docs: detail.related_docs,
          deprecations: detail.deprecations,
          last_verified_at: null,
        };
      }),
    );
  }

  get patterns(): PatternRecord[] {
    return this.cached("patterns", () =>
      this.store.getFamily("pattern").map((fact) => {
        const owner: CatalogReferenceFor<"pattern"> = {
          family: "pattern",
          id: fact.id,
        };
        const detail = this.store.getContentJson(fact.detail_content_ref);
        const profile = this.requirePolicyProfile(fact.policy_profile_ref);
        if (profile.policy_kind !== "pattern_usage") {
          throw new Error(
            `Pattern '${fact.id}' references '${profile.policy_kind}' policy.`,
          );
        }
        const usage = this.store.getContentJson(profile.body_content_ref);
        const resources = this.evidenceForOwner(owner)
          .filter(
            (record): record is LinkEvidence =>
              (record.evidence_kind === "external_demo" ||
                record.evidence_kind === "design_reference" ||
                record.evidence_kind === "documentation_link") &&
              record.link_role === "resource",
          )
          .sort((left, right) => {
            if (left.owner_ordinal === null || right.owner_ordinal === null) {
              throw new Error(
                `Pattern '${fact.id}' resource evidence is missing an ordinal.`,
              );
            }
            return (
              left.owner_ordinal - right.owner_ordinal ||
              compareOrdinalStrings(left.id, right.id)
            );
          })
          .map((record) => ({
            label: record.label,
            href: record.href,
            internal: record.internal,
          }));
        return {
          id: fact.id,
          name: fact.name,
          aliases: [...fact.aliases],
          summary: fact.summary,
          status: fact.status,
          category: [...fact.categories],
          when_to_use: usage.when_to_use,
          when_not_to_use: usage.when_not_to_use,
          composed_of: this.composedEntities(owner),
          related_patterns: this.relatedPatternNames(owner),
          how_to_build: detail.how_to_build,
          how_it_works: detail.how_it_works,
          accessibility: (() => {
            const projected = this.accessibility(owner);
            return {
              summary: projected.summary,
              implementation_signals: projected.implementation_signals,
            };
          })(),
          resources,
          examples: this.examplesForOwner(owner),
          related_docs: detail.related_docs,
          ...(usage.semantics ? { semantics: usage.semantics } : {}),
          ...(detail.retrieval_signals
            ? { retrieval_signals: detail.retrieval_signals }
            : {}),
          last_verified_at: null,
        };
      }),
    );
  }

  get guides(): GuideRecord[] {
    return this.cached("guides", () =>
      this.store.getFamily("guide").map((fact) => {
        const detail = this.store.getContentJson(fact.detail_content_ref);
        const owner: CatalogReferenceFor<"guide"> = {
          family: "guide",
          id: fact.id,
        };
        const packages = fact.package_refs.map(
          (reference) => this.packageFact(reference).name,
        );
        const documentedPackages = this.documentedEntityNames(owner, [
          "package",
        ]);
        const documentedEntities = this.documentedEntityNames(owner, [
          "component",
          "pattern",
        ]);
        const entityFacts = fact.documented_entity_refs.map((reference) =>
          this.namedTarget(reference),
        );
        if (canonicalJson(documentedPackages) !== canonicalJson(packages)) {
          throw new Error(
            `Guide '${fact.id}' package facts do not match its document relations.`,
          );
        }
        if (canonicalJson(documentedEntities) !== canonicalJson(entityFacts)) {
          throw new Error(
            `Guide '${fact.id}' component and pattern facts do not match its document relations.`,
          );
        }
        return {
          id: fact.id,
          name: fact.name,
          aliases: [...fact.aliases],
          kind: fact.kind,
          summary: fact.summary,
          packages,
          steps: detail.steps.map((step) => ({
            title: step.title,
            statements: step.statements,
            snippets: step.snippets.map((snippet) => ({
              title: snippet.title,
              language: snippet.language,
              code: this.store.getContentText(snippet.code_ref),
            })),
          })),
          related_docs: {
            overview: detail.related_docs.overview,
            related_components: documentedEntities,
            related_packages: documentedPackages,
          },
          last_verified_at: null,
        };
      }),
    );
  }

  get pages(): PageRecord[] {
    return this.cached("pages", () =>
      this.store.getFamily("page").map((fact) => {
        const detail = this.store.getContentJson(fact.detail_content_ref);
        const sourcePath = this.repositoryLocator(fact.source_ref);
        if (detail.source_path !== sourcePath) {
          throw new Error(
            `Page '${fact.id}' detail path does not match its source reference.`,
          );
        }
        return {
          id: fact.id,
          title: fact.title,
          route: fact.route,
          page_kind: fact.page_kind,
          summary: fact.summary,
          keywords: [...fact.keywords],
          content: this.store.getContentJson(fact.body_content_ref),
          section_headings: [...fact.section_headings],
          source_path: sourcePath,
          last_verified_at: null,
        };
      }),
    );
  }

  private sourceBackedEvidenceSource(
    references: readonly CatalogReferenceFor<"source">[],
    metadata: CatalogPayloadForCodec<"token_policy_assertion">["source_metadata"],
  ): SaltTokenPolicyEvidenceSource {
    let repoPath: string | null = null;
    let url: string | null = null;
    for (const reference of references) {
      const source = this.requireSource(reference);
      switch (source.source_kind) {
        case "repository_file":
        case "repository_directory":
          if (repoPath && repoPath !== source.locator) {
            throw new Error(
              "One token assertion cannot flatten multiple repository sources.",
            );
          }
          repoPath = source.locator;
          break;
        case "site_route":
        case "external_https":
          if (url && url !== source.locator) {
            throw new Error(
              "One token assertion cannot flatten multiple URL sources.",
            );
          }
          url = source.locator;
          break;
        case "package_source":
        case "catalog_record_provenance":
          throw new Error(
            `Token assertions cannot flatten '${source.source_kind}' source '${source.id}'.`,
          );
      }
    }
    const supplemental = {
      ...(metadata.section === undefined ? {} : { section: metadata.section }),
      ...(metadata.line_range
        ? {
            line_start: metadata.line_range[0],
            line_end: metadata.line_range[1],
          }
        : {}),
    };
    if (repoPath) {
      return {
        repo_path: repoPath,
        ...(url ? { url } : {}),
        ...supplemental,
      };
    }
    if (url) {
      return {
        url,
        ...supplemental,
      };
    }
    throw new Error("Token assertion has no source-backed locator.");
  }

  private projectTokenEvidence(
    evidence: TokenPolicyAssertionEvidence,
  ): SaltTokenPolicyEvidenceRef {
    const payload = this.store.getContentJson(evidence.detail_content_ref);
    return {
      contract: payload.contract,
      id: evidence.id,
      source_kind: payload.source_kind,
      claim_kind: payload.claim_kind,
      source: this.sourceBackedEvidenceSource(
        evidence.source_refs,
        payload.source_metadata,
      ),
      ...(payload.note === undefined ? {} : { note: payload.note }),
    };
  }

  private evidenceRefs(
    reference: CatalogReferenceFor<"policy_profile"> | null,
  ): SaltTokenPolicyEvidenceRef[] {
    if (!reference) return [];
    const profile = this.requirePolicyProfile(reference);
    if (profile.policy_kind !== "token_evidence") {
      throw new Error(
        `Evidence profile '${profile.id}' has policy kind '${profile.policy_kind}'.`,
      );
    }
    const payload = this.store.getContentJson(profile.body_content_ref);
    return payload.evidence_refs.map((evidenceRef) => {
      const evidence = this.tokenPolicyAssertion(evidenceRef.id);
      if (!evidence) {
        throw new Error(
          `Token evidence profile '${profile.id}' references non-token assertion '${evidenceRef.id}'.`,
        );
      }
      return this.projectTokenEvidence(evidence);
    });
  }

  private getDeclarationsByToken(): ReadonlyMap<
    string,
    readonly CatalogRecordForFamily<"token_declaration">[]
  > {
    if (this.declarationsByToken) return this.declarationsByToken;
    const mutable = new Map<
      string,
      CatalogRecordForFamily<"token_declaration">[]
    >();
    for (const declaration of this.store.getFamily("token_declaration")) {
      const current = mutable.get(declaration.token_ref.id);
      if (current) current.push(declaration);
      else mutable.set(declaration.token_ref.id, [declaration]);
    }
    this.declarationsByToken = mutable;
    return mutable;
  }

  private tokenDeclarations(
    token: CatalogRecordForFamily<"token">,
  ): TokenDeclarationProjection[] {
    const tokenNames = new Map(
      this.store
        .getFamily("token")
        .map((record) => [record.id, record.name] as const),
    );
    const declarations = [
      ...(this.getDeclarationsByToken().get(token.id) ?? []),
    ].map((declaration) => {
      const context = this.store.getRecord(
        "declaration_context",
        declaration.context_ref.id,
      );
      const source = this.requireSource(declaration.source_ref);
      if (!context) {
        throw new Error(
          `Token declaration '${declaration.id}' has no declaration context.`,
        );
      }
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
        replacement: declaration.replacement_token_ref
          ? (tokenNames.get(declaration.replacement_token_ref.id) ?? null)
          : null,
      } satisfies TokenDeclarationProjection;
    });
    return declarations.sort(
      (left, right) =>
        compareOrdinalStrings(left.source_path, right.source_path) ||
        left.source_range.start_offset - right.source_range.start_offset ||
        compareOrdinalStrings(left.id, right.id),
    );
  }

  private projectToken(fact: CatalogRecordForFamily<"token">): TokenRecord {
    const declarations = this.tokenDeclarations(fact);
    const deprecatedFromDeclarations =
      declarations.length > 0 &&
      declarations.every((declaration) => declaration.deprecated);
    if ((fact.status === "deprecated") !== deprecatedFromDeclarations) {
      throw new Error(
        `Token '${fact.id}' lifecycle does not match its declaration aggregation.`,
      );
    }
    const profile = fact.policy_profile_ref
      ? this.requirePolicyProfile(fact.policy_profile_ref)
      : null;
    if (
      profile &&
      profile.policy_kind !== "token_usage" &&
      profile.policy_kind !== "token_gap"
    ) {
      throw new Error(
        `Token '${fact.id}' references '${profile.policy_kind}' policy.`,
      );
    }
    const usage =
      profile?.policy_kind === "token_usage"
        ? this.store.getContentJson(profile.body_content_ref)
        : null;
    const gap =
      profile?.policy_kind === "token_gap"
        ? this.store.getContentJson(profile.body_content_ref)
        : null;
    const evidenceRefs = this.evidenceRefs(fact.evidence_profile_ref);
    const policy = usage?.policy
      ? {
          usage_tier: usage.policy.usage_tier,
          direct_component_use: usage.policy.direct_component_use,
          preferred_for: usage.policy.preferred_for,
          avoid_for: usage.policy.avoid_for,
          notes: usage.policy.notes,
          docs: usage.policy.docs_refs.map((sourceRef) =>
            this.publicSourceLocator(sourceRef),
          ),
          ...(usage.policy.structural_roles
            ? { structural_roles: usage.policy.structural_roles }
            : {}),
          ...(usage.policy.pairing !== undefined
            ? { pairing: usage.policy.pairing }
            : {}),
          evidence_refs: evidenceRefs,
        }
      : null;
    return {
      name: fact.name,
      category: fact.category,
      type: fact.type,
      // Catalog schema v2 has no authoritative default-declaration marker.
      // Declaration equality or source order cannot manufacture one.
      value: null,
      default_declaration_id: null,
      declarations,
      semantic_intent: fact.semantic_intent,
      themes: uniqueStrings(
        declarations.flatMap((declaration) =>
          declaration.dimensions
            .filter((dimension) => dimension.name === "theme")
            .map((dimension) => dimension.value),
        ),
      ).sort(compareOrdinalStrings),
      densities: uniqueStrings(
        declarations.flatMap((declaration) =>
          declaration.dimensions
            .filter((dimension) => dimension.name === "density")
            .map((dimension) => dimension.value),
        ),
      ).sort(compareOrdinalStrings),
      applies_to: fact.applies_to.map(
        (reference) => this.componentName(reference) ?? reference.id,
      ),
      guidance: usage?.guidance ?? gap?.guidance ?? [],
      aliases: [...fact.aliases],
      replacement_tokens: fact.replacement_token_refs.map(
        (reference) => reference.id,
      ),
      policy,
      policy_gap: gap
        ? {
            ...gap.gap,
            evidence_refs: evidenceRefs,
          }
        : null,
      deprecated: fact.status === "deprecated",
      last_verified_at: null,
    };
  }

  getTokenByName(name: string): TokenRecord | null {
    const fact =
      this.store.getRecord("token", name) ??
      this.store
        .getFamily("token")
        .find((candidate) => candidate.name === name) ??
      null;
    return fact ? this.projectToken(fact) : null;
  }

  get tokens(): TokenRecord[] {
    return this.cached("tokens", () =>
      this.store.getFamily("token").map((fact) => this.projectToken(fact)),
    );
  }

  get deprecations(): DeprecationRecord[] {
    return this.cached("deprecations", () =>
      this.store.getFamily("deprecation").map((fact) => {
        const detail = this.store.getContentJson(fact.detail_content_ref);
        const subject = this.apiSymbolIdentity(fact.subject_ref);
        const targets = detail.replacement.target_refs.map((target) =>
          this.apiSymbolIdentity(target),
        );
        const target = detail.replacement.target_ref
          ? this.apiSymbolIdentity(detail.replacement.target_ref)
          : null;
        const targetDisplayName = target
          ? (target.member_path.at(-1)?.name ?? target.export_name)
          : null;
        const directTargetDisplayName =
          detail.replacement.mode === "single" &&
          detail.migration.strategy === "replace"
            ? targetDisplayName
            : null;
        const sourcePaths: string[] = [];
        const sourceUrls: string[] = [];
        for (const sourceRef of fact.source_refs) {
          const source = this.requireSource(sourceRef);
          switch (source.source_kind) {
            case "repository_file":
            case "repository_directory":
              sourcePaths.push(source.locator);
              break;
            case "site_route":
            case "external_https":
              sourceUrls.push(source.locator);
              break;
            case "package_source":
            case "catalog_record_provenance":
              throw new Error(
                `Deprecation '${fact.id}' has non-locator provenance '${source.source_kind}'.`,
              );
          }
        }
        const sourceOccurrences = fact.source_occurrences.map((occurrence) => ({
          source_path: this.repositoryLocator(occurrence.source_ref),
          source_range: occurrence.source_range,
        }));
        return {
          id: fact.id,
          subject,
          package: this.packageFact(fact.package_ref).name,
          component: this.componentName(fact.component_ref),
          kind: fact.kind,
          name: fact.name,
          deprecated_in: fact.deprecated_in,
          removed_in: fact.removed_in,
          replacement: {
            mode: detail.replacement.mode,
            target,
            targets,
            type: directTargetDisplayName ? "symbol" : null,
            name: directTargetDisplayName,
            notes: detail.replacement.notes,
          },
          migration: {
            strategy: detail.migration.strategy,
            value_map: detail.migration.value_map
              ? {
                  fallback: detail.migration.value_map.fallback,
                  cases: detail.migration.value_map.cases.map((entry) => ({
                    from: entry.from,
                    set: entry.set.map((assignment) => ({
                      target: this.apiSymbolIdentity(assignment.target_ref),
                      value: assignment.value,
                    })),
                  })),
                }
              : null,
            details: directTargetDisplayName
              ? [{ from: fact.name, to: directTargetDisplayName }]
              : [],
          },
          source_paths: uniqueStrings([
            ...sourcePaths,
            ...sourceOccurrences.map((occurrence) => occurrence.source_path),
          ]).sort(compareOrdinalStrings),
          source_occurrences: sourceOccurrences,
          source_urls: sourceUrls,
          ...(detail.inference ? { inference: detail.inference } : {}),
        };
      }),
    );
  }

  get examples(): ExampleRecord[] {
    return this.cached("examples", () =>
      sortProjectedExamples(
        this.store
          .getFamily("evidence")
          .map((evidence) => this.exampleFromEvidence(evidence))
          .filter((entry): entry is ProjectedExampleEntry => entry !== null),
        "registry",
      ),
    );
  }

  get token_policy_structural_role_rule_pack(): SaltTokenPolicyStructuralRoleRulePack | null {
    return (
      this.cached("token_policy_structural_role_rule_pack", () => {
        const profiles = this.store
          .getFamily("policy_profile")
          .filter(
            (candidate) => candidate.policy_kind === "structural_role_rules",
          );
        if (profiles.length > 1) {
          throw new Error(
            "Catalog contains more than one structural-role policy profile.",
          );
        }
        const profile = profiles[0];
        if (!profile || profile.policy_kind !== "structural_role_rules") {
          return null;
        }
        const payload = this.store.getContentJson(profile.body_content_ref);
        return {
          contract: payload.contract,
          id: payload.id,
          generated_at: null,
          generator: payload.generator,
          registry: {
            version: this.store.manifest.catalog_version,
            hash: this.store.manifest.semantic_digest,
            generated_at: null,
          },
          rules: payload.rules.map((rule) => {
            const evidenceRefs: SaltTokenPolicyEvidenceRef[] =
              rule.evidence_refs.map((reference) => {
                const evidence = this.tokenPolicyAssertion(reference.id);
                if (!evidence) {
                  throw new Error(
                    `Structural role rule '${rule.id}' references non-token assertion '${reference.id}'.`,
                  );
                }
                return this.projectTokenEvidence(evidence);
              });
            const sourceUrls = rule.source_refs
              .map((sourceRef) => this.sourceUrl(sourceRef))
              .filter((sourceUrl): sourceUrl is string => sourceUrl !== null);
            return {
              id: rule.id,
              category: rule.category,
              kind: rule.kind,
              match: rule.match,
              emits: rule.emits,
              evidence_text: rule.evidence_text,
              evidence_terms: rule.evidence_terms,
              evidence_refs: evidenceRefs,
              canonical_source: sourceUrls[0] ?? null,
              source_urls: sourceUrls,
            };
          }),
        };
      }) ?? null
    );
  }

  private cached<Key extends keyof SaltRegistry>(
    key: Key,
    load: () => SaltRegistry[Key],
  ): SaltRegistry[Key] {
    if (!this.derived.has(key)) {
      this.derived.set(key, deepFreezeCatalogValue(load()));
    }
    return this.derived.get(key) as SaltRegistry[Key];
  }

  asRegistry(
    options: {
      prefetch?: boolean;
      materialize?: boolean;
      beforeDataAccess?: () => void;
    } = {},
  ): SaltRegistry {
    const data =
      <Value>(load: () => Value): (() => Value) =>
      () => {
        options.beforeDataAccess?.();
        return load();
      };
    const loaders = {
      generated_at: () => null,
      version: () => this.store.manifest.catalog_version,
      semantic_hash: data(() => this.store.manifest.semantic_digest),
      build_info: () => null,
      packages: data(() => this.packages),
      components: data(() => this.components),
      icons: data(() => this.icons),
      country_symbols: data(() => this.country_symbols),
      pages: data(() => this.pages),
      patterns: data(() => this.patterns),
      guides: data(() => this.guides),
      tokens: data(() => this.tokens),
      deprecations: data(() => this.deprecations),
      examples: data(() => this.examples),
      token_policy_structural_role_rule_pack: data(
        () => this.token_policy_structural_role_rule_pack,
      ),
    } as const satisfies Record<keyof SaltRegistry, () => unknown>;
    type LoaderName = keyof typeof loaders;
    const names = Object.keys(loaders) as LoaderName[];
    const values = new Map<LoaderName, unknown>();
    const target: Record<string, unknown> = {};
    const isLoaderName = (property: PropertyKey): property is LoaderName =>
      typeof property === "string" && Object.hasOwn(loaders, property);
    const get = (name: LoaderName): unknown => {
      if (!values.has(name)) {
        values.set(name, deepFreezeCatalogValue(loaders[name]()));
      }
      return values.get(name);
    };
    if (options.prefetch) {
      this.store.prefetch();
      for (const name of names) void get(name);
    }
    if (options.materialize) {
      return Object.freeze(
        Object.fromEntries(names.map((name) => [name, get(name)])),
      ) as unknown as SaltRegistry;
    }

    const registry = new Proxy(target, {
      get(_target, property, receiver) {
        return isLoaderName(property)
          ? get(property)
          : Reflect.get(target, property, receiver);
      },
      has(_target, property) {
        return isLoaderName(property) || Reflect.has(target, property);
      },
      ownKeys() {
        return [...names];
      },
      getOwnPropertyDescriptor(_target, property) {
        return isLoaderName(property)
          ? {
              enumerable: true,
              configurable: true,
              writable: false,
              value: undefined,
            }
          : undefined;
      },
      set() {
        throw new TypeError("Salt catalog registry projections are read-only.");
      },
      defineProperty() {
        throw new TypeError("Salt catalog registry projections are read-only.");
      },
      deleteProperty() {
        throw new TypeError("Salt catalog registry projections are read-only.");
      },
      setPrototypeOf() {
        throw new TypeError("Salt catalog registry projections are read-only.");
      },
    }) as unknown as SaltRegistry;
    return registry;
  }
}

export function projectCatalogRegistry(
  store: CatalogProjectionStore,
  options: { prefetch?: boolean } = {},
): SaltRegistry {
  return new CatalogRegistryProjection(store).asRegistry(options);
}
