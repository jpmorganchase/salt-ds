import type { SaltRegistry } from "../types.js";
import type {
  ReviewCatalog,
  ReviewComponent,
  ReviewDeprecation,
} from "./reviewCatalogAdapter.js";

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

/** Source-test compatibility only; this module is not part of Knowledge-v1. */
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
