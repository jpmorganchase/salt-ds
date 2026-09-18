import type {
  CatalogRecordForFamily,
  CatalogReferenceFor,
} from "../catalog/catalogSchemaV2.js";
import { compareOrdinalStrings } from "../catalog/catalogSerialization.js";
import type { CatalogStoreV2 } from "../catalog/catalogStoreV2.js";
import type { ApiSymbolIdentity, SaltRegistry } from "../types.js";

export interface ReviewComponent {
  readonly id: string;
  readonly status: "stable" | "beta" | "lab" | "deprecated";
  readonly package: { readonly name: string };
  readonly source: { readonly export_name: string | null };
  readonly sub_components?: readonly { readonly export_name: string }[];
  readonly canonical_example_exports?: readonly {
    readonly export_name: string;
  }[];
  readonly props: readonly { readonly name: string }[];
  readonly prop_subjects?: readonly ApiSymbolIdentity[];
  readonly when_not_to_use: readonly string[];
  readonly usage_content_ref?: string;
}

export interface ReviewDeprecation {
  readonly id: string;
  readonly subject: ApiSymbolIdentity;
  readonly package: string;
  readonly name: string;
  readonly deprecated_in: string | null;
  readonly removed_in: string | null;
  readonly replacement: {
    readonly mode: "none" | "single" | "composite";
    readonly target: ApiSymbolIdentity | null;
  };
  readonly migration: {
    readonly strategy:
      | "replace"
      | "remove"
      | "transform"
      | "manual"
      | "unspecified";
  };
}

export interface ReviewToken {
  readonly name: string;
  readonly category: string;
  readonly deprecated: boolean;
  readonly declarations: readonly {
    readonly id: string;
    readonly deprecated: boolean;
  }[];
}

export interface ReviewCatalog {
  readonly version: string;
  readonly semanticDigest: string | null;
  readonly components: readonly ReviewComponent[];
  readonly deprecations: readonly ReviewDeprecation[];
  readonly tokens: readonly ReviewToken[];
}

function mapLegacyComponent(
  component: SaltRegistry["components"][number],
): ReviewComponent {
  return {
    id: component.id,
    status: component.status,
    package: { name: component.package.name },
    source: { export_name: component.source.export_name },
    ...(component.sub_components
      ? {
          sub_components: component.sub_components.map((entry) => ({
            export_name: entry.export_name,
          })),
        }
      : {}),
    ...(component.canonical_example_exports
      ? {
          canonical_example_exports: component.canonical_example_exports.map(
            (entry) => ({ export_name: entry.export_name }),
          ),
        }
      : {}),
    props: component.props.map((prop) => ({ name: prop.name })),
    ...(component.prop_subjects
      ? {
          prop_subjects: component.prop_subjects.map((subject) => ({
            package: subject.package,
            entrypoint: subject.entrypoint,
            export_name: subject.export_name,
            symbol_space: subject.symbol_space,
            member_path: subject.member_path.map((member) => ({ ...member })),
          })),
        }
      : {}),
    when_not_to_use: [...component.when_not_to_use],
    ...(component.usage_content_ref
      ? { usage_content_ref: component.usage_content_ref }
      : {}),
  };
}

function mapLegacyDeprecation(
  deprecation: SaltRegistry["deprecations"][number],
): ReviewDeprecation {
  return {
    id: deprecation.id,
    subject: {
      package: deprecation.subject.package,
      entrypoint: deprecation.subject.entrypoint,
      export_name: deprecation.subject.export_name,
      symbol_space: deprecation.subject.symbol_space,
      member_path: deprecation.subject.member_path.map((member) => ({
        ...member,
      })),
    },
    package: deprecation.package,
    name: deprecation.name,
    deprecated_in: deprecation.deprecated_in,
    removed_in: deprecation.removed_in,
    replacement: {
      mode: deprecation.replacement.mode,
      target: deprecation.replacement.target
        ? {
            package: deprecation.replacement.target.package,
            entrypoint: deprecation.replacement.target.entrypoint,
            export_name: deprecation.replacement.target.export_name,
            symbol_space: deprecation.replacement.target.symbol_space,
            member_path: deprecation.replacement.target.member_path.map(
              (member) => ({ ...member }),
            ),
          }
        : null,
    },
    migration: { strategy: deprecation.migration.strategy },
  };
}

export function createReviewCatalogFromLegacyRegistry(
  registry: SaltRegistry,
): ReviewCatalog {
  return {
    version: registry.version,
    semanticDigest: registry.semantic_hash ?? null,
    components: registry.components.map(mapLegacyComponent),
    deprecations: registry.deprecations.map(mapLegacyDeprecation),
    tokens: registry.tokens.map((token) => ({
      name: token.name,
      category: token.category,
      deprecated: token.deprecated,
      declarations: (token.declarations ?? []).map((declaration) => ({
        id: declaration.id,
        deprecated: declaration.deprecated,
      })),
    })),
  };
}

function requirePackageName(
  packages: ReadonlyMap<string, CatalogRecordForFamily<"package">>,
  reference: CatalogReferenceFor<"package">,
): string {
  const record = packages.get(reference.id);
  if (!record) throw new Error(`Missing review package '${reference.id}'.`);
  return record.name;
}

function requireApiIdentity(
  store: CatalogStoreV2,
  packages: ReadonlyMap<string, CatalogRecordForFamily<"package">>,
  reference: CatalogReferenceFor<"api_symbol">,
): ApiSymbolIdentity {
  const symbol = store.getRecord("api_symbol", reference.id);
  if (!symbol) throw new Error(`Missing review API symbol '${reference.id}'.`);
  return {
    package: requirePackageName(packages, symbol.package_ref),
    entrypoint: symbol.entrypoint,
    export_name: symbol.export_name,
    symbol_space: symbol.symbol_space,
    member_path: symbol.member_path.map((member) => ({ ...member })),
  };
}

export function createReviewCatalogFromStore(
  store: CatalogStoreV2,
): ReviewCatalog {
  store.validateCrossReferences();
  const packages = new Map(
    store.getFamily("package").map((record) => [record.id, record] as const),
  );
  const relationsByComponent = new Map<string, { observedExports: string[] }>();
  for (const relation of store.getFamily("relation")) {
    if (
      relation.source.family !== "component" ||
      relation.relation_kind !== "export_observed_in_example"
    ) {
      continue;
    }
    const entry = relationsByComponent.get(relation.source.id) ?? {
      observedExports: [],
    };
    const exportName = relation.role.slice("export:".length);
    entry.observedExports.push(exportName);
    relationsByComponent.set(relation.source.id, entry);
  }
  for (const entry of relationsByComponent.values()) {
    entry.observedExports.sort(compareOrdinalStrings);
  }

  const components = store.getFamily("component").map((component) => {
    const detail = store.getContentJson(component.detail_content_ref);
    const policy = component.policy_profile_ref
      ? store.getRecord("policy_profile", component.policy_profile_ref.id)
      : null;
    if (policy && policy.policy_kind !== "component_usage") {
      throw new Error(
        `Review component '${component.id}' references '${policy.policy_kind}' policy.`,
      );
    }
    const usage = policy ? store.getContentJson(policy.body_content_ref) : null;
    const relations = relationsByComponent.get(component.id);
    return {
      id: component.id,
      status: component.status,
      package: { name: requirePackageName(packages, component.package_ref) },
      source: { export_name: component.export_name },
      ...(detail.sub_components
        ? {
            sub_components: detail.sub_components.map((subComponent) => ({
              export_name: subComponent.export_name,
            })),
          }
        : {}),
      ...(relations?.observedExports.length
        ? {
            canonical_example_exports: relations.observedExports.map(
              (export_name) => ({ export_name }),
            ),
          }
        : {}),
      props: detail.props.map((prop) => ({ name: prop.name })),
      ...(detail.prop_subjects
        ? {
            prop_subjects: detail.prop_subjects.map((subject) => ({
              package: subject.package,
              entrypoint: subject.entrypoint,
              export_name: subject.export_name,
              symbol_space: subject.symbol_space,
              member_path: subject.member_path.map((member) => ({ ...member })),
            })),
          }
        : {}),
      when_not_to_use: usage?.when_not_to_use ?? [],
      ...(policy ? { usage_content_ref: policy.body_content_ref.id } : {}),
    } satisfies ReviewComponent;
  });

  const deprecations = store.getFamily("deprecation").map((deprecation) => {
    const detail = store.getContentJson(deprecation.detail_content_ref);
    return {
      id: deprecation.id,
      subject: requireApiIdentity(store, packages, deprecation.subject_ref),
      package: requirePackageName(packages, deprecation.package_ref),
      name: deprecation.name,
      deprecated_in: deprecation.deprecated_in,
      removed_in: deprecation.removed_in,
      replacement: {
        mode: detail.replacement.mode,
        target: detail.replacement.target_ref
          ? requireApiIdentity(store, packages, detail.replacement.target_ref)
          : null,
      },
      migration: { strategy: detail.migration.strategy },
    } satisfies ReviewDeprecation;
  });

  const declarationsByToken = new Map<
    string,
    Array<{
      id: string;
      deprecated: boolean;
      sourcePath: string;
      startOffset: number;
    }>
  >();
  for (const declaration of store.getFamily("token_declaration")) {
    const source = store.getRecord("source", declaration.source_ref.id);
    if (
      !source ||
      (source.source_kind !== "repository_file" &&
        source.source_kind !== "repository_directory")
    ) {
      throw new Error(
        `Review token declaration '${declaration.id}' has no repository source.`,
      );
    }
    const declarations =
      declarationsByToken.get(declaration.token_ref.id) ?? [];
    declarations.push({
      id: declaration.id,
      deprecated: declaration.deprecated,
      sourcePath: source.locator,
      startOffset: declaration.source_range[0],
    });
    declarationsByToken.set(declaration.token_ref.id, declarations);
  }
  const tokens = store.getFamily("token").map(
    (token): ReviewToken => ({
      name: token.name,
      category: token.category,
      deprecated: token.status === "deprecated",
      declarations: [...(declarationsByToken.get(token.id) ?? [])]
        .sort(
          (left, right) =>
            compareOrdinalStrings(left.sourcePath, right.sourcePath) ||
            left.startOffset - right.startOffset ||
            compareOrdinalStrings(left.id, right.id),
        )
        .map(({ id, deprecated }) => ({ id, deprecated })),
    }),
  );

  return {
    version: store.manifest.catalog_version,
    semanticDigest: store.manifest.semantic_digest,
    components,
    deprecations,
    tokens,
  };
}
