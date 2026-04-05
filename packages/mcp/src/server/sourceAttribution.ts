const DEFAULT_SALT_SITE_BASE_URL = "https://www.saltdesignsystem.com";

const DIRECT_SOURCE_KEYS = new Set([
  "source_url",
  "docs_root",
  "source_root",
  "changelog_path",
  "repo_path",
]);
const SOURCE_COLLECTION_KEYS = new Set(["source_urls", "sourceUrls", "docs"]);
const RELATED_DOCS_KEYS = new Set(["related_docs"]);
const LINK_KEYS = new Set(["href"]);
const DESIGN_TOKENS_SOURCE_URL = "/salt/themes/design-tokens/index";

export type ToolSourceKind = "site" | "external" | "repo";

export interface ToolSource {
  original: string;
  resolved: string;
  kind: ToolSourceKind;
}

export interface SourceAttributionOptions {
  siteBaseUrl?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

function isSiteRoute(value: string): boolean {
  return /^(?:\/)?(?:salt|salt-github)(?:\/|$)/i.test(value.trim());
}

function getSiteBaseUrl(siteBaseUrl?: string): string {
  if (!siteBaseUrl?.trim()) {
    return DEFAULT_SALT_SITE_BASE_URL;
  }

  try {
    return new URL(siteBaseUrl).toString();
  } catch {
    return DEFAULT_SALT_SITE_BASE_URL;
  }
}

function isSameOrigin(url: string, siteBaseUrl?: string): boolean {
  try {
    return new URL(url).origin === new URL(getSiteBaseUrl(siteBaseUrl)).origin;
  } catch {
    return false;
  }
}

export function normalizeToolSource(
  value: string,
  options: SourceAttributionOptions = {},
): ToolSource | null {
  const original = value.trim();

  if (!original) {
    return null;
  }

  if (isSiteRoute(original)) {
    const route = original.startsWith("/") ? original : `/${original}`;
    return {
      original,
      resolved: new URL(route, getSiteBaseUrl(options.siteBaseUrl)).toString(),
      kind: "site",
    };
  }

  if (isHttpUrl(original)) {
    return {
      original,
      resolved: original,
      kind: isSameOrigin(original, options.siteBaseUrl) ? "site" : "external",
    };
  }

  return {
    original,
    resolved: original,
    kind: "repo",
  };
}

function collectSourceLikeValues(
  value: unknown,
  addSource: (source: string) => void,
): void {
  if (typeof value === "string") {
    addSource(value);
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      collectSourceLikeValues(item, addSource);
    }
    return;
  }

  if (!isRecord(value)) {
    return;
  }

  for (const nestedValue of Object.values(value)) {
    collectSourceLikeValues(nestedValue, addSource);
  }
}

function hasTokenQueryShape(
  payload: unknown,
): payload is Record<string, unknown> {
  return (
    isRecord(payload) &&
    Array.isArray(payload.tokens) &&
    typeof payload.total_matches === "number" &&
    typeof payload.truncated === "boolean"
  );
}

function hasWorkflowProvenanceShape(payload: unknown): payload is {
  workflow: {
    provenance: {
      source_urls: string[];
    };
  };
} {
  return (
    isRecord(payload) &&
    isRecord(payload.workflow) &&
    isRecord(payload.workflow.provenance) &&
    Array.isArray(payload.workflow.provenance.source_urls)
  );
}

export function collectToolSources(
  payload: unknown,
  options: SourceAttributionOptions = {},
): ToolSource[] {
  const deduped = new Map<string, ToolSource>();
  const visited = new WeakSet<object>();

  const addSource = (source: string): void => {
    const normalized = normalizeToolSource(source, options);
    if (!normalized) {
      return;
    }

    const key =
      normalized.kind === "repo"
        ? `${normalized.kind}:${normalized.original}`
        : normalized.resolved;

    if (!deduped.has(key)) {
      deduped.set(key, normalized);
    }
  };

  const visit = (value: unknown): void => {
    if (Array.isArray(value)) {
      for (const item of value) {
        visit(item);
      }
      return;
    }

    if (!isRecord(value)) {
      return;
    }

    if (visited.has(value)) {
      return;
    }
    visited.add(value);

    for (const [key, entryValue] of Object.entries(value)) {
      if (DIRECT_SOURCE_KEYS.has(key)) {
        if (typeof entryValue === "string") {
          addSource(entryValue);
        }
        continue;
      }

      if (SOURCE_COLLECTION_KEYS.has(key)) {
        collectSourceLikeValues(entryValue, addSource);
        continue;
      }

      if (key === "route") {
        if (typeof entryValue === "string" && isSiteRoute(entryValue)) {
          addSource(entryValue);
        }
        continue;
      }

      if (LINK_KEYS.has(key)) {
        if (
          typeof entryValue === "string" &&
          (isHttpUrl(entryValue) || isSiteRoute(entryValue))
        ) {
          addSource(entryValue);
        }
        continue;
      }

      if (RELATED_DOCS_KEYS.has(key)) {
        collectSourceLikeValues(entryValue, addSource);
        continue;
      }

      visit(entryValue);
    }
  };

  if (hasWorkflowProvenanceShape(payload)) {
    for (const source of payload.workflow.provenance.source_urls) {
      addSource(source);
    }

    return [...deduped.values()];
  }

  visit(payload);

  if (hasTokenQueryShape(payload)) {
    addSource(DESIGN_TOKENS_SOURCE_URL);
  }

  return [...deduped.values()];
}

export function buildStructuredToolContent(
  payload: unknown,
  options: SourceAttributionOptions = {},
): Record<string, unknown> {
  const baseContent = isRecord(payload) ? { ...payload } : { result: payload };

  return {
    ...baseContent,
    sources: collectToolSources(payload, options),
  };
}
