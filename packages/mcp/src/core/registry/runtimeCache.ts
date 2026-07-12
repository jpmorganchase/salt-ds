import type {
  ComponentRecord,
  DeprecationRecord,
  ExampleRecord,
  GuideRecord,
  PackageRecord,
  PageRecord,
  SaltRegistry,
} from "../types.js";

export interface RegistryIndexes {
  packagesByNormalizedName: Map<string, PackageRecord>;
  componentsByNormalizedName: Map<string, ComponentRecord[]>;
  componentsByNormalizedAlias: Map<string, ComponentRecord[]>;
  componentById: Map<string, ComponentRecord>;
  deprecationById: Map<string, DeprecationRecord>;
  exampleById: Map<string, ExampleRecord>;
  guideById: Map<string, GuideRecord>;
  pageById: Map<string, PageRecord>;
}

const REGISTRY_INDEX_CACHE = new WeakMap<SaltRegistry, RegistryIndexes>();
const CANONICAL_PACKAGE_EXPORTS_CACHE = new WeakMap<
  SaltRegistry,
  Map<string, CanonicalPackageExportEvidence>
>();

export interface CanonicalComponentExportOwner {
  component: ComponentRecord;
  source_urls: string[];
  example: {
    id: string;
    source_url: string;
  };
}

export interface CanonicalPackageExportSource {
  entity_type: "component" | "pattern";
  entity_id: string;
  entity_name: string;
  example_id: string;
  source_url: string;
  verified_at: string;
}

export interface CanonicalPackageExportEvidence {
  package_name: string;
  export_name: string;
  sources: CanonicalPackageExportSource[];
}

function canonicalPackageExportKey(
  packageName: string,
  exportName: string,
): string {
  return `${normalizeRegistryLookupKey(packageName)}\u0000${normalizeRegistryLookupKey(exportName)}`;
}

function readNamedValueImports(
  code: string,
): Array<{ packageName: string; exportName: string }> {
  const imports: Array<{ packageName: string; exportName: string }> = [];
  const importPattern =
    /\bimport\s+(type\s+)?\{([\s\S]*?)\}\s+from\s+["']([^"']+)["']/g;
  const boundedCode = code.slice(0, 200_000);
  let match = importPattern.exec(boundedCode);

  while (match) {
    if (!match[1]) {
      const packageName = match[3].trim();
      for (const rawSpecifier of match[2].split(",")) {
        const specifier = rawSpecifier.trim();
        if (!specifier || /^type\s+/u.test(specifier)) {
          continue;
        }
        const exportName = specifier.split(/\s+as\s+/iu)[0].trim();
        if (exportName) {
          imports.push({ packageName, exportName });
        }
      }
    }
    match = importPattern.exec(boundedCode);
  }

  return imports;
}

function getCanonicalPackageExports(
  registry: SaltRegistry,
): Map<string, CanonicalPackageExportEvidence> {
  const cached = CANONICAL_PACKAGE_EXPORTS_CACHE.get(registry);
  if (cached) {
    return cached;
  }

  const exports = new Map<string, CanonicalPackageExportEvidence>();
  const records = [
    ...registry.components.map((record) => ({
      entity_type: "component" as const,
      record,
    })),
    ...registry.patterns.map((record) => ({
      entity_type: "pattern" as const,
      record,
    })),
  ];

  for (const { entity_type: entityType, record } of records) {
    for (const example of record.examples) {
      if (!example.source_url) {
        continue;
      }
      for (const imported of readNamedValueImports(example.code)) {
        if (!imported.packageName.startsWith("@salt-ds/")) {
          continue;
        }

        const key = canonicalPackageExportKey(
          imported.packageName,
          imported.exportName,
        );
        const source: CanonicalPackageExportSource = {
          entity_type: entityType,
          entity_id: record.id,
          entity_name: record.name,
          example_id: example.id,
          source_url: example.source_url,
          verified_at: record.last_verified_at,
        };
        const current = exports.get(key);
        if (current) {
          if (
            !current.sources.some(
              (candidate) =>
                candidate.entity_id === source.entity_id &&
                candidate.example_id === source.example_id,
            )
          ) {
            current.sources.push(source);
          }
        } else {
          exports.set(key, {
            package_name: imported.packageName,
            export_name: imported.exportName,
            sources: [source],
          });
        }
      }
    }
  }

  for (const evidence of exports.values()) {
    evidence.sources.sort((left, right) =>
      `${left.entity_id}:${left.example_id}`.localeCompare(
        `${right.entity_id}:${right.example_id}`,
      ),
    );
  }
  CANONICAL_PACKAGE_EXPORTS_CACHE.set(registry, exports);
  return exports;
}

export function findCanonicalPackageExportEvidence(
  registry: SaltRegistry,
  packageName: string,
  exportName: string,
): CanonicalPackageExportEvidence | null {
  return (
    getCanonicalPackageExports(registry).get(
      canonicalPackageExportKey(packageName, exportName),
    ) ?? null
  );
}

function componentCanonicalSourceUrls(component: ComponentRecord): string[] {
  return [
    component.related_docs.overview,
    component.related_docs.usage,
    component.related_docs.examples,
    component.related_docs.accessibility,
  ].filter((value): value is string => Boolean(value));
}

export function findCanonicalComponentExportOwner(
  registry: SaltRegistry,
  packageName: string,
  exportName: string,
): CanonicalComponentExportOwner | null {
  const normalizedPackageName = normalizeRegistryLookupKey(packageName);
  const normalizedExportName = normalizeRegistryLookupKey(exportName);
  let owner: CanonicalComponentExportOwner | null = null;

  for (const component of registry.components) {
    if (
      normalizeRegistryLookupKey(component.package.name) !==
      normalizedPackageName
    ) {
      continue;
    }

    const canonicalExport = component.canonical_example_exports?.find(
      (candidate) =>
        normalizeRegistryLookupKey(candidate.export_name) ===
        normalizedExportName,
    );
    if (!canonicalExport) {
      continue;
    }

    // A generated registry omits ambiguous owners. Preserve that honesty for
    // hand-authored or legacy registries that accidentally contain a tie.
    if (owner && owner.component.id !== component.id) {
      return null;
    }

    owner = {
      component,
      source_urls: [
        ...new Set([
          ...componentCanonicalSourceUrls(component),
          canonicalExport.source_url,
        ]),
      ],
      example: {
        id: canonicalExport.example_id,
        source_url: canonicalExport.source_url,
      },
    };
  }

  return owner;
}

export function normalizeRegistryLookupKey(value: string): string {
  return value.trim().toLowerCase();
}

function appendIndexedValue<T>(map: Map<string, T[]>, key: string, value: T) {
  const current = map.get(key);
  if (current) {
    if (!current.includes(value)) {
      current.push(value);
    }
    return;
  }

  map.set(key, [value]);
}

const COMPONENT_EXPORT_ALIASES_BY_ID: Record<string, string[]> = {
  "component.text": [
    "Code",
    "Display1",
    "Display2",
    "Display3",
    "H1",
    "H2",
    "H3",
    "H4",
    "Label",
    "TextAction",
    "TextNotation",
  ],
};

export function getComponentExportAliases(
  component: Pick<ComponentRecord, "id">,
): string[] {
  return COMPONENT_EXPORT_ALIASES_BY_ID[component.id] ?? [];
}

function buildRegistryIndexes(registry: SaltRegistry): RegistryIndexes {
  const packagesByNormalizedName = new Map(
    registry.packages.map((pkg) => [normalizeRegistryLookupKey(pkg.name), pkg]),
  );
  const componentsByNormalizedName = new Map<string, ComponentRecord[]>();
  const componentsByNormalizedAlias = new Map<string, ComponentRecord[]>();

  for (const component of registry.components) {
    appendIndexedValue(
      componentsByNormalizedName,
      normalizeRegistryLookupKey(component.name),
      component,
    );
    if (component.source.export_name) {
      appendIndexedValue(
        componentsByNormalizedAlias,
        normalizeRegistryLookupKey(component.source.export_name),
        component,
      );
    }
    for (const alias of component.aliases) {
      appendIndexedValue(
        componentsByNormalizedAlias,
        normalizeRegistryLookupKey(alias),
        component,
      );
    }
    for (const alias of getComponentExportAliases(component)) {
      appendIndexedValue(
        componentsByNormalizedAlias,
        normalizeRegistryLookupKey(alias),
        component,
      );
    }
    // Index sub-component export names as aliases so that lookups for
    // e.g. "DialogHeader" or "AccordionPanel" resolve to the parent.
    if (component.sub_components) {
      for (const sub of component.sub_components) {
        appendIndexedValue(
          componentsByNormalizedAlias,
          normalizeRegistryLookupKey(sub.export_name),
          component,
        );
      }
    }
  }

  return {
    packagesByNormalizedName,
    componentsByNormalizedName,
    componentsByNormalizedAlias,
    componentById: new Map(
      registry.components.map((component) => [component.id, component]),
    ),
    deprecationById: new Map(
      registry.deprecations.map((deprecation) => [deprecation.id, deprecation]),
    ),
    exampleById: new Map(
      registry.examples.map((example) => [example.id, example]),
    ),
    guideById: new Map(registry.guides.map((guide) => [guide.id, guide])),
    pageById: new Map(registry.pages.map((page) => [page.id, page])),
  };
}

export function getRegistryIndexes(registry: SaltRegistry): RegistryIndexes {
  const cachedIndexes = REGISTRY_INDEX_CACHE.get(registry);
  if (cachedIndexes) {
    return cachedIndexes;
  }

  const indexes = buildRegistryIndexes(registry);
  REGISTRY_INDEX_CACHE.set(registry, indexes);
  return indexes;
}
